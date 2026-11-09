import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import {
  Paper, Grid, Button, TextField, CircularProgress, Snackbar, Typography, Box, InputAdornment, IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import PageviewIcon from '@material-ui/icons/Pageview';
import SaveIcon from '@material-ui/icons/Save';
import { getParametro } from '../graphql/queries';
import { updateParametro } from '../graphql/mutations';
import { subirArchivo, abrirArchivo } from '../services/archivos';
import ValidacionTitulos from '../components/validacionTitulos';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: { ...theme.mixins.toolbar },
  content: { flexGrow: 1, padding: theme.spacing(2) },
  tarjeta: { padding: theme.spacing(2), height: '100%' },
}));

const enteros = (n) => new Intl.NumberFormat('en-US').format(n || 0);
const decimales = (n) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const MODELOS = [
  ['modeloCartaCesion', 'Carta de cesión'],
  ['modeloCartaGerente', 'Carta de gerente'],
  ['modeloCartaInstrucciones', 'Carta de instrucciones'],
  ['modeloSolicitudDividendos', 'Solicitud de dividendos'],
];
const EDITABLES = ['valorNominal', 'baseImponible', ...MODELOS.map(([campo]) => campo)];
const ACEPTA = '.doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// Parámetros generales. El total emitido es de solo lectura: lo actualiza el aumento de capital al aprobarse,
// para que coincida siempre con la numeración de los títulos.
export default function Parametros() {
  const classes = useStyles();
  const [guardado, setGuardado] = useState(null); // valores en la base
  const [form, setForm] = useState({});
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }

  async function ejecutar(fn, exito) {
    setCargando(true);
    try {
      await fn();
      if (exito) setMensaje({ tipo: 'success', texto: exito });
    } catch (err) {
      console.log('Error en parámetros:', err);
      setMensaje({ tipo: 'error', texto: err.message || (err.errors && err.errors[0] && err.errors[0].message) || 'No se pudieron guardar los parámetros.' });
    }
    setCargando(false);
  }

  useEffect(() => {
    ejecutar(async () => {
      const p = (await API.graphql({ query: getParametro, variables: { id: '1' } })).data.getParametro;
      setGuardado(p);
      setForm(Object.fromEntries(EDITABLES.map((c) => [c, p[c] == null ? '' : String(p[c])])));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const numero = (campo) => (e) => setForm({ ...form, [campo]: e.target.value.replace(/[^0-9.]/g, '') });
  const subir = (campo) => (e) => {
    const archivo = e.target.files[0];
    e.target.value = '';
    // Se guarda el nombre del archivo (antes se guardaba un objeto y fallaba todo el guardado).
    if (archivo) ejecutar(async () => { const clave = await subirArchivo(archivo); setForm((f) => ({ ...f, [campo]: clave })); });
  };

  const valorNominal = parseFloat(form.valorNominal);
  const baseImponible = parseFloat(form.baseImponible);
  const errorValor = form.valorNominal !== undefined && !(valorNominal > 0) ? 'Debe ser mayor a 0' : '';
  const errorBase = form.baseImponible !== undefined && form.baseImponible !== '' && !(baseImponible >= 0) ? 'Valor inválido' : '';
  const cambios = guardado ? EDITABLES.filter((c) => String(guardado[c] == null ? '' : guardado[c]) !== form[c]) : [];

  const guardar = () => ejecutar(async () => {
    if (errorValor || errorBase) throw new Error('Revise los valores ingresados.');
    const input = { id: '1' };
    cambios.forEach((c) => {
      input[c] = c === 'valorNominal' ? valorNominal : c === 'baseImponible' ? (form[c] === '' ? null : baseImponible) : form[c];
    });
    await API.graphql({ query: updateParametro, variables: { input } });
    setGuardado((g) => ({ ...g, ...input }));
  }, 'Parámetros guardados correctamente.');

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Parámetros</Typography>
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
          {cargando && <CircularProgress size={24} />}
          <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={guardar} disabled={cargando || cambios.length === 0 || !!errorValor || !!errorBase}>
            {cambios.length ? `Guardar cambios (${cambios.length})` : 'Sin cambios'}
          </Button>
        </Box>
      </Box>

      {guardado && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" className={classes.tarjeta}>
              <Typography variant="subtitle1" gutterBottom>Capital</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" variant="outlined" label="Total emitido (acciones)" value={enteros(guardado.cantidadEmitida)} disabled
                    helperText="Se actualiza al aprobar un aumento de capital" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" variant="outlined" label="Valor nominal" value={form.valorNominal} onChange={numero('valorNominal')}
                    error={!!errorValor} helperText={errorValor || ' '} InputProps={{ startAdornment: <InputAdornment position="start">USD</InputAdornment> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" variant="outlined" label="Capital suscrito y pagado" disabled
                    value={decimales((guardado.cantidadEmitida || 0) * (valorNominal || 0))}
                    InputProps={{ startAdornment: <InputAdornment position="start">USD</InputAdornment> }} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" className={classes.tarjeta}>
              <Typography variant="subtitle1" gutterBottom>Retenciones</Typography>
              <TextField fullWidth size="small" variant="outlined" label="Salario básico unificado (SBU)" value={form.baseImponible} onChange={numero('baseImponible')}
                error={!!errorBase} helperText={errorBase || 'Se usa en la retención de dividendos de personas naturales residentes (reducción de 3 SBU).'}
                InputProps={{ startAdornment: <InputAdornment position="start">USD</InputAdornment> }} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" className={classes.tarjeta}>
              <Typography variant="subtitle1" gutterBottom>Modelos de cartas</Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>Plantillas Word que los accionistas descargan desde su portal.</Typography>
              {MODELOS.map(([campo, etiqueta]) => (
                <Box key={campo} display="flex" alignItems="center" justifyContent="space-between" py={0.5}>
                  <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                    <CheckCircleIcon fontSize="small" color={form[campo] ? 'primary' : 'disabled'} />
                    <Typography variant="body2">{etiqueta}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    {form[campo] && <IconButton size="small" title="Ver" onClick={() => ejecutar(() => abrirArchivo(form[campo]))}><PageviewIcon /></IconButton>}
                    <Button component="label" size="small" color="primary" startIcon={<CloudUploadOutlinedIcon />}>
                      {form[campo] ? 'Reemplazar' : 'Subir'}
                      <input hidden type="file" accept={ACEPTA} onChange={subir(campo)} />
                    </Button>
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" className={classes.tarjeta}>
              <ValidacionTitulos />
            </Paper>
          </Grid>
        </Grid>
      )}

      <Snackbar open={!!mensaje} autoHideDuration={6000} onClose={(e, razon) => razon !== 'clickaway' && setMensaje(null)}>
        {mensaje ? <MuiAlert elevation={6} variant="filled" severity={mensaje.tipo} onClose={() => setMensaje(null)}>{mensaje.texto}</MuiAlert> : <span />}
      </Snackbar>
    </main>
  );
}
