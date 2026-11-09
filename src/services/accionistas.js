import { API } from 'aws-amplify';
import { listAccionistas, listPersonaNaturals, listPersonaJuridicas, listTitulos, getParametro, getConyuge } from '../graphql/queries';
import { listarTodos } from './listarTodos';
import { combinarAccionistas } from '../utils/accionistas';
import { ID_TITULO_RAIZ } from '../utils/rangos';

// Carga una sola vez todos los accionistas (con su ficha PN/PJ) y los parámetros; el filtro por estado es local.
export async function cargarAccionistas() {
  const [accionistas, naturales, juridicas, parametro] = await Promise.all([
    listarTodos(listAccionistas, 'listAccionistas'),
    listarTodos(listPersonaNaturals, 'listPersonaNaturals'),
    listarTodos(listPersonaJuridicas, 'listPersonaJuridicas'),
    API.graphql({ query: getParametro, variables: { id: '1' } }),
  ]);
  return { accionistas: combinarAccionistas(accionistas, naturales, juridicas), parametro: parametro.data.getParametro };
}

// Títulos vigentes del accionista (activos y bloqueados) y, si es casado o en unión de hecho, su cónyuge.
export async function cargarDetalle(accionista) {
  const conConyuge = accionista.acc_tipo_persona === 0 && [1, 2].includes(Number(accionista.pn_estado_civil));
  const [titulos, conyuge] = await Promise.all([
    listarTodos(listTitulos, 'listTitulos', { filter: { tit_accionista_id: { eq: accionista.id } } }),
    conConyuge ? API.graphql({ query: getConyuge, variables: { id: accionista.id } }).then((r) => r.data.getConyuge) : null,
  ]);
  return {
    titulos: titulos.filter((t) => t.id !== ID_TITULO_RAIZ && t.tit_acciones > 0).sort((a, b) => a.tit_desde - b.tit_desde),
    conyuge,
  };
}
