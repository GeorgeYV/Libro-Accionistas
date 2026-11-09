import React from 'react';
import { Grid } from '@material-ui/core';
import {
  useFormularioAccionista, PaginaFormulario, Seccion, SeccionDireccion, SeccionBanco, SeccionContacto, SeccionDocumentos,
  camposBaseAccionista, PAISES, TIPOS_ACCIONES, TIPOS_IDENTIFICACION_PERSONA,
} from '../components/formularioAccionista';
import { guardarPersonaJuridica } from '../services/personaJuridica';

const OBLIGATORIOS = ['acc_decevale', 'acc_identificacion', 'pj_razon_social'];
const DOCUMENTOS = [
  ['pj_doc_nombramiento', 'Nombramiento del representante legal'],
  ['acc_doc_certificado_bancario', 'Certificado bancario'],
  ['acc_doc_actualizacion_datos', 'Carta de actualización de datos'],
  ['acc_doc_uso_datos', 'Autorización para uso de datos'],
];

const formularioVacio = () => ({
  ...camposBaseAccionista(),
  acc_tipo_persona: 1, acc_tipo_identificacion: 1, // RUC
  pj_razon_social: '', pj_doc_nombramiento: '',
  pj_rl_tipo_identificacion: 0, pj_rl_identificacion: '', pj_rl_nombre: '', pj_rl_nacionalidad: 'Ecuador', pj_rl_telefono: '', pj_rl_email: '',
});

export default function PersonaJuridica() {
  const f = useFormularioAccionista({ vacio: formularioVacio, obligatorios: OBLIGATORIOS });

  const guardar = () => {
    const datos = f.datosValidos();
    if (!datos) return;
    f.ejecutar(async () => {
      await guardarPersonaJuridica(datos, f.edicion);
      if (!f.edicion) f.limpiar();
      f.exito(f.edicion ? 'Se actualizó el accionista correctamente.' : 'Se registró el accionista correctamente.');
    });
  };

  return (
    <PaginaFormulario f={f} titulo="Persona jurídica" onGuardar={guardar}>
      <Grid item xs={12}>
        <Seccion titulo="Información básica">
          {f.campo('acc_decevale', 'Decevale', { sm: 3 })}
          {f.seleccion('acc_tipo_identificacion', 'Tipo de identificación', [{ valor: 1, etiqueta: 'RUC' }], { sm: 3 })}
          {/* El RUC es el id del accionista: no se cambia al editar. */}
          {f.campo('acc_identificacion', 'RUC', { sm: 3, disabled: f.edicion, ayuda: f.edicion ? 'No editable' : undefined })}
          {f.seleccion('acc_nacionalidad', 'Nacionalidad', PAISES, { sm: 3 })}
          {f.campo('pj_razon_social', 'Razón social', { sm: 9 })}
          {f.seleccion('acc_tipo_acciones', 'Tipo de acciones', TIPOS_ACCIONES, { sm: 3 })}
        </Seccion>
      </Grid>

      <Grid item xs={12} md={6}>
        <Seccion titulo="Representante legal">
          {f.seleccion('pj_rl_tipo_identificacion', 'Tipo de identificación', TIPOS_IDENTIFICACION_PERSONA)}
          {f.campo('pj_rl_identificacion', 'Identificación')}
          {f.campo('pj_rl_nombre', 'Nombre completo', { sm: 12 })}
          {f.seleccion('pj_rl_nacionalidad', 'Nacionalidad', PAISES)}
          {f.campo('pj_rl_telefono', 'Teléfono')}
          {f.campo('pj_rl_email', 'Correo electrónico', { sm: 12, type: 'email' })}
        </Seccion>
      </Grid>
      <Grid item xs={12} md={6}><SeccionDireccion f={f} /></Grid>
      <Grid item xs={12} md={6}><SeccionBanco f={f} /></Grid>
      <Grid item xs={12} md={6}><SeccionContacto f={f} /></Grid>
      <Grid item xs={12} md={6}><SeccionDocumentos f={f} documentos={DOCUMENTOS} /></Grid>
    </PaginaFormulario>
  );
}
