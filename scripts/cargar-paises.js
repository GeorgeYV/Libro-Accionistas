/*
 * Carga el catálogo de países (tabla Pais) desde scripts/datos/paises.json.
 * Los países que ya existen (mismo nombre, sin importar mayúsculas/tildes/espacios) no se tocan.
 * Todos se crean Activos y SIN marca de paraíso fiscal: esa lista la define el usuario en Parámetros.
 *
 *   node scripts/cargar-paises.js            -> SIMULACIÓN: muestra qué crearía y qué países de los datos no están
 *   node scripts/cargar-paises.js --aplicar  -> crea los países faltantes
 *   node scripts/cargar-paises.js --inactivar-sin-uso [--aplicar] -> deja activos solo los países usados en los datos
 *
 * Usa el entorno de src/aws-exports.js (el que indique amplify/.config/local-env-info.json).
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const APLICAR = process.argv.includes('--aplicar');
const RAIZ = path.join(__dirname, '..');
const env = JSON.parse(fs.readFileSync(path.join(RAIZ, 'amplify/.config/local-env-info.json'), 'utf8')).envName;
const exportsTxt = fs.readFileSync(path.join(RAIZ, 'src/aws-exports.js'), 'utf8');
const leer = (clave) => (new RegExp(`"${clave}":\\s*"([^"]+)"`).exec(exportsTxt) || [])[1];
const ENDPOINT = leer('aws_appsync_graphqlEndpoint');
const API_KEY = leer('aws_appsync_apiKey');
const normal = (t) => String(t || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

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

async function todos(campo, campos) {
  const items = [];
  let token = null;
  do {
    const d = await gql(`query($t: String) { ${campo}(limit: 1000, nextToken: $t) { items { ${campos} } nextToken } }`, { t: token });
    items.push(...d[campo].items);
    token = d[campo].nextToken;
  } while (token);
  return items;
}

(async () => {
  console.log(`Entorno: ${env} · ${APLICAR ? 'APLICAR' : 'SIMULACIÓN'}\n`);
  const lista = JSON.parse(fs.readFileSync(path.join(__dirname, 'datos', 'paises.json'), 'utf8'));
  const existentes = await todos('listPais', 'id nombre');
  const yaEstan = new Set(existentes.map((p) => normal(p.nombre)));
  const nuevos = lista.filter(([nombre]) => !yaEstan.has(normal(nombre)));
  console.log(`Catálogo: ${lista.length} países · ya registrados ${existentes.length} · por crear ${nuevos.length}`);

  // Países usados en los datos que no quedarían en el catálogo (se seguirán mostrando, pero conviene revisarlos).
  const catalogo = new Set([...existentes.map((p) => normal(p.nombre)), ...lista.map(([n]) => normal(n))]);
  const usados = [
    ...(await todos('listAccionistas', 'acc_pais acc_residencia acc_nacionalidad')).flatMap((a) => [a.acc_pais, a.acc_residencia, a.acc_nacionalidad]),
    ...(await todos('listPersonaJuridicas', 'pj_rl_nacionalidad')).map((p) => p.pj_rl_nacionalidad),
    ...(await todos('listConyuges', 'con_nacionalidad')).map((c) => c.con_nacionalidad),
  ].filter((v) => v && String(v).trim());
  const fuera = [...new Set(usados.map((v) => String(v).trim()))].filter((v) => !catalogo.has(normal(v)));
  console.log(fuera.length ? `Valores en los datos que no están en el catálogo: ${fuera.join(', ')}` : 'Todos los países usados en los datos están en el catálogo.');

  // --inactivar-sin-uso: deja activos solo los países que usa algún accionista, cónyuge o representante legal.
  if (process.argv.includes('--inactivar-sin-uso')) {
    const enUso = new Set(usados.map(normal));
    const paises = await todos('listPais', 'id nombre estado');
    const inactivar = paises.filter((p) => p.estado === 'Activo' && !enUso.has(normal(p.nombre)));
    console.log(`\nQuedan activos (en uso): ${paises.filter((p) => enUso.has(normal(p.nombre))).map((p) => p.nombre).join(', ')}`);
    console.log(`Países a inactivar: ${inactivar.length}`);
    if (!APLICAR) { console.log('\nSimulación: no se modificó nada. Ejecute con --aplicar.'); return; }
    for (let i = 0; i < inactivar.length; i += 20) {
      await Promise.all(inactivar.slice(i, i + 20).map((p) => gql(
        'mutation($input: UpdatePaisInput!) { updatePais(input: $input) { id } }', { input: { id: p.id, estado: 'Inactivo' } },
      )));
    }
    const final = await todos('listPais', 'estado');
    console.log(`Inactivados: ${inactivar.length}. Activos: ${final.filter((p) => p.estado === 'Activo').length} de ${final.length}`);
    return;
  }

  if (!APLICAR) { console.log('\nSimulación: no se modificó nada. Ejecute con --aplicar.'); return; }

  for (let i = 0; i < nuevos.length; i += 20) {
    await Promise.all(nuevos.slice(i, i + 20).map(([nombre, nombreCorto, nacionalidad, codigoTelefono]) => gql(
      'mutation($input: CreatePaisInput!) { createPais(input: $input) { id } }',
      { input: { nombre, nombreCorto, nacionalidad, codigoTelefono, estado: 'Activo', paraisoFiscal: false } },
    )));
  }
  console.log(`\nCreados: ${nuevos.length}. Total en el catálogo: ${(await todos('listPais', 'id')).length}`);
})().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
