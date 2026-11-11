/*
 * Limpia los datos de prueba de STAGING: asambleas, operaciones y dividendos (registros + documentos en S3).
 * No toca accionistas, personas, cónyuges, herederos, títulos, parámetros ni sus históricos.
 *
 *   node scripts/limpiar-pruebas.js            -> SIMULACIÓN: solo lee y muestra lo que borraría
 *   node scripts/limpiar-pruebas.js --aplicar  -> respalda (registros + archivos) y borra
 *
 * Solo corre si el entorno local de Amplify es "staging". S3 usa el perfil AWS dev-libroaccionista.
 * Un archivo de S3 solo se borra si NINGÚN registro conservado lo referencia.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFileSync } = require('child_process');

const APLICAR = process.argv.includes('--aplicar');
const RAIZ = path.join(__dirname, '..');
const PERFIL = 'dev-libroaccionista';

// Orden de borrado: dependientes primero.
const A_BORRAR = [
  'DividendosTitulos', 'DetalleDividendo', 'DividendoNuevo',
  'AccionistasxJunta', 'TituloxJunta', 'Asamblea',
  'TituloPorOperacion', 'AccionistaOperacion', 'Operacion',
];
const CONSERVAR = [
  'Accionista', 'PersonaNatural', 'PersonaJuridica', 'Conyuge', 'Heredero', 'Titulo', 'Parametro',
  'AccionistaArchive', 'ParametroArchive', 'Pais', 'Provincia', 'Ciudad',
];

// ---- Configuración y verificación de entorno ---------------------------------------------------
const env = JSON.parse(fs.readFileSync(path.join(RAIZ, 'amplify/.config/local-env-info.json'), 'utf8')).envName;
const exportsTxt = fs.readFileSync(path.join(RAIZ, 'src/aws-exports.js'), 'utf8');
const leer = (clave) => (new RegExp(`"${clave}":\\s*"([^"]+)"`).exec(exportsTxt) || [])[1];
const ENDPOINT = leer('aws_appsync_graphqlEndpoint');
const API_KEY = leer('aws_appsync_apiKey');
const BUCKET = leer('aws_user_files_s3_bucket');
const REGION = leer('aws_user_files_s3_bucket_region');
if (env !== 'staging' || !BUCKET || !BUCKET.endsWith('-staging')) {
  console.error(`Abortado: el entorno local es "${env}" (bucket ${BUCKET}). Este script solo limpia staging.`);
  process.exit(1);
}

function gql(query, variables) {
  const body = JSON.stringify({ query, variables });
  return new Promise((resolve, reject) => {
    const req = https.request(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY, 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let datos = '';
      res.on('data', (x) => { datos += x; });
      res.on('end', () => {
        const j = JSON.parse(datos);
        if (j.errors) reject(new Error(JSON.stringify(j.errors).slice(0, 400))); else resolve(j.data);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const aws = (...args) => execFileSync('aws', [...args, '--profile', PERFIL, '--region', REGION], { encoding: 'utf8', maxBuffer: 1 << 28 });

async function enLotes(items, tam, fn) {
  for (let i = 0; i < items.length; i += tam) await Promise.all(items.slice(i, i + tam).map(fn));
}

// ---- Esquema: campo list* y campos escalares de cada tipo --------------------------------------
async function esquema() {
  const d = await gql(`{
    __schema { queryType { fields { name type { name } } } types { name kind fields { name type { kind name ofType { kind name } } } } }
  }`);
  const lista = {};
  d.__schema.queryType.fields.forEach((f) => {
    const m = /^Model(.+)Connection$/.exec((f.type && f.type.name) || '');
    if (m && f.name.startsWith('list')) lista[m[1]] = f.name;
  });
  const escalares = {};
  d.__schema.types.filter((t) => t.kind === 'OBJECT' && t.fields).forEach((t) => {
    escalares[t.name] = t.fields.filter((f) => {
      const k = f.type.kind === 'NON_NULL' ? f.type.ofType.kind : f.type.kind;
      return k === 'SCALAR' && !['__typename'].includes(f.name);
    }).map((f) => f.name);
  });
  return { lista, escalares };
}

async function todos(campoLista, campos) {
  const items = [];
  let token = null;
  do {
    const d = await gql(`query($t: String) { ${campoLista}(limit: 1000, nextToken: $t) { items { ${campos.join(' ')} } nextToken } }`, { t: token });
    items.push(...d[campoLista].items);
    token = d[campoLista].nextToken;
  } while (token);
  return items;
}

// Valores de texto de un registro que podrían ser claves de S3 (ope_documento junta varias con "&").
const textos = (registro) => Object.values(registro)
  .filter((v) => typeof v === 'string' && v)
  .flatMap((v) => v.split('&'))
  .map((v) => v.trim())
  .filter(Boolean);

(async () => {
  console.log(`Entorno: ${env} · bucket ${BUCKET} · ${APLICAR ? 'APLICAR' : 'SIMULACIÓN'}\n`);
  const { lista, escalares } = await esquema();
  for (const t of [...A_BORRAR, ...CONSERVAR]) if (!lista[t]) throw new Error(`No se encontró la consulta list de ${t}`);

  const borrar = {};
  for (const t of A_BORRAR) borrar[t] = await todos(lista[t], escalares[t]);
  const conservados = [];
  for (const t of CONSERVAR) conservados.push(...await todos(lista[t], escalares[t]));

  // Archivos: los que existen en public/, referenciados por registros a borrar y por ninguno conservado.
  const objetos = JSON.parse(aws('s3api', 'list-objects-v2', '--bucket', BUCKET, '--prefix', 'public/', '--output', 'json') || '{}').Contents || [];
  const tamPorClave = new Map(objetos.map((o) => [o.Key.slice('public/'.length), o.Size]));
  const usadosConservados = new Set(conservados.flatMap(textos));
  const candidatos = new Set(Object.values(borrar).flat().flatMap(textos).filter((v) => tamPorClave.has(v)));
  const archivos = [...candidatos].filter((k) => !usadosConservados.has(k));
  const compartidos = [...candidatos].filter((k) => usadosConservados.has(k));

  console.log('Registros a borrar:');
  A_BORRAR.forEach((t) => console.log(`  ${t.padEnd(22)} ${borrar[t].length}`));
  const bytes = archivos.reduce((s, k) => s + tamPorClave.get(k), 0);
  console.log(`\nArchivos S3 a borrar: ${archivos.length} (${(bytes / 1048576).toFixed(1)} MB)`);
  if (compartidos.length) console.log(`Archivos que se conservan porque los usa un registro conservado: ${compartidos.length}`);
  console.log(`Registros conservados revisados: ${conservados.length}`);

  if (!APLICAR) {
    console.log('\nSimulación: no se modificó nada. Ejecute con --aplicar para respaldar y borrar.');
    return;
  }

  // 1. Respaldo completo antes de borrar.
  const dir = path.join(__dirname, 'respaldos', `limpieza-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  fs.mkdirSync(path.join(dir, 'archivos'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'registros.json'), JSON.stringify(borrar, null, 2));
  for (const k of archivos) aws('s3', 'cp', `s3://${BUCKET}/public/${k}`, path.join(dir, 'archivos', k), '--only-show-errors');
  const descargados = fs.readdirSync(path.join(dir, 'archivos')).length;
  if (descargados !== archivos.length) throw new Error(`Respaldo incompleto: ${descargados} de ${archivos.length} archivos. No se borró nada.`);
  console.log(`\nRespaldo: ${path.relative(RAIZ, dir)} (registros.json + ${descargados} archivos)`);

  // 2. Registros (dependientes primero).
  for (const t of A_BORRAR) {
    let hechos = 0;
    await enLotes(borrar[t], 20, async (r) => {
      await gql(`mutation($input: Delete${t}Input!) { delete${t}(input: $input) { id } }`, { input: { id: r.id } });
      hechos++;
    });
    console.log(`  borrados ${t.padEnd(22)} ${hechos}`);
  }

  // 3. Archivos.
  for (const k of archivos) aws('s3', 'rm', `s3://${BUCKET}/public/${k}`, '--only-show-errors');
  console.log(`  borrados archivos S3       ${archivos.length}`);

  // 4. Verificación.
  console.log('\nVerificación:');
  for (const t of A_BORRAR) console.log(`  ${t.padEnd(22)} quedan ${(await todos(lista[t], ['id'])).length}`);
})().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
