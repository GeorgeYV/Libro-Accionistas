import React, { useState,useEffect } from 'react';
import { makeStyles, Paper, Divider, Grid, Typography,TextField,Button,withStyles,ListItem, ListItemText, ListSubheader,ListItemIcon,
  List,IconButton,Snackbar, Switch, FormControlLabel, CircularProgress} from '@material-ui/core';

import Autocomplete from '@material-ui/lab/Autocomplete';
import { API, Storage, graphqlOperation, Auth } from 'aws-amplify';
import { listAccionistas, listTitulos } from './../graphql/queries';
import {createOperaciones, createTituloPorOperacion, createHerederoPorOperacion, updateTitulo, createTitulo} from './../graphql/mutations';

import SaveIcon from '@material-ui/icons/Save';
import CheckIcon from '@material-ui/icons/Check';
import MuiAlert from '@material-ui/lab/Alert';
import ControlPointIcon from '@material-ui/icons/ControlPoint';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

import { uuid } from 'uuidv4';
import { ConsoleLogger } from '@aws-amplify/core';
import { red } from '@material-ui/core/colors';

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
  cedente: {
    display : 'flex',
    flexDirection: 'column', 
    paddingRight : 30,
    paddingLeft : 30,
  },

}));


const today = new Date();
const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();

export default function PosesionEfectiva() {

  const [userName, setUserName] = useState("");

  const classes = useStyles();

  const [CountHeredero, setCountHeredero] = useState(1);

  const [formData, setFormData] = useState({
    fecha: fecha, operacion: 'Posesión Efectiva', 
    idCedente: '', cedente: '', idCesionario:'', cesionario: '', 
    titulo: '' , acciones: 0, 
    estado: 'Pendiente', usuarioIngreso: '', usuarioAprobador: '',
    cs: '', cg: '', ci: '', es: '', cp: ''});

  const [formDataTitulos, setFormDataTitulos] = useState({ titulos : {operacionID: '', titulo: '',acciones: '' }});
  
  const [total, setTotal] = useState(0);
  
  const [accionistas, setAccionistas] = useState([])
  
  const [titulos, setTitulos] = useState([])

  const [formHerederos, setFormHerederos] = useState([]);

  const [openSnack, setOpenSnack] = useState(false);

  const [operacion, setOperacion] = useState(1);

  const [particion, setParticion] = useState(false);

  const [totalAccionesHerencia, setTotalAccionesHerencia] = useState(0);
  
  const [circular, setCircular] = useState(false);

  const addOperacion = async () => {
    try {
        
        if (!formData.cedente || !formData.cesionario) return

        setCircular(true);

        const operacion = { ...formData }

        setFormData({ fecha: fecha, operacion: 'Posesión Efectiva', idCedente: '', cedente: '', idCesionario: '', cesionario: 'JY',titulo: '' , acciones: '',  estado: 'Pendiente', usuarioIngreso: '', usuarioAprobador: '', cs: '', cg: '', ci: '', es: '', cp: ''})
        setFormDataTitulos({ titulos : {operacionID: '', titulo: '',acciones: '' }})
        const operID = await API.graphql(graphqlOperation(createOperaciones, { input: operacion }))

        const transferir = titulos.map(function(e) {
          return {operacionID: operID.data.createOperaciones.id, titulo : e.titulo, acciones: e.acciones, tituloId: e.id, desde: e.desde, hasta: e.hasta} ;
        })

        Promise.all(
          transferir.map(input => API.graphql(graphqlOperation(createTituloPorOperacion, { input: input })))
        ).then(values => {          
          setTitulos([])
          setTotal(0)
        });

        const herederos = formHerederos.map(function(e) {
          return {numeroHeredero:  e.numeroHeredero, operacionId : operID.data.createOperaciones.id, herederoId: e.herederoId, nombre: e.nombre, cantidad: e.cantidad  }
        })

        Promise.all(
          herederos.map(input => API.graphql(graphqlOperation(createHerederoPorOperacion, { input: input })))
        ).then(values => {          
          setCountHeredero(1);          
          setFormHerederos([ ]);
          setOpenSnack(true);
          setOperacion(operacion + 1 );
          setTotalAccionesHerencia(0);

        });

        console.log('que es transferir', transferir)
        //Bloquear lo titulos
        Promise.all(
          titulos.map(input => API.graphql({ query: updateTitulo, variables: { input: {id: input.id, estado: 'Bloqueado'} } }) )           
        );
/*
        //Crear titulos si son sin partición
        if(!particion)
        {
          const titulosHerencia = titulos.map(function(e) {
            return {
            
              accionistaID: operacion.idCesionario ,
              titulo : e.titulo ,
              acciones: e.acciones ,
              fechaCompra: e.fechaCompra ,
              estado: e.estado ,
              idCedenteHereda: operacion.idCedente ,
              nombreCedenteHereda: operacion.cedente
            } ;
          })

          Promise.all(
            titulosHerencia.map(() => API.graphql({ query: createTitulo, variables: { input: titulosHerencia } }))
          )

        }
*/
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
      }
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
        ne: 'Inactivo'
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
    fetchTitulos(value.id,value.nombre);
    setTotal(0)
  }
  else {
    console.log('entró para borrar cedente', value)
    setFormData({ ...formData, 'idCedente': '', 'cedente': '' })
    setTitulos([])
    setTotal(0)
  }

}

const handleClickCesionario = (option, value, herederoNro) => {  
  if(value)
  {
      const heredero = {numeroHeredero:  herederoNro, operacionId : '', herederoId: value.id, nombre: value.nombre, cantidad: 0  }
      setFormHerederos([...formHerederos,  heredero])
      //if(particion){
      //  setFormData({ ...formData, 'idCesionario': '' , 'cesionario': 'Herederos (partición)'  })
      //}
      //else{
        setFormData({ ...formData, 'idCesionario': '' , 'cesionario': 'Herederos'  })
      //}
  }
  else {
    const index = formHerederos.map(function(e) {
      return e.numeroHeredero;
    }).indexOf(herederoNro);

    var array = formHerederos; // make a separate copy of the array
    if (index !== -1) {
      array.splice(index, 1);
      setFormHerederos(array);
      console.log('nueva arrelog',array)
    }
  }  
}

const eliminarHeredero = () => {


  const index = formHerederos.map(function(e) {
    return e.numeroHeredero;
  }).indexOf(CountHeredero);

  var array = formHerederos; // make a separate copy of the array
  console.log('index',index)
  if (index !== -1) {
    array.splice(index, 1);
    setFormHerederos(array);
    console.log('nueva arrelog',array)
  }

  console.log('nueva lista', array)
  console.log('formHerederos', formHerederos)

  setCountHeredero(CountHeredero - 1)

}

const handleCloseSnack = (event, reason) => {
  if (reason === 'clickaway') {
    return;
  }

  setOpenSnack(false);
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

const handleChangeParticion = (event) => {
  setParticion(event.target.checked);
};

const handleChangeCantidad = (event, nroHeredero) => {

  const herederos = formHerederos.map(function(e) {

    return {numeroHeredero:  e.numeroHeredero, operacionId : e.operacionId, herederoId: e.herederoId, nombre: e.nombre, cantidad: e.numeroHeredero==nroHeredero ? event.target.value : e.cantidad  }
  })

  setFormHerederos(herederos)
  console.log("herederos", herederos)
  //const totalAcciones = herederos.reduce((a, b) => a + (b['cantidad'] || 0), 0);
  setTotalAccionesHerencia(herederos.map(item => parseInt(item.cantidad)).reduce((prev, next) => prev + next));
 // console.log('totalll', herederos.map(item => parseInt(item.cantidad)).reduce((prev, next) => prev + next));
  setFormData({ ...formData, 'acciones':  herederos.map(item => parseInt(item.cantidad)).reduce((prev, next) => prev + next)})

};


  return (
    <main className={classes.content}>
    <div className={classes.appBarSpacer} />
      <Paper variant="outlined" className={classes.paper}>
      <Grid container>
        <Grid item xs={12} >
            <BlaclTextTypography variant='h6'>
              Posesión Efectiva
            </BlaclTextTypography>


            <FormControlLabel control={<Switch checked={particion} onChange={handleChangeParticion}/>} label="Con Partición" />


        </Grid>
        <Grid item xs={4} >
            <div className={classes.cedente}>
              <Autocomplete
                  //value={valCedente}
                  size='small'
                  key={operacion}
                  id="combo-box-cedente"
                  options={accionistas}
                  getOptionLabel={(option) => option.nombre ? option.nombre : ""}
                  style={{ width: 'calc(100%)'}}
                  renderInput={(params) => <TextField {...params} label="Cedente" margin="normal"  variant="outlined"  />}
                  onChange={(option, value) => handleClickCedente(option, value)}
                />

               <List dense
                    subheader={ total > 0 &&
                    <ListSubheader component="div" id="nested-list-subheader">
                        &nbsp;
                        <Typography variant='caption'>
                            <strong style={{color:'black'}}>F.Compra</strong>
                        </Typography>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <Typography variant='caption'>
                            <strong style={{color:'black'}}>Título</strong>
                        </Typography>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <Typography variant='caption'>
                            <strong style={{color:'black'}}>Cantidad</strong>
                        </Typography>
                        </ListSubheader>          
                    }
                    > 
                        {titulos.map(item => (
                            <ListItem 
                                key={item.titulo}                                 
                                //button
                                //onClick={()=>history.push(item.path)}
                                
                                >
                                <ListItemText>{item.fechaCompra}</ListItemText>                                
                                <ListItemText>{item.titulo}</ListItemText>
                                <ListItemText>{item.acciones}</ListItemText>
                            </ListItem>
                            
                        ))}
                </List>
                { total > 0 &&
                    <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
  
                        <Typography variant='caption'>
                            <strong style={{color:'black'}}> Total Acciones Cedente: {total} </strong>
                        </Typography>
                    </div>
                }                
            </div>
        </Grid>

        
        <Grid item xs={5} >
            <div className={classes.cedente}>
              <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
               <Autocomplete
                  size='small'
                  fullWidth
                  key={operacion}
                  id="heredero1"
                  options={accionistas}
                  getOptionLabel={(option) => option.nombre ? option.nombre : ""}
                  //style={{ width: 'calc(100%)'}}
                  //renderInput={(params) => <TextField {...params} label="Heredero" margin="normal"  helperText={'Acciones: ' + Math.ceil(total/CountHeredero)} variant="outlined"/>}
                  renderInput={(params) => <TextField {...params} label="Heredero" margin="normal"  variant="outlined"/>}
                  onChange={(option, value) => handleClickCesionario(option, value, 1)}
                />
                &nbsp;&nbsp;&nbsp;
                {particion && <TextField type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}} size='small' disabled={!particion} variant='outlined' label="Cantidad" defaultValue="0" style={{marginTop:7}} onChange={(event)=>handleChangeCantidad(event,1)}/>}
              </div>
                { CountHeredero > 1 &&
                <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
               <Autocomplete
               //value={formHerederos[1]}
                 // key={operacion}
                  size='small'
                  id="heredero2"
                  options={accionistas}
                  getOptionLabel={(option) => option.nombre ? option.nombre : ""}
                  style={{ width: 'calc(100%)'}}
                  //renderInput={(params) => <TextField {...params} label="Heredero" margin="normal" helperText={'Acciones: ' + ~~(total/CountHeredero)} variant="outlined"/>}
                  renderInput={(params) => <TextField {...params} label="Heredero" margin="normal" variant="outlined"/>}
                  onChange={(option, value) => handleClickCesionario(option, value, 2)}
                />                
                &nbsp;&nbsp;&nbsp;
                {particion && <TextField type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}} size='small' disabled={!particion} variant='outlined' label="Cantidad" defaultValue="0" style={{marginTop:7}} onChange={(event)=>handleChangeCantidad(event,2)}/>}
              </div>  }              
                { CountHeredero > 2 &&
              <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>                
               <Autocomplete
               //value={formHerederos[2]}
                  //key={operacion}
                  size='small'
                  id="heredero3"
                  options={accionistas}
                  getOptionLabel={(option) => option.nombre ? option.nombre : ""}
                  style={{ width: 'calc(100%)'}}
                  renderInput={(params) => <TextField {...params} label="Heredero" margin="normal" variant="outlined"/>}
                  onChange={(option, value) => handleClickCesionario(option, value, 3)}
                />
                &nbsp;&nbsp;&nbsp;
                {particion && <TextField type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}} size='small' disabled={!particion} variant='outlined' label="Cantidad" defaultValue="0" style={{marginTop:7}} onChange={(event)=>handleChangeCantidad(event,3)}/>}
              </div>  }        
                { CountHeredero > 3 &&
              <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>                
               <Autocomplete
                //value={formHerederos[3]}}
                  //key={operacion}
                  size='small'
                  id="heredero4"
                  options={accionistas}
                  getOptionLabel={(option) => option.nombre ? option.nombre : ""}
                  style={{ width: 'calc(100%)'}}
                  renderInput={(params) => <TextField {...params} label="Heredero" margin="normal"  variant="outlined"/>}
                  onChange={(option, value) => handleClickCesionario(option, value, 4)}
                />  
                &nbsp;&nbsp;&nbsp;
                {particion && <TextField type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}} size='small' disabled={!particion} variant='outlined' label="Cantidad" defaultValue="0" style={{marginTop:7}} onChange={(event)=>handleChangeCantidad(event,4)}/>}
              </div>  }        
                { CountHeredero > 4 &&     
              <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>                  
               <Autocomplete
                  //value={formHerederos[4]}
                  //key={operacion}
                  size='small'
                  id="heredero5"
                  options={accionistas}
                  getOptionLabel={(option) => option.nombre ? option.nombre : ""}
                  style={{ width: 'calc(100%)'}}
                  renderInput={(params) => <TextField {...params} label="Heredero" margin="normal"  variant="outlined"/>}
                  onChange={(option, value) => handleClickCesionario(option, value, 5)}
                />   
                &nbsp;&nbsp;&nbsp;
                {particion && <TextField type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}} size='small' disabled={!particion} variant='outlined' label="Cantidad" defaultValue="0" style={{marginTop:7}} onChange={(event)=>handleChangeCantidad(event,5)}/>}
              </div>  }   

              { CountHeredero > 5 &&     
              <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>                  
               <Autocomplete
                  //value={formHerederos[4]}
                  //key={operacion}
                  size='small'
                  id="heredero6"
                  options={accionistas}
                  getOptionLabel={(option) => option.nombre ? option.nombre : ""}
                  style={{ width: 'calc(100%)'}}
                  renderInput={(params) => <TextField {...params} label="Heredero" margin="normal"  variant="outlined"/>}
                  onChange={(option, value) => handleClickCesionario(option, value, 6)}
                />   
                &nbsp;&nbsp;&nbsp;
                {particion && <TextField type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}} size='small' disabled={!particion} variant='outlined' label="Cantidad" defaultValue="0" style={{marginTop:7}} onChange={(event)=>handleChangeCantidad(event,6)}/>}
              </div>  }   
              

              { CountHeredero > 6 &&     
              <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>                  
               <Autocomplete
                  //value={formHerederos[4]}
                  //key={operacion}
                  size='small'
                  id="heredero5"
                  options={accionistas}
                  getOptionLabel={(option) => option.nombre ? option.nombre : ""}
                  style={{ width: 'calc(100%)'}}
                  renderInput={(params) => <TextField {...params} label="Heredero" margin="normal"  variant="outlined"/>}
                  onChange={(option, value) => handleClickCesionario(option, value, 7)}
                />   
                &nbsp;&nbsp;&nbsp;
                {particion && <TextField type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}} size='small' disabled={!particion} variant='outlined' label="Cantidad" defaultValue="0" style={{marginTop:7}} onChange={(event)=>handleChangeCantidad(event,7)}/>}
              </div>  }   
              
              { CountHeredero > 7 &&     
              <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>                  
               <Autocomplete
                  //value={formHerederos[4]}
                  //key={operacion}
                  size='small'
                  id="heredero5"
                  options={accionistas}
                  getOptionLabel={(option) => option.nombre ? option.nombre : ""}
                  style={{ width: 'calc(100%)'}}
                  renderInput={(params) => <TextField {...params} label="Heredero" margin="normal"  variant="outlined"/>}
                  onChange={(option, value) => handleClickCesionario(option, value, 8)}
                />   
                &nbsp;&nbsp;&nbsp;
                {particion && <TextField type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}} size='small' disabled={!particion} variant='outlined' label="Cantidad" defaultValue="0" style={{marginTop:7}} onChange={(event)=>handleChangeCantidad(event,8)}/>}
              </div>  }   
              
              { CountHeredero > 8 &&     
              <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>                  
               <Autocomplete
                  //value={formHerederos[4]}
                  //key={operacion}
                  size='small'
                  id="heredero5"
                  options={accionistas}
                  getOptionLabel={(option) => option.nombre ? option.nombre : ""}
                  style={{ width: 'calc(100%)'}}
                  renderInput={(params) => <TextField {...params} label="Heredero" margin="normal"  variant="outlined"/>}
                  onChange={(option, value) => handleClickCesionario(option, value, 9)}
                />   
                &nbsp;&nbsp;&nbsp;
                {particion && <TextField type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}} size='small' disabled={!particion} variant='outlined' label="Cantidad" defaultValue="0" style={{marginTop:7}} onChange={(event)=>handleChangeCantidad(event,9)}/>}
              </div>  }   
              
              { CountHeredero > 9 &&     
              <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>                  
               <Autocomplete
                  //value={formHerederos[4]}
                  //key={operacion}
                  size='small'
                  id="heredero5"
                  options={accionistas}
                  getOptionLabel={(option) => option.nombre ? option.nombre : ""}
                  style={{ width: 'calc(100%)'}}
                  renderInput={(params) => <TextField {...params} label="Heredero" margin="normal"  variant="outlined"/>}
                  onChange={(option, value) => handleClickCesionario(option, value, 10)}
                />   
                &nbsp;&nbsp;&nbsp;
                {particion && <TextField type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}} size='small' disabled={!particion} variant='outlined' label="Cantidad" defaultValue="0" style={{marginTop:7}} onChange={(event)=>handleChangeCantidad(event,10)}/>}
              </div>  }   
              



                <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>    
                  <div>                        
                    <IconButton color='primary' onClick={() => setCountHeredero(CountHeredero + 1)} disabled={CountHeredero===10 ? true : false}><ControlPointIcon/></IconButton>
                    <IconButton color='primary' onClick={() => eliminarHeredero()} disabled={CountHeredero===1 ? true : false}><RemoveCircleOutlineIcon/></IconButton>
                  </div>
                  {formHerederos.length > 0 && particion &&
                    <small style={{color:total - totalAccionesHerencia < 0 ?'red':'black'}}> Saldo: <strong>{total - totalAccionesHerencia}</strong> </small>                  
                  }
                </div>            
            </div>
            {circular && <CircularProgress />}
        </Grid>



        <Grid item xs={3} container direction='column' justifyContent= 'flex-start' style={{backgroundColor:'#f9f9f9', padding:20,}}>
          <BlaclTextTypography variant='subtitle1' >
            Documentos requeridos
          </BlaclTextTypography>
          <label htmlFor="upload-photo1" style={{marginTop:'10px',display:'flex', flexDirection:'row', alignItems:'center'}}>
            <input style={{ display: 'none' }} id="upload-photo1" name="upload-photo1" type="file" onChange={onChangeCS} />
            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',}}>Carta de Posesión Efectiva</Button>
            {formData.cs.length > 0 && <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}> <CheckIcon color='primary' /> <IconButton onClick={() => setFormData({ ...formData, 'cs': ''})} ><DeleteOutlineIcon color='disabled'/></IconButton>  </div>}
          </label>
          <label htmlFor="upload-photo4" style={{marginTop:'10px',display:'flex', flexDirection:'row', alignItems:'center'}}>
            <input style={{ display: 'none' }} id="upload-photo4" name="upload-photo4" type="file" onChange={onChangeES} />
            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',}}>Escritura de Posesión efectiva de Bienes</Button>
            {formData.es.length > 0 && <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}> <CheckIcon color='primary' /> <IconButton onClick={() => setFormData({ ...formData, 'es': ''})} ><DeleteOutlineIcon color='disabled'/></IconButton>  </div>}
          </label>
          <label htmlFor="upload-photo2" style={{marginTop:'10px',display:'flex', flexDirection:'row', alignItems:'center'}}>
            <input style={{ display: 'none' }} id="upload-photo2" name="upload-photo2" type="file" onChange={onChangeCG} />
            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',}}>Impuesto a la Herencia</Button>
            {formData.cg.length > 0 && <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}> <CheckIcon color='primary' /> <IconButton onClick={() => setFormData({ ...formData, 'cg': ''})} ><DeleteOutlineIcon color='disabled'/></IconButton>  </div>}
          </label>

          <label htmlFor="upload-photo3" style={{marginTop:'10px',display:'flex', flexDirection:'row', alignItems:'center'}}>
            <input style={{ display: 'none' }} id="upload-photo3" name="upload-photo3" type="file" onChange={onChangeCI} />
            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',}}>Declaración Jurada</Button>
            {formData.ci.length > 0 && <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}> <CheckIcon color='primary' /> <IconButton onClick={() => setFormData({ ...formData, 'ci': ''})} ><DeleteOutlineIcon color='disabled'/></IconButton>  </div>}
          </label>

          <label htmlFor="upload-photo5" style={{marginTop:'10px',display:'flex', flexDirection:'row', alignItems:'center'}}>
            <input style={{ display: 'none' }} id="upload-photo5" name="upload-photo5" type="file" onChange={onChangeCP} />
            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',}}>Carta Poder</Button>
            {formData.cp.length > 0 && <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}> <CheckIcon color='primary' /> <IconButton onClick={() => setFormData({ ...formData, 'cp': ''})} ><DeleteOutlineIcon color='disabled'/></IconButton>  </div>}
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
                    //disabled={total - formHerederos.length > 0 && particion ? totalAccionesHerencia < 0 ? true : false : 0}
                    disabled = {(total - totalAccionesHerencia < 0 && particion) || (isNaN(total - totalAccionesHerencia) && particion)}
                >
                    Solicitar aprobación
                </Button>
        </Grid>

  
      </Grid>


      <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
        <Alert onClose={handleCloseSnack} severity="success">
          Se registró la solicitud de Posesión Efectiva.
        </Alert>
      </Snackbar>

     </Paper>

  </main>




    
  );
}