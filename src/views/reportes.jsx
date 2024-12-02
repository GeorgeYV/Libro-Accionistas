import React, { useState, useEffect } from 'react';
import {
  makeStyles, Paper, Avatar, Grid, Typography, TextField, Button, withStyles, ListItem, ListItemText, ListSubheader, ListItemIcon,
  List, IconButton, Snackbar, CircularProgress, LinearProgress, Divider, FormControl, InputLabel, Select, MenuItem
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { API, Storage, graphqlOperation, Auth } from 'aws-amplify';
import { listAccionistas, listOperaciones, listHerederoPorOperacions, listDividendosAccionistas} from './../graphql/queries';
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

const dateNow = new Date();
const year = dateNow.getFullYear();
const monthWithOffset = dateNow.getUTCMonth() + 1;
const month = 
  monthWithOffset.toString().length < 2
    ? `0${monthWithOffset}`
    : monthWithOffset;
const date =
  dateNow.getUTCDate().toString().length < 2 
    ? `0${dateNow.getUTCDate()}`
    : dateNow.getUTCDate();
const fechaAMD = `${year}-${month}-${date}`;

export default function Reportes() {

  const classes = useStyles();

  const [tipoPersonaSelect, setTipoPersonaSelect] = useState('0');
  const handleChangeTipoPersonaSelect = (event) => {
    setTipoPersonaSelect(event.target.value);
  };
  const [tipoOperacion, setTipoOperacion] = useState('0');
  const handleChangeTipoOperacion = (event) => {
    setTipoOperacion(event.target.value);
  };
  const [estadoListado, setEstadoListado] = useState('0');
  const handleChangeEstadoListado = (event) => {
    setEstadoListado(event.target.value);
  };
  const [libroAcciDesde, setLibroAcciDesde] = useState(fechaAMD);
  const [libroAcciHasta, setLibroAcciHasta] = useState(fechaAMD);
  const handleChangeDateLibroAcciDesde = e => {
    setLibroAcciDesde(e.target.value);
  };
  const handleChangeDateLibroAcciHasta = e => {
    setLibroAcciHasta(e.target.value);
  };
  const [transferenciasDesde, setTransferenciasDesde] = useState(fechaAMD);
  const [transferenciasHasta, setTransferenciasHasta] = useState(fechaAMD);
  const handleChangeDateTrasnferenciasDesde = e => {
    setTransferenciasDesde(e.target.value);
  };
  const handleChangeDateTrasnferenciasHasta = e => {
    setTransferenciasHasta(e.target.value);
  };
  const [operacionesDesde, setOperacionesDesde] = useState(fechaAMD);
  const [operacionesHasta, setOperacionesHasta] = useState(fechaAMD);
  const handleChangeDateOperacionesDesde = e => {
    setOperacionesDesde(e.target.value);
  };
  const handleChangeDateOperacionesHasta = e => {
    setOperacionesHasta(e.target.value);
  };
  const [accionistas, setAccionistas] = useState([]);
  const [valAccionista, setValAccionista] = useState({})
  const [periodosDividendos, setPeriodosDividendos] = useState([]);
  const [periodoDividendo, setPeriodoDividendo] = useState([]);
  const handleClickAccionista = (option, value) => {
    if (value) {
      setValAccionista(value)
    }
    else {
      setValAccionista({})
    }
  }
  const handleClickPeriodoDividendo = (option, value) => {
    if (value) {
      setPeriodoDividendo(value)
    }
    else {
      setPeriodoDividendo({})
    }
  }

  async function fetchAccionistas() {
    const apiData = await API.graphql({ query: listAccionistas, variables: { limit: 1000 } });
    setAccionistas(apiData.data.listAccionistas.items);
  }

  async function fetchPeriodosDividendos() {
    const apiData = await API.graphql({ query: listDividendosAccionistas});
    /*const periodos = apiData.data.listDividendosAccionistas.items.map(function (elt) {
      return { 
        periodo: elt.periodo
      }
    });
    function onlyUnique(value, index, array) {
      return array.indexOf(value) === index;
    }
    console.log("periodos: ",periodos);
    var unique = periodos.filter(onlyUnique);
    var unique2 = periodos.periodo.filter(onlyUnique);
    console.log("unique: ",unique);
    console.log("unique2: ",unique2);*/
    setPeriodosDividendos(apiData.data.listDividendosAccionistas.items);
  }

  useEffect(() => {
    fetchAccionistas();
    fetchPeriodosDividendos();
  }, [])
  
  const exportLibroAccionistas = async () => {
    const apiData = await API.graphql({ query: listAccionistas });
    const accionistasFromAPI = apiData.data.listAccionistas.items;
    var dateHasta = new Date(libroAcciHasta);
    dateHasta.setDate(dateHasta.getDate() + 1);
    const result = accionistasFromAPI.filter(d => {
      var time = new Date(d.createdAt).getTime();
      return (new Date(libroAcciDesde).getTime() <= time && time <= new Date(dateHasta).getTime());
    });
    // Creacion del Xls
    const title = "Reporte de Libro de Accionistas";
    const headers = [
      "Tipo Identificacion","Identificación", "Nombre", "Nacionalidad", "País","Provincia","Ciudad",
      "Calle","Número","Banco","Tipo de Cuenta","Cuenta Bancaria","Acciones", "Participación", 
      "Tipo Acciones", "Estado", "Tipo Persona", "Pn Primer Nombre", "Pn Segundo nombre", "Pn Apellido Paterno",
      "Pn Apellido Materno", "Pn Estado Civil", "Conyuge Tipo Identificación","Conyuge Identificación","Conyuge Nombre",
      "Conyuge Nacionalidad", "RepLegal Tipo Identificacion", "RepLegal Identificacion", "RepLegal nombre", "RepLegal Nacionalidad",
      "RepLegal Telefono", "RepLegal Email", "Telefono1", "Observación1", "Telefono2", "Observación2", "Telefono3", "Observación3",
      "Email1", "Email2", "Email3","Fecha de Registro", "Fecha de Modificación"
    ];
    const letrasColumnas = ['A', 'B', 'C', 'D', 'E', 'F', 'G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
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
    sheet.getCell('D4').value = "Fecha de creación: " + fechaAMD;
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
          elt.tipoIdentificacion,
          elt.identificacion, 
          elt.nombre, 
          elt.paisNacionalidad, 
          elt.direccionPais,
          elt.direccionProvincia,
          elt.direccionCiudad,
          elt.direccionCalle,
          elt.direccionNumero,
          elt.nombreBanco,
          elt.tipoCuenta,
          elt.cuentaBancaria,
          elt.cantidadAcciones,
          elt.participacion,
          elt.tipoAcciones,
          elt.estado,
          elt.tipoPersona,
          elt.pn_primerNombre,
          elt.pn_segundoNombre,
          elt.pn_apellidoPaterno,
          elt.pn_apellidoMaterno,
          elt.pn_estadoCivil,
          elt.conyugue_tipoIdentificacion,
          elt.conyugue_identificacion,
          elt.conyugue_nombre,
          elt.conyugue_nacionalidad,
          elt.repLegal_tipoIdentificacion,
          elt.repLegal_identificacion,
          elt.repLegal_nombre,
          elt.repLegal_nacionalidad,
          elt.repLegal_telefono,
          elt.repLegal_email,
          elt.telefono1,
          elt.obs1,
          elt.telefono2,
          elt.obs2,
          elt.telefono3,
          elt.obs3,
          elt.email1,
          elt.email2,
          elt.email3,
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
        anchor.download = "LibroAccionistas.xlsx";
        anchor.click();
        window.URL.revokeObjectURL(url);
      });
    });
  }

  const exportListadoAccionistas = async () => {
    let filter = {estado:{},tipoPersona:{}};
    if (estadoListado != "0") {
      filter.estado.eq = estadoListado == "1" ? "Activo" 
      : estadoListado == "2" ? "Bloqueado" 
      : estadoListado == "3" ? "Inactivo" 
      : null;
    } else {
      filter.estado.ne = "TODOS";
    }
    if (tipoPersonaSelect != "0") {
      filter.tipoPersona.eq = tipoPersonaSelect == "1" ? "PN" 
      : tipoPersonaSelect == "2" ? "PJ" 
      : null;
    } else {
      filter.tipoPersona.ne = "TODOS";
    }
    const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter} });
    const libroAccionista = apiData.data.listAccionistas.items;
    // Creacion del Xlsx
    const title = "Listado de Accionistas";
    const headers = [
      "Tipo de Persona", "Identificación", "Nombre", "Nacionalidad", "Teléfono", "Email",
      "Tipo de Acción","Acciones","Estado"];
    const letrasColumnas = ['A', 'B', 'C', 'D', 'E', 'F', 'G','H','I'];
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
    sheet.getCell('D4').value = "Fecha de creación: " + fechaAMD;
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
    ];
    const promise = Promise.all(
      libroAccionista.map(async (elt) => {
        sheet.addRow([
          elt.tipoPersona, 
          elt.identificacion, 
          elt.nombre, 
          elt.paisNacionalidad, 
          elt.telefono1,
          elt.email1,
          elt.tipoAcciones,
          elt.cantidadAcciones, 
          elt.estado
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

  const exportTransferencias = async () => {
    let filter = {
      estado: {
        eq: 'Aprobada' // filter priority = 1
      },
      or: [
        { operacion: { eq: 'Cesión' } },
      { operacion: { eq: 'Posesión Efectiva' } },
      { operacion: { eq: 'Donación' } },
      { operacion: { eq: 'Testamento' } }]
    };
    // Procesamiento de datos
    const apiData = await API.graphql({ query: listOperaciones, variables: { filter: filter, limit: 10000 }, });
    const operacionesFromAPI = apiData.data.listOperaciones.items;
    console.log("Operacionesfromapi: ",operacionesFromAPI);
    const apiData2 = await API.graphql({ query: listHerederoPorOperacions, variables: { limit: 10000 }, });
    const operacionesFromAPI2 = apiData2.data.listHerederoPorOperacions.items;
    console.log("Operacionesfromapi2: ",operacionesFromAPI2);
    const apiData3 = await API.graphql({ query: listAccionistas });
    const listaAccionistas = apiData3.data.listAccionistas.items;
    const operacionesAccionistas = operacionesFromAPI.map(t1 => ({ ...t1, ...listaAccionistas.find(t2 => t2.decevale === t1.idCedente)}));
    /*const operacionesAccionistas2 = operacionesAccionistas.map(function (elt) {
      return { 
        id: elt.id,
        fecha: elt.fecha, 
        operacion: elt.operacion,
        idCedente: elt.idCedente,
        cedente: elt.cedente,
        identificacionCedente: elt.identificacion,
        titulo: elt.titulo,
        acciones: elt.acciones,
        idCesionario: elt.idCesionario,
        cesionario: elt.cesionario,
      };
    });*/
    console.log("operacionesAccionistas: ",operacionesAccionistas);

    const posisionEfectiva = operacionesFromAPI2.map(t1 => ({ ...t1, ...operacionesFromAPI.find(t2 => t2.id === t1.operacionId) }))
    console.log("posisionEfectiva: ",posisionEfectiva);
    const operacionesSinPosesionEfectivas = operacionesFromAPI.filter((el) =>
      el.operacion != 'Posesión Efectiva'
    );
    let finalmente = [...operacionesSinPosesionEfectivas, ...posisionEfectiva]
    console.log("finalmente: ",finalmente);
    if (valAccionista.id) {
      const finalmente3 = finalmente.filter((id) => id.idCedente == valAccionista.id || id.idCesionario == valAccionista.id);
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
    const headers = ["Fecha", "Transferencia", "Cedente","Documento Identidad Cedente", "Acciones", "Cesionario","Documento Identidad Cesionario"];
    const letrasColumnas = ['A', 'B', 'C', 'D', 'E','F','G'];
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Transferencias");
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
    sheet.getCell('D4').value = "Fecha de creación: " + fechaAMD;
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
      { width: 20 },{ width: 20 },{ width: 20 },{ width: 20 },{ width: 20 },
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
    let filter = {decevale:{},periodo:{}};
    if (valAccionista.id) {
      filter.decevale.eq = valAccionista.id;
    } else {
      filter.decevale.ne = "NoEmpty";
    }
    if (periodoDividendo.periodo) {
      filter.periodo.eq = periodoDividendo.periodo;
    } else {
      filter.periodo.ne = "NoEmpty";
    }
    const apiData = await API.graphql({ query: listDividendosAccionistas, variables: { filter: filter }});
    const dividendosFromAPI = apiData.data.listDividendosAccionistas.items;
    // Creacion del Xlsx
    const title = "Reporte de Dividendos";
    const headers = ["Identificación", "Nombre", "Nacionalidad",
      "Acciones", "Estado","Periodo","Dividendo","Base Imponible",
      "Retencion", "Dividendo Recibido"];
    const letrasColumnas = ['A', 'B', 'C', 'D', 'E', 'F', 'G','H','I','J'];
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
    sheet.getCell('D4').value = "Fecha de creación: " + fechaAMD;
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
      { width: 20 },{ width: 20 },{ width: 20 },{ width: 20 },{ width: 20 },
      { width: 20 },{ width: 20 },{ width: 20 },{ width: 20 },{ width: 20 },
    ];
    const promise = Promise.all(
      dividendosFromAPI.map(async (elt) => {
        sheet.addRow([
          elt.identificacion,
          elt.nombre,
          elt.paisNacionalidad,
          elt.cantidadAcciones,
          elt.estado,
          elt.periodo,
          elt.dividendo,
          elt.baseImponible,
          elt.retencion,
          elt.dividendoRecibido
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

  const exportOperaciones = async () => {
    // Carga de datos
    let filter = {operacion:{}};
    if (tipoOperacion != "0") {
      filter.operacion.eq = tipoOperacion;
    } else {
      filter.operacion.ne = "NoEmpty";
    }
    console.log("Filter: ",filter)
    const apiData = await API.graphql({ query: listOperaciones, variables: { filter: filter }});
    const operacionesFromAPI = apiData.data.listOperaciones.items;
    console.log("operacionesFromAPI: ",operacionesFromAPI);
    var dateHasta = new Date(operacionesHasta);
    dateHasta.setDate(dateHasta.getDate() + 1);
    const result = operacionesFromAPI.filter(d => {
      var time = new Date(+d.fecha.split("-")[2], d.fecha.split("-")[1] - 1, +d.fecha.split("-")[0]).getTime();
      return (new Date(operacionesDesde).getTime() < time && time < new Date(dateHasta).getTime());
    });
    console.log("const result: ",result)
    // Creacion del Xlsx
    const title = "Reporte de Operaciones";
    const headers = ["Fecha", "Operación", "Cedente",
      "Titulo", "Acciones","Cesionario","Estado",
      "Usuario Ingreso", "Usuario Aprobador","Fecha Aprobación","Motivo Rechazo",
      "Observación","Valor Nominal","Capital","Fecha Valor"
    ];
    const letrasColumnas = ['A','B','C','D','E', 'F','G','H','I','J', 'K','L','M','N','O'];
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
    sheet.getCell('D4').value = "Fecha de creación: " + fechaAMD;
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
      { width: 20 },{ width: 20 },{ width: 20 },{ width: 20 },{ width: 20 },
      { width: 20 },{ width: 20 },{ width: 20 },{ width: 20 },{ width: 20 },
      { width: 20 },{ width: 20 },{ width: 20 },{ width: 20 },{ width: 20 },
    ];
    const promise = Promise.all(
      result.map(async (elt) => {
        sheet.addRow([
          elt.fecha,
          elt.operacion,
          elt.cedente,
          elt.titulo,
          elt.acciones,
          elt.cesionario,
          elt.estado,
          elt.usuarioIngreso,
          elt.usuarioAprobador,
          elt.fechaAprobacion,
          elt.motivoRechazo,
          elt.observacion,
          elt.valorNominal,
          elt.capital,
          elt.fechaValor,
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
        anchor.download = "Operaciones.xlsx";
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
                id="dateLibroAcciDesde"
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
            <FormControl fullWidth style={{ paddingBottom: 5 , height: '49%'}}>
              <TextField
                size='small'
                id="dateLibroAcciHasta"
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
              startIcon={<SaveIcon />}
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
              <InputLabel id="selectTipoListAcci-label">Tipo de Persona</InputLabel>
              <Select
                labelId="selectTipoListAcci-label"
                id="selectTipoListAcci"
                value={tipoPersonaSelect}
                label="Estado"
                onChange={handleChangeTipoPersonaSelect}
              >
                <MenuItem value={0} >Todos</MenuItem>
                <MenuItem value={1} >Persona Natural</MenuItem>
                <MenuItem value={2} >Persona Juridica</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth style={{ paddingBottom: 5, height: '48%' }}>
              <InputLabel id="selectEstadoListAcci-label">Estado</InputLabel>
              <Select
                labelId="selectEstadoListAcci-label"
                id="selectEstadoListAcci"
                value={estadoListado}
                label="Estado"
                onChange={handleChangeEstadoListado}
              >
                <MenuItem value={0} >Todos</MenuItem>
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
              startIcon={<SaveIcon />}
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
                  shrink: true
                }}
              />
            </FormControl>
            <FormControl fullWidth style={{ paddingBottom: 5, height: '49%' }}>
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
            <Button
              size="small"
              variant="contained"
              color="primary"
              style={{ height: '15%' }}
              className={classes.button}
              startIcon={<SaveIcon />}
              onClick={exportTransferencias}
            >
              Descargar
            </Button>
          </Grid>
          <Grid item sm={6} md={4} lg={3} xl={2} style={{ minHeight:250 }}>
            <Typography variant='body2' color='secondary' style={{ height: '15%' }}>
              Dividendos
            </Typography>
            <Autocomplete
              value={periodoDividendo}
              size='small'
              id="comboBoxPeriodoDividendo"
              options={periodosDividendos}
              getOptionLabel={(option) => option.periodo ? option.periodo : ""}
              renderInput={(params) => <TextField {...params} label="Periodo" margin="normal" variant="outlined" />}
              onChange={(option, value) => handleClickPeriodoDividendo(option, value)}
            />
            <Autocomplete
              value={valAccionista}
              size='small'
              id="comboBoxAccionistaDividendo"
              options={accionistas}
              getOptionLabel={(option) => option.nombre ? option.nombre : ""}
              style={{ height: '43%' }}
              renderInput={(params) => <TextField {...params} label="Accionista" margin="normal" variant="outlined" />}
              onChange={(option, value) => handleClickAccionista(option, value)}
            />
            <Button
              size="small"
              variant="contained"
              color="primary"
              style={{ height: '15%' }}
              className={classes.button}
              startIcon={<SaveIcon />}
              onClick={exportDividendos}
            >
              Descargar
            </Button>
          </Grid>
          <Grid item sm={6} md={4} lg={3} xl={2} style={{ minHeight:250 }}>
            <Typography variant='body2' color='secondary' style={{ height: '15%' }}>
              Operaciones
            </Typography>
            <FormControl fullWidth style={{ paddingBottom: 5 }}>
              <TextField
                size='small'
                id="datetime-local"
                label="Desde"
                type="date"
                defaultValue={operacionesDesde}
                value={operacionesDesde}
                onChange={handleChangeDateOperacionesDesde}
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
                defaultValue={operacionesHasta}
                value={operacionesHasta}
                onChange={handleChangeDateOperacionesHasta}
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
            <FormControl fullWidth style={{ height: '25%' }}>
              <InputLabel id="selectDividendos-label">Tipo</InputLabel>
              <Select
                labelId="selectDividendos-label"
                id="selectDividendos"
                value={tipoOperacion}
                defaultValue={tipoOperacion}
                label="Tipo"
                onChange={handleChangeTipoOperacion}
              >
                <MenuItem value={0} >Todos</MenuItem>
                <MenuItem value={"Aumento Capital"} >Aumento de Capital</MenuItem>
                <MenuItem value={"Bloqueo"} >Bloqueo</MenuItem>
                <MenuItem value={"Canje"} >Canje</MenuItem>
                <MenuItem value={"Desbloqueo"} >Desbloqueo</MenuItem>
                <MenuItem value={"Donación"} >Donación</MenuItem>
                <MenuItem value={"Testamento"} >Testamento</MenuItem>
              </Select>
            </FormControl>
            <Button
              size="small"
              variant="contained"
              color="primary"
              style={{ height: '15%' }}
              className={classes.button}
              startIcon={<SaveIcon />}
              onClick={exportOperaciones}
            >
              Descargar
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </main>

  );
}
