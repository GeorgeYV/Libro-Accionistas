import { API } from 'aws-amplify';
import { getConyuge, listHerederos } from '../graphql/queries';
import {
  createAccionista, updateAccionista, createPersonaNatural, updatePersonaNatural, createConyuge, updateConyuge,
  createHeredero, updateHeredero, deleteHeredero,
} from '../graphql/mutations';
import { listarTodos } from './listarTodos';
import { enLotes } from './fotoTitulos';
import {
  validarCampos, devolverSoloAccionista, devolverSoloConyuge, devolverSoloPersonaNatural,
} from '../components/manejoAccionistas';
import { planHerederos } from '../utils/accionistas';

export const tieneConyuge = (estadoCivil) => ['1', '2'].includes(String(estadoCivil)); // casado o unión de hecho

const listarHerederos = (idAccionista) =>
  listarTodos(listHerederos, 'listHerederos', { filter: { her_id_accionisa: { eq: idAccionista } } });

// Al editar: cónyuge (si aplica) y herederos registrados.
export async function cargarRelacionados(accionista) {
  const [conyuge, herederos] = await Promise.all([
    tieneConyuge(accionista.pn_estado_civil)
      ? API.graphql({ query: getConyuge, variables: { id: accionista.id } }).then((r) => r.data.getConyuge)
      : null,
    accionista.acc_tiene_herederos ? listarHerederos(accionista.id) : [],
  ]);
  return { conyuge, herederos };
}

/**
 * Crea o actualiza el accionista persona natural con su ficha, cónyuge y herederos.
 * datos: formulario completo (campos acc_*, pn_*, con_*); herederos: [{ her_identificacion, her_nombre }].
 */
export async function guardarPersonaNatural(datos, herederos, edicion) {
  if (!edicion && (await validarCampos(datos)).error) throw new Error('El número de identificación ya existe.');

  const id = datos.acc_identificacion;
  const plan = planHerederos(edicion ? await listarHerederos(id) : [], herederos);
  const nombre = [datos.pn_primer_nombre, datos.pn_segundo_nombre, datos.pn_apellido_paterno, datos.pn_apellido_materno]
    .map((p) => (p || '').trim()).filter(Boolean).join(' ');
  const accionista = { ...devolverSoloAccionista(datos), acc_tipo_persona: 0, acc_nombre_completo: nombre, acc_tiene_herederos: plan.total > 0 };
  const persona = devolverSoloPersonaNatural(datos);

  await API.graphql({ query: edicion ? updateAccionista : createAccionista, variables: { input: accionista } });
  await API.graphql({ query: edicion ? updatePersonaNatural : createPersonaNatural, variables: { input: persona } });

  if (tieneConyuge(persona.pn_estado_civil)) {
    const conyuge = devolverSoloConyuge(datos);
    // Puede no existir aún (p. ej. pasó de soltero a casado al editar).
    const existe = edicion && (await API.graphql({ query: getConyuge, variables: { id } })).data.getConyuge;
    await API.graphql({ query: existe ? updateConyuge : createConyuge, variables: { input: conyuge } });
  }

  await enLotes(plan.eliminar, 10, (hid) => API.graphql({ query: deleteHeredero, variables: { input: { id: hid } } }));
  await enLotes(plan.actualizar, 10, (input) => API.graphql({ query: updateHeredero, variables: { input } }));
  await enLotes(plan.crear, 10, (h) => API.graphql({ query: createHeredero, variables: { input: { ...h, her_id_accionisa: id } } }));
}
