import React, { useState, useEffect, useMemo } from 'react';
import { Auth } from 'aws-amplify';
import {
  Paper, Grid, Typography, Button, Chip, IconButton, TextField, Tabs, Tab, Badge, Box, Divider, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import PageviewIcon from '@material-ui/icons/Pageview';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import {
  cargarOperaciones, cargarDetalle, aprobar, anular, rechazar, reenviar, guardarDocumentos,
  ESTADOS_OPERACION, MOTIVOS_RECHAZO, DOCUMENTOS_POR_TIPO,
} from '../services/aprobacion';
import { subirArchivo, abrirArchivo } from '../services/archivos';
import { valorFecha } from '../utils/libro'; // entiende d-m-aaaa y aaaammdd (registros antiguos)
import Cargando from '../components/cargando';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: { ...theme.mixins.toolbar },
  content: { flexGrow: 1, padding: theme.spacing(2) },
  toolbar: { display: 'flex', justifyContent: 'space-between', padding: theme.spacing(1, 1, 0) },
  tarjeta: { padding: theme.spacing(2), height: '100%' },
  peligro: { backgroundColor: theme.palette.error.main, color: theme.palette.error.contrastText, '&:hover': { backgroundColor: theme.palette.error.dark } },
}));

const enteros = (n) => new Intl.NumberFormat('en-US').format(n || 0);
const COLOR_ESTADO = { 0: 'default', 1: 'primary', 2: 'secondary', 3: 'secondary' };
const ETIQUETA_PRINCIPAL = { 0: 'Beneficiario', 1: 'Accionista', 2: 'Accionista', 3: 'Cedente', 4: 'Accionista', 5: 'Donante', 6: 'Causante', 7: 'Testador' };
const ETIQUETA_CESIONARIO = { 3: 'Cesionario', 5: 'Donatario', 7: 'Beneficiario' };

function Toolbar({ value, onChange }) {
  const classes = useStyles();
  return (
    <GridToolbarContainer className={classes.toolbar}>
      <TextField
        size="small" value={value} placeholder="Buscar operación…" onChange={(e) => onChange(e.target.value)} style={{ width: 320 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
          endAdornment: value ? <IconButton size="small" title="Limpiar" onClick={() => onChange('')}><ClearIcon fontSize="small" /></IconButton> : null,
        }}
      />
      <GridToolbarExport csvOptions={{ fileName: 'operaciones' }} />
    </GridToolbarContainer>
  );
}

function Dato({ titulo, valor }) {
  return (
    <Box mb={1}>
      <Typography variant="caption" color="textSecondary">{titulo}</Typography>
      <Typography variant="body2">{valor || '-'}</Typography>
    </Box>
  );
}

export default function Operaciones() {
  const classes = useStyles();
  const [operaciones, setOperaciones] = useState([]);
  const [estado, setEstado] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionada, setSeleccionada] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [motivos, setMotivos] = useState([]);
  const [confirmar, setConfirmar] = useState(null); // 'aprobar' | 'anular' | 'rechazar' | 'reenviar'
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }
  const usuario = Auth.user ? Auth.user.username : '';

  async function ejecutar(fn) {
    setCargando(true);
    try {
      await fn();
    } catch (err) {
      console.log('Error en operaciones:', err);
      setMensaje({ tipo: 'error', texto: err.message || 'Ocurrió un error al procesar la operación.' });
    }
    setCargando(false);
  }

  const recargar = () => ejecutar(async () => setOperaciones(await cargarOperaciones()));
  useEffect(() => { recargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const conteo = useMemo(() => [0, 1, 2, 3].map((e) => operaciones.filter((o) => o.ope_estado === e).length), [operaciones]);
  const filas = useMemo(() => {
    const t = busqueda.trim().toLowerCase();
    return operaciones
      .filter((o) => o.ope_estado === estado)
      .filter((o) => !t || [o.tipo, o.ope_fecha, o.ope_ingresador, o.ope_aprobador, o.ope_acciones, o.ope_observacion]
        .some((v) => v != null && String(v).toLowerCase().includes(t)))
      .sort((a, b) => valorFecha(b.ope_fecha) - valorFecha(a.ope_fecha));
  }, [operaciones, estado, busqueda]);

  const abrir = (op) => ejecutar(async () => {
    const d = await cargarDetalle(op);
    const etiquetas = DOCUMENTOS_POR_TIPO[op.ope_tipo] || [];
    const guardados = String(op.ope_documento || '').split('&');
    setDocumentos(etiquetas.map((_, i) => guardados[i] || ''));
    setMotivos([]);
    setDetalle(d);
    setSeleccionada(op);
  });
  // La confirmación se cierra primero: tras un await React 17 no agrupa los cambios y el diálogo leía la operación ya en null.
  const cerrar = () => { setConfirmar(null); setSeleccionada(null); setDetalle(null); };

  // Acciones que cambian datos: siempre tras confirmar.
  const ACCIONES = {
    aprobar: { titulo: 'Aprobar operación', texto: 'Se aplicarán los cambios sobre accionistas y títulos.', boton: 'Aprobar', fn: () => aprobar(seleccionada, detalle, usuario), exito: 'La operación se aprobó correctamente.' },
    anular: { titulo: 'Anular operación', texto: 'Se revertirán los cambios que hizo la aprobación.', boton: 'Anular', fn: () => anular(seleccionada, detalle, usuario), exito: 'La operación se anuló correctamente.' },
    rechazar: { titulo: 'Rechazar operación', texto: 'La operación quedará rechazada con los motivos indicados.', boton: 'Rechazar', fn: () => rechazar(seleccionada, motivos, usuario), exito: 'La operación se rechazó.' },
    reenviar: { titulo: 'Volver a solicitar aprobación', texto: 'La operación volverá a quedar pendiente.', boton: 'Reenviar', fn: () => reenviar(seleccionada), exito: 'La operación volvió a pendientes.' },
  };
  const ejecutarAccion = () => {
    const accion = ACCIONES[confirmar];
    ejecutar(async () => {
      const resultado = await accion.fn();
      cerrar();
      setMensaje(resultado && resultado.aviso ? { tipo: 'warning', texto: resultado.aviso } : { tipo: 'success', texto: accion.exito });
      setOperaciones(await cargarOperaciones());
    });
  };

  const reemplazarDocumento = (i) => (e) => {
    const archivo = e.target.files[0];
    e.target.value = '';
    if (archivo) ejecutar(async () => { const clave = await subirArchivo(archivo); setDocumentos((d) => d.map((x, j) => (j === i ? clave : x))); });
  };
  const documentosCambiaron = seleccionada && documentos.join('&') !== (DOCUMENTOS_POR_TIPO[seleccionada.ope_tipo] || []).map((_, i) => String(seleccionada.ope_documento || '').split('&')[i] || '').join('&');
  const guardarDocs = () => ejecutar(async () => {
    const ope_documento = await guardarDocumentos(seleccionada, documentos);
    setSeleccionada((s) => ({ ...s, ope_documento }));
    setOperaciones((lista) => lista.map((o) => (o.id === seleccionada.id ? { ...o, ope_documento } : o)));
    setMensaje({ tipo: 'success', texto: 'Documentos actualizados.' });
  });

  const columnas = [
    { field: 'ope_fecha', headerName: 'Fecha', width: 110, sortComparator: (a, b) => valorFecha(a) - valorFecha(b) },
    { field: 'tipo', headerName: 'Operación', flex: 1, minWidth: 160 },
    { field: 'ope_acciones', headerName: 'Acciones', type: 'number', width: 130, valueFormatter: (p) => enteros(p.value) },
    { field: 'ope_ingresador', headerName: 'Solicitante', flex: 1, minWidth: 140 },
    ...(estado === 0 ? [] : [
      { field: 'ope_aprobador', headerName: 'Revisor', flex: 1, minWidth: 140 },
      { field: 'ope_fecha_aprobacion', headerName: 'Fecha revisión', width: 130, sortComparator: (a, b) => valorFecha(a) - valorFecha(b) },
    ]),
    ...(estado === 2 ? [{ field: 'ope_observacion', headerName: 'Motivo', flex: 1, minWidth: 180 }] : []),
    {
      field: 'revisar', headerName: '', width: 120, sortable: false, disableExport: true,
      renderCell: (p) => <Button size="small" color="primary" startIcon={<PageviewIcon />} onClick={() => abrir(p.row)}>{estado === 0 ? 'Revisar' : 'Detalle'}</Button>,
    },
  ];

  const op = seleccionada;
  const etiquetas = op ? DOCUMENTOS_POR_TIPO[op.ope_tipo] || [] : [];
  const puedeEditarDocs = op && (op.ope_estado === 1 || op.ope_estado === 2);

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h6">Operaciones</Typography>
        <Cargando abierto={cargando} />
      </Box>
      <Paper variant="outlined">
        <Tabs value={estado} onChange={(e, v) => { setEstado(v); setBusqueda(''); }} indicatorColor="primary" textColor="primary" variant="fullWidth">
          {[0, 1, 2, 3].map((e) => (
            <Tab key={e} value={e} label={<Badge color={e === 0 ? 'secondary' : 'default'} badgeContent={conteo[e]} max={999} showZero={false}><Box pr={2}>{`${ESTADOS_OPERACION[e]}s`}</Box></Badge>} />
          ))}
        </Tabs>
      </Paper>
      <DataGrid
        style={{ backgroundColor: 'white', marginTop: 8 }}
        autoHeight density="compact" disableColumnMenu disableSelectionOnClick
        rows={filas} columns={columnas} pageSize={20} rowsPerPageOptions={[20]}
        components={{ Toolbar }} componentsProps={{ toolbar: { value: busqueda, onChange: setBusqueda } }}
        localeText={{ noRowsLabel: `No hay operaciones ${ESTADOS_OPERACION[estado].toLowerCase()}s` }}
      />

      <Dialog open={!!op} onClose={cerrar} fullWidth maxWidth="lg">
        {op && detalle && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <span>{op.tipo}</span>
                <Chip label={ESTADOS_OPERACION[op.ope_estado]} color={COLOR_ESTADO[op.ope_estado]} />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" className={classes.tarjeta}>
                    <Typography variant="subtitle1" gutterBottom>Detalle</Typography>
                    <Dato titulo="Fecha de solicitud" valor={op.ope_fecha} />
                    <Dato titulo="Solicitante" valor={op.ope_ingresador} />
                    {op.ope_estado !== 0 && <Dato titulo="Revisor / fecha" valor={`${op.ope_aprobador || '-'} — ${op.ope_fecha_aprobacion || '-'}`} />}
                    {op.ope_observacion && <Dato titulo="Motivos de rechazo" valor={op.ope_observacion} />}
                    <Dato titulo="Acciones" valor={enteros(op.ope_acciones)} />
                    <Divider style={{ margin: '8px 0' }} />
                    <Dato titulo={ETIQUETA_PRINCIPAL[op.ope_tipo] || 'Accionista'} valor={detalle.principal ? `${detalle.principal.acc_nombre_completo} (${detalle.principal.id})` : 'No encontrado'} />
                    {detalle.cesionario && (
                      <>
                        <ArrowForwardIcon color="action" fontSize="small" />
                        <Dato titulo={ETIQUETA_CESIONARIO[op.ope_tipo] || 'Cesionario'} valor={`${detalle.cesionario.acc_nombre_completo} (${detalle.cesionario.id})`} />
                      </>
                    )}
                    {!detalle.principal && <MuiAlert severity="error">No se encontró el accionista vinculado a la operación.</MuiAlert>}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" className={classes.tarjeta}>
                    <Typography variant="subtitle1" gutterBottom>{op.ope_tipo === 6 ? 'Título y herederos' : 'Títulos'}</Typography>
                    {detalle.titulos.length === 0
                      ? <Typography variant="body2" color="textSecondary">{op.ope_tipo === 0 ? 'El título se crea al aprobar el aumento.' : 'Sin títulos vinculados.'}</Typography>
                      : (
                        <Table size="small">
                          <TableHead><TableRow><TableCell>Título</TableCell><TableCell align="right">Acciones</TableCell></TableRow></TableHead>
                          <TableBody>
                            {detalle.titulos.map((t) => (
                              <TableRow key={t.id}><TableCell>{t.tit_ope_titulo_id}</TableCell><TableCell align="right">{enteros(t.tit_ope_acciones)}</TableCell></TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    {op.ope_tipo === 6 && (
                      <Box mt={2}>
                        <Typography variant="subtitle2">Herederos</Typography>
                        {detalle.herederos.length === 0
                          ? <MuiAlert severity="warning">El causante no tiene herederos registrados.</MuiAlert>
                          : (
                            <Table size="small">
                              <TableHead><TableRow><TableCell>Heredero</TableCell><TableCell align="right">Acciones</TableCell></TableRow></TableHead>
                              <TableBody>
                                {detalle.herederos.map((h) => (
                                  <TableRow key={h.id}><TableCell>{`${h.her_nombre} (${h.her_identificacion})`}</TableCell><TableCell align="right">{enteros(h.her_cant_acciones)}</TableCell></TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                      </Box>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" className={classes.tarjeta}>
                    <Typography variant="subtitle1" gutterBottom>Documentos</Typography>
                    {etiquetas.map((etiqueta, i) => (
                      <Box key={etiqueta} display="flex" alignItems="center" justifyContent="space-between" py={0.5}>
                        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                          <CheckCircleIcon fontSize="small" color={documentos[i] ? 'primary' : 'disabled'} />
                          <Typography variant="body2">{etiqueta}</Typography>
                        </Box>
                        <Box display="flex">
                          {documentos[i] && <IconButton size="small" title="Ver" onClick={() => ejecutar(() => abrirArchivo(documentos[i]))}><PageviewIcon /></IconButton>}
                          {puedeEditarDocs && (
                            <IconButton size="small" component="label" color="primary" title="Reemplazar documento">
                              <CloudUploadOutlinedIcon />
                              <input hidden type="file" accept="application/pdf" onChange={reemplazarDocumento(i)} />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    ))}
                    {puedeEditarDocs && documentosCambiaron && (
                      <Button size="small" variant="outlined" color="primary" style={{ marginTop: 8 }} onClick={guardarDocs}>Guardar documentos</Button>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {op.ope_estado === 0 && (
                <Box mt={2} display="flex" alignItems="center" style={{ gap: 8 }}>
                  <TextField
                    select size="small" variant="outlined" label="Motivos de rechazo" style={{ minWidth: 320 }}
                    SelectProps={{ multiple: true, renderValue: (sel) => sel.map((v) => MOTIVOS_RECHAZO.find((m) => m.valor === v).etiqueta).join(', ') }}
                    value={motivos} onChange={(e) => setMotivos(e.target.value)}
                  >
                    {MOTIVOS_RECHAZO.map((m) => <MenuItem key={m.valor} value={m.valor}>{m.etiqueta}</MenuItem>)}
                  </TextField>
                  <Typography variant="caption" color="textSecondary">Solo para rechazar</Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              {op.ope_estado === 0 && <Button color="secondary" disabled={cargando || motivos.length === 0} onClick={() => setConfirmar('rechazar')}>Rechazar</Button>}
              {op.ope_estado === 0 && <Button variant="contained" color="primary" disabled={cargando || (!detalle.principal && op.ope_tipo !== 6)} onClick={() => setConfirmar('aprobar')}>Aprobar</Button>}
              {op.ope_estado === 1 && <Button variant="contained" className={classes.peligro} disabled={cargando} onClick={() => setConfirmar('anular')}>Anular</Button>}
              {op.ope_estado === 2 && <Button variant="contained" color="primary" disabled={cargando} onClick={() => setConfirmar('reenviar')}>Volver a solicitar aprobación</Button>}
              <Button onClick={cerrar}>Salir</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={!!confirmar && !!op} onClose={() => setConfirmar(null)}>
        {confirmar && op && (
          <>
            <DialogTitle>{ACCIONES[confirmar].titulo}</DialogTitle>
            <DialogContent>
              <Typography>{`${op.tipo} de ${enteros(op.ope_acciones)} acciones. ${ACCIONES[confirmar].texto}`}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmar(null)}>Cancelar</Button>
              <Button variant="contained" color={confirmar === 'anular' || confirmar === 'rechazar' ? 'secondary' : 'primary'} disabled={cargando} onClick={ejecutarAccion}>
                {ACCIONES[confirmar].boton}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={!!mensaje} autoHideDuration={8000} onClose={(e, razon) => razon !== 'clickaway' && setMensaje(null)}>
        {mensaje ? <MuiAlert elevation={6} variant="filled" severity={mensaje.tipo} onClose={() => setMensaje(null)}>{mensaje.texto}</MuiAlert> : <span />}
      </Snackbar>
    </main>
  );
}
