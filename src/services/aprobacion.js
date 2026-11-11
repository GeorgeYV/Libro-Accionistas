// Aprobación, rechazo y anulación de operaciones (blotter). Cada función valida antes de escribir y lanza un
// Error con un mensaje claro si no se puede aplicar. Devuelven { aviso } cuando la operación se aplicó pero algo
// secundario (dividendos) no se pudo actualizar.
import { API } from 'aws-amplify';
import {
  listOperacions, listTituloPorOperacions, listAccionistaOperacions, listAccionistas, getAccionista, getTitulo, getParametro, listTitulos,
} from '../graphql/queries';
import {
  updateOperacion, updateTitulo, createTitulo, deleteTitulo, updateAccionista, createAccionista, createPersonaNatural,
  createPersonaJuridica, createTituloPorOperacion, updateParametro,
} from '../graphql/mutations';
import { listarTodos } from './listarTodos';
import { enLotes } from './fotoTitulos';
import { listarHerederosDe, fechaOperacion, exigirHerederosValidos } from './operaciones';
import { ajustarBasePeriodos, actualizarDividendosPorTransferencia } from './repartoDividendos';
import { invalidarCertificados } from './certificados';
import { accionistasAfectados } from '../utils/certificados';
import { dividirRango, unirRango, repartirRango, ID_TITULO_RAIZ } from '../utils/rangos';
import { estadoSegunAcciones, ESTADO } from '../utils/operaciones';

export const TIPOS_OPERACION = {
  0: 'Aumento de Capital', 1: 'Bloqueo', 2: 'Canje', 3: 'Cesión', 4: 'Desbloqueo', 5: 'Donación', 6: 'Posesión Efectiva', 7: 'Testamento',
};
export const ESTADOS_OPERACION = { 0: 'Pendiente', 1: 'Aprobada', 2: 'Rechazada', 3: 'Anulada' };
export const MOTIVOS_RECHAZO = [
  { valor: 1, etiqueta: 'Falta documentación' },
  { valor: 2, etiqueta: 'Documentación errada' },
  { valor: 3, etiqueta: 'Documentación duplicada' },
  { valor: 4, etiqueta: 'Error en acciones' },
  { valor: 5, etiqueta: 'Error en valor' },
];
// Etiquetas de ope_documento por posición (cs, cg, ci, es, cp), iguales a las pantallas de ingreso.
export const DOCUMENTOS_POR_TIPO = {
  0: ['Escrituras'],
  1: ['Documento de respaldo'],
  2: ['Título ordinario'],
  3: ['Carta de cesión y gerente', 'Documentos de identidad', 'Carta de instrucciones', 'Respaldo de adquisición', 'Poderes'],
  4: ['Documento de respaldo'],
  5: ['Carta de donación', 'Escritura de donación de bienes', 'Pago de impuestos', 'Poder', 'Declaración jurada'],
  6: ['Partición extrajudicial', 'Impuesto a la herencia', 'Declaración jurada', 'Escritura de posesión efectiva de bienes', 'Carta poder'],
  7: ['Carta de testamento', 'Escritura de testamento', 'Pago de impuestos', 'Poder', 'Declaración jurada'],
};
const TRANSFERENCIAS = [3, 5, 7];

// ---- Consulta ---------------------------------------------------------------------------------

export async function cargarOperaciones() {
  const operaciones = await listarTodos(listOperacions, 'listOperacions');
  return operaciones.map((o) => ({ ...o, tipo: TIPOS_OPERACION[o.ope_tipo] || 'Desconocida' }));
}

/**
 * Todo lo necesario para revisar y aplicar una operación (se carga completo antes de habilitar los botones).
 * principal: accionista de la operación (cedente, causante o el único accionista); cesionario: en transferencias.
 */
export async function cargarDetalle(operacion) {
  const [titulos, vinculos] = await Promise.all([
    listarTodos(listTituloPorOperacions, 'listTituloPorOperacions', { filter: { tit_ope_operacion_id: { eq: operacion.id } } }),
    listarTodos(listAccionistaOperacions, 'listAccionistaOperacions', { filter: { acc_ope_operacion_id: { eq: operacion.id } } }),
  ]);
  const leer = async (detalles) => {
    const v = vinculos.find((x) => detalles.includes(x.acc_ope_detalle));
    return v ? (await API.graphql({ query: getAccionista, variables: { id: v.acc_ope_accionista_id } })).data.getAccionista : null;
  };
  const [principal, cesionario] = await Promise.all([
    leer(['Cedente', 'Canje', 'Bloqueo', 'Desbloqueo', 'Aumento Capital']),
    leer(['Cesionario']),
  ]);
  const herederos = operacion.ope_tipo === 6 && principal ? await listarHerederosDe(principal.id) : [];
  return { titulos, principal, cesionario, herederos };
}

// ---- Escrituras comunes ------------------------------------------------------------------------

async function cambiarEstado(operacion, estado, usuario, extra = {}) {
  await API.graphql({
    query: updateOperacion,
    variables: { input: { id: operacion.id, ope_estado: estado, ope_aprobador: usuario, ope_fecha_aprobacion: fechaOperacion(), ...extra } },
  });
}

async function cantidadEmitida() {
  return (await API.graphql({ query: getParametro, variables: { id: '1' } })).data.getParametro.cantidadEmitida;
}

const leerTitulo = async (id) => (await API.graphql({ query: getTitulo, variables: { id } })).data.getTitulo;
// Estado actual de los títulos de la operación (no se confía en lo guardado al ingresar).
async function titulosActuales(titulos) {
  return (await Promise.all(titulos.map((t) => leerTitulo(t.tit_ope_titulo_id)))).filter(Boolean);
}

const actualizarAccionista = (input) => API.graphql({ query: updateAccionista, variables: { input } });
const actualizarTitulo = (input) => API.graphql({ query: updateTitulo, variables: { input } });

// Cambia las acciones y ajusta el estado: sin acciones queda inactivo; si vuelve a tener, activo (ver estadoSegunAcciones).
async function actualizarAcciones(accionista, delta, emitido) {
  const acciones = (accionista.acc_cantidad_acciones || 0) + delta;
  await actualizarAccionista({
    id: accionista.id, acc_cantidad_acciones: acciones, acc_participacion: acciones / emitido,
    acc_estado: estadoSegunAcciones(accionista.acc_estado, acciones),
  });
}

// Recalcula la participación de TODOS los accionistas (antes solo se actualizaban los primeros 100).
async function recalcularParticipaciones(emitido) {
  const accionistas = await listarTodos(listAccionistas, 'listAccionistas');
  await enLotes(accionistas, 25, (a) => actualizarAccionista({ id: a.id, acc_participacion: (a.acc_cantidad_acciones || 0) / emitido }));
}

// Pasa al nuevo dueño los dividendos pendientes de las acciones transferidas; la operación ya está aplicada.
async function moverDividendos(transferencias) {
  try {
    await actualizarDividendosPorTransferencia(transferencias);
    return null;
  } catch (err) {
    console.log('Error actualizando dividendos pendientes:', err);
    return 'La operación se aplicó, pero no se pudieron actualizar los dividendos pendientes. Revise el detalle de dividendos.';
  }
}
// Los certificados emitidos dejan de ser válidos cuando cambian las acciones o el estado del accionista.
async function quitarVigencia(op, detalle, accion, aviso) {
  try {
    await invalidarCertificados(accionistasAfectados(detalle), `${accion} de ${TIPOS_OPERACION[op.ope_tipo]}`);
    return aviso;
  } catch (err) {
    console.log('Error al quitar vigencia a certificados:', err);
    return [aviso, 'No se pudo quitar la vigencia a los certificados emitidos de los accionistas involucrados.'].filter(Boolean).join(' ');
  }
}
const transferenciasDe = (lista, de, a) => lista.map((t) => ({ desde: t.tit_desde, hasta: t.tit_hasta, de, a, tituloID: t.id }));

function exigir(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}

// ---- Aprobación ---------------------------------------------------------------------------------

async function aprobarBloqueo(op, { principal, titulos }, usuario, bloquear) {
  await cambiarEstado(op, 1, usuario);
  await actualizarAccionista({ id: principal.id, acc_estado: bloquear ? 3 : 1 });
  await enLotes(titulos, 25, (t) => actualizarTitulo({ id: t.tit_ope_titulo_id, tit_estado: bloquear ? 0 : 1 }));
}

async function aprobarAumento(op, { principal }, usuario) {
  const raiz = await leerTitulo(ID_TITULO_RAIZ);
  const nuevo = {
    tit_accionista_id: principal.id, tit_estado: 1, tit_acciones: op.ope_acciones,
    tit_desde: raiz.tit_hasta + 1, tit_hasta: raiz.tit_hasta + op.ope_acciones, tit_padre: raiz.id, tit_nivel: 1,
  };
  await cambiarEstado(op, 1, usuario);
  const creado = (await API.graphql({ query: createTitulo, variables: { input: nuevo } })).data.createTitulo;
  await API.graphql({ query: createTituloPorOperacion, variables: { input: { tit_ope_operacion_id: op.id, tit_ope_titulo_id: creado.id, tit_ope_acciones: op.ope_acciones } } });
  const emitido = nuevo.tit_hasta;
  await actualizarTitulo({ id: ID_TITULO_RAIZ, tit_hasta: emitido });
  await API.graphql({ query: updateParametro, variables: { input: { id: '1', cantidadEmitida: emitido } } });
  const accionesFinales = (principal.acc_cantidad_acciones || 0) + op.ope_acciones;
  await actualizarAccionista({ id: principal.id, acc_estado: estadoSegunAcciones(principal.acc_estado, accionesFinales), acc_cantidad_acciones: accionesFinales });
  await recalcularParticipaciones(emitido);
  try {
    // Los períodos de dividendos en curso pasan a incluir las acciones nuevas en su 100%.
    await ajustarBasePeriodos(op.ope_acciones, { desde: nuevo.tit_desde, hasta: nuevo.tit_hasta });
    return null;
  } catch (err) {
    console.log('Error ajustando base de dividendos:', err);
    return 'El aumento se aprobó, pero no se pudo actualizar la base de acciones de los dividendos en curso.';
  }
}

async function aprobarTransferencia(op, { principal, cesionario, titulos }, usuario) {
  exigir(principal && cesionario, 'No se encontraron el cedente y el cesionario de la operación.');
  const actuales = await titulosActuales(titulos);
  exigir(actuales.length === titulos.length, 'Alguno de los títulos de la operación ya no existe.');
  exigir(actuales.every((t) => t.tit_accionista_id === principal.id), 'Alguno de los títulos ya no pertenece al cedente.');
  exigir(actuales.every((t) => t.tit_estado !== 0), 'Alguno de los títulos está bloqueado.');
  const totalTitulos = actuales.reduce((s, t) => s + t.tit_acciones, 0);
  exigir(op.ope_acciones <= totalTitulos, 'La operación cede más acciones de las que tienen los títulos.');
  const parcial = op.ope_acciones < totalTitulos;
  exigir(!parcial || actuales.length === 1, 'La cesión parcial solo se permite sobre un título. Ingrese una operación por título.');
  const division = parcial ? dividirRango(actuales[0], op.ope_acciones) : null;
  const emitido = await cantidadEmitida();

  await cambiarEstado(op, 1, usuario);
  await actualizarAcciones(principal, -op.ope_acciones, emitido);
  await actualizarAcciones(cesionario, op.ope_acciones, emitido);
  if (!parcial) {
    await enLotes(actuales, 25, (t) => actualizarTitulo({ id: t.id, tit_accionista_id: cesionario.id }));
    return moverDividendos(transferenciasDe(actuales, principal.id, cesionario.id));
  }
  const padre = actuales[0];
  await actualizarTitulo({ id: padre.id, ...division.padre });
  const hijo = (await API.graphql({
    query: createTitulo,
    variables: { input: { tit_accionista_id: cesionario.id, tit_estado: 1, ...division.hijo, tit_padre: padre.id, tit_nivel: padre.tit_nivel + 1 } },
  })).data.createTitulo;
  await API.graphql({ query: createTituloPorOperacion, variables: { input: { tit_ope_operacion_id: op.id, tit_ope_titulo_id: hijo.id, tit_ope_acciones: op.ope_acciones } } });
  return moverDividendos(transferenciasDe([hijo], principal.id, cesionario.id));
}

async function aprobarPosesion(op, { principal, titulos, herederos }, usuario) {
  exigir(principal, 'No se encontró el causante de la operación.');
  exigir(titulos.length === 1, 'La posesión efectiva se aprueba sobre un título a la vez. Ingrese una operación por título.');
  const [titulo] = await titulosActuales(titulos);
  exigir(titulo, 'El título de la operación ya no existe.');
  exigir(titulo.tit_accionista_id === principal.id, 'El título ya no pertenece al causante.');
  exigir(op.ope_acciones === titulo.tit_acciones, 'Las acciones de la operación no coinciden con las del título.');
  const conAcciones = herederos.filter((h) => h.her_cant_acciones > 0);
  exigir(conAcciones.length > 0, 'Los herederos no tienen acciones asignadas.');
  const tramos = repartirRango(titulo, conAcciones.map((h) => h.her_cant_acciones));
  // Se revalida al aprobar: la ficha del heredero pudo cambiar mientras la operación estaba pendiente.
  const revision = await exigirHerederosValidos(conAcciones, principal.id);
  const fichaIncompleta = new Set(revision.filter((r) => r.fichaIncompleta).map((r) => r.heredero.her_identificacion));
  const emitido = await cantidadEmitida();

  await cambiarEstado(op, 1, usuario);
  await actualizarAcciones(principal, -op.ope_acciones, emitido);
  const transferencias = [];
  // Secuencial para no mezclar rangos; el último heredero se queda con el título original (tramo final).
  for (let i = 0; i < conAcciones.length; i++) {
    const h = conAcciones[i];
    const existente = (await API.graphql({ query: getAccionista, variables: { id: h.her_identificacion } })).data.getAccionista;
    if (existente) {
      await actualizarAcciones(existente, h.her_cant_acciones, emitido);
      // Aceptado sin ficha completa: queda como heredero hasta completarla (no pasa a activo).
      if (fichaIncompleta.has(existente.id)) await actualizarAccionista({ id: existente.id, acc_estado: ESTADO.HEREDERO });
    } else {
      const juridica = h.her_identificacion.length > 10;
      await API.graphql({
        query: createAccionista,
        variables: {
          input: {
            id: h.her_identificacion, acc_identificacion: h.her_identificacion, acc_nombre_completo: h.her_nombre,
            acc_cantidad_acciones: h.her_cant_acciones, acc_participacion: h.her_cant_acciones / emitido,
            // Heredero: su ficha está incompleta; pasa a activo al completarla en el formulario.
            acc_tipo_identificacion: juridica ? 1 : 0, acc_tipo_persona: juridica ? 1 : 0, acc_estado: ESTADO.HEREDERO,
          },
        },
      });
      await API.graphql(juridica
        ? { query: createPersonaJuridica, variables: { input: { id: h.her_identificacion, pj_razon_social: h.her_nombre, pj_rl_tipo_identificacion: 0 } } }
        : { query: createPersonaNatural, variables: { input: { id: h.her_identificacion, pn_estado_civil: '0' } } });
    }
    let tituloID = titulo.id;
    if (i === conAcciones.length - 1) {
      await actualizarTitulo({ id: titulo.id, ...tramos[i], tit_accionista_id: h.her_identificacion });
    } else {
      tituloID = (await API.graphql({
        query: createTitulo,
        variables: { input: { tit_accionista_id: h.her_identificacion, tit_estado: 1, ...tramos[i], tit_padre: titulo.id, tit_nivel: titulo.tit_nivel + 1 } },
      })).data.createTitulo.id;
    }
    transferencias.push({ desde: tramos[i].tit_desde, hasta: tramos[i].tit_hasta, de: principal.id, a: h.her_identificacion, tituloID });
  }
  return moverDividendos(transferencias);
}

export async function aprobar(op, detalle, usuario) {
  exigir(op.ope_estado === 0, 'Solo se pueden aprobar operaciones pendientes.');
  if (op.ope_tipo !== 6) exigir(detalle.principal, 'No se encontró el accionista de la operación.');
  let aviso = null;
  switch (op.ope_tipo) {
    case 0: aviso = await aprobarAumento(op, detalle, usuario); break;
    case 1: await aprobarBloqueo(op, detalle, usuario, true); break;
    case 4: await aprobarBloqueo(op, detalle, usuario, false); break;
    case 2:
      await cambiarEstado(op, 1, usuario);
      await actualizarAccionista({ id: detalle.principal.id, acc_tipo_acciones: 1 });
      break;
    case 6: aviso = await aprobarPosesion(op, detalle, usuario); break;
    default:
      exigir(TRANSFERENCIAS.includes(op.ope_tipo), 'Tipo de operación desconocido.');
      aviso = await aprobarTransferencia(op, detalle, usuario);
  }
  return { aviso: await quitarVigencia(op, detalle, 'Aprobación', aviso) };
}

// ---- Anulación ---------------------------------------------------------------------------------

async function anularAumento(op, { principal }, usuario) {
  const raiz = await leerTitulo(ID_TITULO_RAIZ);
  const vinculos = await listarTodos(listTituloPorOperacions, 'listTituloPorOperacions', { filter: { tit_ope_operacion_id: { eq: op.id } } });
  exigir(vinculos.length === 1, 'La operación no tiene exactamente un título asociado; no se puede anular automáticamente.');
  const creado = await leerTitulo(vinculos[0].tit_ope_titulo_id);
  exigir(creado && creado.tit_accionista_id === principal.id && creado.tit_acciones === op.ope_acciones,
    'El título del aumento ya cambió (transferido o dividido); no se puede anular automáticamente.');
  exigir(creado.tit_hasta === raiz.tit_hasta, 'Hubo aumentos de capital posteriores; anularlo dejaría un hueco en la numeración.');
  // Falla (sin escribir) si esas acciones ya cobraron dividendo; si no, quita las acciones de la base.
  await ajustarBasePeriodos(-op.ope_acciones, { desde: creado.tit_desde, hasta: creado.tit_hasta });

  await cambiarEstado(op, 3, usuario);
  const emitido = raiz.tit_hasta - op.ope_acciones;
  await actualizarTitulo({ id: ID_TITULO_RAIZ, tit_hasta: emitido });
  await API.graphql({ query: updateParametro, variables: { input: { id: '1', cantidadEmitida: emitido } } });
  const accionesFinales = (principal.acc_cantidad_acciones || 0) - op.ope_acciones;
  await actualizarAccionista({ id: principal.id, acc_estado: estadoSegunAcciones(principal.acc_estado, accionesFinales), acc_cantidad_acciones: accionesFinales });
  await API.graphql({ query: deleteTitulo, variables: { input: { id: creado.id } } });
  await recalcularParticipaciones(emitido);
}

async function anularTransferencia(op, { principal, cesionario, titulos }, usuario) {
  exigir(principal && cesionario, 'No se encontraron el cedente y el cesionario de la operación.');
  const actuales = await titulosActuales(titulos);
  // En la parcial, al aprobar se agrega el título hijo: lo registrado suma más que la operación.
  const parcial = titulos.reduce((s, t) => s + t.tit_ope_acciones, 0) > op.ope_acciones;
  const emitido = await cantidadEmitida();
  if (parcial) {
    const hijo = actuales.find((t) => t.tit_accionista_id === cesionario.id && actuales.some((p) => p.id === t.tit_padre));
    const padre = hijo ? actuales.find((p) => p.id === hijo.tit_padre) : null;
    exigir(hijo && padre, 'No se encontró el título creado por la cesión; no se puede anular automáticamente.');
    exigir(hijo.tit_acciones === op.ope_acciones, 'El título cedido ya fue dividido o transferido; no se puede anular automáticamente.');
    exigir(padre.tit_accionista_id === principal.id, 'El título de origen ya no pertenece al cedente; no se puede anular automáticamente.');
    const union = unirRango(padre, hijo);

    await cambiarEstado(op, 3, usuario);
    await actualizarAcciones(principal, op.ope_acciones, emitido);
    await actualizarAcciones(cesionario, -op.ope_acciones, emitido);
    await actualizarTitulo({ id: padre.id, ...union });
    await API.graphql({ query: deleteTitulo, variables: { input: { id: hijo.id } } });
    return moverDividendos([{ desde: hijo.tit_desde, hasta: hijo.tit_hasta, de: cesionario.id, a: principal.id, tituloID: padre.id }]);
  }
  exigir(actuales.length === titulos.length && actuales.every((t) => t.tit_accionista_id === cesionario.id),
    'Alguno de los títulos ya no pertenece al cesionario; no se puede anular automáticamente.');
  await cambiarEstado(op, 3, usuario);
  await actualizarAcciones(principal, op.ope_acciones, emitido);
  await actualizarAcciones(cesionario, -op.ope_acciones, emitido);
  await enLotes(actuales, 25, (t) => actualizarTitulo({ id: t.id, tit_accionista_id: principal.id }));
  return moverDividendos(transferenciasDe(actuales, cesionario.id, principal.id));
}

// Revierte la posesión efectiva: vuelve a unir el título repartido entre los herederos y lo devuelve al causante.
// Al aprobar, el último heredero quedó con el título original (tramo final) y los demás con títulos hijos del mismo.
async function anularPosesion(op, { principal, titulos }, usuario) {
  exigir(principal, 'No se encontró el causante de la operación.');
  exigir(titulos.length === 1, 'La posesión efectiva no tiene exactamente un título asociado; no se puede anular automáticamente.');
  const original = await leerTitulo(titulos[0].tit_ope_titulo_id);
  exigir(original, 'El título de la operación ya no existe; no se puede anular automáticamente.');
  // Rango original: termina donde termina hoy el título original y mide lo que tenía la operación.
  const hasta = original.tit_hasta;
  const desde = hasta - op.ope_acciones + 1;
  const hijos = (await listarTodos(listTitulos, 'listTitulos', { filter: { tit_padre: { eq: original.id } } }))
    .filter((t) => t.tit_desde >= desde && t.tit_hasta <= hasta);
  const piezas = [...hijos, original].sort((a, b) => a.tit_desde - b.tit_desde);
  let siguiente = desde;
  piezas.forEach((t) => {
    exigir(t.tit_desde === siguiente && t.tit_hasta - t.tit_desde + 1 === t.tit_acciones,
      'Los títulos de los herederos ya fueron divididos o transferidos; no se puede anular automáticamente.');
    siguiente = t.tit_hasta + 1;
  });
  exigir(siguiente === hasta + 1, 'Los títulos de los herederos no cubren la posesión efectiva; no se puede anular automáticamente.');
  exigir(piezas.every((t) => t.tit_estado !== 0), 'Algún título de los herederos está bloqueado; desbloquéelo antes de anular.');
  exigir(piezas.every((t) => t.tit_accionista_id !== principal.id), 'El título ya pertenece al causante; no se puede anular automáticamente.');

  // Acciones a devolver por heredero (según sus títulos actuales, no según la ficha de herederos).
  const porHeredero = new Map();
  piezas.forEach((t) => porHeredero.set(t.tit_accionista_id, (porHeredero.get(t.tit_accionista_id) || 0) + t.tit_acciones));
  const herederos = await Promise.all([...porHeredero.keys()].map(async (id) => (await API.graphql({ query: getAccionista, variables: { id } })).data.getAccionista));
  herederos.forEach((h, i) => exigir(h && (h.acc_cantidad_acciones || 0) >= porHeredero.get(h.id),
    `El heredero ${[...porHeredero.keys()][i]} ya no tiene las acciones recibidas; no se puede anular automáticamente.`));
  const emitido = await cantidadEmitida();

  await cambiarEstado(op, 3, usuario);
  await actualizarAcciones(principal, op.ope_acciones, emitido);
  for (const h of herederos) await actualizarAcciones(h, -porHeredero.get(h.id), emitido);
  await enLotes(hijos, 25, (t) => API.graphql({ query: deleteTitulo, variables: { input: { id: t.id } } }));
  await actualizarTitulo({ id: original.id, tit_desde: desde, tit_hasta: hasta, tit_acciones: op.ope_acciones, tit_accionista_id: principal.id });
  return moverDividendos(piezas.map((t) => ({ desde: t.tit_desde, hasta: t.tit_hasta, de: t.tit_accionista_id, a: principal.id, tituloID: original.id })));
}

export async function anular(op, detalle, usuario) {
  exigir(op.ope_estado === 1, 'Solo se pueden anular operaciones aprobadas.');
  exigir(detalle.principal, 'No se encontró el accionista de la operación.');
  let aviso = null;
  switch (op.ope_tipo) {
    case 0: await anularAumento(op, detalle, usuario); break;
    case 1:
      await cambiarEstado(op, 3, usuario);
      await actualizarAccionista({ id: detalle.principal.id, acc_estado: 1 });
      await enLotes(detalle.titulos, 25, (t) => actualizarTitulo({ id: t.tit_ope_titulo_id, tit_estado: 1 }));
      break;
    case 4:
      await cambiarEstado(op, 3, usuario);
      await actualizarAccionista({ id: detalle.principal.id, acc_estado: 3 });
      await enLotes(detalle.titulos, 25, (t) => actualizarTitulo({ id: t.tit_ope_titulo_id, tit_estado: 0 }));
      break;
    case 2:
      await cambiarEstado(op, 3, usuario);
      await actualizarAccionista({ id: detalle.principal.id, acc_tipo_acciones: 0 });
      break;
    case 6: aviso = await anularPosesion(op, detalle, usuario); break;
    default:
      exigir(TRANSFERENCIAS.includes(op.ope_tipo), 'Este tipo de operación no se puede anular automáticamente.');
      aviso = await anularTransferencia(op, detalle, usuario);
  }
  return { aviso: await quitarVigencia(op, detalle, 'Anulación', aviso) };
}

// ---- Rechazo, reenvío y documentos -------------------------------------------------------------

export async function rechazar(op, motivos, usuario) {
  exigir(op.ope_estado === 0, 'Solo se pueden rechazar operaciones pendientes.');
  exigir(motivos.length > 0, 'Seleccione al menos un motivo de rechazo.');
  const observacion = motivos.map((m) => (MOTIVOS_RECHAZO.find((x) => x.valor === m) || {}).etiqueta).join(' | ');
  await cambiarEstado(op, 2, usuario, { ope_motivo_rechazo: motivos[0], ope_observacion: observacion });
}

// Una operación rechazada vuelve a quedar pendiente de aprobación.
export async function reenviar(op) {
  exigir(op.ope_estado === 2, 'Solo se pueden reenviar operaciones rechazadas.');
  await API.graphql({ query: updateOperacion, variables: { input: { id: op.id, ope_estado: 0, ope_fecha_aprobacion: fechaOperacion() } } });
}

export async function guardarDocumentos(op, documentos) {
  const ope_documento = documentos.join('&');
  await API.graphql({ query: updateOperacion, variables: { input: { id: op.id, ope_documento } } });
  return ope_documento;
}
