// Piezas compartidas por los formularios de persona natural y persona jurídica.
import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import {
  Paper, TextField, Button, Typography, MenuItem, Grid, IconButton, Snackbar, Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';
import { Autocomplete } from '@material-ui/lab';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import PageviewIcon from '@material-ui/icons/Pageview';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { subirArchivo, abrirArchivo } from '../services/archivos';
import { verificarCamposVacios } from './manejoAccionistas';
import { filasContacto, unirContacto, separar, conValorActual } from '../utils/accionistas';
import Cargando from './cargando';
import { nombresPaises, PAISES_RESPALDO } from '../services/paises';

export const TIPOS_CUENTA = ['Cta Aho', 'Cta Cte'];
export const TIPOS_ACCIONES = [{ valor: 0, etiqueta: 'Ordinaria' }, { valor: 1, etiqueta: 'Desmaterializada' }];
export const TIPOS_IDENTIFICACION_PERSONA = [{ valor: 0, etiqueta: 'Cédula' }, { valor: 2, etiqueta: 'Pasaporte' }];
const MAX_CONTACTOS = 3;

// Campos comunes a todo accionista (Accionista) con sus valores iniciales.
export const camposBaseAccionista = () => ({
  acc_decevale: '', acc_estado: 1, acc_identificacion: '', acc_nacionalidad: 'Ecuador', acc_pais: 'Ecuador', acc_provincia: '',
  acc_ciudad: '', acc_direccion: '', acc_dir_numero: '', acc_banco: '', acc_tipo_cuenta: '', acc_cuenta_bancaria: '',
  acc_doc_certificado_bancario: '', acc_doc_actualizacion_datos: '', acc_doc_uso_datos: '', acc_doc_posesion_efectiva: '',
  acc_cantidad_acciones: 0, acc_participacion: 0, acc_tipo_acciones: 1,
});

const useStyles = makeStyles((theme) => ({
  appBarSpacer: { ...theme.mixins.toolbar },
  content: { flexGrow: 1, padding: theme.spacing(2), paddingBottom: theme.spacing(10) },
  encabezado: { display: 'flex', alignItems: 'center', gap: theme.spacing(1), marginBottom: theme.spacing(2) },
  seccion: { padding: theme.spacing(2), height: '100%' },
  tituloSeccion: { marginBottom: theme.spacing(2), color: theme.palette.text.primary },
  acciones: {
    position: 'sticky', bottom: 0, display: 'flex', justifyContent: 'flex-end', gap: theme.spacing(1),
    padding: theme.spacing(1.5, 2), marginTop: theme.spacing(2), backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`, zIndex: 1,
  },
}));

// Edita la posición i de una lista (objeto: mezcla; texto: reemplaza) o la quita dejando al menos una fila vacía.
export const cambiarLista = (setter, i, cambios) =>
  setter((lista) => lista.map((x, j) => (j === i ? (typeof x === 'string' ? cambios : { ...x, ...cambios }) : x)));
export const quitarDeLista = (setter, i, vacio) =>
  setter((lista) => (lista.length > 1 ? lista.filter((_, j) => j !== i) : [vacio()]));

/**
 * Estado y helpers del formulario: valores, contactos, validación, subida de documentos y mensajes.
 * vacio: () => valores iniciales; obligatorios: campos requeridos.
 */
export function useFormularioAccionista({ vacio, obligatorios }) {
  const history = useHistory();
  const location = useLocation();
  const precargado = location.state && location.state.preloadedValue;
  const edicion = !!precargado;

  const [form, setForm] = useState(() => ({ ...vacio(), ...(precargado || {}) }));
  const [telefonos, setTelefonos] = useState(() => {
    const filas = precargado ? filasContacto(precargado.acc_telefonos, precargado.acc_obs_telefonos) : [];
    return filas.length ? filas.slice(0, MAX_CONTACTOS) : [{ numero: '', obs: '' }];
  });
  const [correos, setCorreos] = useState(() => {
    const lista = precargado ? separar(precargado.acc_correos) : [];
    return lista.length ? lista.slice(0, MAX_CONTACTOS) : [''];
  });
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto, volver }
  const [paises, setPaises] = useState(PAISES_RESPALDO);

  // Catálogo de países (una carga por sesión); si falla, queda la lista anterior.
  useEffect(() => {
    let vigente = true;
    nombresPaises().then((lista) => { if (vigente) setPaises(lista); });
    return () => { vigente = false; };
  }, []);

  async function ejecutar(fn) {
    setCargando(true);
    try {
      await fn();
    } catch (err) {
      console.log('Error en formulario de accionista:', err);
      setMensaje({ tipo: 'error', texto: err.message || (err.errors && err.errors[0] && err.errors[0].message) || 'No se pudo guardar el accionista.' });
    }
    setCargando(false);
  }

  const valor = (nombre) => (form[nombre] == null ? '' : form[nombre]);
  const cambiar = (nombre) => (e) => setForm({ ...form, [nombre]: e.target.value });
  const faltante = (nombre) => enviado && obligatorios.includes(nombre) && String(valor(nombre)).trim() === '';

  const campo = (nombre, etiqueta, props = {}) => (
    <Grid item xs={12} sm={props.sm || 6}>
      <TextField
        fullWidth size="small" variant="outlined" label={etiqueta} value={valor(nombre)} onChange={cambiar(nombre)} type={props.type}
        required={obligatorios.includes(nombre)} error={faltante(nombre)} helperText={faltante(nombre) ? 'Obligatorio' : props.ayuda}
        disabled={props.disabled}
      />
    </Grid>
  );
  // opciones: [{ valor, etiqueta }] o lista de textos (se agrega el valor actual si es un dato antiguo fuera de la lista).
  const seleccion = (nombre, etiqueta, opciones, props = {}) => {
    const lista = typeof opciones[0] === 'string'
      ? conValorActual(opciones, form[nombre]).map((v) => ({ valor: v, etiqueta: v }))
      : opciones;
    return (
      <Grid item xs={12} sm={props.sm || 6}>
        <TextField select fullWidth size="small" variant="outlined" label={etiqueta} value={valor(nombre)} onChange={cambiar(nombre)}>
          {lista.map((o) => <MenuItem key={String(o.valor)} value={o.valor}>{o.etiqueta}</MenuItem>)}
        </TextField>
      </Grid>
    );
  };

  // Selector de país con búsqueda. Guarda el nombre del país; un valor antiguo fuera del catálogo se conserva.
  const pais = (nombre, etiqueta, props = {}) => (
    <Grid item xs={12} sm={props.sm || 6}>
      <Autocomplete
        size="small" options={conValorActual(paises, form[nombre])} value={form[nombre] || null} noOptionsText="Sin coincidencias"
        onChange={(e, v) => setForm((f) => ({ ...f, [nombre]: v || '' }))}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label={etiqueta} required={obligatorios.includes(nombre)}
            error={faltante(nombre)} helperText={faltante(nombre) ? 'Obligatorio' : props.ayuda} />
        )}
      />
    </Grid>
  );

  const subir = (nombre) => (e) => {
    const archivo = e.target.files[0];
    e.target.value = '';
    if (archivo) ejecutar(async () => { const clave = await subirArchivo(archivo); setForm((f) => ({ ...f, [nombre]: clave })); });
  };
  const ver = (nombre) => ejecutar(() => abrirArchivo(form[nombre]));

  const limpiar = () => {
    setForm(vacio());
    setTelefonos([{ numero: '', obs: '' }]);
    setCorreos(['']);
    setEnviado(false);
  };

  // Valida obligatorios y devuelve los datos listos para guardar (contactos unidos con "&"), o null.
  const datosValidos = () => {
    setEnviado(true);
    if (verificarCamposVacios(form, obligatorios).error) {
      setMensaje({ tipo: 'error', texto: 'Existen campos obligatorios sin datos.' });
      return null;
    }
    const contacto = unirContacto(telefonos);
    return {
      ...form,
      acc_telefonos: contacto.telefonos,
      acc_obs_telefonos: contacto.observaciones,
      acc_correos: correos.map((c) => c.trim()).filter(Boolean).join('&'),
    };
  };

  const exito = (texto) => setMensaje({ tipo: 'success', texto, volver: true });
  const cerrarMensaje = (e, razon) => {
    if (razon === 'clickaway') return;
    const volver = mensaje && mensaje.volver;
    setMensaje(null);
    if (volver) history.push('/accionistas');
  };

  return {
    history, precargado, edicion, form, setForm, telefonos, setTelefonos, correos, setCorreos, cargando, mensaje,
    ejecutar, campo, seleccion, pais, subir, ver, limpiar, datosValidos, exito, cerrarMensaje,
  };
}

export function Seccion({ titulo, children, accion }) {
  const classes = useStyles();
  return (
    <Paper variant="outlined" className={classes.seccion}>
      <Box display="flex" alignItems="center" justifyContent="space-between" className={classes.tituloSeccion}>
        <Typography variant="subtitle1">{titulo}</Typography>
        {accion}
      </Box>
      <Grid container spacing={2}>{children}</Grid>
    </Paper>
  );
}

// Página completa: encabezado con volver, contenido y barra inferior fija con Limpiar / Guardar.
export function PaginaFormulario({ f, titulo, onGuardar, children }) {
  const classes = useStyles();
  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <div className={classes.encabezado}>
        <IconButton size="small" title="Volver a accionistas" onClick={() => f.history.push('/accionistas')}><ArrowBackIcon /></IconButton>
        <div>
          <Typography variant="h6">{`${f.edicion ? 'Editar accionista' : 'Nuevo accionista'} — ${titulo}`}</Typography>
          {f.edicion && <Typography variant="body2" color="textSecondary">{f.precargado.acc_nombre_completo}</Typography>}
        </div>
      </div>
      <Grid container spacing={2}>{children}</Grid>
      <div className={classes.acciones}>
        <Cargando abierto={f.cargando} />
        {!f.edicion && <Button color="primary" onClick={f.limpiar} disabled={f.cargando}>Limpiar</Button>}
        <Button variant="contained" color="primary" onClick={onGuardar} disabled={f.cargando}>
          {f.edicion ? 'Actualizar accionista' : 'Registrar accionista'}
        </Button>
      </div>
      <Snackbar open={!!f.mensaje} autoHideDuration={6000} onClose={f.cerrarMensaje}>
        {f.mensaje ? <MuiAlert elevation={6} variant="filled" severity={f.mensaje.tipo} onClose={f.cerrarMensaje}>{f.mensaje.texto}</MuiAlert> : <span />}
      </Snackbar>
    </main>
  );
}

export function SeccionDireccion({ f }) {
  return (
    <Seccion titulo="Dirección">
      {f.pais('acc_pais', 'País de residencia')}
      {f.campo('acc_provincia', 'Provincia')}
      {f.campo('acc_ciudad', 'Ciudad')}
      {f.campo('acc_direccion', 'Dirección')}
      {f.campo('acc_dir_numero', 'Número')}
    </Seccion>
  );
}

export function SeccionBanco({ f }) {
  return (
    <Seccion titulo="Cuenta bancaria">
      {f.campo('acc_banco', 'Banco', { sm: 12 })}
      {f.seleccion('acc_tipo_cuenta', 'Tipo de cuenta', TIPOS_CUENTA)}
      {f.campo('acc_cuenta_bancaria', 'Número de cuenta')}
    </Seccion>
  );
}

// Filas dinámicas: hasta `max` elementos, cada uno con botón de quitar.
export function ListaDinamica({ items, max, renderFila, onAgregar, onQuitar, textoAgregar }) {
  return (
    <>
      {items.map((item, i) => (
        <Grid item xs={12} key={i}>
          <Box display="flex" style={{ gap: 8 }}>
            {renderFila(item, i)}
            <IconButton size="small" title="Quitar" onClick={() => onQuitar(i)}><DeleteIcon /></IconButton>
          </Box>
        </Grid>
      ))}
      <Grid item xs={12}>
        <Button size="small" color="primary" startIcon={<AddIcon />} disabled={items.length >= max} onClick={onAgregar}>{textoAgregar}</Button>
      </Grid>
    </>
  );
}

export function SeccionContacto({ f }) {
  return (
    <Seccion titulo="Medios de contacto">
      <ListaDinamica
        items={f.telefonos} max={MAX_CONTACTOS} textoAgregar="Agregar teléfono"
        onAgregar={() => f.setTelefonos([...f.telefonos, { numero: '', obs: '' }])}
        onQuitar={(i) => quitarDeLista(f.setTelefonos, i, () => ({ numero: '', obs: '' }))}
        renderFila={(t, i) => (
          <>
            <TextField size="small" variant="outlined" label={`Teléfono ${i + 1}`} value={t.numero} style={{ width: 170 }}
              onChange={(e) => cambiarLista(f.setTelefonos, i, { numero: e.target.value })} />
            <TextField size="small" variant="outlined" label="Observación" value={t.obs} fullWidth
              onChange={(e) => cambiarLista(f.setTelefonos, i, { obs: e.target.value })} />
          </>
        )}
      />
      <ListaDinamica
        items={f.correos} max={MAX_CONTACTOS} textoAgregar="Agregar correo"
        onAgregar={() => f.setCorreos([...f.correos, ''])}
        onQuitar={(i) => quitarDeLista(f.setCorreos, i, () => '')}
        renderFila={(c, i) => (
          <TextField size="small" variant="outlined" type="email" label={i === 0 ? 'Correo principal' : `Correo ${i + 1}`} value={c} fullWidth
            onChange={(e) => cambiarLista(f.setCorreos, i, e.target.value)} />
        )}
      />
    </Seccion>
  );
}

// documentos: [[campo, etiqueta]]
export function SeccionDocumentos({ f, documentos }) {
  return (
    <Seccion titulo="Documentos habilitantes">
      {documentos.map(([nombre, etiqueta]) => (
        <Grid item xs={12} key={nombre}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" style={{ gap: 8 }}>
              <CheckCircleIcon color={f.form[nombre] ? 'primary' : 'disabled'} fontSize="small" />
              <Typography variant="body2">{etiqueta}</Typography>
            </Box>
            <Box>
              {f.form[nombre] && <IconButton size="small" title="Ver" onClick={() => f.ver(nombre)}><PageviewIcon /></IconButton>}
              <Button component="label" size="small" color="primary" startIcon={<CloudUploadOutlinedIcon />}>
                {f.form[nombre] ? 'Reemplazar' : 'Subir'}
                <input hidden type="file" accept="application/pdf" onChange={f.subir(nombre)} />
              </Button>
            </Box>
          </Box>
        </Grid>
      ))}
    </Seccion>
  );
}
