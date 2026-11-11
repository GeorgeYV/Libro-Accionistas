import { API } from 'aws-amplify';
import {
  listAccionistas, listTitulos, listAccionistaOperacions, listTituloPorOperacions, getOperacion, listHerederos, getAccionista,
  getPersonaNatural, getPersonaJuridica,
} from '../graphql/queries';
import { createOperacion, createAccionistaOperacion, createTituloPorOperacion, createAumentoCapital, updateHeredero } from '../graphql/mutations';
import { listarTodos } from './listarTodos';
import { enLotes } from './fotoTitulos';
import { ID_TITULO_RAIZ } from '../utils/rangos';
import { problemasHeredero, problemasFicha } from '../utils/operaciones';

// Fecha de operación en el formato que ya usa el blotter (d-m-aaaa, sin ceros a la izquierda).
export const fechaOperacion = (d = new Date()) => `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;

export function listarAccionistasPorEstado(estado) {
  return listarTodos(listAccionistas, 'listAccionistas', { filter: { acc_estado: { eq: estado } } });
}

// Títulos vigentes (con acciones) del accionista.
export async function listarTitulosVigentes(accionistaId) {
  const titulos = await listarTodos(listTitulos, 'listTitulos', { filter: { tit_accionista_id: { eq: accionistaId } } });
  return titulos.filter((t) => t.id !== ID_TITULO_RAIZ && t.tit_acciones > 0).sort((a, b) => a.tit_desde - b.tit_desde);
}

// Títulos (de la lista) que ya forman parte de una operación pendiente: aprobar ambas dejaría datos inconsistentes.
export async function titulosEnOperacionPendiente(titulos) {
  if (titulos.length === 0) return [];
  const vinculos = await listarTodos(listTituloPorOperacions, 'listTituloPorOperacions', {
    filter: { or: titulos.map((t) => ({ tit_ope_titulo_id: { eq: t.id } })) },
  });
  const ids = [...new Set(vinculos.map((v) => v.tit_ope_operacion_id))];
  const operaciones = await Promise.all(ids.map((id) => API.graphql({ query: getOperacion, variables: { id } })));
  const pendientes = new Set(operaciones.map((r) => r.data.getOperacion).filter((o) => o && o.ope_estado === 0).map((o) => o.id));
  return [...new Set(vinculos.filter((v) => pendientes.has(v.tit_ope_operacion_id)).map((v) => v.tit_ope_titulo_id))];
}

// ¿El accionista ya tiene una operación de este tipo pendiente de aprobación?
export async function tieneOperacionPendiente(accionistaId, tipo) {
  const vinculos = await listarTodos(listAccionistaOperacions, 'listAccionistaOperacions', { filter: { acc_ope_accionista_id: { eq: accionistaId } } });
  const operaciones = await Promise.all(vinculos.map((v) => API.graphql({ query: getOperacion, variables: { id: v.acc_ope_operacion_id } })));
  return operaciones.some((r) => r.data.getOperacion && r.data.getOperacion.ope_tipo === tipo && r.data.getOperacion.ope_estado === 0);
}

/**
 * Registra una operación pendiente (estado 0) hasta que la apruebe el blotter.
 * titulos: títulos afectados; acciones: total si difiere de la suma de títulos (parcial, aumento de capital).
 * vinculos: [{ accionista, detalle }] si hay más de un accionista (cedente y cesionario); si no, accionista + detalle.
 */
export async function solicitarOperacion({ tipo, detalle, accionista, vinculos, titulos = [], acciones, documento, usuario }) {
  const totalAcciones = acciones != null ? acciones : titulos.reduce((s, t) => s + t.tit_acciones, 0);
  const operacion = (await API.graphql({
    query: createOperacion,
    variables: {
      input: {
        ope_fecha: fechaOperacion(),
        ope_tipo: tipo,
        ope_acciones: totalAcciones,
        ope_estado: 0,
        ope_ingresador: usuario,
        ope_aprobador: '',
        ope_fecha_aprobacion: '',
        ope_motivo_rechazo: -1,
        ope_observacion: '',
        ope_documento: documento || '',
      },
    },
  })).data.createOperacion;
  for (const v of vinculos || [{ accionista, detalle }]) {
    await API.graphql({
      query: createAccionistaOperacion,
      variables: { input: { acc_ope_operacion_id: operacion.id, acc_ope_accionista_id: v.accionista.id, acc_ope_detalle: v.detalle } },
    });
  }
  await enLotes(titulos, 25, (t) => API.graphql({
    query: createTituloPorOperacion,
    variables: { input: { tit_ope_titulo_id: t.id, tit_ope_operacion_id: operacion.id, tit_ope_acciones: t.tit_acciones } },
  }));
  return operacion;
}

// Aumento de capital (ope_tipo 0): sin títulos; el blotter crea el título al aprobar, a continuación del último emitido.
export async function solicitarAumentoCapital({ accionista, acciones, valorNominal, documento, usuario }) {
  if (!Number.isInteger(acciones) || acciones <= 0) throw new Error('Ingrese una cantidad de acciones mayor a 0.');
  const operacion = await solicitarOperacion({ tipo: 0, detalle: 'Aumento Capital', accionista, acciones, documento, usuario });
  await API.graphql({
    query: createAumentoCapital,
    variables: { input: { id: operacion.id, aum_cap_valor_nominal: valorNominal, aum_cap_capital: Math.round(acciones * valorNominal * 100) / 100 } },
  });
  return operacion;
}

export function listarHerederosDe(accionistaId) {
  return listarTodos(listHerederos, 'listHerederos', { filter: { her_id_accionisa: { eq: accionistaId } } });
}

/**
 * Posesión efectiva (ope_tipo 6) sobre UN título del causante: el blotter lo reparte entre los herederos según
 * her_cant_acciones (que se guarda aquí). reparto: [{ heredero, acciones }] con la suma igual a las acciones del título.
 */
// Revisa los herederos que ya son accionistas: válidos, con datos básicos y tipo de persona (ver problemasHeredero).
// Devuelve [{ heredero, existe, problemas }] (problemas vacío = puede recibir; existe false = se creará al aprobar).
export async function revisarHerederos(herederos, causanteId) {
  return Promise.all(herederos.map(async (heredero) => {
    const accionista = (await API.graphql({ query: getAccionista, variables: { id: heredero.her_identificacion } })).data.getAccionista;
    let persona = null;
    if (accionista && (accionista.acc_tipo_persona === 0 || accionista.acc_tipo_persona === 1)) {
      const [query, campo] = accionista.acc_tipo_persona === 0 ? [getPersonaNatural, 'getPersonaNatural'] : [getPersonaJuridica, 'getPersonaJuridica'];
      persona = (await API.graphql({ query, variables: { id: accionista.id } })).data[campo];
    }
    return {
      heredero,
      existe: !!accionista,
      problemas: problemasHeredero(accionista, persona, causanteId) || [],
      // Aceptado sin ficha completa: recibe las acciones en estado Heredero.
      fichaIncompleta: !!accionista && problemasFicha(accionista, persona).length > 0,
    };
  }));
}

// Lanza un error con el detalle si algún heredero que ya es accionista no es válido; si todos lo son, devuelve la revisión.
export async function exigirHerederosValidos(herederos, causanteId) {
  const revision = await revisarHerederos(herederos, causanteId);
  const malos = revision.filter((r) => r.problemas.length);
  if (malos.length) {
    const detalle = malos.map((r) => `${r.heredero.her_nombre || r.heredero.her_identificacion} (${r.problemas.join('; ')})`).join(' · ');
    throw new Error(`Herederos que ya son accionistas con datos incompletos o no válidos: ${detalle}. Complete su ficha en Accionistas.`);
  }
  return revision;
}

export async function solicitarPosesionEfectiva({ causante, titulo, reparto, documento, usuario }) {
  await exigirHerederosValidos(reparto.filter((r) => r.acciones > 0).map((r) => r.heredero), causante.id);
  if (await tieneOperacionPendiente(causante.id, 6)) throw new Error('El causante ya tiene una posesión efectiva pendiente de aprobación.');
  if ((await titulosEnOperacionPendiente([titulo])).length) throw new Error(`El título ${titulo.id} ya está en otra operación pendiente.`);
  const operacion = await solicitarOperacion({
    tipo: 6,
    vinculos: [
      { accionista: causante, detalle: 'Cedente' },
      ...reparto.filter((r) => r.acciones > 0).map((r) => ({ accionista: { id: r.heredero.her_identificacion }, detalle: 'Heredero' })),
    ],
    titulos: [titulo],
    acciones: titulo.tit_acciones,
    documento,
    usuario,
  });
  await enLotes(reparto, 10, (r) => API.graphql({ query: updateHeredero, variables: { input: { id: r.heredero.id, her_cant_acciones: r.acciones } } }));
  return operacion;
}
