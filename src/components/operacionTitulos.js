// Pantalla compartida para solicitar una operación sobre todos los títulos de un accionista
// (bloqueo, desbloqueo, canje). Queda pendiente de aprobación en el blotter.
import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import {
  Paper, Grid, Typography, TextField, Button, Snackbar, Avatar, Box, Chip, Divider,
  Stepper, Step, StepLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import MuiAlert from '@material-ui/lab/Alert';
import { DataGrid } from '@mui/x-data-grid';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import PageviewIcon from '@material-ui/icons/Pageview';
import SendIcon from '@material-ui/icons/Send';
import { listarAccionistasPorEstado, listarTitulosVigentes, tieneOperacionPendiente, solicitarOperacion } from '../services/operaciones';
import { subirArchivo, abrirArchivo } from '../services/archivos';
import Cargando from './cargando';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: { ...theme.mixins.toolbar },
  content: { flexGrow: 1, padding: theme.spacing(2) },
  encabezado: { display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), marginBottom: theme.spacing(2) },
  avatar: { backgroundColor: theme.palette.primary.main },
  tarjeta: { padding: theme.spacing(2), height: '100%' },
}));

const enteros = (n) => new Intl.NumberFormat('en-US').format(n || 0);
const ESTADOS_TITULO = { 0: 'Bloqueado', 1: 'Activo' };

const columnasTitulos = [
  { field: 'id', headerName: 'Título', flex: 1, minWidth: 180 },
  { field: 'tit_desde', headerName: 'Desde', type: 'number', width: 110, valueFormatter: (p) => enteros(p.value) },
  { field: 'tit_hasta', headerName: 'Hasta', type: 'number', width: 110, valueFormatter: (p) => enteros(p.value) },
  { field: 'tit_acciones', headerName: 'Acciones', type: 'number', width: 110, valueFormatter: (p) => enteros(p.value) },
  { field: 'tit_estado', headerName: 'Estado', width: 100, valueFormatter: (p) => ESTADOS_TITULO[p.value] || p.value },
  { field: 'createdAt', headerName: 'Fecha', width: 110, valueFormatter: (p) => (p.value ? p.value.slice(0, 10) : '') },
];

/**
 * config: { tipo (ope_tipo), detalle (acc_ope_detalle), estadoAccionistas (acc_estado a listar),
 *           filtro (opcional, accionista => bool), titulo, descripcion, documento (etiqueta), tituloTabla,
 *           sinAccionistas (texto si la lista está vacía), icono }
 */
export default function OperacionTitulos({ config }) {
  const classes = useStyles();
  const [accionistas, setAccionistas] = useState([]);
  const [accionista, setAccionista] = useState(null);
  const [titulos, setTitulos] = useState([]);
  const [documento, setDocumento] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }

  async function ejecutar(fn) {
    setCargando(true);
    try {
      await fn();
    } catch (err) {
      console.log(`Error en ${config.detalle}:`, err);
      setMensaje({ tipo: 'error', texto: err.message || 'Ocurrió un error al registrar la operación.' });
    }
    setCargando(false);
  }

  const cargarAccionistas = () => ejecutar(async () => {
    const lista = await listarAccionistasPorEstado(config.estadoAccionistas);
    setAccionistas(config.filtro ? lista.filter(config.filtro) : lista);
  });
  useEffect(() => { cargarAccionistas(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const elegir = (e, valor) => {
    setAccionista(valor);
    setTitulos([]);
    if (valor) ejecutar(async () => setTitulos(await listarTitulosVigentes(valor.id)));
  };

  const subir = (e) => {
    const archivo = e.target.files[0];
    e.target.value = '';
    if (archivo) ejecutar(async () => setDocumento(await subirArchivo(archivo)));
  };

  const total = titulos.reduce((s, t) => s + t.tit_acciones, 0);
  const paso = !accionista ? 0 : !documento ? 1 : 2;

  const solicitar = () => ejecutar(async () => {
    if (!accionista || titulos.length === 0) throw new Error('Seleccione un accionista con títulos.');
    if (await tieneOperacionPendiente(accionista.id, config.tipo)) {
      throw new Error(`${accionista.acc_nombre_completo} ya tiene una solicitud de ${config.detalle.toLowerCase()} pendiente de aprobación.`);
    }
    await solicitarOperacion({
      tipo: config.tipo, detalle: config.detalle, accionista, titulos, documento, usuario: Auth.user ? Auth.user.username : '',
    });
    setAccionista(null);
    setTitulos([]);
    setDocumento('');
    setMensaje({ tipo: 'success', texto: `Se registró la solicitud de ${config.detalle.toLowerCase()}. Queda pendiente de aprobación.` });
  });

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <div className={classes.encabezado}>
        <Avatar className={classes.avatar}>{config.icono}</Avatar>
        <div>
          <Typography variant="h6">{config.titulo}</Typography>
          <Typography variant="body2" color="textSecondary">
            {config.descripcion}
          </Typography>
        </div>
      </div>

      <Paper variant="outlined" style={{ marginBottom: 16 }}>
        <Stepper activeStep={paso}>
          <Step><StepLabel>Accionista</StepLabel></Step>
          <Step><StepLabel optional={<Typography variant="caption">Opcional</Typography>}>{config.documento}</StepLabel></Step>
          <Step><StepLabel>Solicitar aprobación</StepLabel></Step>
        </Stepper>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" className={classes.tarjeta}>
            <Typography variant="subtitle1" gutterBottom>Accionista</Typography>
            <Autocomplete
              size="small"
              options={accionistas}
              value={accionista}
              onChange={elegir}
              getOptionLabel={(o) => o.acc_nombre_completo || ''}
              getOptionSelected={(o, v) => o.id === v.id}
              noOptionsText={config.sinAccionistas}
              renderOption={(o) => (
                <Box>
                  <Typography variant="body2">{o.acc_nombre_completo}</Typography>
                  <Typography variant="caption" color="textSecondary">{`${o.acc_identificacion} — ${enteros(o.acc_cantidad_acciones)} acciones`}</Typography>
                </Box>
              )}
              renderInput={(params) => <TextField {...params} label={`Buscar entre ${enteros(accionistas.length)} accionistas`} variant="outlined" />}
            />
            {accionista && (
              <Box mt={2}>
                <Typography variant="caption" color="textSecondary">Identificación</Typography>
                <Typography variant="body2" gutterBottom>{accionista.acc_identificacion}</Typography>
                <Typography variant="caption" color="textSecondary">Acciones registradas</Typography>
                <Typography variant="body2" gutterBottom>{enteros(accionista.acc_cantidad_acciones)}</Typography>
                {total !== (accionista.acc_cantidad_acciones || 0) && titulos.length > 0 && (
                  <MuiAlert severity="warning" style={{ marginTop: 8 }}>
                    {`Los títulos suman ${enteros(total)} acciones; el accionista registra ${enteros(accionista.acc_cantidad_acciones)}.`}
                  </MuiAlert>
                )}
              </Box>
            )}
            <Divider style={{ margin: '16px 0' }} />
            <Typography variant="subtitle1" gutterBottom>{config.documento}</Typography>
            <Box display="flex" alignItems="center" style={{ gap: 8 }}>
              <Button component="label" variant="outlined" color="primary" startIcon={documento ? <CheckCircleIcon /> : <CloudUploadOutlinedIcon />} style={{ textTransform: 'none' }}>
                {documento ? 'Reemplazar documento' : 'Subir PDF'}
                <input hidden type="file" accept="application/pdf" onChange={subir} />
              </Button>
              {documento && <Button size="small" color="primary" startIcon={<PageviewIcon />} onClick={() => ejecutar(() => abrirArchivo(documento))}>Ver</Button>}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper variant="outlined" className={classes.tarjeta}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle1">{config.tituloTabla}</Typography>
              {accionista && <Chip color="primary" label={`${enteros(total)} acciones en ${titulos.length} títulos`} />}
            </Box>
            {accionista
              ? <DataGrid autoHeight density="compact" disableColumnMenu disableSelectionOnClick rows={titulos} columns={columnasTitulos} pageSize={10} hideFooter={titulos.length <= 10} />
              : <Typography variant="body2" color="textSecondary">Seleccione un accionista para ver sus títulos.</Typography>}
          </Paper>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2} style={{ gap: 8 }}>
        <Cargando abierto={cargando} />
        <Button variant="contained" color="primary" startIcon={<SendIcon />} onClick={solicitar} disabled={cargando || !accionista || titulos.length === 0}>
          Solicitar aprobación
        </Button>
      </Box>

      <Snackbar open={!!mensaje} autoHideDuration={6000} onClose={(e, razon) => razon !== 'clickaway' && setMensaje(null)}>
        {mensaje ? <MuiAlert elevation={6} variant="filled" severity={mensaje.tipo} onClose={() => setMensaje(null)}>{mensaje.texto}</MuiAlert> : <span />}
      </Snackbar>
    </main>
  );
}
