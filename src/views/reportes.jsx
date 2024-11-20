import React, { useState, useEffect } from 'react';
import {
  makeStyles, Paper, Avatar, Grid, Typography, TextField, Button, withStyles, ListItem, ListItemText, ListSubheader, ListItemIcon,
  List, IconButton, Snackbar, CircularProgress, LinearProgress, Divider, FormControl, InputLabel, Select, MenuItem
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { API, Storage, graphqlOperation, Auth } from 'aws-amplify';
import { listAccionistas, listOperaciones, listHerederoPorOperacions, listDividendos } from './../graphql/queries';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import SaveIcon from '@material-ui/icons/Save';
import CheckIcon from '@material-ui/icons/Check';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import PrintOutlinedIcon from '@material-ui/icons/PrintOutlined';
import VisibilityIcon from '@material-ui/icons/Visibility';
import MuiAlert from '@material-ui/lab/Alert';
import { uuid } from 'uuidv4';
import logoBase64 from '../images/logobase64.js';
const ExcelJS = require("exceljs");

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'left',
    color: theme.palette.text.secondary,
    height: 'calc(100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBarSpacer: {
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(2),

  },
  button: {
    textTransform: 'none',
    marginLeft: 8
  },
  titulos: {
    flexDirection: 'row',
  },
  cedente: {
    display: 'flex',
    flexDirection: 'column',
    width: '90%',
    marginTop: 20,
  },

}));


const today = new Date();
const fechaHora = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + ' ' + today.getHours() + ':' + today.getMinutes();


const dateNow = new Date(); // Creating a new date object with the current date and time
const year = dateNow.getFullYear(); // Getting current year from the created Date object
const monthWithOffset = dateNow.getUTCMonth() + 1; // January is 0 by default in JS. Offsetting +1 to fix date for calendar.
const month = // Setting current Month number from current Date object
  monthWithOffset.toString().length < 2 // Checking if month is < 10 and pre-prending 0 to adjust for date input.
    ? `0${monthWithOffset}`
    : monthWithOffset;
const date =
  dateNow.getUTCDate().toString().length < 2 // Checking if date is < 10 and pre-prending 0 if not to adjust for date input.
    ? `0${dateNow.getUTCDate()}`
    : dateNow.getUTCDate();

const materialDateInput = `${year}-${month}-${date}`; // combining to format for defaultValue or value attribute of material <TextField>


export default function Reportes() {

  const classes = useStyles();

  const [estadoListado, setEstadoListado] = useState('1');

  const handleChangeEstadoListado = (event) => {
    setEstadoListado(event.target.value);
  };

  const [estadoDividendo, setEstadoDividendo] = useState('1');

  const handleChangeEstadoDividendo = (event) => {
    setEstadoDividendo(event.target.value);
  };
  // Fechas desde hasta Libro Accionistas
  const [libroAcciDesde, setLibroAcciDesde] = useState();
  const [libroAcciHasta, setLibroAcciHasta] = useState();
  const handleChangeDateLibroAcciDesde = e => {
    setLibroAcciDesde(e.target.value);
  };
  const handleChangeDateLibroAcciHasta = e => {
    setLibroAcciHasta(e.target.value);
  };
  // Fechas desde hasta transferencia
  const [transferenciasDesde, setTransferenciasDesde] = useState(materialDateInput);
  const [transferenciasHasta, setTransferenciasHasta] = useState(materialDateInput);
  const handleChangeDateTrasnferenciasDesde = e => {
    setTransferenciasDesde(e.target.value);
  };
  const handleChangeDateTrasnferenciasHasta = e => {
    setTransferenciasHasta(e.target.value);
  };

  const [accionistas, setAccionistas] = useState([]);
  const [valAccionista, setValAccionista] = useState({})

  const handleClickAccionista = (option, value) => {
    if (value) {
      setValAccionista(value)
    }
    else {
      setValAccionista({})
    }
  }

  useEffect(() => {
    fetchAccionistas();
  }, [])

  async function fetchAccionistas() {
    const apiData = await API.graphql({ query: listAccionistas, variables: { limit: 1000 } });
    setAccionistas(apiData.data.listAccionistas.items);
  }

  const exportLibroAccionistas = async () => {
    const filter = {
      estado: {
        ne: "Inactivo"
      },
    }
    const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 10000 } });
    const accionistasFromAPI = apiData.data.listAccionistas.items;
    const libroAccionista = accionistasFromAPI.map(function (elt) {
      return { 
        identificacion: elt.identificacion, 
        nombre: elt.nombre, 
        paisNacionalidad: elt.paisNacionalidad, 
        cantidadAcciones: elt.cantidadAcciones, 
        tipoAcciones: elt.tipoAcciones, 
        tipoPersona: elt.tipoPersona,
        participacion: elt.participacion, 
        valor: elt.cantidadAcciones,
        telefono1: elt.telefono1,
        email1: elt.email1,
        createdAt: elt.createdAt
      };
    });
    var dateHasta = new Date(libroAcciHasta);
    dateHasta.setDate(dateHasta.getDate() + 1);

    const result = libroAccionista.filter(d => {
      var m2 = d.createdAt.split("T");
      var time = new Date(+m2[0].split("-")[2], m2[0].split("-")[1], +m2[0].split("-")[0]).getTime();
      return (new Date(libroAcciDesde).getTime() < time && time < new Date(dateHasta).getTime());
    });
    // Creacion del Xls
    const title = "Reporte de Libro de Accionistas";
    const headers = [
      "Identificación", "Nombre", "Nacionalidad", "Acciones", 
      "Tipo", "Persona", "Participación", "Valor", "Teléfono", "Email","Fecha de Creación"];
    const letrasColumnas = ['A', 'B', 'C', 'D', 'E', 'F', 'G','H','I','J','K'];
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Accionistas");
    const imageId = workbook.addImage({
      base64: logoBase64,
      extension: 'jpeg',
    });
    sheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 415, height: 100 },
    });
    for (let index = 0; index < 5; index++) {
      sheet.addRow();
    }
    sheet.addRow(headers);
    sheet.getRow(7).font = {
      name: "Times New Roman",
      family: 4,
      size: 14,
      bold: true,
      color: { argb: 'fc0303' },
    };
    letrasColumnas.forEach(function (letra) {
      sheet.getCell(letra + '7').border = {
        bottom: { style: 'thin', color: { argb: '676767' } }
      };
    });
    sheet.mergeCells('D1:F2');
    sheet.getCell('D1').value = title;
    sheet.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.mergeCells('D4:F4');
    sheet.getCell('D4').value = "Fecha de creación: " + fechaHora;
    sheet.getCell('D1').font = {
      name: "Times New Roman",
      family: 4,
      size: 16,
      bold: true,
      color: { argb: 'fc0303' },
    };
    sheet.getCell('D4').font = {
      name: "Times New Roman",
      family: 4,
      size: 14,
    };
    sheet.columns = [
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
    ];
    const promise = Promise.all(
      result.map(async (elt) => {
        sheet.addRow([
          elt.identificacion, 
          elt.nombre, 
          elt.paisNacionalidad, 
          elt.cantidadAcciones, 
          elt.tipoAcciones, 
          elt.tipoPersona, 
          elt.participacion, 
          elt.valor,
          elt.telefono1,
          elt.email1,
          elt.createdAt
        ]);
      })
    );
    promise.then(() => {
      workbook.xlsx.writeBuffer().then(function (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "LibroAccionistas.xlsx";
        anchor.click();
        window.URL.revokeObjectURL(url);
      });
    });
  }

  const exportListadoAccionistas = async () => {
    const filter = {
      estado: {
        eq: estadoListado == "1" ? "Activo" : estadoListado == "2" ? "Bloqueado" : estadoListado == "3" ? "Inactivo" : null
      },
    }
    const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 10000 } });
    const accionistasFromAPI = apiData.data.listAccionistas.items;
    const apiData2 = await API.graphql({ query: listAccionistas, variables: { limit: 10 }, items: ['cantidadAcciones'] });
    const accionistasFromAPI2 = apiData2.data.listAccionistas.items;
    console.log("Cantidad de acciones:", accionistasFromAPI2);
    const libroAccionista = accionistasFromAPI.map(function (elt) {
      return { 
        identificacion: elt.identificacion, 
        nombre: elt.nombre, 
        paisNacionalidad: elt.paisNacionalidad, 
        cantidadAcciones: elt.cantidadAcciones, 
        tipoAcciones: elt.tipoAcciones, 
        tipoPersona: elt.tipoPersona,
        participacion: elt.participacion, 
        valor: elt.cantidadAcciones*40,
        telefono: elt.telefono1,
        email: elt.email1,
        fechaCreacion: elt.createdAt
      };
    })
    // Creacion del Xlsx
    const title = "Listado de Accionistas (".concat(estadoListado == "1" ? "Activos)" : estadoListado == "2" ? "Bloqueados)" : "Inactivos)");
    const headers = [
      "Identificación", "Nombre", "Nacionalidad", "Acciones","Tipo", 
      "Persona", "Participación", "Valor", "Teléfono", "Email","Fecha de Creación"];
    const letrasColumnas = ['A', 'B', 'C', 'D', 'E', 'F', 'G','H','I','J','K'];
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Listado Accionistas");
    const imageId = workbook.addImage({
      base64: logoBase64,
      extension: 'jpeg',
    });
    sheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 415, height: 100 },
    });
    for (let index = 0; index < 5; index++) {
      sheet.addRow();
    }
    sheet.addRow(headers);
    sheet.getRow(7).font = {
      name: "Times New Roman",
      family: 4,
      size: 14,
      bold: true,
      color: { argb: 'fc0303' },
    };
    letrasColumnas.forEach(function (letra) {
      sheet.getCell(letra + '7').border = {
        bottom: { style: 'thin', color: { argb: '676767' } }
      };
    });
    sheet.mergeCells('D1:F2');
    sheet.getCell('D1').value = title;
    sheet.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.mergeCells('D4:F4');
    sheet.getCell('D4').value = "Fecha de creación: " + fechaHora;
    sheet.getCell('D1').font = {
      name: "Times New Roman",
      family: 4,
      size: 16,
      bold: true,
      color: { argb: 'fc0303' },
    };
    sheet.getCell('D4').font = {
      name: "Times New Roman",
      family: 4,
      size: 14,
    };
    sheet.columns = [
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
    ];
    const promise = Promise.all(
      libroAccionista.map(async (elt) => {
        sheet.addRow([
          elt.identificacion, 
          elt.nombre, 
          elt.paisNacionalidad, 
          elt.cantidadAcciones, 
          elt.tipoAcciones, 
          elt.tipoPersona, 
          elt.participacion, 
          elt.valor,
          elt.telefono1,
          elt.email1,
          elt.createdAt
        ]);
      })
    );
    promise.then(() => {
      workbook.xlsx.writeBuffer().then(function (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "ListadoAccionistas.xlsx";
        anchor.click();
        window.URL.revokeObjectURL(url);
      });
    });
  }

  const exportPDFTransferencias = async () => {
    let filter = {
      estado: {
        eq: 'Aprobada' // filter priority = 1
      },

      or: [{ operacion: { eq: 'Cesión' } },
      { operacion: { eq: 'Posesión Efectiva' } },
      { operacion: { eq: 'Donación' } },
      { operacion: { eq: 'Testamento' } }]
    };
    // Procesamiento de datos
    const apiData = await API.graphql({ query: listOperaciones, variables: { filter: filter, limit: 10000 }, });
    const operacionesFromAPI = apiData.data.listOperaciones.items;
    const apiData2 = await API.graphql({ query: listHerederoPorOperacions, variables: { limit: 10000 }, });
    const operacionesFromAPI2 = apiData2.data.listHerederoPorOperacions.items;
    const posisionEfectiva = operacionesFromAPI2.map(t1 => ({ ...t1, ...operacionesFromAPI.find(t2 => t2.id === t1.operacionId) }))
    const operacionesSinPosesionEfectivas = operacionesFromAPI.filter((el) =>
      el.operacion != 'Posesión Efectiva'
    );
    let finalmente = [...operacionesSinPosesionEfectivas, ...posisionEfectiva]
    if (valAccionista.id) {
      const finalmente3 = finalmente.filter((id) => id.idCedente == valAccionista.id || id.idCesionario == valAccionista.id);
      console.log("Operaciones", finalmente3);
      finalmente = finalmente3;
    }
    finalmente.sort(function (a, b) {
      if (new Date(+a.fecha.split("-")[2], a.fecha.split("-")[1] - 1, +a.fecha.split("-")[0]) > new Date(+b.fecha.split("-")[2], b.fecha.split("-")[1] - 1, +b.fecha.split("-")[0])) return 1;
      if (new Date(+a.fecha.split("-")[2], a.fecha.split("-")[1] - 1, +a.fecha.split("-")[0]) < new Date(+b.fecha.split("-")[2], b.fecha.split("-")[1] - 1, +b.fecha.split("-")[0])) return -1;
      return 0;
    });
    var dateHasta = new Date(transferenciasHasta);
    dateHasta.setDate(dateHasta.getDate() + 1);

    const result = finalmente.filter(d => {
      var time = new Date(+d.fecha.split("-")[2], d.fecha.split("-")[1] - 1, +d.fecha.split("-")[0]).getTime();
      return (new Date(transferenciasDesde).getTime() < time && time < new Date(dateHasta).getTime());
    });
    // Creacion del Xlsx
    const title = "Reporte de Transferencias";
    const headers = ["Fecha", "Transferencia", "Cedente", "Acciones", "Cesionario"];
    const letrasColumnas = ['A', 'B', 'C', 'D', 'E'];
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Listado Accionistas");
    const imageId = workbook.addImage({
      base64: logoBase64,
      extension: 'jpeg',
    });
    sheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 415, height: 100 },
    });
    for (let index = 0; index < 5; index++) {
      sheet.addRow();
    }
    sheet.addRow(headers);
    sheet.getRow(7).font = {
      name: "Times New Roman",
      family: 4,
      size: 14,
      bold: true,
      color: { argb: 'fc0303' },
    };
    letrasColumnas.forEach(function (letra) {
      sheet.getCell(letra + '7').border = {
        bottom: { style: 'thin', color: { argb: '676767' } }
      };
    });
    sheet.mergeCells('D1:F2');
    sheet.getCell('D1').value = title;
    sheet.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.mergeCells('D4:F4');
    sheet.getCell('D4').value = "Fecha de creación: " + fechaHora;
    sheet.getCell('D1').font = {
      name: "Times New Roman",
      family: 4,
      size: 16,
      bold: true,
      color: { argb: 'fc0303' },
    };
    sheet.getCell('D4').font = {
      name: "Times New Roman",
      family: 4,
      size: 14,
    };
    sheet.columns = [
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
    ];
    const promise = Promise.all(
      result.map(async (elt) => {
        sheet.addRow([
          elt.fecha, 
          elt.operacion, 
          elt.cedente, 
          elt.operacion == 'Posesión Efectiva' ? elt.cantidad : elt.acciones, 
          elt.operacion == 'Posesión Efectiva' ? elt.nombre : elt.cesionario
        ]);
      })
    );
    promise.then(() => {
      workbook.xlsx.writeBuffer().then(function (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "ReporteTransferencias.xlsx";
        anchor.click();
        window.URL.revokeObjectURL(url);
      });
    });
  }

  const exportDividendos = async () => {
    // Carga de datos
    const apiData = await API.graphql({ query: listDividendos });
    const dividendosFromAPI = apiData.data.listDividendos.items;
    const dividendos = dividendosFromAPI.map(function (elt) {
      return {
        periodo: elt.periodo,
        secuencial: elt.secuencial,
        concepto: elt.concepto,
        dividendo: elt.dividendo,
        fechaCorte: elt.fechaCorte,
        fechaPago: elt.fechaPago,
        estado: elt.estado,
        createdAt: elt.createdAt,
        updatedAt: elt.updatedAt
      };
    })
    // Creacion del Xlsx
    const title = "Reporte de Dividendos";
    const headers = ["Periodo", "Secuencial", "Concepto", "Dividendo", "Fecha de corte", 
      "Fecha de Junta", "Estado","Fecha de Creación","Fecha de Modificación"];
    const letrasColumnas = ['A', 'B', 'C', 'D', 'E', 'F', 'G','H','I'];
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Dividendos");
    const imageId = workbook.addImage({
      base64: logoBase64,
      extension: 'jpeg',
    });
    sheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 415, height: 100 },
    });
    for (let index = 0; index < 5; index++) {
      sheet.addRow();
    }
    sheet.addRow(headers);
    sheet.getRow(7).font = {
      name: "Times New Roman",
      family: 4,
      size: 14,
      bold: true,
      color: { argb: 'fc0303' },
    };
    letrasColumnas.forEach(function (letra) {
      sheet.getCell(letra + '7').border = {
        bottom: { style: 'thin', color: { argb: '676767' } }
      };
    });
    sheet.mergeCells('D1:F2');
    sheet.getCell('D1').value = title;
    sheet.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.mergeCells('D4:F4');
    sheet.getCell('D4').value = "Fecha de creación: " + fechaHora;
    sheet.getCell('D1').font = {
      name: "Times New Roman",
      family: 4,
      size: 16,
      bold: true,
      color: { argb: 'fc0303' },
    };
    sheet.getCell('D4').font = {
      name: "Times New Roman",
      family: 4,
      size: 14,
    };
    sheet.columns = [
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
    ];
    const promise = Promise.all(
      dividendos.map(async (elt) => {
        sheet.addRow([
          elt.periodo, 
          elt.secuencial, 
          elt.concepto, 
          elt.dividendo, 
          elt.fechaCorte, 
          elt.fechaPago, 
          elt.estado,
          elt.createdAt,
          elt.updatedAt
        ]);
      })
    );
    promise.then(() => {
      workbook.xlsx.writeBuffer().then(function (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "Dividendos.xlsx";
        anchor.click();
        window.URL.revokeObjectURL(url);
      });
    });
  }

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Paper variant="elevation" className={classes.paper}>
        <Grid container spacing={3}>
          <Grid item xs={12} >
            <Paper elevation={0} style={{ height: 50, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%', padding: 10, }}>
              <Avatar style={{ backgroundColor: '#f9f9f9', height: '30px', width: '30px' }}>
                <PrintOutlinedIcon color='primary' />
              </Avatar>
              <Typography variant='subtitle2' color='primary' style={{ paddingLeft: 10 }}>
                Reportes
              </Typography>
            </Paper>
          </Grid>
          <Divider />
          <Grid item sm={6} md={4} lg={3} xl={2} style={{minHeight:250}}>
            <Typography variant='body2' color='secondary' style={{ height: '15%' }}>
              Libro de Accionistas
            </Typography>
            <FormControl fullWidth style={{ paddingBottom: 5 }}>
              <TextField
                size='small'
                id="datetime-local"
                label="Desde"
                type="date"
                defaultValue={libroAcciDesde}
                value={libroAcciDesde}
                onChange={handleChangeDateLibroAcciDesde}
                variant="standard"
                InputLabelProps={{
                  shrink: true
                }}
              />
            </FormControl>
            <FormControl fullWidth style={{ paddingBottom: 5 }}>
              <TextField
                size='small'
                id="datetime-local"
                label="Hasta"
                type="date"
                defaultValue={libroAcciHasta}
                value={libroAcciHasta}
                onChange={handleChangeDateLibroAcciHasta}
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
            <Button
              size="small"
              variant="contained"
              color="primary"
              style={{ height: '15%' }}
              className={classes.button}
              startIcon={<VisibilityIcon />}
              onClick={exportLibroAccionistas}
            >
              Descargar
            </Button>
          </Grid>
          <Grid item sm={6} md={4} lg={3} xl={2} style={{ minHeight:250 }}>
            <Typography variant='body2' color='secondary' style={{ height: '15%' }}>
              Listado de Accionistas
            </Typography>
            <FormControl fullWidth style={{ paddingBottom: 5 }}>
              <TextField
                size='small'
                id="datetime-local"
                label="Fecha"
                type="date"
                defaultValue={Date.now()}
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                }}
                disabled
              />
            </FormControl>
            <FormControl fullWidth style={{ height: '49%' }}>
              <InputLabel id="demo-simple-select-label">Estado</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={estadoListado}
                label="Estado"
                onChange={handleChangeEstadoListado}
              >
                <MenuItem value={1} >Activo</MenuItem>
                <MenuItem value={2} >Bloqueado</MenuItem>
                <MenuItem value={3} >Inactivo</MenuItem>
              </Select>
            </FormControl>
            <Button
              size="small"
              variant="contained"
              color="primary"
              style={{ height: '15%' }}
              className={classes.button}
              startIcon={<VisibilityIcon />}
              onClick={exportListadoAccionistas}
            >
              Descargar
            </Button>
          </Grid>
          <Grid item sm={6} md={4} lg={3} xl={2} style={{ minHeight:250 }}>
            <Typography variant='body2' color='secondary' style={{ height: '15%' }}>
              Transferencias
            </Typography>
            <FormControl fullWidth style={{ paddingBottom: 5, }}>
              <TextField
                size='small'
                id="datetime-local"
                label="Desde"
                type="date"
                defaultValue={transferenciasDesde}
                value={transferenciasDesde}
                onChange={handleChangeDateTrasnferenciasDesde}
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                  required: true
                }}
              />
            </FormControl>
            <FormControl fullWidth style={{ paddingBottom: 5 }}>
              <TextField
                size='small'
                id="datetime-local"
                label="Hasta"
                type="date"
                defaultValue={transferenciasHasta}
                value={transferenciasHasta}
                onChange={handleChangeDateTrasnferenciasHasta}
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
            <Autocomplete
              value={valAccionista}
              size='small'
              id="combo-box-accionista"
              options={accionistas}
              getOptionLabel={(option) => option.nombre ? option.nombre : ""}
              style={{ height: '28%' }}
              renderInput={(params) => <TextField {...params} label="Accionista" margin="normal" variant="outlined" />}
              onChange={(option, value) => handleClickAccionista(option, value)}
            />
            <Button
              size="small"
              variant="contained"
              color="primary"
              style={{ height: '15%' }}
              className={classes.button}
              startIcon={<VisibilityIcon />}
              onClick={exportPDFTransferencias}
            >
              Descargar
            </Button>
          </Grid>
          <Grid item sm={6} md={4} lg={3} xl={2} style={{ minHeight:250 }}>
            <Typography variant='body2' color='secondary' style={{ height: '15%' }}>
              Asambleas
            </Typography>

            <FormControl disabled fullWidth style={{ paddingBottom: 5, }}>
              <TextField
                size='small'
                id="datetime-local"
                label="Desde"
                type="date"
                defaultValue={Date.now()}
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                }}
                disabled
              />
            </FormControl>
            <FormControl disabled fullWidth style={{ height: '49%'}}>
              <TextField
                size='small'
                id="datetime-local"
                label="Hasta"
                type="date"
                defaultValue={Date.now()}
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                }}
                disabled
              />
            </FormControl>
            <Button
              size="small"
              variant="contained"
              color="primary"
              style={{ height: '15%' }}
              className={classes.button}
              startIcon={<VisibilityIcon />}
              disabled
              onClick={exportPDFTransferencias}
            >
              Descargar
            </Button>
          </Grid>
          <Grid item sm={6} md={4} lg={3} xl={2} style={{ minHeight:250 }}>
            <Typography variant='body2' color='secondary' style={{ height: '15%' }}>
              Dividendos
            </Typography>
            <FormControl fullWidth style={{ height: '70%' }}>
              <Select
                labelId="simple-select-label"
                id="simple-select"
                value={2}
                label="Periodo"
                disabled
              >
                <MenuItem value={1} >2020</MenuItem>
                <MenuItem value={2} >2021</MenuItem>
                <MenuItem value={3} >2022</MenuItem>
                <MenuItem value={4} >2023</MenuItem>
              </Select>
            </FormControl>
            <Button
              size="small"
              variant="contained"
              color="primary"
              style={{ height: '15%' }}
              className={classes.button}
              startIcon={<VisibilityIcon />}
              onClick={exportDividendos}
            >
              Descargar
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </main>

  );
}
