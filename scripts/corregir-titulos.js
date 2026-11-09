/*
 * Corrección puntual de títulos detectados por el validador (Parámetros > Validar rangos).
 *
 *   node scripts/corregir-titulos.js            -> SIMULACIÓN: solo lee y muestra lo que haría
 *   node scripts/corregir-titulos.js --aplicar  -> escribe los cambios
 *
 * Antes de escribir verifica que cada título siga EXACTAMENTE como se espera. Si algo no
 * coincide, aborta sin modificar nada. Guarda un respaldo del estado previo en scripts/respaldos/.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const APLICAR = process.argv.includes('--aplicar');
const RAIZ = 'IDTituloPadreDeTodos';

// ---- Correcciones (origen: validacion-titulos.csv) ----------------------------------------
// Error de la cesión parcial antigua: el hijo se numeraba desde tit_acciones del padre y el
// padre no recortaba su tit_hasta.
const AJUSTES = [
  {
    motivo: 'Padre de cesión parcial (cedió 157 a 1000065720): recortar a 1-1000',
    id: '7c9de1e3-f5c9-453f-8b35-55f2cf2eed21',
    esperado: { tit_accionista_id: '1707150577', tit_desde: 1, tit_hasta: 1157, tit_acciones: 1000 },
    nuevo: { tit_hasta: 1000 },
  },
  {
    motivo: 'Padre de cesión parcial (cedió 1500 a 1707144125): recortar a 1231-1424',
    id: 'ff175e1c-b6cc-4a35-8bba-a8f79d8c15ac',
    esperado: { tit_accionista_id: '1090106976001', tit_desde: 1231, tit_hasta: 2924, tit_acciones: 194 },
    nuevo: { tit_hasta: 1424 },
  },
  {
    motivo: 'Hijo de cesión parcial: mover de 195-1694 a 1425-2924',
    id: 'bb20fb75-d935-4b8f-8563-83dc08be6e60',
    esperado: {
      tit_accionista_id: '1707144125', tit_desde: 195, tit_hasta: 1694, tit_acciones: 1500,
      tit_padre: 'ff175e1c-b6cc-4a35-8bba-a8f79d8c15ac',
    },
    nuevo: { tit_desde: 1425, tit_hasta: 2924 },
  },
];
// Solo se verifica (ya está bien numerado), confirma la hipótesis de la cesión del primer título.
const VERIFICAR = [
  {
    id: 'b0b3b358-06f2-446c-9dbb-25fd93daf017',
    esperado: {
      tit_accionista_id: '1000065720', tit_desde: 1001, tit_hasta: 1157, tit_acciones: 157,
      tit_padre: '7c9de1e3-f5c9-453f-8b35-55f2cf2eed21',
    },
  },
];
// Accionista con acciones y sin título: hueco al final de la numeración.
const TITULO_FALTANTE = {
  accionista: '1701442012',
  acciones: 718,
  desde: 107960691,
  hasta: 107961408,
  totalEmitido: 107961408,
};

// ---- Cliente AppSync (API_KEY de src/aws-exports.js, no se imprime) -----------------------
const config = fs.readFileSync(path.join(__dirname, '..', 'src', 'aws-exports.js'), 'utf8');
const ENDPOINT = /"aws_appsync_graphqlEndpoint":\s*"([^"]+)"/.exec(config)[1];
const API_KEY = /"aws_appsync_apiKey":\s*"([^"]+)"/.exec(config)[1];

function graphql(query, variables) {
  const body = JSON.stringify({ query, variables });
  return new Promise((resolve, reject) => {
    const req = https.request(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY, 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let datos = '';
      res.on('data', (c) => { datos += c; });
      res.on('end', () => {
        const json = JSON.parse(datos);
        if (json.errors) reject(new Error(JSON.stringify(json.errors)));
        else resolve(json.data);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function listarTodos(campo, query, filter) {
  const items = [];
  let nextToken = null;
  do {
    const data = await graphql(query, { filter, limit: 1000, nextToken });
    items.push(...data[campo].items);
    nextToken = data[campo].nextToken;
  } while (nextToken);
  return items;
}

const CAMPOS_TITULO = 'id tit_acciones tit_estado tit_desde tit_hasta tit_padre tit_nivel tit_accionista_id';
const Q = {
  getTitulo: `query ($id: ID!) { getTitulo(id: $id) { ${CAMPOS_TITULO} } }`,
  listTitulos: `query ($filter: ModelTituloFilterInput, $limit: Int, $nextToken: String) {
    listTitulos(filter: $filter, limit: $limit, nextToken: $nextToken) { items { ${CAMPOS_TITULO} } nextToken } }`,
  getAccionista: 'query ($id: ID!) { getAccionista(id: $id) { id acc_nombre_completo acc_cantidad_acciones } }',
  getParametro: 'query ($id: ID!) { getParametro(id: $id) { id cantidadEmitida } }',
  listAccionistaOperacions: `query ($filter: ModelAccionistaOperacionFilterInput, $limit: Int, $nextToken: String) {
    listAccionistaOperacions(filter: $filter, limit: $limit, nextToken: $nextToken) { items { id acc_ope_operacion_id acc_ope_detalle } nextToken } }`,
  getOperacion: 'query ($id: ID!) { getOperacion(id: $id) { id ope_tipo ope_estado ope_acciones ope_fecha } }',
  listTituloPorOperacions: `query ($filter: ModelTituloPorOperacionFilterInput, $limit: Int, $nextToken: String) {
    listTituloPorOperacions(filter: $filter, limit: $limit, nextToken: $nextToken) { items { id tit_ope_titulo_id tit_ope_acciones } nextToken } }`,
  updateTitulo: `mutation ($input: UpdateTituloInput!) { updateTitulo(input: $input) { ${CAMPOS_TITULO} } }`,
  createTitulo: `mutation ($input: CreateTituloInput!) { createTitulo(input: $input) { ${CAMPOS_TITULO} } }`,
  updateTituloPorOperacion: 'mutation ($input: UpdateTituloPorOperacionInput!) { updateTituloPorOperacion(input: $input) { id tit_ope_titulo_id } }',
};

function diferencias(actual, esperado) {
  return Object.keys(esperado)
    .filter((k) => actual[k] !== esperado[k])
    .map((k) => `${k}: esperado ${esperado[k]}, actual ${actual[k]}`);
}

async function main() {
  console.log(APLICAR ? '=== MODO APLICAR: se escribirán cambios ===' : '=== SIMULACIÓN: no se escribe nada ===');
  const errores = [];
  const respaldo = { fecha: new Date().toISOString(), titulos: [], accionista: null };

  // 1. Verificar títulos a ajustar y de control.
  for (const item of [...AJUSTES, ...VERIFICAR]) {
    const t = (await graphql(Q.getTitulo, { id: item.id })).getTitulo;
    if (!t) { errores.push(`Título ${item.id} no existe.`); continue; }
    respaldo.titulos.push(t);
    const dif = diferencias(t, item.esperado);
    if (dif.length) errores.push(`Título ${item.id} cambió: ${dif.join('; ')}`);
  }

  // 2. Verificar título faltante.
  const acc = (await graphql(Q.getAccionista, { id: TITULO_FALTANTE.accionista })).getAccionista;
  const titulosAcc = await listarTodos('listTitulos', Q.listTitulos, { tit_accionista_id: { eq: TITULO_FALTANTE.accionista } });
  const raiz = (await graphql(Q.getTitulo, { id: RAIZ })).getTitulo;
  const parametro = (await graphql(Q.getParametro, { id: '1' })).getParametro;
  const ocupados = await listarTodos('listTitulos', Q.listTitulos, { tit_hasta: { ge: TITULO_FALTANTE.desde } });
  respaldo.accionista = acc;
  if (!acc) errores.push(`Accionista ${TITULO_FALTANTE.accionista} no existe.`);
  else if (acc.acc_cantidad_acciones !== TITULO_FALTANTE.acciones) errores.push(`Accionista ${acc.id} tiene ${acc.acc_cantidad_acciones} acciones, se esperaban ${TITULO_FALTANTE.acciones}.`);
  if (titulosAcc.some((t) => t.tit_acciones > 0)) errores.push(`Accionista ${TITULO_FALTANTE.accionista} ya tiene títulos con acciones.`);
  if (raiz.tit_hasta !== TITULO_FALTANTE.totalEmitido) errores.push(`El título raíz llega a ${raiz.tit_hasta}, se esperaba ${TITULO_FALTANTE.totalEmitido}.`);
  if (parametro.cantidadEmitida !== TITULO_FALTANTE.totalEmitido) errores.push(`cantidadEmitida es ${parametro.cantidadEmitida}, se esperaba ${TITULO_FALTANTE.totalEmitido}.`);
  if (ocupados.some((t) => t.id !== RAIZ && t.tit_acciones > 0)) errores.push(`Ya hay títulos en el rango ${TITULO_FALTANTE.desde}-${TITULO_FALTANTE.hasta}.`);

  // 3. Buscar la operación de aumento de capital que debía tener ese título (informativo + reenlace).
  const accOps = await listarTodos('listAccionistaOperacions', Q.listAccionistaOperacions, { acc_ope_accionista_id: { eq: TITULO_FALTANTE.accionista } });
  const enlacesRotos = [];
  console.log(`\nOperaciones del accionista ${TITULO_FALTANTE.accionista}:`);
  for (const ao of accOps) {
    const op = (await graphql(Q.getOperacion, { id: ao.acc_ope_operacion_id })).getOperacion;
    if (!op) continue;
    const tpos = await listarTodos('listTituloPorOperacions', Q.listTituloPorOperacions, { tit_ope_operacion_id: { eq: op.id } });
    for (const tpo of tpos) {
      const existe = (await graphql(Q.getTitulo, { id: tpo.tit_ope_titulo_id })).getTitulo;
      if (!existe) enlacesRotos.push({ op, tpo });
    }
    console.log(`  - ${op.ope_fecha} tipo ${op.ope_tipo} estado ${op.ope_estado} acciones ${op.ope_acciones} (${ao.acc_ope_detalle}), títulos enlazados: ${tpos.length}`);
  }
  const reenlace = enlacesRotos.filter(({ op }) => op.ope_tipo === 0 && op.ope_estado === 1 && op.ope_acciones === TITULO_FALTANTE.acciones);
  console.log(reenlace.length === 1
    ? `  -> El aumento de capital del ${reenlace[0].op.ope_fecha} apunta a un título borrado; se reenlazará al título nuevo.`
    : `  -> Enlaces a títulos borrados encontrados: ${enlacesRotos.length}. No se reenlaza automáticamente.`);

  // 4. Plan.
  console.log('\nCambios planificados:');
  AJUSTES.forEach((a) => console.log(`  - ${a.id}: ${a.motivo} -> ${JSON.stringify(a.nuevo)}`));
  console.log(`  - Crear título ${TITULO_FALTANTE.desde}-${TITULO_FALTANTE.hasta} (${TITULO_FALTANTE.acciones} acciones) para ${TITULO_FALTANTE.accionista}${acc ? ` (${acc.acc_nombre_completo})` : ''}`);

  if (errores.length) {
    console.log('\nABORTADO: los datos no están como se esperaba. No se modificó nada.');
    errores.forEach((e) => console.log(`  ! ${e}`));
    process.exitCode = 1;
    return;
  }
  console.log('\nVerificación previa OK.');
  if (!APLICAR) {
    console.log('Para aplicar: node scripts/corregir-titulos.js --aplicar');
    return;
  }

  // 5. Aplicar.
  const dirRespaldo = path.join(__dirname, 'respaldos');
  fs.mkdirSync(dirRespaldo, { recursive: true });
  const archivo = path.join(dirRespaldo, `titulos-${respaldo.fecha.replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(archivo, JSON.stringify(respaldo, null, 2));
  console.log(`Respaldo guardado en ${archivo}`);

  for (const a of AJUSTES) {
    await graphql(Q.updateTitulo, { input: { id: a.id, ...a.nuevo } });
    console.log(`  OK ${a.id}`);
  }
  const creado = (await graphql(Q.createTitulo, {
    input: {
      tit_accionista_id: TITULO_FALTANTE.accionista,
      tit_estado: 1,
      tit_acciones: TITULO_FALTANTE.acciones,
      tit_desde: TITULO_FALTANTE.desde,
      tit_hasta: TITULO_FALTANTE.hasta,
      tit_padre: RAIZ,
      tit_nivel: 1,
    },
  })).createTitulo;
  console.log(`  OK título creado ${creado.id}`);
  if (reenlace.length === 1) {
    await graphql(Q.updateTituloPorOperacion, { input: { id: reenlace[0].tpo.id, tit_ope_titulo_id: creado.id } });
    console.log(`  OK operación ${reenlace[0].op.id} reenlazada`);
  }
  console.log('\nListo. Vuelva a ejecutar "Validar rangos" en Parámetros.');
}

main().catch((e) => { console.error('Error:', e.message); process.exitCode = 1; });
