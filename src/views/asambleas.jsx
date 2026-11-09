import React, { useState, useEffect, useMemo } from 'react';
import { Storage } from 'aws-amplify';
import {
  Grid, Typography, Button, Chip, TextField, FormControl, Box, Tabs, Tab, IconButton, Checkbox, InputLabel, Select,
  MenuItem, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, CircularProgress, Divider, Paper,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DataGrid } from '@mui/x-data-grid';
import MuiAlert from '@material-ui/lab/Alert';
import Autocomplete from '@material-ui/lab/Autocomplete';
import PageviewIcon from '@material-ui/icons/Pageview';
import CheckIcon from '@material-ui/icons/Check';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import DeleteIcon from '@material-ui/icons/Delete';
import { PieChart } from 'react-minimal-pie-chart';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../images/logoUNACEMmedMarco2.png';
import { guardarFotoTitulos, obtenerFotoTitulos } from '../services/fotoTitulos';
import {
  cargarInicio, cargarRegistros, crearAsamblea, actualizarAsamblea, guardarRegistro, eliminarRegistro, subirArchivo, abrirArchivo,
} from '../services/asambleas';
import {
  unirListaAsistencia, filtrarPorNombre, TEMAS, asambleaCerrada, temasDe, resumenQuorum, conteoVotos,
} from '../utils/asambleas';
import { resultadoVotacion } from '../utils/dividendos';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: { ...theme.mixins.toolbar },
  content: { flexGrow: 1, padding: theme.spacing(2) },
  encabezado: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing(2) },
  boton: { borderRadius: 20, textTransform: 'none' },
  tarjeta: { padding: theme.spacing(1.5), textAlign: 'center', height: '100%' },
  fila: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: theme.spacing(1), marginBottom: theme.spacing(2) },
}));

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />;
const numero = (n, decimales = 2) => new Intl.NumberFormat('en-US', { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(n || 0);
const enteros = (n) => new Intl.NumberFormat('en-US').format(n || 0);
const COLORES = { presentes: '#00BCD4', representados: '#CDDC39', ausentes: '#FFB74D' };
const formularioVacio = () => ({
  tipo: '', fecha: '', hora: '', lugar: '', link: '', ordenDia: '', temaDividendo: '', nroTemas: 0,
  ...Object.fromEntries(TEMAS.map((n) => ['votacionTema' + n, ''])),
});
const subtituloAsamblea = (a) => `Asamblea ${a.tipo || ''} - ${a.fecha || ''} - ${a.lugar || ''}`;

function nuevoPdf(titulo, asamblea) {
  const doc = new jsPDF('landscape', 'pt', 'A4');
  doc.setFontSize(12);
  doc.addImage(logo, 'JPEG', 700, 20, 80, 30);
  doc.text(titulo, 40, 40);
  doc.setTextColor(100);
  doc.setFontSize(10);
  doc.text(subtituloAsamblea(asamblea), 40, 55);
  return doc;
}

// Fila de documento: subir, ver y quitar (acta o expediente de un tema).
function Documento({ etiqueta, nombre, onSubir, onQuitar }) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" py={0.5}>
      <Typography variant="body2">{etiqueta}</Typography>
      <Box display="flex" alignItems="center">
        {nombre && <IconButton size="small" title="Ver" onClick={() => abrirArchivo(nombre)}><PageviewIcon /></IconButton>}
        {nombre && <IconButton size="small" title="Quitar" onClick={onQuitar}><DeleteIcon /></IconButton>}
        <Button component="label" size="small" variant="outlined" color="primary" startIcon={<CloudUploadOutlinedIcon />} style={{ textTransform: 'none' }}>
          {nombre ? 'Reemplazar' : 'Subir'}
          <input hidden type="file" onChange={onSubir} />
        </Button>
      </Box>
    </Box>
  );
}

function TarjetaDato({ titulo, valor, clase }) {
  return (
    <Paper variant="outlined" className={clase}>
      <Typography variant="caption" color="textSecondary">{titulo}</Typography>
      <Typography variant="h6">{valor}</Typography>
    </Paper>
  );
}

export default function Asambleas() {
  const classes = useStyles();
  const [parametros, setParametros] = useState({ cantidadEmitida: 1, valorNominal: 1 });
  const [asambleas, setAsambleas] = useState([]);
  const [accionistas, setAccionistas] = useState([]); // activos con acciones
  const [asambleaSeleccionada, setAsambleaSeleccionada] = useState(null);
  const [accionistasxJuntas, setAccionistasxJuntas] = useState([]); // registros guardados de la asamblea
  const [tab, setTab] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaVotacion, setBusquedaVotacion] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [temaVotacion, setTemaVotacion] = useState('');
  const [representado, setRepresentado] = useState({ accionista: null, nombre: '', identificacion: '', documento: '' });
  const [openCrear, setOpenCrear] = useState(false);
  const [formData, setFormData] = useState(formularioVacio());
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }

  const { cantidadEmitida, valorNominal } = parametros;
  const cerrada = asambleaCerrada(asambleaSeleccionada);

  async function ejecutar(fn, exito) {
    setCargando(true);
    try {
      await fn();
      if (exito) setMensaje({ tipo: 'success', texto: exito });
    } catch (err) {
      console.log('Error en asambleas:', err);
      setMensaje({ tipo: 'error', texto: err.message || 'Ocurrió un error al guardar.' });
    }
    setCargando(false);
  }

  // Carga inicial (una sola vez): parámetros, asambleas y accionistas activos con acciones.
  useEffect(() => {
    ejecutar(async () => {
      const { parametro, asambleas: lista, activos } = await cargarInicio();
      setParametros(parametro);
      setAsambleas(lista);
      setAccionistas(activos);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Datos derivados ------------------------------------------------------------------------
  const listaAsistencia = useMemo(() => unirListaAsistencia(accionistas, accionistasxJuntas), [accionistas, accionistasxJuntas]);
  const filasAsistencia = useMemo(() => filtrarPorNombre(listaAsistencia, busqueda), [listaAsistencia, busqueda]);
  const presentes = useMemo(() => accionistasxJuntas.filter((r) => r.presente === true), [accionistasxJuntas]);
  const filasVotacion = useMemo(() => filtrarPorNombre(presentes, busquedaVotacion), [presentes, busquedaVotacion]);
  const resumen = useMemo(
    () => resumenQuorum(accionistasxJuntas, accionistas.length, cantidadEmitida, valorNominal),
    [accionistasxJuntas, accionistas.length, cantidadEmitida, valorNominal]);
  const temas = temasDe(asambleaSeleccionada);

  // ---- Acciones -------------------------------------------------------------------------------
  const reemplazarRegistro = (anteriorId, registro) => setAccionistasxJuntas((lista) => (
    lista.some((r) => r.id === anteriorId) ? lista.map((r) => (r.id === anteriorId ? registro : r)) : [...lista, registro]));

  // Actualiza la asamblea en el API y en el estado local (detalle y grilla).
  const cambiarAsamblea = async (cambios) => {
    await actualizarAsamblea(asambleaSeleccionada.id, cambios);
    setAsambleaSeleccionada((a) => ({ ...a, ...cambios }));
    setAsambleas((lista) => lista.map((a) => (a.id === asambleaSeleccionada.id ? { ...a, ...cambios } : a)));
  };

  const abrirAsamblea = (asamblea) => ejecutar(async () => {
    setAccionistasxJuntas(await cargarRegistros(asamblea.id));
    setAsambleaSeleccionada(asamblea);
    setTemaVotacion(String(temasDe(asamblea)[0] || ''));
    setBusqueda('');
    setBusquedaVotacion('');
    setTab(0);
  });

  const validarAbierta = () => {
    if (cerrada) throw new Error(`La asamblea está ${asambleaSeleccionada.estado}; no se puede modificar la asistencia ni los votos.`);
  };

  // Marca/desmarca presente. Si la fila es virtual crea el registro en ese momento.
  const togglePresente = (item) => ejecutar(async () => {
    validarAbierta();
    const registro = await guardarRegistro(asambleaSeleccionada, item, { presente: !item.presente });
    reemplazarRegistro(item.id, registro);
    await cambiarAsamblea({ registrados: presentes.filter((r) => r.id !== item.id).length + (registro.presente ? 1 : 0) });
  });

  const toggleVoto = (item) => ejecutar(async () => {
    validarAbierta();
    const campo = 'votacion' + temaVotacion;
    reemplazarRegistro(item.id, await guardarRegistro(asambleaSeleccionada, item, { [campo]: !item[campo] }));
  });

  const quitarRegistro = (item) => ejecutar(async () => {
    validarAbierta();
    await eliminarRegistro(item.id);
    setAccionistasxJuntas((lista) => lista.filter((r) => r.id !== item.id));
  });

  // Registra a un accionista con representante (o actualiza su registro). Queda presente.
  const agregarRepresentado = () => ejecutar(async () => {
    validarAbierta();
    const acc = representado.accionista;
    if (!acc) throw new Error('Seleccione el accionista representado.');
    const item = listaAsistencia.find((i) => i.accionistaID === acc.id) || unirListaAsistencia([acc], [])[0];
    const registro = await guardarRegistro(asambleaSeleccionada, item, {
      presente: true,
      representanteNombre: representado.nombre,
      representanteDocumento: representado.identificacion,
      representanteDI: representado.documento,
    });
    reemplazarRegistro(item.id, registro);
    await cambiarAsamblea({ registrados: presentes.filter((r) => r.id !== item.id).length + 1 });
    setRepresentado({ accionista: null, nombre: '', identificacion: '', documento: '' });
  }, 'Accionista registrado con representante.');

  // Subir un archivo a S3 y guardar su nombre (documentos de la asamblea o del formulario).
  const leerArchivo = (e) => {
    const archivo = e.target.files[0];
    e.target.value = '';
    return archivo;
  };
  const subirDocumento = (campo) => (e) => {
    const archivo = leerArchivo(e);
    if (archivo) ejecutar(async () => cambiarAsamblea({ [campo]: await subirArchivo(archivo) }));
  };
  const quitarDocumento = (campo) => () => ejecutar(async () => {
    await Storage.remove(asambleaSeleccionada[campo]);
    await cambiarAsamblea({ [campo]: '' });
  });
  const subirAFormulario = (guardar) => (e) => {
    const archivo = leerArchivo(e);
    if (archivo) ejecutar(async () => guardar(await subirArchivo(archivo)));
  };

  const cerrarQuorum = () => ejecutar(async () => {
    const d = new Date();
    // Foto de TODO el libro a la fecha de corte: base para el reparto de dividendos.
    await guardarFotoTitulos(asambleaSeleccionada.id);
    await cambiarAsamblea({ cierreQuorum: true, horaCierreQuorum: `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}` });
  }, 'Quórum cerrado y foto de títulos guardada.');

  const finalizarAsamblea = () => ejecutar(async () => {
    // Respaldo: si el quórum no se cerró, la foto se toma al finalizar.
    if ((await obtenerFotoTitulos(asambleaSeleccionada.id)).length === 0) await guardarFotoTitulos(asambleaSeleccionada.id);
    await cambiarAsamblea({ estado: 'Realizada' });
  }, 'Asamblea finalizada.');

  // ---- Crear asamblea -------------------------------------------------------------------------
  const campo = (nombre) => (e) => setFormData((f) => ({ ...f, [nombre]: e.target.value }));
  const cerrarCrear = () => { setOpenCrear(false); setFormData(formularioVacio()); };
  const crear = () => {
    const { nroTemas, ...datos } = formData;
    if (!datos.tipo || !datos.lugar || !datos.fecha || !datos.hora) {
      setMensaje({ tipo: 'error', texto: 'Complete tipo, lugar, fecha y hora.' });
      return;
    }
    ejecutar(async () => {
      TEMAS.filter((n) => n > nroTemas).forEach((n) => { datos['votacionTema' + n] = ''; });
      const creada = await crearAsamblea({
        ...datos,
        fecha: datos.fecha.split('-').reverse().join('-'), // se guarda d-m-aaaa
        estado: 'Convocatoria',
        registrados: 0,
        votaciones: nroTemas,
        temaDividendo: datos.temaDividendo === '' ? null : parseInt(datos.temaDividendo, 10),
      });
      setAsambleas((lista) => [...lista, creada]);
      cerrarCrear();
    }, 'Se registró correctamente la asamblea.');
  };

  // ---- PDF ------------------------------------------------------------------------------------
  const pdfListado = () => {
    const doc = nuevoPdf('Listado de Accionistas para Asamblea', asambleaSeleccionada);
    doc.autoTable({
      theme: 'plain',
      startY: 70,
      head: [['Código', 'Nombre', 'Identificacion', 'Acciones', 'Participación', 'Capital', 'Representante', 'Presente']],
      body: listaAsistencia.map((r) => [r.accionistaID, r.nombre, r.identificacion, r.acciones, (r.acciones * 100 / cantidadEmitida).toFixed(10),
        (r.acciones * valorNominal).toFixed(2), r.representanteNombre || '', r.presente === true ? 'Sí' : '']),
      columnStyles: { 0: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 7: { halign: 'center' } },
    });
    doc.addPage('A4', 'l');
    doc.text(`Quorum en Acciones  :     ${resumen.quorum.acciones}`, 40, 50);
    doc.text(`Quorum en Capital $ :     ${resumen.quorum.capital.toFixed(2)}`, 40, 80);
    doc.text(`Quorum Participación:     ${resumen.quorum.pctCapital.toFixed(8)}`, 40, 110);
    doc.save('ListadoAccionistasAsamblea.pdf');
  };

  const pdfQuorum = () => {
    const doc = nuevoPdf('Quorum Asamblea', asambleaSeleccionada);
    doc.setTextColor(0);
    [['Capital', 200], ['Porcentajes', 300], ['Accionistas', 500], ['Porcentajes', 600]].forEach(([t, x]) => doc.text(t, x, 80));
    const fila = (titulo, g, y) => {
      doc.text(titulo, 40, y);
      doc.text(g.capital.toFixed(2), 250, y, null, null, 'right');
      doc.text(`${g.pctCapital.toFixed(2)}%`, 350, y, null, null, 'right');
      doc.text(String(g.personas), 550, y, null, null, 'right');
      doc.text(`${g.pctPersonas.toFixed(2)}%`, 650, y, null, null, 'right');
    };
    fila('Total :', resumen.total, 100);
    fila('Presentes :', resumen.presentes, 120);
    fila('Representados :', resumen.representados, 140);
    fila('Ausentes :', resumen.ausentes, 160);
    doc.setTextColor('blue');
    fila('Quorum :', resumen.quorum, 180);
    doc.setTextColor('black');
    if (asambleaSeleccionada.horaCierreQuorum) doc.text(`Hora de Cierre Quorum : ${asambleaSeleccionada.horaCierreQuorum}`, 40, 220);
    doc.save('ResumenQuorumAsamblea.pdf');
  };

  const pdfVotaciones = () => {
    const doc = nuevoPdf('Votaciones de Asamblea', asambleaSeleccionada);
    doc.setFontSize(8);
    doc.autoTable({
      theme: 'plain',
      startY: 70,
      head: [['Nombre', ...temas.map((n) => `Tema ${n}`)]],
      body: presentes.map((r) => [r.nombre, ...temas.map((n) => (r['votacion' + n] === true ? 'Sí' : ''))]),
      styles: { fontSize: 8, halign: 'center' },
      columnStyles: { 0: { halign: 'left' } },
    });
    doc.addPage('A4', 'l');
    doc.setFontSize(10);
    temas.forEach((n, i) => {
      const v = conteoVotos(accionistasxJuntas, n);
      doc.text(`Tema ${n} :  ${asambleaSeleccionada['votacionTema' + n]} (a favor ${v.aFavor}, en contra ${v.enContra})`, 40, 50 + i * 15);
    });
    doc.save('ListadoVotacionesAsamblea.pdf');
  };

  // ---- Columnas -------------------------------------------------------------------------------
  const columnasAsambleas = [
    { field: 'tipo', headerName: 'Asamblea', width: 130 },
    { field: 'fecha', headerName: 'Fecha', width: 110 },
    { field: 'hora', headerName: 'Hora', width: 80 },
    { field: 'lugar', headerName: 'Lugar', flex: 1, minWidth: 140 },
    { field: 'link', headerName: 'Enlace', flex: 1, minWidth: 160 },
    {
      field: 'estado', headerName: 'Estado', width: 160,
      renderCell: (p) => <Chip size="small" variant="outlined" label={p.value} color={asambleaCerrada(p.row) ? 'secondary' : 'primary'} />,
    },
    { field: 'registrados', headerName: 'Presentes', type: 'number', width: 100 },
    { field: 'votaciones', headerName: 'Temas', type: 'number', width: 80 },
    {
      field: 'abrir', headerName: '', width: 70, sortable: false,
      renderCell: (p) => <IconButton color="primary" title="Abrir" onClick={() => abrirAsamblea(p.row)}><PageviewIcon /></IconButton>,
    },
  ];

  const columnasAsistencia = [
    { field: 'nombre', headerName: 'Accionista', flex: 1, minWidth: 220 },
    { field: 'identificacion', headerName: 'Identificación', width: 130 },
    { field: 'acciones', headerName: 'Acciones', type: 'number', width: 110, valueFormatter: (p) => enteros(p.value) },
    { field: 'participacion', headerName: '% Part.', type: 'number', width: 90, valueGetter: (p) => p.row.acciones * 100 / cantidadEmitida, valueFormatter: (p) => numero(p.value, 4) },
    {
      field: 'presente', headerName: 'Presente', width: 95, sortable: false,
      renderCell: (p) => <Checkbox color="primary" checked={p.row.presente === true} disabled={cerrada} onChange={() => togglePresente(p.row)} inputProps={{ 'aria-label': `Presente ${p.row.nombre}` }} />,
    },
    { field: 'representanteNombre', headerName: 'Representante', width: 160 },
    { field: 'representanteDocumento', headerName: 'Ident. rep.', width: 110 },
    {
      field: 'opciones', headerName: '', width: 90, sortable: false,
      renderCell: (p) => (
        <>
          {p.row.representanteDI && <IconButton size="small" title="Documento del representante" onClick={() => abrirArchivo(p.row.representanteDI)}><PageviewIcon /></IconButton>}
          {!p.row.virtual && !p.row.presente && !cerrada && <IconButton size="small" title="Quitar registro" onClick={() => quitarRegistro(p.row)}><DeleteIcon /></IconButton>}
        </>
      ),
    },
  ];

  const columnasVotacion = [
    { field: 'nombre', headerName: 'Accionista', flex: 1, minWidth: 220 },
    { field: 'acciones', headerName: 'Acciones', type: 'number', width: 120, valueFormatter: (p) => enteros(p.value) },
    {
      field: 'voto', headerName: 'A favor', width: 100, sortable: false,
      renderCell: (p) => <Checkbox color="primary" checked={p.row['votacion' + temaVotacion] === true} disabled={cerrada || !temaVotacion} onChange={() => toggleVoto(p.row)} inputProps={{ 'aria-label': `Voto ${p.row.nombre}` }} />,
    },
  ];

  const votos = temaVotacion ? conteoVotos(accionistasxJuntas, temaVotacion) : null;
  const votosCapital = temaVotacion ? resultadoVotacion(accionistasxJuntas, temaVotacion) : null;
  const grillaProps = { density: 'compact', disableColumnMenu: true, disableSelectionOnClick: true, pageSize, onPageSizeChange: setPageSize, rowsPerPageOptions: [25, 50, 100] };

  // ---- Vista ----------------------------------------------------------------------------------
  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <div className={classes.encabezado}>
        <Typography variant="h6">Asambleas</Typography>
        <Button variant="contained" color="primary" size="small" className={classes.boton} onClick={() => setOpenCrear(true)}>+ Crear asamblea</Button>
      </div>
      <DataGrid style={{ backgroundColor: 'white' }} autoHeight density="compact" disableColumnMenu disableSelectionOnClick rows={asambleas} columns={columnasAsambleas} pageSize={20} rowsPerPageOptions={[20]} />

      {/* Detalle de la asamblea */}
      <Dialog open={!!asambleaSeleccionada} onClose={() => setAsambleaSeleccionada(null)} fullWidth maxWidth="lg">
        {asambleaSeleccionada && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <span>{subtituloAsamblea(asambleaSeleccionada)}</span>
                <Chip size="small" label={asambleaSeleccionada.estado} color={cerrada ? 'secondary' : 'primary'} />
              </Box>
            </DialogTitle>
            <DialogContent style={{ minHeight: 560 }}>
              <Tabs value={tab} onChange={(e, v) => setTab(v)} indicatorColor="primary" textColor="primary">
                <Tab label="Asistencia" />
                <Tab label="Quórum" />
                <Tab label="Votaciones" />
                <Tab label="Cierre" />
              </Tabs>
              <Divider style={{ marginBottom: 16 }} />
              {cerrada && tab !== 3 && (
                <MuiAlert severity="info" style={{ marginBottom: 12 }}>{`La asamblea está ${asambleaSeleccionada.estado}: la asistencia y los votos son solo de consulta.`}</MuiAlert>
              )}

              {tab === 0 && (
                <>
                  {!cerrada && (
                    <div className={classes.fila}>
                      <Autocomplete
                        size="small"
                        options={accionistas}
                        value={representado.accionista}
                        getOptionLabel={(o) => o.acc_nombre_completo || ''}
                        onChange={(e, v) => setRepresentado((r) => ({ ...r, accionista: v }))}
                        style={{ flex: 2, minWidth: 240 }}
                        renderInput={(params) => <TextField {...params} label="Accionista representado" variant="outlined" />}
                      />
                      <TextField size="small" variant="outlined" label="Nombre del representante" value={representado.nombre} onChange={(e) => setRepresentado({ ...representado, nombre: e.target.value })} style={{ flex: 2 }} />
                      <TextField size="small" variant="outlined" label="Identificación" value={representado.identificacion} onChange={(e) => setRepresentado({ ...representado, identificacion: e.target.value })} style={{ flex: 1 }} />
                      <Button component="label" variant="outlined" color="primary" startIcon={representado.documento ? <CheckIcon /> : <CloudUploadOutlinedIcon />} style={{ textTransform: 'none' }}>
                        Documento
                        <input hidden type="file" onChange={subirAFormulario((nombre) => setRepresentado((r) => ({ ...r, documento: nombre })))} />
                      </Button>
                      <Button variant="contained" color="primary" className={classes.boton} onClick={agregarRepresentado}>Agregar</Button>
                    </div>
                  )}
                  <div className={classes.fila}>
                    <TextField size="small" variant="outlined" label="Buscar por nombre o identificación" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ width: 320 }} />
                    <Typography variant="body2" color="textSecondary">
                      {`${enteros(listaAsistencia.length)} accionistas activos con acciones — ${resumen.quorum.personas} presentes`}
                    </Typography>
                  </div>
                  <div style={{ height: 440 }}>
                    <DataGrid rows={filasAsistencia} columns={columnasAsistencia} {...grillaProps} />
                  </div>
                </>
              )}

              {tab === 1 && (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={2}><TarjetaDato clase={classes.tarjeta} titulo="Quórum (personas)" valor={resumen.quorum.personas} /></Grid>
                    <Grid item xs={6} md={3}><TarjetaDato clase={classes.tarjeta} titulo="Acciones" valor={enteros(resumen.quorum.acciones)} /></Grid>
                    <Grid item xs={6} md={3}><TarjetaDato clase={classes.tarjeta} titulo="Capital" valor={numero(resumen.quorum.capital)} /></Grid>
                    <Grid item xs={6} md={2}><TarjetaDato clase={classes.tarjeta} titulo="% Capital" valor={`${numero(resumen.quorum.pctCapital, 4)}%`} /></Grid>
                    <Grid item xs={6} md={2}><TarjetaDato clase={classes.tarjeta} titulo="% Accionistas" valor={`${numero(resumen.quorum.pctPersonas, 4)}%`} /></Grid>
                  </Grid>
                  <Grid container spacing={2} style={{ marginTop: 16 }} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <DataGrid
                        autoHeight density="compact" disableColumnMenu hideFooter
                        rows={['presentes', 'representados', 'ausentes'].map((k) => ({ id: k, grupo: k[0].toUpperCase() + k.slice(1), ...resumen[k] }))}
                        columns={[
                          { field: 'grupo', headerName: '', flex: 1 },
                          { field: 'personas', headerName: 'Accionistas', type: 'number', width: 110 },
                          { field: 'acciones', headerName: 'Acciones', type: 'number', width: 130, valueFormatter: (p) => enteros(p.value) },
                          { field: 'capital', headerName: 'Capital', type: 'number', width: 130, valueFormatter: (p) => numero(p.value) },
                          { field: 'pctCapital', headerName: '% Capital', type: 'number', width: 110, valueFormatter: (p) => numero(p.value, 4) },
                          { field: 'pctPersonas', headerName: '% Accionistas', type: 'number', width: 120, valueFormatter: (p) => numero(p.value, 4) },
                        ]}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box display="flex" justifyContent="space-around">
                        {[['Capital', 'capital'], ['Accionistas', 'personas']].map(([titulo, k]) => (
                          <Box key={k} width={110} textAlign="center">
                            <Typography variant="body2">{titulo}</Typography>
                            <PieChart viewBoxSize={[100, 100]} data={['presentes', 'representados', 'ausentes'].map((g) => ({ title: g, value: Math.max(0, resumen[g][k]), color: COLORES[g] }))} />
                          </Box>
                        ))}
                      </Box>
                      <Box display="flex" justifyContent="center" mt={1} style={{ gap: 4 }}>
                        {Object.entries(COLORES).map(([g, color]) => <Chip key={g} size="small" label={g} style={{ backgroundColor: color }} />)}
                      </Box>
                    </Grid>
                  </Grid>
                  <Box mt={2}>
                    {asambleaSeleccionada.cierreQuorum
                      ? <MuiAlert severity="success">{`Quórum cerrado a las ${asambleaSeleccionada.horaCierreQuorum}.`}</MuiAlert>
                      : <MuiAlert severity="warning">Al cerrar el quórum se guarda la foto de títulos que se usará para el reparto de dividendos.</MuiAlert>}
                  </Box>
                </>
              )}

              {tab === 2 && (
                temas.length === 0 ? <Typography>La asamblea no tiene temas de votación.</Typography> : (
                  <>
                    <div className={classes.fila}>
                      <FormControl style={{ minWidth: 360 }}>
                        <InputLabel id="tema-votacion">Tema de votación</InputLabel>
                        <Select labelId="tema-votacion" value={temaVotacion} onChange={(e) => setTemaVotacion(e.target.value)}>
                          {temas.map((n) => <MenuItem key={n} value={String(n)}>{`Tema ${n}: ${asambleaSeleccionada['votacionTema' + n]}`}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <TextField size="small" variant="outlined" label="Buscar" value={busquedaVotacion} onChange={(e) => setBusquedaVotacion(e.target.value)} />
                      {votos && (
                        <Typography variant="body2">
                          {`A favor: ${votos.aFavor} — En contra: ${votos.enContra} — Acciones a favor: ${enteros(votosCapital.accionesAFavor)} de ${enteros(votosCapital.accionesPresentes)} `}
                          <Chip size="small" label={votosCapital.aprobada ? 'Aprobado' : 'No aprobado'} color={votosCapital.aprobada ? 'primary' : 'default'} />
                        </Typography>
                      )}
                    </div>
                    <div style={{ height: 420 }}>
                      <DataGrid rows={filasVotacion} columns={columnasVotacion} {...grillaProps} />
                    </div>
                  </>
                )
              )}

              {tab === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" className={classes.tarjeta}>
                      {asambleaSeleccionada.estado === 'Convocatoria'
                        ? <Button variant="contained" color="primary" className={classes.boton} onClick={finalizarAsamblea}>Finalizar asamblea</Button>
                        : <Typography variant="h6">{`Asamblea ${asambleaSeleccionada.estado}`}</Typography>}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Documento etiqueta="Acta de cierre" nombre={asambleaSeleccionada.acta} onSubir={subirDocumento('acta')} onQuitar={quitarDocumento('acta')} />
                    {asambleaSeleccionada.ordenDia && <Documento etiqueta="Orden del día" nombre={asambleaSeleccionada.ordenDia} onSubir={subirDocumento('ordenDia')} onQuitar={quitarDocumento('ordenDia')} />}
                    <Divider style={{ margin: '8px 0' }} />
                    <Typography variant="subtitle2">Expediente del acta de junta</Typography>
                    {temas.map((n) => (
                      <Documento key={n} etiqueta={`Tema ${n}: ${asambleaSeleccionada['votacionTema' + n]}`} nombre={asambleaSeleccionada['habilitanteTema' + n]}
                        onSubir={subirDocumento('habilitanteTema' + n)} onQuitar={quitarDocumento('habilitanteTema' + n)} />
                    ))}
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              {tab === 0 && <Button color="primary" onClick={pdfListado}>Imprimir listado</Button>}
              {tab === 1 && !asambleaSeleccionada.cierreQuorum && !cerrada && <Button variant="contained" color="primary" onClick={cerrarQuorum}>Cerrar quórum</Button>}
              {tab === 1 && <Button color="primary" onClick={pdfQuorum}>Imprimir quórum</Button>}
              {tab === 2 && temas.length > 0 && <Button color="primary" onClick={pdfVotaciones}>Imprimir votación</Button>}
              <Button color="secondary" onClick={() => setAsambleaSeleccionada(null)}>Salir</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Crear asamblea */}
      <Dialog open={openCrear} onClose={cerrarCrear} fullWidth maxWidth="md">
        <DialogTitle>Crear nueva asamblea</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="tipo-asamblea">Tipo de asamblea</InputLabel>
                <Select labelId="tipo-asamblea" value={formData.tipo} onChange={campo('tipo')}>
                  <MenuItem value="Ordinaria">Ordinaria</MenuItem>
                  <MenuItem value="Extraordinaria">Extraordinaria</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Lugar" fullWidth margin="dense" value={formData.lugar} onChange={campo('lugar')} />
              <TextField label="Enlace" fullWidth margin="dense" value={formData.link} onChange={campo('link')} />
              <Box display="flex" style={{ gap: 16 }}>
                <TextField label="Fecha" type="date" margin="dense" InputLabelProps={{ shrink: true }} value={formData.fecha} onChange={campo('fecha')} style={{ flex: 1 }} />
                <TextField label="Hora" type="time" margin="dense" InputLabelProps={{ shrink: true }} value={formData.hora} onChange={campo('hora')} style={{ flex: 1 }} />
              </Box>
              <Button component="label" variant="outlined" color="primary" style={{ textTransform: 'none', marginTop: 12 }}
                startIcon={formData.ordenDia ? <CheckIcon /> : <CloudUploadOutlinedIcon />}>
                Orden del día
                <input hidden type="file" onChange={subirAFormulario((nombre) => setFormData((f) => ({ ...f, ordenDia: nombre })))} />
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" style={{ padding: 16, backgroundColor: '#f9f9f9' }}>
                <Typography variant="subtitle2">Votación</Typography>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="nro-temas">Número de temas</InputLabel>
                  <Select labelId="nro-temas" value={formData.nroTemas} onChange={(e) => setFormData((f) => ({ ...f, nroTemas: e.target.value, temaDividendo: '' }))}>
                    {[0, ...TEMAS].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                  </Select>
                </FormControl>
                {TEMAS.filter((n) => n <= formData.nroTemas).map((n) => (
                  <TextField key={n} label={`Tema ${n}`} fullWidth margin="dense" value={formData['votacionTema' + n]} onChange={campo('votacionTema' + n)} />
                ))}
                {formData.nroTemas > 0 && (
                  <FormControl fullWidth margin="dense">
                    <InputLabel id="tema-dividendo">Tema que decide el reparto de dividendos</InputLabel>
                    <Select labelId="tema-dividendo" value={formData.temaDividendo} onChange={campo('temaDividendo')}>
                      <MenuItem value="">Ninguno</MenuItem>
                      {TEMAS.filter((n) => n <= formData.nroTemas).map((n) => (
                        <MenuItem key={n} value={String(n)}>{`Tema ${n}${formData['votacionTema' + n] ? ': ' + formData['votacionTema' + n] : ''}`}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" className={classes.boton} onClick={crear}>Crear asamblea</Button>
          <Button color="secondary" onClick={cerrarCrear}>Salir</Button>
        </DialogActions>
      </Dialog>

      {cargando && <CircularProgress style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 2000 }} />}
      <Snackbar open={!!mensaje} autoHideDuration={8000} onClose={() => setMensaje(null)}>
        {mensaje ? <Alert severity={mensaje.tipo} onClose={() => setMensaje(null)}>{mensaje.texto}</Alert> : <span />}
      </Snackbar>
    </main>
  );
}

