import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import {
  Grid, Paper, Typography, Button, TextField, Chip, CircularProgress, Snackbar, Box,
  Dialog, DialogActions, DialogContent, DialogTitle,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';
import { DataGrid } from '@mui/x-data-grid';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import PrintIcon from '@material-ui/icons/Print';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import QRcode from 'qrcode.react';
import { exportarCertificado, URL_VERIFICACION } from '../components/certificado';
import { cargarDashboardAccionista, registrarEnAsamblea, subirArchivo } from '../services/asambleas';
import { tieneRepresentante } from '../utils/asambleas';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: { ...theme.mixins.toolbar },
  content: { flexGrow: 1, padding: theme.spacing(2) },
  encabezado: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: theme.spacing(1), padding: theme.spacing(2) },
  tarjeta: { padding: theme.spacing(1.5), textAlign: 'center', height: '100%' },
  seccion: { padding: theme.spacing(2) },
}));

const enteros = (n) => new Intl.NumberFormat('en-US').format(n || 0);
const decimales = (n, d) => new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n || 0);
const SIN_REPRESENTANTE = { representanteNombre: '', representanteDocumento: '', representanteDI: '' };

function TarjetaDato({ titulo, valor }) {
  const classes = useStyles();
  return (
    <Grid item xs={6} md={3}>
      <Paper variant="outlined" className={classes.tarjeta}>
        <Typography variant="caption" color="textSecondary">{titulo}</Typography>
        <Typography variant="h6">{valor}</Typography>
      </Paper>
    </Grid>
  );
}

export default function AccionistaDashboard() {
  const classes = useStyles();
  const [accionista, setAccionista] = useState(null);
  const [parametro, setParametro] = useState({ cantidadEmitida: 0, valorNominal: 0 });
  const [asambleas, setAsambleas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  const [seleccionada, setSeleccionada] = useState(null);
  const [representante, setRepresentante] = useState(SIN_REPRESENTANTE);
  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const usuario = Auth.user ? Auth.user.username : null;

  useEffect(() => {
    if (!usuario) { setCargando(false); return; }
    cargarDashboardAccionista(usuario)
      .then((datos) => {
        setAccionista(datos.accionista);
        setParametro(datos.parametro);
        setAsambleas(datos.asambleas);
      })
      .catch((err) => {
        console.log('Error al cargar el dashboard:', err);
        setMensaje({ tipo: 'error', texto: 'No se pudo cargar la información del accionista.' });
      })
      .finally(() => setCargando(false));
  }, [usuario]);

  function abrirRegistro(asamblea) {
    const r = asamblea.registro;
    setRepresentante(r && tieneRepresentante(r)
      ? { representanteNombre: r.representanteNombre, representanteDocumento: r.representanteDocumento || '', representanteDI: r.representanteDI || '' }
      : SIN_REPRESENTANTE);
    setArchivo(null);
    setSeleccionada(asamblea);
  }

  async function registrarse() {
    setGuardando(true);
    try {
      const datos = { ...representante, representanteNombre: representante.representanteNombre.trim(), representanteDocumento: representante.representanteDocumento.trim() };
      if (archivo) datos.representanteDI = await subirArchivo(archivo);
      const registro = await registrarEnAsamblea(seleccionada, accionista, datos);
      setAsambleas((lista) => lista.map((a) => (a.id === seleccionada.id ? { ...a, registro } : a)));
      setSeleccionada(null);
      setMensaje({ tipo: 'success', texto: 'Registro en la asamblea guardado.' });
    } catch (err) {
      console.log('Error al registrarse en la asamblea:', err);
      setMensaje({ tipo: 'error', texto: 'No se pudo guardar el registro. Intente nuevamente.' });
    } finally {
      setGuardando(false);
    }
  }

  const columnas = [
    { field: 'tipo', headerName: 'Asamblea', width: 130 },
    { field: 'fecha', headerName: 'Fecha', width: 110 },
    { field: 'hora', headerName: 'Hora', width: 90 },
    { field: 'lugar', headerName: 'Lugar', flex: 1, minWidth: 140 },
    { field: 'link', headerName: 'Enlace', flex: 1, minWidth: 180 },
    {
      field: 'registrado', headerName: 'Registrado', width: 120, sortable: false,
      renderCell: (p) => (p.row.registro
        ? <Chip size="small" color="primary" label="Sí" />
        : <Chip size="small" variant="outlined" label="No" />),
    },
    {
      field: 'representante', headerName: 'Representante', width: 180, sortable: false,
      valueGetter: (p) => (p.row.registro && tieneRepresentante(p.row.registro) ? p.row.registro.representanteNombre : ''),
    },
    {
      field: 'acciones', headerName: '', width: 140, sortable: false,
      renderCell: (p) => (
        <Button size="small" color="primary" startIcon={<HowToRegIcon />} style={{ textTransform: 'none' }} onClick={() => abrirRegistro(p.row)}>
          {p.row.registro ? 'Modificar' : 'Registrarse'}
        </Button>
      ),
    },
  ];

  if (cargando) {
    return (
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
      </main>
    );
  }

  const acciones = accionista ? accionista.acc_cantidad_acciones || 0 : 0;
  const participacion = parametro.cantidadEmitida ? acciones * 100 / parametro.cantidadEmitida : 0;

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />

      {!accionista ? (
        <MuiAlert severity="warning">No se encontró un accionista asociado a su usuario. Comuníquese con la administración.</MuiAlert>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper variant="outlined" className={classes.encabezado}>
              <div>
                <Typography variant="h6">{accionista.acc_nombre_completo}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {accionista.acc_tipo_identificacion}: {accionista.acc_identificacion}
                </Typography>
              </div>
              <Button startIcon={<PrintIcon />} variant="contained" color="primary" style={{ textTransform: 'none' }}
                onClick={() => exportarCertificado(accionista, parametro)}>
                Imprimir certificado de acciones
              </Button>
              <QRcode hidden value={URL_VERIFICACION} id="qrcode" size={100} />
            </Paper>
          </Grid>

          <TarjetaDato titulo="Acciones" valor={enteros(acciones)} />
          <TarjetaDato titulo="Capital (USD)" valor={decimales(acciones * parametro.valorNominal, 2)} />
          <TarjetaDato titulo="Participación (%)" valor={decimales(participacion, 8)} />
          <TarjetaDato titulo="Valor nominal (USD)" valor={decimales(parametro.valorNominal, 2)} />

          <Grid item xs={12}>
            <Paper variant="outlined" className={classes.seccion}>
              <Typography variant="subtitle1" gutterBottom>Convocatorias abiertas</Typography>
              {asambleas.length === 0 ? (
                <Typography variant="body2" color="textSecondary">No hay asambleas convocadas en este momento.</Typography>
              ) : (
                <DataGrid
                  autoHeight density="compact" disableColumnMenu disableSelectionOnClick hideFooter
                  rows={asambleas} columns={columnas}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      <Dialog open={!!seleccionada} onClose={() => !guardando && setSeleccionada(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Registro en asamblea</DialogTitle>
        {seleccionada && (
          <DialogContent>
            <Typography variant="body2"><b>{seleccionada.tipo}</b> · {seleccionada.fecha} {seleccionada.hora}</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>{seleccionada.lugar}</Typography>
            <Typography variant="body2" style={{ marginTop: 16 }}>
              Si asistirá mediante un representante, ingrese sus datos (opcional).
            </Typography>
            <Grid container spacing={2} style={{ marginTop: 4 }}>
              <Grid item xs={12} sm={7}>
                <TextField fullWidth size="small" variant="outlined" label="Nombre del representante"
                  value={representante.representanteNombre}
                  onChange={(e) => setRepresentante({ ...representante, representanteNombre: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField fullWidth size="small" variant="outlined" label="Identificación"
                  value={representante.representanteDocumento}
                  onChange={(e) => setRepresentante({ ...representante, representanteDocumento: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <label htmlFor="documento-representante">
                  <input style={{ display: 'none' }} id="documento-representante" type="file" accept="application/pdf"
                    onChange={(e) => setArchivo(e.target.files[0] || null)} />
                  <Button startIcon={<CloudUploadOutlinedIcon />} variant="outlined" component="span" color="primary" size="small" style={{ textTransform: 'none' }}>
                    Identificación del representante
                  </Button>
                </label>
                <Typography variant="caption" color="textSecondary" style={{ marginLeft: 8 }}>
                  {archivo ? archivo.name : (representante.representanteDI ? 'Documento cargado' : 'Sin documento')}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
        )}
        <DialogActions>
          <Button color="primary" disabled={guardando} onClick={() => setSeleccionada(null)} style={{ textTransform: 'none' }}>Salir</Button>
          <Button variant="contained" color="primary" disabled={guardando} onClick={registrarse} style={{ textTransform: 'none' }}
            startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : <HowToRegIcon />}>
            {seleccionada && seleccionada.registro ? 'Guardar cambios' : 'Registrarse'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!mensaje} autoHideDuration={6000} onClose={() => setMensaje(null)}>
        {mensaje ? <MuiAlert elevation={6} variant="filled" severity={mensaje.tipo} onClose={() => setMensaje(null)}>{mensaje.texto}</MuiAlert> : <span />}
      </Snackbar>
    </main>
  );
}
