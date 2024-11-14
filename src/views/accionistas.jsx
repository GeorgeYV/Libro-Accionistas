import React, { useState, useEffect } from 'react';
import { API,Storage } from 'aws-amplify';
import { makeStyles } from '@material-ui/core/styles';
import { createTheme } from '@material-ui/core/styles';
import { Link } from "react-router-dom";
import { listAccionistas, listTitulos, listOperaciones,getParametro, listHerederos } from '../graphql/queries';

import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';

import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

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

//import GridViewIcon from '@material-ui/icons/GridView';
import BorderAllIcon from '@material-ui/icons/BorderAll';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';

import Grid from '@material-ui/core/Grid';

import { Typography,  Button, ListItem, ListItemText, ListSubheader, List, Tooltip, Chip, 
  FormControl, RadioGroup, FormControlLabel, Radio, Box, Tabs, Tab,
  Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle, ListItemIcon,} from '@material-ui/core';

import logo from './../images/UnderConstruction.gif';
import { styled } from '@material-ui//styles';
import { ConsoleLogger } from '@aws-amplify/core';

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
      appBarSpacer: {
        ...theme.mixins.toolbar,
      },
      content: {
        flexGrow: 1,
        padding: theme.spacing(2),        
      },
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



        <GridToolbarContainer>
          <GridToolbarExport />
        </GridToolbarContainer>
      </div>
      
    );
  }


  function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  
  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };
  
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  


  export default function Accionistas() {

    const [consultaDetallada, setConsultaDetallada] = useState(false);

    const [cantidadEmitido, setCantidadEmitido] = useState(1);
    const [openTitulos, setOpenTitulos] = useState(false);
    const handleClose = () => setOpenTitulos(false);
    
    const [estado, setEstado] = useState('Activo');

    function getParticipacion(params) {
      return `${(params.getValue(params.id, 'cantidadAcciones') * 100 / cantidadEmitido).toFixed(8) || ''} `;
    }

    let columns = []
    if(consultaDetallada){
      columns = [
        { 
          field: 'secuencial' , 
          headerName: 'Nro', 
          type: 'number',
          width: 50,
          //filterable: false,        
          //renderCell:(index) => index.api.getRowIndex(index.row.id) + 1
        },   
        {  field: 'tipoIdentificacion', headerName: 'Tipo Id', width: 100,},
        {
          field: 'identificacion',
          headerName: 'Identificacion',
          width: 100,
        },
        {
          field: 'decevale',
          headerName: 'Decevale',
          width: 100,
        },    

        {
          field: 'nombre2',
          headerName: 'Nombre',
          width: 250,
        },

        //{  field: 'nombre', headerName: 'Nombre', width: 100,},
        {  field: 'direccionCalle', headerName: 'Calle', width: 100,},
        {  field: 'direccionNumero', headerName: 'Numero', width: 100,},
        {  field: 'nombreBanco', headerName: 'Banco', width: 100,},
        {  field: 'tipoCuenta', headerName: 'Tipo Cta', width: 100,},
        {  field: 'cuentaBancaria', headerName: 'Cuenta', width: 100,},
        {  field: 'paisNacionalidad', headerName: 'Nacionalidad', width: 100,},
        {  field: 'cantidadAcciones', headerName: 'Acciones', width: 100, align: "right",},
        {  field: 'participacion', headerName: 'Participacion', width: 100,type: 'number',valueGetter: getParticipacion,},
        {  field: 'tipoAcciones', headerName: 'Tipo Acciones', width: 100,},
        {  field: 'pn_estadoCivil', headerName: 'E. Civil', width: 100,},
        {  field: 'telefono1', headerName: 'Telef 1', width: 100,},
        {  field: 'obs1', headerName: 'Obs Tel 1', width: 100,},
        {  field: 'telefono2', headerName: 'Telef 2', width: 100,},
        {  field: 'obs2', headerName: 'Obs Tel 2', width: 100,},
        {  field: 'telefono3', headerName: 'Telef 3', width: 100,},
        {  field: 'obs3', headerName: 'Obs Tel 1', width: 100,},
        {  field: 'email1', headerName: 'Email1', width: 100,},
        {  field: 'email2', headerName: 'Email2', width: 100,},
        {  field: 'email3', headerName: 'Email3', width: 100,},
        {  field: 'tipoPersona', headerName: 'Persona', width: 100,},
        {  field: 'repLegal_tipoIdentificacion', headerName: 'RL Tipo Id', width: 100,},
        {  field: 'repLegal_identificacion', headerName: 'RL Id', width: 100,},
        {  field: 'repLegal_nombre', headerName: 'RL Nombre', width: 100,},
        {  field: 'repLegal_nacionalidad', headerName: 'RL Nacionalidad', width: 100,},
        {  field: 'repLegal_telefono', headerName: 'RL Telef', width: 100,},
        {  field: 'repLegal_email', headerName: 'RL Email', width: 100,},
      ]

    }else{
    columns = [
      //{ field: 'id', headerName: 'Nro', width: 80, type: 'number',},
      { 
        field: 'secuencial' , 
        headerName: 'Nro', 
        type: 'number',
        width: 50,
        //filterable: false,        
        //renderCell:(index) => index.api.getRowIndex(index.row.id) + 1
      },      
      {
        field: 'identificacion',
        headerName: 'Identificacion',
        width: 120,
      },
      {
        field: 'decevale',
        headerName: 'Decevale',
        width: 90,
      },      
      {
        field: 'nombre2',
        headerName: 'Nombre',
        width: 250,
        flex: 1 ,
      },
      {
        field: 'paisNacionalidad',
        headerName: 'Nacionalidad',
        width: 110,
      },      
      {
        field: 'direccionPais',
        headerName: 'Residencia',
        width: 110,
      },            
      {
        field: 'cantidadAcciones',
        headerName: 'Acciones',
        //type: 'number',
        width: 100,
        align: "right",
      },             
      {
        field: 'participacion',
        headerName: 'Participación',
        type: 'number',
        width: 100,
        valueGetter: getParticipacion,
      },             
      {
        field: 'tipoAcciones',
        headerName: 'Tipo',
        width: 70,
        renderCell: (cellValues) => {
          return cellValues.row.tipoAcciones == "D" ? 
          <Tooltip title="Desmaterializadas" >
            <DevicesOutlinedIcon /> 
          </Tooltip>
          : 
          <Tooltip title="Ordinarias" >
          <DescriptionOutlinedIcon color='error'/> 
        </Tooltip>
        }
      },       
      {
        field: 'estado',
        headerName: 'Estado',
        width: 110,
        renderCell: (cellValues) => {
          return <Chip size="small" variant="outlined" label={cellValues.row.estado} color={cellValues.row.estado == 'Activo' ? 'primary' : 'secondary'} />
        }
      },      
      
      {
        field: "Info",
        width: 70,
        renderCell: (cellValues) => {
          //return <IconButton  disabled={cellValues.row.cantidadAcciones > 0 ? false : true} onClick={() =>  
          return <IconButton  onClick={() =>  
            //console.log('datos de accionista',cellValues.row )
            {
            fetchTitulos(cellValues.row);
            //fetchTitulosPorHeredar(cellValues.row);
            }
          } color='primary'><PageviewIcon /></IconButton>
        }
      },

      {
        field: "Edit",
        width: 80,
        renderCell: (cellValues) => {
          

          return <Link to={{
            pathname: cellValues.row.tipoPersona == "PN" ? "/personanatural" : "/personajuridica",
            state: {
              preloadedValue: cellValues.row,
            },
          }} >Editar</Link>;


        }
      },
/*
      {
        field: "Herederos",
        width: 100,
        renderCell: (cellValues) => {
          return cellValues.row.herederos ? 
          <Tooltip title="Tiene herederos" >

            <GroupOutlinedIcon /> 
          </Tooltip>
          : null
        }
      },
*/
        /*
        {
          field: "Operaciones",
          width: 180,
          renderCell: (cellValues) => {
            return <Link to={{
              pathname: "/transferencias",
              state: {
                accionistaId: cellValues.row.id,
              },
            }} >Cesión</Link>;
          }
        },*/
    ];
  }

    const [accionistas, setAccionistas] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [rows, setRows] = useState([]);
    //const [count, setCount] = useState(0);
    const [titulos, setTitulos] = useState([])
    const [titulosHerencia, setTitulosHerencia] = useState([])
    const [accionistaSeleccionado, setAccionistaSeleccionado]= useState({});
    const [operaciones, setOperaciones] = useState([]);

    const handleChange = (event) => {
      console.log("estado",event.target.value)
      setEstado(event.target.value);
      //fetchAccionistas(event.target.value);
    };
    
  


    useEffect(() => {

      fetchParametros();
      fetchAccionistas();
      

    }, [estado]);
   

    async function fetchParametros() {

      const apiData = await API.graphql({ query: getParametro , variables: { id: '1' } });

      const parametrosFromAPI = apiData.data.getParametro;    

      setCantidadEmitido(parametrosFromAPI.cantidadEmitida);
  }

    async function fetchAccionistas() {

      console.log("entro a buscar con estado",estado)

      const filter = {
        estado: {
          eq: estado
        },
      }      
      const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 1000} });
      const accionistasFromAPI = apiData.data.listAccionistas.items;

      console.log("accionistas",accionistasFromAPI)
      //await Promise.all(accionistasFromAPI.map(async accionista => {
      //return accionista;
      //}))

      //const accionistas = accionistasFromAPI.map( accionista => accionista)
      //accionistasFromAPI.map(obj=> ({ ...obj, nombre2 : obj.tipoPersona == 'PN' ? obj.pn_primerNombre + " " + obj.pn_segundoNombre + " " + obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno : obj.nombre }))

      let numero = 1;
      let nombre_aux = '';
      accionistasFromAPI.forEach(function (obj) {
        
        //obj.nombre2 = obj.tipoPersona == 'PN' ? obj.pn_primerNombre + " " + obj.pn_segundoNombre + " " + obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno : obj.nombre;
        nombre_aux = obj.tipoPersona == 'PN' ? obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno + " " + obj.pn_primerNombre + " " + obj.pn_segundoNombre : obj.nombre;
        obj.nombre2 = obj.herederos == true ? nombre_aux.toUpperCase() +  "  -  HEREDEROS" : nombre_aux.toUpperCase();
      });

      setAccionistas(accionistasFromAPI.sort(function (a, b) {
        if (a.nombre2 > b.nombre2) {
          return 1;
        }
        if (a.nombre2 < b.nombre2) {
          return -1;
        }
        // a must be equal to b
        return 0;
      }));

      accionistasFromAPI.forEach(function (obj) {
        
        obj.secuencial = numero++;
      });

      setRows(accionistasFromAPI);
      /*
      if(count === 0)
        {      
        setCount(1);
        setRows(accionistasFromAPI);
        }
*/        
        
        
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
        setRows(filteredRows);
      };

      async function fetchTitulos(row) {

        console.log('entro', row)

        let filter = {
          accionistaID: {
              eq: row.id // filter priority = 1
          },
          estado: {
            ne: 'Inactivo'
          }
        };
    
        const apiData = await API.graphql({ query: listTitulos, variables: { filter: filter, limit : 1000} });
        const titulosFromAPI = apiData.data.listTitulos.items;       
                
        setTitulos(titulosFromAPI);
        setAccionistaSeleccionado(row)

        let filterOper = {
          //idCedente: {
          //    eq: row.id 
          // }

          or: [{ idCedente: {eq:row.id} },
            { idCesionario: {eq:row.id}} ]

        };
        const apiDataOper = await API.graphql({ query: listOperaciones, variables: { filter: filterOper, limit : 1000} });
        const OperacionesFromAPI = apiDataOper.data.listOperaciones.items;  
        
        OperacionesFromAPI.sort(function (b, a) {
          if (new Date(+a.fecha.split("-")[2],a.fecha.split("-")[1] - 1, +a.fecha.split("-")[0]) > new Date(+b.fecha.split("-")[2],b.fecha.split("-")[1] - 1, +b.fecha.split("-")[0])) return 1;
          if (new Date(+a.fecha.split("-")[2],a.fecha.split("-")[1] - 1, +a.fecha.split("-")[0]) < new Date(+b.fecha.split("-")[2],b.fecha.split("-")[1] - 1, +b.fecha.split("-")[0])) return -1;
          return 0;
        });        

        setOperaciones(OperacionesFromAPI);

        setOpenTitulos(true)
        console.log('titulos', titulosFromAPI)

        //Historia, buscar por data.id
        const myInit = { // OPTIONAL
          queryStringParameters: {  // OPTIONAL
              identificacion: row.identificacion,
          },
        };

        console.log('Parametro',myInit);
        const historia = await API.get('LibroApiQLDB','/registro/otro',   myInit    );
        console.log('Historia',historia);

      }

      //async function fetchTitulosPorHeredar(row) {
      const fetchTitulosPorHeredar = async(row) => {  

        console.log('entro titulos por heredar', row)

        let filter = {
          accionistaHerederoId: {
              eq: row.id // filter priority = 1
          },
          estado: {
            eq: 'Pendiente'
          }
        };
    
        const apiData = await API.graphql({ query: listHerederos, variables: { filter: filter, limit : 1000} });
        const titulosHerenciaFromAPI = apiData.data.listHerederos.items;        
        setTitulosHerencia(titulosHerenciaFromAPI);
        console.log('titulos a heredar', titulosHerenciaFromAPI)

        //Buscar acciones en titulos del idCedente que esten bloqueados y que sumen la cantidad de herencia
        //Barrer listado


        //for (const tituloHerencia of titulosHerencia) {
          //const herederos = titulosHerencia.map(function(e) {
            
        const herederos = titulosHerenciaFromAPI.map(async(e) => {

          let filterTitulos = {
            accionistaID: {
                eq: e.idCedente // filter priority = 1
            },
            estado: {
              eq: 'Bloqueado' // o estado Herencia
            }
          };


          const apiDataTitulos =  await API.graphql({ query: listTitulos, variables: { filter: filterTitulos, limit : 1000} });
          const titulosFromAPI = apiDataTitulos.data.listTitulos.items;    

          let totalAccionesCedente = 0;
          titulosFromAPI.map(titulo => {totalAccionesCedente = totalAccionesCedente + titulo.acciones})


          if(totalAccionesCedente > 0 && totalAccionesCedente == e.cantidad){
            //show
            //const herederos = formHerederos.map(function(e) {
            //  return {numeroHeredero:  e.numeroHeredero, operacionId : operID.data.createOperaciones.id, herederoId: e.herederoId, nombre: e.nombre, cantidad: e.cantidad  }
            //})

            return {id: e.id, accionistaHerederoId: e.accionistaHerederoId.id, nombre: e.nombre, cantidad: e.cantidad, idCedente: e.idCedente, nombreCedente: e.nombreCedente, estado: 'Si'  }
          } else{
            //hide
            return {id: e.id, accionistaHerederoId: e.accionistaHerederoId.id, nombre: e.nombre, cantidad: e.cantidad, idCedente: e.idCedente, nombreCedente: e.nombreCedente, estado: 'No'  }
          }

          

        })
  

        console.log('Mostrar titulos a heredar', herederos)

    
    


/*
        let filterOper = {
          //idCedente: {
          //    eq: row.id 
          // }

          or: [{ idCedente: {eq:row.id} },
            { idCesionario: {eq:row.id}} ]

        };
        const apiDataOper = await API.graphql({ query: listOperaciones, variables: { filter: filterOper, limit : 1000} });
        const OperacionesFromAPI = apiDataOper.data.listOperaciones.items;        
        setOperaciones(OperacionesFromAPI);
        setOpenTitulos(true)
        console.log('titulos', titulosFromAPI)
*/

      }
      
      const [value, setValue] = useState(0);

      const handleChangeTab = (event, newValue) => {
        setValue(newValue);
      };


      const getPictureDI = e => {
        e.stopPropagation();
              
        Storage.get(accionistaSeleccionado.docIdentidadPrincipal)
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

      const getPicturePE = e => {
        e.stopPropagation();
              
        Storage.get(accionistaSeleccionado.docPosesionEfectiva)
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

      const get_PDF = (e) => {
        //e.stopPropagation();

        //console.log(e);
        
        Storage.get(e)
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
        <Grid item xs={12}>
          <FormControl component="fieldset" style={{display:'flex', alignItems:'flex-end'}}>
            <RadioGroup
              row
              aria-label="gender"
              name="controlled-radio-buttons-group"
              value={estado}
              onChange={handleChange}     

            >

            <FormControlLabel value="Activo" control={<Radio color="secondary" size="small" />} label={<span style={{ fontSize: '0.8rem' }}>Activos</span>} />
            <FormControlLabel value="Bloqueado" control={<Radio color="secondary" size="small" />} label={<span style={{ fontSize: '0.8rem' }}>Bloqueados</span>} />
            <FormControlLabel value="Inactivo" control={<Radio color="secondary" size="small" />} label={<span style={{ fontSize: '0.8rem' }}>Inactivos</span>} />

<IconButton color={consultaDetallada ? "default" : "primary"}  onClick={() => {setConsultaDetallada(false)} }>
  <BorderAllIcon/>
</IconButton>
<IconButton color={consultaDetallada ? "primary" : "default"}  onClick={() => {setConsultaDetallada(true)} }>
  <ViewColumnIcon/>
</IconButton>

            </RadioGroup>
          </FormControl>



          <DataGrid
            //getRowId= {(row) => row.code}
            style={{backgroundColor:'white'}}
            //sortModel={ [{field: 'cantidadAcciones', sort: 'desc',}]}
            density="compact"             
            autoHeight='true'
            autoPageSize='true'
            disableColumnMenu 
            components={{ Toolbar:  QuickSearchToolbar}}
            rows={rows}
            columns={columns}
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
        </Grid>


        <Dialog open={openTitulos} onClose={handleClose} aria-labelledby="form-dialog-title"  maxWidth = 'md'  >          
          <DialogTitle id="form-dialog-title">{accionistaSeleccionado.nombre2}</DialogTitle>
          <DialogContent style={{height: '400px'}}>


            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleChangeTab} aria-label="basic tabs example">
              <Tab label="Info" {...a11yProps(0)} />
              <Tab label="Documentos" {...a11yProps(1)} />
              <Tab label="Títulos" {...a11yProps(2)} />
              <Tab label="Operaciones" {...a11yProps(3)} />
              <Tab label="Historial" {...a11yProps(4)} />
              </Tabs>
            </Box>
            <TabPanel value={value} index={0}>

            <div style={{display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
              <div style={{marginRight:20}}>
                <Typography variant='caption' >
                  <strong>Tipo Identificación</strong>
                </Typography> 
                <Typography variant='body2'>
                  {accionistaSeleccionado.tipoIdentificacion}
                </Typography> 
              </div>
              <div>
                <Typography variant='caption'>
                  <strong>Identificación</strong>
                </Typography>             
                <Typography variant='body2'>
                  {accionistaSeleccionado.identificacion}
                </Typography> 
              </div>
            </div>

            <Typography variant='caption'>
              <strong>Nacionalidad</strong>
            </Typography> 
            <Typography variant='body2'>
              {accionistaSeleccionado.paisNacionalidad}
            </Typography> 
            <Typography variant='caption'>
              <strong>Dirección</strong>
            </Typography> 
            <Typography variant='body2'>
              {accionistaSeleccionado.direccionPais == null ? '-' : accionistaSeleccionado.direccionPais + ' ' + accionistaSeleccionado.direccionProvincia + ' ' + accionistaSeleccionado.direccionCiudad + ' ' + accionistaSeleccionado.direccionCalle + ' ' + accionistaSeleccionado.direccionNumero}
            </Typography> 
            <Typography variant='caption'>
              <strong>Cuenta Bancaria</strong>
            </Typography> 
            <Typography variant='body2'>
              {accionistaSeleccionado.nombreBanco == null ? '-' : accionistaSeleccionado.nombreBanco + ' ' + accionistaSeleccionado.tipoCuenta + ' ' + accionistaSeleccionado.cuentaBancaria}
            </Typography> 
            {accionistaSeleccionado.tipoPersona == 'PN' &&
            <div>            
              <Typography variant='caption'>
                <strong>Estado Civil</strong>
              </Typography> 
              <Typography variant='body2'>
                {accionistaSeleccionado.pn_estadoCivil == null ? '-' : accionistaSeleccionado.pn_estadoCivil}
              </Typography> 
            </div>
            }
            {accionistaSeleccionado.pn_estadoCivil == 'Casado' &&
            <div>
              <Typography variant='caption'>
                    <strong>Detalles Cónyugue</strong>
              </Typography> 
              <div style={{display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
                <div style={{marginRight:20}}>
                  <Typography variant='caption'>
                    <strong>Tipo Identificación</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.conyugue_tipoIdentificacion}
                  </Typography> 
                </div>
                <div style={{marginRight:20}}>            
                  <Typography variant='caption'>
                    <strong>Identificación</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.conyugue_identificacion}
                  </Typography> 
                </div>
                <div style={{marginRight:20}}>            
                  <Typography variant='caption'>
                    <strong>Nombre</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.conyugue_nombre}
                  </Typography> 
                </div>
                <div style={{marginRight:20}}>
                  <Typography variant='caption'>
                    <strong>Nacionalidad</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.conyugue_nacionalidad}
                  </Typography> 
                </div>
              </div>
            </div>
            }

            <div style={{display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
              <div style={{display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'center', marginRight:20}}>
                <div style={{marginRight:5}}>
                  <Typography variant='caption'>
                    <strong>Teléfono</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.telefono1 == null ? '-' : accionistaSeleccionado.telefono1}
                  </Typography>    
                </div>
                <div>
                  <Typography variant='caption'>
                    <strong>Observación</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.obs1 == null ? '-' : accionistaSeleccionado.obs1}
                  </Typography> 
                </div>
              </div>
              <div style={{display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'center', marginRight:20}}>
                <div style={{marginRight:5}}>
                  <Typography variant='caption'>
                    <strong>Teléfono</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.telefono2 == null ? '-' : accionistaSeleccionado.telefono2}
                  </Typography> 
                </div>
                <div>            
                  <Typography variant='caption'>
                    <strong>Observación</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.obs2 == null ? '-' : accionistaSeleccionado.obs2}
                  </Typography> 
                </div>
              </div>
              <div style={{display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'center', marginRight:20}}>
                <div style={{marginRight:5}}>
                  <Typography variant='caption'>
                    <strong>Teléfono</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.telefono3 == null ? '-' : accionistaSeleccionado.telefono3}
                  </Typography> 
                </div>
                <div>            
                  <Typography variant='caption'>
                    <strong>Observación</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.obs3 == null ? '-' : accionistaSeleccionado.obs3}
                  </Typography>
                </div>            
              </div>
            </div>

            <div style={{display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
              <div style={{marginRight:20}}>
                <Typography variant='caption'>
                  <strong>Email</strong>
                </Typography> 
                <Typography variant='body2'>
                  {accionistaSeleccionado.email1 == null ? '-' : accionistaSeleccionado.email1}
                </Typography> 
              </div>
              <div style={{marginRight:20}}>                    
                <Typography variant='caption'>
                  <strong>Email</strong>
                </Typography> 
                <Typography variant='body2'>
                  {accionistaSeleccionado.email2 == null ? '-' : accionistaSeleccionado.email2}
                </Typography> 
              </div>
              <div style={{marginRight:20}}>                    
                <Typography variant='caption'>
                  <strong>Email</strong>
                </Typography> 
                <Typography variant='body2'>
                  {accionistaSeleccionado.email3 == null ? '-' : accionistaSeleccionado.email3}
                </Typography> 
              </div>
            </div>

            {accionistaSeleccionado.tipoPersona == 'PJ' &&
            <div>
              <Typography variant='caption'>
                <strong>Detalles Representante Legal</strong>
              </Typography> 
              <div style={{display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'center', marginRight:20}}>
                <div style={{marginRight:20}}>
                  <Typography variant='caption'>
                    <strong>Tipo Identificación</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.repLegal_tipoIdentificacion == null ? '-' : accionistaSeleccionado.repLegal_tipoIdentificacion}
                  </Typography>
                </div>
                <div> 
                  <Typography variant='caption'>
                    <strong>Identificación</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.repLegal_identificacion == null ? '-' : accionistaSeleccionado.repLegal_identificacion}
                  </Typography> 
                </div>
              </div>

              <div style={{display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'center', marginRight:20}}>
                <div style={{marginRight:20}}>
                  <Typography variant='caption'>
                    <strong>Nombre</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.repLegal_nombre == null ? '-' : accionistaSeleccionado.repLegal_nombre}
                  </Typography> 
                </div>
                <div style={{marginRight:20}}> 
                  <Typography variant='caption'>
                    <strong>Nacionalidad</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.repLegal_nacionalidad == null ? '-' : accionistaSeleccionado.repLegal_nacionalidad}
                  </Typography> 
                </div>
                <div style={{marginRight:20}}> 
                  <Typography variant='caption'>
                    <strong>Teléfono</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.repLegal_telefono == null ? '-' : accionistaSeleccionado.repLegal_telefono}
                  </Typography> 
                </div>
                <div style={{marginRight:20}}> 
                  <Typography variant='caption'>
                    <strong>Email</strong>
                  </Typography> 
                  <Typography variant='body2'>
                    {accionistaSeleccionado.repLegal_email == null ? '-' : accionistaSeleccionado.repLegal_email}
                  </Typography> 
                </div>
              </div>
            </div>
            }

            </TabPanel>
            <TabPanel value={value} index={1}>

            <div>
              <Typography variant='caption'>
                <strong>Documento de Identidad</strong>
              </Typography> 
              {accionistaSeleccionado.docIdentidadPrincipal  && 
                <div>
                  <CheckIcon />
                  <Button component="span" color="primary" size='small' onClick={getPictureDI}>Ver</Button>
                </div>
              }
              {!accionistaSeleccionado.docIdentidadPrincipal  && 
                  <div>
                  -
                  </div>
              }
            </div>  
            <div>
              <Typography variant='caption'>
                <strong>Certificado Bancario</strong>
              </Typography> 
              {accionistaSeleccionado.docCertificadoBancario  && 
                <div>
                  <CheckIcon />
                  <Button component="span" color="primary" size='small' onClick={getPictureDI}>Ver</Button>
                </div>
              }
              {!accionistaSeleccionado.docCertificadoBancario  && 
                  <div>
                  -
                  </div>
              }
            </div>  


            <div>
              <Typography variant='caption'>
                <strong>Posesión Efectiva</strong>
              </Typography> 
              {accionistaSeleccionado.docPosesionEfectiva  && 
                <div>
                  <CheckIcon />
                  <Button component="span" color="primary" size='small' onClick={getPicturePE}>Ver</Button>
                </div>
              }
              {!accionistaSeleccionado.docPosesionEfectiva  && 
                  <div>
                  -
                  </div>
              }
            </div>  


            {accionistaSeleccionado.pn_estadoCivil == 'Casado'  && 
              <div>
                <Typography variant='caption'>
                  <strong>Documento de Identidad Cónyugue</strong>
                </Typography> 
                {accionistaSeleccionado.docIdentidadConyugue  && 
                  <div>
                    <CheckIcon />
                    <Button component="span" color="primary" size='small' onClick={getPictureDI}>Ver</Button>
                  </div>
                }
                {!accionistaSeleccionado.docIdentidadConyugue  && 
                    <div>
                    -
                    </div>
                }
              </div>  
            }

            </TabPanel>
            <TabPanel value={value} index={2}>
              <List dense='true'           
                subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                  <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', paddingLeft:'100px'}}>                
                    <Typography variant='caption' style={{flex:2, fontWeight:'bold'}}>
                      F.Compra
                    </Typography>
                    <Typography variant='caption' style={{flex:1, fontWeight:'bold'}}>
                      Título
                    </Typography>
                    <Typography variant='caption' style={{flex:1, fontWeight:'bold', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'30px'}}>
                      Cantidad
                    </Typography>
                    <Typography variant='caption' style={{flex:1, fontWeight:'bold', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'30px'}}>
                      Desde
                    </Typography>
                    <Typography variant='caption' style={{flex:1, fontWeight:'bold', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'30px'}}>
                      Hasta
                    </Typography>                                        
                    <Typography variant='caption' style={{flex:2, fontWeight:'bold'}}>
                      Estado
                    </Typography>   
                  </div>                                
                </ListSubheader>            
                }> 
                {
                titulos.sort((a,b) => (parseInt(a.titulo) > parseInt(b.titulo)) ? 1 : ((parseInt(b.titulo) > parseInt(a.titulo)) ? -1 : 0)).map(item => (
                  <ListItem  key={item.id}>
                    <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', paddingLeft:'100px'}}>                                                            
                      <ListItemText style={{flex:2}}>{item.fechaCompra}</ListItemText>                                
                      <ListItemText style={{flex:1}}>{item.titulo}</ListItemText>
                      <ListItemText style={{flex:1, display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'30px'}}>{item.acciones}</ListItemText>
                      <ListItemText style={{flex:1, display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'30px'}}>{item.desde}</ListItemText>
                      <ListItemText style={{flex:1, display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'30px'}}>{item.hasta}</ListItemText>
                      <ListItemText style={{flex:2}}>{item.estado}</ListItemText>
                    </div>
                  </ListItem>))}
              </List>
            </TabPanel>
            <TabPanel value={value} index={3}>
              <List dense='true'           
                subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                  <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%'}}>                
                    <Typography variant='caption' style={{flex:1, fontWeight:'bold'}}>
                      Fecha
                    </Typography>
                    <Typography variant='caption' style={{flex:1, fontWeight:'bold'}}>
                      Operación
                    </Typography>
                    <Typography variant='caption' style={{flex:1, fontWeight:'bold', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'30px'}}>
                      Cantidad
                    </Typography>
                    <Typography variant='caption' style={{flex:2, fontWeight:'bold'}}>
                      Cedente
                    </Typography>      
                    <Typography variant='caption' style={{flex:2, fontWeight:'bold'}}>
                      Cesionario
                    </Typography>                    
                    <Typography variant='caption' style={{flex:1, fontWeight:'bold'}}>
                      Estado
                    </Typography>   
                    <Typography variant='caption' style={{flex:1, fontWeight:'bold'}}>
                      Documentación
                    </Typography>   
                  </div>                               
                </ListSubheader>            
                }> 
                {operaciones.map(item => (
                  <ListItem  key={item.id}>  
                    <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%'}}>                                                            
                      <ListItemText style={{flex:1}}><small>{item.fecha}</small></ListItemText>                                
                      <ListItemText style={{flex:1}}><small>{item.operacion}</small></ListItemText>
                      <ListItemText style={{flex:1, display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'30px'}}><small>{item.acciones}</small></ListItemText>
                      <ListItemText style={{flex:2}}><small>{item.cedente}</small></ListItemText>
                      <ListItemText style={{flex:2}}><small>{item.cesionario}</small></ListItemText>
                      <ListItemText style={{flex:1}}><small>{item.estado}</small></ListItemText>
                      <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center'}}>
                        {item.cs && <ListItemIcon style={{flex:1}} ><IconButton onClick={() => get_PDF(item.cs)}>  <PageviewIcon /> </IconButton> </ListItemIcon> }
                        {item.cg && <ListItemIcon style={{flex:1}}><IconButton onClick={() => get_PDF(item.cg)}><PageviewIcon /> </IconButton> </ListItemIcon> }
                        {item.ci && <ListItemIcon style={{flex:1}}><IconButton onClick={() => get_PDF(item.ci)}><PageviewIcon /> </IconButton> </ListItemIcon> }
                        {item.es && <ListItemIcon style={{flex:1}}><IconButton onClick={() => get_PDF(item.es)}><PageviewIcon /> </IconButton> </ListItemIcon> }
                        {item.ced && <ListItemIcon style={{flex:1}}><IconButton onClick={() => get_PDF(item.ced)}><PageviewIcon /> </IconButton> </ListItemIcon> }
                        {item.cb && <ListItemIcon style={{flex:1}}><IconButton onClick={() => get_PDF(item.cb)}><PageviewIcon /> </IconButton> </ListItemIcon> }
                        {item.nom && <ListItemIcon style={{flex:1}}><IconButton onClick={() => get_PDF(item.nom)}><PageviewIcon /> </IconButton> </ListItemIcon> }
                      </div>
                    </div>
                  </ListItem>))}
              </List>
            </TabPanel>



          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary" >
              Salir
            </Button>
          </DialogActions>
        </Dialog>



         
      </Grid>
    </main>
  );
}