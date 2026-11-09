import { API } from 'aws-amplify';
import { listAsambleas, listAccionistas, getAccionista, getParametro } from '../graphql/queries';
import {
  createAsamblea, updateAsamblea, createAccionistasxJunta, updateAccionistasxJunta, deleteAccionistasxJunta,
} from '../graphql/mutations';
import { listarTodos } from './listarTodos';
import { votosIniciales } from '../utils/asambleas';

const CAMPOS_REGISTRO = `id asambleaID accionistaID identificacion nombre acciones estado presente horaLlegada
  representanteNombre representanteDocumento representanteDI
  votacion1 votacion2 votacion3 votacion4 votacion5 votacion6 votacion7 votacion8 votacion9 votacion10`;

// Consulta por el índice byAsamblea (antes se recorría toda la tabla con un filtro).
const registrosByAsamblea = /* GraphQL */ `
  query AccionistasxJuntaByAsamblea($asambleaID: ID!, $limit: Int, $nextToken: String) {
    accionistasxJuntaByAsamblea(asambleaID: $asambleaID, limit: $limit, nextToken: $nextToken) {
      items { ${CAMPOS_REGISTRO} }
      nextToken
    }
  }
`;

export async function cargarInicio() {
  const [parametro, asambleas, activos] = await Promise.all([
    API.graphql({ query: getParametro, variables: { id: '1' } }),
    listarTodos(listAsambleas, 'listAsambleas'),
    // Solo accionistas activos con acciones (lista para registrar asistencia).
    listarTodos(listAccionistas, 'listAccionistas', { filter: { acc_estado: { eq: 1 }, acc_cantidad_acciones: { gt: 0 } } }),
  ]);
  return { parametro: parametro.data.getParametro, asambleas, activos };
}

export function cargarRegistros(asambleaID) {
  return listarTodos(registrosByAsamblea, 'accionistasxJuntaByAsamblea', { asambleaID });
}

export async function crearAsamblea(input) {
  return (await API.graphql({ query: createAsamblea, variables: { input } })).data.createAsamblea;
}

export async function actualizarAsamblea(id, cambios) {
  await API.graphql({ query: updateAsamblea, variables: { input: { id, ...cambios } } });
  return cambios;
}

// Crea el registro de asistencia (si la fila es virtual) o actualiza el existente. Devuelve el registro.
export async function guardarRegistro(asamblea, item, cambios) {
  if (!asamblea || !asamblea.id || !item || (item.virtual ? !item.accionistaID : !item.id)) {
    throw new Error('No se pudo identificar la asamblea o el accionista del registro.');
  }
  if (item.virtual) {
    const input = {
      asambleaID: asamblea.id,
      accionistaID: item.accionistaID,
      nombre: item.nombre,
      identificacion: item.identificacion,
      acciones: item.acciones,
      estado: item.estado != null ? String(item.estado) : '',
      presente: false,
      representanteNombre: '',
      representanteDocumento: '',
      representanteDI: '',
      ...votosIniciales(asamblea),
      ...cambios,
    };
    const creado = (await API.graphql({ query: createAccionistasxJunta, variables: { input } })).data.createAccionistasxJunta;
    return { ...input, ...creado, virtual: false };
  }
  await API.graphql({ query: updateAccionistasxJunta, variables: { input: { id: item.id, ...cambios } } });
  return { ...item, ...cambios };
}

export async function eliminarRegistro(id) {
  await API.graphql({ query: deleteAccionistasxJunta, variables: { input: { id } } });
}

export { subirArchivo, abrirArchivo } from './archivos';

// Dashboard del accionista: su ficha, parámetros y las convocatorias abiertas con su registro (si existe).
export async function cargarDashboardAccionista(id) {
  const [accionista, parametro, convocatorias] = await Promise.all([
    API.graphql({ query: getAccionista, variables: { id } }),
    API.graphql({ query: getParametro, variables: { id: '1' } }),
    listarTodos(listAsambleas, 'listAsambleas', { filter: { estado: { eq: 'Convocatoria' } } }),
  ]);
  const asambleas = await Promise.all(convocatorias.map(async (asamblea) => ({
    ...asamblea,
    registro: (await cargarRegistros(asamblea.id)).find((r) => r.accionistaID === id) || null,
  })));
  return { accionista: accionista.data.getAccionista, parametro: parametro.data.getParametro, asambleas };
}

// Pre-registro del accionista en una convocatoria (con representante opcional). No lo marca presente.
export function registrarEnAsamblea(asamblea, accionista, representante) {
  const item = asamblea.registro || {
    virtual: true,
    accionistaID: accionista.id,
    nombre: accionista.acc_nombre_completo || '',
    identificacion: accionista.acc_identificacion || accionista.id,
    acciones: accionista.acc_cantidad_acciones || 0,
    estado: accionista.acc_estado,
  };
  return guardarRegistro(asamblea, item, representante);
}
