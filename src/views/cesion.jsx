import React, { useState,useEffect } from 'react';
import { makeStyles, Paper, Divider, Grid, Typography,TextField,Button,withStyles,ListItem, ListItemText, ListSubheader,ListItemIcon,
  List,IconButton,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,Checkbox,Snackbar,CircularProgress, Chip } from '@material-ui/core';



import Autocomplete from '@material-ui/lab/Autocomplete';
import { API, Storage, graphqlOperation, Auth } from 'aws-amplify';
import { listAccionistas, listTitulos } from './../graphql/queries';
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



export default function Cesion() {

  const classes = useStyles();

  const [userName, setUserName] = useState("");
 
  const [formData, setFormData] = useState({
    fecha: fecha, operacion: 'Cesión', 
    idCedente: '', cedente: '', idCesionario:'', cesionario: '', 
    titulo: '' , acciones: 0, 
    estado: 'Pendiente', usuarioIngreso: '', usuarioAprobador: '',
    cs: '', cg: '', ci: '', es: '', cp: ''});

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

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
    
  };


  const addOperacion = async () => {
    try {
      
        if (!formData.cedente || !formData.cesionario) return

        setCircular(true);

        const operacion = { ...formData }

        setFormData({ fecha: fecha, operacion: 'Cesión', idCedente: '', cedente: '', idCesionario: '', cesionario: 'JY',titulo: '' , acciones: '',  estado: 'Pendiente', usuarioIngreso: userName, usuarioAprobador: '', cs: '', cg: '', ci: '', es: '', cp: ''})
        const operID = await API.graphql(graphqlOperation(createOperaciones, { input: operacion }))



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


        //Bloquear lo titulos
        Promise.all(
          transferir.map(input => API.graphql({ query: updateTitulo, variables: { input: {id: input.tituloId, estado: 'Bloqueado'} } }))
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
    //console.log('USER',user.username);

  }, [])

  async function fetchAccionistas() {

    const filter = {
      estado: {
        ne: 'Inactivo'
      }
    };
    const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 1000} });
    const accionistasFromAPI = apiData.data.listAccionistas.items;


/////////

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


///////////


   // setAccionistas(accionistasFromAPI);
    
  }

  async function fetchTitulos(cedente) {

    const filter = {
      accionistaID: {
          eq: cedente // filter priority = 1
      },
      estado: {
        eq: 'Activo'
      }
    };

    const apiData = await API.graphql({ query: listTitulos, variables: { filter: filter, limit : 1000} });
    const titulosFromAPI = apiData.data.listTitulos.items;
    //await Promise.all(titulosFromAPI.map(async titulos => {
    //return titulos;
    //}))
    console.log('busca titulos cedente',titulosFromAPI)
    setTitulos(titulosFromAPI);
    
  }

const handleClickCedente = (option, value) => {  

  if(value)
  {

    setValCedente(value)

    setFormData({ ...formData, 'idCedente': value.id, 'cedente': value.nombre2, 'usuarioIngreso' : userName})
    fetchTitulos(value.id);

    setChecked([])
    setTitulosSelectos([])
    settitulosPorOper([])
    setTotal(0)

  }
  else {

    setFormData({ ...formData, 'idCedente': '', 'cedente': '' })
    setChecked([])
    setTitulos([])
    setTitulosSelectos([])
    settitulosPorOper([])
    setTotal(0)
    setValCedente({})
  }

}

const handleClickCesionario = (option, value) => {  
  if(value)
  {
    setValCesionario(value)
    setFormData({ ...formData, 'idCesionario': value.id,'cesionario': value.nombre2  })
  }
  else {
    setValCesionario({})
    setFormData({ ...formData, 'idCesionario': '', 'cesionario': ''})
  }  
}


const handleOpenTitulos = () => {
  setOpenTitulos(true);
};


const handleSeleccionarTitulos = () => {
  //  var data = { records : [{ "empid": 1, "fname": "X", "lname": "Y" }, { "empid": 2, "fname": "A", "lname": "Y" }, { "empid": 3, "fname": "B", "lname": "Y" }, { "empid": 4, "fname": "C", "lname": "Y" }, { "empid": 5, "fname": "C", "lname": "Y" }] }
  //var empIds = [1,4,5]
  var filteredTitulos = titulos.filter(function(itm){
    return checked.indexOf(itm.id) > -1;
  });

  //filteredTitulos = { records : filteredArray };
  setTitulosSelectos(filteredTitulos)
console.log('filtrados',filteredTitulos)

  const tituloString = filteredTitulos.map(function(titulos){
    return titulos.titulo;
  }).join(" | ");
  
  //setFormData({ ...formData, 'titulo': tituloString })

  const sum = filteredTitulos.reduce(function(prev, current) {
    return prev + +current.acciones
  }, 0);
  setTotal(sum);

  //setFormData({ ...formData, 'acciones': sum })

//  const transferir = filteredTitulos.map(function(e) {
//    return {operacionID: '', titulo : e.titulo, acciones: e.acciones, accionesTransferidas: e.accionesTransferidas} ;
//  })

  
  //setFormDataTitulos({ ...formDataTitulos, 'titulos': transferir })
  //setFormDataTitulos2({ ...formDataTitulos2,  transferir })

  setFormData({ ...formData, 'titulo': tituloString,'acciones': sum})
  setOpenTitulos(false);


  const transferir = filteredTitulos.map(function(e) {
    //return {operacionID: e.operacionID, tituloId: e.id, titulo : e.titulo, acciones: e.acciones, accionesTransferidas: e.acciones } ;
    return {operacionID: e.operacionID, tituloId: e.id, titulo : e.titulo, acciones: e.acciones, accionesTransferidas: e.acciones, desde: e.desde , hasta: e.hasta } ;
  })

  settitulosPorOper(transferir)



};

/*
const handleInputAccionesChange = (e) => {
  setTitulosSelectos({
      [e.target.name]: e.target.value
  });
}
*/
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

const handleChangeCantidad = (event, item) => {

/*
  const cantidad = event.target.value.replace(/[^0-9]/g, '');
  if(isNaN(cantidad)) return null;
*/
  const cantidad = event.target.value.replace(/[^0-9]/g, '');
  if (cantidad > item.acciones)
    setCesionMayorCantidad(true)
  else
    setCesionMayorCantidad(false)

  const transferir = titulosPorOper.map(function(e) {
    return {operacionID: e.operacionID, tituloId: e.tituloId, titulo : e.titulo, acciones: e.acciones, accionesTransferidas: e.titulo == item.titulo ? event.target.value: e.accionesTransferidas, desde: e.desde, hasta: e.hasta} ;
  })

  settitulosPorOper(transferir)

  const sum = transferir.reduce(function(prev, current) {
    return prev + +current.accionesTransferidas
  }, 0);
  setTotal(sum);

  setFormData({ ...formData, 'acciones': sum})

};

async function eliminarDocumento(doc) {
  setFormData({ ...formData, doc: ''})
}

const getPictureCS = e => {
  e.stopPropagation();
            
  Storage.get(formData.cs)
    .then(url => {
      var myRequest = new Request(url);
      fetch(myRequest).then(function(response) {
        if (response.status === 200) {              
          console.log("DOCUMENTOOOO CS", url);
          //setImageCS(url);
          window.open(url)
        }
      });
    })
    .catch(err => console.log(err));
    
};

const getPictureCG = e => {
  e.stopPropagation();
        
  Storage.get(formData.cg)
    .then(url => {
      var myRequest = new Request(url);
      fetch(myRequest).then(function(response) {
        if (response.status === 200) {
          console.log("DOCUMENTOOOO CG", url.url);
          //setImageCS(url);
          window.open(url)
        }
      });
    })
    .catch(err => console.log(err));
    
};

const getPictureCI = e => {
  e.stopPropagation();
       
  Storage.get(formData.ci)
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

const getPictureCP = e => {
  e.stopPropagation();
        
  Storage.get(formData.cp)
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



  return (
    <main className={classes.content}>
    <div className={classes.appBarSpacer} />

      <Paper variant="outlined" className={classes.paper}>

      <Dialog open={openTitulos} onClose={handleSeleccionarTitulos} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Títulos de {formData.cedente}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Seleccionar los títulos a transferir
          </DialogContentText>

          <List dense='true'           
          subheader={
            <ListSubheader component="div" id="nested-list-subheader">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <Typography variant='caption'>
                F.Compra
              </Typography>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <Typography variant='caption'>
                Título
              </Typography>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <Typography variant='caption'>
                Cantidad
              </Typography>
            </ListSubheader>
            
          }
          > 
                        {titulos.map(item => (
                            <ListItem 
                                key={item.id} 
                                button onClick={handleToggle(item.id)}
                                //button
                                //onClick={()=>history.push(item.path)}
                                
                                >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={checked.indexOf(item.id) !== -1}
                tabIndex={-1}
                disableRipple
                inputProps={{ 'aria-labelledby': `checkbox-list-label-${item.id}` }}
              />
            </ListItemIcon>                                  
                                <ListItemText>{item.fechaCompra}</ListItemText>                                
                                <ListItemText>{item.titulo}</ListItemText>
                                <ListItemText>{item.acciones}</ListItemText>
 
                            </ListItem>
                            
                        ))}
                    </List>





        </DialogContent>
        <DialogActions>
          <Button onClick={handleSeleccionarTitulos} color="primary" >
            Seleccionar
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container>
        <Grid item xs={3} >
          <BlaclTextTypography variant='h6'>
              Cesión
          </BlaclTextTypography>
          <Autocomplete
                  value={valCedente}
                  size='small'
                  id="combo-box-cedente"
                  options={accionistas}
                  getOptionLabel={(option) => option.nombre2}
                  style={{ width: 'calc(100%)'}}
                  renderInput={(params) => <TextField {...params} label="Cedente" margin="normal" variant='outlined'/>}
                  onChange={(option, value) => handleClickCedente(option, value)}                  
                />

                {valCedente.estado ==  'Bloqueado' && <Chip label="Bloqueado" color="secondary" /> }
                
                <Autocomplete
                  value={valCesionario}
                  size='small'
                  id="combo-box-cecionario"
                  options={accionistas}
                  getOptionLabel={(option) => option.nombre2}
                  style={{ width: 'calc(100%)'}}
                  renderInput={(params) => <TextField {...params} label="Cesionario" margin="normal" variant='outlined'/>}
                  onChange={(option, value) => handleClickCesionario(option, value)}
                />

        </Grid>
        <Grid item xs={1} >
        </Grid>
        <Grid item xs={4}>

          <BlaclTextTypography variant='h6' >
            Acciones a Transferir
            &nbsp;&nbsp;
            <Button aria-controls="simple-menu" aria-haspopup="true" color='primary' size='small' style={{textTransform: 'none', borderRadius: 20, height: 20}} onClick={handleOpenTitulos} variant='contained'>
            + Agregar Títulos
            </Button>
          </BlaclTextTypography>
          

          <List dense='true'
          subheader={ total > 0 &&
            <ListSubheader component="div" id="nested-list-subheader">
              <div style={{display:'flex', flexDirection:'row', justifyContent:'space-around' , width: '100%'}}>              
                <Typography variant='caption'  style={{flex: 1}}>
                  Título
                </Typography>
                <Typography variant='caption'  style={{flex: 1}}>
                  Acciones
                </Typography>                
                <Typography variant='caption'  style={{flex: 2}}>
                  Acciones por Título a Transferir
                </Typography>
              </div>
            </ListSubheader>
          }
          > 
                        {titulosSelectos.map(item => (
                            <ListItem 
                                key={item.titulo} 
                                //button
                                //onClick={()=>history.push(item.path)}
                                >
                                <div style={{display:'flex', flexDirection:'row', justifyContent:'space-around', width: '100%' }}>              
                                  <div style={{flex: 1}}>
                                    <ListItemText>{item.titulo}</ListItemText>
                                  </div>
                                  <div style={{flex: 1}}>
                                    <ListItemText>{item.acciones}</ListItemText>
                                  </div>
                                  <div style={{flex: 2}}>                                   
                                    <TextField size='small' defaultValue={item.acciones} type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' , style: { textAlign: 'right' }}} onChange={(event)=>handleChangeCantidad(event,item)}/>
                                  </div>
                                </div>
                            </ListItem>
                            
                        ))}
                    </List>
            { total > 0 &&
              <Typography variant='caption' style={{display:'flex', flexDirection:'row', justifyContent:'right', alignItems:'center', paddingRight:60, color:'orange'}}>                 
                 <div>Total a Transferir : </div>
                 <div style={{fontWeight:'bold', fontSize:14}}>{total}</div>
              </Typography>
            }

{circular && <CircularProgress />}

        </Grid>

        <Grid item xs={1} >
        </Grid>
        <Grid item xs={3} container direction='column' justifyContent= 'flex-start' style={{backgroundColor:'#f9f9f9', padding:20, borderRadius: 10,}}>
          <BlaclTextTypography variant='h6' >
            Documentos Requeridos
          </BlaclTextTypography>

          <label htmlFor="upload-photo1" style={{marginTop:'10px',display:'flex', flexDirection:'row', alignItems:'center'}}>
            <input style={{ display: 'none' }} id="upload-photo1" name="upload-photo1" type="file" accept="application/pdf" onChange={onChangeCS} />            
            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',}}>Carta de Cesión y Gerente</Button>
            {formData.cs.length > 0 && <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}> <IconButton onClick={() => setFormData({ ...formData, 'cs': ''})} ><DeleteOutlineIcon color='disabled'/></IconButton> <IconButton onClick={getPictureCS} ><VisibilityIcon color='primary'/></IconButton> </div>}
          </label>
          <label htmlFor="upload-photo2" style={{marginTop:'10px',display:'flex', flexDirection:'row', alignItems:'center'}}>
            <input style={{ display: 'none' }} id="upload-photo2" name="upload-photo2" type="file" accept="application/pdf" onChange={onChangeCG} />            
            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',}}>Documentos de Identidad</Button>
            {formData.cg.length > 0 && <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}> <IconButton onClick={() => setFormData({ ...formData, 'cg': ''}) }><DeleteOutlineIcon color='disabled'/></IconButton> <IconButton onClick={getPictureCG} ><VisibilityIcon color='primary'/></IconButton> </div>}
          </label>
          <label htmlFor="upload-photo3" style={{marginTop:'10px',display:'flex', flexDirection:'row', alignItems:'center'}}>
            <input style={{ display: 'none' }} id="upload-photo3" name="upload-photo3" type="file" accept="application/pdf" onChange={onChangeCI} />
            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',}}>Carta de Instrucciones</Button>
            {formData.ci.length > 0 && <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}> <IconButton onClick={() => setFormData({ ...formData, 'ci': ''}) }><DeleteOutlineIcon color='disabled'/></IconButton> <IconButton onClick={getPictureCI} ><VisibilityIcon color='primary'/></IconButton> </div>}
          </label>
          <label htmlFor="upload-photo5" style={{marginTop:'10px',display:'flex', flexDirection:'row', alignItems:'center'}}>
            <input style={{ display: 'none' }} id="upload-photo5" name="upload-photo5" type="file" accept="application/pdf" onChange={onChangeCP} />
            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',}}>Poderes</Button>
            {formData.cp.length > 0 && <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>  <IconButton onClick={() => setFormData({ ...formData, 'cp': ''}) }><DeleteOutlineIcon color='disabled'/></IconButton> <IconButton onClick={getPictureCP} ><VisibilityIcon color='primary'/></IconButton> </div>}
          </label>
          <label htmlFor="upload-photo4" style={{marginTop:'10px',display:'flex', flexDirection:'row', alignItems:'center'}}>
            <input style={{ display: 'none' }} id="upload-photo4" name="upload-photo4" type="file" accept="application/pdf" onChange={onChangeES} />
            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',}}>Respaldo de Adquisición</Button>
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
                    disabled={total <= 0 || cesionMayorCantidad}
                >
                    Solicitar Aprobación
                </Button>
        </Grid>

  
      </Grid>


      <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
        <Alert onClose={handleCloseSnack} severity="success">
          Se registró exitosamente la solicitud de Cesión
        </Alert>
      </Snackbar>

     </Paper>

  </main>




    
  );
}