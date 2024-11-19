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
//import PreviewIcon from '@material-ui/icons/Preview';
import VisibilityIcon from '@material-ui/icons/Visibility';

import MuiAlert from '@material-ui/lab/Alert';
//import LocalizationProvider from '@material-ui/lab/LocalizationProvider';

import { uuid } from 'uuidv4';

import jsPDF from "jspdf";
import "jspdf-autotable";

import logoDegradado from '../images/logoUnacemDegradado.png';
import logo from '../images/logoUNACEMmedMarco2.png';
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
    //height: '83vh',
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
    margin: theme.spacing(1),
    marginTop: 35,
    textTransform: 'none',
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
        valor: elt.cantidadAcciones * 40.00,
        telefono: elt.telefono1,
        email: elt.email1,
        fechaCreacion: elt.createdAt
      };
    })
    // Creacion del Xlsx
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
      tl: { col: 0, row: 1 },
      ext: { width: 415, height: 100 },
    });
    for (let index = 0; index < 7; index++) {
      sheet.addRow();
    }
    sheet.addRow(headers);
    sheet.getRow(8).font = {
      name: "Times New Roman",
      family: 4,
      size: 14,
      bold: true,
      color: { argb: 'fc0303' },
    };
    letrasColumnas.forEach(function (letra) {
      sheet.getCell(letra + '8').border = {
        bottom: { style: 'thin', color: { argb: '676767' } }
      };
    });
    sheet.mergeCells('C1:F2');
    sheet.getCell('D1').value = "Reporte de Libro de Accionistas";
    sheet.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.mergeCells('D4:E4');
    sheet.getCell('D4').value = "Fecha de creación: " + fechaHora;
    sheet.getRow(1).font = {
      name: "Times New Roman",
      family: 4,
      size: 16,
      bold: true,
      color: { argb: 'fc0303' },
    };
    sheet.getRow(4).font = {
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
        valor: elt.cantidadAcciones * 40.00,
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
      tl: { col: 0, row: 1 },
      ext: { width: 415, height: 100 },
    });
    for (let index = 0; index < 7; index++) {
      sheet.addRow();
    }
    sheet.addRow(headers);
    sheet.getRow(8).font = {
      name: "Times New Roman",
      family: 4,
      size: 14,
      bold: true,
      color: { argb: 'fc0303' },
    };
    letrasColumnas.forEach(function (letra) {
      sheet.getCell(letra + '8').border = {
        bottom: { style: 'thin', color: { argb: '676767' } }
      };
    });
    sheet.mergeCells('C1:F2');
    sheet.getCell('D1').value = title;
    sheet.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.mergeCells('D4:E4');
    sheet.getCell('D4').value = "Fecha de creación: " + fechaHora;
    sheet.getRow(1).font = {
      name: "Times New Roman",
      family: 4,
      size: 16,
      bold: true,
      color: { argb: 'fc0303' },
    };
    sheet.getRow(4).font = {
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

    const sd = new Date("2021-11-15T00:00:00.000Z").getTime();
    const ed = new Date("2021-11-16T00:00:00.000Z").getTime();

    var dateHasta = new Date(transferenciasHasta);
    dateHasta.setDate(dateHasta.getDate() + 1);

    const result = finalmente.filter(d => {
      var time = new Date(+d.fecha.split("-")[2], d.fecha.split("-")[1] - 1, +d.fecha.split("-")[0]).getTime();
      return (new Date(transferenciasDesde).getTime() < time && time < new Date(dateHasta).getTime());
    });
    // Creacion de Pdf
    const unit = "pt";
    const size = "A4";
    const orientation = "landscape";
    const marginLeft = 40;
    var totalPagesExp = '{total_pages_count_string}';
    const doc = new jsPDF(orientation, unit, size);
    const title = "Reporte de Transferencias";
    const headers = [["Fecha", "Transferencia", "Cedente", "Acciones", "Cesionario"]];
    const data = result.map(elt => [elt.fecha, elt.operacion, elt.cedente, elt.operacion == 'Posesión Efectiva' ? elt.cantidad : elt.acciones, elt.operacion == 'Posesión Efectiva' ? elt.nombre : elt.cesionario]);
    doc.autoTable({
      theme: 'plain',
      head: headers,
      body: data,
      didDrawPage: function () {
        // Logo derecha
        doc.addImage(logo, "PNG", 600, 0, 150, 70);
        // Logo degradado centro
        doc.addImage(logoDegradado, "PNG", 333, 200, 180, 180);
        // Lineas rojas
        doc.setDrawColor(255, 0, 0);
        doc.setLineWidth(2.5);
        doc.line(40, 60, 800, 60);
        // Titulo
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(title, marginLeft + 10, 50);
        // Fecha
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text('Fecha de reporte: ' + fechaHora, 580, 580);
        var str = 'Pag ' + doc.internal.getNumberOfPages()
        if (typeof doc.putTotalPages === 'function') {
          str = str + ' de ' + totalPagesExp
        }
        doc.setDrawColor(255, 0, 0);
        doc.setLineWidth(7);
        doc.line(40, 592, 800, 592);
        doc.text(str, marginLeft + 20, 580)
      },
      margin: { top: 80 },
    })
    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp)
    }
    doc.save("ReporteTransferencias.pdf")
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
        estado: elt.estado
      };
    })
    // Creacion del Xlsx
    const headers = ["Periodo", "Secuencial", "Concepto", "Dividendo", "Fecha de corte", "Fecha de Junta", "Estado"];
    const letrasColumnas = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Dividendos");
    const imageId = workbook.addImage({
      base64: logoBase64,
      extension: 'jpeg',
    });
    sheet.addImage(imageId, {
      tl: { col: 0, row: 1 },
      ext: { width: 415, height: 100 },
    });
    for (let index = 0; index < 7; index++) {
      sheet.addRow();
    }
    sheet.addRow(headers);
    sheet.getRow(8).font = {
      name: "Times New Roman",
      family: 4,
      size: 14,
      bold: true,
      color: { argb: 'fc0303' },
    };
    letrasColumnas.forEach(function (letra) {
      sheet.getCell(letra + '8').border = {
        bottom: { style: 'thin', color: { argb: '676767' } }
      };
    });
    sheet.mergeCells('C1:F2');
    sheet.getCell('D1').value = "Reporte de Dividendos";
    sheet.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.mergeCells('D4:E4');
    sheet.getCell('D4').value = "Fecha de creación: " + fechaHora;
    sheet.getRow(1).font = {
      name: "Times New Roman",
      family: 4,
      size: 16,
      bold: true,
      color: { argb: 'fc0303' },
    };
    sheet.getRow(4).font = {
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
    ];
    const promise = Promise.all(
      dividendos.map(async (elt) => {
        sheet.addRow([elt.periodo, elt.secuencial, elt.concepto, elt.dividendo, elt.fechaCorte, elt.fechaPago, elt.estado]);
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
        <Grid container style={{ width: '90%' }}>
          <Grid item xs={12} >
            <Paper elevation={0} style={{ height: 50, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%', padding: 10, }}>
              <Avatar style={{ backgroundColor: '#f9f9f9', height: '30px', width: '30px' }}>
                <PrintOutlinedIcon color='primary' />
              </Avatar>
              <Typography variant='subtitle2' color='primary' style={{ paddingLeft: 10 }}>
                Reportes
              </Typography>
            </Paper>
            <Divider />
          </Grid>
          <Grid item xs={2} style={{ marginTop: 20, marginRight: 40 }}>
            <Typography variant='body2' color='secondary' style={{ height: '15%' }}>
              Libro de Accionistas
            </Typography>
            <FormControl fullWidth style={{ paddingTop: 30, paddingBottom: 50, height: '55%'}}>
              <TextField
                size='small'
                id="datetime-local"
                label="Fecha"
                //type="datetime-local"
                type="date"
                defaultValue={Date.now()}
                //className={classes.textField}
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
              //size='medium'
              onClick={exportLibroAccionistas}
            >
              Descargar
            </Button>
          </Grid>
          <Grid item xs={2} style={{ marginTop: 20, marginRight: 40 }}>
            <Typography variant='body2' color='secondary' style={{ height: '15%' }}>
              Listado de Accionistas
            </Typography>
            <FormControl fullWidth style={{ paddingTop: 30, paddingBottom: 5 }}>
              <TextField
                size='small'
                id="datetime-local"
                label="Fecha"
                //type="datetime-local"
                type="date"
                defaultValue={Date.now()}
                //className={classes.textField}
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                }}
                disabled
              />
            </FormControl>
            <FormControl fullWidth style={{ height: '45%' }}>
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
              //size='medium'
              onClick={exportListadoAccionistas}
            >
              Descargar
            </Button>
          </Grid>
          <Grid item xs={2} style={{ marginTop: 20, marginRight: 40 }}>
            <Typography variant='body2' color='secondary' style={{ height: '15%' }}>
              Transferencias
            </Typography>

            <FormControl fullWidth style={{ paddingTop: 30, }}>
              <TextField
                size='small'
                id="datetime-local"
                label="Desde"
                //type="datetime-local"
                type="date"
                defaultValue={transferenciasDesde}
                value={transferenciasDesde}
                onChange={handleChangeDateTrasnferenciasDesde}
                //className={classes.textField}
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                  required: true
                }}
              />
            </FormControl>
            <FormControl fullWidth style={{ paddingTop: 7, }}>
              <TextField
                size='small'
                id="datetime-local"
                label="Hasta"
                //type="datetime-local"
                type="date"
                defaultValue={transferenciasHasta}
                value={transferenciasHasta}
                onChange={handleChangeDateTrasnferenciasHasta}
                //className={classes.textField}
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
            <Autocomplete
              value={valAccionista}
              size='small'
              //key={operacion}
              id="combo-box-accionista"
              options={accionistas}
              getOptionLabel={(option) => option.nombre ? option.nombre : ""}
              style={{ width: 'calc(100%)', height: '35%' }}
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
              //size='medium'
              onClick={exportPDFTransferencias}
            >
              Descargar
            </Button>
          </Grid>
          <Grid item xs={2} style={{ marginTop: 20, marginRight: 40 }}>
            <Typography variant='body2' color='secondary' style={{ height: '15%' }}>
              Asambleas
            </Typography>

            <FormControl disabled fullWidth style={{ paddingTop: 30, }}>
              <TextField
                size='small'
                id="datetime-local"
                label="Desde"
                //type="datetime-local"
                type="date"
                defaultValue={Date.now()}
                //className={classes.textField}
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                }}
                disabled
              />
            </FormControl>
            <FormControl disabled fullWidth style={{ paddingTop: 7, height: '45%'}}>
              <TextField
                size='small'
                id="datetime-local"
                label="Hasta"
                //type="datetime-local"
                type="date"
                defaultValue={Date.now()}
                //className={classes.textField}
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

          <Grid item xs={2} style={{ marginTop: 20, marginRight: 40 }}>
            <Typography variant='body2' color='secondary' style={{ height: '15%' }}>
              Dividendos
            </Typography>
            <FormControl fullWidth style={{ height: '55%' }}>
              <Select
                labelId="simple-select-label"
                id="simple-select"
                value={2}
                label="Periodo"
                disabled
              //onChange={handleChangeEstadoListado}
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
