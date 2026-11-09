import React, { useState, useEffect } from 'react';
import { API, Auth } from 'aws-amplify';
import {
  Paper, Grid, Typography, TextField, Button, Snackbar, CircularProgress, Avatar, Box, Divider, InputAdornment,
  Stepper, Step, StepLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import MuiAlert from '@material-ui/lab/Alert';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import PageviewIcon from '@material-ui/icons/Pageview';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import SendIcon from '@material-ui/icons/Send';
import { listAccionistas, getParametro } from '../graphql/queries';
import { listarTodos } from '../services/listarTodos';
import { solicitarAumentoCapital } from '../services/operaciones';
import { subirArchivo, abrirArchivo } from '../services/archivos';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: { ...theme.mixins.toolbar },
  content: { flexGrow: 1, padding: theme.spacing(2) },
  encabezado: { display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), marginBottom: theme.spacing(2) },
  avatar: { backgroundColor: theme.palette.primary.main },
  tarjeta: { padding: theme.spacing(2), height: '100%' },
}));

const enteros = (n) => new Intl.NumberFormat('en-US').format(n || 0);
const decimales = (n, d = 2) => new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n || 0);
const ESTADOS = { 1: 'Activo', 2: 'Inactivo' };

function Dato({ titulo, valor }) {
  return (
    <Grid item xs={6}>
      <Typography variant="caption" color="textSecondary">{titulo}</Typography>
      <Typography variant="body1">{valor}</Typography>
    </Grid>
  );
}

// Solicita un aumento de capital: nuevas acciones para un accionista activo o inactivo.
// Queda pendiente; al aprobarse en el blotter se crea el título a continuación del último emitido y el accionista queda activo.
export default function AumentoCapital() {
  const classes = useStyles();
  const [accionistas, setAccionistas] = useState([]);
  const [parametro, setParametro] = useState({ cantidadEmitida: 0, valorNominal: 0 });
  const [accionista, setAccionista] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [documento, setDocumento] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }

  async function ejecutar(fn) {
    setCargando(true);
    try {
      await fn();
    } catch (err) {
      console.log('Error en aumento de capital:', err);
      setMensaje({ tipo: 'error', texto: err.message || 'Ocurrió un error al registrar la operación.' });
    }
    setCargando(false);
  }

  useEffect(() => {
    ejecutar(async () => {
      const [lista, p] = await Promise.all([
        listarTodos(listAccionistas, 'listAccionistas', { filter: { or: [{ acc_estado: { eq: 1 } }, { acc_estado: { eq: 2 } }] } }),
        API.graphql({ query: getParametro, variables: { id: '1' } }),
      ]);
      setAccionistas(lista.sort((a, b) => (a.acc_nombre_completo || '').localeCompare(b.acc_nombre_completo || '')));
      setParametro(p.data.getParametro);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const acciones = parseInt(cantidad, 10) || 0;
  const capital = acciones * (parametro.valorNominal || 0);
  const emitidoNuevo = (parametro.cantidadEmitida || 0) + acciones;
  const accionesBeneficiario = (accionista ? accionista.acc_cantidad_acciones || 0 : 0) + acciones;
  const paso = !accionista ? 0 : !acciones ? 1 : !documento ? 2 : 3;

  const subir = (e) => {
    const archivo = e.target.files[0];
    e.target.value = '';
    if (archivo) ejecutar(async () => setDocumento(await subirArchivo(archivo)));
  };

  const solicitar = () => ejecutar(async () => {
    if (!accionista) throw new Error('Seleccione el beneficiario.');
    await solicitarAumentoCapital({
      accionista, acciones, valorNominal: parametro.valorNominal, documento, usuario: Auth.user ? Auth.user.username : '',
    });
    setAccionista(null);
    setCantidad('');
    setDocumento('');
    setMensaje({ tipo: 'success', texto: 'Se registró la solicitud de aumento de capital. Queda pendiente de aprobación.' });
  });

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <div className={classes.encabezado}>
        <Avatar className={classes.avatar}><TrendingUpIcon /></Avatar>
        <div>
          <Typography variant="h6">Aumento de capital</Typography>
          <Typography variant="body2" color="textSecondary">
            Las acciones nuevas se numeran a continuación de la última emitida y se asignan al aprobarse la operación.
          </Typography>
        </div>
      </div>

      <Paper variant="outlined" style={{ marginBottom: 16 }}>
        <Stepper activeStep={paso}>
          <Step><StepLabel>Beneficiario</StepLabel></Step>
          <Step><StepLabel>Acciones a emitir</StepLabel></Step>
          <Step><StepLabel optional={<Typography variant="caption">Opcional</Typography>}>Escrituras</StepLabel></Step>
          <Step><StepLabel>Solicitar aprobación</StepLabel></Step>
        </Stepper>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" className={classes.tarjeta}>
            <Typography variant="subtitle1" gutterBottom>Beneficiario</Typography>
            <Autocomplete
              size="small"
              options={accionistas}
              value={accionista}
              onChange={(e, v) => setAccionista(v)}
              getOptionLabel={(o) => o.acc_nombre_completo || ''}
              getOptionSelected={(o, v) => o.id === v.id}
              noOptionsText="No hay accionistas activos o inactivos"
              renderOption={(o) => (
                <Box>
                  <Typography variant="body2">{o.acc_nombre_completo}</Typography>
                  <Typography variant="caption" color="textSecondary">{`${o.acc_identificacion} — ${ESTADOS[o.acc_estado]} — ${enteros(o.acc_cantidad_acciones)} acciones`}</Typography>
                </Box>
              )}
              renderInput={(params) => <TextField {...params} label="Buscar accionista activo o inactivo" variant="outlined" />}
            />
            {accionista && (
              <Grid container spacing={1} style={{ marginTop: 8 }}>
                <Dato titulo="Identificación" valor={accionista.acc_identificacion} />
                <Dato titulo="Estado" valor={ESTADOS[accionista.acc_estado]} />
                <Dato titulo="Acciones actuales" valor={enteros(accionista.acc_cantidad_acciones)} />
                <Dato titulo="Participación actual" valor={`${decimales((accionista.acc_participacion || 0) * 100, 6)}%`} />
              </Grid>
            )}
            {accionista && accionista.acc_estado === 2 && (
              <MuiAlert severity="info" style={{ marginTop: 8 }}>El accionista inactivo quedará activo al aprobarse el aumento.</MuiAlert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" className={classes.tarjeta}>
            <Typography variant="subtitle1" gutterBottom>Emisión</Typography>
            <TextField
              fullWidth size="small" variant="outlined" label="Acciones a emitir" value={cantidad}
              onChange={(e) => setCantidad(e.target.value.replace(/[^0-9]/g, ''))}
              inputProps={{ inputMode: 'numeric' }}
            />
            <TextField
              fullWidth size="small" variant="outlined" label="Valor nominal" value={decimales(parametro.valorNominal, 2)} disabled style={{ marginTop: 16 }}
              InputProps={{ startAdornment: <InputAdornment position="start">USD</InputAdornment> }}
            />
            <TextField
              fullWidth size="small" variant="outlined" label="Capital" value={decimales(capital, 2)} disabled style={{ marginTop: 16 }}
              InputProps={{ startAdornment: <InputAdornment position="start">USD</InputAdornment> }}
            />
            <Divider style={{ margin: '16px 0' }} />
            <Grid container spacing={1}>
              <Dato titulo="Emitido actual" valor={enteros(parametro.cantidadEmitida)} />
              <Dato titulo="Emitido después" valor={enteros(emitidoNuevo)} />
              {acciones > 0 && <Dato titulo="Rango estimado" valor={`${enteros((parametro.cantidadEmitida || 0) + 1)} – ${enteros(emitidoNuevo)}`} />}
              {accionista && acciones > 0 && <Dato titulo="Participación después" valor={`${decimales(accionesBeneficiario * 100 / emitidoNuevo, 6)}%`} />}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" className={classes.tarjeta}>
            <Typography variant="subtitle1" gutterBottom>Escrituras</Typography>
            <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8 }}>
              <Button component="label" variant="outlined" color="primary" startIcon={documento ? <CheckCircleIcon /> : <CloudUploadOutlinedIcon />} style={{ textTransform: 'none' }}>
                {documento ? 'Reemplazar escrituras' : 'Subir escrituras (PDF)'}
                <input hidden type="file" accept="application/pdf" onChange={subir} />
              </Button>
              {documento && <Button size="small" color="primary" startIcon={<PageviewIcon />} onClick={() => ejecutar(() => abrirArchivo(documento))}>Ver</Button>}
              {documento && <Button size="small" startIcon={<DeleteOutlineIcon />} onClick={() => setDocumento('')}>Quitar</Button>}
            </Box>
            {!documento && <Typography variant="body2" color="textSecondary" style={{ marginTop: 12 }}>El aprobador revisa las escrituras en el blotter.</Typography>}
          </Paper>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2} style={{ gap: 8 }}>
        {cargando && <CircularProgress size={24} />}
        <Button variant="contained" color="primary" startIcon={<SendIcon />} onClick={solicitar} disabled={cargando || !accionista || acciones <= 0}>
          Solicitar aprobación
        </Button>
      </Box>

      <Snackbar open={!!mensaje} autoHideDuration={6000} onClose={(e, razon) => razon !== 'clickaway' && setMensaje(null)}>
        {mensaje ? <MuiAlert elevation={6} variant="filled" severity={mensaje.tipo} onClose={() => setMensaje(null)}>{mensaje.texto}</MuiAlert> : <span />}
      </Snackbar>
    </main>
  );
}
