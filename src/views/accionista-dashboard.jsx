import React, { useState, useEffect } from 'react';
import { API, Storage, Auth, graphqlOperation } from 'aws-amplify';

import { makeStyles } from '@material-ui/core/styles';
import { createTheme } from '@material-ui/core/styles';
import { listAsambleas, listAccionistas, listAccionistasxJuntas, getParametro, listSolicitudes } from '../graphql/queries';
import { createAccionistasxJunta, updateAsamblea, updateAccionistasxJunta, createSolicitudes } from '../graphql/mutations';

import { DataGrid } from '@mui/x-data-grid';

import jsPDF from "jspdf";
import "jspdf-autotable";
import QRcode from 'qrcode.react'

import marco from '../images/Recurso 1.png'
import fondoUnacem from '../images/Recurso 2.png'
import logoSolo from '../images/Recurso 3.png'
import logoCompleto from '../images/Recurso 4.png'

import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import PrintIcon from '@material-ui/icons/Print';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';

import Grid from '@material-ui/core/Grid';

import {
  Card, CardContent, Typography, Button,
  Dialog, DialogActions, DialogContent, DialogTitle
} from '@material-ui/core';

import { uuid } from 'uuidv4';
import { styled } from '@material-ui//styles';
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
    textField: {
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
      margin: theme.spacing(1, 0.5, 1.5),
      '& .MuiSvgIcon-root': {
        marginRight: theme.spacing(0.5),
      },
      '& .MuiInput-underline:before': {
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
    },
    button: {
      borderRadius: 20,
    },
    myAlert: {
      backgroundColor: "#808080"
    }
  }),
  { defaultTheme },
);

function escapeRegExp(value) {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}


QuickSearchToolbar.propTypes = {
  clearSearch: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};


function QuickSearchToolbar(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>

      <TextField
        variant="standard"
        value={props.value}
        onChange={props.onChange}
        placeholder="Buscar accionista…"
        className={classes.textField}
        InputProps={{
          startAdornment: <SearchIcon fontSize="small" />,
          endAdornment: (
            <IconButton
              title="Clear"
              aria-label="Clear"
              size="small"
              style={{ visibility: props.value ? 'visible' : 'hidden' }}
              onClick={props.clearSearch}
            >

              <ClearIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />

    </div>

  );
}



export default function Accionistadashboard() {

  const [openSnack, setOpenSnack] = useState(false);
  const [contador, setContador] = useState(1);

  const [rows, setRows] = useState([]);
  const [openRegistroAsamblea, setOpenRegistroAsamblea] = useState(false);
  const [asambleaSeleccionada, setAsambleaSeleccionada] = useState({});
  const [openTransferencia, setOpenTransferencia] = useState(false);

  const handleCloseRegistroAsamblea = () => setOpenRegistroAsamblea(false);
  const handleOpenRegistroAsamblea = () => setOpenRegistroAsamblea(true);

  const handleOpenTransferencia = () => setOpenTransferencia(true);
  const handleCloseTransferencia = () => setOpenTransferencia(false);

  const [accionista, setAccionista] = useState([])

  const [refrescar, setRefrescar] = useState(false);

  const [hash, setHash] = useState('');

  const [solicitudes, setSolicitudes] = useState([])


  const columns = [
    {
      field: 'tipo',
      headerName: 'Asamblea',
      width: 120,
    },
    {
      field: 'fecha',
      headerName: 'Fecha',
      width: 100,
    },
    {
      field: 'hora',
      headerName: 'Hora',
      width: 80,
    },
    {
      field: 'lugar',
      headerName: 'Lugar',
      width: 120,
    },
    {
      field: 'link',
      headerName: 'Enlace',
      width: 220,
    },
    {
      field: "Registrarse",
      width: 120,
      renderCell: (cellValues) => {
        return <IconButton onClick={() => {
          //REgistrase
          //fetchAccionistas(cellValues.row);
          handleOpenRegistroAsamblea();
          setAsambleaSeleccionada(cellValues.row);
        }
        } color='primary'><HowToRegIcon /></IconButton>
      }
    },

    {
      field: 'Estado',
      headerName: 'Registrado',
      width: 120,
    },
    {
      field: 'NombreRep',
      headerName: 'Representante',
      width: 120,
    },

  ];

  const [accionistas, setAccionistas] = useState([]);
  const [rowsAccionistas, setRowsAccionistas] = useState([]);
  const [searchText, setSearchText] = useState('');

  function getParticipacion(params) {
    return `${(params.getValue(params.id, 'cantidadAcciones') * 100 / cantidadEmitido).toFixed(8) || ''} `;
  }

  function getNombre(params) {
    return `${params.getValue(params.id, 'tipoPersona') == 'PN' ? params.getValue(params.id, 'pn_primerNombre') + " " + params.getValue(params.id, 'pn_segundoNombre') + " " + params.getValue(params.id, 'pn_apellidoPaterno') + " " + params.getValue(params.id, 'pn_apellidoMaterno') : params.getValue(params.id, 'nombre')} `;
  }
  //params.tipoPersona == 'PN' ? params.pn_apellidoPaterno + " " + params.pn_apellidoMaterno + " " + params.pn_primerNombre + " " + params.pn_segundoNombre : params.nombre;

  const columnsAccionistas = [
    { field: 'tipoIdentificacion', headerName: 'Tipo Id', width: 120, },
    {
      field: 'identificacion',
      headerName: 'Identificacion',
      width: 150,
    },
    { field: 'nombre', headerName: 'Nombre', width: 400, },
    { field: 'cantidadAcciones', headerName: 'Cantidad de Acciones', width: 180, align: "right", },
    { field: 'participacion', headerName: 'Participación (%)', width: 150, type: 'number', valueGetter: getParticipacion, },
    //{  field: 'repLegal_nombre', headerName: 'Representante Legal', width: 250,},
  ]

  const columnsSolicitudes = [
    { field: 'fecha', headerName: 'Fecha', width: 100, },
    { field: 'cesionarioNombre', headerName: 'Nombre Cesionario', width: 300, },
    {
      field: 'cesionarioIdentificacion',
      headerName: 'Identificacion',
      width: 130,
    },
    { field: 'acciones', headerName: 'Acciones', width: 120, align: "right", },
    {
      field: "CS",
      width: 120,
      renderCell: (cellValues) => {
        return <IconButton onClick={() => {
          //REgistrase
          //fetchAccionistas(cellValues.row);
          handleOpenRegistroAsamblea();
          setAsambleaSeleccionada(cellValues.row);
        }
        } color='primary'><HowToRegIcon /></IconButton>
      }
    },


    //{  field: 'participacion', headerName: 'Participación (%)', width: 150,type: 'number',valueGetter: getParticipacion,},
    //{  field: 'repLegal_nombre', headerName: 'Representante Legal', width: 250,},
  ]


  const [accionistasxJuntas, setAccionistasxJuntas] = useState([])

  async function fetchAccionistasxAsambleas() {

    let filter = {
      identificacion: {
        eq: userName // filter priority = 1
      },
    };
    console.log("Filtros", filter);
    const apiData2 = await API.graphql({ query: listAccionistasxJuntas, variables: { limit: 1000 } });
    const accionistasxJuntasFromAPI = apiData2.data.listAccionistasxJuntas.items;
    setAccionistasxJuntas(accionistasxJuntasFromAPI);
    console.log("accionistasxJuntasFromAPI", accionistasxJuntasFromAPI);
    //setRefrescar(!refrescar);

  }

  async function fetchAsambleas() {

    let filter = {
      estado: {
        eq: "Convocatoria" // filter priority = 1
      },
    };

    const apiData = await API.graphql({ query: listAsambleas, variables: { filter: filter, limit: 1000 } });
    const asambleasFromAPI = apiData.data.listAsambleas.items;
    const asambleasMerge = asambleasFromAPI.map(obj => ({ ...obj, Estado: '', NombreRep: '' }))
    //let asambleasMerge2 = {} ;
    /*
          let filter2 = {
            identificacion: {
                eq: userName // filter priority = 1
            },
          };
          const apiData2 = await API.graphql({ query: listAccionistasxJuntas, variables: { filter: filter2, limit : 1000} })
          const accionistasxJuntasFromAPI = apiData2.data.listAccionistasxJuntas.items;   
    */

    console.log("AHORA1", asambleasMerge);
    console.log("AHORA2", accionistasxJuntas);
    /*
            for (const asambleaLoop of asambleasMerge) {
              let presente = accionistasxJuntas.find(({ asambleaID }) => asambleaID === asambleaLoop.id);
              console.log("PRESENTE",presente)
              if(presente){
                asambleaLoop.Estado = presente.estado;
                asambleasMerge2 = asambleaLoop;
              }
            }
    
            console.log("AHORA3",asambleasMerge2) ;
            */

    const asambleasMerge2 = asambleasMerge.map((asamb) => {

      const presente = accionistasxJuntas.find(({ asambleaID, identificacion }) => (asambleaID === asamb.id && identificacion === userName));

      return {
        ...asamb,
        Estado: typeof (presente) !== 'undefined' ? "Sí" : "No",
        NombreRep: typeof (presente) !== 'undefined' ? presente.representanteNombre : "",
        IdAccionistarxJunta: typeof (presente) !== 'undefined' ? presente.id : "",
      }

    });

    console.log("AHORA3", asambleasMerge2);


    //Agregar campo estado, nombre de Representante en array
    //Consultar AccionistasxJunta
    //Para cada Asamblea buscar Accionista por Identificacion y actualizar estado y nombre representante
    //No







    /*
            const data={points:accionistasxJuntas,lines:asambleasFromAPI};
    
            const compileLines = ( data ) => {
              const { points, lines } = data;
              
               return lines.map(( line ) => {
                const p1 = points.find(({ asambleaID }) => asambleaID === line.id ).nombre;
                const p2 = points.find(({ asambleaID }) => asambleaID === line.id ).nombreRepresentante;
                
                return {
                  ...line,
                  Estado : p1,
                  NombreRep : p2,
                }
              });
            }
            
            const result = compileLines( data );
            
            console.log( "RESULT", result );
    */

    //console.log("QUE SERA",result)
    /*
            const asambleasMerge = asambleasFromAPI.map(obj => ({ ...obj, Estado: '', NombreRep: '' }))
    
    
            const asambleasMerge2 =  asambleasMerge.map(( asamb ) => {
    
              //console.log("asfasafasdf", accionistasxJuntasFromAPI);
              if(accionistasxJuntasFromAPI.length>0){
              const presente = accionistasxJuntasFromAPI.find(({ asambleaID,identificacion }) => (asambleaID === asamb.id && identificacion === userName));
              
              return {
                ...asamb,
                Estado: presente.nombre,
                NombreRep: presente.representanteNombre,
              }
            }
            else
            {
              return {
                ...asamb
              }
            }
    
            });
    */
    setRows(asambleasMerge2);
    //setRows(result);

  }

  //Todo esto es temporal solo para mostrar usabilidad
  const columnsDividendos = [
    {
      field: 'periodo',
      headerName: 'Periodo',
      width: 100,
    },
    {
      field: 'dividendo',
      type: 'number',
      headerName: 'Dividendo ($)',
      width: 130,
    },
    {
      field: 'dividendoRepartir',
      type: 'number',
      headerName: 'Repartir ($)',
      width: 120,
    },
    {
      field: 'fechaCorte',
      headerName: 'Corte',
      width: 100,
    },
    /*           
  {
      field: 'estado',
      headerName: 'Estado',
      width: 100,
      renderCell: (cellValues) => {
        return <Chip size="small" variant="outlined" label={cellValues.row.estado} color={cellValues.row.estado == 'Activo' ? 'primary' : 'secondary'} />
      }
  }, 
  */
    {
      field: 'cantidadAcciones',
      headerName: 'Mis Acciones',
      type: 'number',
      width: 130,
    },
    {
      field: 'participacion',
      headerName: 'Participación (%)',
      type: 'number',
      width: 150,
      //valueGetter: getParticipacion,
    },
    {
      field: 'dividendoRecibir',
      headerName: 'Mi Dividendo ($)',
      type: 'number',
      width: 130,
      //valueGetter: getDividendo,
    },

    {
      field: 'retencion',
      headerName: 'Retención ($)',
      type: 'number',
      width: 130,
      //valueGetter: getRetencion,
    },
    {
      field: 'dividendoRecibido',
      headerName: 'Recibir ($)',
      type: 'number',
      width: 120,
      //valueGetter: getNetoRecibir,
    },
    {
      field: "Confirmar",
      width: 120,
      renderCell: (cellValues) => {
        return <IconButton onClick={() => {
          //REgistrase
          //fetchAccionistas(cellValues.row);
        }
        } color='primary'><ThumbUpAltIcon /></IconButton>
      }
    },
  ];

  function getParticipacion1(cantidadAcciones) {
    return ((cantidadAcciones / 42930108) * 100.00).toFixed(16);
  }




  function getRetencion1(base, residente) {



    let num = base * retencionNoResidente / 100.00;
    //console.log("RESIDENCIAAAA",residente, base);
    //num = base*retencionNoResidente/100.00
    //if(residente == "Ecuador"){
    if (base > FB1 && base < FE1) { num = RFB1 + (base - FB1) * RFE1 / 100.00; }
    if (base > FB2 && base < FE2) { num = RFB2 + (base - FB2) * RFE2 / 100.00; }
    if (base > FB3 && base < FE3) { num = RFB3 + (base - FB3) * RFE3 / 100.00; }
    if (base > FB4 && base < FE4) { num = RFB4 + (base - FB4) * RFE4 / 100.00; }
    if (base > FB5 && base < FE5) { num = RFB5 + (base - FB5) * RFE5 / 100.00; }
    if (base > FB6 && base < FE6) { num = RFB6 + (base - FB6) * RFE6 / 100.00; }
    //}
    //if(residente != "Ecuador") num = base*retencionNoResidente;


    return num.toFixed(2);
  }


  const [dividendos, setDividendos] = useState([]);

  async function fetchDividendos() {
    /*const apiData = await API.graphql({ query: listDividendos, variables: { limit: 1000 } });
    const dividendosFromAPI = apiData.data.listDividendos.items;


    ////////////////

    const accionistaCalculo = dividendosFromAPI.map(function (e) {
      return {
        id: e.id,
        cantidadAcciones: 4500,
        participacion: getParticipacion1(4500),
        periodo: e.periodo,
        dividendo: e.dividendo,
        porcentajeRepartir: e.porcentajeRepartir,
        dividendoRepartir: e.dividendoRepartir,
        fechaCorte: e.fechaCorte,
        fechaPago: e.fechaPago,
        estado: e.estado,
        dividendoRecibir: (e.dividendoRepartir * getParticipacion1(4500) / 100.00).toFixed(2),
        baseImponible: (baseImponible * (e.dividendoRepartir * getParticipacion1(4500) / 100.00).toFixed(2) / 100.00).toFixed(2),
        retencion: getRetencion1((baseImponible * (e.dividendoRepartir * getParticipacion1(4500) / 100.00).toFixed(2) / 100.00).toFixed(2), e.direccionPais),
        dividendoRecibido: ((e.dividendoRepartir * getParticipacion1(4500) / 100.00).toFixed(2) - getRetencion1((baseImponible * (e.dividendoRepartir * getParticipacion1(4500) / 100.00).toFixed(2) / 100.00).toFixed(2), e.direccionPais)).toFixed(2),
        estadoDividendo: 'Confirmado',
        fechaSolicitud: '',
      };
    })


    setDividendos(accionistaCalculo);*/





    /////////////

    //setDividendos(dividendosFromAPI);
    //setRows(dividendosFromAPI);          
  }

  const [cantidadEmitido, setCantidadEmitido] = useState(1);
  const [valorNominal, setValorNominal] = useState(1);
  const [baseImponible, setBaseImponible] = useState(0);
  const [retencionNoResidente, setRetencionNoResidente] = useState(0);

  const [modeloCartaCesion, setModeloCartaCesion] = useState('');
  const [modeloCartaGerente, setModeloCartaGerente] = useState('');
  const [modeloCartaInstrucciones, setModeloCartaInstrucciones] = useState('');


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


  async function fetchParametros() {

    const apiData = await API.graphql({ query: getParametro, variables: { id: '1' } });

    const parametrosFromAPI = apiData.data.getParametro;

    //console.log("PARAMETROS",parametrosFromAPI);

    setCantidadEmitido(parametrosFromAPI.cantidadEmitida);
    setValorNominal(parametrosFromAPI.valorNominal);

    setBaseImponible(parametrosFromAPI.baseImponible);
    setRetencionNoResidente(parametrosFromAPI.noResidente);

    setModeloCartaCesion(parametrosFromAPI.modeloCartaCesion);
    setModeloCartaGerente(parametrosFromAPI.modeloCartaGerente);
    setModeloCartaInstrucciones(parametrosFromAPI.modeloCartaInstrucciones);

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


  }

  async function onChangeHabilitante1(e) {
    if (!e.target.files[0]) {
      console.log('entro al cancelar')
      return
    }
    const file = e.target.files[0];
    const filename = uuid() + file.name
    setIDRepresentante({ filename });
    await Storage.put(filename, file);
  }

  const [userName, setUserName] = useState("");

  const [nombreRepresentante, setNombreRepresentante] = useState('');
  const [identificacionRepresentante, setIdentificacionRepresentante] = useState('');
  const [IDRepresentante, setIDRepresentante] = useState('');

  const [nombreCesionario, setNombreCesionario] = useState('');
  const [identificacionCesionario, setIdentificacionCesionario] = useState('');
  const [direccionCesionario, setDireccionCesionario] = useState('');
  const [emailCesionario, setEmailCesionario] = useState('');
  const [telefonoCesionario, setTelefonoCesionario] = useState('');
  const [accionesTransferir, setAccionesTransferir] = useState(0);
  const [valorVenta, setValorVenta] = useState(0);
  const [totalVenta, setTotalVenta] = useState(0);
  const [docIdentificacionCesionario, setDocIdentificacionCesionario] = useState('');
  const [cartaCesion, setCartaCesion] = useState('');
  const [cartaInstrucciones, setCartaInstrucciones] = useState('');

  //const [modeloCartaCesion, setModeloCartaCesion] = useState('');
  //const [modeloCartaGerente, setModeloCartaGerente] = useState('');
  //const [modeloCartaInstrucciones, setModeloCartaInstrucciones] = useState('');

  const handleChangeNombreCesionario = (event) => { setNombreCesionario(event.target.value); };
  const handleChangeIdentificacionCesionario = (event) => { setIdentificacionCesionario(event.target.value); };
  const handleChangeDireccionCesionario = (event) => { setDireccionCesionario(event.target.value); };
  const handleChangeEmailCesionario = (event) => { setEmailCesionario(event.target.value); };
  const handleChangeTelefonoCesionario = (event) => { setTelefonoCesionario(event.target.value); };
  const handleChangeAccionesTransferir = (event) => { setAccionesTransferir(event.target.value); };
  const handleChangevalorVenta = (event) => { setValorVenta(event.target.value); setTotalVenta(event.target.value * accionesTransferir) };

  async function onChangeDocIdentificacion(e) {
    if (!e.target.files[0]) {
      console.log('entro al cancelar')
      return
    }
    const file = e.target.files[0];
    const filename = file.name + uuid();
    setDocIdentificacionCesionario({ filename });
    await Storage.put(filename, file);
  }
  async function onChangeCartaCesion(e) {
    if (!e.target.files[0]) {
      console.log('entro al cancelar')
      return
    }
    const file = e.target.files[0];
    const filename = file.name + uuid();
    setCartaCesion({ filename });
    await Storage.put(filename, file);
  }
  /*
  async function onChangeCartaGerente(e) {
    if (!e.target.files[0]){
      console.log('entro al cancelar')
      return
    }
    const file = e.target.files[0];
    const filename = file.name + uuid();
    setCartaGerente({ filename });
    await Storage.put(filename, file);
    }
    */
  async function onChangeCartaInstrucciones(e) {
    if (!e.target.files[0]) {
      console.log('entro al cancelar')
      return
    }
    const file = e.target.files[0];
    const filename = file.name + uuid();
    setCartaInstrucciones({ filename });
    await Storage.put(filename, file);
  }



  useEffect(() => {

    //if(contador == 1) {
    //  setOpenSnack(true)
    //  setContador(2)
    //}
    const user = getUser();
    setUserName(user);
    fetchParametros();
    fetchPerfilUsuario(user);

    //consultarHashAccionista();

    fetchAsambleas();

    fetchAccionistasxAsambleas();

    //fetchDividendos();

    //fetchAccionistas();

    if (accionista.length > 0) fetchSolicitudes();

  }, [refrescar, accionistasxJuntas.length]);

  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnack(false);
  };

  function getUser() {
    console.log("AUTH.USER",Auth.user);
    let user
    if (Auth.user != null) user = Auth.user.username;
    return user;
  }


  async function fetchPerfilUsuario(user) {

    let filter = {
      id: {
        eq: user // filter priority = 1
      },
    };

    console.log("PARAMETRO", user);
    const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 1000 } });
    const accionistaFromAPI = apiData.data.listAccionistas.items;
    setAccionista(accionistaFromAPI);
    console.log("Accionista", accionistaFromAPI);      
  }


  async function fetchAccionistas() {


    const filter = {
      estado: {
        ne: 'Inactivo'
      },
    }
    const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 1000 } });
    const accionistasFromAPI = apiData.data.listAccionistas.items;

    accionistasFromAPI.forEach(function (obj) {
      obj.nombre2 = obj.tipoPersona == 'PN' ? obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno + " " + obj.pn_primerNombre + " " + obj.pn_segundoNombre : obj.nombre;
    });

    setAccionistas(accionistasFromAPI.sort(function (b, a) {
      if (a.cantidadAcciones > b.cantidadAcciones) {
        return 1;
      }
      if (a.cantidadAcciones < b.cantidadAcciones) {
        return -1;
      }
      // a must be equal to b
      return 0;
    }));

    setRowsAccionistas(accionistasFromAPI);

  }

  const requestSearch = (searchValue) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
    const filteredRows = accionistas.filter((row) => {
      return Object.keys(row).some((field) => {
        //if (row[field] != null) {
        return row[field] && searchRegex.test(row[field].toString());
        //}

      });
    });
    setRowsAccionistas(filteredRows);
  };


  const exportPDFCertificado = async () => {

    const miInit = { // OPTIONAL
      queryStringParameters: {  // OPTIONAL
        id: accionista[0].id,
      },
    };

    //console.log("Data API Parameter", miInit);
    //const data = await API.get('LibroApiQLDB','/registro',miInit )

    //const data = await API.get('apiQLDBprod', '/crearRegistro-prod', miInit)
    //console.log("Data API", data[0].hash);



    let base64Image = document.getElementById('qrcode').toDataURL()

    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    //const orientation = "portrait"; // portrait or landscape
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(12);

    const title = "UNACEM ECUADOR S.A.";

    doc.addImage(marco, "JPEG", 0, 3, 840, 590)
    doc.addImage(fondoUnacem, "JPEG", 90, 90, 663, 413)
    doc.addImage(logoSolo, "JPEG", 420, 120, 30, 30)

    doc.addImage(base64Image, "png", 95, 430, 80, 80)
    doc.addImage(logoCompleto, "PNG", 590, 450, 150, 50)

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.setFontSize(34);
    doc.text(title, 230, 200);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(137, 34, 28);
    doc.setFontSize(12);
    doc.text("CAPITAL SUSCRITO Y AUTORIZADO USD 1,717,204.32", 280, 215);

    doc.setTextColor(100);
    doc.setFontSize(11);
    const texto1 = "ESTE CERTIFICADO TOKENIZADO ACREDITA QUE";
    doc.text(texto1, 300, 250);

    //const texto2 = accionista[0].nombre + " con Identificacion " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    const texto2 = accionista[0].acc_nombre_completo
    doc.text(texto2, 220, 290);

    doc.setDrawColor(100);
    doc.setLineWidth(0.5);
    doc.line(150, 300, 690, 300);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const texto3 = "ES PROPIETARIO DE " + accionista[0].acc_cantidad_acciones + " ACCIONES DE US$ 0.04 CENTAVOS DE DOLAR";
    doc.text(texto3, 230, 320);

    const texto4 = "DE LOS ESTADOS UNIDOS DE AMERICA, CON TODOS LOS DERECHOS Y OBLIGACIONES ";
    doc.text(texto4, 190, 340);

    const texto5 = "QUE LE CORRESPONDEN A LA LEY Y LOS ESTATUTOS SOCIALES DE LA COMPAÑIA.";
    doc.text(texto5, 200, 360);


    doc.setDrawColor(137, 34, 28);
    doc.setLineWidth(0.5);
    doc.line(250, 382, 590, 382);

    const months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];

    const d = new Date();

    doc.setFont("helvetica", "bold");
    doc.setTextColor(137, 34, 28);
    //const texto6 = "EXPEDIDO EL " + d.getDate() + " DE " + months[d.getMonth()] + " DEL " + d.getFullYear();
    const texto6 = "EXPEDIDO EL " + d.getDate() + " DE " + months[d.getMonth()] + " DEL " + d.getFullYear() + " A LAS " + d.getHours() + ":" + ('0' + d.getMinutes()).slice(-2) + ".";
    doc.text(texto6, 280, 400);

    doc.setDrawColor(137, 34, 28);
    doc.setLineWidth(0.5);
    doc.line(250, 410, 590, 410);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150);

    const texto7 = "Fuente de Información Plataforma de Accionistas Unacem"
    doc.text(texto7, 195, 460);
    const texto8 = "https://develop.d1uap272r7bnzf.amplifyapp.com/"
    doc.text(texto8, 195, 470);
    const texto9 = "El código QR lo direccionará a la página de verificación";
    doc.text(texto9, 195, 490);
    const texto10 = "a313e28f-4e99-4ffd-9205-33e445afa103";
    doc.text(texto10, 195, 500);
    doc.save("CertificadoAccionistas.pdf")   
  }

  function numberWithCommas(x) {
    //return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return x;
  }


  const addAccionista = async () => {
    try {

      //idAsamblea.stopPropagation();
      //console.log("Nro Asamblea",asambleaSeleccionada.id);

      //if (!valCedente ) return

      const accionista2 = {
        asambleaID: asambleaSeleccionada.id, accionistaID: accionista[0].id, nombre: accionista[0].nombre, identificacion: accionista[0].identificacion, acciones: accionista[0].cantidadAcciones, estado: accionista[0].estado, presente: 'false', representanteNombre: nombreRepresentante, representanteDocumento: identificacionRepresentante, representanteDI: IDRepresentante.filename,
        votacion1: asambleaSeleccionada.votacionTema1 ? true : '',
        votacion2: asambleaSeleccionada.votacionTema2 ? true : '',
        votacion3: asambleaSeleccionada.votacionTema3 ? true : '',
        votacion4: asambleaSeleccionada.votacionTema4 ? true : '',
        votacion5: asambleaSeleccionada.votacionTema5 ? true : '',
        votacion6: asambleaSeleccionada.votacionTema6 ? true : '',
        votacion7: asambleaSeleccionada.votacionTema7 ? true : '',
        votacion8: asambleaSeleccionada.votacionTema8 ? true : '',
        votacion9: asambleaSeleccionada.votacionTema9 ? true : '',
        votacion10: asambleaSeleccionada.votacionTema10 ? true : '',
      }



      let updatePresencia = '';
      let accionistaxJuntaID = '';
      //console.log("UPDATE OR INSERT", rows.length, rows)

      if (rows[0].NombreRep) {
        //console.log("ENTRA AL UPDATE",rows[0].NombreRep)
        updatePresencia = API.graphql({
          query: updateAccionistasxJunta, variables: {
            input: {
              id: rows[0].IdAccionistarxJunta,
              representanteNombre: nombreRepresentante,
              representanteDocumento: identificacionRepresentante,
              representanteDI: IDRepresentante.filename,
            }
          }
        });
        window.location.reload();

        //setRefrescar(!refrescar);
        //setNombreRepresentante('Cambiaaaaa');
      }
      else {
        //console.log("ENTRA AL INSERT",rows[0].NombreRep)
        accionistaxJuntaID = await API.graphql(graphqlOperation(createAccionistasxJunta, { input: accionista2 }))
      }

      setNombreRepresentante('');
      setIdentificacionRepresentante('');
      setIDRepresentante('');


      //const updatePresencia = API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: value, presente: 'true'} } });

      //console.log("Datos Accionista", accionista2);

      //console.log("updateAsamblea antes", asambleaSeleccionada.id, asambleaSeleccionada.registrados);
      //const updateAsamblea = await API.graphql(graphqlOperation(updateAsamblea, { id: asambleaSeleccionada.id, registrados : accionistasxJuntas.length + 1 }))

      const updateAsambleaReturn = await API.graphql({ query: updateAsamblea, variables: { input: { id: asambleaSeleccionada.id, registrados: asambleaSeleccionada.registrados + 1 } } });

      //console.log("updateAsamblea desp", updateAsamblea);

      setRefrescar(!refrescar);

      handleCloseRegistroAsamblea();

    } catch (err) {
      console.log('error creating transaction:', err)
    }
  }


  const addSolicitud = async () => {
    try {

      const today = new Date();
      const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();

      const solicitud = {
        fecha: fecha,
        operacion: 'Solicitud Transferencia',
        idCedente: accionista[0].id,
        cedente: accionista[0].nombre,
        cedenteIdentificacion: accionista[0].identificacion,
        acciones: accionesTransferir,
        valorVenta: valorVenta,
        totalVenta: totalVenta,
        cesionarioIdentificacion: identificacionCesionario,
        cesionarioNombre: nombreCesionario,
        cesionarioDireccion: direccionCesionario,
        cesionarioEmail: emailCesionario,
        cesionarioTelefono: telefonoCesionario,
        estado: 'Pendiente',
        cs: cartaCesion.filename,
        ci: cartaInstrucciones.filename,
        docIdentidad: docIdentificacionCesionario.filename,
      }

      console.log("Registro de Solicitud", solicitud);
      const solicitudTransferencia = await API.graphql(graphqlOperation(createSolicitudes, { input: solicitud }))

      setRefrescar(!refrescar);

      setNombreCesionario('');
      setIdentificacionCesionario('');
      setDireccionCesionario('');
      setEmailCesionario('');
      setTelefonoCesionario('');
      setAccionesTransferir(0);
      setValorVenta(0);
      setTotalVenta(0);
      setDocIdentificacionCesionario('');
      setCartaCesion('');
      //setCartaGerente('');
      setCartaInstrucciones('');

      handleCloseTransferencia();

    } catch (err) {
      console.log('error creating transaction:', err)
    }
  }


  const handleChangeNombreRepresentante = (event) => { setNombreRepresentante(event.target.value); };
  const handleChangeIdentificacionRepresentante = (event) => { setIdentificacionRepresentante(event.target.value); };


  const consultarHashAccionista = async () => {
    try {

      const miInit = { // OPTIONAL
        queryStringParameters: {  // OPTIONAL
          id: accionista[0].id,
        },
      };

      console.log("Data API Parameter", miInit);
      //const data = await API.get('LibroApiQLDB','/registro',miInit )
      const data = await API.get('apiQLDBprod', '/crearRegistro-prod', miInit)
      console.log("Data API", data[0].hash);
      setHash(data[0].hash)

    } catch (err) {
      console.log('error', err)
    }

  }


  async function fetchSolicitudes() {

    const filter = {
      estado: {
        ne: 'Cerrada'
      },
      idCedente: {
        eq: accionista[0].id
      },
    }
    const apiData = await API.graphql({ query: listSolicitudes, variables: { filter: filter, limit: 1000 } });
    const solicitudesFromAPI = apiData.data.listSolicitudes.items;

    setSolicitudes(solicitudesFromAPI);

  }


  const getModeloCartaCesion = e => {
    e.stopPropagation();
    console.log("carta cesion", modeloCartaCesion);
    Storage.get(modeloCartaCesion)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function (response) {
          if (response.status === 200) {
            //setImageCS(url);
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));
  };

  const getModeloCartaGerente = e => {
    e.stopPropagation();

    Storage.get(modeloCartaGerente)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function (response) {
          if (response.status === 200) {
            //setImageCS(url);
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));
  };

  const getModeloCartaInstrucciones = e => {
    e.stopPropagation();

    Storage.get(modeloCartaInstrucciones)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function (response) {
          if (response.status === 200) {
            //setImageCS(url);
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));
  };

  const classes = useStyles();

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" style={{ height: "110px" }}>
            <CardContent>
              <Typography variant="body2" style={{ fontWeight: 600 }}>
                {accionista.length > 0 && accionista[0].acc_nombre_completo}
              </Typography>
              <Typography variant="body2">
                <small>{accionista.length > 0 && accionista[0].acc_tipo_identificacion + " : " + accionista[0].acc_identificacion}</small>
              </Typography>
              <Button startIcon={<PrintIcon />} size="small" variant="contained" color="primary" style={{ textTransform: 'none', height: '22px', marginTop: '15px' }} onClick={exportPDFCertificado}><small>Imprimir Certificado de Acciones</small></Button>

            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={2}>
          <Card variant="outlined" style={{ height: "110px" }}>
            <CardContent>
              <Typography variant="body2">
                Acciones
              </Typography>
              <Typography variant="h5" component="div">
                {accionista.length > 0 && numberWithCommas(accionista[0].acc_cantidad_acciones)}
              </Typography>

              <QRcode hidden value={'https://production.dnyw5qmklx2h.amplifyapp.com/?id=' + userName} id='qrcode' size={75} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={2}>
          <Card variant="outlined" style={{ height: "110px" }}>
            <CardContent>
              <Typography variant="body2" >
                Capital (USD)
              </Typography>
              <Typography variant="h5" component="div">
                {accionista.length > 0 && numberWithCommas((accionista[0].acc_cantidad_acciones * valorNominal).toFixed(2))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={2}>
          <Card variant="outlined" style={{ height: "110px" }}>
            <CardContent>
              <Typography variant="body2">
                Participación (%)
              </Typography>
              <Typography variant="h5" component="div">
                {accionista.length > 0 && (accionista[0].acc_cantidad_acciones * 100 / cantidadEmitido).toFixed(8)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>


        <Grid item xs={12} sm={2}>
          <Card variant="outlined" style={{ height: "110px" }}>
            <CardContent>
              <Typography variant="body2" >
                Valor Nominal (USD)
              </Typography>
              <Typography variant="h5" component="div">
                {accionista.length > 0 && numberWithCommas((valorNominal).toFixed(2))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {solicitudes.length > 0 &&
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" style={{ fontWeight: 600 }} color="secondary">
                  Solicitudes de Transferencias
                </Typography>

                <DataGrid
                  style={{ backgroundColor: 'white' }}
                  density="compact"
                  autoHeight='true'
                  autoPageSize='true'
                  disableColumnMenu
                  rows={solicitudes}
                  columns={columnsSolicitudes}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  //pagination= {false}
                  hideFooter={true}
                />

              </CardContent>
            </Card>
          </Grid>
        }

        {rows.length > 0 &&
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  Convocatorias Abiertas
                </Typography>

                <DataGrid
                  style={{ backgroundColor: 'white' }}
                  density="compact"
                  autoHeight='true'
                  autoPageSize='true'
                  disableColumnMenu
                  rows={rows}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  hideFooter={true}
                />

              </CardContent>
            </Card>
          </Grid>
        }

        {false &&
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  Dividendos
                </Typography>
                <DataGrid
                  style={{ backgroundColor: 'white' }}
                  density="compact"
                  autoHeight='true'
                  maxWidth='true'
                  autoPageSize='true'
                  disableColumnMenu
                  rows={dividendos}
                  columns={columnsDividendos}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                />
              </CardContent>
            </Card>
          </Grid>
        }

        <Dialog open={openRegistroAsamblea} onClose={handleCloseRegistroAsamblea} aria-labelledby="form-dialog-title"    >
          <DialogTitle id="form-dialog-title">Registro en Asamblea</DialogTitle>
          <DialogContent style={{ height: '200px' }}>
            <Typography variant="body2">Tipo  :   {asambleaSeleccionada.tipo} </Typography>
            <Typography variant="body2">Fecha :   {asambleaSeleccionada.fecha} </Typography>
            <Typography variant="body2">Hora  :   {asambleaSeleccionada.hora} </Typography>
            <Typography variant="body2">Lugar :   {asambleaSeleccionada.lugar} </Typography>
            <TextField
              id="outlined-required"
              label={<small>Nombre Representante</small>}
              value={nombreRepresentante}
              onChange={handleChangeNombreRepresentante}
              size='small'
              variant="outlined"
              style={{ width: '300px', marginTop: 7 }}
            />
            <TextField
              id="outlined-required"
              label={<small>Identificación</small>}
              value={identificacionRepresentante}
              onChange={handleChangeIdentificacionRepresentante}
              size='small'
              variant="outlined"
              style={{ width: '200px', marginTop: 7 }}
            />
            <label htmlFor="upload-photo101">
              <input style={{ display: 'none' }} id="upload-photo101" name="upload-photo101" type="file" accept="application/pdf" onChange={onChangeHabilitante1} />
              <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', marginTop: 7 }}>Identificación delegado</Button>
            </label>
          </DialogContent>
          <DialogActions style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', width: '100%' }}>


            <Button onClick={addAccionista} variant="contained" color="primary" style={{ textTransform: 'none' }}>
              Registrarse
            </Button>

            <Button onClick={handleCloseRegistroAsamblea} color="primary" style={{ textTransform: 'none' }}>
              Salir
            </Button>


          </DialogActions>
        </Dialog>

      </Grid>
    </main>
  );

}