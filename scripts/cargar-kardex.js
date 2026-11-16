/*
 * Carga el historial de operaciones del Kárdex de accionistas de la Superintendencia de Compañías (Excel) como
 * operaciones APROBADAS de solo consulta. No mueve acciones ni títulos: el libro actual ya refleja su resultado.
 *
 *   node scripts/cargar-kardex.js <ruta del Excel>            -> SIMULACIÓN: valida y muestra lo que cargaría
 *   node scripts/cargar-kardex.js <ruta del Excel> --aplicar  -> carga (las filas ya cargadas se omiten)
 *
 * Formato esperado (hoja 1, encabezados en la fila 5): No. FILA, IDENTIFICACIÓN, TIPO DE IDENTIFICACIÓN, NOMBRE,
 * TRANSACCIÓN, FECHA DE REGISTRO (aaaa/mm/dd hh:mm:ss), TIPO DE INVERSIÓN, VALOR (USD; acciones = valor / 0.04).
 * - Cada traspaso es un par consecutivo VENTA/COMPRA con el mismo valor -> Cesión (ope_tipo 3).
 * - "SUSCRIPCIÓN POR AUMENTO" -> Aumento de capital (ope_tipo 0) + AumentoCapital.
 * - Identificaciones: se completa el 0 inicial que pierde Excel y se usan las equivalencias de EQUIVALENCIAS.
 *   Las que no existen en la plataforma (ex accionistas) se crean Inactivas con 0 acciones.
 * - Antes de cargar valida que, revirtiendo el Kárdex desde el libro actual, ningún accionista quede en negativo.
 *
 * Usa el entorno de src/aws-exports.js (el que indique amplify/.config/local-env-info.json).
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const ExcelJS = require('exceljs');

const APLICAR = process.argv.includes('--aplicar');
const ARCHIVO = process.argv.slice(2).find((a) => !a.startsWith('--'));
const RAIZ = path.join(__dirname, '..');
const env = JSON.parse(fs.readFileSync(path.join(RAIZ, 'amplify/.config/local-env-info.json'), 'utf8')).envName;
const exportsTxt = fs.readFileSync(path.join(RAIZ, 'src/aws-exports.js'), 'utf8');
const leer = (clave) => (new RegExp(`"${clave}":\\s*"([^"]+)"`).exec(exportsTxt) || [])[1];
const ENDPOINT = leer('aws_appsync_graphqlEndpoint');
const API_KEY = leer('aws_appsync_apiKey');

const VALOR_NOMINAL = 0.04;
const INGRESADOR = 'Carga histórica Kardex'; // = INGRESADOR_HISTORICO en src/services/aprobacion.js
// Código de la Superintendencia (sociedades extranjeras) -> identificación en la plataforma (mismo nombre).
const EQUIVALENCIAS = { 'SE-Q-00004360': '20563343193' };
const TIPO_ID = { CEDULA: 0, RUC: 1, PASAPORTE: 2 };

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

async function listar(campo, campos, filter) {
  const items = [];
  let token = null;
  const tipo = campo.replace(/^list/, '').replace(/s$/, '');
  do {
    const d = await gql(`query($t: String, $f: Model${tipo}FilterInput) { ${campo}(limit: 1000, nextToken: $t, filter: $f) { items { ${campos} } nextToken } }`, { t: token, f: filter });
    items.push(...d[campo].items);
    token = d[campo].nextToken;
  } while (token);
  return items;
}

const enLotes = async (lista, n, fn) => { for (let i = 0; i < lista.length; i += n) await Promise.all(lista.slice(i, i + n).map(fn)); };
const fechaPlataforma = (f) => { const [a, m, d] = f.slice(0, 10).split('/').map(Number); return `${d}-${m}-${a}`; };

async function leerKardex(archivo) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(archivo);
  const filas = [];
  wb.worksheets[0].eachRow((row, r) => {
    if (r < 6) return;
    const v = row.values.slice(1).map((x) => (x && x.result !== undefined ? x.result : x));
    const id = String(v[1] || '').trim();
    if (!id) return; // filas separadoras de subtotal
    filas.push({
      fila: Number(v[0]), id, tipoId: String(v[2] || '').trim(), nombre: String(v[3] || '').trim().replace(/\s+/g, ' '),
      transaccion: String(v[4] || '').trim(), fecha: String(v[5] || '').trim(), valor: Number(String(v[7]).replace(/,/g, '')),
    });
  });
  return filas;
}

(async () => {
  if (!ARCHIVO) throw new Error('Indique la ruta del Excel del Kárdex.');
  console.log(`Entorno: ${env} · ${APLICAR ? 'APLICAR' : 'SIMULACIÓN'}\n`);
  const filas = await leerKardex(ARCHIVO);
  const errores = [];

  // Operaciones: pares VENTA/COMPRA consecutivos y suscripciones por aumento.
  const operaciones = [];
  for (let i = 0; i < filas.length; i++) {
    const f = filas[i];
    const acciones = Math.round(Math.abs(f.valor) / VALOR_NOMINAL);
    if (!Number.isFinite(f.valor) || Math.abs(acciones * VALOR_NOMINAL - Math.abs(f.valor)) > 1e-6) {
      errores.push(`Fila ${f.fila}: el valor ${f.valor} no equivale a un número entero de acciones.`);
      continue;
    }
    if (/^SUSCRIPCI/i.test(f.transaccion)) {
      operaciones.push({ tipo: 0, filas: [f.fila], fecha: f.fecha, acciones, valor: Math.abs(f.valor), aumento: f });
      continue;
    }
    const g = filas[i + 1];
    const par = g && g.fecha === f.fecha && Math.abs(f.valor + g.valor) < 1e-6 && new Set([f.transaccion, g.transaccion]).size === 2
      && [f.transaccion, g.transaccion].every((t) => t === 'VENTA' || t === 'COMPRA');
    if (!par) { errores.push(`Fila ${f.fila}: ${f.transaccion} sin su contraparte en la fila siguiente.`); continue; }
    const [venta, compra] = f.transaccion === 'VENTA' ? [f, g] : [g, f];
    operaciones.push({ tipo: 3, filas: [f.fila, g.fila], fecha: f.fecha, acciones, valor: Math.abs(f.valor), cedente: venta, cesionario: compra });
    i++;
  }

  // Identificaciones del Kárdex -> accionistas de la plataforma.
  const accionistas = await listar('listAccionistas', 'id acc_cantidad_acciones acc_nombre_completo');
  const existentes = new Map(accionistas.map((a) => [a.id, a]));
  const resolver = (id) => EQUIVALENCIAS[id] || (existentes.has(id) ? id : existentes.has(`0${id}`) ? `0${id}` : id);
  const nuevos = new Map();
  filas.forEach((f) => {
    const id = resolver(f.id);
    if (!existentes.has(id) && !nuevos.has(id)) nuevos.set(id, f);
  });

  // Consistencia: revirtiendo el Kárdex desde hoy, nadie queda con saldo negativo en ningún momento.
  const saldo = new Map(accionistas.map((a) => [a.id, a.acc_cantidad_acciones || 0]));
  const sumar = (id, n) => saldo.set(id, (saldo.get(id) || 0) + n);
  [...operaciones].sort((a, b) => b.fecha.localeCompare(a.fecha)).forEach((op) => {
    if (op.tipo === 0) sumar(resolver(op.aumento.id), -op.acciones);
    else { sumar(resolver(op.cedente.id), op.acciones); sumar(resolver(op.cesionario.id), -op.acciones); }
  });
  const negativos = [...saldo].filter(([, n]) => n < 0);
  if (negativos.length) errores.push(`Saldo inicial negativo para ${negativos.length} accionista(s): ${negativos.slice(0, 5).map(([id, n]) => `${id} (${n})`).join(', ')}.`);

  // Ya cargadas (se puede volver a ejecutar sin duplicar).
  const previas = await listar('listOperacions', 'id ope_observacion', { ope_ingresador: { eq: INGRESADOR } });
  const cargadas = new Set(previas.flatMap((o) => ((/filas ([\d-]+)/.exec(o.ope_observacion || '') || [])[1] || '').split('-')).filter(Boolean));
  const pendientes = operaciones.filter((op) => !op.filas.every((n) => cargadas.has(String(n))));

  const transferidas = operaciones.filter((o) => o.tipo === 3).reduce((s, o) => s + o.acciones, 0);
  console.log(`Filas del Kárdex: ${filas.length} · operaciones: ${operaciones.filter((o) => o.tipo === 3).length} cesiones y ${operaciones.filter((o) => o.tipo === 0).length} aumento(s)`);
  console.log(`Período: ${operaciones[0] && operaciones[0].fecha.slice(0, 10)} a ${operaciones[operaciones.length - 1] && operaciones[operaciones.length - 1].fecha.slice(0, 10)} · acciones traspasadas: ${transferidas}`);
  console.log(`Identificaciones: ${new Set(filas.map((f) => f.id)).size} · equivalencias: ${Object.keys(EQUIVALENCIAS).join(', ')} · accionistas a crear (inactivos): ${nuevos.size}`);
  nuevos.forEach((f, id) => console.log(`   + ${id} (${f.tipoId})`));
  console.log(`Ya cargadas: ${operaciones.length - pendientes.length} · por cargar: ${pendientes.length}`);
  if (errores.length) { console.log(`\nNO se carga. Errores:\n- ${errores.join('\n- ')}`); process.exit(1); }
  console.log('Consistencia: ningún accionista queda con saldo negativo al revertir el Kárdex. ✔');
  if (!APLICAR) { console.log('\nSimulación: no se modificó nada. Ejecute con --aplicar.'); return; }

  // Ex accionistas: inactivos, sin acciones, con los datos del Kárdex.
  await enLotes([...nuevos], 10, ([id, f]) => {
    const juridica = /RUC|SOCIEDAD/i.test(f.tipoId);
    return gql('mutation($input: CreateAccionistaInput!) { createAccionista(input: $input) { id } }', {
      input: {
        id, acc_identificacion: id, acc_nombre_completo: f.nombre, acc_estado: 2, acc_cantidad_acciones: 0, acc_participacion: 0,
        acc_tipo_persona: juridica ? 1 : 0, acc_tipo_identificacion: TIPO_ID[f.tipoId] != null ? TIPO_ID[f.tipoId] : (juridica ? 1 : 2),
        acc_tipo_acciones: 1,
      },
    });
  });

  let hechas = 0;
  await enLotes(pendientes, 5, async (op) => {
    const fecha = fechaPlataforma(op.fecha);
    const operacion = (await gql('mutation($input: CreateOperacionInput!) { createOperacion(input: $input) { id } }', {
      input: {
        ope_fecha: fecha, ope_tipo: op.tipo, ope_acciones: op.acciones, ope_estado: 1, ope_ingresador: INGRESADOR, ope_aprobador: INGRESADOR,
        ope_fecha_aprobacion: fecha, ope_motivo_rechazo: -1, ope_documento: '',
        ope_observacion: `${INGRESADOR} SC, filas ${op.filas.join('-')} (USD ${op.valor.toFixed(2)}, ${op.fecha})`,
      },
    })).createOperacion;
    const vinculos = op.tipo === 0
      ? [[resolver(op.aumento.id), 'Aumento Capital']]
      : [[resolver(op.cedente.id), 'Cedente'], [resolver(op.cesionario.id), 'Cesionario']];
    for (const [id, detalle] of vinculos) {
      await gql('mutation($input: CreateAccionistaOperacionInput!) { createAccionistaOperacion(input: $input) { id } }', {
        input: { acc_ope_operacion_id: operacion.id, acc_ope_accionista_id: id, acc_ope_detalle: detalle },
      });
    }
    if (op.tipo === 0) {
      await gql('mutation($input: CreateAumentoCapitalInput!) { createAumentoCapital(input: $input) { id } }', {
        input: { id: operacion.id, aum_cap_valor_nominal: VALOR_NOMINAL, aum_cap_capital: op.valor },
      });
    }
    hechas++;
    if (hechas % 50 === 0) console.log(`  ${hechas}/${pendientes.length}`);
  });
  console.log(`\nCargadas: ${hechas} operaciones · accionistas creados: ${nuevos.size}`);
})().catch((e) => { console.error('Error:', e.message); process.exit(1); });
