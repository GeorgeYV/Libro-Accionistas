// Pantalla compartida para solicitar una transferencia de acciones entre accionistas (cesión, donación, testamento).
// Queda pendiente; el blotter la aprueba moviendo los títulos (o dividiendo uno si es parcial).
import React, { useState, useEffect, useMemo } from 'react';
import { Auth } from 'aws-amplify';
import {
  Paper, Grid, Typography, TextField, Button, Snackbar, CircularProgress, Avatar, Box, Chip, Checkbox, IconButton,
  Table, TableHead, TableBody, TableRow, TableCell, Stepper, Step, StepLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import MuiAlert from '@material-ui/lab/Alert';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import PageviewIcon from '@material-ui/icons/Pageview';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import SendIcon from '@material-ui/icons/Send';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { listarAccionistasPorEstado, listarTitulosVigentes, titulosEnOperacionPendiente, solicitarOperacion } from '../services/operaciones';
import { subirArchivo, abrirArchivo } from '../services/archivos';
import { validarSeleccion } from '../utils/operaciones';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: { ...theme.mixins.toolbar },
  content: { flexGrow: 1, padding: theme.spacing(2) },
  encabezado: { display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), marginBottom: theme.spacing(2) },
  avatar: { backgroundColor: theme.palette.primary.main },
  tarjeta: { padding: theme.spacing(2), height: '100%' },
}));

const enteros = (n) => new Intl.NumberFormat('en-US').format(n || 0);
// Posiciones de ope_documento ("cs&cg&ci&es&cp"): el blotter las lee en este orden.
const POSICIONES_DOCUMENTO = ['cs', 'cg', 'ci', 'es', 'cp'];

function SelectorAccionista({ etiqueta, opciones, valor, onChange }) {
  return (
    <Autocomplete
      size="small"
      options={opciones}
      value={valor}
      onChange={(e, v) => onChange(v)}
      getOptionLabel={(o) => o.acc_nombre_completo || ''}
      getOptionSelected={(o, v) => o.id === v.id}
      renderOption={(o) => (
        <Box>
          <Typography variant="body2">{o.acc_nombre_completo}</Typography>
          <Typography variant="caption" color="textSecondary">{`${o.acc_identificacion} — ${enteros(o.acc_cantidad_acciones)} acciones`}</Typography>
        </Box>
      )}
      renderInput={(params) => <TextField {...params} label={etiqueta} variant="outlined" />}
    />
  );
}

/**
 * config: { tipo (ope_tipo), titulo, descripcion, icono, etiquetaCedente, etiquetaCesionario,
 *           documentos: [5 etiquetas en el orden cs, cg, ci, es, cp] }
 * Los vínculos se guardan siempre como "Cedente" / "Cesionario" (es lo que lee el blotter).
 */
export default function OperacionTransferencia({ config }) {
  const classes = useStyles();
  const [accionistas, setAccionistas] = useState([]);
  const [cedente, setCedente] = useState(null);
  const [cesionario, setCesionario] = useState(null);
  const [titulos, setTitulos] = useState([]);
  const [seleccion, setSeleccion] = useState({}); // tituloId -> acciones a transferir (texto)
  const [documentos, setDocumentos] = useState(() => POSICIONES_DOCUMENTO.map(() => ''));
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }

  async function ejecutar(fn) {
    setCargando(true);
    try {
      await fn();
    } catch (err) {
      console.log(`Error en ${config.titulo}:`, err);
      setMensaje({ tipo: 'error', texto: err.message || 'Ocurrió un error al registrar la operación.' });
    }
    setCargando(false);
  }

  useEffect(() => {
    ejecutar(async () => {
      const lista = await listarAccionistasPorEstado(1);
      setAccionistas(lista.sort((a, b) => (a.acc_nombre_completo || '').localeCompare(b.acc_nombre_completo || '')));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const elegirCedente = (valor) => {
    setCedente(valor);
    setTitulos([]);
    setSeleccion({});
    if (valor && cesionario && cesionario.id === valor.id) setCesionario(null);
    // Solo títulos activos con acciones (los bloqueados no se pueden transferir).
    if (valor) ejecutar(async () => setTitulos((await listarTitulosVigentes(valor.id)).filter((t) => t.tit_estado === 1)));
  };

  const alternar = (titulo) => setSeleccion((s) => {
    const nueva = { ...s };
    if (titulo.id in nueva) delete nueva[titulo.id]; else nueva[titulo.id] = String(titulo.tit_acciones);
    return nueva;
  });

  const elegidos = useMemo(
    () => titulos.filter((t) => t.id in seleccion).map((t) => ({ titulo: t, acciones: parseInt(seleccion[t.id], 10) || 0 })),
    [titulos, seleccion]);
  const validacion = validarSeleccion(elegidos);
  const documentosCargados = documentos.filter(Boolean).length;
  const paso = !cedente || !cesionario ? 0 : validacion.error ? 1 : documentosCargados === 0 ? 2 : 3;

  const subir = (i) => (e) => {
    const archivo = e.target.files[0];
    e.target.value = '';
    if (archivo) ejecutar(async () => { const clave = await subirArchivo(archivo); setDocumentos((d) => d.map((x, j) => (j === i ? clave : x))); });
  };

  const solicitar = () => ejecutar(async () => {
    if (!cedente || !cesionario) throw new Error(`Seleccione ${config.etiquetaCedente.toLowerCase()} y ${config.etiquetaCesionario.toLowerCase()}.`);
    if (cedente.id === cesionario.id) throw new Error('El cedente y el cesionario deben ser distintos.');
    if (validacion.error) throw new Error(validacion.error);
    const ocupados = await titulosEnOperacionPendiente(elegidos.map((x) => x.titulo));
    if (ocupados.length) throw new Error(`Los títulos ${ocupados.join(', ')} ya están en otra operación pendiente de aprobación.`);
    await solicitarOperacion({
      tipo: config.tipo,
      vinculos: [{ accionista: cedente, detalle: 'Cedente' }, { accionista: cesionario, detalle: 'Cesionario' }],
      titulos: elegidos.map((x) => x.titulo),
      acciones: validacion.total,
      documento: documentos.join('&'),
      usuario: Auth.user ? Auth.user.username : '',
    });
    setCedente(null);
    setCesionario(null);
    setTitulos([]);
    setSeleccion({});
    setDocumentos(POSICIONES_DOCUMENTO.map(() => ''));
    setMensaje({ tipo: 'success', texto: `Se registró la solicitud de ${config.titulo.toLowerCase()}. Queda pendiente de aprobación.` });
  });

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <div className={classes.encabezado}>
        <Avatar className={classes.avatar}>{config.icono}</Avatar>
        <div>
          <Typography variant="h6">{config.titulo}</Typography>
          <Typography variant="body2" color="textSecondary">{config.descripcion}</Typography>
        </div>
      </div>

      <Paper variant="outlined" style={{ marginBottom: 16 }}>
        <Stepper activeStep={paso}>
          <Step><StepLabel>{`${config.etiquetaCedente} y ${config.etiquetaCesionario.toLowerCase()}`}</StepLabel></Step>
          <Step><StepLabel>Títulos y acciones</StepLabel></Step>
          <Step><StepLabel optional={<Typography variant="caption">Opcional</Typography>}>Documentos</StepLabel></Step>
          <Step><StepLabel>Solicitar aprobación</StepLabel></Step>
        </Stepper>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper variant="outlined" className={classes.tarjeta}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <SelectorAccionista etiqueta={config.etiquetaCedente} opciones={accionistas} valor={cedente} onChange={elegirCedente} />
              </Grid>
              <Grid item xs={12} md={2} style={{ textAlign: 'center' }}><ArrowForwardIcon color="action" /></Grid>
              <Grid item xs={12} md={5}>
                <SelectorAccionista etiqueta={config.etiquetaCesionario} opciones={accionistas.filter((a) => !cedente || a.id !== cedente.id)} valor={cesionario} onChange={setCesionario} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper variant="outlined" className={classes.tarjeta}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle1">Títulos a transferir</Typography>
              {validacion.total > 0 && <Chip color="primary" label={`${enteros(validacion.total)} acciones${validacion.parcial ? ' (parcial)' : ''}`} />}
            </Box>
            {!cedente && <Typography variant="body2" color="textSecondary">{`Seleccione ${config.etiquetaCedente.toLowerCase()} para ver sus títulos.`}</Typography>}
            {cedente && titulos.length === 0 && !cargando && <Typography variant="body2" color="textSecondary">No tiene títulos activos.</Typography>}
            {titulos.length > 0 && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" />
                    <TableCell>Título</TableCell>
                    <TableCell align="right">Rango</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                    <TableCell align="right" style={{ width: 160 }}>A transferir</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {titulos.map((t) => {
                    const elegido = t.id in seleccion;
                    return (
                      <TableRow key={t.id} hover selected={elegido}>
                        <TableCell padding="checkbox">
                          <Checkbox color="primary" checked={elegido} onChange={() => alternar(t)} inputProps={{ 'aria-label': `Seleccionar título ${t.id}` }} />
                        </TableCell>
                        <TableCell>{t.id}</TableCell>
                        <TableCell align="right">{`${enteros(t.tit_desde)} – ${enteros(t.tit_hasta)}`}</TableCell>
                        <TableCell align="right">{enteros(t.tit_acciones)}</TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small" disabled={!elegido} value={elegido ? seleccion[t.id] : ''}
                            onChange={(e) => setSeleccion((s) => ({ ...s, [t.id]: e.target.value.replace(/[^0-9]/g, '') }))}
                            inputProps={{ inputMode: 'numeric', style: { textAlign: 'right' }, 'aria-label': `Acciones a transferir del título ${t.id}` }}
                            error={elegido && (parseInt(seleccion[t.id], 10) || 0) > t.tit_acciones}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            {elegidos.length > 0 && validacion.error && <MuiAlert severity="warning" style={{ marginTop: 12 }}>{validacion.error}</MuiAlert>}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" className={classes.tarjeta}>
            <Typography variant="subtitle1" gutterBottom>{`Documentos (${documentosCargados}/${config.documentos.length})`}</Typography>
            {config.documentos.map((etiqueta, i) => (
              <Box key={etiqueta} display="flex" alignItems="center" justifyContent="space-between" py={0.5}>
                <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                  <CheckCircleIcon fontSize="small" color={documentos[i] ? 'primary' : 'disabled'} />
                  <Typography variant="body2">{etiqueta}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  {documentos[i] && <IconButton size="small" title="Ver" onClick={() => ejecutar(() => abrirArchivo(documentos[i]))}><PageviewIcon /></IconButton>}
                  {documentos[i] && <IconButton size="small" title="Quitar" onClick={() => setDocumentos((d) => d.map((x, j) => (j === i ? '' : x)))}><DeleteOutlineIcon /></IconButton>}
                  <IconButton size="small" component="label" color="primary" title={documentos[i] ? 'Reemplazar' : 'Subir PDF'}>
                    <CloudUploadOutlinedIcon />
                    <input hidden type="file" accept="application/pdf" onChange={subir(i)} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2} style={{ gap: 8 }}>
        {cargando && <CircularProgress size={24} />}
        <Button variant="contained" color="primary" startIcon={<SendIcon />} onClick={solicitar}
          disabled={cargando || !cedente || !cesionario || !!validacion.error}>
          Solicitar aprobación
        </Button>
      </Box>

      <Snackbar open={!!mensaje} autoHideDuration={6000} onClose={(e, razon) => razon !== 'clickaway' && setMensaje(null)}>
        {mensaje ? <MuiAlert elevation={6} variant="filled" severity={mensaje.tipo} onClose={() => setMensaje(null)}>{mensaje.texto}</MuiAlert> : <span />}
      </Snackbar>
    </main>
  );
}
