import { API } from 'aws-amplify';
import {
  listAsambleas, listAccionistas, listDividendoNuevos, listDetalleDividendos, listDividendosTitulos, getDetalleDividendo, getParametro, listTitulos,
} from '../graphql/queries';
import {
  createDividendoNuevo, updateDividendoNuevo, createDetalleDividendo, updateDetalleDividendo,
  createDividendosTitulos, updateDividendosTitulos, updateAsamblea,
} from '../graphql/mutations';
import { listarTodos } from './listarTodos';
import { paraisosFiscales } from './paises';
import { conParaisoFiscal } from '../utils/retencion';
import { subirArchivo } from './archivos';
import { cargarRegistros } from './asambleas';
import { obtenerFotoTitulos, enLotes } from './fotoTitulos';
import { resultadoVotacion, redondear2, coberturaPeriodo, reasignarPendientes, dividendosDeAccionista } from '../utils/dividendos';
import { ID_TITULO_RAIZ } from '../utils/rangos';

const listarDividendos = (filter) => listarTodos(listDividendoNuevos, 'listDividendoNuevos', filter ? { filter } : {});
const listarDetalles = (filter) => listarTodos(listDetalleDividendos, 'listDetalleDividendos', filter ? { filter } : {});
const listarTitulosDividendo = (filter) => listarTodos(listDividendosTitulos, 'listDividendosTitulos', { filter });

// Tramos de un accionista por el índice byAccionista (antes se recorría toda la tabla con un filtro).
const tramosByAccionista = /* GraphQL */ `
  query DividendosTitulosByAccionista($div_tit_accionista_id: String!, $limit: Int, $nextToken: String) {
    dividendosTitulosByAccionista(div_tit_accionista_id: $div_tit_accionista_id, limit: $limit, nextToken: $nextToken) {
      items {
        id div_tit_participacion div_tit_dividendo div_tit_retencion div_tit_base_imponible div_tit_fecha_pago div_tit_documento
        div_tit_ddiv_id div_tit_titulo_id div_tit_accionista_id div_tit_periodo div_tit_desde div_tit_hasta div_tit_acciones
        div_tit_porcentaje div_tit_estado div_tit_aprobador div_tit_fecha_aprobacion
      }
      nextToken
    }
  }
`;
const tramosDeAccionista = (id) => listarTodos(tramosByAccionista, 'dividendosTitulosByAccionista', { div_tit_accionista_id: id });

// ---- Consulta de repartos (grilla principal) --------------------------------------------------

// Une cada reparto (DetalleDividendo) con su período (DividendoNuevo).
export async function listarRepartos() {
  const [dividendos, detalles] = await Promise.all([listarDividendos(), listarDetalles()]);
  const porId = new Map(dividendos.map((d) => [d.id, d]));
  return detalles
    .filter((d) => porId.has(d.ddiv_dividendo_id))
    .map((d) => {
      const div = porId.get(d.ddiv_dividendo_id);
      // Repartos antiguos no guardaban el monto: se deduce del porcentaje.
      const monto = d.ddiv_monto != null ? d.ddiv_monto : redondear2(div.div_dividendo * (d.ddiv_porcentaje || 0) / 100);
      return {
        ...d,
        div_periodo: div.div_periodo,
        div_concepto: (div.div_concepto || '').split('&&')[0],
        div_dividendo: div.div_dividendo,
        div_acciones_base: div.div_acciones_base,
        monto,
        saldo: redondear2(monto - (d.ddiv_dividendo || 0)),
      };
    })
    .sort((a, b) => (b.div_periodo - a.div_periodo) || (b.ddiv_secuencial - a.ddiv_secuencial));
}

// Accionistas por id, con la marca de paraíso fiscal de su país de residencia (para la retención).
export async function mapaAccionistas() {
  const [accionistas, paraisos] = await Promise.all([listarTodos(listAccionistas, 'listAccionistas'), paraisosFiscales()]);
  return new Map(accionistas.map((a) => [a.id, conParaisoFiscal(a, paraisos)]));
}

// Detalle de un reparto agrupado por accionista.
export async function detalleReparto(reparto, accionistas) {
  const tramos = await listarTitulosDividendo({ div_tit_ddiv_id: { eq: reparto.id } });
  const grupos = new Map();
  tramos.forEach((t) => {
    if (!grupos.has(t.div_tit_accionista_id)) grupos.set(t.div_tit_accionista_id, []);
    grupos.get(t.div_tit_accionista_id).push(t);
  });
  return [...grupos.entries()].map(([id, susTramos]) => {
    const acc = accionistas.get(id) || {};
    const conAcciones = susTramos.every((t) => t.div_tit_acciones != null);
    const suma = (lista, campo) => redondear2(lista.reduce((s, t) => s + (t[campo] || 0), 0));
    const dividendo = suma(susTramos, 'div_tit_dividendo');
    const retencion = suma(susTramos, 'div_tit_retencion');
    const pagado = susTramos.find((t) => t.div_tit_fecha_pago);
    // Un accionista puede tener una parte pagada y otra pendiente (p. ej. recibió acciones por cesión).
    const pendientes = susTramos.filter((t) => !t.div_tit_fecha_pago && t.div_tit_estado !== 'Pagado');
    let estado = 'Pagado';
    if (pendientes.length) estado = pendientes.some((t) => t.div_tit_estado === 'Retenido') ? 'Retenido' : 'Pendiente';
    return {
      id,
      identificacion: acc.acc_identificacion || id,
      nombre: acc.acc_nombre_completo || '',
      persona: acc.acc_tipo_persona === 1 ? 'Jurídica' : 'Natural',
      residencia: acc.acc_residencia || '',
      // Repartos antiguos no guardaban acciones por tramo: se muestra la tenencia actual.
      acciones: conAcciones ? susTramos.reduce((s, t) => s + t.div_tit_acciones, 0) : (acc.acc_cantidad_acciones || 0),
      dividendo,
      retencion,
      neto: redondear2(dividendo - retencion),
      dividendoPendiente: suma(pendientes, 'div_tit_dividendo'),
      porPagar: redondear2(suma(pendientes, 'div_tit_dividendo') - suma(pendientes, 'div_tit_retencion')),
      fechaPago: pagado ? pagado.div_tit_fecha_pago : '',
      documento: pagado ? pagado.div_tit_documento : '',
      estado,
      tramos: pendientes.map((t) => t.id),
    };
  });
}

// Marca tramos como pagados con el comprobante dado.
function marcarPagados(tramos, fecha, documento) {
  return enLotes(tramos, 25, (id) => API.graphql({
    query: updateDividendosTitulos,
    variables: { input: { id, div_tit_fecha_pago: fecha, div_tit_documento: documento, div_tit_estado: 'Pagado' } },
  }));
}

// Suma un pago al total pagado del reparto, leyendo el valor actual de la base (no el de pantalla).
async function sumarPagado(repartoId, monto) {
  const actual = (await API.graphql({ query: getDetalleDividendo, variables: { id: repartoId } })).data.getDetalleDividendo;
  const pagado = redondear2(((actual && actual.ddiv_dividendo) || 0) + monto);
  await API.graphql({ query: updateDetalleDividendo, variables: { input: { id: repartoId, ddiv_dividendo: pagado } } });
  return pagado;
}

// Comprobante de pago: solo PDF (misma validación que el resto de documentos).
const subirComprobante = (archivo) => subirArchivo(archivo);

// Registra el pago de un accionista: sube el comprobante y marca sus tramos PENDIENTES del reparto como pagados.
export async function pagarAccionista(reparto, fila, archivo, fecha) {
  if (fila.estado !== 'Pendiente' || !fila.tramos.length) throw new Error(`No se puede pagar: el dividendo está ${fila.estado.toLowerCase()}.`);
  const documento = await subirComprobante(archivo);
  await marcarPagados(fila.tramos, fecha, documento);
  const pagado = await sumarPagado(reparto.id, fila.dividendoPendiente);
  return { documento, pagado };
}

// ---- Dividendos de un accionista en todos los repartos ----------------------------------------

export async function dividendosAccionista(accionistaId, repartos) {
  const tramos = await tramosDeAccionista(accionistaId);
  return dividendosDeAccionista(tramos, repartos);
}

/**
 * Paga con un solo comprobante todos los repartos PENDIENTES del accionista (los retenidos no se tocan).
 * filas: resultado de dividendosDeAccionista. Devuelve { documento, pagados: Map repartoId -> nuevo total pagado }.
 */
export async function pagarTodoAccionista(filas, archivo, fecha) {
  const pendientes = filas.filter((f) => f.estado === 'Pendiente' && f.tramos.length);
  if (!pendientes.length) throw new Error('El accionista no tiene dividendos pendientes de pago.');
  const documento = await subirComprobante(archivo);
  const pagados = new Map();
  // Reparto por reparto: si algo falla a mitad, los ya procesados quedan completos (tramos + total del reparto).
  for (const f of pendientes) {
    await marcarPagados(f.tramos, fecha, documento);
    pagados.set(f.repartoId, await sumarPagado(f.repartoId, f.dividendo));
  }
  return { documento, pagados };
}



// ---- Generación de repartos desde asamblea ----------------------------------------------------

// Asambleas realizadas con tema de dividendos y que todavía no generaron un reparto.
export async function asambleasDisponibles() {
  const [asambleas, detalles] = await Promise.all([
    listarTodos(listAsambleas, 'listAsambleas', { filter: { estado: { eq: 'Realizada' } } }),
    listarDetalles(),
  ]);
  const usadas = new Set(detalles.map((d) => d.ddiv_asamblea_id).filter(Boolean));
  return asambleas.filter((a) => a.temaDividendo && !usadas.has(a.id));
}

// Votación y foto de la asamblea.
export async function revisarAsamblea(asamblea) {
  const [junta, foto] = await Promise.all([
    cargarRegistros(asamblea.id),
    obtenerFotoTitulos(asamblea.id),
  ]);
  // El reparto incluye solo a los accionistas presentes; los ausentes se ponen al día en un reparto posterior.
  const presentes = new Set(junta.filter((r) => r.presente === true).map((r) => r.accionistaID));
  return {
    votacion: resultadoVotacion(junta, asamblea.temaDividendo),
    foto: foto.filter((f) => presentes.has(f.accionistaID)),
    fotoTotal: foto.length,
    presentes: presentes.size,
  };
}

// Estado del período: dividendo (o null si es nuevo), tramos ya generados, repartos y % declarado.
// Lanza error si el año tiene repartos del esquema anterior (sin control por rangos).
export async function obtenerPeriodo(anio) {
  const dividendos = await listarDividendos({ div_periodo: { eq: anio } });
  if (dividendos.some((d) => d.div_acciones_base == null)) {
    throw new Error(`El período ${anio} tiene repartos del esquema anterior (sin control por títulos); no se puede repartir desde asamblea.`);
  }
  const dividendo = dividendos[0] || null;
  if (!dividendo) return { dividendo: null, pagados: [], detalles: [], porcentajeDeclarado: 0 };
  const [pagados, detalles] = await Promise.all([
    listarTitulosDividendo({ div_tit_periodo: { eq: anio } }),
    listarDetalles({ ddiv_dividendo_id: { eq: dividendo.id } }),
  ]);
  const porcentajeDeclarado = redondear2(detalles.reduce((s, d) => s + (d.ddiv_porcentaje || 0), 0));
  return { dividendo, pagados, detalles, porcentajeDeclarado };
}

/**
 * Guarda el reparto calculado. datos: {
 *   asamblea, anio, concepto, dividendoTotal, accionesBase, porcentajeReparto, fechaPago (d-m-aaaa), usuario,
 *   periodo (resultado de obtenerPeriodo usado en el cálculo), calculo (resultado de calcularReparto)
 * }
 */
export async function guardarReparto(datos) {
  const { asamblea, anio, concepto, dividendoTotal, accionesBase, porcentajeReparto, fechaPago, usuario, periodo, calculo } = datos;
  if (calculo.tramos.length === 0) throw new Error('El reparto no tiene acciones pendientes de pago.');

  // Se vuelve a leer el período justo antes de guardar, por si otro usuario generó un reparto.
  const actual = await obtenerPeriodo(anio);
  if (actual.pagados.length !== periodo.pagados.length || actual.detalles.length !== periodo.detalles.length ||
    (!periodo.dividendo && actual.dividendo)) {
    throw new Error('El período cambió mientras calculaba (otro reparto). Vuelva a calcular.');
  }

  let dividendo = periodo.dividendo;
  if (!dividendo) {
    dividendo = (await API.graphql({
      query: createDividendoNuevo,
      variables: {
        input: {
          div_periodo: anio,
          div_concepto: `${concepto}&&${asamblea.id}`,
          div_dividendo: dividendoTotal,
          div_repartido: 0,
          div_acciones_base: accionesBase,
        },
      },
    })).data.createDividendoNuevo;
  }

  const detalle = (await API.graphql({
    query: createDetalleDividendo,
    variables: {
      input: {
        ddiv_usuario: usuario,
        ddiv_secuencial: periodo.detalles.length + 1,
        ddiv_fecha_junta: asamblea.fecha,
        ddiv_fecha_pago: fechaPago,
        ddiv_titulos: calculo.tramos.length,
        ddiv_dividendo: 0,
        ddiv_porcentaje: porcentajeReparto,
        ddiv_dividendo_id: dividendo.id,
        ddiv_asamblea_id: asamblea.id,
        ddiv_fecha_corte: asamblea.fecha,
        ddiv_reglas_retencion: JSON.stringify(calculo.reglas),
        ddiv_valor_accion: calculo.valorAccion,
        ddiv_acciones: calculo.accionesReparto,
        ddiv_monto: calculo.montoReparto,
      },
    },
  })).data.createDetalleDividendo;

  await enLotes(calculo.tramos, 25, (t) => API.graphql({
    query: createDividendosTitulos,
    variables: {
      input: {
        div_tit_ddiv_id: detalle.id,
        div_tit_titulo_id: t.tituloID,
        div_tit_accionista_id: t.accionistaID,
        div_tit_periodo: anio,
        div_tit_desde: t.desde,
        div_tit_hasta: t.hasta,
        div_tit_acciones: t.acciones,
        div_tit_porcentaje: t.porcentaje,
        div_tit_participacion: Math.round(t.acciones * 1000000 / accionesBase) / 10000,
        div_tit_dividendo: t.dividendo,
        div_tit_retencion: t.retencion,
        div_tit_base_imponible: t.dividendo,
        div_tit_estado: t.estado,
        div_tit_fecha_pago: '',
        div_tit_documento: '',
      },
    },
  }));

  await API.graphql({
    query: updateDividendoNuevo,
    variables: { input: { id: dividendo.id, div_repartido: redondear2((dividendo.div_repartido || 0) + calculo.montoReparto) } },
  });
  await API.graphql({ query: updateAsamblea, variables: { input: { id: asamblea.id, estado: 'DividendoGenerado' } } });
  return detalle;
}

// Aumento de capital aprobado (+acciones) o anulado (-acciones): ajusta la base de los períodos abiertos.
// rango: {desde, hasta} de las acciones del aumento. Al anular, falla si esas acciones ya cobraron dividendo.
export async function ajustarBasePeriodos(acciones, rango) {
  const dividendos = (await listarDividendos()).filter((d) => d.div_acciones_base != null);
  const abiertos = [];
  for (const d of dividendos) {
    const pagados = await listarTitulosDividendo({ div_tit_periodo: { eq: d.div_periodo } });
    if (coberturaPeriodo(pagados, d.div_acciones_base) >= 1) continue; // período completo
    if (acciones < 0 && pagados.some((p) => p.div_tit_desde <= rango.hasta && p.div_tit_hasta >= rango.desde)) {
      throw new Error(`Las acciones del aumento ya recibieron dividendo del período ${d.div_periodo}; no se puede anular.`);
    }
    abiertos.push(d);
  }
  // Se valida todo antes de escribir.
  for (const d of abiertos) {
    await API.graphql({ query: updateDividendoNuevo, variables: { input: { id: d.id, div_acciones_base: d.div_acciones_base + acciones } } });
  }
}

// ---- Cambio de dueño de acciones --------------------------------------------------------------

/**
 * Después de aprobar/anular una operación que cambia el dueño de acciones, pasa al nuevo dueño los dividendos
 * PENDIENTES de esas acciones y recalcula retenciones. Los ya pagados se omiten. Si el dueño anterior no tiene
 * dividendos pendientes en esos rangos, termina sin más consultas.
 * transferencias: [{ desde, hasta, de, a, tituloID }]. Devuelve cuántos tramos se modificaron/crearon.
 */
export async function actualizarDividendosPorTransferencia(transferencias) {
  const validas = transferencias.filter((t) => t.de !== t.a && t.desde != null && t.hasta >= t.desde);
  if (!validas.length) return 0;

  // 1. ¿El dueño anterior tiene tramos pendientes en los rangos transferidos?
  const origenes = [...new Set(validas.map((t) => t.de))];
  const tramosOrigen = (await Promise.all(origenes.map((id) => tramosDeAccionista(id)))).flat();
  const afectados = tramosOrigen.filter((t) => !t.div_tit_fecha_pago && t.div_tit_estado !== 'Pagado' && t.div_tit_desde != null &&
    validas.some((tr) => tr.de === t.div_tit_accionista_id && t.div_tit_hasta >= tr.desde && t.div_tit_desde <= tr.hasta));
  if (!afectados.length) return 0;

  // 2. Tramos de todos los involucrados en esos períodos (para recalcular la retención anual).
  const periodos = new Set(afectados.map((t) => t.div_tit_periodo));
  const destinos = [...new Set(validas.map((t) => t.a))].filter((id) => !origenes.includes(id));
  const tramosDestino = (await Promise.all(destinos.map((id) => tramosDeAccionista(id)))).flat();
  const tramos = [...tramosOrigen, ...tramosDestino].filter((t) => periodos.has(t.div_tit_periodo));

  const [detalles, accionistas, parametro] = await Promise.all([
    listarDetalles(),
    mapaAccionistas(),
    API.graphql({ query: getParametro, variables: { id: '1' } }),
  ]);
  const secuencialDetalle = new Map(detalles.map((d) => [d.id, d.ddiv_secuencial]));

  const { actualizar, crear, nuevosPorDetalle } = reasignarPendientes({
    tramos, transferencias: validas, accionistas, secuencialDetalle, sbu: parametro.data.getParametro.baseImponible || 0,
    reglas: parametro.data.getParametro.reglasRetencion,
  });

  // 3. Aplicar.
  await enLotes(actualizar, 25, (input) => API.graphql({ query: updateDividendosTitulos, variables: { input } }));
  await enLotes(crear, 25, (input) => API.graphql({ query: createDividendosTitulos, variables: { input } }));
  const porId = new Map(detalles.map((d) => [d.id, d]));
  for (const [ddivId, cantidad] of nuevosPorDetalle) {
    const d = porId.get(ddivId);
    if (d) await API.graphql({ query: updateDetalleDividendo, variables: { input: { id: d.id, ddiv_titulos: (d.ddiv_titulos || 0) + cantidad } } });
  }
  return actualizar.length + crear.length;
}

// Compara los dividendos pendientes con el dueño ACTUAL de cada título y corrige los que quedaron a nombre
// de un dueño anterior (p. ej. operaciones aprobadas antes de existir la reasignación automática).
export async function sincronizarPendientesConTitulos() {
  const [pendientes, titulos] = await Promise.all([
    listarTitulosDividendo({ div_tit_fecha_pago: { eq: '' } }),
    listarTodos(listTitulos, 'listTitulos'),
  ]);
  const vigentes = titulos.filter((t) => t.id !== ID_TITULO_RAIZ && t.tit_acciones > 0);
  const claves = new Set();
  const transferencias = [];
  pendientes
    .filter((p) => p.div_tit_estado !== 'Pagado' && p.div_tit_desde != null)
    .forEach((p) => {
      vigentes.forEach((t) => {
        if (t.tit_accionista_id === p.div_tit_accionista_id || t.tit_hasta < p.div_tit_desde || t.tit_desde > p.div_tit_hasta) return;
        const tr = {
          desde: Math.max(t.tit_desde, p.div_tit_desde),
          hasta: Math.min(t.tit_hasta, p.div_tit_hasta),
          de: p.div_tit_accionista_id,
          a: t.tit_accionista_id,
          tituloID: t.id,
        };
        const clave = `${tr.de}|${tr.a}|${tr.desde}|${tr.hasta}`;
        if (!claves.has(clave)) { claves.add(clave); transferencias.push(tr); }
      });
    });
  if (!transferencias.length) return 0;
  return actualizarDividendosPorTransferencia(transferencias);
}
