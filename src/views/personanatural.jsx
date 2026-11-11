import React, { useState, useEffect } from 'react';
import { TextField, Grid, Switch, FormControlLabel, Typography } from '@material-ui/core';
import {
  useFormularioAccionista, PaginaFormulario, Seccion, SeccionDireccion, SeccionBanco, SeccionContacto, SeccionDocumentos,
  ListaDinamica, cambiarLista, quitarDeLista, camposBaseAccionista, TIPOS_ACCIONES, TIPOS_IDENTIFICACION_PERSONA,
} from '../components/formularioAccionista';
import { cargarRelacionados, guardarPersonaNatural, tieneConyuge } from '../services/personaNatural';
import { ESTADOS_CIVILES } from '../utils/accionistas';

const OBLIGATORIOS = ['acc_decevale', 'acc_identificacion', 'pn_primer_nombre', 'pn_apellido_paterno'];
const MAX_HEREDEROS = 9;
const DOCUMENTOS = [
  ['pn_doc_identificacion', 'Documento de identidad'],
  ['acc_doc_certificado_bancario', 'Certificado bancario'],
  ['acc_doc_actualizacion_datos', 'Carta de actualización de datos'],
  ['acc_doc_uso_datos', 'Autorización para uso de datos'],
  ['acc_doc_posesion_efectiva', 'Posesión efectiva'],
];
const ESTADOS_CIVILES_OPCIONES = Object.entries(ESTADOS_CIVILES).map(([valor, etiqueta]) => ({ valor, etiqueta }));

const formularioVacio = () => ({
  ...camposBaseAccionista(),
  acc_tipo_persona: 0, acc_tipo_identificacion: 0,
  pn_primer_nombre: '', pn_segundo_nombre: '', pn_apellido_paterno: '', pn_apellido_materno: '', pn_estado_civil: '0', pn_doc_identificacion: '',
  con_tipo_identificacion: 0, con_identificacion: '', con_nombre: '', con_nacionalidad: 'Ecuador', con_doc_identifcacion: '',
});
const herederoVacio = () => ({ her_identificacion: '', her_nombre: '' });

export default function PersonaNatural() {
  const f = useFormularioAccionista({ vacio: formularioVacio, obligatorios: OBLIGATORIOS });
  const [conHerederos, setConHerederos] = useState(!!(f.precargado && f.precargado.acc_tiene_herederos));
  const [herederos, setHerederos] = useState([herederoVacio()]);
  const conConyuge = tieneConyuge(f.form.pn_estado_civil);

  // Al editar: cónyuge y herederos guardados (una sola vez).
  useEffect(() => {
    if (!f.edicion) return;
    f.ejecutar(async () => {
      const { conyuge, herederos: guardados } = await cargarRelacionados(f.precargado);
      if (conyuge) f.setForm((actual) => ({ ...actual, ...conyuge, id: actual.id }));
      if (guardados.length) setHerederos(guardados.map((h) => ({ her_identificacion: h.her_identificacion || '', her_nombre: h.her_nombre || '' })));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const limpiar = () => {
    f.limpiar();
    setConHerederos(false);
    setHerederos([herederoVacio()]);
  };

  const guardar = () => {
    const datos = f.datosValidos();
    if (!datos) return;
    f.ejecutar(async () => {
      await guardarPersonaNatural(datos, conHerederos ? herederos : [], f.edicion);
      if (!f.edicion) limpiar();
      f.exito(f.edicion ? 'Se actualizó el accionista correctamente.' : 'Se registró el accionista correctamente.');
    });
  };

  return (
    <PaginaFormulario f={{ ...f, limpiar }} titulo="Persona natural" onGuardar={guardar}>
      <Grid item xs={12}>
        <Seccion titulo="Información básica">
          {f.campo('acc_decevale', 'Decevale', { sm: 3 })}
          {f.seleccion('acc_tipo_identificacion', 'Tipo de identificación', TIPOS_IDENTIFICACION_PERSONA, { sm: 3 })}
          {/* La identificación es el id del accionista: no se cambia al editar. */}
          {f.campo('acc_identificacion', 'Identificación', { sm: 3, disabled: f.edicion, ayuda: f.edicion ? 'No editable' : undefined })}
          {f.pais('acc_nacionalidad', 'Nacionalidad', { sm: 3 })}
          {f.campo('pn_primer_nombre', 'Primer nombre', { sm: 3 })}
          {f.campo('pn_segundo_nombre', 'Segundo nombre', { sm: 3 })}
          {f.campo('pn_apellido_paterno', 'Apellido paterno', { sm: 3 })}
          {f.campo('pn_apellido_materno', 'Apellido materno', { sm: 3 })}
          {f.seleccion('pn_estado_civil', 'Estado civil', ESTADOS_CIVILES_OPCIONES, { sm: 3 })}
          {f.seleccion('acc_tipo_acciones', 'Tipo de acciones', TIPOS_ACCIONES, { sm: 3 })}
        </Seccion>
      </Grid>

      {conConyuge && (
        <Grid item xs={12} md={6}>
          <Seccion titulo="Cónyuge">
            {f.seleccion('con_tipo_identificacion', 'Tipo de identificación', TIPOS_IDENTIFICACION_PERSONA)}
            {f.campo('con_identificacion', 'Identificación')}
            {f.campo('con_nombre', 'Nombre')}
            {f.pais('con_nacionalidad', 'Nacionalidad')}
          </Seccion>
        </Grid>
      )}

      <Grid item xs={12} md={6}><SeccionDireccion f={f} /></Grid>
      <Grid item xs={12} md={6}><SeccionBanco f={f} /></Grid>
      <Grid item xs={12} md={6}><SeccionContacto f={f} /></Grid>
      <Grid item xs={12} md={6}>
        <SeccionDocumentos f={f} documentos={conConyuge ? [...DOCUMENTOS, ['con_doc_identifcacion', 'Documento de identidad del cónyuge']] : DOCUMENTOS} />
      </Grid>

      <Grid item xs={12} md={6}>
        <Seccion
          titulo="Herederos"
          accion={<FormControlLabel control={<Switch color="primary" checked={conHerederos} onChange={(e) => setConHerederos(e.target.checked)} />} label="Tiene herederos" />}
        >
          {conHerederos ? (
            <ListaDinamica
              items={herederos} max={MAX_HEREDEROS} textoAgregar="Agregar heredero"
              onAgregar={() => setHerederos([...herederos, herederoVacio()])}
              onQuitar={(i) => quitarDeLista(setHerederos, i, herederoVacio)}
              renderFila={(h, i) => (
                <>
                  <TextField size="small" variant="outlined" label="Identificación" value={h.her_identificacion} style={{ width: 170 }}
                    onChange={(e) => cambiarLista(setHerederos, i, { her_identificacion: e.target.value })} />
                  <TextField size="small" variant="outlined" label="Nombre" value={h.her_nombre} fullWidth
                    onChange={(e) => cambiarLista(setHerederos, i, { her_nombre: e.target.value })} />
                </>
              )}
            />
          ) : (
            <Grid item xs={12}><Typography variant="body2" color="textSecondary">Sin herederos registrados.</Typography></Grid>
          )}
        </Seccion>
      </Grid>
    </PaginaFormulario>
  );
}
