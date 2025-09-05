import React, { useState, useEffect } from 'react';
import {
  makeStyles, Paper, Divider, Grid, Typography, TextField, Button, withStyles, ListItem, ListItemText, ListSubheader, ListItemIcon,
  List, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Checkbox, Snackbar, CircularProgress, Chip
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { API, Storage, graphqlOperation, Auth } from 'aws-amplify';
import { listAccionistas, listTitulos } from './../graphql/queries';
import { createAccionistaOperacion, createOperacion, createTituloPorOperacion, updateTitulo } from './../graphql/mutations';
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
    height: 'calc(100%)',
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
const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
export default function Cesion() {
  const classes = useStyles();
  const [userName, setUserName] = useState("");
  const [formData, setFormData] = useState({
    fecha: fecha, operacion: 'Cesión',
    idCedente: '', cedente: '', idCesionario: '', cesionario: '',
    titulo: '', acciones: 0,
    estado: 'Pendiente', usuarioIngreso: '', usuarioAprobador: '',
    cs: '', cg: '', ci: '', es: '', cp: ''
  });
  const [valCedente, setValCedente] = useState({})
  const [valCesionario, setValCesionario] = useState({})
  const [total, setTotal] = useState(0);
  const [checked, setChecked] = useState([0]);
  const [openTitulos, setOpenTitulos] = useState(false);
  const [accionistas, setAccionistas] = useState([]);
  var [listCesionarios, setListCesionarios] = useState([]);
  var [listCedentes, setListCedentes] = useState([]);
  const [titulos, setTitulos] = useState([])
  const [titulosSelectos, setTitulosSelectos] = useState([])
  const [titulosPorOper, settitulosPorOper] = useState([])
  const [openSnack, setOpenSnack] = useState(false);
  const [openSnackDanger, setOpenSnackDanger] = useState(false);
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
      if (!valCedente || !valCesionario) {
        setOpenSnackDanger(true);
        return;
      }
      setCircular(true);
      const operacion = {
        ope_fecha: fecha,
        ope_tipo: 3,
        ope_acciones: total,
        ope_estado: 0,
        ope_ingresador: userName,
        ope_aprobador: "",
        ope_fecha_aprobacion: "",
        ope_motivo_rechazo: -1,
        ope_observacion: "",
        ope_documento: ""
      }
      var operacionIdNew = await API.graphql(graphqlOperation(createOperacion, { input: operacion }));
      var accionistaOperacion = {
        acc_ope_operacion_id: operacionIdNew.data.createOperacion.id,
        acc_ope_accionista_id: valCedente.id,
        acc_ope_detalle: "Cedente"
      }
      console.log(operacion, accionistaOperacion);
      await API.graphql(graphqlOperation(createAccionistaOperacion, { input: accionistaOperacion }));
      accionistaOperacion = {
        acc_ope_operacion_id: operacionIdNew.data.createOperacion.id,
        acc_ope_accionista_id: valCesionario.id,
        acc_ope_detalle: "Cesionario"
      }
      await API.graphql(graphqlOperation(createAccionistaOperacion, { input: accionistaOperacion }));
      const transferir = titulosSelectos.map(function (e) {
        return { 
          tit_ope_titulo_id: e.id, 
          tit_ope_operacion_id: operacionIdNew.data.createOperacion.id, 
          tit_ope_acciones: e.tit_acciones 
        };
      });
      Promise.all(
        transferir.map(input => API.graphql(graphqlOperation(createTituloPorOperacion, { input: input })))
      );
      console.log(accionistaOperacion, transferir);
      setChecked([])
      setTitulos([])
      setTitulosSelectos([])
      settitulosPorOper([])
      setTotal(0)
      setValCedente({})
      setValCesionario({})
      setCircular(false);
      setOpenSnack(true);
    } catch (err) {
      console.log('error creating transaction:', err)
    }
  }
  useEffect(() => {
    fetchAccionistas(1);
    let user = Auth.user;
    setUserName(user.username);
  }, [])
  async function fetchAccionistas(estadoAcc) {
    const filtro = {
      acc_estado: {
        eq: estadoAcc
      }
    };
    const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filtro, limit: 1000 } });
    const accionistasFromAPI = apiData.data.listAccionistas.items;
    setAccionistas(accionistasFromAPI);
    setListCedentes(accionistasFromAPI.map(function (e) {
      return { 
        id: e.id,
        acc_nombre_completo: e.acc_nombre_completo
      };
    }));
    setListCesionarios(accionistasFromAPI.map(function (e) {
      return { 
        id: e.id,
        acc_nombre_completo: e.acc_nombre_completo
      };
    }));
  }
  async function fetchTitulos(cedente) {
    const filter = {
      tit_accionista_id: {
        eq: cedente 
      },
      tit_estado: {
        eq: 1
      }
    };
    const apiData = await API.graphql({ query: listTitulos, variables: { filter: filter, limit: 1000 } });
    const titulosFromAPI = apiData.data.listTitulos.items;
    setTitulos(titulosFromAPI);
  }
  const handleClickCedente = (option, value) => {
    if (value) {
      setValCedente(value);
      var aux;
      aux = listCesionarios.findIndex(x => x.id === value.id);
      console.log("aux",aux);
      listCesionarios.splice(aux,1);
      //setFormData({ ...formData, 'idCedente': value.id, 'cedente': value.nombre2, 'usuarioIngreso': userName })
      fetchTitulos(value.id);
      setChecked([]);
      setTitulosSelectos([]);
      settitulosPorOper([]);
      setTotal(0);
    }
    else {
      if (valCedente) {
        console.log("valCedente",valCedente);
        listCesionarios.push(valCedente);
      }
      //setFormData({ ...formData, 'idCedente': '', 'cedente': '' })
      setChecked([])
      setTitulos([])
      setTitulosSelectos([])
      settitulosPorOper([])
      setTotal(0)
      setValCedente({})
    }
  }
  const handleClickCesionario = (option, value) => {
    if (value) {
      setValCesionario(value);
      var aux;
      aux = listCedentes.findIndex(x => x.id === value.id);
      console.log("aux",aux);
      listCedentes.splice(aux,1);
      //setFormData({ ...formData, 'idCesionario': value.id, 'cesionario': value.nombre2 })
    }
    else {
      if (valCesionario) {
        console.log("valCedente",valCesionario);
        listCedentes.push(valCesionario);
      }
      setValCesionario({})
      //setFormData({ ...formData, 'idCesionario': '', 'cesionario': '' })
    }
  }
  const handleOpenTitulos = () => {
    setOpenTitulos(true);
  };
  const handleSeleccionarTitulos = () => {
    var filteredTitulos = titulos.filter(function (itm) {
      return checked.indexOf(itm.id) > -1;
    });
    setTitulosSelectos(filteredTitulos)
    console.log('filtrados', filteredTitulos)
    const tituloString = filteredTitulos.map(function (titulos) {
      return titulos.titulo;
    }).join(" | ");
    const sum = filteredTitulos.reduce(function (prev, current) {
      return prev + +current.acciones
    }, 0);
    setTotal(sum);
    setFormData({ ...formData, 'titulo': tituloString, 'acciones': sum })
    setOpenTitulos(false);
    const transferir = filteredTitulos.map(function (e) {
      return { 
        operacionID: e.operacionID, 
        tituloId: e.id, 
        titulo: e.titulo, 
        acciones: e.acciones, 
        accionesTransferidas: e.acciones, 
        desde: e.desde, 
        hasta: e.hasta 
      };
    })
    settitulosPorOper(transferir)
  };
  const handleCloseSnack = (event, reason) => {
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
    const cantidad = event.target.value.replace(/[^0-9]/g, '');
    if (cantidad > item.tit_acciones)
      setCesionMayorCantidad(true)
    else
      setCesionMayorCantidad(false)
    const transferir = titulosPorOper.map(function (e) {
      return {
        operacionID: e.operacionID,
        tituloId: e.tituloId,
        titulo: e.titulo,
        acciones: e.acciones,
        accionesTransferidas: e.titulo == item.titulo ? event.target.value : e.accionesTransferidas,
        desde: e.desde, hasta: e.hasta
      };
    })
    settitulosPorOper(transferir)
    const sum = transferir.reduce(function (prev, current) {
      return prev + +current.accionesTransferidas
    }, 0);
    setTotal(sum);
    setFormData({ ...formData, 'acciones': sum })
  };
  async function eliminarDocumento(doc) {
    setFormData({ ...formData, doc: '' })
  }
  const getPictureCS = e => {
    e.stopPropagation();
    Storage.get(formData.cs)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function (response) {
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
        fetch(myRequest).then(function (response) {
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
        fetch(myRequest).then(function (response) {
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
        fetch(myRequest).then(function (response) {
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
        fetch(myRequest).then(function (response) {
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
        <Dialog open={openTitulos} onClose={handleSeleccionarTitulos} aria-labelledby="form-dialog-title" maxWidth='lg' fullWidth='false'>
          <DialogTitle id="form-dialog-title">Títulos de {valCedente.acc_nombre_completo}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Seleccionar los títulos a transferir:
            </DialogContentText>
            <List dense='true'
              subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 10, paddingRight: 70 }}>
                    <Typography variant='caption'>
                      F.Compra
                    </Typography>
                    <Typography variant='caption'>
                      Título
                    </Typography>
                    <Typography variant='caption'>
                      Cantidad
                    </Typography>
                  </div>
                </ListSubheader>
              }
            >
              {titulos.map(item => (
                <ListItem
                  key={item.id}
                  button onClick={handleToggle(item.id)}
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
                  <ListItemText>{item.createdAt}</ListItemText>
                  <ListItemText>{item.id}</ListItemText>
                  <ListItemText>{item.tit_acciones}</ListItemText>
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
              options={listCedentes}
              getOptionLabel={(option) => option.acc_nombre_completo}
              style={{ width: 'calc(100%)' }}
              renderInput={(params) => <TextField {...params} label="Cedente" margin="normal" variant='outlined' />}
              onChange={(option, value) => handleClickCedente(option, value)}
            />
            <Autocomplete
              value={valCesionario}
              size='small'
              id="combo-box-cecionario"
              options={listCesionarios}
              getOptionLabel={(option) => option.acc_nombre_completo}
              style={{ width: 'calc(100%)' }}
              renderInput={(params) => <TextField {...params} label="Cesionario" margin="normal" variant='outlined' />}
              onChange={(option, value) => handleClickCesionario(option, value)}
            />
          </Grid>
          <Grid item xs={1} >
          </Grid>
          <Grid item xs={4}>
            <BlaclTextTypography variant='h6' >
              Acciones a Transferir
              <br></br>
              <Button aria-controls="simple-menu" aria-haspopup="true" color='primary' size='small' style={{ textTransform: 'none', borderRadius: 20, height: 20 }} onClick={handleOpenTitulos} variant='contained'>
                + Agregar Títulos
              </Button>
            </BlaclTextTypography>
            <List dense='true'
              subheader={total > 0 &&
                <ListSubheader component="div" id="nested-list-subheader">
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                    <Typography variant='caption' style={{ flex: 1 }}>
                      Título
                    </Typography>
                    <Typography variant='caption' style={{ flex: 1 }}>
                      Acciones
                    </Typography>
                    <Typography variant='caption' style={{ flex: 2 }}>
                      Acciones por Título a Transferir
                    </Typography>
                  </div>
                </ListSubheader>
              }
            >
              {titulosSelectos.map(item => (
                <ListItem key={item.titulo}>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <ListItemText>{item.id}</ListItemText>
                    </div>
                    <div style={{ flex: 1 }}>
                      <ListItemText>{item.tit_acciones}</ListItemText>
                    </div>
                    <div style={{ flex: 2 }}>
                      <TextField size='small' defaultValue={item.tit_acciones} type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', style: { textAlign: 'right' } }} onChange={(event) => handleChangeCantidad(event, item)} />
                    </div>
                  </div>
                </ListItem>
              ))}
            </List>
            {total > 0 &&
              <Typography variant='caption' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'right', alignItems: 'center', paddingRight: 60, color: 'orange' }}>
                <div>Total a Transferir : </div>
                <div style={{ fontWeight: 'bold', fontSize: 14 }}>{total}</div>
              </Typography>
            }
            {circular && <CircularProgress />}
          </Grid>
          <Grid item xs={1} >
          </Grid>
          <Grid item xs={3} container direction='column' justifyContent='flex-start' style={{ backgroundColor: '#f9f9f9', padding: 20, borderRadius: 10, }}>
            <BlaclTextTypography variant='h6' >
              Documentos Requeridos
            </BlaclTextTypography>
            <label htmlFor="upload-photo1" style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <input style={{ display: 'none' }} id="upload-photo1" name="upload-photo1" type="file" accept="application/pdf" onChange={onChangeCS} />
              <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', }}>Carta de Cesión y Gerente</Button>
              {formData.cs.length > 0 && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}> <IconButton onClick={() => setFormData({ ...formData, 'cs': '' })} ><DeleteOutlineIcon color='disabled' /></IconButton> <IconButton onClick={getPictureCS} ><VisibilityIcon color='primary' /></IconButton> </div>}
            </label>
            <label htmlFor="upload-photo2" style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <input style={{ display: 'none' }} id="upload-photo2" name="upload-photo2" type="file" accept="application/pdf" onChange={onChangeCG} />
              <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', }}>Documentos de Identidad</Button>
              {formData.cg.length > 0 && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}> <IconButton onClick={() => setFormData({ ...formData, 'cg': '' })}><DeleteOutlineIcon color='disabled' /></IconButton> <IconButton onClick={getPictureCG} ><VisibilityIcon color='primary' /></IconButton> </div>}
            </label>
            <label htmlFor="upload-photo3" style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <input style={{ display: 'none' }} id="upload-photo3" name="upload-photo3" type="file" accept="application/pdf" onChange={onChangeCI} />
              <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', }}>Carta de Instrucciones</Button>
              {formData.ci.length > 0 && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}> <IconButton onClick={() => setFormData({ ...formData, 'ci': '' })}><DeleteOutlineIcon color='disabled' /></IconButton> <IconButton onClick={getPictureCI} ><VisibilityIcon color='primary' /></IconButton> </div>}
            </label>
            <label htmlFor="upload-photo5" style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <input style={{ display: 'none' }} id="upload-photo5" name="upload-photo5" type="file" accept="application/pdf" onChange={onChangeCP} />
              <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', }}>Poderes</Button>
              {formData.cp.length > 0 && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>  <IconButton onClick={() => setFormData({ ...formData, 'cp': '' })}><DeleteOutlineIcon color='disabled' /></IconButton> <IconButton onClick={getPictureCP} ><VisibilityIcon color='primary' /></IconButton> </div>}
            </label>
            <label htmlFor="upload-photo4" style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <input style={{ display: 'none' }} id="upload-photo4" name="upload-photo4" type="file" accept="application/pdf" onChange={onChangeES} />
              <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', }}>Respaldo de Adquisición</Button>
              {formData.es.length > 0 && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>  <IconButton onClick={() => setFormData({ ...formData, 'es': '' })}><DeleteOutlineIcon color='disabled' /></IconButton> <IconButton onClick={getPictureES} ><VisibilityIcon color='primary' /></IconButton> </div>}
            </label>
          </Grid>
          <Grid item xs={12} style={{ paddingTop: 20 }} >
            <Divider />
          </Grid>
          <Grid item xs={12} container direction='row' justifyContent='flex-end'>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              startIcon={<SaveIcon />}
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
        <Snackbar open={openSnackDanger} autoHideDuration={6000} onClose={handleCloseSnackDanger}>
          <Alert onClose={handleCloseSnackDanger} severity="error">
            Registre todos los campos requeridos!
          </Alert>
        </Snackbar>
      </Paper>
    </main>
  );
}