import React, { useState, useEffect, Fragment } from 'react'
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { getParametro, listDividendosAccionistas, listDividendoNuevos,
  listAccionistas, listDetalleDividendos, listTitulos } from '../graphql/queries';
import { createDividendoNuevo, updateDividendosAccionista,
  createDetalleDividendo
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
import MuiAlert from '@material-ui/lab/Alert';

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

export default function Dividendos() {
  const [accionistasCorte, setAccionistasCorte] = useState([]);
  const [openAccionistas, setOpenAccionistas] = useState(false);
  const [accionistasCorteDividendos, setAccionistasCorteDividendos] = useState([]);
  const [openAccionistasDividendos, setOpenAccionistasDividendos] = useState(false);
  const [cantidadEmitido, setCantidadEmitido] = useState(1);
  const [valorNominal, setValorNominal] = useState(1);
  const [baseImponible, setBaseImponible] = useState(0);
  const [retencionNoResidente, setRetencionNoResidente] = useState(0);
  const [FB1, setFB1] = useState(0);
  const [FB2, setFB2] = useState(0);
  const [FB3, setFB3] = useState(0);
  const [FB4, setFB4] = useState(0);
  const [FB5, setFB5] = useState(0);
  const [FB6, setFB6] = useState(0);
  const [FE1, setFE1] = useState(0);
  const [FE2, setFE2] = useState(0);
  const [FE3, setFE3] = useState(0);
  const [FE4, setFE4] = useState(0);
  const [FE5, setFE5] = useState(0);
  const [FE6, setFE6] = useState(0);
  const [RFB1, setRFB1] = useState(0);
  const [RFB2, setRFB2] = useState(0);
  const [RFB3, setRFB3] = useState(0);
  const [RFB4, setRFB4] = useState(0);
  const [RFB5, setRFB5] = useState(0);
  const [RFB6, setRFB6] = useState(0);
  const [RFE1, setRFE1] = useState(0);
  const [RFE2, setRFE2] = useState(0);
  const [RFE3, setRFE3] = useState(0);
  const [RFE4, setRFE4] = useState(0);
  const [RFE5, setRFE5] = useState(0);
  const [RFE6, setRFE6] = useState(0);
  const [retencionMinima, setRetencionMinima] = useState(0);
  const [retencionMaxima, setRetencionMaxima] = useState(0);
  const [Retencion_PN_Loc, setRetencion_PN_Loc] = useState(0);
  const [Retencion_PN_NPF, setRetencion_PN_NPF] = useState(0);
  const [Retencion_PN_PF, setRetencion_PN_PF] = useState(0);
  const [Retencion_PJ_Loc_Loc, setRetencion_PJ_Loc_Loc] = useState(0);
  const [Retencion_PJ_Loc_NPF, setRetencion_PJ_Loc_NPF] = useState(0);
  const [Retencion_PJ_Loc_PF, setRetencion_PJ_Loc_PF] = useState(0);
  const [Retencion_PJ_PF_Loc, setRetencion_PJ_PF_Loc] = useState(0);
  const [Retencion_PJ_PF_NPF, setRetencion_PJ_PF_NPF] = useState(0);
  const [Retencion_PJ_PF_PF, setRetencion_PJ_PF_PF] = useState(0);
  const [Retencion_PJ_NPF_Loc, setRetencion_PJ_NPF_Loc] = useState(0);
  const [Retencion_PJ_NPF_NPF, setRetencion_PJ_NPF_NPF] = useState(0);
  const [Retencion_PJ_NPF_PF, setRetencion_PJ_NPF_PF] = useState(0);
  const [rowsSelectAccionistas, setRowsSelectAccionistas] = useState([]);
  const [userName, setUserName] = useState("");
  const [openCrearDividendo, setOpenCrearDividendo] = useState(false);
  const [selectAccionistas, setSelectAccionistas] = useState(false);
  const [rows, setRows] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState({});
  const [openSnack, setOpenSnack] = useState(false);
  const [circular, setCircular] = useState(false);
  const [refrescar, setRefrescar] = useState(false);
  var [periodos, setPeriodos] = useState([]);
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
      field: 'div_repartido',
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
      field: 'ddiv_dividendo',
      headerName: 'Saldo Div',
      type: 'number',
      width: 120,
    },
    {
      field: "Detalle",
      renderCell: (cellValues) => {

        //setPeriodoSeleccionado(cellValues.row);

        return <Fragment>


          <IconButton onClick={() => {
            /*if (cellValues.row.estado == "Nuevo") {
              fetchAccionistas(cellValues.row);
              setPeriodoSeleccionado(cellValues.row);
            } else {
              fetchAccionistasDividendos(cellValues.row);
              setPeriodoSeleccionado(cellValues.row);
              console.log(cellValues.row)
            }*/
            fetchAccionistas(cellValues.row);
            setPeriodoSeleccionado(cellValues.row);
          }
          } color='primary'><PageviewIcon /></IconButton>
        </Fragment>
      }
    },
    /*{
      field: 'estado',
      headerName: 'Estado',
      width: 110,
      renderCell: (cellValues) => {
        return <Chip size="small" variant="outlined" label={cellValues.row.estado} color={cellValues.row.estado == 'Nuevo' ? 'primary' : 'secondary'} />
      }
    }*/
  ];

  const columnsAccionistasCorte = [
    {
      field: 'identificacion',
      headerName: 'Identificación',
      width: 100,
    },
    {
      field: 'nombre',
      headerName: 'Nombre',
      width: 240,
    },
    {
      field: 'tipoPersona',
      headerName: 'Persona',
      width: 60,
    },
    {
      field: 'direccionPais',
      headerName: 'Residencia',
      width: 100,
    },
    {
      field: 'direccionPaisBeneficiario1',
      headerName: 'Beneficiario',
      width: 100,
    },
    {
      field: 'cantidadAcciones',
      headerName: 'Acciones',
      type: 'number',
      width: 100,
    },
    {
      field: 'participacion',
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
      field: 'baseImponible',
      headerName: 'Base Imponible',
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
      headerName: 'Pagar',
      type: 'number',
      width: 110,
    },

  ];

  const columnsAccionistasCorteDividendos = [
    {
      field: 'identificacion',
      headerName: 'Identificación',
      width: 100,
    },
    {
      field: 'nombre',
      headerName: 'Nombre',
      width: 240,
    },
    {
      field: 'tipoPersona',
      headerName: 'Persona',
      width: 60,
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 100,
      renderCell: (cellValues) => {
        return <Chip size="small" variant="outlined" label={cellValues.row.estado} color={cellValues.row.estado == 'Activo' ? 'primary' : 'secondary'} />
      }
    },
    {
      field: 'direccionPais',
      headerName: 'Residencia',
      width: 100,
    },
    {
      field: 'direccionPaisBeneficiario1',
      headerName: 'Beneficiario',
      width: 100,
    },
    {
      field: 'cantidadAcciones',
      headerName: 'Acciones',
      width: 100,
      align: 'right',
    },
    {
      field: 'participacion',
      headerName: 'Participación',
      width: 110,
    },
    {
      field: 'dividendo',
      headerName: 'Dividendo',
      width: 110,
      align: 'right',
    },
    {
      field: 'baseImponible',
      headerName: 'Base Imponible',
      width: 110,
      align: 'right',
    },
    {
      field: 'retencion',
      headerName: 'Retención',
      width: 110,
      align: 'right',
    },
    {
      field: 'dividendoRecibido',
      headerName: 'Pagar',
      width: 110,
      align: 'right',
    },
    {
      field: 'solicitado',
      headerName: '50%',
      width: 50,
      renderCell: (cellValues) => {
        return <Chip size="small" variant="outlined" label={cellValues.row.solicitado} color={cellValues.row.solicitado == true ? 'primary' : 'secondary'} />
      }
    },
    {
      field: "50%",
      width: 50,
      renderCell: (cellValues) => {
        return <Fragment>
          <IconButton onClick={() => {
            console.log(cellValues.row);
            fetchAccionista50(cellValues.row);
            //setPeriodoSeleccionado(cellValues.row);
          }
          } color='primary'><EditIcon /></IconButton>
        </Fragment>
      }
    },
  ];

  const columnsSelectAccionistas = [
    {
      field: 'identificacion',
      headerName: 'Identificación',
      width: 150,
    },
    {
      field: 'nombre',
      headerName: 'Nombre',
      width: 200,
    },
    {
      field: 'tipoPersona',
      headerName: 'Persona',
    },
    {
      field: 'direccionPais',
      headerName: 'Residencia',
    },
    {
      field: 'direccionPaisBeneficiario1',
      headerName: 'Beneficiario',
    },
    {
      field: 'cantidadAcciones',
      headerName: 'Acciones',
      width: 100,
      align: 'right',
    },
    {
      field: 'participacion',
      headerName: 'Participación',
      width: 110,
    },
    {
      field: '50%',
      headerName: 'X',
      width: 50,
      renderCell: (cellValues) => {
        return <Fragment>
          <Checkbox
          onChange={() => {
            var aux;
            aux = listaAccionistasDividendo.findIndex(x => x.id === cellValues.row.id);
            if(aux != -1) listaAccionistasDividendo.push(cellValues.row);
            console.log("aux",aux);
            console.log("checkbox",listaAccionistasDividendo);
          }
          }
          />
        </Fragment>
      }
    },
  ];

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
  
  function getParticipacion(params) {
    return `${params.getValue(params.id, 'cantidadAcciones') * 100 / cantidadEmitido || ''} `;
  }

  function getDividendo(params) {
    return `${(params.getValue(params.id, 'cantidadAcciones') * periodoSeleccionado.dividendoRepartir / cantidadEmitido).toFixed(2) || ''} `;
  }

  function getBaseImponible(params) {
    return `${(params.getValue(params.id, 'cantidadAcciones') * periodoSeleccionado.dividendoRepartir * (baseImponible / 100.00) / cantidadEmitido).toFixed(2) || ''} `;
  }

  function getRetencion(params) {
    let base = (params.getValue(params.id, 'cantidadAcciones') * periodoSeleccionado.dividendoRepartir * (baseImponible / 100.00) / cantidadEmitido).toFixed(2)
    let num = 0;
    if (base > FB1 && base < FE1) { num = RFB1 + (base - FB1) * RFE1 / 100.00; }
    if (base > FB2 && base < FE2) { num = RFB2 + (base - FB2) * RFE2 / 100.00; }
    if (base > FB3 && base < FE3) { num = RFB3 + (base - FB3) * RFE3 / 100.00; }
    if (base > FB4 && base < FE4) { num = RFB4 + (base - FB4) * RFE4 / 100.00; }
    if (base > FB5 && base < FE5) { num = RFB5 + (base - FB5) * RFE5 / 100.00; }
    if (base > FB6 && base < FE6) { num = RFB6 + (base - FB6) * RFE6 / 100.00; }
    return `${num.toFixed(2) || ''} `;
  }

  function getNetoRecibir(params) {
    let dividendo = (params.getValue(params.id, 'cantidadAcciones') * periodoSeleccionado.dividendoRepartir / cantidadEmitido).toFixed(2);
    let base = (params.getValue(params.id, 'cantidadAcciones') * periodoSeleccionado.dividendoRepartir * (baseImponible / 100.00) / cantidadEmitido).toFixed(2);
    let num = 0;
    if (base > FB1 && base < FE1) { num = dividendo - (RFB1 + (base - FB1) * RFE1 / 100.00); }
    if (base > FB2 && base < FE2) { num = dividendo - (RFB2 + (base - FB2) * RFE2 / 100.00); }
    if (base > FB3 && base < FE3) { num = dividendo - (RFB3 + (base - FB3) * RFE3 / 100.00); }
    if (base > FB4 && base < FE4) { num = dividendo - (RFB4 + (base - FB4) * RFE4 / 100.00); }
    if (base > FB5 && base < FE5) { num = dividendo - (RFB5 + (base - FB5) * RFE5 / 100.00); }
    if (base > FB6 && base < FE6) { num = dividendo - (RFB6 + (base - FB6) * RFE6 / 100.00); }
    return `${num.toFixed(2) || ''} `;
  }

  function getParticipacion1(cantidadAcciones) {
    return ((cantidadAcciones / cantidadEmitido) * 100.00).toFixed(16);
  }

  function getRetencion1(base, persona, residente, beneficiario) {

    //,e.tipoPersona, e.direccionPais, e.direccionPais

    let retencion = 4;
    let residenciaFiscal = "NPF";
    let residenciaFiscalBenef = "NPF";

    if (residente.trim() == "Ecuador") residenciaFiscal = "Local"
    //if(residente == null) residenciaFiscal = "Local"
    if (residente.trim() == "Panama") residenciaFiscal = "PF"

    if (beneficiario.trim() == "Ecuador") residenciaFiscalBenef = "Local"
    //if(beneficiario == null) residenciaFiscalBenef = "Local"
    if (beneficiario.trim() == "Panama") residenciaFiscalBenef = "PF"

    if (persona == "PN" && residenciaFiscal == "Local") retencion = Retencion_PN_Loc;
    if (persona == "PN" && residenciaFiscal == "NPF") retencion = Retencion_PN_NPF;
    if (persona == "PN" && residenciaFiscal == "PF") retencion = Retencion_PN_PF;
    if (persona == "PJ" && residenciaFiscal == "Local" && residenciaFiscalBenef == "Local") retencion = Retencion_PJ_Loc_Loc;
    if (persona == "PJ" && residenciaFiscal == "Local" && residenciaFiscalBenef == "NPF") retencion = Retencion_PJ_Loc_NPF;
    if (persona == "PJ" && residenciaFiscal == "Local" && residenciaFiscalBenef == "PF") retencion = Retencion_PJ_Loc_PF;
    if (persona == "PJ" && residenciaFiscal == "PF" && residenciaFiscalBenef == "Local") retencion = Retencion_PJ_PF_Loc;
    if (persona == "PJ" && residenciaFiscal == "PF" && residenciaFiscalBenef == "NPF") retencion = Retencion_PJ_PF_NPF;
    if (persona == "PJ" && residenciaFiscal == "PF" && residenciaFiscalBenef == "PF") retencion = Retencion_PJ_PF_PF;
    if (persona == "PJ" && residenciaFiscal == "NPF" && residenciaFiscalBenef == "Local") retencion = Retencion_PJ_NPF_Loc;
    if (persona == "PJ" && residenciaFiscal == "NPF" && residenciaFiscalBenef == "NPF") retencion = Retencion_PJ_NPF_NPF;
    if (persona == "PJ" && residenciaFiscal == "NPF" && residenciaFiscalBenef == "PF") retencion = Retencion_PJ_NPF_PF;

    //let num = base*retencionNoResidente/100.00;
    let num = 0;

    if (retencion == 1) num = base * retencionMinima / 100.00;
    if (retencion == 2) num = base * retencionMaxima / 100.00;
    if (retencion == 4) num = 0;

    if (retencion == 3) {
      if (base > FB1 && base < FE1) { num = RFB1 + (base - FB1) * RFE1 / 100.00; }
      if (base > FB2 && base < FE2) { num = RFB2 + (base - FB2) * RFE2 / 100.00; }
      if (base > FB3 && base < FE3) { num = RFB3 + (base - FB3) * RFE3 / 100.00; }
      if (base > FB4 && base < FE4) { num = RFB4 + (base - FB4) * RFE4 / 100.00; }
      if (base > FB5 && base < FE5) { num = RFB5 + (base - FB5) * RFE5 / 100.00; }
      if (base > FB6 && base < FE6) { num = RFB6 + (base - FB6) * RFE6 / 100.00; }
    }
    return num.toFixed(2);
  }

  async function getTitulosTotales(listaIdAccionistas) {
    var aux;
    let filter = {
      or: []
    };
    listaIdAccionistas.forEach(element => {
      aux = {accionistaID: { eq: element.id }};
      filter.or.push(aux);
    });
    console.log("Filter: ",filter);
    const apiData3 = await API.graphql({ query: listTitulos, variables: { filter: filter, ProjectionExpression: "acciones", select:"SPECIFIC_ATTRIBUTES", limit:1000} });
    let sum = 0;
    apiData3.data.listTitulos.items.forEach((el) => sum += el.acciones);
    return sum;
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
    setOpenCrearDividendo(false)
  }
  const handleCloseSelectAccionistas = () =>setSelectAccionistas(false);
  const handleOpenSelectAccionistas = async () => {
    const filter = {
      estado: {
        eq: "Activo"
      },
    }
    const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, projectionExpression: "id, identificacion, nombre, tipoPersona, direccionPais, direccionPaisBeneficiario1, cantidadAcciones, participacion", select:"SPECIFIC_ATTRIBUTES", limit: 1000} });
    var aux = apiData.data.listAccionistas.items;
    setRowsSelectAccionistas(aux);
    setSelectAccionistas(true);
  }
  const handleOpenCrearDividendo = () => setOpenCrearDividendo(true);

  const handleConfirmarDividendo = async () => {

    //console.log("MATRIZ", accionistasCorte);
    for (const accionistaCorte of accionistasCorte) {

      //console.log(accionistaCorte.nombre, accionistaCorte.dividendo, accionistaCorte.baseImponible);
      /*
      const dividendoAccionista = {
        idAccionista: accionistaCorte.id,
        tipoIdentificacion: accionistaCorte.tipoIdentificacion,
        identificacion: accionistaCorte.identificacion,
        nombre: accionistaCorte.nombre,
        direccionPais: accionistaCorte.direccionPais,
        paisNacionalidad: accionistaCorte.paisNacionalidad,
        cantidadAcciones: accionistaCorte.cantidadAcciones,
        participacion: accionistaCorte.participacion,
        tipoAcciones: accionistaCorte.tipoAcciones,
        estado: accionistaCorte.estado,
        tipoPersona: accionistaCorte.tipoPersona,
        decevale: accionistaCorte.decevale,
        idDividendo: accionistaCorte.idDividendo,
        periodo: accionistaCorte.periodo,
        dividendo: accionistaCorte.dividendo,
        baseImponible: accionistaCorte.baseImponible,
        retencion: accionistaCorte.retencion,
        dividendoRecibido: accionistaCorte.dividendoRecibido,
        estadoDividendo: accionistaCorte.estadoDividendo,
        documento: accionistaCorte.documento,
        solicitado: accionistaCorte.solicitado,
        fechaSolicitud: accionistaCorte.fechaSolicitud,
        HoraSolicitud: accionistaCorte.HoraSolicitud,
        fechaPago: accionistaCorte.fechaPago,
        direccionPaisBeneficiario1: accionistaCorte.direccionPaisBeneficiario1

      };

      console.log('input', dividendoAccionista)
      //const apiDataDividendoAccionista = await API.graphql({ query: createDividendosAccionista, variables: { input: dividendoAccionista } });  
      const divAccionsitaID = await API.graphql(graphqlOperation(createDividendosAccionista, { input: dividendoAccionista }))
      const operID = await API.graphql({ query: updateDividendos, variables: { input: { id: periodoSeleccionado.id, estado: "Confirmado" } } });
      */
      handleClose();
    }

  }

  async function fetchParametros() {
    const apiData = await API.graphql({ query: getParametro, variables: { id: '1' } });
    const parametrosFromAPI = apiData.data.getParametro;
    setCantidadEmitido(parametrosFromAPI.cantidadEmitida);
    setValorNominal(parametrosFromAPI.valorNominal);
    setBaseImponible(parametrosFromAPI.baseImponible);
    setRetencionNoResidente(parametrosFromAPI.noResidente);
    setFB1(parametrosFromAPI.IGdesde1);
    setFB2(parametrosFromAPI.IGdesde2);
    setFB3(parametrosFromAPI.IGdesde3);
    setFB4(parametrosFromAPI.IGdesde4);
    setFB5(parametrosFromAPI.IGdesde5);
    setFB6(parametrosFromAPI.IGdesde6);
    setFE1(parametrosFromAPI.IGhasta1);
    setFE2(parametrosFromAPI.IGhasta2);
    setFE3(parametrosFromAPI.IGhasta3);
    setFE4(parametrosFromAPI.IGhasta4);
    setFE5(parametrosFromAPI.IGhasta5);
    setFE6(parametrosFromAPI.IGhasta6);
    setRFB1(parametrosFromAPI.FBretencion1);
    setRFB2(parametrosFromAPI.FBretencion2);
    setRFB3(parametrosFromAPI.FBretencion3);
    setRFB4(parametrosFromAPI.FBretencion4);
    setRFB5(parametrosFromAPI.FBretencion5);
    setRFB6(parametrosFromAPI.FBretencion6);
    setRFE1(parametrosFromAPI.FEretencion1);
    setRFE2(parametrosFromAPI.FEretencion2);
    setRFE3(parametrosFromAPI.FEretencion3);
    setRFE4(parametrosFromAPI.FEretencion4);
    setRFE5(parametrosFromAPI.FEretencion5);
    setRFE6(parametrosFromAPI.FEretencion6);
    setRetencionMinima(parametrosFromAPI.Retencion_Minima);
    setRetencionMaxima(parametrosFromAPI.Retencion_Maxima);
    setRetencion_PN_Loc(parametrosFromAPI.Retencion_PN_Loc);
    setRetencion_PN_NPF(parametrosFromAPI.Retencion_PN_NPF);
    setRetencion_PN_PF(parametrosFromAPI.Retencion_PN_PF);
    setRetencion_PJ_Loc_Loc(parametrosFromAPI.Retencion_PJ_Loc_Loc);
    setRetencion_PJ_Loc_NPF(parametrosFromAPI.Retencion_PJ_Loc_NPF);
    setRetencion_PJ_Loc_PF(parametrosFromAPI.Retencion_PJ_Loc_PF);
    setRetencion_PJ_PF_Loc(parametrosFromAPI.Retencion_PJ_PF_Loc);
    setRetencion_PJ_PF_NPF(parametrosFromAPI.Retencion_PJ_PF_NPF);
    setRetencion_PJ_PF_PF(parametrosFromAPI.Retencion_PJ_PF_PF);
    setRetencion_PJ_NPF_Loc(parametrosFromAPI.Retencion_PJ_NPF_Loc);
    setRetencion_PJ_NPF_NPF(parametrosFromAPI.Retencion_PJ_NPF_NPF);
    setRetencion_PJ_NPF_PF(parametrosFromAPI.Retencion_PJ_NPF_PF);

  }

  async function fetchDividendos() {
    const apiData = await API.graphql({ query: listDividendoNuevos});
    const apiData2 = await API.graphql({ query: listDetalleDividendos});
    var aux,repetido,auxperiodos=[];
    for (let index = 2015; index <= year; index++) {
      auxperiodos.push({id:index,periodo:index,tipo: "Nuevo"});
    }
    setPeriodos(auxperiodos);
    console.log("auxperiodos",auxperiodos);
    console.log("periodos",periodos);
    if (apiData.data.listDividendoNuevos.items.length > 0 && apiData2.data.listDetalleDividendos.items.length > 0) {
      const dividendosRelacionados = apiData2.data.listDetalleDividendos.items.map(function (e) {
        aux = apiData.data.listDividendoNuevos.items.find(({ id }) => id === e.dividendoID);
        console.log("aux1",aux);
        return {
          id: e.id,
          ddiv_usuario: e.ddiv_usuario,
          ddiv_secuencial: e.ddiv_secuencial,
          ddiv_fecha_junta: e.ddiv_fecha_junta,
          ddiv_fecha_pago: e.ddiv_fecha_pago,
          ddiv_titulos: e.ddiv_titulos,
          ddiv_dividendo: e.ddiv_dividendo,
          ddiv_porcentaje: e.ddiv_porcentaje,
          dividendoID: e.dividendoID,
          div_periodo: aux.div_periodo,
          div_concepto: aux.div_concepto,
          div_dividendo: aux.div_dividendo,
          div_repartido: aux.div_repartido,
        };
      });
      apiData.data.listDividendoNuevos.items.map(function (e) {
        repetido = periodos.findIndex(x => x.periodo === e.div_periodo);
        console.log("repetido",repetido);
        console.log("e.div_dividendo",e.div_dividendo);
        console.log("e.div_repartido",e.div_repartido);
        if (repetido != -1 && e.div_dividendo != e.div_repartido) {
          periodos[repetido].tipo = "Parcial";
          console.log("periodos[repetido].tipo",periodos[repetido].tipo);
          var aux = dividendosRelacionados.find(({ div_periodo }) => div_periodo === periodos[repetido].periodo);
          console.log("dividendosRelacionados",aux);
          periodos[repetido].id = aux.dividendoID;
        }
        if (repetido != -1 && e.div_dividendo == e.div_repartido) periodos.splice(repetido,1);
      })
      setRows(dividendosRelacionados);
    }
  }

  async function fetchAccionistas(row) {
    console.log("listaAccionistasDividendo",listaAccionistasDividendo);
    var filter,aux;
    if (listaAccionistasDividendo.length > 0) {
      filter = {
        estado: {
          eq: "Activo"
        },
        or: []
      }
      listaAccionistasDividendo.forEach(element => {
        aux = {accionistaID: { eq: element.id }};
        filter.or.push(aux);
      });
    } else{
       filter = {
        estado: {
          eq: "Activo"
        }
      }
    }
    const apiData3 = await API.graphql({ query: listAccionistas, variables: { filter: filter , limit: 1000} });
    let accionistasFromAPI3 = apiData3.data.listAccionistas.items;
    let numero2 = 1;
    let nombre_aux2 = '';
    let cantidadTotal = 0;
    accionistasFromAPI3.forEach(function (obj) {
      nombre_aux2 = obj.tipoPersona == 'PN' ? obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno + " " + obj.pn_primerNombre + " " + obj.pn_segundoNombre : obj.nombre;
      obj.nombre2 = nombre_aux2.toUpperCase();
      cantidadTotal = cantidadTotal + obj.cantidadAcciones;
      obj.secuencial = numero2++;
    });
    setCantidadEmitido(cantidadTotal);
    const accionistasCalculo = accionistasFromAPI3.map(function (e) {
      return {
        id: e.id,
        idAccionista: e.idAccionista,
        tipoIdentificacion: e.tipoIdentificacion,
        identificacion: e.identificacion,
        nombre: e.nombre2,
        direccionPais: e.direccionPais,
        paisNacionalidad: e.paisNacionalidad,
        cantidadAcciones: e.cantidadAcciones.toFixed(0),
        participacion: ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16),
        tipoAcciones: e.tipoAcciones,
        estado: e.estado,
        tipoPersona: e.tipoPersona,
        decevale: e.decevale,
        idDividendo: row.id,
        periodo: row.periodo,
        dividendo: (row.div_repartido * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2),
        baseImponible: (baseImponible * (row.div_repartido * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2) / 100.00).toFixed(2),
        retencion: getRetencion1((baseImponible * (row.div_repartido * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2) / 100.00).toFixed(2), e.tipoPersona, e.direccionPais, e.direccionPaisBeneficiario1 == null ? 'Ecuador' : e.direccionPaisBeneficiario1),
        dividendoRecibido: ((row.div_repartido * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2) - getRetencion1((baseImponible * (row.div_repartido * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2) / 100.00).toFixed(2), e.tipoPersona, e.direccionPais, e.direccionPaisBeneficiario1 == null ? 'Ecuador' : e.direccionPaisBeneficiario1)).toFixed(2),
        estadoDividendo: 'Confirmado',
        documento: '',
        solicitado: false,
        fechaSolicitud: '',
        HoraSolicitud: '',
        fechaPago: '',
        direccionPaisBeneficiario1: e.direccionPaisBeneficiario1,
        saldoDividendoPeriodo: (row.div_repartido * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2),
      };
    })
    setAccionistasCorte(accionistasCalculo);
    setOpenAccionistas(true)
  }

  async function fetchAccionistasDividendos(row) {
    const filter = {
      idDividendo: {
        eq: row.id
      },
    }
    const apiData3 = await API.graphql({ query: listDividendosAccionistas, variables: { filter: filter, limit: 20000 } });
    let accionistasFromAPI3 = apiData3.data.listDividendosAccionistas.items;
    let nexttoken4 = null
    if (apiData3.data.listDividendosAccionistas.nextToken != null) {
      const apiData4 = await API.graphql({ query: listDividendosAccionistas, variables: { filter: filter, limit: 20000, nextToken: apiData3.data.listDividendosAccionistas.nextToken } });
      const accionistasFromAPI4 = apiData4.data.listDividendosAccionistas.items;
      accionistasFromAPI3 = accionistasFromAPI3.concat(accionistasFromAPI4);
      if (apiData4.data.listDividendosAccionistas.nextToken != null) nexttoken4 = apiData4.data.listDividendosAccionistas.nextToken
    }
    if (nexttoken4 != null) {
      const apiData5 = await API.graphql({ query: listDividendosAccionistas, variables: { filter: filter, limit: 20000, nextToken: nexttoken4 } });
      const accionistasFromAPI5 = apiData5.data.listDividendosAccionistas.items;
      accionistasFromAPI3 = accionistasFromAPI3.concat(accionistasFromAPI5);
    }
    setAccionistasCorteDividendos(accionistasFromAPI3);
    setOpenAccionistasDividendos(true)
  }

  async function fetchAccionista50(row) {
    const div50 = ((periodoSeleccionado.dividendo * row.participacion / 100.00) / 2.00).toFixed(2);
    const operID = await API.graphql({ query: updateDividendosAccionista, variables: { input: { id: row.id, solicitado: true, dividendo: div50, dividendoRecibido: div50 } } });
    fetchAccionistasDividendos(periodoSeleccionado);
    //setAccionistasCorteDividendos(accionistasFromAPI3);
    //setOpenAccionistasDividendos(true)
  }

  const handlePeriodoChange = (event) => {
    setFormData({ ...formData, 'periodo': event.target.value });
    var aux = periodos.findIndex(x => x.periodo === event.target.value);
    if (aux != -1 && periodos[aux].tipo == "Parcial") {
      var periodo_aux = rows.findIndex(x => x.div_periodo === periodos[aux].periodo);
      aux = periodo_aux.div_dividendo-periodo_aux.div_repartido;
      setFormData({ ...formData, 'concepto': periodo_aux.div_concepto });
      setFormData({ ...formData, 'dividendo': periodo_aux.div_dividendo });
      setFormData({ ...formData, 'saldoDividendo': periodo_aux.div_repartido });
      console.log("formData periodo change",formData);
    }
  };

  const handleConceptoChange = (event) => {
    setFormData({ ...formData, 'concepto': event.target.value })
  };

  const handleDividendoChange = (event) => {
    setFormData({ ...formData, 'dividendo': event.target.value, 'dividendoRepartir': (event.target.value * formData.porcentajeRepartir / 100.00).toFixed(2), 'saldoDividendo': (event.target.value - (event.target.value * formData.porcentajeRepartir / 100.00).toFixed(2)).toFixed(2), 'saldoPorcentajeDividendo': 100.00 - formData.porcentajeRepartir })
  };

  const handlePorcentajeRepartirChange = (event) => {
    setFormData({ ...formData, 'porcentajeRepartir': event.target.value, 'dividendoRepartir': (event.target.value * formData.dividendo / 100.00).toFixed(2), 'saldoDividendo': (formData.dividendo - (event.target.value * formData.dividendo / 100.00).toFixed(2)).toFixed(2), 'saldoPorcentajeDividendo': 100.00 - event.target.value })
  };

  const handleChangeFechaCorte = (event) => {
    setFormData({ ...formData, 'fechaCorte': event.target.value.split(" ")[0].split("-").reverse().join("-") })
  };
  const handleChangeFechaPago = (event) => {
    setFormData({ ...formData, 'fechaPago': event.target.value.split(" ")[0].split("-").reverse().join("-") })
  };

  const addDividendo = async () => {
    try {
      if (!formData.periodo || !formData.dividendo || !formData.porcentajeRepartir || !formData.fechaCorte || 
        !formData.fechaPago) return
      setCircular(true);
      var dividendoID;
      const filter = {
        estado: {
          eq: "Activo"
        },
      }
      const dividendo = { 
        div_periodo: formData.periodo,
        div_concepto: formData.concepto,
        div_dividendo: formData.dividendo,
        div_repartido: formData.dividendoRepartir
      }
      var aux = periodos.findIndex(x => x.periodo === formData.periodo);
      if (aux != -1 && periodos[aux].tipo != "Nuevo") {
        dividendoID = periodos[aux].id;
        aux = periodos.filter((periodo) => periodo.periodo == formData.periodo).length + 1;
      } else {
        var response = await API.graphql(graphqlOperation(createDividendoNuevo, { input: dividendo }));
        dividendoID = response.data.createDividendoNuevo.id
        aux = 1;
      }
      console.log("dividendoID",dividendoID);
      console.log("listaAccionistasDividendo",listaAccionistasDividendo);
      var aux_titulos;
      if (listaAccionistasDividendo.length > 0) {
        aux_titulos = await getTitulosTotales(listaAccionistasDividendo);
      }else{
        const apiData3 = await API.graphql({ query: listAccionistas, variables: { filter: filter, ProjectionExpression: "id", select:"SPECIFIC_ATTRIBUTES"}, limit: 1000 });
        const aux_listaIdsAccionistas = apiData3.data.listAccionistas.items;
        console.log("aux_listaIdsAccionistas: ",aux_listaIdsAccionistas.length);
        aux_titulos = await getTitulosTotales(aux_listaIdsAccionistas);
      }
      console.log("aux titulos:",aux_titulos);
      const detalleDividendo={
        ddiv_usuario: userName,
        ddiv_secuencial: aux,
        ddiv_fecha_junta: formData.fechaPago,
        ddiv_fecha_pago: formData.fechaCorte,
        ddiv_titulos: aux_titulos,
        ddiv_dividendo: formData.dividendoRepartir,
        ddiv_porcentaje: formData.porcentajeRepartir,
        dividendoID: dividendoID
      }
      API.graphql(graphqlOperation(createDetalleDividendo, { input: detalleDividendo }))
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

  function LinearProgressWithLabel(props) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>
      </Box>
    );
  }

  LinearProgressWithLabel.propTypes = {
    value: PropTypes.number.isRequired,
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


        <Dialog open={openAccionistas} onClose={handleClose} aria-labelledby="form-dialog-title" fullScreen  >
          <DialogTitle id="form-dialog-title">
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
              {periodoSeleccionado.div_concepto} : {periodoSeleccionado.div_periodo} : {periodoSeleccionado.secuencial}
              <Typography variant="body2" >Total dividendo del periodo : {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(periodoSeleccionado.div_dividendo)}</Typography>
              <Typography variant="body2" >Total a repartir : {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(periodoSeleccionado.div_repartido)}</Typography>
              <Typography variant="body2" >Porcentaje a repartir : {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(periodoSeleccionado.div_porcentaje)} %</Typography>
            </div>
          </DialogTitle>
          <DialogContent style={{ height: '500px' }}>
            <DataGrid
              style={{ backgroundColor: 'white' }}
              density="compact"
              autoHeight='true'
              maxWidth='true'
              autoPageSize='true'
              disableColumnMenu
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

        <Dialog open={openAccionistasDividendos} onClose={handleCloseAccionistasDividendos} aria-labelledby="form-dialog-title" fullScreen>
          <DialogTitle id="form-dialog-title">
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
              Ejercicio {periodoSeleccionado.periodo}
              <Typography variant="body2" >Total dividendo del periodo : {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(periodoSeleccionado.dividendo)}</Typography>
              <Typography variant="body2" >Total a repartir : {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(periodoSeleccionado.dividendoRepartir)}</Typography>
              <Typography variant="body2" >Porcentaje a repartir : {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(periodoSeleccionado.porcentajeRepartir)} %</Typography>
              <Typography variant="body2" >Saldo del periodo : {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(periodoSeleccionado.saldoDividendo)}</Typography>
            </div>
          </DialogTitle>
          <DialogContent style={{ height: '500px' }}>
            <DataGrid
              style={{ backgroundColor: 'white' }}
              density="compact"
              autoHeight='true'
              maxWidth='true'
              autoPageSize='true'
              disableColumnMenu
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

        <Dialog open={openCrearDividendo} onClose={handleCloseCrearDividendo} aria-labelledby="form-dialog-title" maxWidth='lg'>
          <DialogTitle id="form-dialog-title">Crear nuevo dividendo</DialogTitle>
          <DialogContent style={{ height: '450px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', width: '90%', }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-evenly', width: '100%', }}>
                  <FormControl style={{ width: '100%' }}>
                    <InputLabel id="periodo-select-label">Periodo</InputLabel>
                    <Select
                      labelId="periodo-select-label"
                      id="select-periodo"
                      value={formData.periodo}
                      onChange={handlePeriodoChange}
                    >
                      {periodos.map((e) => {
                        return <MenuItem value={e.periodo}>{e.periodo}</MenuItem>;
                      })}
                    </Select>
                  </FormControl>
                </div>
                <FormControl style={{ width: '100%' }}>
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
                  label="Dividendo"
                  value={formData.dividendo}
                  type='number'
                  onChange={handleDividendoChange}
                  fullWidth
                  inputProps={inputProps}
                />

                <TextField
                  id="outlined-required"
                  label="% a repartir"
                  value={formData.porcentajeRepartir}
                  type='number'
                  onChange={handlePorcentajeRepartirChange}
                  fullWidth
                  inputProps={inputProps}
                />

                <TextField
                  id="outlined-required"
                  label="Dividendo a Repartir"
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
                    defaultValue={Date.now()}
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
                    defaultValue={Date.now()}
                    variant="standard"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={formData.fechaPago.split(" ")[0].split("-").reverse().join("-")}
                    onChange={handleChangeFechaPago}
                  />
                </FormControl>
                Saldo del periodo {formData.saldoDividendo}
              </div>

            </div>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              size='small'
              onClick={handleOpenSelectAccionistas}
              style={{ textTransform: 'none' }}
            >
              Seleccionar Accionistas
            </Button>
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

        <Dialog open={selectAccionistas} onClose={handleCloseSelectAccionistas} aria-labelledby="form-dialog-title" fullScreen>
          <DialogTitle id="form-dialog-title">Seleccionar accionistas</DialogTitle>
          <DialogContent>
            <DataGrid
              style={{ backgroundColor: 'white' }}
              density="compact"
              autoHeight='true'
              maxWidth='true'
              autoPageSize='true'
              disableColumnMenu
              rows={rowsSelectAccionistas}
              columns={columnsSelectAccionistas}
              pageSize={25}
              rowsPerPageOptions={[25]}
            />
          </DialogContent>
          <DialogActions>
            <Button
                variant="contained"
                color="primary"
                className={classes.button}
                size='small'
                onClick={handleCloseSelectAccionistas}
                style={{ textTransform: 'none' }}
              >
                Confirmar Lista
              </Button>
              <Button onClick={handleCloseSelectAccionistas} color="secondary" style={{ textTransform: 'none' }}>
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

      </Grid>
    </main>
  );
}