import React, { useState, useEffect }  from 'react';

import { Grid, Button,Typography,makeStyles,ButtonGroup,Badge,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,IconButton,TextField,
  ListItem, ListItemText, ListSubheader, List, CircularProgress, ListItemIcon,  Switch, FormControlLabel, InputLabel, MenuItem, Select, OutlinedInput, Icon} from '@material-ui/core';

import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import CheckIcon from '@material-ui/icons/Check';
import WarningIcon from '@material-ui/icons/ErrorOutlineOutlined';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import DescriptionIcon from '@material-ui/icons/Description';
import FiberNewOutlined from '@material-ui/icons/FiberNewOutlined';

import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { API, Storage, Auth } from 'aws-amplify';
import { listOperaciones, listTituloPorOperacions, getNumeroSecuencial, listTitulos,listHerederoPorOperacions,getParametro } from './../graphql/queries';
import { updateTitulo, createTitulo, updateNumeroSecuencial, updateAccionista, updateOperaciones, createHeredero } from './../graphql/mutations';
import PropTypes from 'prop-types';

import { styled } from '@material-ui//styles';
import { uuid } from 'uuidv4';


const useStyles = makeStyles((theme) => ({
  appBarSpacer: {
      ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(2),        
  },
  root: {
    padding: theme.spacing(0.5, 0.5, 0),
    justifyContent: 'flex-end',
    display: 'flex',
    alignItems: 'flex-start',
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
  botonAnular: {
    //color: theme.palette.error.light,
    backgroundColor : theme.palette.error.light,
  } ,
  botonCellAnular: {
    color: theme.palette.error.light,
    //backgroundColor : theme.palette.error.light,
  } 
}));

const Input = styled('input')({
  display: 'none',
});
  
function escapeRegExp(value) {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function QuickSearchToolbar(props) {
    const classes = useStyles();
  
    return (
      <div className={classes.root}>
        <TextField
          variant="standard"
          value={props.value}
          onChange={props.onChange}
          placeholder="Buscar..."
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
  
  QuickSearchToolbar.propTypes = {
    clearSearch: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
  };

export default function Operaciones() {
  const classes = useStyles();
  const [userName, setUserName] = useState("");
  const [operaciones, setOperaciones] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [openRevisar, setOpenRevisar] = useState(false);
  const [imageCS, setImageCS] = useState('');
  const [transferencia, setTransferencia] = useState([]);
  const [estado, setEstado] = useState('Pendiente');
  const [titulos, setTitulos] = useState([])
  const [countEstado, setCountEstado] = useState([0,0,0,0])
  const [circular, setCircular] = useState(false);
  const [herederos, setHerederos] = useState([]);
  const [anular, setAnular] = useState(false);
  const [rechazo, setRechazo] = useState(false);
  const [motivosRechazo, setMotivosRechazo] = useState([]);
  const [formData, setFormData] = useState({cs: '', cg: '', ci: '', es: '', cp: ''});

  const columns = [
    //{ field: 'id', headerName: 'Nro', width: 80, type: 'number' },
    {
      field: 'fecha',
      headerName: 'Fecha',
      //width: 120,
      //flex: 1 ,
    },
    {
      field: 'operacion',
      headerName: 'Operación',
      //width: 180,
      flex: 1 ,
    },
    {
      field: 'cedente',
      headerName: 'Cedente',
      //width: 180,
      flex: 2 ,
    },
    {
        field: 'acciones',
        headerName: 'Acciones',
        type: 'number',
        //width: 150,
        flex: 1 ,
      },
      {
        field: 'cesionario',
        headerName: 'Cesionario',
        //width: 180,
        flex: 2 ,
        
      },    
      {
        field: 'observacion',
        hide: estado == 'Rechazada' ? false : true,
        headerName: 'Motivo',
        //width: 280,
        flex: 2 ,
        
      },         
      {
        field: "Opciones",
        hide: (estado == 'Rechazada' || estado == 'Pendiente')? false : true,
        renderCell: (cellValues) => {
          return (
            <Button
              //variant="contained"
              color="primary"
              onClick={(event) => {
                handleClickRevisar(event, cellValues);
              }}
            >
              Revisar
            </Button>
          );
        }
      },
      {
        field: "Anular",
        hide: estado == 'Rechazada' ? false : true,
        //width: 180,
        renderCell: (cellValues) => {
          return (
            <Button
              //variant="contained"
              //color="primary"
              classes={{ root: classes.botonCellAnular }}
              onClick={(event) => {
                handleClickAnular(event, cellValues);
              }}
            >
              Anular
            </Button>
          );
        }
      },
      {
        field: "Detalles",        
        hide: (estado == 'Rechazada' || estado == 'Pendiente')? true : false,
        renderCell: (cellValues) => {
          return (
            <IconButton
              //variant="contained"
              //color="primary"
              onClick={(event) => {
                handleClickRevisar(event, cellValues);
                //console.log('click Icon',event,cellValues)
              }}
            >
              <DescriptionIcon />
            </IconButton>
          );
        }
      },

  ];


  const motivoRechazo = [
    {
      label: "Falta documentación",
      value: "1",
    },
    {
      label: "Documentación errada",
      value: "2",
    },
    {
      label: "Documentación duplicada",
      value: "3",
    },
    {
      label: "Falta de Habilitantes",
      value: "4",
    },
    {
      label: "Operación Duplicada",
      value: "5",
    },
    {
      label: "Accionista no hábil",
      value: "6",
    },
  ];

  const generateSelectMotivoRechazo = () => {
    return motivoRechazo.map((option) => {
      return (
        <MenuItem key={option.value} value={option.value}>
         {option.label}
        </MenuItem>
      );
    });
  };

  function getUser() {
    //console.log("AUTH.USER",Auth)
    let user 
    if(Auth.user != null) user = Auth.user.username;
    return user;
    }

  useEffect(() => {
    fetchOperaciones("Pendiente");
    fetchParametros();
    //getUser();
    const user = getUser();
    //setUserName(user.username);
    setUserName(user);
  }, [operaciones.length, count]);
 
  
  async function fetchOperaciones() {

    //console.log('entro de nuevo ??', 'SIIII')

    let filter = {
      estado: {
          eq: estado // filter priority = 1
      },
      
  };

    const apiData = await API.graphql({ query: listOperaciones , variables: { filter: filter , limit: 10000},  });
    const operacionesFromAPI = apiData.data.listOperaciones.items;

    console.log('revisar operaciones I',operacionesFromAPI);

    operacionesFromAPI.sort(function (b, a) {
      if (new Date(+a.fecha.split("-")[2],a.fecha.split("-")[1] - 1, +a.fecha.split("-")[0]) > new Date(+b.fecha.split("-")[2],b.fecha.split("-")[1] - 1, +b.fecha.split("-")[0])) return 1;
      if (new Date(+a.fecha.split("-")[2],a.fecha.split("-")[1] - 1, +a.fecha.split("-")[0]) < new Date(+b.fecha.split("-")[2],b.fecha.split("-")[1] - 1, +b.fecha.split("-")[0])) return -1;
      return 0;
    });

    console.log('revisar operaciones II',operacionesFromAPI);


    operacionesFromAPI.forEach(function (obj) {
        
      //obj.nombre2 = obj.tipoPersona == 'PN' ? obj.pn_primerNombre + " " + obj.pn_segundoNombre + " " + obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno : obj.nombre;
      //nombre_aux = obj.tipoPersona == 'PN' ? obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno + " " + obj.pn_primerNombre + " " + obj.pn_segundoNombre : obj.nombre;
      obj.cedente = obj.cedente.toUpperCase();
      obj.cesionario = obj.cesionario.toUpperCase();
    });



    setOperaciones(operacionesFromAPI);
    if(count === 0)
      {      
      setCount(1);
      setRows(operacionesFromAPI);
      }

      const today = new Date();
      const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();

      const apiData1 = await API.graphql({ query: listOperaciones , variables: { filter: {estado:{eq:'Pendiente'}}}});
      const operacionesFromAPI1 = apiData1.data.listOperaciones.items.length; 
      const apiData2 = await API.graphql({ query: listOperaciones , variables: { filter: {estado:{eq:'Aprobada'},fechaAprobacion:{eq:fecha}}}});
      const operacionesFromAPI2 = apiData2.data.listOperaciones.items.length;
      const apiData3 = await API.graphql({ query: listOperaciones , variables: { filter: {estado:{eq:'Rechazada'}}}});
      const operacionesFromAPI3 = apiData3.data.listOperaciones.items.length;
      const apiData4 = await API.graphql({ query: listOperaciones , variables: { filter: {estado:{eq:'Anulada'},fechaAprobacion:{eq:fecha}}}});
      const operacionesFromAPI4 = apiData4.data.listOperaciones.items.length;
      setCountEstado([operacionesFromAPI1,operacionesFromAPI2,operacionesFromAPI3,operacionesFromAPI4])

  }

  const [cantidadEmitida, setCantidadEmitida] = useState(0);
  const [valorNominal, setValorNominal] = useState(0);

  async function fetchParametros() {

    const apiData = await API.graphql({ query: getParametro , variables: { id: '1' } });

    const parametrosFromAPI = apiData.data.getParametro;    

    setCantidadEmitida(parametrosFromAPI.cantidadEmitida);
    setValorNominal(parametrosFromAPI.valorNominal);

}

  const requestSearch = (searchValue) => {
      setSearchText(searchValue);
      const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
      const filteredRows = operaciones.filter((row) => {
        return Object.keys(row).some((field) => {

          //if (row[field] != null) {
          return row[field] &&searchRegex.test(row[field].toString());
          //}
        });
      });
      setRows(filteredRows);
    };

    const handleClickAnular = (e,values) => {

      setTransferencia(values.row);
      setOpenRevisar(true);
      setAnular(true);
      fetchTitulos(values.row.id);
      fetchHerederos(values.row.id);

      console.log('values anular',values.row);
      //console.log('operacion',values.row.id);
    };
 

    const handleClickRevisar = (e,values) => {

      setTransferencia(values.row);
      setOpenRevisar(true);
      fetchTitulos(values.row.id);
      fetchHerederos(values.row.id);

      setFormData({ cs: values.row.cs, cg: values.row.cg, ci: values.row.ci, es: values.row.es, cp: values.row.cp})    
      console.log('values',values.row);
      //console.log('operacion',values.row.id);
    };

    
    const handleRevisarOperacion = () => {

      setOpenRevisar(false);    
      setAnular(false);
      setRechazo(false); 
    };


    const handleReenviarOperacion = async() => {

    setCircular(true);
    const operacion = { ...formData }

    //Actualizar estado de operacion Rechazada a Pendiente
    //console.log('Aprobar operacion y actualizar Fecha', transferencia.id)
    //actualizar estado y fechaAprobacion de operacion aprobada
    //const today = new Date();
    //const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();

    const apiDataUpdateOper = await API.graphql({ query: updateOperaciones, variables: { input: {id: transferencia.id, estado: 'Pendiente', cs: operacion.cs, cg: operacion.cg, ci: operacion.ci, es: operacion.es, cp: operacion.cp, } } });
    //console.log('xxxxxxxxxxxxxxxxxxxx', transferencia.id, operacion.cs, operacion.cg, operacion.ci, operacion.es, operacion.cp)

    setFormData({ cs: '', cg: '', ci: '', es: '', cp: ''})        
    setCircular(false);
    setOpenRevisar(false);     
    setAnular(false);     
    setCount(0);
    setTransferencia([]);
    setTitulos([]);
    fetchOperaciones("Rechazada");
    setRechazo(false); 
    setMotivosRechazo([]);

    }


    const handleActualizarDocumentos = async() => {

      setCircular(true);
      const operacion = { ...formData }
  
      const apiDataUpdateOper = await API.graphql({ query: updateOperaciones, variables: { input: {id: transferencia.id, cs: operacion.cs, cg: operacion.cg, ci: operacion.ci, es: operacion.es, cp: operacion.cp, } } });
  
      setFormData({ cs: '', cg: '', ci: '', es: '', cp: ''})        
      setCircular(false);
      setOpenRevisar(false);     
      setAnular(false);     
      setCount(0);
      setTransferencia([]);
      setTitulos([]);
      fetchOperaciones("Aprobada");
      setRechazo(false); 
      setMotivosRechazo([]);
  
      }
  


    const handleAnularOperacion = async() => {

      setCircular(true);

      console.log('Anular Operacion')

      //Preguntar si tienen titulos ?
      
      //Desbloquear Titulos
      for (const titulo of titulos) {
        console.log('Titulo a Desbloquear',titulo)
        const apiData = await API.graphql({ query: updateTitulo, variables: { input: {id: titulo.tituloId, estado: 'Activo'} } });
        console.log('Titulo Desbloqueado',apiData)
      }

      //Actualizar estado de operacion a Anulada
      console.log('Aprobar operacion y actualizar Fecha', transferencia.id)
      //actualizar estado y fechaAprobacion de operacion aprobada
      const today = new Date();
      const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();
      const apiDataUpdateOper = await API.graphql({ query: updateOperaciones, variables: { input: {id: transferencia.id, estado: 'Anulada', fechaAprobacion: fecha } } });
      console.log(' Pasó Aprobar operacion y actualizar Fecha', apiDataUpdateOper)


      setCircular(false);
      setOpenRevisar(false);     
      setAnular(false);     
      setCount(0);
      setTransferencia([]);
      setTitulos([]);
      fetchOperaciones("Pendiente");
      setRechazo(false); 
  
      }
  

      const handleRechazarOperacion = async() => {

        setCircular(true);
  
        console.log('Rechazar Operacion')

        //Actualizar estado de operacion a Anulada
        console.log('Rechazar operacion y actualizar Fecha', transferencia.id)
        //actualizar estado y fechaAprobacion de operacion aprobada
        const today = new Date();
        const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();
        let obs = '';
        const res = motivosRechazo.map(motivo => {
          obs = obs  + motivoRechazo.find(item => item.value == motivo ).label + ' | '
        });

        const apiDataUpdateOper = await API.graphql({ query: updateOperaciones, variables: { input: {id: transferencia.id, estado: 'Rechazada', fechaAprobacion: fecha, motivoRechazo: motivosRechazo, observacion : obs} } });
        console.log(' Pasó Rechazar operacion y actualizar Fecha', apiDataUpdateOper)
    
        //Desbloquear Titulos

        for (const titulo of titulos) {
          console.log('titulo', titulo);
          //Activar los titulos de cedente
          const apiData = await API.graphql({ query: updateTitulo, variables: { input: {id: titulo.tituloId, estado: 'Activo'} } });
          console.log('Inactivar titulos',apiData)
        }  

        setCircular(false);
        setOpenRevisar(false);     
        setAnular(false);     
        setCount(0);
        setTransferencia([]);
        setTitulos([]);
        fetchOperaciones("Pendiente");
        setRechazo(false); 
        setMotivosRechazo([]);
    
        }
    
        //const { getLicence } = require('../qldb/regitro');
        //const { getQldbDriver } = require('../qldb/connectToLedger');
        
        const handleAprobarOperacion3Prueba = async() => {

          try{

            actualizarAccionista('pruebaNro1', 'Coco Lucho', 22, 'Activo');
/*            const miInit = { body: {
              Name : 'Matt2',
              Colour : 'Black',
            } };
            const data = await API.put('LibroApiQLDB','/registro',miInit )
            console.log("Data API", data);
            console.log("Data Lenght", data.length)  
*/            
          }catch (err){
              console.log('error', err)
          }

        }
  

        const actualizarAccionista = async(id, nombre, acciones, estado) => {
          try{
            const miInit = { body: {
              id : id,
              nombre : nombre,
              cantidadAcciones : acciones,
              estado : estado,
            } };
            const data = await API.put('LibroApiQLDB','/registro',miInit )
            console.log("Data API", data);
            console.log("Data Lenght", data.length)
            //if (data.length == 0){
              //Buscar datos
            //  const data2 = await API.post('LibroApiQLDB','/registro',miInit )
            //}

          }catch (err){
              console.log('error', err)
          }

        }



    const handleAprobarOperacion2 = async() => {
      
      setCircular(true);

      if(transferencia.operacion == "Cesión" || transferencia.operacion == "Testamento" || transferencia.operacion == "Donación")
      {

      for (const titulo of titulos) {
        console.log('titulo', titulo);
        //inactivar los titulos de cedente
        const apiData = await API.graphql({ query: updateTitulo, variables: { input: {id: titulo.tituloId, estado: 'Inactivo'} } });
        console.log('Inactivar titulos',apiData)

        //leer secuencial de titulos
        const secuen = await apiDataSecuencial();
        console.log('Secuencial',secuen)

        let tituloCesionario = {}
        let tituloCedente = {}
        //si la cantidad de acciones a transferir es la misma: crear el mismo titulo al  cesionario
        if(titulo.acciones==titulo.accionesTransferidas){
          //console.log('Son iguales')
          tituloCesionario = {
            accionistaID: transferencia.idCesionario,
            titulo: titulo.titulo,
            acciones: titulo.acciones,
            fechaCompra: transferencia.fecha,
            estado: 'Activo',
            desde: titulo.desde,
            hasta: titulo.hasta,};

            console.log('input',tituloCesionario)
            const apiDataTituloCesionario = await API.graphql({ query: createTitulo, variables: { input: tituloCesionario } });  
    
        }
        else{ //si la cantidad de acciones a transferir es menor

          //crear nuevo titulo a cesionario (cantidad a transferir)
          //incrementar secuencial de titulos
          const num = parseInt(secuen.data.getNumeroSecuencial.numerotitulo)  + 1
          const secuen2 = await apiDataUpdate(num);
          //console.log('Update Secuencial',secuen2)
          //console.log('Son diferentes')
          tituloCesionario = {
            accionistaID:transferencia.idCesionario,
            titulo : num,
            acciones : titulo.accionesTransferidas,
            fechaCompra: transferencia.fecha,
            estado:'Activo', 
            desde: titulo.desde,
            hasta: (parseInt(titulo.desde) + parseInt(titulo.accionesTransferidas) - 1),};        

         console.log('input',tituloCesionario)
         const apiDataTituloCesionario = await API.graphql({ query: createTitulo, variables: { input: tituloCesionario } });  
 
          //crear nuevo titulo a cedente (cantidad - cantidad a transferir)
          //incrementar secuencial de titulos
          const numCed = num  + 1
          const secuenCed = await apiDataUpdate(numCed);
          console.log('Update Secuencial',secuenCed)
          tituloCedente = {
            accionistaID:transferencia.idCedente,
            titulo : numCed,
            acciones : parseInt(titulo.acciones) - parseInt(titulo.accionesTransferidas),
            fechaCompra: transferencia.fecha,
            estado:'Activo',
            desde: parseInt(titulo.desde) + parseInt(titulo.accionesTransferidas),
            hasta: titulo.hasta };                 
          const apiDataTituloCedente = await API.graphql({ query: createTitulo, variables: { input: tituloCedente } });  
          
         };
      } // Fin For Titulos


      //actualizar saldo de acciones para Cedente y Cesionario
      let filter = {
        accionistaID: {
            eq: transferencia.idCedente // filter priority = 1
        },
        estado: {
          ne: 'Inactivo'
        }
      };
      const apiDataTitulosCedente = await API.graphql({ query: listTitulos, variables: { filter: filter, limit: 10000} });
      const titulosCedenteFromAPI = apiDataTitulosCedente.data.listTitulos.items;
      //console.log('busca titulos cedente',titulosCedenteFromAPI)
      let totalAccionesCedente = 0;
      titulosCedenteFromAPI.map(titulo => {totalAccionesCedente = totalAccionesCedente + titulo.acciones})
      //console.log('total acciones cedente',totalAccionesCedente)

      filter = {
        accionistaID: {
            eq: transferencia.idCesionario // filter priority = 1
        },
        estado: {
          ne: 'Inactivo'
        }
      };
      const apiDataTitulosCesionario = await API.graphql({ query: listTitulos, variables: { filter: filter, limit : 10000} });
      const titulosCesionarioFromAPI = apiDataTitulosCesionario.data.listTitulos.items;
      //console.log('busca titulos cesionario',titulosCesionarioFromAPI)
      let totalAccionesCesionario= 0;
      titulosCesionarioFromAPI.map(titulo => {totalAccionesCesionario = totalAccionesCesionario + titulo.acciones})
      //console.log('total acciones cesionario',totalAccionesCesionario)

      const apiDataUpdateCedente = await API.graphql({ query: updateAccionista, variables: { input: {id: transferencia.idCedente, cantidadAcciones: totalAccionesCedente, estado: totalAccionesCedente== 0 ? 'Inactivo' : 'Activo' } } });
      const apiDataUpdateCesionario = await API.graphql({ query: updateAccionista, variables: { input: {id: transferencia.idCesionario, cantidadAcciones: totalAccionesCesionario } } });

      //console.log('Aprobar operacion y actualizar Fecha', transferencia.id)
      //actualizar estado y fechaAprobacion de operacion aprobada
      const today = new Date();
      const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();
      const apiDataUpdateOper = await API.graphql({ query: updateOperaciones, variables: { input: {id: transferencia.id, estado: 'Aprobada', fechaAprobacion: fecha, 'usuarioAprobador' : userName } } });
      console.log(' Pasó Aprobar operacion y actualizar Fecha', apiDataUpdateOper)

      actualizarAccionista(transferencia.idCedente, transferencia.cedente, totalAccionesCedente, totalAccionesCedente== 0 ? 'Inactivo' : 'Activo');
      console.log(' Pasó QLDB Cedente', transferencia.idCedente, transferencia.cedente, totalAccionesCedente, totalAccionesCedente== 0 ? 'Inactivo' : 'Activo')
      actualizarAccionista(transferencia.idCesionario, transferencia.cesionario, totalAccionesCesionario, 'Activo');
      console.log(' Pasó QLDB Cesionario', transferencia.idCesionario, transferencia.cesionario, totalAccionesCesionario)



    }
    else if(transferencia.operacion == "Posesión Efectiva")
    {
      console.log('entra Posesión Efectiva')
      //obtener fecha actual
      const today = new Date();
      const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();


      //Actualizar el estado de las titulos Herencia a Inactivo cuando pertenece al mismo cedente
      //Buscar titulos del cedente (herencia)
      //

      let filterH = {
        idCedenteHereda: {
            eq: transferencia.idCedente // filter priority = 1
        },
        estado: {
          eq: 'Herencia'
        }
      };
      const apiDataTitulosHerederoAnt = await API.graphql({ query: listTitulos, variables: { filter: filterH, limit : 10000} });
      const titulosHerederoFromAPIAnt = apiDataTitulosHerederoAnt.data.listTitulos.items;

      Promise.all(
        titulosHerederoFromAPIAnt.map(input => API.graphql({ query: updateTitulo, variables: { input: {id: input.id, estado: 'Inactivo'} } }) )           
      );

      const titulosAsignados=[];
      let saldoTitulo=0;
      let tituloFraccionado='';
      let desdeFraccion = 0;
      let herenciaAcumulada = 0;
      //Asociar Herederos al Cedente
      for (const heredero of herederos) {   
        console.log('entra Posesión herederos')     
        const datosHeredero = {
          accionistaHerederoId:heredero.herederoId,
          nombre: heredero.nombre,
          cantidad:  heredero.cantidad > 0 ? heredero.cantidad : transferencia.acciones,  //heredero.cantidad, en caso sea particion
          idCedente: transferencia.idCedente,
          nombreCedente: transferencia.cedente, 
          estado:  heredero.cantidad > 0 ? 'Partido' : 'Pendiente',  //heredero.cantidad, en caso sea particion
        };
        const apiDataHeredero = await API.graphql({ query: createHeredero, variables: { input: datosHeredero } });  

        //Crear Titulos a Herederos si hay Partición        
        if(heredero.cantidad > 0){
          let cantidadHerencia = heredero.cantidad;

          for (const titulo of titulos){
            const found = titulosAsignados.findIndex( element => element == titulo.titulo)
            console.log('FOUND', found)     
            if(found == -1){

              console.log('Validar titulos Posesión herederos', titulo)     
              console.log('Cantidad Herencia', cantidadHerencia)     
              console.log('Saldo Titulo', saldoTitulo)     

              if(cantidadHerencia >= titulo.acciones - saldoTitulo && saldoTitulo == 0) //1er saldoTitulo cambiar por HerenciaAcumulada
              {
                //Asignar el titulo con el mismo númmero
                const tituloHeredero = {
                  accionistaID:heredero.herederoId,
                  titulo : titulo.titulo,
                  acciones : titulo.acciones,
                  fechaCompra: fecha,
                  estado:'Activo', 
                  desde: titulo.desde,
                  hasta: titulo.hasta,};
                const apiDataTituloHeredero = await API.graphql({ query: createTitulo, variables: { input: tituloHeredero } });  

                console.log("asignar mismo titulo", titulo);
                cantidadHerencia = cantidadHerencia - titulo.acciones;
                titulosAsignados.push(titulo.titulo)
              }
              else {
                //leer secuencial de titulos
                const secuen = await apiDataSecuencial();
                //incrementar secuencial de titulos
                const num = parseInt(secuen.data.getNumeroSecuencial.numerotitulo)  + 1
                const secuen2 = await apiDataUpdate(num);            
                
                //Asignar el titulo parcialmente con el nuevo númmero
                //const totalTransferir = saldoTitulo == 0 ? cantidadHerencia : saldoTitulo ;//Problemas
                //const totalTransferir = saldoTitulo > 0 && saldoTitulo < cantidadHerencia ? saldoTitulo : cantidadHerencia ;//Problemas
                const totalTransferir = saldoTitulo > cantidadHerencia ? cantidadHerencia : saldoTitulo == 0 ? cantidadHerencia : saldoTitulo   ;//Problemas
                const tituloHeredero = {
                  accionistaID:heredero.herederoId,
                  titulo : num,
                  acciones : totalTransferir, //Se va con los 104 , debe ser 14 (saldo titulo) en caso QH > ST
                  fechaCompra: fecha,
                  estado:'Activo', 
                  desde: tituloFraccionado == '' ? titulo.desde : desdeFraccion, //+  titulo.cantidad - saldoTitulo 
                  hasta: tituloFraccionado == '' ? titulo.desde + totalTransferir - 1 : desdeFraccion + totalTransferir - 1,};
                const apiDataTituloHeredero = await API.graphql({ query: createTitulo, variables: { input: tituloHeredero } });  
                

                herenciaAcumulada = herenciaAcumulada + totalTransferir; //Deberia ser + saldoTitulo
                console.log("asignar titulo nuevo numero", titulo);
                
                saldoTitulo = titulo.acciones - herenciaAcumulada;                
                desdeFraccion = tituloFraccionado == '' ? titulo.desde + totalTransferir : desdeFraccion + totalTransferir //PROBLEMA ESTA DUPLICANDO
                tituloFraccionado = titulo.titulo;
                //desdeFraccion = desdeFraccion + cantidadHerencia //PROBLEMA ESTA DUPLICANDO

                console.log("herenciaAcumulada", herenciaAcumulada);
                console.log("saldoTitulo", saldoTitulo);
                console.log("desdeFraccion", desdeFraccion);

                if(saldoTitulo==0)
                {
                  titulosAsignados.push(titulo.titulo)
                  tituloFraccionado = '';
                  desdeFraccion = 0;
             
                  cantidadHerencia = cantidadHerencia - totalTransferir; // ???
                  herenciaAcumulada = 0;

                  continue;
                }
                break;
              }                
            }
          }//Fin Loop Titulos
      
        }
        else 
        {
          //Sin particion
            const titulosHerencia = titulos.map(function(e) {
              return {          
                accionistaID: heredero.herederoId ,
                titulo : e.titulo ,
                acciones: e.acciones ,
                fechaCompra: fecha ,
                estado: 'Herencia' ,
                idCedenteHereda: transferencia.idCedente ,
                nombreCedenteHereda: transferencia.cedente
              } ;
            })
            //console.log('GENERAR TITULOS HERENCIA', titulosHerencia)
            Promise.all(
              titulosHerencia.map(input =>  {  
                API.graphql({ query: createTitulo, variables: { input: input } })}
                )
            );
            //console.log('GENERAR TITULOS HERENCIA SIGUE')
        }

        //Actualizar Total de Acciones de Herederos e indicar que es Heredero (true)
        let filter = {
          accionistaID: {
              eq: heredero.herederoId // filter priority = 1
          },
          estado: {
            ne: 'Inactivo'
          }
        };
        const apiDataTitulosHeredero = await API.graphql({ query: listTitulos, variables: { filter: filter, limit : 10000} });
        const titulosHerederoFromAPI = apiDataTitulosHeredero.data.listTitulos.items;
        console.log('busca titulos heredero',titulosHerederoFromAPI)
        //const totalAccionesHeredero = titulosHerederoFromAPI.reduce(function(prev, current) {
        //  return prev + +current.acciones
        //}, 0);
        let totalAccionesHeredero = 0;
        titulosHerederoFromAPI.map(titulo => {totalAccionesHeredero = totalAccionesHeredero + titulo.acciones})
        console.log('cuanto es el total de heredero', totalAccionesHeredero)

        const apiDataAccionistaHeredero = await API.graphql({ query: updateAccionista, variables: { input: {id: heredero.herederoId, esHeredero: true, cantidadAcciones: totalAccionesHeredero } } });
      }//fin loop herederos




      //titulosAsignados
      //herenciaAcumulada = 0; //del titulo
      //existe aun un titulo fraccionado ?
        //crear un nuevo titulo
      if(tituloFraccionado!='')
      {
        //leer secuencial de titulos
        const secuenSaldo = await apiDataSecuencial();
        //incrementar secuencial de titulos
        const numeroTitulo = parseInt(secuenSaldo.data.getNumeroSecuencial.numerotitulo)  + 1
        const secuen3 = await apiDataUpdate(numeroTitulo);            

        const tituloSaldoCedente = {
          accionistaID:transferencia.idCedente,
          titulo : numeroTitulo,
          acciones : saldoTitulo, //Se va con los 104 , debe ser 14 (saldo titulo) en caso QH > ST
          fechaCompra: fecha,
          estado:'Activo', 
          desde: desdeFraccion, //+  titulo.cantidad - saldoTitulo 
          hasta: desdeFraccion + saldoTitulo - 1,};
        const apiDataTituloSaldoCedente = await API.graphql({ query: createTitulo, variables: { input: tituloSaldoCedente } });  
        console.log('Saldo titulo para cedente',tituloSaldoCedente,tituloFraccionado)  
      }

      for(const titulo of titulos)
      {
        const found2 = titulosAsignados.findIndex( element => element == titulo.titulo)
        if(found2 > -1 || tituloFraccionado == titulo.titulo)//titulo asignado o fraccionado
        {
          console.log('llegoo a crear titulo para cedente',titulo)

          //Dejar inactivo el titulo asignado y/o partido
          const apiData = await API.graphql({ query: updateTitulo, variables: { input: {id: titulo.tituloId, estado: 'Inactivo'} } });
        }
        else
        {
        console.log('problema en actualizar titulo',titulo.tituloId)
        //Desbloquear titulos restantes
        const apiData = await API.graphql({ query: updateTitulo, variables: { input: {id: titulo.tituloId, estado: 'Activo'} } });
        }
  
      }//fin loop titulos por operacion




      //Esto no se puede hacer, ya que falta los desde - hasta
      //crear titulo a cedente si tiene saldo
      //preguntar si herederos cantidad > 0, entonces:
      const totalAccionesDelCedente_Aux = herederos.reduce(function(prev, current) {
        return prev + +current.cantidad
      }, 0);

      console.log('cuanto es el total', totalAccionesDelCedente_Aux)
/*      
      if(totalAccionesDelCedente_Aux > 0){
        let totalAccionesParaHerencia=0;
        let limiteTitulos = false;
        for(const titulo of titulos)
        {
          totalAccionesParaHerencia = totalAccionesParaHerencia + titulo.acciones
          if(totalAccionesParaHerencia > transferencia.acciones){
            if(limiteTitulos==false)
            {
              console.log('llegoo a crear titulo para cedente',totalAccionesParaHerencia,titulo.acciones)
            //crear titulo particionado del cedente
            //leer secuencial de titulos
            const secuen = await apiDataSecuencial();
            //incrementar secuencial de titulos
            const num = parseInt(secuen.data.getNumeroSecuencial.numerotitulo)  + 1
            const secuen2 = await apiDataUpdate(num);
            console.log('paso secuenciao',num,secuen2)
            const tituloCedente = {
              accionistaID:transferencia.idCedente,
              titulo : num,
              acciones : totalAccionesParaHerencia - transferencia.acciones,
              fechaCompra: fecha,
              estado:'Activo', };
              console.log('paso secuenciao II',tituloCedente)
            const apiDataTituloCedente = await API.graphql({ query: createTitulo, variables: { input: tituloCedente } });  

            //Dejar inactivo el titulo partido
            const apiData = await API.graphql({ query: updateTitulo, variables: { input: {id: titulo.tituloId, estado: 'Inactivo'} } });

            // Ya no crear más titulos
            limiteTitulos = true;


            }else{
              console.log('problema en actulizar titulo',titulo.tituloId)
              //Desbloquear titulos restantes
              const apiData = await API.graphql({ query: updateTitulo, variables: { input: {id: titulo.tituloId, estado: 'Activo'} } });
            }
          }else{
            //falta dejar inactivos los titulos bloqueados
            const apiData = await API.graphql({ query: updateTitulo, variables: { input: {id: titulo.tituloId, estado: 'Inactivo'} } });
          }
        
        }//fin loop titulos por operacion
      }//fin if con particion
*/

      //Actualiza saldo cedente, Inactivar Cedente (solo si su saldo es cero) y Actualizar dato "Herederos" (true)
      let filterCedente = {
        accionistaID: {
            eq: transferencia.idCedente
        },
        estado: {
          ne: 'Inactivo'
        }
      };
      const apiDataTitulosCedente = await API.graphql({ query: listTitulos, variables: { filter: filterCedente, limit : 10000} });
      const titulosCedenteFromAPI = apiDataTitulosCedente.data.listTitulos.items;
      //const totalAccionesDelCedente = titulosCedenteFromAPI.map(item => parseInt(item.acciones)).reduce((prev, next) => prev + next);
      const totalAccionesDelCedente = titulosCedenteFromAPI.reduce(function(prev, current) {
        return prev + +current.acciones
      }, 0);

      //titulosCedenteFromAPI.map(titulo => {totalAccionesDelCedente = totalAccionesDelCedente + titulo.acciones})
      
      if(totalAccionesDelCedente == 0){
        const apiDataAccionistaCedente = await API.graphql({ query: updateAccionista, variables: { input: {id: transferencia.idCedente, herederos: true, cantidadAcciones: totalAccionesDelCedente, estado: 'Inactivo'} } });
        //const apiData = await API.graphql({ query: updateAccionista, variables: { input: {id: transferencia.idCedente,herederos: true, estado: 'Inactivo'} } });  
      }else{
        const apiDataAccionistaCedente = await API.graphql({ query: updateAccionista, variables: { input: {id: transferencia.idCedente, herederos: true, cantidadAcciones: totalAccionesDelCedente} } });
        //const apiData = await API.graphql({ query: updateAccionista, variables: { input: {id: transferencia.idCedente,herederos: true, estado: 'Inactivo'} } });  
      }

      //actualizar estado y fechaAprobacion de operacion aprobada
      const apiDataUpdateOper = await API.graphql({ query: updateOperaciones, variables: { input: {id: transferencia.id, estado: 'Aprobada', fechaAprobacion: fecha, 'usuarioAprobador' : userName } } });


    }
    else if(transferencia.operacion == "Canje"){
      //obtener fecha actual
      const today = new Date();
      const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();
      
      //Desbloquear Valores 
      for (const titulo of titulos) {
        const apiData = await API.graphql({ query: updateTitulo, variables: { input: {id: titulo.tituloId, estado: 'Activo'} } });
      }
      // Cambiar a Desmaterializados en Libro de Accionistas
      const apiDataUpdateCedente = await API.graphql({ query: updateAccionista, variables: { input: {id: transferencia.idCedente, tipoAcciones: 'D' } } });
      //actualizar estado y fechaAprobacion de operacion aprobada
      const apiDataUpdateOper = await API.graphql({ query: updateOperaciones, variables: { input: {id: transferencia.id, estado: 'Aprobada', fechaAprobacion: fecha, 'usuarioAprobador' : userName } } });

    }
    else if(transferencia.operacion == "Bloqueo"){
      //obtener fecha actual
      const today = new Date();
      const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();
      
      // Cambiar a Bloqueado en Libro de Accionistas
      const apiDataUpdateCedente = await API.graphql({ query: updateAccionista, variables: { input: {id: transferencia.idCedente, estado: 'Bloqueado' } } });
      //actualizar estado y fechaAprobacion de operacion aprobada
      const apiDataUpdateOper = await API.graphql({ query: updateOperaciones, variables: { input: {id: transferencia.id, estado: 'Aprobada', fechaAprobacion: fecha, 'usuarioAprobador' : userName } } });
    }
    else if(transferencia.operacion == "Desbloqueo"){
      //obtener fecha actual
      const today = new Date();
      const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();
      
      //Desbloquear Valores 
      for (const titulo of titulos) {
        const apiData = await API.graphql({ query: updateTitulo, variables: { input: {id: titulo.tituloId, estado: 'Activo'} } });
      }
      // Cambiar a Activo en Libro de Accionistas
      const apiDataUpdateCedente = await API.graphql({ query: updateAccionista, variables: { input: {id: transferencia.idCedente, estado: 'Activo' } } });
      //actualizar estado y fechaAprobacion de operacion aprobada
      const apiDataUpdateOper = await API.graphql({ query: updateOperaciones, variables: { input: {id: transferencia.id, estado: 'Aprobada', fechaAprobacion: fecha, 'usuarioAprobador' : userName } } });

    }


    else if(transferencia.operacion == "Aumento Capital" )
    {

      //leer secuencial de titulos
      const secuen = await apiDataSecuencial();

      let tituloCesionario = {}

        //crear nuevo titulo a cesionario (cantidad a transferir)
        //incrementar secuencial de titulos
        const num = parseInt(secuen.data.getNumeroSecuencial.numerotitulo)  + 1
        const secuen2 = await apiDataUpdate(num);
        //console.log('Update Secuencial',secuen2)
        //console.log('Son diferentes')
        tituloCesionario = {
          accionistaID:transferencia.idCesionario,
          titulo : num,
          acciones : transferencia.acciones,
          fechaCompra: transferencia.fecha,
          estado:'Activo', 
          desde: cantidadEmitida + 1,
          hasta: (parseInt(cantidadEmitida + 1) + parseInt(transferencia.acciones) - 1),};        

       console.log('input',tituloCesionario)
       const apiDataTituloCesionario = await API.graphql({ query: createTitulo, variables: { input: tituloCesionario } });  

    //actualizar saldo de acciones para Cesionario
    let filter = {
      accionistaID: {
          eq: transferencia.idCesionario // filter priority = 1
      },
      estado: {
        ne: 'Inactivo'
      }
    };
    const apiDataTitulosCesionario = await API.graphql({ query: listTitulos, variables: { filter: filter, limit : 10000} });
    const titulosCesionarioFromAPI = apiDataTitulosCesionario.data.listTitulos.items;
    //console.log('busca titulos cesionario',titulosCesionarioFromAPI)
    let totalAccionesCesionario= 0;
    titulosCesionarioFromAPI.map(titulo => {totalAccionesCesionario = totalAccionesCesionario + titulo.acciones})
    //console.log('total acciones cesionario',totalAccionesCesionario)

    const apiDataUpdateCesionario = await API.graphql({ query: updateAccionista, variables: { input: {id: transferencia.idCesionario, cantidadAcciones: totalAccionesCesionario } } });

    //console.log('Aprobar operacion y actualizar Fecha', transferencia.id)
    //actualizar estado y fechaAprobacion de operacion aprobada
    const today = new Date();
    const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();
    const apiDataUpdateOper = await API.graphql({ query: updateOperaciones, variables: { input: {id: transferencia.id, estado: 'Aprobada', fechaAprobacion: fecha, 'usuarioAprobador' : userName } } });
    console.log(' Pasó Aprobar operacion y actualizar Fecha', apiDataUpdateOper)

    actualizarAccionista(transferencia.idCesionario, transferencia.cesionario, totalAccionesCesionario, 'Activo');
    console.log(' Pasó QLDB Cesionario', transferencia.idCesionario, transferencia.cesionario, totalAccionesCesionario)

  }


    setCircular(false);
    setOpenRevisar(false);     
    setAnular(false);     
    setCount(0);
    setTransferencia([]);
    setTitulos([]);
    fetchOperaciones("Pendiente");

    }

    async function fetchHerederos(idOper) {

      let filter = {
        operacionId: {
            eq: idOper // filter priority = 1
        }
      };
  
      const apiData = await API.graphql({ query: listHerederoPorOperacions, variables: { filter: filter, limit: 10000} });
      const herederosFromAPI = apiData.data.listHerederoPorOperacions.items;
 
      console.log('busca herederos por Operacion',herederosFromAPI)
      setHerederos(herederosFromAPI);
      
    }
  

    const apiDataSecuencial = async() => await API.graphql({ query: getNumeroSecuencial, variables: { id: '1' } });
    const apiDataUpdate =  async(nuevoSecuencial) => await API.graphql({ query: updateNumeroSecuencial, variables: { input: {id: '1', numerotitulo: nuevoSecuencial} } });
    
    
    async function fetchTitulos(idOper) {

      let filter = {
        operacionID: {
            eq: idOper // filter priority = 1
        }
      };
  
      const apiData = await API.graphql({ query: listTituloPorOperacions, variables: { filter: filter, limit: 10000} });
      console.log('titulos I',apiData)
      const titulosFromAPI = apiData.data.listTituloPorOperacions.items;
      console.log('titulos II',titulosFromAPI)
      //await Promise.all(titulosFromAPI.map(async titulos => {
      //return titulos;
      //}))


      //setTitulos(titulosFromAPI);
      
      setTitulos(titulosFromAPI.sort(function (a, b) {
        if (a.acciones > b.acciones) {
          return 1;
        }
        if (a.acciones < b.acciones) {
          return -1;
        }
        // a must be equal to b
        return 0;
      }));
      

    }



    const getPictureCS = e => {
      e.stopPropagation();
                
      Storage.get(transferencia.cs)
        .then(url => {
          var myRequest = new Request(url);
          fetch(myRequest).then(function(response) {
            if (response.status === 200) {              
              console.log("DOCUMENTOOOO CS", url);
              setImageCS(url);
              window.open(url)
            }
          });
        })
        .catch(err => console.log(err));
        
    };

    const getPictureCG = e => {
      e.stopPropagation();
            
      Storage.get(transferencia.cg)
        .then(url => {
          var myRequest = new Request(url);
          fetch(myRequest).then(function(response) {
            if (response.status === 200) {
              console.log("DOCUMENTOOOO CG", url.url);
              setImageCS(url);
              window.open(url)
            }
          });
        })
        .catch(err => console.log(err));
        
    };

    const getPictureCI = e => {
      e.stopPropagation();
           
      Storage.get(transferencia.ci)
        .then(url => {
          var myRequest = new Request(url);
          fetch(myRequest).then(function(response) {
            if (response.status === 200) {
              setImageCS(url);
              window.open(url)
            }
          });
        })
        .catch(err => console.log(err));
        
    };

    const getPictureES = e => {
      e.stopPropagation();
      
      Storage.get(transferencia.es)
        .then(url => {
          var myRequest = new Request(url);
          fetch(myRequest).then(function(response) {
            if (response.status === 200) {
              setImageCS(url);
              window.open(url)
            }
          });
        })
        .catch(err => console.log(err));
        
    };

    const getPictureCP = e => {
      e.stopPropagation();
            
      Storage.get(transferencia.cp)
        .then(url => {
          var myRequest = new Request(url);
          fetch(myRequest).then(function(response) {
            if (response.status === 200) {
              setImageCS(url);
              window.open(url)
            }
          });
        })
        .catch(err => console.log(err));
        
    };

  const handleChangeRechazo = (event) => {
    setRechazo(event.target.checked);
  };

  
  const handleChangeMotivosRechazo = (event) => {
    const {
      target: { value },
    } = event;
    console.log('motivos', event)
    setMotivosRechazo(
      // On autofill we get a the stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  async function onChangeCS(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    const filename = uuid() + file.name
    setFormData({ ...formData, cs: filename });
    await Storage.put(filename, file);
  }
  

  async function onChangeCG(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    const filename = uuid() + file.name
    setFormData({ ...formData, cg: filename });
    await Storage.put(filename, file);
  }
  
  async function onChangeCI(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    const filename = uuid() + file.name
    setFormData({ ...formData, ci: filename });
    await Storage.put(filename, file);
  }
  
  async function onChangeES(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    const filename = uuid() + file.name
    setFormData({ ...formData, es: filename });
    await Storage.put(filename, file);
  }
  
  async function onChangeCP(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    const filename = uuid() + file.name
    setFormData({ ...formData, cp: filename });
    await Storage.put(filename, file);
  }
  

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />

        <Grid container spacing={3} >
          <Grid item xs={12} >
              <ButtonGroup size="medium" variant="text" aria-label="text button group" style={{paddingBottom: 0, backgroundColor:'white'}} fullWidth='true'>
                  <Button onClick={()=>{setEstado("Pendiente"); setCount(0) }} variant={estado=="Pendiente" ? "contained" : "text"} startIcon={<EditIcon color={estado=='Pendiente' ? 'inherit': 'disabled'}/>} size="medium" color={estado=="Pendiente" ? "primary" : 'inherit'}>
                      <Typography variant='subtitle2' style={estado=="Pendiente" ? {color:'white'} : {color:'grey'}}>Pendientes</Typography>
                      <Badge color="secondary" overlap="circular" badgeContent={countEstado[0]} style={{left: 30,}}>                         
                      </Badge>
                  </Button>
                  <Button onClick={()=>{setEstado("Aprobada"); setCount(0)}} variant={estado=="Aprobada" ? "contained" : "text"} startIcon={<CheckIcon color={estado=='Aprobada' ? 'inherit': 'disabled'}/>} size='medium' color={estado=="Aprobada" ? "primary" : 'inherit'}>
                      <Typography variant='subtitle2' style={estado=="Aprobada" ? {color:'white'} : {color:'grey'}} >Aprobadas</Typography>
                      <Badge color="secondary" overlap="circular" badgeContent={countEstado[1]} style={{left: 30,}}>                         
                      </Badge>
                  </Button>                                  
                  <Button onClick={()=>{setEstado("Rechazada"); setCount(0)}} variant={estado=="Rechazada" ? "contained" : "text"} startIcon={<WarningIcon color={estado=='Rechazada' ? 'inherit': 'disabled'}/>} size='medium' color={estado=="Rechazada" ? "primary" : 'inherit'}>
                      <Typography variant='subtitle2' style={estado=="Rechazada" ? {color:'white'} : {color:'grey'}}>Rechazadas</Typography>
                      <Badge color="secondary" overlap="circular" badgeContent={countEstado[2]} style={{left: 30,}}>                     
                      </Badge>
                  </Button>
                  <Button onClick={()=>{setEstado("Anulada"); setCount(0)}} variant={estado=="Anulada" ? "contained" : "text"} startIcon={<DeleteIcon color={estado=='Anulada' ? 'inherit': 'disabled'}/>} size='medium' color={estado=="Anulada" ? "primary" : 'inherit'}>
                      <Typography variant='subtitle2' style={estado=="Anulada" ? {color:'white'} : {color:'grey'}}>Anuladas</Typography>
                      <Badge color="secondary" overlap="circular" badgeContent={countEstado[3]} style={{left: 30,}}>                         
                      </Badge>
                  </Button>
              </ButtonGroup>

              <DataGrid              
                  disableColumnMenu
                  //sortModel={ [{field: 'fecha', sort: 'desc',}]}
                  style={{backgroundColor:'white'}}
                  density="compact"             
                  autoHeight='true'
                  autoPageSize='true'
                  components={{ Toolbar: QuickSearchToolbar}}
                  rows={rows}
                  columns={columns}
                  componentsProps={{
                      toolbar: {
                      value: searchText,
                      onChange: (event) => requestSearch(event.target.value),
                      clearSearch: () => requestSearch(''),
                      },
                  }}
              />
              
          </Grid>
        </Grid>

      <Dialog fullWidth='false' maxWidth = 'md' open={openRevisar} onClose={handleRevisarOperacion} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" style={{backgroundColor:'#00BCD4'}}>
            <div>{transferencia.operacion}</div>
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            <Grid container style={{display:'flex'}}>
              <Grid item xs={4} >
                <Typography variant='h6'>
                Detalle Operación
                </Typography>          
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Typography variant='body2'>
                <small>Fecha Solicitud</small>
                </Typography>
                <Typography variant='subtitle1'>
                  {transferencia.fecha}
                </Typography>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Typography variant='body2'>
                { (transferencia.operacion=='Canje' || transferencia.operacion=='Bloqueo') ? <small>Accionista</small> :  <small>Cedente</small>}
                </Typography>
                <Typography variant='subtitle1'>
                  {transferencia.cedente}
                </Typography>

                { transferencia.operacion=='Posesión Efectiva' &&
                <List dense='true'           
                    subheader={
                      <ListSubheader component="div" id="nested-list-subheader">
                        <div style={{display:'flex', flexDirection:'row', justifyContent:'space-around' , width: '100%', marginTop:10 , paddingRight:70 }}>              
                          <Typography variant='caption'  style={{flex: 1}}>
                            Nro. Título
                          </Typography>
                          <Typography variant='caption'  style={{flex: 1}}>
                            Acciones
                          </Typography>                
                        </div>
                      </ListSubheader>
                      
                      }> 
                      {titulos.map(item => (
                        <ListItem key={item.id}>
                            <div style={{display:'flex', flexDirection:'row', justifyContent:'space-around', width: '100%', paddingRight:50 }}>              
                              <div style={{flex: 1}}>
                                <ListItemText>{item.titulo}</ListItemText>
                              </div>
                              <div style={{flex: 1}}>
                                <ListItemText>{item.acciones}</ListItemText>
                              </div>
                            </div>
                        </ListItem>                            
                    ))}
                  </List>
                }

                {transferencia.operacion!='Posesión Efectiva' && transferencia.operacion!='Canje' && transferencia.operacion!='Bloqueo' && transferencia.operacion!='Desbloqueo' &&
                <div>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <Typography variant='body2'>
                  <small>Cesionario</small>
                  </Typography>
                  <Typography variant='subtitle1'>
                    {transferencia.cesionario}
                  </Typography>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <Typography variant='body2'>
                  <small>Acciones a Transferir</small>
                  </Typography>
                  <Typography variant='subtitle1' color='secondary'>
                    {transferencia.acciones}
                  </Typography>        
                </div>
                }   
              </Grid>

              <Grid item xs={4} >
                { transferencia.operacion=='Posesión Efectiva' &&
                  <div>
                    <Typography variant='h6'>
                      Herederos
                    </Typography>
                    <List dense='true' > 
                        {herederos.map(item => (
                          <ListItem key={item.id}  >
                                <ListItemIcon>
                                  <PersonOutlineIcon/>
                                </ListItemIcon>
                                <ListItemText  secondary={item.cantidad >0 && <div style={{fontSize:10, fontWeight:'bold'}}>Acciones: {item.cantidad}</div>}> {item.nombre} </ListItemText>
                          </ListItem>                            
                      ))}
                    </List>
                  </div>
                }

                {transferencia.operacion!='Posesión Efectiva' && transferencia.operacion!='Canje' && transferencia.operacion!='Bloqueo' && transferencia.operacion!='Desbloqueo' &&
                <div>
                  <Typography variant='h6'>
                    Acciones a Transferir
                  </Typography>
                  <List dense='true'           
                    subheader={
                      <ListSubheader component="div" id="nested-list-subheader">
                        <div style={{display:'flex', flexDirection:'row', justifyContent:'space-around' , width: '100%', marginTop:10}}>              
                          <Typography variant='caption'  style={{flex: 1}}>
                            Título
                          </Typography>
                          <Typography variant='caption'  style={{flex: 1}}>
                            Acciones
                          </Typography>                
                          <Typography variant='caption'  style={{flex: 2}}>
                            Transferir
                          </Typography>
                        </div>
                      </ListSubheader>
                      
                      }> 
                      {titulos.map(item => (
                        <ListItem key={item.id}>

                            <div style={{display:'flex', flexDirection:'row', justifyContent:'space-around', width: '100%', paddingRight:40 }}>              
                              <div style={{flex: 1}}>
                                <ListItemText>{item.titulo}</ListItemText>
                              </div>
                              <div style={{flex: 1}}>
                                <ListItemText>{item.acciones}</ListItemText>
                              </div>
                              <div style={{flex: 1}}>
                                <ListItemText style={{color:'#FFB74D'}}>{item.accionesTransferidas}</ListItemText>
                              </div>
                            </div>
                        </ListItem>                            
                    ))}
                  </List>
                </div>
                }       

                {(transferencia.operacion=='Canje' || transferencia.operacion=='Bloqueo' || transferencia.operacion=='Desbloqueo')&&
                <div>
                  <Typography variant='h6'>
                    Acciones
                  </Typography>
                  <List dense='true'           
                    subheader={
                      <ListSubheader component="div" id="nested-list-subheader">
                        <div style={{display:'flex', flexDirection:'row', justifyContent:'space-around' , width: '100%', marginTop:10, paddingRight:50}}>              
                          <Typography variant='caption'  style={{flex: 1}}>
                            Título
                          </Typography>
                          <Typography variant='caption'  style={{flex: 1}}>
                            Acciones
                          </Typography>                
                        </div>
                      </ListSubheader>
                      
                      }> 
                      {titulos.map(item => (
                        <ListItem key={item.id}>

                            <div style={{display:'flex', flexDirection:'row', justifyContent:'space-around', width: '100%', paddingRight:40 }}>              
                              <div style={{flex: 1}}>
                                <ListItemText>{item.titulo}</ListItemText>
                              </div>
                              <div style={{flex: 1}}>
                                <ListItemText>{item.acciones}</ListItemText>
                              </div>
                            </div>
                        </ListItem>                            
                    ))}
                  </List>
                </div>
                }                


                <div style={{display:'flex', justifyContent:'center'}}>
                  {circular && <CircularProgress />}
                </div>
              </Grid>

              <Grid item xs={4} >
                <Typography variant='h6'>
                  Documentación
                </Typography>
                { transferencia.operacion != 'Aumento Capital' &&
                <div>
                {(estado == 'Rechazada' || estado == 'Aprobada') && !anular &&
                  <label htmlFor="icon-button-fileCS">
                    <Input id="icon-button-fileCS" type="file" accept="application/pdf" onChange={onChangeCS}/>
                    <IconButton color="primary" aria-label="upload picture" component="span">
                      <EditIcon fontSize="small" color='secondary' />
                    </IconButton>
                  </label>}
                  <Button component="span" color="primary" size='small' style={{marginTop:10}} onClick={getPictureCS} disabled={transferencia.cs ? false : true}>
                    {transferencia.operacion == 'Cesión' ? 'Carta de Cesión y Gerente' :  transferencia.operacion == 'Posesión Efectiva' ? 'Carta de Posesión Efectiva' : transferencia.operacion == 'Bloqueo' || transferencia.operacion == 'Desbloqueo' ? 'Documento de Respaldo' :  transferencia.operacion == 'Testamento' ? 'Carta de Testamento' :  transferencia.operacion == 'Donación' ? 'Carta de Donación' : 'Titulo Ordinario'}
                  </Button>
                  {transferencia.cs && <CheckIcon />}
                  {formData.cs && <FiberNewOutlined color='secondary'/>}
                </div>
                }
                {transferencia.operacion != 'Canje' && transferencia.operacion != 'Bloqueo' && transferencia.operacion != 'Desbloqueo' && transferencia.operacion != 'Aumento Capital' &&
                <div>
                  {(estado == 'Rechazada' || estado == 'Aprobada') && !anular && 
                  <label htmlFor="icon-button-fileCG">
                    <Input id="icon-button-fileCG" type="file" accept="application/pdf" onChange={onChangeCG}/>
                    <IconButton color="primary" aria-label="upload picture" component="span">
                      <EditIcon fontSize="small" color='secondary' />
                    </IconButton>
                  </label>}                  
                  <Button component="span" color="primary" size='small' onClick={getPictureCG} disabled={transferencia.cg ? false : true}>
                    {transferencia.operacion == 'Cesión' ? 'Cédulas' :  transferencia.operacion == 'Testamento' ? 'Escritura de Testamento' :  transferencia.operacion == 'Donación' ? 'Escritura de Donación de Bienes' : 'Impuesto a la Herencia'}              

                  </Button>
                  {transferencia.cg  && <CheckIcon />}
                  {formData.cg && <FiberNewOutlined color='secondary'/>}
                </div>
                }

                {transferencia.operacion != 'Canje' && transferencia.operacion != 'Bloqueo' && transferencia.operacion != 'Desbloqueo' && transferencia.operacion != 'Aumento Capital' &&
                <div>
                  {(estado == 'Rechazada' || estado == 'Aprobada') && !anular && 
                  <label htmlFor="icon-button-fileCI">
                    <Input id="icon-button-fileCI" type="file" accept="application/pdf" onChange={onChangeCI}/>
                    <IconButton color="primary" aria-label="upload picture" component="span">
                      <EditIcon fontSize="small" color='secondary' />
                    </IconButton>
                  </label>}                  
                  <Button component="span" color="primary" size='small' onClick={getPictureCI} disabled={transferencia.ci ? false : true}>
                    {transferencia.operacion == 'Cesión' ? 'Carta de Instrucciones' :  transferencia.operacion == 'Testamento' ? 'Pago de Impuestos' :  transferencia.operacion == 'Donación' ? 'Pago de Impuestos' : 'Declaración Jurada'}              
                  </Button>
                  {transferencia.ci  && <CheckIcon />}
                  {formData.ci && <FiberNewOutlined color='secondary'/>}
                </div>
                }
                {transferencia.operacion != 'Canje' && transferencia.operacion != 'Bloqueo' && transferencia.operacion != 'Desbloqueo' &&
                <div>
                  {(estado == 'Rechazada' || estado == 'Aprobada') && !anular && 
                  <label htmlFor="icon-button-fileES">
                    <Input id="icon-button-fileES" type="file" accept="application/pdf" onChange={onChangeES}/>
                    <IconButton color="primary" aria-label="upload picture" component="span">
                      <EditIcon fontSize="small" color='secondary' />
                    </IconButton>
                  </label>}                  
                  <Button component="span" color="primary" size='small' onClick={getPictureES} disabled={transferencia.es ? false : true}>
                    {transferencia.operacion == 'Aumento Capital' ? 'Escritura' : transferencia.operacion == 'Cesión' ? 'Escrituras' :  transferencia.operacion == 'Testamento' ? 'Declaración Jurada' :  transferencia.operacion == 'Donación' ? 'Declaración Jurada' : 'Escritura Posesión efectiva de Bienes'}                    
                  </Button>
                  {transferencia.es  && <CheckIcon />}
                  {formData.es && <FiberNewOutlined color='secondary'/>}
                </div>
                }
                
                {transferencia.operacion != 'Cesión' && transferencia.operacion != 'Canje' && transferencia.operacion != 'Bloqueo' && transferencia.operacion != 'Desbloqueo' && transferencia.operacion != 'Aumento Capital' &&
                <div>
                  {(estado == 'Rechazada' || estado == 'Aprobada') && !anular && 
                  <label htmlFor="icon-button-fileCP">
                    <Input id="icon-button-fileCP" type="file" accept="application/pdf" onChange={onChangeCP}/>
                    <IconButton color="primary" aria-label="upload picture" component="span">
                      <EditIcon fontSize="small" color='secondary' />
                    </IconButton>
                  </label>}                  
                  <Button component="span" color="primary" size='small' onClick={getPictureCP} disabled={transferencia.cp ? false : true}>Poder</Button>
                    {transferencia.cp  && <CheckIcon />}
                  {formData.cp && <FiberNewOutlined color='secondary'/>}
                </div>  
                }   
              </Grid>  
            </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{backgroundColor:'#f9f9f9', display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>             
          <div style={{fontWeight:'normal', fontSize:10, color:'grey'}}>Solicitante: {transferencia.usuarioIngreso}</div>
          {transferencia.usuarioAprobador && <div style={{fontWeight:'normal', fontSize:10, color:'grey'}}>Aprobador: {transferencia.usuarioAprobador}    Fecha: {transferencia.fechaAprobacion} </div>}
          {!anular &&  estado == 'Pendiente' &&
          <FormControlLabel control={<Switch size="small" checked={rechazo} onChange={handleChangeRechazo}/>} label="Rechazar" />
          }

          <div>      
            {!anular && !rechazo && estado == 'Pendiente' &&
            <div>   
              <Button onClick={handleAprobarOperacion2} color="primary" variant='contained'>
                Aprobar
              </Button>
            </div>
            }

            {rechazo &&  !anular &&   (estado == 'Rechazada' || estado == 'Pendiente') &&
            <div>   

                <InputLabel id="rec"><small>Motivos de Rechazo</small></InputLabel>
                <Select labelId="rec" id="rechazo-multiple" multiple onChange={handleChangeMotivosRechazo} value={motivosRechazo}  style={{height:37 , minWidth:150, marginRight:20, fontSize: 10}}>
                  {generateSelectMotivoRechazo()}
                </Select>

              <Button onClick={handleRechazarOperacion} color="secondary" variant='contained' >
                Rechazar
              </Button>
            </div>
            }

            {anular && estado == 'Rechazada' &&
            <Button onClick={handleAnularOperacion} classes={{ root: classes.botonAnular }} variant='contained'>
              Anular
            </Button>
            }

            {!anular && estado == 'Rechazada' &&
            <Button onClick={handleReenviarOperacion} color="primary" variant='contained'>
              Volver a Solicitar Aprobación
            </Button>
            }

            {!anular && estado == 'Aprobada' &&
            <Button onClick={handleActualizarDocumentos} color="secondary" variant='contained'>
              Actualizar documentos
            </Button>
            }

          </div>            
        </DialogActions>
      </Dialog>
    
    </main>
  );
}