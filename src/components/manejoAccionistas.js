import {
  getAccionista,
  getConyuge,
  getPersonaJuridica,
  getPersonaNatural
} from '../graphql/queries';
import { API } from 'aws-amplify';

export async function obtenerAccionistaCompleto(idAccionista) {
  var apiData = await API.graphql({ query: getAccionista, variables: { id: idAccionista } });
  var accionistaFinal = apiData.data.getAccionista;
  if (accionistaFinal.acc_tipo_persona == 0) {
    apiData = await API.graphql({ query: getPersonaNatural, variables: { id: idAccionista } });
    accionistaFinal = Object.assign(accionistaFinal, apiData.data.getPersonaNatural);
    console.log("getPersonaNatural",apiData)
    if (apiData.data.getPersonaNatural.pn_estado_civil == 1 || apiData.data.getPersonaNatural.pn_estado_civil == 2) {
      apiData = await API.graphql({ query: getConyuge, variables: { id: idAccionista } });
      accionistaFinal = Object.assign(accionistaFinal, apiData.data.getPersonaNatural);
    }
  }
  if (accionistaFinal.acc_tipo_persona == 1) {
    apiData = await API.graphql({ query: getPersonaJuridica, variables: { id: idAccionista } });
    accionistaFinal = Object.assign(accionistaFinal, apiData.data.getPersonaJuridica);
  }
  return accionistaFinal;
}