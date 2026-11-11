/*
 * Normaliza el TIPO de los campos numéricos de Accionista: algunos registros (carga inicial) los guardan como texto
 * en DynamoDB y los filtros de GraphQL (eq/gt sobre números) no los encuentran. Los VALORES no cambian.
 *
 *   node scripts/normalizar-tipos-accionistas.js            -> SIMULACIÓN: cuenta y muestra lo que cambiaría
 *   node scripts/normalizar-tipos-accionistas.js --aplicar  -> respalda y reescribe esos campos como número
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

async function listar(campos, filter) {
  const items = [];
  let token = null;
  do {
    const d = await gql(`query($t: String, $f: ModelAccionistaFilterInput) {
      listAccionistas(limit: 1000, nextToken: $t, filter: $f) { items { ${campos} } nextToken } }`, { t: token, f: filter });
    items.push(...d.listAccionistas.items);
    token = d.listAccionistas.nextToken;
  } while (token);
  return items;
}

(async () => {
  console.log(`Entorno: ${env} · ${APLICAR ? 'APLICAR' : 'SIMULACIÓN'}\n`);
  // Campos Int/Float del filtro de Accionista (según el esquema publicado).
  const tipo = (await gql('{ __type(name: "ModelAccionistaFilterInput") { inputFields { name type { name } } } }')).__type;
  const numericos = tipo.inputFields.filter((f) => ['ModelIntInput', 'ModelFloatInput'].includes(f.type.name)).map((f) => f.name);

  // Por campo: ids de registros que lo guardan como texto.
  const porId = new Map();
  for (const campo of numericos) {
    const ids = (await listar('id', { [campo]: { attributeType: 'string' } })).map((a) => a.id);
    if (ids.length) console.log(`  ${campo.padEnd(26)} ${ids.length} como texto`);
    ids.forEach((id) => { if (!porId.has(id)) porId.set(id, new Set()); porId.get(id).add(campo); });
  }
  if (!porId.size) { console.log('Todos los campos numéricos ya están guardados como número.'); return; }

  // GraphQL devuelve los valores ya convertidos a número: se reescriben tal cual.
  const actuales = new Map((await listar(['id', ...numericos].join(' '))).map((a) => [a.id, a]));
  const cambios = [...porId.entries()].map(([id, campos]) => {
    const input = { id };
    campos.forEach((c) => {
      const v = actuales.get(id)[c];
      if (v != null && typeof v !== 'number') throw new Error(`Valor no numérico en ${id}.${c}; no se modifica nada.`);
      input[c] = v;
    });
    return input;
  });
  console.log(`\nAccionistas a normalizar: ${cambios.length}`);

  if (!APLICAR) { console.log('Simulación: no se modificó nada. Ejecute con --aplicar.'); return; }

  const dir = path.join(__dirname, 'respaldos');
  fs.mkdirSync(dir, { recursive: true });
  const respaldo = path.join(dir, `accionistas-tipos-${env}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(respaldo, JSON.stringify(cambios, null, 2));
  console.log(`Respaldo: ${path.relative(RAIZ, respaldo)}`);

  for (let i = 0; i < cambios.length; i += 20) {
    await Promise.all(cambios.slice(i, i + 20).map((input) => gql(
      'mutation($input: UpdateAccionistaInput!) { updateAccionista(input: $input) { id } }', { input },
    )));
  }
  console.log(`Actualizados: ${cambios.length}`);

  // Verificación: ya no debe quedar ningún campo como texto y los valores deben ser idénticos.
  let quedan = 0;
  for (const campo of numericos) quedan += (await listar('id', { [campo]: { attributeType: 'string' } })).length;
  const despues = new Map((await listar(['id', ...numericos].join(' '))).map((a) => [a.id, a]));
  const distintos = cambios.filter((c) => Object.keys(c).some((k) => despues.get(c.id)[k] !== c[k])).length;
  console.log(`Verificación: campos como texto ${quedan}, valores distintos ${distintos}`);
})().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
