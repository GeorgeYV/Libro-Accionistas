import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper, Grid, Typography, TextField, Button, MenuItem, Box, CircularProgress, Snackbar, Avatar, Divider, Chip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';
import { DataGrid } from '@mui/x-data-grid';
import PrintOutlinedIcon from '@material-ui/icons/PrintOutlined';
import GetAppIcon from '@material-ui/icons/GetApp';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import { cargarDatosReportes, libroAFecha, descargarExcel, fechaHoy } from '../services/reportes';
import { TIPOS_OPERACION, ESTADOS_OPERACION, MOTIVOS_RECHAZO } from '../services/aprobacion';
import { ESTADOS_ACCIONISTA, TIPOS_IDENTIFICACION, ESTADOS_CIVILES, separar } from '../utils/accionistas';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: { ...theme.mixins.toolbar },
  content: { flexGrow: 1, padding: theme.spacing(2) },
  encabezado: { display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), marginBottom: theme.spacing(2) },
  avatar: { backgroundColor: theme.palette.primary.main },
  tarjeta: { padding: theme.spacing(2), height: '100%', display: 'flex', flexDirection: 'column', gap: theme.spacing(1.5) },
}));

const enteros = (n) => new Intl.NumberFormat('en-US').format(n || 0);
const estadoAccionista = (v) => (ESTADOS_ACCIONISTA.find((e) => e.valor === v) || {}).singular || '-';
const persona = (a) => (a.acc_tipo_persona === 1 ? 'PJ' : 'PN');
const tipoAcciones = (v) => (v === 0 ? 'Ordinarias' : 'Desmaterializadas');
const motivo = (v) => (v == null || v < 1 ? 'Ninguno' : (MOTIVOS_RECHAZO.find((m) => m.valor === v) || {}).etiqueta || 'Otro');
const enRango = (iso, desde, hasta) => { const d = String(iso || '').slice(0, 10); return d >= desde && d <= hasta; };

const ENCABEZADOS_LIBRO = [
  'Decevale', 'Tipo identificación', 'Identificación', 'Nombre', 'Residencia', 'Nacionalidad', 'País', 'Provincia', 'Ciudad',
  'Dirección', 'Número', 'Banco', 'Tipo de cuenta', 'Cuenta bancaria', 'Acciones', 'Participación (%)', 'Tipo acciones', 'Estado',
  'Tipo persona', 'Primer nombre', 'Segundo nombre', 'Apellido paterno', 'Apellido materno', 'Estado civil', 'Razón social',
  'Rep. legal identificación', 'Rep. legal nombre', 'Rep. legal nacionalidad', 'Rep. legal teléfono', 'Rep. legal email',
  'Teléfonos', 'Correos', 'Fecha de registro',
];
const filaLibro = (a) => [
  a.acc_decevale, TIPOS_IDENTIFICACION[a.acc_tipo_identificacion] || a.acc_tipo_identificacion, a.acc_identificacion, a.acc_nombre_completo,
  a.acc_residencia, a.acc_nacionalidad, a.acc_pais, a.acc_provincia, a.acc_ciudad, a.acc_direccion, a.acc_dir_numero, a.acc_banco,
  a.acc_tipo_cuenta, a.acc_cuenta_bancaria, a.acc_cantidad_acciones, Math.round((a.acc_participacion || 0) * 1e10) / 1e8,
  tipoAcciones(a.acc_tipo_acciones), estadoAccionista(a.acc_estado), persona(a), a.pn_primer_nombre, a.pn_segundo_nombre,
  a.pn_apellido_paterno, a.pn_apellido_materno, ESTADOS_CIVILES[a.pn_estado_civil] || '', a.pj_razon_social, a.pj_rl_identificacion,
  a.pj_rl_nombre, a.pj_rl_nacionalidad, a.pj_rl_telefono, a.pj_rl_email, separar(a.acc_telefonos).join(' '), separar(a.acc_correos).join(' '),
  a.createdAt ? a.createdAt.slice(0, 10) : '',
];

function Tarjeta({ titulo, descripcion, children }) {
  const classes = useStyles();
  return (
    <Paper variant="outlined" className={classes.tarjeta}>
      <div>
        <Typography variant="subtitle1">{titulo}</Typography>
        <Typography variant="body2" color="textSecondary">{descripcion}</Typography>
      </div>
      {children}
    </Paper>
  );
}

const campoFecha = (label, value, onChange) => (
  <TextField size="small" variant="outlined" type="date" label={label} value={value} onChange={(e) => onChange(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
);

export default function Reportes() {
  const classes = useStyles();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }
  // Libro
  const [fechaCorte, setFechaCorte] = useState(fechaHoy());
  const [libro, setLibro] = useState(null);
  // Listado
  const [tipoPersona, setTipoPersona] = useState('todos');
  const [estadoListado, setEstadoListado] = useState('todos');
  // Operaciones
  const [opeDesde, setOpeDesde] = useState(fechaHoy());
  const [opeHasta, setOpeHasta] = useState(fechaHoy());
  const [opeTipo, setOpeTipo] = useState('todos');
  const [opeEstado, setOpeEstado] = useState('todos');

  async function ejecutar(fn) {
    setCargando(true);
    try {
      await fn();
    } catch (err) {
      console.log('Error en reportes:', err);
      setMensaje({ tipo: 'error', texto: err.message || 'No se pudo generar el reporte.' });
    }
    setCargando(false);
  }

  useEffect(() => { ejecutar(async () => setDatos(await cargarDatosReportes())); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const listado = useMemo(() => (datos ? datos.accionistas.filter((a) =>
    (tipoPersona === 'todos' || a.acc_tipo_persona === tipoPersona) && (estadoListado === 'todos' || a.acc_estado === estadoListado)) : []),
  [datos, tipoPersona, estadoListado]);
  const operaciones = useMemo(() => (datos ? datos.operaciones.filter((o) =>
    enRango(o.createdAt, opeDesde, opeHasta) && (opeTipo === 'todos' || o.ope_tipo === opeTipo) && (opeEstado === 'todos' || o.ope_estado === opeEstado))
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))) : []),
  [datos, opeDesde, opeHasta, opeTipo, opeEstado]);

  const generarLibro = () => ejecutar(async () => {
    if (!fechaCorte) throw new Error('Indique la fecha de corte.');
    if (fechaCorte > fechaHoy()) throw new Error('La fecha de corte no puede ser futura.');
    setLibro({ fecha: fechaCorte, ...(await libroAFecha(datos, fechaCorte)) });
  });

  const descargarLibro = () => ejecutar(() => descargarExcel({
    titulo: 'Libro de Accionistas',
    subtitulo: `Fecha de corte: ${libro.fecha} — Generado: ${fechaHoy()} — Total emitido: ${enteros(libro.totalEmitido)}`,
    hoja: 'Libro de accionistas', encabezados: ENCABEZADOS_LIBRO, filas: libro.filas.map(filaLibro), archivo: `LibroAccionistas_${libro.fecha}.xlsx`,
  }));

  const descargarListado = () => ejecutar(() => descargarExcel({
    titulo: 'Listado de Accionistas', hoja: 'Listado Accionistas', archivo: 'ListadoAccionistas.xlsx',
    encabezados: ['Tipo de persona', 'Identificación', 'Nombre', 'Nacionalidad', 'Teléfono', 'Email', 'Tipo de acción', 'Acciones', 'Estado'],
    filas: listado.map((a) => [persona(a), a.acc_identificacion, a.acc_nombre_completo, a.acc_nacionalidad,
      separar(a.acc_telefonos).join(' '), separar(a.acc_correos).join(' '), tipoAcciones(a.acc_tipo_acciones), a.acc_cantidad_acciones, estadoAccionista(a.acc_estado)]),
  }));

  const descargarOperaciones = () => ejecutar(() => descargarExcel({
    titulo: 'Reporte de Operaciones', subtitulo: `Del ${opeDesde} al ${opeHasta} — Generado: ${fechaHoy()}`, hoja: 'Operaciones', archivo: 'Operaciones.xlsx',
    encabezados: ['Fecha', 'Operación', '# Acciones', 'Estado', 'Usuario ingreso', 'Usuario aprobador', 'Fecha aprobación', 'Motivo rechazo', 'Observación', 'Fecha registro'],
    filas: operaciones.map((o) => [o.ope_fecha, TIPOS_OPERACION[o.ope_tipo] || 'Otro', o.ope_acciones, ESTADOS_OPERACION[o.ope_estado] || 'Error',
      o.ope_ingresador, o.ope_aprobador, o.ope_fecha_aprobacion, motivo(o.ope_motivo_rechazo), o.ope_observacion, o.createdAt]),
  }));

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <div className={classes.encabezado}>
        <Avatar className={classes.avatar}><PrintOutlinedIcon /></Avatar>
        <div>
          <Typography variant="h6">Reportes</Typography>
          <Typography variant="body2" color="textSecondary">Los reportes son de solo lectura: no modifican ningún dato.</Typography>
        </div>
        {cargando && <CircularProgress size={24} style={{ marginLeft: 'auto' }} />}
      </div>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Tarjeta titulo="Libro de accionistas" descripcion="Accionistas y acciones a una fecha de corte: se revierten en memoria las operaciones aprobadas después de esa fecha.">
            {campoFecha('Fecha de corte', fechaCorte, (v) => { setFechaCorte(v); setLibro(null); })}
            <Box display="flex" style={{ gap: 8 }}>
              <Button variant="outlined" color="primary" startIcon={<MenuBookIcon />} onClick={generarLibro} disabled={cargando || !datos}>Generar</Button>
              <Button variant="contained" color="primary" startIcon={<GetAppIcon />} onClick={descargarLibro} disabled={cargando || !libro}>Descargar</Button>
            </Box>
          </Tarjeta>
        </Grid>

        <Grid item xs={12} md={4}>
          <Tarjeta titulo="Listado de accionistas" descripcion="Datos actuales de contacto y acciones.">
            <TextField select size="small" variant="outlined" label="Tipo de persona" value={tipoPersona} onChange={(e) => setTipoPersona(e.target.value)} fullWidth>
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value={0}>Persona natural</MenuItem>
              <MenuItem value={1}>Persona jurídica</MenuItem>
            </TextField>
            <TextField select size="small" variant="outlined" label="Estado" value={estadoListado} onChange={(e) => setEstadoListado(e.target.value)} fullWidth>
              <MenuItem value="todos">Todos</MenuItem>
              {ESTADOS_ACCIONISTA.map((e) => <MenuItem key={e.valor} value={e.valor}>{e.etiqueta}</MenuItem>)}
            </TextField>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Chip size="small" label={`${enteros(listado.length)} accionistas`} />
              <Button variant="contained" color="primary" startIcon={<GetAppIcon />} onClick={descargarListado} disabled={cargando || listado.length === 0}>Descargar</Button>
            </Box>
          </Tarjeta>
        </Grid>

        <Grid item xs={12} md={4}>
          <Tarjeta titulo="Operaciones" descripcion="Operaciones registradas en el rango de fechas (por fecha de registro).">
            <Box display="flex" style={{ gap: 8 }}>
              {campoFecha('Desde', opeDesde, setOpeDesde)}
              {campoFecha('Hasta', opeHasta, setOpeHasta)}
            </Box>
            <Box display="flex" style={{ gap: 8 }}>
              <TextField select size="small" variant="outlined" label="Tipo" value={opeTipo} onChange={(e) => setOpeTipo(e.target.value)} fullWidth>
                <MenuItem value="todos">Todos</MenuItem>
                {Object.entries(TIPOS_OPERACION).map(([v, t]) => <MenuItem key={v} value={Number(v)}>{t}</MenuItem>)}
              </TextField>
              <TextField select size="small" variant="outlined" label="Estado" value={opeEstado} onChange={(e) => setOpeEstado(e.target.value)} fullWidth>
                <MenuItem value="todos">Todos</MenuItem>
                {Object.entries(ESTADOS_OPERACION).map(([v, t]) => <MenuItem key={v} value={Number(v)}>{t}</MenuItem>)}
              </TextField>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Chip size="small" label={`${enteros(operaciones.length)} operaciones`} />
              <Button variant="contained" color="primary" startIcon={<GetAppIcon />} onClick={descargarOperaciones} disabled={cargando || operaciones.length === 0}>Descargar</Button>
            </Box>
          </Tarjeta>
        </Grid>

        {libro && (
          <Grid item xs={12}>
            <Paper variant="outlined" style={{ padding: 16 }}>
              <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8 }} mb={1}>
                <Typography variant="subtitle1">{`Libro de accionistas al ${libro.fecha}`}</Typography>
                <Chip size="small" color="primary" label={`${enteros(libro.filas.length)} accionistas`} />
                <Chip size="small" label={`${enteros(libro.totalEmitido)} acciones emitidas`} />
                <Chip size="small" label={`${libro.revertidas} operaciones revertidas`} />
              </Box>
              {libro.advertencias.length > 0 && (
                <MuiAlert severity="warning" style={{ marginBottom: 8 }}>
                  {libro.advertencias.map((a) => <div key={a}>{a}</div>)}
                </MuiAlert>
              )}
              <Divider style={{ marginBottom: 8 }} />
              <DataGrid
                autoHeight density="compact" disableColumnMenu disableSelectionOnClick pageSize={20} rowsPerPageOptions={[20]}
                rows={libro.filas}
                columns={[
                  { field: 'acc_identificacion', headerName: 'Identificación', width: 140 },
                  { field: 'acc_nombre_completo', headerName: 'Nombre', flex: 1, minWidth: 240 },
                  { field: 'acc_cantidad_acciones', headerName: 'Acciones', type: 'number', width: 130, valueFormatter: (p) => enteros(p.value) },
                  { field: 'acc_participacion', headerName: '% Part.', type: 'number', width: 120, valueFormatter: (p) => ((p.value || 0) * 100).toFixed(6) },
                  { field: 'acc_tipo_acciones', headerName: 'Tipo acciones', width: 150, valueFormatter: (p) => tipoAcciones(p.value) },
                  { field: 'acc_estado', headerName: 'Estado', width: 110, valueFormatter: (p) => estadoAccionista(p.value) },
                ]}
              />
            </Paper>
          </Grid>
        )}
      </Grid>

      <Snackbar open={!!mensaje} autoHideDuration={6000} onClose={(e, razon) => razon !== 'clickaway' && setMensaje(null)}>
        {mensaje ? <MuiAlert elevation={6} variant="filled" severity={mensaje.tipo} onClose={() => setMensaje(null)}>{mensaje.texto}</MuiAlert> : <span />}
      </Snackbar>
    </main>
  );
}
