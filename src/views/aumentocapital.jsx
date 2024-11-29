import React, { useState,useEffect } from 'react';
import { makeStyles, Paper, Divider, Grid, Typography,TextField,Button,withStyles,ListItem, ListItemText, ListSubheader,ListItemIcon,
  List,IconButton,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,Checkbox,Snackbar,CircularProgress, Chip } from '@material-ui/core';



import Autocomplete from '@material-ui/lab/Autocomplete';
import { API, Storage, graphqlOperation, Auth } from 'aws-amplify';
import { listAccionistas, getParametro } from './../graphql/queries';
import {createOperaciones, createTituloPorOperacion, updateTitulo} from './../graphql/mutations';

import SaveIcon from '@material-ui/icons/Save';
import CheckIcon from '@material-ui/icons/Check';
import MuiAlert from '@material-ui/lab/Alert';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

import VisibilityIcon from '@material-ui/icons/Visibility';

import { uuid } from 'uuidv4';
import { Label } from '@material-ui/icons';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const BlaclTextTypography = withStyles({
  root: {
    color: "#000000",
  }
})(Typography);

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'left',
    color: theme.palette.text.secondary,
    //height: '83vh',
    height:'calc(100%)',
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
  },
  titulos: {
    flexDirection: 'row',
 
},

}));


const today = new Date();
const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();



export default function AumentoCapital() {

  const classes = useStyles();

  const [userName, setUserName] = useState("");
 
  const [formData, setFormData] = useState({
    fecha: fecha, operacion: 'Aumento Capital', 
    idCedente: '', cedente: '', idCesionario:'', cesionario: '', 
    titulo: '' , acciones: 0, 
    estado: 'Pendiente', usuarioIngreso: '', usuarioAprobador: '',
    cs: '', cg: '', ci: '', es: '', cp: '',
    valorNominal : 0,  capital : 0,  fechaValor : '' });

  const [valCedente,setValCedente]=useState({})
  const [valCesionario,setValCesionario]=useState({})

  const [total, setTotal] = useState(0);

  const [checked, setChecked] = useState([0]);

  const [openTitulos, setOpenTitulos] = useState(false);
  
  const [accionistas, setAccionistas] = useState([])
  
  const [titulos, setTitulos] = useState([])
  
  const [titulosSelectos, setTitulosSelectos] = useState([])
  
  const [titulosPorOper, settitulosPorOper] = useState([])

  const [openSnack, setOpenSnack] = useState(false);

  const [circular, setCircular] = useState(false);

  const [cesionMayorCantidad, setCesionMayorCantidad] = useState(false);

  const [cantidadEmitido, setCantidadEmitido] = useState(0);
  const [valorNominal, setValorNominal] = useState(0);
  const [capitalAumentado, setCapitalAumentado] = useState(0);


  const addOperacion = async () => {
    try {
      
        if (!formData.capital || !formData.cesionario) return

        setCircular(true);

        const operacion = { ...formData }

        setOpenSnack(true)
        
        setFormData({ fecha: fecha, operacion: 'Aumento Capital', idCedente: '', cedente: '', idCesionario: '', cesionario: '',titulo: '' , acciones: '',  estado: 'Pendiente', usuarioIngreso: userName, usuarioAprobador: '', cs: '', cg: '', ci: '', es: '', cp: '', valorNominal : 0,  capital : 0,  fechaValor : ''})
        const operID = await API.graphql(graphqlOperation(createOperaciones, { input: operacion }))

        /*
        const transferir = titulosPorOper.map(function(e) {
          return {operacionID: operID.data.createOperaciones.id, tituloId : e.tituloId, titulo : e.titulo, acciones: e.acciones, accionesTransferidas: e.accionesTransferidas, desde: e.desde, hasta: e.hasta} ;
        })
     
        console.log("grabar acciones", transferir)
        Promise.all(
          transferir.map(input => API.graphql(graphqlOperation(createTituloPorOperacion, { input: input })))
        ).then(values => {
          setOpenSnack(true)
          setChecked([])
          setTitulos([])
          setTitulosSelectos([])
          settitulosPorOper([])
          setTotal(0)
          setValCedente({})
          setValCesionario({})
        });
*/
setValCesionario({})

        setCircular(false);

    } catch (err) {
        console.log('error creating transaction:', err)
    }
    
  }


  useEffect(() => {
    fetchAccionistas();
    fetchParametros();
    let user = Auth.user;     
    setUserName(user.username);
    

  }, [])

  async function fetchAccionistas() {

    const filter = {
      estado: {
        ne: 'Inactivo'
      }
    };
    const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 1000} });
    const accionistasFromAPI = apiData.data.listAccionistas.items;
    setAccionistas(accionistasFromAPI);
    
  }

  async function fetchParametros() {

    const apiData = await API.graphql({ query: getParametro , variables: { id: '1' } });

    const parametrosFromAPI = apiData.data.getParametro;    

    //setCantidadEmitido(parametrosFromAPI.cantidadEmitida);
    setValorNominal(parametrosFromAPI.valorNominal);

}


const handleClickCesionario = (option, value) => {  
  if(value)
  {
    setValCesionario(value)
    setFormData({ ...formData, 'idCesionario': value.id,'cesionario': value.nombre  })
  }
  else {
    setValCesionario({})
    setFormData({ ...formData, 'idCesionario': '', 'cesionario': ''})
  }  
}


const handleCloseSnack = (event, reason) => {
  if (reason === 'clickaway') {
    return;
  }

  setOpenSnack(false);
};

async function onChangeES(e) {
  if (!e.target.files[0]) return
  const file = e.target.files[0];
  const filename = uuid() + file.name
  setFormData({ ...formData, es: filename });
  await Storage.put(filename, file);
}


const getPictureES = e => {
  e.stopPropagation();
  
  Storage.get(formData.es)
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

const handleCantidadEmitidoChange = (event) => {

    setCantidadEmitido(event.target.value.replace(/[^0-9]/g, ''));
    //console.log("CAPITAL AUMENTAO",event.target.value.replace(/[^0-9]/g, ''),valorNominal,(event.target.value.replace(/[^0-9]/g, '')*valorNominal));
    setCapitalAumentado((event.target.value.replace(/[^0-9]/g, '')*valorNominal).toFixed(2));
    setFormData({ ...formData, 'acciones': event.target.value.replace(/[^0-9]/g, ''),'valorNominal': valorNominal, 'capital' : (event.target.value.replace(/[^0-9]/g, '')*valorNominal).toFixed(2)  });
  
  };

  const handleValorNominalChange = (event) => {

    setValorNominal(event.target.value.replace(/[^0-9.]/g, ''));
    setCapitalAumentado((cantidadEmitido*valorNominal));
    setFormData({ ...formData, 'acciones': cantidadEmitido,'valorNominal': valorNominal, 'capital' : (cantidadEmitido*valorNominal)  });
  };


  return (
    <main className={classes.content}>
    <div className={classes.appBarSpacer} />

      <Paper variant="outlined" className={classes.paper}>

      <Grid container>
        <Grid item xs={3} >
          <BlaclTextTypography variant='h6'>
              Aumento de Capital
          </BlaclTextTypography>
               
                <Autocomplete
                  value={valCesionario}
                  size='small'
                  id="combo-box-cecionario"
                  options={accionistas}
                  getOptionLabel={(option) => option.nombre}
                  style={{ width: 'calc(100%)'}}
                  renderInput={(params) => <TextField {...params} label="Beneficiario" margin="normal" variant='outlined'/>}
                  onChange={(option, value) => handleClickCesionario(option, value)}
                />

                <TextField
                    id="outlined-required1"
                    label="Cantidad Emitida"
                    value={cantidadEmitido}
                    onChange={handleCantidadEmitidoChange}
                    style={{marginTop:20}}
                /> 
                <TextField
                    id="outlined-required2"
                    label="Valor Nominal"
                    value={valorNominal}
                    onChange={handleValorNominalChange}
                    style={{marginTop:20}}
                    disabled
                />  
                <TextField
                    id="outlined-required1"
                    label="Capital"
                    value={capitalAumentado}
                    style={{marginTop:20}}
                    disabled
                /> 

        </Grid>
        <Grid item xs={1} >
        </Grid>
        <Grid item xs={4}>
        </Grid>
        <Grid item xs={1} >
        </Grid>

        <Grid item xs={3} container direction='column' justifyContent= 'flex-start' style={{backgroundColor:'#f9f9f9', padding:20, borderRadius: 10,}}>
          <BlaclTextTypography variant='h6' >
            Documentos Requeridos
          </BlaclTextTypography>

          <label htmlFor="upload-photo4" style={{marginTop:'10px',display:'flex', flexDirection:'row', alignItems:'center'}}>
            <input style={{ display: 'none' }} id="upload-photo4" name="upload-photo4" type="file" accept="application/pdf" onChange={onChangeES} />
            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',}}>Escrituras</Button>
            {formData.es.length > 0 && <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>  <IconButton onClick={() => setFormData({ ...formData, 'es': ''}) }><DeleteOutlineIcon color='disabled'/></IconButton> <IconButton onClick={getPictureES} ><VisibilityIcon color='primary'/></IconButton> </div>}
          </label>          
        </Grid>
        <Grid item xs={12} style={{paddingTop:20}} >
          <Divider/>
        </Grid>
        <Grid item xs={12} container direction='row' justifyContent= 'flex-end'>

        <Button                
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    startIcon={<SaveIcon/>}                    
                    size='small'
                    onClick={addOperacion}
                    disabled={formData.capital <= 0 && !formData.cesionario}
                >
                    Solicitar Aprobación
                </Button>
        </Grid>

  
      </Grid>


      <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
        <Alert onClose={handleCloseSnack} severity="success">
          Se registró exitosamente la solicitud de Aumento de Capital
        </Alert>
      </Snackbar>

     </Paper>

  </main>




    
  );
}