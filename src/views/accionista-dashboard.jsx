import React, { useState, useEffect } from 'react';
import { API,Storage,Auth,graphqlOperation } from 'aws-amplify';

import { makeStyles } from '@material-ui/core/styles';
import { createTheme } from '@material-ui/core/styles';
import { Link } from "react-router-dom";
import { listAsambleas, listDividendos, listAccionistas, listAccionistasxJuntas, listOperaciones,getParametro, listHerederos, listSolicitudes } from '../graphql/queries';
import { createAccionistasxJunta, updateAsamblea, updateAccionistasxJunta, createSolicitudes } from '../graphql/mutations';

import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';

import jsPDF from "jspdf";
import "jspdf-autotable";
import QRcode from 'qrcode.react'

import logo from '../images/logoUNACEMmedMarco.jpg';
import fondo from '../images/Cert1.jpg';
//import QRcode from '../images/QRcode.png';
import marco from '../images/Recurso 1.png'
import fondoUnacem from '../images/Recurso 2.png'
import logoSolo from '../images/Unacem2.png'
import logoCompleto from '../images/logoUNACEMmedMarco2.png'
import bienvenida from '../images/Comunicado.jpeg'

import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import HowToRegIcon from '@material-ui/icons/HowToReg';
//import ThumbUpOffAltIcon from '@material-ui/icons/ThumbUpOffAlt';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import PrintIcon from '@material-ui/icons/Print';

import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import PageviewIcon from '@material-ui/icons/Pageview';
import GroupOutlinedIcon from '@material-ui/icons/GroupOutlined';
import FaceOutlinedIcon from '@material-ui/icons/FaceOutlined';
import NotInterestedOutlinedIcon from '@material-ui/icons/NotInterestedOutlined';
import DevicesOutlinedIcon from '@material-ui/icons/DevicesOutlined';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';
import FiberNewOutlined from '@material-ui/icons/FiberNewOutlined';

import PanToolIcon from '@material-ui/icons/PanTool';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

import Grid from '@material-ui/core/Grid';

import {Card, CardContent, Typography,  Button, ListItem, ListItemText, ListSubheader, List, Tooltip, Chip, 
  FormControl, RadioGroup, FormControlLabel, Radio, Box, Tabs, Tab, Snackbar,
  Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle, ListItemIcon,} from '@material-ui/core';

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
  

  const Input = styled('input')({
    display: 'none',
  });
    

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
    const [asambleaSeleccionada, setAsambleaSeleccionada]= useState({});
    const [openTransferencia, setOpenTransferencia] = useState(false);

    const handleCloseRegistroAsamblea = () =>  setOpenRegistroAsamblea(false);    
    const handleOpenRegistroAsamblea = () => setOpenRegistroAsamblea(true);

    const handleOpenTransferencia = () => setOpenTransferencia(true);
    const handleCloseTransferencia = () =>  setOpenTransferencia(false);    

    const [accionista, setAccionista] = useState([])

    const[refrescar, setRefrescar]=useState(false);

    const[hash, setHash]=useState('');

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
            return <IconButton  onClick={() =>  
              {
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
        return `${ params.getValue(params.id, 'tipoPersona') == 'PN' ? params.getValue(params.id, 'pn_primerNombre') + " " + params.getValue(params.id, 'pn_segundoNombre') + " " + params.getValue(params.id, 'pn_apellidoPaterno') + " " + params.getValue(params.id, 'pn_apellidoMaterno') : params.getValue(params.id, 'nombre') } `;
      }
      //params.tipoPersona == 'PN' ? params.pn_apellidoPaterno + " " + params.pn_apellidoMaterno + " " + params.pn_primerNombre + " " + params.pn_segundoNombre : params.nombre;

      const columnsAccionistas = [
        {  field: 'tipoIdentificacion', headerName: 'Tipo Id', width: 120,},
        {
          field: 'identificacion',
          headerName: 'Identificacion',
          width: 150,
        }, 
        {  field: 'nombre', headerName: 'Nombre', width: 400, },
        {  field: 'cantidadAcciones', headerName: 'Cantidad de Acciones', width: 180, align: "right",},
        {  field: 'participacion', headerName: 'Participación (%)', width: 150,type: 'number',valueGetter: getParticipacion,},
        //{  field: 'repLegal_nombre', headerName: 'Representante Legal', width: 250,},
      ]

      const columnsSolicitudes = [
        {  field: 'fecha', headerName: 'Fecha', width: 100,},
        {  field: 'cesionarioNombre', headerName: 'Nombre Cesionario', width: 300, },
        {
          field: 'cesionarioIdentificacion',
          headerName: 'Identificacion',
          width: 130,
        },         
        {  field: 'acciones', headerName: 'Acciones', width: 120, align: "right",},
        {
          field: "CS",
          width: 120,
          renderCell: (cellValues) => {
            return <IconButton  onClick={() =>  
              {
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
        console.log("Filtros",filter);
        const apiData2 = await API.graphql({ query: listAccionistasxJuntas, variables: { limit : 1000} });
        const accionistasxJuntasFromAPI = apiData2.data.listAccionistasxJuntas.items;       
        setAccionistasxJuntas(accionistasxJuntasFromAPI);
        console.log("accionistasxJuntasFromAPI",accionistasxJuntasFromAPI);
        //setRefrescar(!refrescar);
        
      }

      async function fetchAsambleas() {

        let filter = {
          estado: {
              eq: "Convocatoria" // filter priority = 1
          },
        };

      const apiData = await API.graphql({ query: listAsambleas, variables: {filter: filter, limit: 1000} });
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

        console.log("AHORA1",asambleasMerge) ;
        console.log("AHORA2",accionistasxJuntas) ;
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

        const asambleasMerge2 =  asambleasMerge.map(( asamb ) => {

          const presente = accionistasxJuntas.find(({ asambleaID,identificacion }) => (asambleaID === asamb.id && identificacion === userName));
          
          return {
            ...asamb,
            Estado: typeof(presente) !== 'undefined' ?  "Sí" : "No",
            NombreRep: typeof(presente) !== 'undefined' ? presente.representanteNombre : "",
            IdAccionistarxJunta: typeof(presente) !== 'undefined' ? presente.id : "",
          }

        });

        console.log("AHORA3",asambleasMerge2) ;


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
              return <IconButton  onClick={() =>  
                {
                  //REgistrase
                  //fetchAccionistas(cellValues.row);
                }
              } color='primary'><ThumbUpAltIcon /></IconButton>
            }
          },                                  
      ];

      function getParticipacion1(cantidadAcciones) {
        return ((cantidadAcciones / 42930108) * 100.00).toFixed(16) ;
      }
      



        function getRetencion1(base, residente) {       
      
      

            let num = base*retencionNoResidente/100.00;
            //console.log("RESIDENCIAAAA",residente, base);
            //num = base*retencionNoResidente/100.00
            //if(residente == "Ecuador"){
            if  (base > FB1 && base < FE1) { num = RFB1 + (base - FB1)*RFE1/100.00; }
            if  (base > FB2 && base < FE2) { num = RFB2 + (base - FB2)*RFE2/100.00; }
            if  (base > FB3 && base < FE3) { num = RFB3 + (base - FB3)*RFE3/100.00; }
            if  (base > FB4 && base < FE4) { num = RFB4 + (base - FB4)*RFE4/100.00; }
            if  (base > FB5 && base < FE5) { num = RFB5 + (base - FB5)*RFE5/100.00; }
            if  (base > FB6 && base < FE6) { num = RFB6 + (base - FB6)*RFE6/100.00; } 
            //}
            //if(residente != "Ecuador") num = base*retencionNoResidente;
    
    
            return num.toFixed(2);
        }
    

      const [dividendos, setDividendos] = useState([]); 

      async function fetchDividendos() {
        const apiData = await API.graphql({ query: listDividendos, variables: {  limit: 1000} });
        const dividendosFromAPI = apiData.data.listDividendos.items;


////////////////

const accionistaCalculo = dividendosFromAPI.map(function(e) {
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
        dividendoRecibir:  (e.dividendoRepartir * getParticipacion1(4500) / 100.00).toFixed(2),
        baseImponible: (baseImponible * (e.dividendoRepartir * getParticipacion1(4500) / 100.00).toFixed(2) / 100.00).toFixed(2),
        retencion: getRetencion1((baseImponible * (e.dividendoRepartir * getParticipacion1(4500) / 100.00).toFixed(2) / 100.00).toFixed(2),e.direccionPais),
        dividendoRecibido: ((e.dividendoRepartir * getParticipacion1(4500) / 100.00).toFixed(2) - getRetencion1((baseImponible * (e.dividendoRepartir * getParticipacion1(4500) / 100.00).toFixed(2) / 100.00).toFixed(2),e.direccionPais)).toFixed(2),
        estadoDividendo: 'Confirmado',
        fechaSolicitud: '',
    } ;
})


setDividendos(accionistaCalculo);





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
  
        const apiData = await API.graphql({ query: getParametro , variables: { id: '1' } });
  
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
      if (!e.target.files[0]){
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
      const [IDRepresentante,setIDRepresentante] = useState('');

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
        if (!e.target.files[0]){
          console.log('entro al cancelar')
          return
        }
        const file = e.target.files[0];
        const filename = file.name + uuid();
        setDocIdentificacionCesionario({ filename });
        await Storage.put(filename, file);
        }
      async function onChangeCartaCesion(e) {
        if (!e.target.files[0]){
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
        if (!e.target.files[0]){
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

        consultarHashAccionista();

        fetchAsambleas();
        
        fetchAccionistasxAsambleas();
        
        fetchDividendos();
  
        fetchAccionistas();
        
        if (accionista.length > 0) fetchSolicitudes();
      
      }, [refrescar,accionistasxJuntas.length ]);

      const handleCloseSnack = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpenSnack(false);
      };

      function getUser() {
        //console.log("AUTH.USER",Auth.user);
        let user 
        if(Auth.user != null) user = Auth.user.username;
        return user;
        }
  

        async function fetchPerfilUsuario(user) {

          let filter = {
            identificacion: {
                  eq: user // filter priority = 1
              },
            };
  
            //console.log("PARAMETRO", user);
            const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 1000} });
            const accionistaFromAPI = apiData.data.listAccionistas.items;
            setAccionista(accionistaFromAPI);
            //console.log("Accionista", accionistaFromAPI);      
        }
  

        async function fetchAccionistas() {

   
          const filter = {
            estado: {
              ne: 'Inactivo'
            },
          }      
          const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 1000} });
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


      const exportPDFCertificado = async() => {

        const miInit = { // OPTIONAL
          queryStringParameters: {  // OPTIONAL
            id : accionista[0].id,
          },
      };

        //console.log("Data API Parameter", miInit);
        //const data = await API.get('LibroApiQLDB','/registro',miInit )

        //const data = await API.get('apiQLDBprod','/crearRegistro-prod',miInit )
        //console.log("Data API", data[0].hash);



        let base64Image = document.getElementById('qrcode').toDataURL()

        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        //const orientation = "portrait"; // portrait or landscape
        const orientation = "landscape"; // portrait or landscape
    
        const marginLeft = 40;
        const doc = new jsPDF(orientation, unit, size);
    
        doc.setFontSize(12);
      
        const title = "UNACEM ECUADOR S.A." ;

        doc.addImage(marco,"JPEG",0,3,840,590)    
        doc.addImage(fondoUnacem,"JPEG",90,90,663,413)    
        doc.addImage(logoSolo,"JPEG",420,120,30,30)

        //doc.addImage(QRcode,"PNG",95,430,80,80)
        doc.addImage(base64Image,"png",95,430,80,80)        
        doc.addImage(logoCompleto,"PNG",590,450,150,50)

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
        const texto2 = accionista[0].nombre 
        doc.text(texto2, 220, 290);            
      
        doc.setDrawColor(100);
        doc.setLineWidth(0.5);
        doc.line(150, 300, 690, 300);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const texto3 = "ES PROPIETARIO DE " + accionista[0].cantidadAcciones + " ACCIONES DE US$ 0.04 CENTAVOS DE DOLAR" ;
        doc.text(texto3, 230, 320);    

        const texto4 = "DE LOS ESTADOS UNIDOS DE AMERICA, CON TODOS LOS DERECHOS Y OBLIGACIONES " ;
        doc.text(texto4, 190, 340);    

        const texto5 = "QUE LE CORRESPONDEN A LA LEY Y LOS ESTATUTOS SOCIALES DE LA COMPAÑIA." ;
        doc.text(texto5, 200, 360);    


        doc.setDrawColor(137, 34, 28);
        doc.setLineWidth(0.5);
        doc.line(250, 382, 590, 382);

        //const texto5 = "Expedido el 08 de Junio del 2022" ;
        const months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];

        const d = new Date();
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(137, 34, 28);
        //const texto6 = "EXPEDIDO EL " + d.getDate() + " DE " + months[d.getMonth()] + " DEL " + d.getFullYear();
        const texto6 = "EXPEDIDO EL " + d.getDate() + " DE " + months[d.getMonth()] + " DEL " + d.getFullYear() + " A LAS " + d.getHours() + ":" + ('0'+d.getMinutes()).slice(-2) + ".";
        doc.text(texto6, 280, 400);    

        doc.setDrawColor(137, 34, 28);
        doc.setLineWidth(0.5);
        doc.line(250, 410, 590, 410);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150);
/*
        const texto7 = data[0].hash;
        doc.text(texto7,195, 480);            
        
        const texto8 = "Fuente de Información plataforma de accionistas Unacem"
        doc.text(texto8, 195, 490);            

        const texto9 = "https://main.d1uap272r7bnzf.amplifyapp.com/"
        doc.text(texto9, 195, 500);            
*/

        
        const texto7 = "Fuente de Información Plataforma de Accionistas Unacem"
        doc.text(texto7,195, 460);            
        
        const texto8 = "https://main.d1uap272r7bnzf.amplifyapp.com/"
        doc.text(texto8, 195, 470);            

        const texto9 = "El código QR lo direccionará a la página de verificación";
        doc.text(texto9, 195, 490);            

        //const texto10 = "prueba";
        //const texto10 = data[0].hash;
        //doc.text(texto10, 195, 500);            



//        doc.autoTable(content);

/*
        doc.addPage("A4","l");
        doc.text("Total accionistas :     " + totalAccionistas.toString(), marginLeft, 50);
        doc.text("Total acciones    :     " + num.toString(), marginLeft, 80);
*/    
    
        doc.save("CertificadoAccionistas.pdf")

        //const pdf = new File([doc.output("blob")], "filename.pdf", {  type: "pdf" }),
        //data = new FormData();      
        //data.append("file", pdf);        
        
      }
    
      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }


    const exportPDFCartaCesion = async() => {

      const unit = "pt";
      const size = "A4"; // Use A1, A2, A3 or A4
      const orientation = "portrait"; // portrait or landscape
      //const orientation = "landscape"; // portrait or landscape
  
      const marginLeft = 40;
      const doc = new jsPDF(orientation, unit, size);
  
      doc.setFontSize(12);
    
      const title = "CARTA DE CESIÓN DE ACCIONES" ;

      doc.setFont("helvetica", "bold");
      //doc.setTextColor(100);
      doc.setFontSize(12);
      doc.text(title, 200, 50);

      //doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const texto1 = "Comparecen     a     la     celebración       de      la      presente      cesión      de      acciones,       por      una      parte,";
      doc.text(texto1, 30, 80);            
      
      console.log("Cantidad de caracteres",accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length);
      let texto2 = accionista[0].nombre + " con " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ", denominado en adelante el CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 32) texto2 = accionista[0].nombre + "      con       " + accionista[0].tipoIdentificacion + "     " + accionista[0].identificacion + ",      denominado       en       adelante       el       CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 33) texto2 = accionista[0].nombre + "     con       " + accionista[0].tipoIdentificacion + "     " + accionista[0].identificacion + ",      denominado       en       adelante       el       CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 34) texto2 = accionista[0].nombre + "     con      " + accionista[0].tipoIdentificacion + "     " + accionista[0].identificacion + ",      denominado       en       adelante       el       CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 35) texto2 = accionista[0].nombre + "     con      " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",      denominado       en       adelante       el       CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 36) texto2 = accionista[0].nombre + "     con      " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",     denominado       en       adelante       el       CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 37) texto2 = accionista[0].nombre + "     con      " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",     denominado      en       adelante       el       CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 38) texto2 = accionista[0].nombre + "     con      " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",     denominado      en      adelante       el       CEDENTE";      
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 39) texto2 = accionista[0].nombre + "     con      " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",     denominado      en      adelante      el       CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 40) texto2 = accionista[0].nombre + "     con      " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",     denominado      en      adelante      el      CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 41) texto2 = accionista[0].nombre + "    con      " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",     denominado      en      adelante      el      CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 42) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",     denominado      en      adelante      el      CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 43) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",     denominado      en      adelante      el      CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 44) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",    denominado      en      adelante      el      CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 45) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",    denominado     en      adelante      el      CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 46) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",    denominado     en     adelante      el      CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 47) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",    denominado     en     adelante     el      CEDENTE";      
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 48) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",    denominado     en     adelante     el     CEDENTE"; //pivot
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 49) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",    denominado     en     adelante     el    CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 50) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",    denominado     en     adelante    el    CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 51) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",    denominado     en    adelante    el    CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 52) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",    denominado    en    adelante    el    CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 53) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",   denominado    en    adelante    el    CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 54) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + ",   denominado    en    adelante    el    CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 55) texto2 = accionista[0].nombre + "    con    " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + ",   denominado    en    adelante    el    CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 56) texto2 = accionista[0].nombre + "   con    " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + ",   denominado    en    adelante    el    CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 57) texto2 = accionista[0].nombre + "   con    " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + ",   denominado    en    adelante    el   CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 58) texto2 = accionista[0].nombre + "   con    " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + ",   denominado    en    adelante   el   CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 59) texto2 = accionista[0].nombre + "   con    " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + ",   denominado    en   adelante   el   CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 60) texto2 = accionista[0].nombre + "   con    " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + ",   denominado   en   adelante   el   CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 61) texto2 = accionista[0].nombre + "   con    " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + ",  denominado   en   adelante   el   CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 62) texto2 = accionista[0].nombre + "   con    " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ",  denominado   en   adelante   el   CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 63) texto2 = accionista[0].nombre + "   con   " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ",  denominado   en   adelante   el   CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 64) texto2 = accionista[0].nombre + "  con   " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ",  denominado   en   adelante   el   CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 65) texto2 = accionista[0].nombre + "  con   " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ",  denominado   en   adelante   el  CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 66) texto2 = accionista[0].nombre + "  con   " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ",  denominado   en   adelante  el  CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 67) texto2 = accionista[0].nombre + "  con   " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ",  denominado   en  adelante  el  CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 68) texto2 = accionista[0].nombre + "  con   " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ",  denominado  en  adelante  el  CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 69) texto2 = accionista[0].nombre + "  con   " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ", denominado  en  adelante  el  CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 70) texto2 = accionista[0].nombre + "  con  " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ", denominado  en  adelante  el  CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 71) texto2 = accionista[0].nombre + "  con " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ", denominado  en  adelante  el  CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 72) texto2 = accionista[0].nombre + " con " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ", denominado  en  adelante  el  CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 73) texto2 = accionista[0].nombre + " con " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ", denominado  en  adelante  el CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 74) texto2 = accionista[0].nombre + " con " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ", denominado  en  adelante el CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 75) texto2 = accionista[0].nombre + " con " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ", denominado  en adelante el CEDENTE";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 76) texto2 = accionista[0].nombre + " con " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ", denominado en adelante el CEDENTE";

      doc.text(texto2, 30, 100);            
    
      console.log("Nro2", nombreCesionario.length + identificacionCesionario.length);
      let texto3 = "y por otra parte " + nombreCesionario + " con identificación " + " " + identificacionCesionario + ", denominado";
      if(nombreCesionario.length + identificacionCesionario.length === 26) texto3 = "y         por         otra         parte         " + nombreCesionario + "         con         identificación         " + identificacionCesionario + ",         denominado";
      doc.text(texto3, 30, 120);    

      const texto4 = "en adelante el CESIONARIO, quienes libre y voluntariamente convienen en celebrar la presente cesión de acciones." ;
      doc.text(texto4, 30, 140);    

      const texto5 = "El CEDENTE  transfiere a título oneroso al CESIONARIO,  las acciones de la compañía  UNACEM ECUADOR S.A.," ;
      doc.text(texto5, 30, 180);    

      const texto6 = "con Ruc. No. 1790236862001, de la siguiente manera:" ;
      doc.text(texto6, 30, 200);    

      //doc.setDrawColor(137, 34, 28);
      doc.setLineWidth(0.5);
      doc.line(150, 230, 350, 230);

      const texto7 = "No. de Acciones : " + accionesTransferir;
      doc.text(texto7, 180, 250);    

      doc.setLineWidth(0.5);
      doc.line(150, 260, 350, 260);
      
      const texto8 = "Valor de Venta ($) : " + numberWithCommas(valorVenta);
      doc.text(texto8, 180, 280);    

      doc.setLineWidth(0.5);
      doc.line(150, 290, 350, 290);

      const texto9 = "Total ($): " + numberWithCommas(totalVenta.toFixed(2));
      doc.text(texto9, 180, 310);    

      doc.setLineWidth(0.5);
      doc.line(150, 320, 350, 320);

      const texto10 = "Particular que ponemos en conocimiento a la empresa UNACEM ECUADOR S.A., en persona de su representante" ;
      doc.text(texto10, 30, 350);    

      const texto11 = "legal,  a  fin  de  que,  de acuerdo con las disposiciones de la  Ley de Compañías,  se sirva ordenar el registro de la" ;
      doc.text(texto11, 30, 370);    

      const texto12 = "CESIÓN a favor del nuevo titular en el libro de acciones y accionistas de la compañía." ;
      doc.text(texto12, 30, 390);    

      const texto13 = "Para   dar   constancia   de   la   aceptación   de   esta   transferencia   suscribimos,    en    la    ciudad    de    Quito," ;
      doc.text(texto13, 30, 430);    


      const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const d = new Date();
      
      const texto14 = "el " + d.getDate() + " de " + months[d.getMonth()] + " del " + d.getFullYear() + ".";
      doc.text(texto14, 30, 450);    

      doc.setFont("helvetica", "bold");
      const texto15 = "CEDENTE" ;
      doc.text(texto15, 30, 510);    
      const texto16 = accionista[0].nombre ;
      doc.text(texto16, 30, 570);    
      const texto17 = accionista[0].tipoIdentificacion + " " + accionista[0].identificacion;
      doc.text(texto17, 30, 590);    

      const texto18 = "CESIONARIO" ;
      doc.text(texto18, 300, 510);    
      const texto19 = nombreCesionario ;
      doc.text(texto19, 300, 570);    
      const texto20 = "Cédula " + identificacionCesionario;
      doc.text(texto20, 300, 590);    


      doc.save("CartaCesion.pdf")

      
    }


    const exportPDFCartaCesionCasado = async() => {

      const unit = "pt";
      const size = "A4"; // Use A1, A2, A3 or A4
      const orientation = "portrait"; // portrait or landscape
      //const orientation = "landscape"; // portrait or landscape
  
      const marginLeft = 40;
      const doc = new jsPDF(orientation, unit, size);
  
      doc.setFontSize(12);
    
      const title = "CARTA DE CESIÓN DE ACCIONES" ;

      doc.setFont("helvetica", "bold");
      //doc.setTextColor(100);
      doc.setFontSize(12);
      doc.text(title, 200, 50);

      //doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const texto1 = "Comparecen     a     la     celebración       de      la      presente      cesión      de      acciones,       por      una      parte,";
      doc.text(texto1, 30, 80);            
      
      console.log("Cantidad de caracteres",accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length);
      let texto2 = accionista[0].nombre + " con " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + ",     legalmente    casado/a    con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 32) texto2 = accionista[0].nombre + "      con       " + accionista[0].tipoIdentificacion + "     " + accionista[0].identificacion + ",            legalmente             casado/a             con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 33) texto2 = accionista[0].nombre + "     con       " + accionista[0].tipoIdentificacion + "     " + accionista[0].identificacion + ",            legalmente             casado/a             con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 34) texto2 = accionista[0].nombre + "     con      " + accionista[0].tipoIdentificacion + "     " + accionista[0].identificacion + ",            legalmente             casado/a             con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 35) texto2 = accionista[0].nombre + "     con      " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",            legalmente             casado/a             con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 36) texto2 = accionista[0].nombre + "     con      " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",            legalmente             casado/a            con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 37) texto2 = accionista[0].nombre + "     con      " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",            legalmente            casado/a            con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 38) texto2 = accionista[0].nombre + "     con      " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",            legalmente            casado/a           con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 39) texto2 = accionista[0].nombre + "     con      " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",            legalmente           casado/a           con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 40) texto2 = accionista[0].nombre + "     con      " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",           legalmente           casado/a           con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 41) texto2 = accionista[0].nombre + "    con      " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",           legalmente           casado/a           con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 42) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "    " + accionista[0].identificacion + ",           legalmente           casado/a           con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 43) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",           legalmente           casado/a           con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 44) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",          legalmente           casado/a           con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 45) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",          legalmente           casado/a          con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 46) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",          legalmente          casado/a          con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 47) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + ",         legalmente          casado/a          con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 48) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + "         legalmente          casado/a          con"; //pivot
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 49) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + "         legalmente          casado/a         con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 50) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + "         legalmente         casado/a         con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 51) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + "        legalmente         casado/a         con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 52) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + "         legalmente        casado/a        con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 53) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "   " + accionista[0].identificacion + "        legalmente        casado/a        con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 54) texto2 = accionista[0].nombre + "    con     " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + "        legalmente        casado/a        con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 55) texto2 = accionista[0].nombre + "    con    " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + "        legalmente        casado/a        con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 56) texto2 = accionista[0].nombre + "   con    " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + "        legalmente        casado/a        con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 57) texto2 = accionista[0].nombre + "   con    " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + "       legalmente        casado/a        con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 58) texto2 = accionista[0].nombre + "   con    " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + "       legalmente        casado/a       con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 59) texto2 = accionista[0].nombre + "   con    " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + "       legalmente       casado/a       con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 60) texto2 = accionista[0].nombre + "   con    " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + "      legalmente       casado/a       con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 61) texto2 = accionista[0].nombre + "   con    " + accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion + "      legalmente       casado/a      con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 62) texto2 = accionista[0].nombre + "   con    " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "      legalmente       casado/a      con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 63) texto2 = accionista[0].nombre + "   con   " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "      legalmente       casado/a      con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 64) texto2 = accionista[0].nombre + "  con   " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "      legalmente       casado/a      con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 65) texto2 = accionista[0].nombre + "  con   " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "      legalmente      casado/a      con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 66) texto2 = accionista[0].nombre + "  con   " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "     legalmente      casado/a      con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 67) texto2 = accionista[0].nombre + "  con   " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "     legalmente      casado/a     con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 68) texto2 = accionista[0].nombre + "  con   " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "     legalmente     casado/a     con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 69) texto2 = accionista[0].nombre + "  con   " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "    legalmente     casado/a     con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 70) texto2 = accionista[0].nombre + "  con  " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "     legalmente     casado/a    con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 71) texto2 = accionista[0].nombre + "  con " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "    legalmente     casado/a     con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 72) texto2 = accionista[0].nombre + " con " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "    legalmente     casado/a     con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 73) texto2 = accionista[0].nombre + " con " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "    legalmente     casado/a    con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 74) texto2 = accionista[0].nombre + " con " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "    legalmente    casado/a    con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 75) texto2 = accionista[0].nombre + " con " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "   legalmente    casado/a    con";
      if(accionista[0].nombre.length + accionista[0].tipoIdentificacion.length + accionista[0].identificacion.length === 76) texto2 = accionista[0].nombre + " con " + accionista[0].tipoIdentificacion + " " + accionista[0].identificacion + "  legalmente    casado/a    con";

      let texto2y1 = accionista[0].conyugue_nombre + " con " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ", denominado en adelante el CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 32) texto2y1 = accionista[0].conyugue_nombre + "      con       " + accionista[0].conyugue_tipoIdentificacion + "     " + accionista[0].conyugue_identificacion + ",      denominado       en       adelante       el       CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 33) texto2y1 = accionista[0].conyugue_nombre + "     con       " + accionista[0].conyugue_tipoIdentificacion + "     " + accionista[0].conyugue_identificacion + ",      denominado       en       adelante       el       CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 34) texto2y1 = accionista[0].conyugue_nombre + "     con      " + accionista[0].conyugue_tipoIdentificacion + "     " + accionista[0].conyugue_identificacion + ",      denominado       en       adelante       el       CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 35) texto2y1 = accionista[0].conyugue_nombre + "     con      " + accionista[0].conyugue_tipoIdentificacion + "    " + accionista[0].conyugue_identificacion + ",      denominado       en       adelante       el       CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 36) texto2y1 = accionista[0].conyugue_nombre + "     con      " + accionista[0].conyugue_tipoIdentificacion + "    " + accionista[0].conyugue_identificacion + ",     denominado       en       adelante       el       CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 37) texto2y1 = accionista[0].conyugue_nombre + "     con      " + accionista[0].conyugue_tipoIdentificacion + "    " + accionista[0].conyugue_identificacion + ",     denominado      en       adelante       el       CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 38) texto2y1 = accionista[0].conyugue_nombre + "     con      " + accionista[0].conyugue_tipoIdentificacion + "    " + accionista[0].conyugue_identificacion + ",     denominado      en      adelante       el       CEDENTE";      
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 39) texto2y1 = accionista[0].conyugue_nombre + "     con      " + accionista[0].conyugue_tipoIdentificacion + "    " + accionista[0].conyugue_identificacion + ",     denominado      en      adelante      el       CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 40) texto2y1 = accionista[0].conyugue_nombre + "     con      " + accionista[0].conyugue_tipoIdentificacion + "    " + accionista[0].conyugue_identificacion + ",     denominado      en      adelante      el      CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 41) texto2y1 = accionista[0].conyugue_nombre + "    con      " + accionista[0].conyugue_tipoIdentificacion + "    " + accionista[0].conyugue_identificacion + ",     denominado      en      adelante      el      CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 42) texto2y1 = accionista[0].conyugue_nombre + "    con     " + accionista[0].conyugue_tipoIdentificacion + "    " + accionista[0].conyugue_identificacion + ",     denominado      en      adelante      el      CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 43) texto2y1 = accionista[0].conyugue_nombre + "    con     " + accionista[0].conyugue_tipoIdentificacion + "   " + accionista[0].conyugue_identificacion + ",     denominado      en      adelante      el      CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 44) texto2y1 = accionista[0].conyugue_nombre + "    con     " + accionista[0].conyugue_tipoIdentificacion + "   " + accionista[0].conyugue_identificacion + ",    denominado      en      adelante      el      CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 45) texto2y1 = accionista[0].conyugue_nombre + "    con     " + accionista[0].conyugue_tipoIdentificacion + "   " + accionista[0].conyugue_identificacion + ",    denominado     en      adelante      el      CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 46) texto2y1 = accionista[0].conyugue_nombre + "    con     " + accionista[0].conyugue_tipoIdentificacion + "   " + accionista[0].conyugue_identificacion + ",    denominado     en     adelante      el      CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 47) texto2y1 = accionista[0].conyugue_nombre + "    con     " + accionista[0].conyugue_tipoIdentificacion + "   " + accionista[0].conyugue_identificacion + ",    denominado     en     adelante     el      CEDENTE";      
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 48) texto2y1 = accionista[0].conyugue_nombre + "    con     " + accionista[0].conyugue_tipoIdentificacion + "   " + accionista[0].conyugue_identificacion + ",    denominado     en     adelante     el     CEDENTE"; //pivot
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 49) texto2y1 = accionista[0].conyugue_nombre + "    con     " + accionista[0].conyugue_tipoIdentificacion + "   " + accionista[0].conyugue_identificacion + ",    denominado     en     adelante     el    CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 50) texto2y1 = accionista[0].conyugue_nombre + "    con     " + accionista[0].conyugue_tipoIdentificacion + "   " + accionista[0].conyugue_identificacion + ",    denominado     en     adelante    el    CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 51) texto2y1 = accionista[0].conyugue_nombre + "    con     " + accionista[0].conyugue_tipoIdentificacion + "   " + accionista[0].conyugue_identificacion + ",    denominado     en    adelante    el    CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 52) texto2y1 = accionista[0].conyugue_nombre + "    con     " + accionista[0].conyugue_tipoIdentificacion + "   " + accionista[0].conyugue_identificacion + ",    denominado    en    adelante    el    CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 53) texto2y1 = accionista[0].conyugue_nombre + "    con     " + accionista[0].conyugue_tipoIdentificacion + "   " + accionista[0].conyugue_identificacion + ",   denominado    en    adelante    el    CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 54) texto2y1 = accionista[0].conyugue_nombre + "    con     " + accionista[0].conyugue_tipoIdentificacion + "  " + accionista[0].conyugue_identificacion + ",   denominado    en    adelante    el    CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 55) texto2y1 = accionista[0].conyugue_nombre + "    con    " + accionista[0].conyugue_tipoIdentificacion + "  " + accionista[0].conyugue_identificacion + ",   denominado    en    adelante    el    CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 56) texto2y1 = accionista[0].conyugue_nombre + "   con    " + accionista[0].conyugue_tipoIdentificacion + "  " + accionista[0].conyugue_identificacion + ",   denominado    en    adelante    el    CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 57) texto2y1 = accionista[0].conyugue_nombre + "   con    " + accionista[0].conyugue_tipoIdentificacion + "  " + accionista[0].conyugue_identificacion + ",   denominado    en    adelante    el   CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 58) texto2y1 = accionista[0].conyugue_nombre + "   con    " + accionista[0].conyugue_tipoIdentificacion + "  " + accionista[0].conyugue_identificacion + ",   denominado    en    adelante   el   CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 59) texto2y1 = accionista[0].conyugue_nombre + "   con    " + accionista[0].conyugue_tipoIdentificacion + "  " + accionista[0].conyugue_identificacion + ",   denominado    en   adelante   el   CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 60) texto2y1 = accionista[0].conyugue_nombre + "   con    " + accionista[0].conyugue_tipoIdentificacion + "  " + accionista[0].conyugue_identificacion + ",   denominado   en   adelante   el   CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 61) texto2y1 = accionista[0].conyugue_nombre + "   con    " + accionista[0].conyugue_tipoIdentificacion + "  " + accionista[0].conyugue_identificacion + ",  denominado   en   adelante   el   CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 62) texto2y1 = accionista[0].conyugue_nombre + "   con    " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ",  denominado   en   adelante   el   CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 63) texto2y1 = accionista[0].conyugue_nombre + "   con   " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ",  denominado   en   adelante   el   CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 64) texto2y1 = accionista[0].conyugue_nombre + "  con   " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ",  denominado   en   adelante   el   CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 65) texto2y1 = accionista[0].conyugue_nombre + "  con   " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ",  denominado   en   adelante   el  CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 66) texto2y1 = accionista[0].conyugue_nombre + "  con   " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ",  denominado   en   adelante  el  CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 67) texto2y1 = accionista[0].conyugue_nombre + "  con   " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ",  denominado   en  adelante  el  CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 68) texto2y1 = accionista[0].conyugue_nombre + "  con   " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ",  denominado  en  adelante  el  CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 69) texto2y1 = accionista[0].conyugue_nombre + "  con   " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ", denominado  en  adelante  el  CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 70) texto2y1 = accionista[0].conyugue_nombre + "  con  " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ", denominado  en  adelante  el  CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 71) texto2y1 = accionista[0].conyugue_nombre + "  con " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ", denominado  en  adelante  el  CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 72) texto2y1 = accionista[0].conyugue_nombre + " con " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ", denominado  en  adelante  el  CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 73) texto2y1 = accionista[0].conyugue_nombre + " con " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ", denominado  en  adelante  el CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 74) texto2y1 = accionista[0].conyugue_nombre + " con " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ", denominado  en  adelante el CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 75) texto2y1 = accionista[0].conyugue_nombre + " con " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ", denominado  en adelante el CEDENTE";
      if(accionista[0].conyugue_nombre.length + accionista[0].conyugue_tipoIdentificacion.length + accionista[0].conyugue_identificacion.length === 76) texto2y1 = accionista[0].conyugue_nombre + " con " + accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion + ", denominado en adelante el CEDENTE";
  

      doc.text(texto2, 30, 100);            
      doc.text(texto2y1, 30, 120);            

      console.log("Nro2", nombreCesionario.length + identificacionCesionario.length);
      let texto3 = "y por otra parte " + nombreCesionario + " con identificación " + " " + identificacionCesionario + ", denominado";
      if(nombreCesionario.length + identificacionCesionario.length === 26) texto3 = "y         por         otra         parte         " + nombreCesionario + "         con         identificación         " + identificacionCesionario + ",         denominado";
      doc.text(texto3, 30, 140);    

      const texto4 = "en adelante el CESIONARIO, quienes libre y voluntariamente convienen en celebrar la presente cesión de acciones." ;
      doc.text(texto4, 30, 160);    

      const texto5 = "El CEDENTE  transfiere a título oneroso al CESIONARIO,  las acciones de la compañía  UNACEM ECUADOR S.A.," ;
      doc.text(texto5, 30, 200);    

      const texto6 = "con Ruc. No. 1790236862001, de la siguiente manera:" ;
      doc.text(texto6, 30, 220);    

      //doc.setDrawColor(137, 34, 28);
      doc.setLineWidth(0.5);
      doc.line(150, 250, 350, 250);

      const texto7 = "No. de Acciones : " + accionesTransferir;
      doc.text(texto7, 180, 270);    

      doc.setLineWidth(0.5);
      doc.line(150, 280, 350, 280);
      
      const texto8 = "Valor de Venta ($) : " + numberWithCommas(valorVenta);
      doc.text(texto8, 180, 300);    

      doc.setLineWidth(0.5);
      doc.line(150, 310, 350, 310);

      const texto9 = "Total ($): " + numberWithCommas(totalVenta.toFixed(2));
      doc.text(texto9, 180, 330);    

      doc.setLineWidth(0.5);
      doc.line(150, 340, 350, 340);

      const texto10 = "Particular que ponemos en conocimiento a la empresa UNACEM ECUADOR S.A., en persona de su representante" ;
      doc.text(texto10, 30, 370);    

      const texto11 = "legal,  a  fin  de  que,  de acuerdo con las disposiciones de la  Ley de Compañías,  se sirva ordenar el registro de la" ;
      doc.text(texto11, 30, 390);    

      const texto12 = "CESIÓN a favor del nuevo titular en el libro de acciones y accionistas de la compañía." ;
      doc.text(texto12, 30, 410);    

      const texto13 = "Para   dar   constancia   de   la   aceptación   de   esta   transferencia   suscribimos,    en    la    ciudad    de    Quito," ;
      doc.text(texto13, 30, 450);    


      const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const d = new Date();
      
      const texto14 = "el " + d.getDate() + " de " + months[d.getMonth()] + " del " + d.getFullYear() + ".";
      doc.text(texto14, 30, 470);    

      doc.setFont("helvetica", "bold");
      const texto15 = "CEDENTE" ;
      doc.text(texto15, 30, 530);    
      const texto16 = accionista[0].nombre ;
      doc.text(texto16, 30, 590);    
      const texto17 = accionista[0].tipoIdentificacion + " " + accionista[0].identificacion;
      doc.text(texto17, 30, 610);    

      const texto18 = "CESIONARIO" ;
      doc.text(texto18, 300, 530);    
      const texto19 = nombreCesionario ;
      doc.text(texto19, 300, 590);    
      const texto20 = "Cédula " + identificacionCesionario;
      doc.text(texto20, 300, 610);    


      const texto16y1 = accionista[0].conyugue_nombre ;
      doc.text(texto16y1, 30, 680);    
      const texto17y1 = accionista[0].conyugue_tipoIdentificacion + " " + accionista[0].conyugue_identificacion;
      doc.text(texto17y1, 30, 700);    


      doc.save("CartaCesionCasado.pdf")

      
    }



    const exportPDFCartaGerente = async() => {

      const unit = "pt";
      const size = "A4"; // Use A1, A2, A3 or A4
      const orientation = "portrait"; // portrait or landscape
      //const orientation = "landscape"; // portrait or landscape
  
      const marginLeft = 40;
      const doc = new jsPDF(orientation, unit, size);
  
      const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const d = new Date();


      //doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const texto1 = "Quito, " + d.getDate() + " de " + months[d.getMonth()] + " del " + d.getFullYear() + ".";
      doc.text(texto1, 30, 80);            

      const texto2 = "Señor";
      doc.text(texto2, 30, 100);            
    
      const texto3 = "José Antonio Correa Vásconez";
      doc.text(texto3, 30, 120);    

      doc.setFont("helvetica", "bold");
      const texto4 = "Gerente General" ;
      doc.text(texto4, 30, 140);    

      const texto5 = "UNACEM ECUADOR S.A." ;
      doc.text(texto5, 30, 160);    

      doc.setFont("helvetica", "normal");
      const texto6 = "Presente. -" ;
      doc.text(texto6, 30, 180);    

      const texto6y1 = "De nuestra consideración:" ;
      doc.text(texto6y1, 30, 230);    

      const texto6y2 = "Por medio de la presente, ponemos en su conocimiento la trasferencia de acciones de la compañía" ;
      doc.text(texto6y2, 30, 270);    

      const texto6y3 = "UNACEM ECUADOR S.A., con Ruc. No. 1790236862001, que se efectuó de la siguiente manera:" ;
      doc.text(texto6y3, 30, 290);    


      //doc.setDrawColor(137, 34, 28);
      doc.setLineWidth(0.5);
      doc.line(150, 330, 350, 330);

      const texto7 = "No. de Acciones : " + accionesTransferir;
      doc.text(texto7, 180, 350);    

      doc.setLineWidth(0.5);
      doc.line(150, 360, 350, 360);

      const texto7y1 = "Tipo : Desmaterializados";
      doc.text(texto7y1, 180, 380);    

      doc.setLineWidth(0.5);
      doc.line(150, 390, 350, 390);

      const texto8 = "Valor de Venta ($) : " + numberWithCommas(valorVenta);
      doc.text(texto8, 180, 410);    

      doc.setLineWidth(0.5);
      doc.line(150, 420, 350, 420);

      const texto9 = "Total ($) : " + numberWithCommas(totalVenta.toFixed(2));
      doc.text(texto9, 180, 440);    

      doc.setLineWidth(0.5);
      doc.line(150, 450, 350, 450);

      const texto9y1 = "Fecha : " + d.getDate() + " de " + months[d.getMonth()] + " del " + d.getFullYear();
      doc.text(texto9y1, 180, 470);    

      doc.setLineWidth(0.5);
      doc.line(150, 480, 350, 480);



      const texto10 = "Particular que ponemos en conocimiento a fin de que, de acuerdo con las disposiciones de la Ley de Compañías," ;
      doc.text(texto10, 30, 520);    

      const texto11 = "Ustedes se sirvan ordenar el registro de la Cesión a favor del nuevo Titular en el libro de acciones y accionistas" ;
      doc.text(texto11, 30, 540);    

      const texto12 = " de la Compañía." ;
      doc.text(texto12, 30, 560);    


      const texto13 = "Por la atención que se digne dar al presente, anticipo mi agradecimiento." ;
      doc.text(texto13, 30, 600);    
      
      const texto14 = "Atentamente,";
      doc.text(texto14, 30, 620);    

      doc.setFont("helvetica", "bold");
      const texto15 = "CEDENTE" ;
      doc.text(texto15, 30, 650);    
      const texto16 = accionista[0].nombre ;
      doc.text(texto16, 30, 710);    
      const texto17 = accionista[0].tipoIdentificacion + "  " + accionista[0].identificacion;
      doc.text(texto17, 30, 730);    

      const texto18 = "CESIONARIO" ;
      doc.text(texto18, 300, 650);    
      const texto19 = nombreCesionario ;
      doc.text(texto19, 300, 710);    
      const texto20 = "Cédula " + identificacionCesionario;
      doc.text(texto20, 300, 730);    


      doc.save("CartaGerente.pdf")

      
    }
    
    const exportPDFInstruccionesPago = async() => {

      const unit = "pt";
      const size = "A4"; // Use A1, A2, A3 or A4
      const orientation = "portrait"; // portrait or landscape
      //const orientation = "landscape"; // portrait or landscape
  
      const marginLeft = 40;
      const doc = new jsPDF(orientation, unit, size);
  
      const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const d = new Date();


      //doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const texto1 = "Quito, " + d.getDate() + " de " + months[d.getMonth()] + " del " + d.getFullYear() + ".";
      doc.text(texto1, 30, 80);            

      const texto2 = "Señor/a/es";
      doc.text(texto2, 30, 120);            
    
      const texto3 = "UNACEM ECUADOR S.A.";
      doc.text(texto3, 30, 140);    

      const texto3y1 = "Presente. -" ;
      doc.text(texto3y1, 30, 160);   

      const texto4 = "De mi consideración:" ;
      doc.text(texto4, 30, 180);    

      const texto5 = "Por medio de la presente, bajo mi responsabilidad, solicito que la acreditación de los valores correspondientes a la venta" ;
      doc.text(texto5, 30, 200);    

      const texto6 = "de las acciones de mi propiedad de la empresa UNACEM ECUADOR S.A., sea realizada a la siguiente cuenta bancaria:" ;
      doc.text(texto6, 30, 220);    

      const texto6y1 = "DATOS BANCARIOS" ;
      doc.text(texto6y1, 30, 260);    

      const texto6y2 = "- Banco : " + (accionista[0].nombreBanco == null ? " " : accionista[0].nombreBanco) ;
      doc.text(texto6y2, 60, 280);    

      const texto6y3 = "- Tipo de Cuenta : " + (accionista[0].tipoCuenta == null ? " " : accionista[0].tipoCuenta) ;
      doc.text(texto6y3, 60, 300);    

      const texto7 = "- Número de Cuenta : " + (accionista[0].cuentaBancaria == null ? " " : accionista[0].cuentaBancaria) ;
      doc.text(texto7, 60, 320);    


      const texto7y1 = "INFORMACION GENERAL";
      doc.text(texto7y1, 30, 360);    

      const texto8 = "- Nombre Completo : " + accionista[0].nombre;
      doc.text(texto8, 60, 380);    

      const texto9 = "- Número de Cédula : " + accionista[0].identificacion;
      doc.text(texto9, 60, 400);    

      const texto9y1 = "- Correo electrónico : " + accionista[0].email1 ;
      doc.text(texto9y1, 60, 420);    

      const texto10 = "- Dirección de Domicilio : " + accionista[0].direccionCalle + " " + accionista[0].direccionNumero ;
      doc.text(texto10, 60, 440);    

      const texto10y1 = "- Ciudad : " + accionista[0].direccionCiudad ;
      doc.text(texto10y1, 60, 460);    

      const texto10y2 = "- Provincia : " + accionista[0].direccionProvincia ;
      doc.text(texto10y2, 60, 480);    

      const texto11 = "- Número de Celular : " + accionista[0].telefono1 ;
      doc.text(texto11, 60, 500);    

      const texto11y1 = "- Teléfono Convencional : " + accionista[0].telefono2 ;
      doc.text(texto11y1, 60, 520);    

      const texto12 = "Adjunto copia del certificado bancario." ;
      doc.text(texto12, 30, 560);    

      const texto13 = "Por la atención que brinden a la presente, les anticipo mi agradecimiento." ;
      doc.text(texto13, 30, 600);    
      
      const texto14 = "Atentamente,";
      doc.text(texto14, 30, 640);    

      doc.setLineWidth(0.5);
      doc.line(30, 700, 300, 700);

      doc.setFont("helvetica", "bold");
      const texto16 = accionista[0].nombre ;
      doc.text(texto16, 30, 710);    
      const texto17 = "ACCIONISTA";
      doc.text(texto17, 30, 730);    

      doc.save("InstruccionesPago.pdf")

      
    }

    const addAccionista = async () => {
      try {
          
          //idAsamblea.stopPropagation();
          //console.log("Nro Asamblea",asambleaSeleccionada.id);
          
          //if (!valCedente ) return
  
          const accionista2 =  { asambleaID:asambleaSeleccionada.id, accionistaID: accionista[0].id, nombre: accionista[0].nombre, identificacion: accionista[0].identificacion, acciones: accionista[0].cantidadAcciones, estado: accionista[0].estado, presente: 'false', representanteNombre: nombreRepresentante, representanteDocumento: identificacionRepresentante, representanteDI: IDRepresentante.filename, 
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

          if (rows[0].NombreRep)        
          {
            //console.log("ENTRA AL UPDATE",rows[0].NombreRep)
            updatePresencia = API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: rows[0].IdAccionistarxJunta,
              representanteNombre: nombreRepresentante,
              representanteDocumento: identificacionRepresentante, 
              representanteDI: IDRepresentante.filename, 
              } } });       
              window.location.reload();

              //setRefrescar(!refrescar);
              //setNombreRepresentante('Cambiaaaaa');
          }
          else
          {
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
          
          const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, registrados: asambleaSeleccionada.registrados + 1} } });
          
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
          const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();
        
          const solicitud =  { 
          fecha:fecha, 
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


    const consultarHashAccionista = async() => {
      try{

        const miInit = { // OPTIONAL
          queryStringParameters: {  // OPTIONAL
            id : accionista[0].id,
          },
      };

        console.log("Data API Parameter", miInit);
        //const data = await API.get('LibroApiQLDB','/registro',miInit )
        const data = await API.get('apiQLDBprod','/crearRegistro-prod',miInit )
        console.log("Data API", data[0].hash);
        setHash(data[0].hash)

      }catch (err){
          console.log('error', err)
      }

    }


    async function fetchSolicitudes() {

      const filter = {
        estado: {
          ne: 'Cerrada'
        },
        idCedente:{
          eq: accionista[0].id
        },
      }      
      const apiData = await API.graphql({ query: listSolicitudes, variables: { filter: filter, limit: 1000} });
      const solicitudesFromAPI = apiData.data.listSolicitudes.items;

      setSolicitudes(solicitudesFromAPI);
           
    }


    const getModeloCartaCesion = e => {
      e.stopPropagation();
console.log("carta cesion",modeloCartaCesion)                ;
      Storage.get(modeloCartaCesion)
        .then(url => {
          var myRequest = new Request(url);
          fetch(myRequest).then(function(response) {
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
          fetch(myRequest).then(function(response) {
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
          fetch(myRequest).then(function(response) {
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
            <Card variant="outlined" style={{height:"110px"}}>
                <CardContent>
                    <Typography variant="body2" style={{ fontWeight: 600 }}>
                    {accionista.length > 0 && accionista[0].nombre}
                    </Typography>
                    <Typography variant="body2">
                        <small>{accionista.length > 0 && accionista[0].tipoIdentificacion + " : " + accionista[0].identificacion}</small>                        
                    </Typography>                    
                    <Button startIcon={<PrintIcon />} size="small" variant="contained"  color="primary" style={{textTransform: 'none', height: '22px', marginTop:'15px'}} onClick={exportPDFCertificado}><small>Imprimir Certificado de Acciones</small></Button>

                </CardContent>
            </Card>              
          </Grid>

          <Grid item xs={12} sm={2}>
            <Card variant="outlined" style={{height:"110px"}}>
                <CardContent>
                    <Typography variant="body2">
                        Acciones
                    </Typography>
                    <Typography variant="h5" component="div">
                        {accionista.length > 0 && numberWithCommas(accionista[0].cantidadAcciones)}
                    </Typography>
                    
                    <QRcode hidden value = {'https://production.dnyw5qmklx2h.amplifyapp.com/?id='+ userName} id = 'qrcode' size={75}/>
                </CardContent>
            </Card>              
          </Grid>

          <Grid item xs={12} sm={2}>
            <Card variant="outlined" style={{height:"110px"}}>
                <CardContent>
                    <Typography variant="body2" >
                        Capital (USD)
                    </Typography>
                    <Typography variant="h5" component="div">
                    {accionista.length > 0 && numberWithCommas((accionista[0].cantidadAcciones * valorNominal).toFixed(2))}
                    </Typography>
                </CardContent>
            </Card>              
          </Grid>

          <Grid item xs={12} sm={2}>
            <Card variant="outlined" style={{height:"110px"}}>
                <CardContent>
                    <Typography variant="body2">
                        Participación (%)
                    </Typography>
                    <Typography variant="h5" component="div">
                    {accionista.length > 0 && (accionista[0].cantidadAcciones * 100 / cantidadEmitido).toFixed(8)}
                    </Typography>
                </CardContent>
            </Card>              
          </Grid>


          <Grid item xs={12} sm={2}>
            <Card variant="outlined" style={{height:"110px"}}>
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
                    style={{backgroundColor:'white'}}
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
                    style={{backgroundColor:'white'}}
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
                    style={{backgroundColor:'white'}}
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



          <Grid item xs={12} sm={12}>

          <Card variant="outlined">
                <CardContent>
                    <Typography variant="body2" style={{ fontWeight: 600 }}>
                        Listado de Accionistas
                    </Typography>
          <DataGrid
            style={{backgroundColor:'white'}}
            //sortModel={ [{field: 'cantidadAcciones', sort: 'desc',}]}
            density="compact"             
            autoHeight='true'
            autoPageSize='true'
            disableColumnMenu 
            components={{ Toolbar:  QuickSearchToolbar}}
            rows={rowsAccionistas}
            columns={columnsAccionistas}
            pageSize={20}
            rowsPerPageOptions={[20]}
            componentsProps={{
                toolbar: {
                  value: searchText,
                  onChange: (event) => requestSearch(event.target.value),
                  clearSearch: () => requestSearch(''),
                },
              }}
          />
                </CardContent>
            </Card>              
            </Grid>

          <Dialog open={openRegistroAsamblea} onClose={handleCloseRegistroAsamblea} aria-labelledby="form-dialog-title"    >          
            <DialogTitle id="form-dialog-title">Registro en Asamblea</DialogTitle>
            <DialogContent style={{height: '200px'}}>
  
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
                    style={{width: '300px', marginTop:7}}
              /> 
              <TextField
                    id="outlined-required"
                    label={<small>Identificación</small>}
                    value={identificacionRepresentante}
                    onChange={handleChangeIdentificacionRepresentante}
                    size='small'
                    variant="outlined"
                    style={{width: '200px',marginTop:7}}
              /> 

                <label htmlFor="upload-photo101">
                    <input style={{ display: 'none' }} id="upload-photo101" name="upload-photo101" type="file" onChange={onChangeHabilitante1} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',marginTop:7}}>Identificación delegado</Button>                    
                     
                </label>

            </DialogContent>
            <DialogActions style={{display:'flex', flexDirection:'row', alignItems:'flex-end', justifyContent:'flex-end', width:'100%' }}>            
                        

             <Button onClick={ addAccionista } variant="contained" color="primary" style={{textTransform: 'none'}}>
                Registrarse
              </Button>

              <Button onClick={handleCloseRegistroAsamblea} color="primary" style={{textTransform: 'none'}}>
                Salir
              </Button>
            

            </DialogActions>
          </Dialog>



          <Dialog open={openTransferencia} onClose={handleCloseTransferencia} aria-labelledby="form-dialog-title"    >          
            <DialogTitle id="form-dialog-title">Solicitar Transferencia de Acciones              
            </DialogTitle>       
            
            <DialogContent style={{height: '400px'}}>
              <div style={{display:'flex', flexDirection:'column'}}>                       
                <div style={{display:'flex', flexDirection:'row'}}>                       
                  <TextField
                      id="outlined-required"
                      label={<small>Cantidad de Acciones</small>}
                      value={accionesTransferir}
                      onChange={handleChangeAccionesTransferir}
                      size='small'
                      variant="outlined"
                      style={{width: '180px',marginTop:0, marginBottom:10}}
                      helperText={accionista.length>0 ? "Saldo de acciones : " + numberWithCommas(accionista[0].cantidadAcciones - accionesTransferir) : ""} 
                  />  
                  <TextField
                      id="outlined-required"
                      label={<small>Valor de Venta ($)</small>}
                      value={valorVenta}
                      onChange={handleChangevalorVenta}
                      size='small'
                      variant="outlined"
                      style={{width: '150px',marginTop:0, marginBottom:10}}
                      helperText={accionista.length>0 ? "Total Venta ($) : " + numberWithCommas((valorVenta * accionesTransferir).toFixed(2)) : ""} 
                  />                    
                </div>
                <Typography variant="body2">Cesionario</Typography>
                <div>
                  <TextField
                    id="outlined-required"
                    label={<small>Nombre Completo</small>}
                    value={nombreCesionario}
                    onChange={handleChangeNombreCesionario}
                    size='small'
                    variant="outlined"
                    style={{width: '300px', marginTop:7}}
                  /> 
                  <TextField
                    id="outlined-required"
                    label={<small># Identificación</small>}
                    value={identificacionCesionario}
                    onChange={handleChangeIdentificacionCesionario}
                    size='small'
                    variant="outlined"
                    style={{width: '200px',marginTop:7}}
                  /> 
                </div>


              </div>    

              <div style={{display:'flex', flexDirection:'column', marginTop:25}}>     
              <Typography variant="body2">Generar Modelos de Cartas</Typography> 
              <div style={{display:'flex', flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', width:'100%' }}  >
                                                                                   
              {accionista.length > 0 && <Button startIcon={<CloudDownloadIcon />} variant='contained' component="span" color="secondary" size='small' style={{textTransform: 'none',marginLeft:0}} onClick={accionista[0].pn_estadoCivil === "Casado" ? exportPDFCartaCesionCasado : exportPDFCartaCesion}>Carta de Cesión</Button>}
              <Button startIcon={<CloudDownloadIcon />} variant='contained' component="span" color="secondary" size='small' style={{textTransform: 'none',marginLeft:0}} onClick={exportPDFCartaGerente}>Carta de Gerente</Button>                                                                     
              <Button startIcon={<CloudDownloadIcon />} variant='contained' component="span" color="secondary" size='small' style={{textTransform: 'none',marginLeft:0}} onClick={exportPDFInstruccionesPago}>Instrucciones de Pago</Button>                                                                     
              </div>
              </div>    


              <div style={{display:'flex', flexDirection:'column', marginTop:25}}>     


                <Typography variant="body2">Adjuntar Documentos</Typography>
                <label htmlFor="upload-photo101">
                    <input style={{ display: 'none' }} id="upload-photo101" name="upload-photo101" type="file" onChange={onChangeDocIdentificacion} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',marginTop:7}}>Identificación Cesionario y Cedente</Button>                                         
                </label>
                <label htmlFor="upload-photo101">
                    <input style={{ display: 'none' }} id="upload-photo101" name="upload-photo101" type="file" onChange={onChangeCartaCesion} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',marginTop:7}}>Carta de Cesión y Carta Gerente</Button>                                         
                </label>
                <label htmlFor="upload-photo101">
                    <input style={{ display: 'none' }} id="upload-photo101" name="upload-photo101" type="file" onChange={onChangeCartaInstrucciones} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',marginTop:7}}>Carta de Instrucciones y Certificado Bancario</Button>                                         
                </label>
                </div>
            </DialogContent>
            <DialogActions style={{display:'flex', flexDirection:'row', alignItems:'flex-end', justifyContent:'flex-end', width:'100%' }}>            
                        
             <Button onClick={ addSolicitud } variant="contained" color="primary" style={{textTransform: 'none'}}
             disabled={accionesTransferir > 0 && nombreCesionario != '' && identificacionCesionario != '' ? false : true}
             >
                Solicitar
              </Button>            
              <Button onClick={handleCloseTransferencia} color="primary" style={{textTransform: 'none'}}>
                Salir
              </Button>
            

            </DialogActions>
          </Dialog>



      <Snackbar message="Hola" open={openSnack} autoHideDuration={15000} onClose={handleCloseSnack} anchorOrigin={{vertical: 'top',horizontal: 'center'}}>
        <Alert onClose={handleCloseSnack} icon={false} severity="info" className={classes.myAlert} >
          <Box
            component="img"
            sx={{
              height: 550,
              width: 550,
              maxHeight: { xs: 330, md: 550 },
              maxWidth: { xs: 350, md: 550 },
            }}
            src={bienvenida}
          />
        </Alert>
      </Snackbar>

      </Grid>
    </main>
  );  

}