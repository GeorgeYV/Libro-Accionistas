import React, { useState,useEffect } from 'react';
import { makeStyles, Paper, Avatar , Grid, Typography,TextField,Button,withStyles,ListItem, ListItemText, ListSubheader,ListItemIcon,
  List,IconButton,Snackbar, CircularProgress, LinearProgress } from '@material-ui/core';

import Autocomplete from '@material-ui/lab/Autocomplete';
import { API, Storage, graphqlOperation, Auth } from 'aws-amplify';
import { listAccionistas, listTitulos } from './../graphql/queries';
import { createOperaciones, createTituloPorOperacion, updateTitulo} from './../graphql/mutations';

import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import SyncOutlinedIcon from '@material-ui/icons/SyncOutlined';     
import SaveIcon from '@material-ui/icons/Save';
import CheckIcon from '@material-ui/icons/Check';
import MuiAlert from '@material-ui/lab/Alert';

import { uuid } from 'uuidv4';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'left',
    color: theme.palette.text.secondary,
    //height: '83vh',
    height:'calc(100%)',
    display:'flex',    
    justifyContent:'center',
    alignItems:'center',
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
    display : 'flex',
    flexDirection: 'column', 
    width: '90%',
    marginTop: 20,
  },

}));


const today = new Date();
const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();

export default function Canje() {

  const [userName, setUserName] = useState("");

  const classes = useStyles();

  const [formData, setFormData] = useState({
    fecha: fecha, operacion: 'Canje', 
    idCedente: '', cedente: '', idCesionario:'', cesionario: '', 
    titulo: '' , acciones: 0, 
    estado: 'Pendiente', usuarioIngreso: '', usuarioAprobador: '',
    cs: '', cg: '', ci: '', es: '', cp: ''});

  const [valCedente,setValCedente]=useState({})    

  const [total, setTotal] = useState(0);
  
  const [accionistas, setAccionistas] = useState([])
  
  const [titulos, setTitulos] = useState([])

  const [openSnack, setOpenSnack] = useState(false);

  const [operacion, setOperacion] = useState(1);
  
  const [circular, setCircular] = useState(false);

  const [progreso, setProgreso] = useState(0);

  const addOperacion = async () => {
    try {
        
        if (!formData.cedente) return

        setCircular(true);

        const operacion = { ...formData }

        setFormData({ fecha: fecha, operacion: 'Canje', idCedente: '', cedente: '', idCesionario: '', cesionario: '', titulo: '' , acciones: '',  estado: 'Pendiente', usuarioIngreso: '', usuarioAprobador: '', cs: '', cg: '', ci: '', es: '', cp: ''})

        const operID = await API.graphql(graphqlOperation(createOperaciones, { input: operacion }))

        const transferir = titulos.map(function(e) {
          return {operacionID: operID.data.createOperaciones.id, titulo : e.titulo, acciones: e.acciones, tituloId: e.id} ;
        })

        Promise.all(
          transferir.map(input => API.graphql(graphqlOperation(createTituloPorOperacion, { input: input })))
        ).then(values => {          
          setTitulos([])
          setTotal(0)
          setValCedente({})
        });

        //Bloquear lo titulos
        Promise.all(
          titulos.map(input => API.graphql({ query: updateTitulo, variables: { input: {id: input.id, estado: 'Bloqueado'} } }) ) 
          
        );

        setCircular(false);

         } catch (err) {
        console.log('error creating transaction:', err)
    }   
  }


  useEffect(() => {
    fetchAccionistas();
    let user = Auth.user;     
    setUserName(user.username);    
  }, [])

  async function fetchAccionistas() {
    const filter = {
      estado: {
        eq: 'Activo',
      },
      tipoAcciones: {
        eq: 'M',
      },
    };
    const apiData = await API.graphql({ query: listAccionistas , variables:{filter: filter, limit:1000}});
    const accionistasFromAPI = apiData.data.listAccionistas.items;
    await Promise.all(accionistasFromAPI.map(async accionista => {
    return accionista;
    }))
    setAccionistas(apiData.data.listAccionistas.items);
    
  }

  async function fetchTitulos(cedenteId, cedenteNombre) {

    let filter = {
      accionistaID: {
          eq: cedenteId // filter priority = 1
      },
      estado:{
        eq: 'Activo'
      }
    };

    const apiData = await API.graphql({ query: listTitulos, variables: { filter: filter, limit: 1000} });
    const titulosFromAPI = apiData.data.listTitulos.items;
    setTitulos(titulosFromAPI);
  
    
    const sum = titulosFromAPI.reduce(function(prev, current) {
        return prev + +current.acciones
      }, 0);
      setTotal(sum);
  
      const tituloString = titulosFromAPI.map(function(titulos){
        return titulos.titulo;
      }).join(" | ");
      
      setFormData({ ...formData, 'titulo': tituloString, 'acciones': sum, 'idCedente': cedenteId, 'cedente': cedenteNombre, 'usuarioIngreso' : userName})

  }

const handleClickCedente = (option, value) => {  
  if(value)
  {
    setValCedente(value)
    fetchTitulos(value.id,value.nombre);
    setTotal(0)
    setProgreso(progreso+50)
  }
  else {
    setFormData({ ...formData, 'idCedente': '', 'cedente': '' })
    setTitulos([])
    setTotal(0)
    setProgreso(progreso-50)
    setValCedente({})
  }
}

const handleCloseSnack = (event, reason) => {
  if (reason === 'clickaway') {
    return;
  }
  setOpenSnack(false);
};


async function onChangeCS(e) {
  if (!e.target.files[0]){
    console.log('entro al cancelar')
    return
  }
  const file = e.target.files[0];
  const filename = uuid() + file.name
  setFormData({ ...formData, cs: filename });
  await Storage.put(filename, file);
  setProgreso(progreso+50)
}


  return (
    <main className={classes.content}>
    <div className={classes.appBarSpacer} />
      <Paper variant="elevation" className={classes.paper}>
        <Grid container style={{width:'90%'}}>
            <Grid item xs={12} >
              <Paper elevation={0} style={{height:50, display:'flex', flexDirection:'row', justifyContent:'flex-start',  alignItems:'center', width:'100%', padding:10, }}>              
                <Avatar style={{backgroundColor:'#f9f9f9' , height: '30px', width: '30px'}}>
                  <SyncOutlinedIcon color='primary'/>                        
                </Avatar>  
                <Typography variant='subtitle2' color='primary' style={{paddingLeft:10}}>
                  Canjear Acciones Ordinarias
                </Typography>            
              </Paper>
              <LinearProgress variant="determinate" value={progreso} style={{width:'100%', marginTop: 5}}/>
            </Grid>
          
        <Grid item xs={4} >
          <div className={classes.cedente}>
            <Typography variant='subtitle2'>
              Buscar Accionista
            </Typography>
            <Autocomplete
                value={valCedente}
                size='small'
                key={operacion}
                id="combo-box-cedente"
                options={accionistas}
                getOptionLabel={(option) => option.nombre ? option.nombre : ""}
                style={{ width: 'calc(100%)'}}
                renderInput={(params) => <TextField {...params} label="Accionista" margin="normal"  variant="outlined"  />}
                onChange={(option, value) => handleClickCedente(option, value)}
              />
              { total > 0 &&
                  <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                      <Typography variant='caption' color='primary'>
                          Total Acciones Ordinarias: {total}
                      </Typography>
                  </div>
              }                
          </div>
        </Grid>
        
        <Grid item xs={4} >
          {total > 0 &&
            <div style={{display:'flex', flexDirection:'column', justifyContent:'center' , width: '90%', marginTop:20}}>                    
              <Typography variant='subtitle2' style={{marginBottom:10, marginLeft:20}}>
                Títulos
              </Typography>
                <List dense
                    subheader={                         
                    <ListSubheader component="div" id="nested-list-subheader">
                        <div style={{display:'flex', flexDirection:'row', justifyContent:'space-around' , width: '90%', marginLeft:10}}>              
                            <Typography variant='caption' style={{flex:1}}>
                                <strong style={{color:'black'}}>F.Compra</strong>
                            </Typography>
                            <Typography variant='caption' style={{flex:1}}>
                                <strong style={{color:'black'}}>Título</strong>
                            </Typography>
                            <Typography variant='caption' style={{flex:1}}>
                                <strong style={{color:'black'}}>Cantidad</strong>
                            </Typography>
                            </div>  
                        </ListSubheader>        
                    }
                    > 
                        {titulos.map(item => (
                            <ListItem key={item.titulo}>
                              <div style={{display:'flex', flexDirection:'row', justifyContent:'space-around' , width: '100%'}}>              
                                <ListItemText style={{flex:1}}>{item.fechaCompra}</ListItemText>                                
                                <ListItemText style={{flex:1}}>{item.titulo}</ListItemText>
                                <ListItemText style={{flex:1}}>{item.acciones}</ListItemText>
                               </div>
                            </ListItem>
                            
                        ))}
                </List>
            </div>
          }
          {circular && <CircularProgress />}
        </Grid>

        <Grid item xs={4} container>
          <div style={{display:'flex', flexDirection:'column', marginTop:20, paddingLeft:10}}>
            <Typography variant='subtitle2' style={{marginBottom:10}}>
              Documentación
            </Typography>
            <label htmlFor="upload-photo1">
              <input style={{ display: 'none' }} id="upload-photo1" name="upload-photo1" type="file" accept="application/pdf" onChange={onChangeCS} />
              <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='medium' style={{textTransform: 'none',}}>Título Ordinario</Button>
              {formData.cs.length > 0 && <IconButton ><CheckIcon /></IconButton>}
            </label>
          </div>       
        </Grid>

        <Grid item xs={12} container direction='row' justifyContent= 'center' style={{paddingTop:20}} >
          <Button                
              variant="contained"
              color="primary"
              className={classes.button}
              startIcon={<SaveIcon/>}                    
              size='medium'
              onClick={addOperacion}
              disabled={total > 0 && formData.cs.length > 0 ? false : true}
          >
              Solicitar aprobación
          </Button>
        </Grid>

  
      </Grid>


      <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
        <Alert onClose={handleCloseSnack} severity="success">
          Se registró la solicitud de Canje.
        </Alert>
      </Snackbar>

     </Paper>

  </main>
    
  );
}