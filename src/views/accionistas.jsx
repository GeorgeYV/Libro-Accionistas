import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid, Typography, Button, Chip, TextField, IconButton, Tooltip, Paper, Box, Tabs, Tab, Divider,
  Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Snackbar, InputAdornment,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import MuiAlert from '@material-ui/lab/Alert';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import PageviewIcon from '@material-ui/icons/Pageview';
import DevicesOutlinedIcon from '@material-ui/icons/DevicesOutlined';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import PrintIcon from '@material-ui/icons/Print';
import QRcode from 'qrcode.react';
import { exportarCertificado, URL_VERIFICACION } from '../components/certificado';
import { cargarAccionistas, cargarDetalle } from '../services/accionistas';
import { abrirArchivo } from '../services/archivos';
import {
  ESTADOS_ACCIONISTA, TIPOS_IDENTIFICACION, ESTADOS_CIVILES, TIPOS_TITULO, separar, buscarAccionistas, filasContacto,
} from '../utils/accionistas';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: { ...theme.mixins.toolbar },
  content: { flexGrow: 1, padding: theme.spacing(2) },
  encabezado: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: theme.spacing(1), marginBottom: theme.spacing(2) },
  tarjeta: { padding: theme.spacing(1.5), textAlign: 'center', height: '100%' },
  toolbar: { display: 'flex', justifyContent: 'space-between', padding: theme.spacing(1, 1, 0) },
  seccion: { marginTop: theme.spacing(2), marginBottom: theme.spacing(1) },
}));

const enteros = (n) => new Intl.NumberFormat('en-US').format(n || 0);
const decimales = (n, d) => new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n || 0);
const etiquetaEstado = (valor) => (ESTADOS_ACCIONISTA.find((e) => e.valor === valor) || {}).singular || '-';
const texto = (v) => (v == null || v === '' ? '-' : v);

function Toolbar({ value, onChange }) {
  const classes = useStyles();
  return (
    <GridToolbarContainer className={classes.toolbar}>
      <TextField
        size="small" value={value} placeholder="Buscar accionista…" onChange={(e) => onChange(e.target.value)} style={{ width: 320 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
          endAdornment: value ? <IconButton size="small" title="Limpiar" onClick={() => onChange('')}><ClearIcon fontSize="small" /></IconButton> : null,
        }}
      />
      <GridToolbarExport csvOptions={{ fileName: 'accionistas' }} />
    </GridToolbarContainer>
  );
}

function Dato({ titulo, valor }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="caption" color="textSecondary">{titulo}</Typography>
      <Typography variant="body2">{texto(valor)}</Typography>
    </Grid>
  );
}

function Seccion({ titulo, children }) {
  const classes = useStyles();
  return (
    <>
      <Typography variant="subtitle2" color="primary" className={classes.seccion}>{titulo}</Typography>
      <Grid container spacing={2}>{children}</Grid>
    </>
  );
}

function TarjetaDato({ titulo, valor }) {
  const classes = useStyles();
  return (
    <Paper variant="outlined" className={classes.tarjeta}>
      <Typography variant="caption" color="textSecondary">{titulo}</Typography>
      <Typography variant="h6">{valor}</Typography>
    </Paper>
  );
}

export default function Accionistas() {
  const classes = useStyles();
  const [accionistas, setAccionistas] = useState([]);
  const [parametro, setParametro] = useState({ cantidadEmitida: 0, valorNominal: 0 });
  const [estado, setEstado] = useState(1);
  const [detallada, setDetallada] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [seleccionado, setSeleccionado] = useState(null);
  const [detalle, setDetalle] = useState({ titulos: [], conyuge: null });
  const [tab, setTab] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  async function ejecutar(fn) {
    setCargando(true);
    try {
      await fn();
    } catch (err) {
      console.log('Error en accionistas:', err);
      setError(err.message || 'No se pudieron cargar los datos.');
    }
    setCargando(false);
  }

  // Una sola carga; cambiar de estado o buscar filtra en memoria.
  useEffect(() => {
    ejecutar(async () => {
      const datos = await cargarAccionistas();
      setAccionistas(datos.accionistas);
      setParametro(datos.parametro);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const conteo = useMemo(() => Object.fromEntries(ESTADOS_ACCIONISTA.map((e) => [e.valor, accionistas.filter((a) => a.acc_estado === e.valor).length])), [accionistas]);
  const delEstado = useMemo(() => accionistas.filter((a) => a.acc_estado === estado), [accionistas, estado]);
  const filas = useMemo(() => buscarAccionistas(delEstado, busqueda), [delEstado, busqueda]);
  const accionesEstado = useMemo(() => delEstado.reduce((s, a) => s + (a.acc_cantidad_acciones || 0), 0), [delEstado]);

  const abrir = (accionista) => ejecutar(async () => {
    setDetalle(await cargarDetalle(accionista));
    setSeleccionado(accionista);
    setTab(0);
  });

  const participacion = { field: 'acc_participacion', headerName: '% Part.', type: 'number', width: 120, valueFormatter: (p) => decimales((p.value || 0) * 100, 8) };
  const acciones = { field: 'acc_cantidad_acciones', headerName: 'Acciones', type: 'number', width: 120, valueFormatter: (p) => enteros(p.value) };
  const columnas = detallada
    ? [
      { field: 'acc_tipo_identificacion', headerName: 'Tipo Id', width: 100, valueFormatter: (p) => TIPOS_IDENTIFICACION[p.value] || p.value },
      { field: 'acc_identificacion', headerName: 'Identificación', width: 130 },
      { field: 'acc_decevale', headerName: 'Decevale', width: 100 },
      { field: 'acc_nombre_completo', headerName: 'Nombre', width: 260 },
      { field: 'acc_direccion', headerName: 'Calle', width: 180 },
      { field: 'acc_dir_numero', headerName: 'Número', width: 90 },
      { field: 'acc_banco', headerName: 'Banco', width: 130 },
      { field: 'acc_tipo_cuenta', headerName: 'Tipo cta.', width: 100 },
      { field: 'acc_cuenta_bancaria', headerName: 'Cuenta', width: 130 },
      { field: 'acc_pais', headerName: 'Nacionalidad', width: 120 },
      acciones,
      participacion,
      { field: 'acc_tipo_acciones', headerName: 'Tipo acciones', width: 130, valueFormatter: (p) => (p.value === 1 ? 'Desmaterializadas' : 'Ordinarias') },
      { field: 'acc_telefonos', headerName: 'Teléfonos', width: 180, valueFormatter: (p) => separar(p.value).join(', ') },
      { field: 'acc_correos', headerName: 'Correos', width: 220, valueFormatter: (p) => separar(p.value).join(', ') },
      { field: 'acc_tipo_persona', headerName: 'Persona', width: 100, valueFormatter: (p) => (p.value === 1 ? 'Jurídica' : 'Natural') },
    ]
    : [
      { field: 'acc_identificacion', headerName: 'Identificación', width: 130 },
      { field: 'acc_decevale', headerName: 'Decevale', width: 100 },
      { field: 'acc_nombre_completo', headerName: 'Nombre', flex: 1, minWidth: 240 },
      { field: 'acc_nacionalidad', headerName: 'Nacionalidad', width: 120 },
      { field: 'acc_residencia', headerName: 'Residencia', width: 120 },
      acciones,
      participacion,
      {
        field: 'acc_tipo_acciones', headerName: 'Tipo', width: 70,
        renderCell: (p) => (p.value === 1
          ? <Tooltip title="Desmaterializadas"><DevicesOutlinedIcon /></Tooltip>
          : <Tooltip title="Ordinarias"><DescriptionOutlinedIcon color="error" /></Tooltip>),
      },
      {
        field: 'acc_estado', headerName: 'Estado', width: 110,
        renderCell: (p) => <Chip variant="outlined" size="small" label={etiquetaEstado(p.value)} color={p.value === 1 ? 'primary' : 'secondary'} />,
      },
      { field: 'acc_tiene_herederos', headerName: 'Herederos', width: 100, valueFormatter: (p) => (p.value ? 'Sí' : 'No') },
      {
        field: 'opciones', headerName: '', width: 100, sortable: false, disableExport: true,
        renderCell: (p) => (
          <>
            <IconButton size="small" color="primary" title="Ver detalle" onClick={() => abrir(p.row)}><PageviewIcon /></IconButton>
            <IconButton size="small" color="primary" title="Editar" component={Link}
              to={{ pathname: p.row.acc_tipo_persona === 0 ? '/personanatural' : '/personajuridica', state: { preloadedValue: p.row } }}>
              <EditIcon />
            </IconButton>
          </>
        ),
      },
    ];

  const s = seleccionado || {};
  const telefonos = filasContacto(s.acc_telefonos, s.acc_obs_telefonos);
  const correos = separar(s.acc_correos);
  const esNatural = s.acc_tipo_persona === 0;
  const documentos = [
    ['Documento de identidad', s.pn_doc_identificacion],
    ['Certificado bancario', s.acc_doc_certificado_bancario],
    ['Actualización de datos', s.acc_doc_actualizacion_datos],
    ['Autorización de uso de datos', s.acc_doc_uso_datos],
    ['Posesión efectiva', s.acc_doc_posesion_efectiva],
    ...(esNatural ? [] : [['Nombramiento del representante legal', s.pj_doc_nombramiento]]),
    ...(detalle.conyuge ? [['Documento de identidad del cónyuge', detalle.conyuge.con_doc_identifcacion]] : []),
  ];

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <div className={classes.encabezado}>
        <Typography variant="h6">Accionistas</Typography>
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
          <ToggleButtonGroup size="small" exclusive value={estado} onChange={(e, v) => v !== null && setEstado(v)}>
            {ESTADOS_ACCIONISTA.map((e) => (
              <ToggleButton key={e.valor} value={e.valor} style={{ textTransform: 'none' }}>{`${e.etiqueta} (${conteo[e.valor] || 0})`}</ToggleButton>
            ))}
          </ToggleButtonGroup>
          <ToggleButtonGroup size="small" exclusive value={detallada} onChange={(e, v) => v !== null && setDetallada(v)}>
            <ToggleButton value={false} style={{ textTransform: 'none' }}>Resumen</ToggleButton>
            <ToggleButton value style={{ textTransform: 'none' }}>Detallada</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </div>

      <Grid container spacing={2} style={{ marginBottom: 16 }}>
        <Grid item xs={12} sm={4}><TarjetaDato titulo="Accionistas" valor={enteros(delEstado.length)} /></Grid>
        <Grid item xs={12} sm={4}><TarjetaDato titulo="Acciones" valor={enteros(accionesEstado)} /></Grid>
        <Grid item xs={12} sm={4}><TarjetaDato titulo="% del capital" valor={`${decimales(parametro.cantidadEmitida ? accionesEstado * 100 / parametro.cantidadEmitida : 0, 4)}%`} /></Grid>
      </Grid>

      <DataGrid
        style={{ backgroundColor: 'white' }}
        autoHeight density="compact" disableColumnMenu disableSelectionOnClick
        rows={filas} columns={columnas}
        pageSize={pageSize} onPageSizeChange={setPageSize} rowsPerPageOptions={[20, 50, 100]}
        components={{ Toolbar }}
        componentsProps={{ toolbar: { value: busqueda, onChange: setBusqueda } }}
      />

      <Dialog open={!!seleccionado} onClose={() => setSeleccionado(null)} fullWidth maxWidth="md">
        {seleccionado && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                <span>{s.acc_nombre_completo}</span>
                <Box display="flex" style={{ gap: 4 }}>
                  <Chip size="small" label={etiquetaEstado(s.acc_estado)} color={s.acc_estado === 1 ? 'primary' : 'secondary'} />
                  <Chip size="small" variant="outlined" label={esNatural ? 'Persona natural' : 'Persona jurídica'} />
                  <Chip size="small" variant="outlined" label={s.acc_tipo_acciones === 1 ? 'Desmaterializadas' : 'Ordinarias'} />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent style={{ minHeight: '55vh' }}>
              <Tabs value={tab} onChange={(e, v) => setTab(v)} indicatorColor="primary" textColor="primary">
                <Tab label="Información" />
                <Tab label="Documentos" />
                <Tab label={`Títulos (${detalle.titulos.length})`} />
                <Tab label="Certificado" />
              </Tabs>
              <Divider />

              {tab === 0 && (
                <>
                  <Seccion titulo="Identificación">
                    <Dato titulo="Tipo de identificación" valor={TIPOS_IDENTIFICACION[s.acc_tipo_identificacion] || 'Pasaporte'} />
                    <Dato titulo="Identificación" valor={s.acc_identificacion} />
                    <Dato titulo="Decevale" valor={s.acc_decevale} />
                    <Dato titulo="Nacionalidad" valor={s.acc_nacionalidad} />
                    <Dato titulo="Residencia" valor={s.acc_residencia} />
                    {esNatural && <Dato titulo="Estado civil" valor={ESTADOS_CIVILES[s.pn_estado_civil] || 'Viudo'} />}
                    <Dato titulo="Acciones" valor={enteros(s.acc_cantidad_acciones)} />
                    <Dato titulo="Participación" valor={`${decimales((s.acc_participacion || 0) * 100, 8)}%`} />
                    <Dato titulo="Capital" valor={`USD ${decimales((s.acc_cantidad_acciones || 0) * parametro.valorNominal, 2)}`} />
                  </Seccion>
                  <Seccion titulo="Dirección y banco">
                    <Dato titulo="Dirección" valor={[s.acc_direccion, s.acc_dir_numero].filter(Boolean).join(' ')} />
                    <Dato titulo="Ciudad / Provincia / País" valor={[s.acc_ciudad, s.acc_provincia, s.acc_pais].filter(Boolean).join(', ')} />
                    <Dato titulo="Cuenta bancaria" valor={s.acc_banco ? [s.acc_banco, s.acc_tipo_cuenta, s.acc_cuenta_bancaria].filter(Boolean).join(' ') : ''} />
                  </Seccion>
                  <Seccion titulo="Contacto">
                    {(telefonos.length ? telefonos : [{ numero: '', obs: '' }]).map((t, i) => (
                      <Dato key={`t${i}`} titulo={`Teléfono #${i + 1}${t.obs ? ` (${t.obs})` : ''}`} valor={t.numero} />
                    ))}
                    {(correos.length ? correos : ['']).map((c, i) => <Dato key={`c${i}`} titulo={`Email #${i + 1}`} valor={c} />)}
                  </Seccion>
                  {detalle.conyuge && (
                    <Seccion titulo="Cónyuge">
                      <Dato titulo="Tipo de identificación" valor={TIPOS_IDENTIFICACION[detalle.conyuge.con_tipo_identificacion]} />
                      <Dato titulo="Identificación" valor={detalle.conyuge.con_identificacion} />
                      <Dato titulo="Nombre" valor={detalle.conyuge.con_nombre} />
                      <Dato titulo="Nacionalidad" valor={detalle.conyuge.con_nacionalidad} />
                    </Seccion>
                  )}
                  {!esNatural && (
                    <Seccion titulo="Representante legal">
                      <Dato titulo="Tipo de identificación" valor={TIPOS_IDENTIFICACION[s.pj_rl_tipo_identificacion]} />
                      <Dato titulo="Identificación" valor={s.pj_rl_identificacion} />
                      <Dato titulo="Nombre" valor={s.pj_rl_nombre} />
                      <Dato titulo="Nacionalidad" valor={s.pj_rl_nacionalidad} />
                      <Dato titulo="Teléfono" valor={s.pj_rl_telefono} />
                      <Dato titulo="Email" valor={s.pj_rl_email} />
                    </Seccion>
                  )}
                </>
              )}

              {tab === 1 && (
                <Box mt={2}>
                  {documentos.map(([titulo, archivo]) => (
                    <Box key={titulo} display="flex" alignItems="center" justifyContent="space-between" py={0.5}>
                      <Typography variant="body2">{titulo}</Typography>
                      {archivo
                        ? <Button size="small" color="primary" startIcon={<PageviewIcon />} onClick={() => ejecutar(() => abrirArchivo(archivo))}>Ver</Button>
                        : <Typography variant="body2" color="textSecondary">No registrado</Typography>}
                    </Box>
                  ))}
                </Box>
              )}

              {tab === 2 && (
                <Box mt={2}>
                  <DataGrid
                    autoHeight density="compact" disableColumnMenu disableSelectionOnClick hideFooter={detalle.titulos.length <= 10} pageSize={10}
                    rows={detalle.titulos}
                    columns={[
                      { field: 'id', headerName: 'Título', flex: 1, minWidth: 200 },
                      { field: 'tit_acciones', headerName: 'Acciones', type: 'number', width: 110, valueFormatter: (p) => enteros(p.value) },
                      { field: 'tit_desde', headerName: 'Desde', type: 'number', width: 110, valueFormatter: (p) => enteros(p.value) },
                      { field: 'tit_hasta', headerName: 'Hasta', type: 'number', width: 110, valueFormatter: (p) => enteros(p.value) },
                      { field: 'tit_estado', headerName: 'Estado', width: 100, valueFormatter: (p) => TIPOS_TITULO[p.value] || p.value },
                      { field: 'updatedAt', headerName: 'Actualizado', width: 120, valueFormatter: (p) => (p.value ? p.value.slice(0, 10) : '') },
                    ]}
                  />
                </Box>
              )}

              {tab === 3 && (
                <Box mt={4} display="flex" flexDirection="column" alignItems="center">
                  <QRcode value={URL_VERIFICACION} id="qrcode" size={100} />
                  <Button startIcon={<PrintIcon />} variant="contained" color="primary" style={{ textTransform: 'none', marginTop: 16 }}
                    onClick={() => exportarCertificado(s, parametro)}>
                    Imprimir certificado de acciones
                  </Button>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={() => setSeleccionado(null)}>Salir</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {cargando && <CircularProgress style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 2000 }} />}
      <Snackbar open={!!error} autoHideDuration={8000} onClose={() => setError('')}>
        <MuiAlert elevation={6} variant="filled" severity="error" onClose={() => setError('')}>{error}</MuiAlert>
      </Snackbar>
    </main>
  );
}
