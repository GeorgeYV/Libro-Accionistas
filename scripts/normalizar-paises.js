/*
 * Normaliza los nombres de país guardados en accionistas, personas jurídicas y cónyuges: quita espacios sobrantes y
 * usa el nombre exacto del catálogo (scripts/datos/paises.json) cuando coincide sin mayúsculas/tildes ("Ecuador " -> "Ecuador").
 * Solo cambia esos campos de texto; no toca valores que no correspondan a un país del catálogo.
 *
 *   node scripts/normalizar-paises.js            -> SIMULACIÓN
 *   node scripts/normalizar-paises.js --aplicar  -> respalda y actualiza
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
const catalogo = new Map(JSON.parse(fs.readFileSync(path.join(__dirname, 'datos', 'paises.json'), 'utf8')).map(([n]) => [normal(n), n]));

const TABLAS = [
  { lista: 'listAccionistas', mutacion: 'updateAccionista', input: 'UpdateAccionistaInput', campos: ['acc_pais', 'acc_residencia', 'acc_nacionalidad'] },
  { lista: 'listPersonaJuridicas', mutacion: 'updatePersonaJuridica', input: 'UpdatePersonaJuridicaInput', campos: ['pj_rl_nacionalidad'] },
  { lista: 'listConyuges', mutacion: 'updateConyuge', input: 'UpdateConyugeInput', campos: ['con_nacionalidad'] },
];

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
  const cambios = [];
  for (const t of TABLAS) {
    for (const r of await todos(t.lista, ['id', ...t.campos].join(' '))) {
      const input = { id: r.id };
      const antes = {};
      t.campos.forEach((c) => {
        const canonico = r[c] != null ? catalogo.get(normal(r[c])) : null;
        if (canonico && canonico !== r[c]) { input[c] = canonico; antes[c] = r[c]; }
      });
      if (Object.keys(antes).length) cambios.push({ tabla: t, input, antes });
    }
  }
  const resumen = {};
  cambios.forEach(({ tabla, input, antes }) => Object.keys(antes).forEach((c) => {
    const k = `${tabla.lista}.${c}: "${antes[c]}" -> "${input[c]}"`;
    resumen[k] = (resumen[k] || 0) + 1;
  }));
  Object.entries(resumen).forEach(([k, n]) => console.log(`  ${k}  (${n})`));
  console.log(`\nRegistros a actualizar: ${cambios.length}`);
  if (!cambios.length || !APLICAR) { if (!APLICAR) console.log('Simulación: no se modificó nada. Ejecute con --aplicar.'); return; }

  const dir = path.join(__dirname, 'respaldos');
  fs.mkdirSync(dir, { recursive: true });
  const respaldo = path.join(dir, `paises-${env}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(respaldo, JSON.stringify(cambios.map(({ tabla, input, antes }) => ({ tabla: tabla.lista, id: input.id, antes })), null, 2));
  console.log(`Respaldo: ${path.relative(RAIZ, respaldo)}`);
  for (let i = 0; i < cambios.length; i += 20) {
    await Promise.all(cambios.slice(i, i + 20).map(({ tabla, input }) => gql(
      `mutation($input: ${tabla.input}!) { ${tabla.mutacion}(input: $input) { id } }`, { input },
    )));
  }
  console.log(`Actualizados: ${cambios.length}`);
})().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
