// Certificados de acciones: emisión, verificación pública por id e invalidación al cambiar las acciones.
import { API } from 'aws-amplify';
import { listarTodos } from './listarTodos';
import { enLotes } from './fotoTitulos';
import { fechaOperacion } from './operaciones';
import { enmascarar } from '../utils/certificados';

const crearCertificado = /* GraphQL */ `
  mutation CrearCertificado($input: CreateCertificadoInput!) { createCertificado(input: $input) { id } }
`;
const actualizarCertificado = /* GraphQL */ `
  mutation ActualizarCertificado($input: UpdateCertificadoInput!) { updateCertificado(input: $input) { id } }
`;
// Solo los campos que muestra la página pública.
const leerCertificado = /* GraphQL */ `
  query LeerCertificado($id: ID!) {
    getCertificado(id: $id) {
      id cer_nombre cer_identificacion cer_acciones cer_valor_nominal cer_fecha_emision cer_estado cer_fecha_baja
    }
  }
`;
const certificadosDeAccionista = /* GraphQL */ `
  query CertificadosByAccionista($cer_accionista_id: String!, $limit: Int, $nextToken: String) {
    certificadosByAccionista(cer_accionista_id: $cer_accionista_id, limit: $limit, nextToken: $nextToken) {
      items { id cer_estado }
      nextToken
    }
  }
`;

export const urlVerificacion = (id) => `${window.location.origin}/verificar/${id}`;

// Registra el certificado antes de imprimirlo; su id va en el QR.
export async function emitirCertificado(accionista, parametro, emisor) {
  const input = {
    cer_accionista_id: accionista.id,
    cer_nombre: accionista.acc_nombre_completo || '',
    cer_identificacion: enmascarar(accionista.acc_identificacion || accionista.id),
    cer_acciones: accionista.acc_cantidad_acciones || 0,
    cer_valor_nominal: parametro.valorNominal,
    cer_fecha_emision: fechaOperacion(),
    cer_emisor: emisor || '',
    cer_estado: 'Vigente',
  };
  return (await API.graphql({ query: crearCertificado, variables: { input } })).data.createCertificado.id;
}

// Una sola lectura por clave; el resultado se guarda en la pestaña para no repetir la consulta al recargar.
export async function verificarCertificado(id) {
  const clave = `certificado-${id}`;
  try {
    const guardado = sessionStorage.getItem(clave);
    if (guardado) return JSON.parse(guardado);
  } catch (e) { /* sin sessionStorage (navegación privada): se consulta igual */ }
  const certificado = (await API.graphql({ query: leerCertificado, variables: { id } })).data.getCertificado;
  try { sessionStorage.setItem(clave, JSON.stringify(certificado)); } catch (e) { /* idem */ }
  return certificado;
}

// Quita la vigencia a los certificados vigentes de esos accionistas. Devuelve cuántos cambió.
export async function invalidarCertificados(accionistaIds, motivo) {
  const vigentes = (await Promise.all(accionistaIds.map((id) => listarTodos(certificadosDeAccionista, 'certificadosByAccionista', { cer_accionista_id: id }))))
    .flat()
    .filter((c) => c.cer_estado === 'Vigente');
  const fecha = fechaOperacion();
  await enLotes(vigentes, 25, (c) => API.graphql({
    query: actualizarCertificado,
    variables: { input: { id: c.id, cer_estado: 'SinVigencia', cer_fecha_baja: fecha, cer_motivo_baja: motivo } },
  }));
  return vigentes.length;
}
