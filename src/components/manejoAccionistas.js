import {
  getAccionista,
  getConyuge,
  getPersonaJuridica,
  getPersonaNatural
} from '../graphql/queries';
import { API } from 'aws-amplify';
async function validarIdentificacionExiste(idAccionista) {
  var apiData = await API.graphql({ query: getAccionista, variables: { id: idAccionista } });
  var accionistaFinal = apiData.data.getAccionista;
  if (accionistaFinal) return { error: true, mensaje: "El número de identificación ya existe." };
  return { error: false, mensaje: "" };
}
export async function obtenerAccionistaCompleto(idAccionista) {
  var apiData = await API.graphql({ query: getAccionista, variables: { id: idAccionista } });
  var accionistaFinal = apiData.data.getAccionista;
  if (accionistaFinal.acc_tipo_persona == 0) {
    apiData = await API.graphql({ query: getPersonaNatural, variables: { id: idAccionista } });
    accionistaFinal = Object.assign(accionistaFinal, apiData.data.getPersonaNatural);
    if (apiData.data.getPersonaNatural.pn_estado_civil == 1 || apiData.data.getPersonaNatural.pn_estado_civil == 2) {
      apiData = await API.graphql({ query: getConyuge, variables: { id: idAccionista } });
      accionistaFinal = Object.assign(accionistaFinal, apiData.data.getPersonaNatural);
    }
  }
  console.log("accionistaFinal", accionistaFinal);
  if (accionistaFinal.acc_tipo_persona == 1) {
    apiData = await API.graphql({ query: getPersonaJuridica, variables: { id: idAccionista } });
    accionistaFinal = Object.assign(accionistaFinal, apiData.data.getPersonaJuridica);
  }
  return accionistaFinal;
}
export async function validarCampos(accionistaGlobal) {
  var respuesta = validarIdentificacionExiste(accionistaGlobal.acc_identificacion);
  return respuesta;
}
export function verificarCamposVacios(accionistaGlobal, claves) {
  var result = { error: false, mensaje: "" };
  for (let i = 0; i < claves.length; i++) {
    if (!accionistaGlobal[claves[i]] && accionistaGlobal[claves[i]] == "") {
      result.error = true;
      result.mensaje = "Existen campos obligatorios sin datos.";
    }
  }
  return result;
}
export function devolverSoloAccionista(accionista) {
  var accionistaAux = {
      id: accionista.acc_identificacion ? accionista.acc_identificacion : "",
      acc_decevale: accionista.acc_decevale ? accionista.acc_decevale : "",
      acc_estado: accionista.acc_estado ? accionista.acc_estado : 0,
      acc_tipo_identificacion: accionista.acc_tipo_identificacion == null ? 0 : accionista.acc_tipo_identificacion,
      acc_identificacion: accionista.acc_identificacion ? accionista.acc_identificacion : "",
      acc_nacionalidad: accionista.acc_nacionalidad == null ? 'Ecuador' : accionista.acc_nacionalidad,
      acc_residencia: accionista.acc_pais == null ? 'Ecuador' : accionista.acc_pais,
      acc_pais: accionista.acc_pais == null ? 'Ecuador' : accionista.acc_pais,
      acc_provincia: accionista.acc_provincia ? accionista.acc_provincia : "",
      acc_ciudad: accionista.acc_ciudad ? accionista.acc_ciudad : "",
      acc_direccion: accionista.acc_direccion ? accionista.acc_direccion : "",
      acc_dir_numero: accionista.acc_dir_numero ? accionista.acc_dir_numero : "",
      acc_banco: accionista.acc_banco ? accionista.acc_banco : 0,
      acc_tipo_cuenta: accionista.acc_tipo_cuenta ? accionista.acc_tipo_cuenta : 0,
      acc_cuenta_bancaria: accionista.acc_cuenta_bancaria ? accionista.acc_cuenta_bancaria : "",
      acc_doc_certificado_bancario: accionista.acc_doc_certificado_bancario ? accionista.acc_doc_certificado_bancario : "",
      acc_doc_actualizacion_datos: accionista.acc_doc_actualizacion_datos ? accionista.acc_doc_actualizacion_datos : "",
      acc_doc_uso_datos: accionista.acc_doc_uso_datos ? accionista.acc_doc_uso_datos : "",
      acc_doc_posesion_efectiva: accionista.acc_doc_posesion_efectiva ? accionista.acc_doc_posesion_efectiva : "",
      acc_telefonos: accionista.acc_telefonos ? accionista.acc_telefonos : "",
      acc_obs_telefonos: accionista.acc_obs_telefonos ? accionista.acc_obs_telefonos : "",
      acc_correos: accionista.acc_correos ? accionista.acc_correos : "",
      acc_cantidad_acciones: accionista.acc_cantidad_acciones ? accionista.acc_cantidad_acciones : 0,
      acc_participacion: accionista.acc_participacion ? accionista.acc_participacion : 0,
      acc_tipo_acciones: accionista.acc_tipo_acciones == null ? 1 : accionista.acc_tipo_acciones,
      acc_tipo_persona: accionista.acc_tipo_persona == null ? 0 : accionista.acc_tipo_persona,
    acc_nombre_completo: accionista.acc_tipo_persona == 0 ? accionista.pn_primer_nombre + ' ' + accionista.pn_segundo_nombre
      + ' ' + accionista.pn_apellido_paterno + ' ' + accionista.pn_apellido_materno : accionista.pj_razon_social
  }
  return accionistaAux;
}
export function devolverSoloPersonaNatural(accionista) {
  var personaNaturalAux = {
    id: accionista.acc_identificacion ? accionista.acc_identificacion : "",
    pn_primer_nombre: accionista.pn_primer_nombre ? accionista.pn_primer_nombre : "",
    pn_segundo_nombre: accionista.pn_segundo_nombre ? accionista.pn_segundo_nombre : "",
    pn_apellido_paterno: accionista.pn_apellido_paterno ? accionista.pn_apellido_paterno : "",
    pn_apellido_materno: accionista.pn_apellido_materno ? accionista.pn_apellido_materno : "",
    pn_estado_civil: accionista.pn_estado_civil ? accionista.pn_estado_civil : 0,
    pn_doc_identificacion: accionista.pn_doc_identificacion ? accionista.pn_doc_identificacion : "",
  };
  return personaNaturalAux;
}
export function devolverSoloPersonaJuridica(accionista) {
  var personaJuridicaAux = {
    id: accionista.acc_identificacion ? accionista.acc_identificacion : "",
    pj_rl_tipo_identificacion: accionista.pj_rl_tipo_identificacion ? accionista.pj_rl_tipo_identificacion : 0,
    pj_razon_social: accionista.pj_razon_social ? accionista.pj_razon_social : "",
    pj_rl_identificacion: accionista.pj_rl_identificacion ? accionista.pj_rl_identificacion : "",
    pj_rl_nombre: accionista.pj_rl_nombre ? accionista.pj_rl_nombre : "",
    pj_rl_nacionalidad: accionista.pj_rl_nacionalidad ? accionista.pj_rl_nacionalidad : "",
    pj_rl_telefono: accionista.pj_rl_telefono ? accionista.pj_rl_telefono : "",
    pj_rl_email: accionista.pj_rl_email ? accionista.pj_rl_email : "",
    pj_doc_nombramiento: accionista.pj_doc_nombramiento ? accionista.pj_doc_nombramiento : "",
  };
  return personaJuridicaAux;
}
export function devolverSoloConyuge(accionista) {
  var conyugeAux = {
    id: accionista.acc_identificacion ? accionista.acc_identificacion : "",
    con_tipo_identificacion: accionista.con_tipo_identificacion ? accionista.con_tipo_identificacion : 0,
    con_identificacion: accionista.con_identificacion ? accionista.con_identificacion : "",
    con_nombre: accionista.con_nombre ? accionista.con_nombre : "",
    con_nacionalidad: accionista.con_nacionalidad ? accionista.con_nacionalidad : "",
    con_doc_identifcacion: accionista.con_doc_identifcacion ? accionista.con_doc_identifcacion : ""
  };
  return conyugeAux;
}