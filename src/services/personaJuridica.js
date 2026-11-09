import { API } from 'aws-amplify';
import { createAccionista, updateAccionista, createPersonaJuridica, updatePersonaJuridica } from '../graphql/mutations';
import { validarCampos, devolverSoloAccionista, devolverSoloPersonaJuridica } from '../components/manejoAccionistas';

// Crea o actualiza el accionista persona jurídica y su ficha (PersonaJuridica, mismo id = RUC).
export async function guardarPersonaJuridica(datos, edicion) {
  if (!edicion && (await validarCampos(datos)).error) throw new Error('El número de identificación ya existe.');
  const accionista = {
    ...devolverSoloAccionista(datos),
    acc_tipo_persona: 1,
    acc_tipo_identificacion: 1, // RUC
    acc_nombre_completo: (datos.pj_razon_social || '').trim(),
  };
  await API.graphql({ query: edicion ? updateAccionista : createAccionista, variables: { input: accionista } });
  await API.graphql({ query: edicion ? updatePersonaJuridica : createPersonaJuridica, variables: { input: devolverSoloPersonaJuridica(datos) } });
}
