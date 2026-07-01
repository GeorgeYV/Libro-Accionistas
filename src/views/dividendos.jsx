import React, { useState, useEffect, Fragment } from 'react'
import { API, Storage, graphqlOperation, Auth } from 'aws-amplify';
import {
  getParametro, listDividendosAccionistas, listDividendoNuevos,
  listAccionistas, listDetalleDividendos, listTitulos,
  listDividendosTitulos,
  listTituloPorOperacions,
  listAsambleas,
  listAccionistasxJuntas
} from '../graphql/queries';
import {
  createDividendoNuevo, updateDividendoNuevo, updateDividendosAccionista,
  createDetalleDividendo, createTitulo,
  createDividendosTitulos,
  updateDetalleDividendo,
  updateDividendosTitulos,
  updateAsamblea
} from '../graphql/mutations';

import { makeStyles } from '@material-ui/core/styles';
import { createTheme } from '@material-ui/core/styles';

import {
  Grid, Typography, Button, Chip, TextField, LinearProgress,
  FormControl, Box, IconButton, InputLabel, Select, MenuItem,
  Dialog, DialogActions, DialogContent, DialogTitle, Snackbar,
  CircularProgress, Checkbox
} from '@material-ui/core';

import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';

import PageviewIcon from '@material-ui/icons/Pageview';
import EditIcon from '@material-ui/icons/Edit';
import DescriptionIcon from '@material-ui/icons/Description';
import MuiAlert from '@material-ui/lab/Alert';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import CheckIcon from '@material-ui/icons/Check';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import { uuid } from 'uuidv4';
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const defaultTheme = createTheme();

const useStyles = makeStyles(
  (theme) => ({
    root: {
      padding: theme.spacing(0, 2, 0),
      justifyContent: 'space-between',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    appBarSpacer: {
      ...theme.mixins.toolbar,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(2),
    },
    button: {
      borderRadius: 20,
    }
  }),
  { defaultTheme },
);

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
const fechaHoyAMD = `${date}-${month}-${year}`;

export default function Dividendos() {
  const [asambleas, setAsambleas] = useState([]);
  const [accionistasCorte, setAccionistasCorte] = useState([]);
  const [openAccionistas, setOpenAccionistas] = useState(false);
  const [accionistasCorteDividendos, setAccionistasCorteDividendos] = useState([]);
  const [openAccionistasDividendos, setOpenAccionistasDividendos] = useState(false);
  const [cantidadEmitido, setCantidadEmitido] = useState(1);
  const [valorNominal, setValorNominal] = useState(1);
  const [baseImponible, setBaseImponible] = useState(0);
  const [rowsSelectAccionistas, setRowsSelectAccionistas] = useState([]);
  const [userName, setUserName] = useState("");
  const [idDetalleDividendo, setIdDetalleDividendo] = useState("");
  const [openCrearDividendo, setOpenCrearDividendo] = useState(false);
  const [selectAccionistas, setSelectAccionistas] = useState(false);
  const [rows, setRows] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState([]);
  const [openSnack, setOpenSnack] = useState(false);
  const [openSnackDanger, setOpenSnackDanger] = useState(false);
  const [circular, setCircular] = useState(false);
  const [refrescar, setRefrescar] = useState(false);
  const [searchText, setSearchText] = useState('');
  var [periodos, setPeriodos] = useState([]);
  var [listaPeriodosSeleccionados, setListaPeriodosSeleccionados] = useState([]);
  var [listaAccionistasDividendo, setListaAccionistasDividendo] = useState([]);
  var [formData, setFormData] = useState({
    periodo: '',
    secuencial: '',
    concepto: '',
    dividendo: 0,
    porcentajeRepartir: 0,
    dividendoRepartir: 0,
    fechaCorte: '',
    fechaPago: '',
    estado: 'Nuevo',
    retencion: 0,
    idDividendoOrigen: '',
    saldoDividendo: 0,
    saldoPorcentajeDividendo: 0,
    entregado: 0,
    porEntregar: 0,
  });

  const columns = [
    {
      field: 'div_periodo',
      headerName: 'Periodo',
      width: 100,
    },
    {
      field: 'ddiv_secuencial',
      headerName: 'Secuencial',
    },
    {
      field: 'div_concepto',
      headerName: 'Concepto',
      width: 120,
    },
    {
      field: 'div_dividendo',
      headerName: 'Total Dividendo',
      type: 'number',
      width: 120,
    },
    {
      field: 'ddiv_porcentaje',
      headerName: 'Reparto Acordado',
      type: 'number',
      width: 100,
    },
    {
      field: 'repartir',
      headerName: 'Repartir',
      type: 'number',
      width: 120,
    },
    {
      field: 'ddiv_fecha_pago',
      headerName: 'Pago',
      width: 90,
    },
    {
      field: 'ddiv_fecha_junta',
      headerName: 'Junta',
      width: 90,
    },
    {
      field: 'saldo_dividendo',
      headerName: 'Saldo Div',
      type: 'number',
      width: 120,
    },
    {
      field: "Detalle",
      renderCell: (cellValues) => {
        return <Fragment>
          <IconButton onClick={() => {
            fetchAccionistas(cellValues.row);
            setPeriodoSeleccionado(cellValues.row);
          }
          } color='primary'><PageviewIcon /></IconButton>
        </Fragment>
      }
    }
  ];

  const columnsAccionistasCorte = [
    {
      field: 'acc_identificacion',
      headerName: 'Identificación',
      width: 100,
    },
    {
      field: 'acc_nombre_completo',
      headerName: 'Nombre',
      width: 300
    },
    {
      field: 'acc_tipo_identificacion',
      headerName: 'Persona',
    },
    {
      field: 'acc_residencia',
      headerName: 'Residencia',
    },
    {
      field: 'acc_nacionalidad',
      headerName: 'Beneficiario',
    },
    {
      field: 'acc_cantidad_acciones',
      headerName: 'Acciones',
      type: 'number',
    },
    {
      field: 'acc_participacion',
      headerName: 'Participación',
      type: 'number',
    },
    {
      field: 'dividendo',
      headerName: 'Dividendo',
      type: 'number',
    },
    {
      field: 'retencion',
      headerName: 'Retención',
      type: 'number',
    },
    {
      field: 'dividendoRecibido',
      headerName: 'Pagar',
      type: 'number',
    }
  ];

  const columnsAccionistasCorteDividendos = [
    {
      field: 'acc_identificacion',
      headerName: 'Identificación',
      width: 100,
    },
    {
      field: 'acc_tipo_identificacion',
      headerName: 'Persona',
      width: 60,
    },
    {
      field: 'acc_residencia',
      headerName: 'Residencia',
      width: 100,
    },
    {
      field: 'acc_nombre_completo',
      headerName: 'Beneficiario',
      width: 300,
    },
    {
      field: 'acc_cantidad_acciones',
      headerName: 'Acciones',
      type: 'number',
      width: 100,
    },
    {
      field: 'acc_participacion',
      headerName: 'Participación',
      type: 'number',
      width: 110,
    },
    {
      field: 'dividendo',
      headerName: 'Dividendo',
      type: 'number',
      width: 110,
    },
    {
      field: 'retencion',
      headerName: 'Retención',
      type: 'number',
      width: 110,
    },
    {
      field: 'dividendoRecibido',
      headerName: 'Total a Pagar',
      type: 'number',
      width: 110,
    },
    {
      field: 'div_tit_fecha_pago',
      headerName: 'Fecha de pago',
    },
    {
      field: "",
      headerName: 'Pagar',
      renderCell: (cellValues) => {
        return <Fragment>
          <label>
            <input id={'pago' + cellValues.row.id} style={{ display: 'none' }} type="file" accept="application/pdf" onChange={(e) => pagarDividendoAccionista(e, cellValues.row)} />
            <Button color='primary' disabled={cellValues.row.div_tit_fecha_pago == '' ? false : true} startIcon={<DescriptionIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', }}></Button>
            {cellValues.row.div_tit_fecha_pago != '' && <IconButton onClick={() => getPagoCliente(cellValues.row.div_tit_documento)} ><CheckIcon /></IconButton>}
          </label>
        </Fragment>
      }
    },
  ];

  async function putPagoCliente(e) {
    if (!e.target.files[0]) { return }
    const file = e.target.files[0];
    const filename = uuid() + file.name
    await Storage.put(filename, file);
    return filename;
  }

  const getPagoCliente = (filename_aux) => {
    //e.stopPropagation();
    Storage.get(filename_aux)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function (response) {
          if (response.status === 200) {
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));
  };

  async function pagarDividendoAccionista(e, row) {
    if (row.div_tit_fecha_pago != "") return;
    try {
      var filtro = { div_tit_accionista_id: { eq: row.id }, div_tit_ddiv_id: { eq: periodoSeleccionado.id } };
      console.log("Filtro:", filtro);
      var apiData = await API.graphql({ query: listDividendosTitulos, variables: { filter: filtro, limit: 10000 } });
      const filename_aux = await putPagoCliente(e);
      console.log("filename_aux:", filename_aux);
      apiData.data.listDividendosTitulos.items.map((item) => {
        API.graphql(graphqlOperation(updateDividendosTitulos, {
          input: {
            id: item.id,
            div_tit_fecha_pago: fechaHoyAMD,
            div_tit_documento: filename_aux
          }
        }));
      });
      var aux = accionistasCorteDividendos.findIndex(({ id }) => id === row.id);
      setAccionistasCorteDividendos(prevLista =>
        prevLista.map(item =>
          item.id === row.id ? { ...item, div_tit_fecha_pago: fechaHoyAMD, div_tit_documento: filename_aux } : item
        )
      );
      await API.graphql(graphqlOperation(updateDetalleDividendo, {
        input: {
          id: periodoSeleccionado.id,
          ddiv_dividendo: row.dividendo + periodoSeleccionado.ddiv_dividendo,
        }
      }));
      setRows(prevLista =>
        prevLista.map(item =>
          item.id === periodoSeleccionado.id ? { ...item, saldo_dividendo: periodoSeleccionado.saldo_dividendo - row.dividendo } : item
        )
      );
    } catch (err) {
      console.log('error creando pago dividendo accionista:', err)
    }
  }

  const handleClose = () => {
    setOpenAccionistas(false);
  }

  const handleCloseAccionistasDividendos = () => {
    setOpenAccionistasDividendos(false);
  }

  function getUser() {
    let user
    if (Auth.user != null) user = Auth.user.username;
    return user;
  }

  function getRetencion1(base, persona, residente, beneficiario) {
    let num = 0, reduccion = 0, retencion = 0;
    persona = parseInt(persona);
    residente = residente.trim();
    beneficiario = beneficiario.trim();
    if (persona == 3) {
      return ((base * 14 / 100.00) - reduccion).toFixed(2);
    }
    //persona natural residente 12% reduccion de 3 salarios basicos
    if (persona == 0 && residente == "Ecuador") {
      num = 12;
      reduccion = 3 * baseImponible;
    }
    //Sociedad no residente 10%
    if (persona == 1 && residente != "Ecuador") num = 10;
    //persona natural no residente 10%
    if (persona == 0 && residente != "Ecuador") num = 10;
    //sociedad residente 0%
    if (persona == 1 && residente == "Ecuador" && beneficiario == "Ecuador") num = 0;
    //sociedad no residente beneficiario en ecuador 12% reduccion de 3 salarios basicos
    if (persona == 1 && residente != "Ecuador" && beneficiario == "Ecuador") {
      num = 12;
      reduccion = 3 * baseImponible;
    }
    //sociedad no residente paraiso fiscal beneficiario en ecuador 14%
    if (persona == 0 && residente != "Panama" && beneficiario == "Ecuador") num = 14;
    //las empresas necesitan adjuntar el archivo rebefics caso contrario se retiene 14%

    retencion = ((base * num / 100.00) - reduccion).toFixed(2);
    return retencion < 0 ? 0 : retencion;
  }

  const handleCloseCrearDividendo = () => {
    setFormData({
      periodo: '',
      secuencial: '',
      concepto: '',
      dividendo: 0,
      porcentajeRepartir: 0,
      dividendoRepartir: 0,
      fechaCorte: '',
      fechaPago: '',
      estado: 'Nuevo',
      retencion: 0,
      idDividendoOrigen: '',
      saldoDividendo: 0,
      saldoPorcentajeDividendo: 0,
      entregado: 0,
      porEntregar: 0,
    });
    setOpenCrearDividendo(false);
    setListaPeriodosSeleccionados([]);
  }
  const handleCloseSelectAccionistas = () => {
    setListaAccionistasDividendo([]);
    setSelectAccionistas(false);
  }
  const handleConfirmarListaAccionistas = () => {
    setSelectAccionistas(false);
  }
  const handleOpenSelectAccionistas = async () => {
    const apiData = await API.graphql({ query: listAccionistas, variables: { projectionExpression: "id", select: "SPECIFIC_ATTRIBUTES", limit: 1000 } });
    var aux = apiData.data.listAccionistas.items;
    setListaAccionistasDividendo([]);
    setRowsSelectAccionistas(aux);
    setSelectAccionistas(true);
  }
  const handleOpenCrearDividendo = () => {
    fetchAsambleas();
    setOpenCrearDividendo(true);
  };

  const handleConfirmarDividendo = async () => {
    var listaDividendosTitulos, titulosTotales = 0, titulosAux;
    listaDividendosTitulos = accionistasCorte.map(function (e) {
      return {
        div_tit_ddiv_id: periodoSeleccionado.ddiv_dividendo_id,
        div_tit_accionista_id: e.id,
        div_tit_participacion: e.acc_participacion,
        div_tit_dividendo: e.dividendo,
        div_tit_retencion: e.retencion,
        div_tit_base_imponible: e.baseImponible,
        titulos_totales: e.acc_cantidad_acciones
      };
    });
    const apiData = await API.graphql({ query: listTitulos, variables: { limit: 1000 } });
    var titulosCompletos = apiData.data.listTitulos.items;
    listaDividendosTitulos.map(function (e) {
      titulosAux = titulosCompletos.filter((tit) => tit.tit_accionista_id == e.div_tit_accionista_id);
      titulosTotales = titulosTotales + titulosAux.length;
      titulosAux.map(function (titulos) {
        var auxCalculoParticipacionTitulo = (titulos.tit_acciones / e.titulos_totales);
        API.graphql(graphqlOperation(createDividendosTitulos, {
          input: {
            div_tit_ddiv_id: periodoSeleccionado.id,
            div_tit_titulo_id: titulos.id,
            div_tit_accionista_id: e.div_tit_accionista_id,
            div_tit_participacion: Math.round(e.div_tit_participacion * auxCalculoParticipacionTitulo * 100) / 100,
            div_tit_dividendo: Math.round(e.div_tit_dividendo * auxCalculoParticipacionTitulo * 100) / 100,
            div_tit_retencion: Math.round(e.div_tit_retencion * auxCalculoParticipacionTitulo * 100) / 100,
            div_tit_base_imponible: e.div_tit_base_imponible,
            div_tit_fecha_pago: "",
            div_tit_documento: ""
          }
        }));
      })
    });
    await API.graphql(graphqlOperation(updateDetalleDividendo, {
      input: {
        id: periodoSeleccionado.id,
        ddiv_titulos: titulosTotales
      }
    }));
    var aux = rows.findIndex(({ id }) => id === periodoSeleccionado.id);
    rows[aux].ddiv_titulos = titulosTotales;
    setOpenAccionistas(false);
  }

  async function fetchParametros() {
    const apiData = await API.graphql({ query: getParametro, variables: { id: '1' } });
    const parametrosFromAPI = apiData.data.getParametro;
    console.log("Parametros:", parametrosFromAPI);
    setCantidadEmitido(parametrosFromAPI.cantidadEmitida);
    setValorNominal(parametrosFromAPI.valorNominal);
    setBaseImponible(parametrosFromAPI.baseImponible);
  }

  async function fetchDividendos() {
    const apiData = await API.graphql({ query: listDividendoNuevos });
    const apiData2 = await API.graphql({ query: listDetalleDividendos });
    var aux, repetido, auxperiodos = [];
    for (let index = 2015; index <= year; index++) {
      auxperiodos.push({ id: index, periodo: index, tipo: "Nuevo", hijos: 0, div_repartido: 0 });
    }
    if (apiData.data.listDividendoNuevos.items.length > 0 && apiData2.data.listDetalleDividendos.items.length > 0) {
      const dividendosRelacionados = apiData2.data.listDetalleDividendos.items.map(function (e) {
        aux = apiData.data.listDividendoNuevos.items.find(({ id }) => id === e.ddiv_dividendo_id);
        return {
          id: e.id,
          ddiv_usuario: e.ddiv_usuario,
          ddiv_secuencial: e.ddiv_secuencial,
          ddiv_fecha_junta: e.ddiv_fecha_junta,
          ddiv_fecha_pago: e.ddiv_fecha_pago,
          ddiv_titulos: e.ddiv_titulos,
          ddiv_dividendo: e.ddiv_dividendo,
          ddiv_porcentaje: e.ddiv_porcentaje,
          ddiv_dividendo_id: e.ddiv_dividendo_id,
          div_periodo: aux.div_periodo,
          div_asamblea_id: aux.div_concepto.split("&&")[1],
          div_concepto: aux.div_concepto.split("&&")[0],
          div_dividendo: aux.div_dividendo,
          div_repartido: aux.div_repartido,
          repartir: (aux.div_dividendo * (e.ddiv_porcentaje / 100)),
          saldo_dividendo: (aux.div_dividendo * (e.ddiv_porcentaje / 100)) - e.ddiv_dividendo
        };
      });
      console.log("dividendosRelacionados:", dividendosRelacionados);
      apiData.data.listDividendoNuevos.items.map(function (e) {
        var repetidos = dividendosRelacionados.filter(x => x.div_periodo === e.div_periodo);
        repetido = auxperiodos.findIndex(x => x.periodo === e.div_periodo);
        var auxPorcentajeTotal = 0;
        repetidos.map(function (x) {
          auxPorcentajeTotal = auxPorcentajeTotal + x.ddiv_dividendo;
        });
        if (repetido != -1 && auxPorcentajeTotal < e.div_dividendo) {
          auxperiodos[repetido].tipo = "Parcial";
          var aux = dividendosRelacionados.find(({ div_periodo }) => div_periodo === auxperiodos[repetido].periodo);
          auxperiodos[repetido].id = aux.ddiv_dividendo_id;
          auxperiodos[repetido].div_repartido = auxPorcentajeTotal;
          auxperiodos[repetido].hijos = dividendosRelacionados.filter((e) => e.div_periodo == auxperiodos[repetido].periodo).length;
          auxperiodos[repetido].asamblea = aux.div_asamblea_id;
          auxperiodos[repetido].div_dividendo = aux.div_dividendo;
          auxperiodos[repetido].ddiv_porcentaje = aux.ddiv_porcentaje;
        } else {
          auxperiodos.splice(repetido, 1);
        }
      });
      setRows(dividendosRelacionados);
    }
    setPeriodos(auxperiodos);
    console.log("auxperiodos:", auxperiodos);
  }

  async function fetchAsambleas() {
    var apiData;
    apiData = await API.graphql({ query: listAsambleas, variables: { limit: 1000, filter: { estado: { eq: 'Realizada' } } } });
    setAsambleas(apiData.data.listAsambleas.items);
  }

  async function fetchAccionistas(row) {
    var accionistasCalculo, retencionAux = 0, retencionMaxima = 0, dividendoGenerado = row.div_dividendo * (row.ddiv_porcentaje / 100);
    var apiData3, accionistasFromAPI3, listaAccionistasAsamblea;
    if (row.ddiv_titulos == 0) {
      apiData3 = await API.graphql({ query: listAccionistasxJuntas, variables: { filter: { asambleaID: { eq: row.div_asamblea_id } }, limit: 1000 } });
      listaAccionistasAsamblea = apiData3.data.listAccionistasxJuntas.items;
      apiData3 = await API.graphql({ query: listAccionistas, variables: { filter: { acc_estado: { eq: '1' } }, limit: 1000 } });
      accionistasFromAPI3 = apiData3.data.listAccionistas.items;
      accionistasCalculo = accionistasFromAPI3.filter(obj1 =>
        listaAccionistasAsamblea.some(obj2 => obj1.id === obj2.accionistaID)
      );
      console.log("accionistasCalculo:", accionistasCalculo);
      accionistasCalculo = accionistasCalculo.map(function (e) {
        retencionAux = getRetencion1((dividendoGenerado * e.acc_cantidad_acciones / cantidadEmitido), e.acc_tipo_identificacion, e.acc_residencia, e.acc_nacionalidad)
        return {
          id: e.id,
          acc_nombre_completo: e.acc_nombre_completo,
          acc_decevale: e.acc_decevale,
          acc_estado: e.acc_estado,
          acc_tipo_identificacion: e.acc_tipo_identificacion == 0 ? 'Natural' : 'Jurídica',
          acc_identificacion: e.acc_identificacion,
          acc_nacionalidad: e.acc_nacionalidad,
          acc_residencia: e.acc_residencia,
          acc_cantidad_acciones: e.acc_cantidad_acciones,
          acc_participacion: (e.acc_cantidad_acciones / cantidadEmitido * 100).toFixed(2),
          acc_tipo_acciones: e.acc_tipo_acciones,
          periodo: row.periodo,
          dividendo: (dividendoGenerado * e.acc_cantidad_acciones / cantidadEmitido).toFixed(2),
          baseImponible: 0,
          retencion: retencionAux,
          dividendoRecibido: ((dividendoGenerado * e.acc_cantidad_acciones / cantidadEmitido).toFixed(2) - retencionAux).toFixed(2),
        };
      });
      console.log("accionistasCalculo:", accionistasCalculo);
      setAccionistasCorte(accionistasCalculo);
      setOpenAccionistas(true);
    } else {
      apiData3 = await API.graphql({ query: listAccionistas, variables: { limit: 1000 } });
      accionistasFromAPI3 = apiData3.data.listAccionistas.items;
      const apiData = await API.graphql({ query: listDividendosTitulos, variables: { filter: { div_tit_ddiv_id: { eq: row.id } }, limit: 10000 } });
      var titulos = apiData.data.listDividendosTitulos.items;
      var titulosAux = 0, dividendoAux = 0, baseImponibleAux = 0, fecgaPago = "", documento = "";

      accionistasCalculo = accionistasFromAPI3.map(function (e) {
        if (titulos.find(({ div_tit_accionista_id }) => div_tit_accionista_id == e.id)) {
          dividendoAux = 0;
          baseImponibleAux = 0;
          retencionAux = 0;
          if (e.acc_tipo_identificacion != 'Natural' && e.acc_identificacion[2] != 6)
            retencionMaxima = getRetencion1((dividendoGenerado * e.acc_cantidad_acciones / cantidadEmitido), 3, e.acc_residencia, e.acc_nacionalidad);
          titulosAux = titulos.filter((titulo) => titulo.div_tit_accionista_id == e.id);
          titulosAux.forEach((element) => {
            dividendoAux += element.div_tit_dividendo;
            retencionAux += element.div_tit_retencion;
            fecgaPago = element.div_tit_fecha_pago;
            documento = element.div_tit_documento;
          });
          return {
            id: e.id,
            acc_nombre_completo: e.acc_nombre_completo,
            acc_decevale: e.acc_decevale,
            acc_estado: e.acc_estado,
            acc_tipo_identificacion: e.acc_tipo_identificacion == 0 ? 'Natural' : 'Jurídica',
            acc_identificacion: e.acc_identificacion,
            acc_nacionalidad: e.acc_nacionalidad,
            acc_residencia: e.acc_residencia,
            acc_cantidad_acciones: e.acc_cantidad_acciones,
            acc_participacion: (e.acc_cantidad_acciones / cantidadEmitido * 100).toFixed(2),
            acc_tipo_acciones: e.acc_tipo_acciones,
            periodo: row.div_periodo,
            dividendo: dividendoAux,
            retencion: retencionAux,
            retencion_maxima: retencionMaxima,
            dividendoRecibido: dividendoAux - retencionAux,
            div_tit_fecha_pago: fecgaPago,
            div_tit_documento: documento
          };
        }
      });
      setAccionistasCorteDividendos(accionistasCalculo.filter((accionistas) => accionistas != null));
      setOpenAccionistasDividendos(true);
    }
  }

  const handlePeriodoChange = (event) => {
    /*document.getElementById("formControl-select-concepto").disabled = false;
    document.getElementById("textfield-dividendo").disabled = false;
    setFormData({ ...formData, 'periodo': event.target.value });
    var aux = periodos.findIndex(x => x.periodo === event.target.value),
      aux_concepto = '', aux_dividendo = 0, aux_repartido = 0;
    console.log("aux: ", aux);
    if (aux != -1 && periodos[aux].tipo == "Parcial") {
      var periodo_aux = rows.findIndex(x => x.div_periodo === periodos[aux].periodo);
      setFormData({ ...formData, concepto: rows[periodo_aux].div_concepto });
      aux_concepto = rows[periodo_aux].div_concepto;
      setFormData({ ...formData, 'dividendo': rows[periodo_aux].div_dividendo });
      aux_dividendo = rows[periodo_aux].div_dividendo;
      setFormData({ ...formData, 'saldoDividendo': rows[periodo_aux].div_repartido });
      aux_repartido = rows[periodo_aux].div_repartido;
      document.getElementById("formControl-select-concepto").disabled = true;
      document.getElementById("textfield-dividendo").disabled = true;
      console.log("rows[periodo_aux].div_concepto", rows[periodo_aux].div_concepto);
      console.log("rows", rows);
      console.log("fechaHoyAMD", fechaHoyAMD);
      console.log("fecha reverse", formData.fechaPago.split(" ")[0].split("-").reverse().join("-"));
      console.log("formData periodo change if", formData);
    }*/
    setFormData({
      ...formData,
      periodo: event.target.value,
      /*concepto: aux_concepto,
      dividendo: aux_dividendo,
      saldoDividendo: aux_dividendo - aux_repartido,*/
    });
    console.log("formData periodo change fuera", event.target.value);
  };

  const handleConceptoChange = (event) => {
    setFormData({ ...formData, 'concepto': event.target.value })
  };

  const handleDividendoChange = (event) => {
    var id_aux = event.target.id.replace("dividendo-", "");
    if (listaPeriodosSeleccionados.find(x => x.id == id_aux) == undefined)
      setListaPeriodosSeleccionados([...listaPeriodosSeleccionados, { id: id_aux, dividendo: event.target.value, periodo: id_aux, }]);
    else
      listaPeriodosSeleccionados[listaPeriodosSeleccionados.findIndex(x => x.id === id_aux)].dividendo = event.target.value;
  };

  const handlePorcentajeRepartirChange = (event) => {
    var id_aux = event.target.id.replace("porcentaje-repartir-", "");
    if (listaPeriodosSeleccionados.find(x => x.id == id_aux) == undefined)
      setListaPeriodosSeleccionados([...listaPeriodosSeleccionados, { id: id_aux, porcentaje: event.target.value }]);
    else {
      listaPeriodosSeleccionados[listaPeriodosSeleccionados.findIndex(x => x.id === id_aux)].porcentaje = event.target.value;
      var index_aux = listaPeriodosSeleccionados.findIndex(x => x.id === id_aux);
      listaPeriodosSeleccionados[index_aux].calculo = listaPeriodosSeleccionados[index_aux]["dividendo"] * event.target.value / 100.00;
    }
    var total_aux = listaPeriodosSeleccionados.reduce((acumulador, objetoActual) => acumulador + objetoActual.calculo, 0);


    setFormData({
      ...formData,
      'dividendoRepartir': total_aux
    })
  };

  const handleChangeFechaCorte = (event) => {
    setFormData({ ...formData, 'fechaCorte': event.target.value.split(" ")[0].split("-").reverse().join("-") })
  };
  const handleChangeFechaPago = (event) => {
    setFormData({ ...formData, 'fechaPago': event.target.value.split(" ")[0].split("-").reverse().join("-") })
  };

  const addDividendo = async () => {
    try {
      if (!formData.periodo || !formData.fechaCorte ||
        !formData.fechaPago) {
        setOpenSnackDanger(true);
        return;
      }
      setCircular(true);
      var dividendoID;
      var dividendo = {
        div_periodo: '',
        div_concepto: '',
        div_dividendo: 0,
        div_repartido: 0
      }
      var aux = 0;
      listaPeriodosSeleccionados.map(async (e) => {
        dividendo = {
          div_periodo: e.periodo,
          div_concepto: formData.concepto + "&&" + formData.periodo,
          div_dividendo: e.dividendo,
          div_repartido: 0
        }
        aux = periodos.findIndex(x => x.periodo === e.periodo);
        if (aux != -1 && periodos[aux].tipo != "Nuevo") {
          dividendoID = periodos[aux].id;
          dividendo.div_repartido = parseFloat(periodos[aux].div_repartido);
          aux = periodos[aux].hijos + 1;
        } else {
          var response = await API.graphql(graphqlOperation(createDividendoNuevo, { input: dividendo }));
          dividendoID = response.data.createDividendoNuevo.id
          aux = 1;
        }
        console.log("dividendo", dividendo);
        const detalleDividendo = {
          ddiv_usuario: userName,
          ddiv_secuencial: aux,
          ddiv_fecha_junta: formData.fechaPago,
          ddiv_fecha_pago: formData.fechaCorte,
          ddiv_titulos: 0,
          ddiv_dividendo: 0,
          ddiv_porcentaje: e.porcentaje,
          ddiv_dividendo_id: dividendoID
        }
        console.log("detalleDividendo", detalleDividendo);
        const idDetalleDividendo = await API.graphql(graphqlOperation(createDetalleDividendo, { input: detalleDividendo }));
      });
      await API.graphql(graphqlOperation(updateAsamblea, {
        input: {
          id: formData.periodo,
          estado: "DividendoGenerado"
        }
      }));
      setFormData({
        periodo: '',
        secuencial: '',
        concepto: '',
        dividendo: 0,
        porcentajeRepartir: 0,
        dividendoRepartir: 0,
        fechaCorte: '',
        fechaPago: '',
        estado: 'Nuevo',
        retencion: 0,
        idDividendoOrigen: '',
        saldoDividendo: 0,
        saldoPorcentajeDividendo: 0,
        entregado: 0,
        porEntregar: 0,
      });
      setCircular(false);
      handleCloseCrearDividendo();
      setRefrescar(!refrescar);
    } catch (err) {
      console.log('error creating transaction:', err)
    }
  }

  const handleCloseSnack = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnack(false);
  };
  const handleCloseSnackDanger = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackDanger(false);
  };
  const classes = useStyles();

  const preventMinus = (e) => {
    if (e.code === 'Minus') {
      e.preventDefault();
    }
  };
  const inputProps = {
    onKeyPress: preventMinus,
  };

  useEffect(() => {
    const user = getUser();
    setUserName(user);
    fetchParametros();
    fetchDividendos();
  }, [refrescar]);

  function mostrarElemento(id) {
    var elemento = document.getElementById(id);
    if (elemento.style.display == 'block')
      elemento.style.display = 'none';
    else
      elemento.style.display = 'block';
  }

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <div>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              size='small'
              onClick={handleOpenCrearDividendo}
              style={{ textTransform: 'none' }}
            >
              +  Nuevo Dividendo
            </Button>
          </div>
          <DataGrid
            style={{ backgroundColor: 'white' }}
            density="compact"
            autoHeight='true'
            autoPageSize='true'
            disableColumnMenu
            rows={rows}
            columns={columns}
            pageSize={20}
            rowsPerPageOptions={[20]}
          />
        </Grid>
        <Dialog open={openAccionistas} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth maxWidth="xl">
          <DialogTitle id="form-dialog-title">
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
              <Typography>{periodoSeleccionado.div_concepto}: {periodoSeleccionado.div_periodo} - {periodoSeleccionado.ddiv_secuencial}</Typography>
              <Typography>Total dividendo del periodo: {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(periodoSeleccionado.div_dividendo)}</Typography>
              <Typography>Total a repartir: {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(periodoSeleccionado.div_dividendo * periodoSeleccionado.ddiv_porcentaje / 100)}</Typography>
              <Typography>Porcentaje a repartir: {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(periodoSeleccionado.ddiv_porcentaje)} %</Typography>
            </div>
          </DialogTitle>
          <DialogContent>
            <DataGrid
              style={{ backgroundColor: 'white' }}
              density="compact"
              autoHeight='false'
              autoPageSize='true'
              disableColumnMenu
              disableSelectionOnClick
              rows={accionistasCorte}
              columns={columnsAccionistasCorte}
              pageSize={25}
              rowsPerPageOptions={[25]}
            />
          </DialogContent>
          <DialogActions style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={handleConfirmarDividendo} variant="contained" color="primary" style={{ textTransform: 'none' }}>
              Confirmar
            </Button>
            <Button onClick={handleClose} color="primary" >
              Salir
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openAccionistasDividendos} onClose={handleCloseAccionistasDividendos} aria-labelledby="form-dialog-title" fullWidth maxWidth="xl">
          <DialogTitle id="form-dialog-title">
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
              Ejercicio {periodoSeleccionado.div_concepto}: {periodoSeleccionado.div_periodo} - {periodoSeleccionado.ddiv_secuencial}
              <Typography >Total dividendo del periodo : {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(periodoSeleccionado.div_dividendo)}</Typography>
              <Typography >Total a repartir : {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(periodoSeleccionado.div_dividendo * periodoSeleccionado.ddiv_porcentaje / 100)}</Typography>
              <Typography >Porcentaje a repartir : {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(periodoSeleccionado.ddiv_porcentaje)} %</Typography>
              <Typography >Saldo del periodo : {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(periodoSeleccionado.saldo_dividendo)}</Typography>
            </div>
          </DialogTitle>
          <DialogContent style={{ height: '500px' }}>
            <DataGrid
              style={{ backgroundColor: 'white' }}
              density="compact"
              autoHeight='false'
              autoPageSize='true'
              disableColumnMenu
              disableSelectionOnClick
              rows={accionistasCorteDividendos}
              columns={columnsAccionistasCorteDividendos}
              pageSize={25}
              rowsPerPageOptions={[25]}
            />
          </DialogContent>
          <DialogActions style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={handleCloseAccionistasDividendos} color="primary" >
              Salir
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openCrearDividendo} onClose={handleCloseCrearDividendo} aria-labelledby="form-dialog-title" fullWidth maxWidth='md'>
          <DialogTitle id="form-dialog-title">Crear nuevo dividendo</DialogTitle>
          <DialogContent style={{ height: '450px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-evenly', width: '100%', }}>
                  <label>Periodos:</label>
                  <Grid container spacing={3}>
                    {periodos.map((e) => {
                      return <Grid item xs={12} sm={6} md={4}>
                        <input type="checkbox" onChange={() => mostrarElemento("fragment-periodo-" + e.id)} />
                        <label>{e.periodo}</label>
                        <div id={"fragment-periodo-" + e.id} style={{ display: 'none' }}>
                          <TextField
                            id={"dividendo-" + e.id}
                            label="Dividendo (USD)"
                            type='number'
                            value={e.div_dividendo}
                            onBlur={handleDividendoChange}
                          />
                          <TextField
                            id={"porcentaje-repartir-" + e.id}
                            label="% a repartir"
                            type='number'
                            value={e.ddiv_porcentaje}
                            onBlur={handlePorcentajeRepartirChange}
                          />
                        </div>
                      </Grid>
                    })}
                  </Grid>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-evenly', width: '100%', }}>
                  <FormControl style={{ width: '100%' }}>
                    <InputLabel id="periodo-select-label">Asamblea</InputLabel>
                    <Select
                      labelId="periodo-select-label"
                      id="select-periodo"
                      value={formData.periodo}
                      onChange={handlePeriodoChange}
                    >
                      {asambleas.map((e) => {
                        return <MenuItem value={e.id}>{e.fecha}</MenuItem>;
                      })}
                    </Select>
                  </FormControl>
                </div>
                <FormControl id={"formControl-select-concepto"} style={{ width: '100%' }}>
                  <InputLabel id="concepto-select-label">Concepto</InputLabel>
                  <Select
                    labelId="concepto-select-label"
                    id="select-concepto"
                    value={formData.concepto}
                    label="Concepto"
                    onChange={handleConceptoChange}
                  >
                    <MenuItem value={'Resultado'} >Resultado</MenuItem>
                    <MenuItem value={'Resultado VPP'} >Resultado VPP</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  id="outlined-required"
                  label="Dividendo a Repartir (USD)"
                  value={formData.dividendoRepartir}
                  fullWidth
                  disabled
                  type='number'
                />
                <FormControl fullWidth style={{ paddingTop: 10 }}>
                  <TextField
                    size='small'
                    id="datetime-local"
                    label="Fecha Pago"
                    type="date"
                    defaultValue={fechaHoyAMD}
                    variant="standard"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={formData.fechaCorte.split(" ")[0].split("-").reverse().join("-")}
                    onChange={handleChangeFechaCorte}
                    fullWidth='false'
                  />
                </FormControl>
                <FormControl fullWidth style={{ paddingTop: 10, marginBottom: 20 }}>
                  <TextField
                    size='small'
                    id="datetime-local-2"
                    label="Fecha Junta"
                    type="date"
                    value={formData.fechaPago.split(" ")[0].split("-").reverse().join("-")}
                    defaultValue={fechaHoyAMD}
                    variant="standard"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={handleChangeFechaPago}
                  />
                </FormControl>
                Saldo del periodo {formData.saldoDividendo} (USD)
              </div>

            </div>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              size='small'
              onClick={addDividendo}
              style={{ textTransform: 'none' }}
            >
              Crear Dividendo
            </Button>
            <Button onClick={handleCloseCrearDividendo} color="secondary" style={{ textTransform: 'none' }}>
              Salir
            </Button>
          </DialogActions>
        </Dialog>

        {circular && <CircularProgress />}
        <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
          <Alert onClose={handleCloseSnack} severity="success">
            Se registró correctamente el dividendo.
          </Alert>
        </Snackbar>
        <Snackbar open={openSnackDanger} autoHideDuration={6000} onClose={handleCloseSnackDanger}>
          <Alert onClose={handleCloseSnackDanger} severity="error">
            Registre todos los campos requeridos!
          </Alert>
        </Snackbar>
      </Grid>
    </main>
  );
}