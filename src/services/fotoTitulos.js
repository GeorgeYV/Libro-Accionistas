import { API } from 'aws-amplify';
import { listTitulos, listAccionistas, titulosxJuntaByAsamblea } from '../graphql/queries';
import { createTituloxJunta, deleteTituloxJunta } from '../graphql/mutations';
import { listarTodos } from './listarTodos';
import { ID_TITULO_RAIZ } from '../utils/rangos';

// Ejecuta fn sobre items en lotes, esperando cada lote (evita miles de requests simultáneos).
export async function enLotes(items, tamano, fn) {
  const resultados = [];
  for (let i = 0; i < items.length; i += tamano) {
    resultados.push(...await Promise.all(items.slice(i, i + tamano).map(fn)));
  }
  return resultados;
}

export function obtenerFotoTitulos(asambleaID) {
  return listarTodos(titulosxJuntaByAsamblea, 'titulosxJuntaByAsamblea', { asambleaID });
}

// Guarda la foto de títulos vigentes de la asamblea.
// accionistaIDs: lista de accionistas a incluir; null = todo el libro (incluye bloqueados).
// No duplica títulos que ya estén en la foto. Devuelve cuántos registros creó.
export async function guardarFotoTitulos(asambleaID, accionistaIDs = null) {
  const [titulos, accionistas, existentes] = await Promise.all([
    listarTodos(listTitulos, 'listTitulos'),
    listarTodos(listAccionistas, 'listAccionistas'),
    obtenerFotoTitulos(asambleaID),
  ]);
  const estadoAccionista = new Map(accionistas.map((a) => [a.id, a.acc_estado]));
  const yaGuardados = new Set(existentes.map((f) => f.tituloID));
  const incluir = accionistaIDs ? new Set(accionistaIDs) : null;

  const nuevos = titulos.filter((t) =>
    t.id !== ID_TITULO_RAIZ &&
    t.tit_acciones > 0 &&
    estadoAccionista.has(t.tit_accionista_id) &&
    (!incluir || incluir.has(t.tit_accionista_id)) &&
    !yaGuardados.has(t.id));

  await enLotes(nuevos, 25, (t) => API.graphql({
    query: createTituloxJunta,
    variables: {
      input: {
        asambleaID,
        accionistaID: t.tit_accionista_id,
        tituloID: t.id,
        desde: t.tit_desde,
        hasta: t.tit_hasta,
        acciones: t.tit_acciones,
        tituloEstado: t.tit_estado,
        accionistaEstado: estadoAccionista.get(t.tit_accionista_id),
      },
    },
  }));
  return nuevos.length;
}

export async function borrarFotoAccionista(asambleaID, accionistaID) {
  const foto = await obtenerFotoTitulos(asambleaID);
  const delAccionista = foto.filter((f) => f.accionistaID === accionistaID);
  await enLotes(delAccionista, 25, (f) => API.graphql({ query: deleteTituloxJunta, variables: { input: { id: f.id } } }));
  return delAccionista.length;
}
