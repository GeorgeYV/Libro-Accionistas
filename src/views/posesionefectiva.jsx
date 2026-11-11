import React, { useState, useEffect, useMemo } from 'react';
import { Auth } from 'aws-amplify';
import {
  Paper, Grid, Typography, TextField, Button, Snackbar, Avatar, Box, Chip, IconButton, Radio,
  Table, TableHead, TableBody, TableRow, TableCell, Stepper, Step, StepLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import MuiAlert from '@material-ui/lab/Alert';
import AccountBalanceOutlinedIcon from '@material-ui/icons/AccountBalanceOutlined';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import PageviewIcon from '@material-ui/icons/Pageview';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import SendIcon from '@material-ui/icons/Send';
import { listAccionistas } from '../graphql/queries';
import { listarTodos } from '../services/listarTodos';
import { listarTitulosVigentes, listarHerederosDe, solicitarPosesionEfectiva, revisarHerederos } from '../services/operaciones';
import { subirArchivo, abrirArchivo } from '../services/archivos';
import { repartoInicial, validarReparto } from '../utils/operaciones';
import Cargando from '../components/cargando';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: { ...theme.mixins.toolbar },
  content: { flexGrow: 1, padding: theme.spacing(2) },
  encabezado: { display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), marginBottom: theme.spacing(2) },
  avatar: { backgroundColor: theme.palette.primary.main },
  tarjeta: { padding: theme.spacing(2), height: '100%' },
}));

const enteros = (n) => new Intl.NumberFormat('en-US').format(n || 0);
// Orden de ope_documento ("cs&cg&ci&es&cp"), igual que en las demás operaciones: el blotter los lee por posición.
const DOCUMENTOS = ['Partición extrajudicial', 'Impuesto a la herencia', 'Declaración jurada', 'Escritura de posesión efectiva de bienes', 'Carta poder'];

// Solicita la posesión efectiva de un título del causante, repartido entre sus herederos registrados.
// Al aprobarse en el blotter, cada heredero recibe su tramo del título (los nuevos quedan como accionistas bloqueados).
export default function PosesionEfectiva() {
  const classes = useStyles();
  const [causantes, setCausantes] = useState([]);
  const [causante, setCausante] = useState(null);
  const [titulos, setTitulos] = useState([]);
  const [tituloId, setTituloId] = useState('');
  const [herederos, setHerederos] = useState([]);
  const [revision, setRevision] = useState({}); // id del heredero -> { existe, problemas }
  const [cantidades, setCantidades] = useState([]); // texto por heredero
  const [documentos, setDocumentos] = useState(() => DOCUMENTOS.map(() => ''));
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }

  async function ejecutar(fn) {
    setCargando(true);
    try {
      await fn();
    } catch (err) {
      console.log('Error en posesión efectiva:', err);
      setMensaje({ tipo: 'error', texto: err.message || 'Ocurrió un error al registrar la operación.' });
    }
    setCargando(false);
  }

  useEffect(() => {
    ejecutar(async () => {
      const lista = await listarTodos(listAccionistas, 'listAccionistas', { filter: { acc_tiene_herederos: { eq: true }, acc_estado: { eq: 1 } } });
      setCausantes(lista.sort((a, b) => (a.acc_nombre_completo || '').localeCompare(b.acc_nombre_completo || '')));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const titulo = titulos.find((t) => t.id === tituloId) || null;
  const total = titulo ? titulo.tit_acciones : 0;

  const elegirTitulo = (t, lista = herederos) => {
    setTituloId(t ? t.id : '');
    setCantidades(repartoInicial(lista, t ? t.tit_acciones : 0).map(String));
  };

  const elegirCausante = (valor) => {
    setCausante(valor);
    setTitulos([]);
    setHerederos([]);
    setRevision({});
    setTituloId('');
    setCantidades([]);
    if (!valor) return;
    ejecutar(async () => {
      const [lista, suyos] = await Promise.all([listarTitulosVigentes(valor.id), listarHerederosDe(valor.id)]);
      const activos = lista.filter((t) => t.tit_estado === 1);
      setTitulos(activos);
      setHerederos(suyos);
      setRevision(Object.fromEntries((await revisarHerederos(suyos, valor.id)).map((r) => [r.heredero.id, r])));
      elegirTitulo(activos.length === 1 ? activos[0] : null, suyos);
    });
  };

  const numeros = useMemo(() => cantidades.map((c) => parseInt(c, 10) || 0), [cantidades]);
  const validacion = titulo ? validarReparto(numeros, total) : { asignado: 0, error: 'Seleccione el título.' };
  const documentosCargados = documentos.filter(Boolean).length;
  // Herederos que reciben acciones y ya son accionistas con datos incompletos o no válidos.
  const herederosInvalidos = herederos.filter((h, i) => numeros[i] > 0 && revision[h.id] && revision[h.id].problemas.length);
  const paso = !causante ? 0 : !titulo ? 1 : validacion.error ? 2 : documentosCargados === 0 ? 3 : 4;

  const subir = (i) => (e) => {
    const archivo = e.target.files[0];
    e.target.value = '';
    if (archivo) ejecutar(async () => { const clave = await subirArchivo(archivo); setDocumentos((d) => d.map((x, j) => (j === i ? clave : x))); });
  };

  const solicitar = () => ejecutar(async () => {
    if (!causante || !titulo) throw new Error('Seleccione el causante y el título.');
    if (validacion.error) throw new Error(validacion.error);
    await solicitarPosesionEfectiva({
      causante,
      titulo,
      reparto: herederos.map((h, i) => ({ heredero: h, acciones: numeros[i] })),
      documento: documentos.join('&'),
      usuario: Auth.user ? Auth.user.username : '',
    });
    elegirCausante(null);
    setDocumentos(DOCUMENTOS.map(() => ''));
    setMensaje({ tipo: 'success', texto: 'Se registró la solicitud de posesión efectiva. Queda pendiente de aprobación.' });
  });

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <div className={classes.encabezado}>
        <Avatar className={classes.avatar}><AccountBalanceOutlinedIcon /></Avatar>
        <div>
          <Typography variant="h6">Posesión efectiva</Typography>
          <Typography variant="body2" color="textSecondary">
            Reparte un título del causante entre sus herederos registrados. Se aprueba un título por operación.
          </Typography>
        </div>
      </div>

      <Paper variant="outlined" style={{ marginBottom: 16 }}>
        <Stepper activeStep={paso}>
          <Step><StepLabel>Causante</StepLabel></Step>
          <Step><StepLabel>Título</StepLabel></Step>
          <Step><StepLabel>Reparto entre herederos</StepLabel></Step>
          <Step><StepLabel optional={<Typography variant="caption">Opcional</Typography>}>Documentos</StepLabel></Step>
          <Step><StepLabel>Solicitar aprobación</StepLabel></Step>
        </Stepper>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" className={classes.tarjeta}>
            <Typography variant="subtitle1" gutterBottom>Causante</Typography>
            <Autocomplete
              size="small"
              options={causantes}
              value={causante}
              onChange={(e, v) => elegirCausante(v)}
              getOptionLabel={(o) => o.acc_nombre_completo || ''}
              getOptionSelected={(o, v) => o.id === v.id}
              noOptionsText="No hay accionistas activos con herederos registrados"
              renderOption={(o) => (
                <Box>
                  <Typography variant="body2">{o.acc_nombre_completo}</Typography>
                  <Typography variant="caption" color="textSecondary">{`${o.acc_identificacion} — ${enteros(o.acc_cantidad_acciones)} acciones`}</Typography>
                </Box>
              )}
              renderInput={(params) => <TextField {...params} label="Accionista con herederos registrados" variant="outlined" />}
            />
            {causante && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>Títulos activos</Typography>
                {titulos.length === 0 && !cargando && <Typography variant="body2" color="textSecondary">No tiene títulos activos.</Typography>}
                {titulos.length > 0 && (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" />
                        <TableCell>Título</TableCell>
                        <TableCell align="right">Rango</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {titulos.map((t) => (
                        <TableRow key={t.id} hover selected={t.id === tituloId} onClick={() => elegirTitulo(t)} style={{ cursor: 'pointer' }}>
                          <TableCell padding="checkbox"><Radio color="primary" checked={t.id === tituloId} inputProps={{ 'aria-label': `Título ${t.id}` }} /></TableCell>
                          <TableCell>{t.id}</TableCell>
                          <TableCell align="right">{`${enteros(t.tit_desde)} – ${enteros(t.tit_hasta)}`}</TableCell>
                          <TableCell align="right">{enteros(t.tit_acciones)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {titulos.length > 1 && <MuiAlert severity="info" style={{ marginTop: 8 }}>El causante tiene varios títulos: registre una posesión efectiva por cada uno.</MuiAlert>}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper variant="outlined" className={classes.tarjeta} style={{ marginBottom: 16, height: 'auto' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle1">Reparto entre herederos</Typography>
              {titulo && <Chip color={validacion.error ? 'default' : 'primary'} label={`${enteros(validacion.asignado)} de ${enteros(total)} acciones`} />}
            </Box>
            {!causante && <Typography variant="body2" color="textSecondary">Seleccione el causante para ver sus herederos.</Typography>}
            {causante && herederos.length === 0 && !cargando && (
              <MuiAlert severity="warning">El accionista no tiene herederos registrados. Regístrelos en su ficha de persona natural.</MuiAlert>
            )}
            {herederos.length > 0 && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Identificación</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Registro</TableCell>
                    <TableCell align="right" style={{ width: 160 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {herederos.map((h, i) => (
                    <TableRow key={h.id}>
                      <TableCell>{h.her_identificacion}</TableCell>
                      <TableCell>{h.her_nombre}</TableCell>
                      <TableCell>
                        {!revision[h.id] ? null : revision[h.id].problemas.length
                          ? <Typography variant="caption" color="error">{`Accionista no válido: ${revision[h.id].problemas.join('; ')}`}</Typography>
                          : <Chip size="small" variant="outlined" label={!revision[h.id].existe ? 'Se creará como heredero' : revision[h.id].fichaIncompleta ? 'Recibirá como heredero (ficha incompleta)' : 'Accionista registrado'} />}
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small" disabled={!titulo} value={cantidades[i] || ''}
                          onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setCantidades((c) => c.map((x, j) => (j === i ? v : x))); }}
                          inputProps={{ inputMode: 'numeric', style: { textAlign: 'right' }, 'aria-label': `Acciones de ${h.her_nombre}` }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {herederosInvalidos.length > 0 && (
              <MuiAlert severity="error" style={{ marginTop: 12 }}>
                Hay herederos que ya son accionistas con datos incompletos o no válidos. Complete su ficha en Accionistas o asígneles 0 acciones.
              </MuiAlert>
            )}
            {titulo && herederos.length > 0 && validacion.error && <MuiAlert severity="warning" style={{ marginTop: 12 }}>{validacion.error}</MuiAlert>}
          </Paper>

          <Paper variant="outlined" className={classes.tarjeta} style={{ height: 'auto' }}>
            <Typography variant="subtitle1" gutterBottom>{`Documentos (${documentosCargados}/${DOCUMENTOS.length})`}</Typography>
            {DOCUMENTOS.map((etiqueta, i) => (
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
        <Cargando abierto={cargando} />
        <Button variant="contained" color="primary" startIcon={<SendIcon />} onClick={solicitar}
          disabled={cargando || !causante || !titulo || herederos.length === 0 || !!validacion.error || herederosInvalidos.length > 0}>
          Solicitar aprobación
        </Button>
      </Box>

      <Snackbar open={!!mensaje} autoHideDuration={6000} onClose={(e, razon) => razon !== 'clickaway' && setMensaje(null)}>
        {mensaje ? <MuiAlert elevation={6} variant="filled" severity={mensaje.tipo} onClose={() => setMensaje(null)}>{mensaje.texto}</MuiAlert> : <span />}
      </Snackbar>
    </main>
  );
}
