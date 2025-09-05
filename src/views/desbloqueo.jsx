import React, { useState, useEffect } from 'react';
import {
  makeStyles, Paper, Avatar, Grid, Typography, TextField, Button, withStyles, ListItem, ListItemText, ListSubheader, ListItemIcon,
  List, IconButton, Snackbar, CircularProgress, LinearProgress
} from '@material-ui/core';

import Autocomplete from '@material-ui/lab/Autocomplete';
import { API, Storage, graphqlOperation, Auth } from 'aws-amplify';
import { listAccionistas, listTitulos } from './../graphql/queries';
import { createAccionistaOperacion, createOperacion, createTituloPorOperacion, updateTitulo } from './../graphql/mutations';

import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import VerifiedUserOutlinedIcon from '@material-ui/icons/VerifiedUserOutlined';
import PersonOutlineOutlinedIcon from '@material-ui/icons/PersonOutlineOutlined';
import SyncOutlinedIcon from '@material-ui/icons/SyncOutlined';
import SaveIcon from '@material-ui/icons/Save';
import CheckIcon from '@material-ui/icons/Check';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined';

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
    height: 'calc(100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
    display: 'flex',
    flexDirection: 'column',
    width: '90%',
    marginTop: 20,
  },

}));


const today = new Date();
const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();

export default function Desbloqueo() {

  const [userName, setUserName] = useState("");

  const classes = useStyles();

  const [formData, setFormData] = useState({
    fecha: fecha, operacion: 'Desbloqueo',
    idCedente: '', cedente: '', idCesionario: '', cesionario: '',
    titulo: '', acciones: 0,
    estado: 'Pendiente', usuarioIngreso: '', usuarioAprobador: '',
    cs: '', cg: '', ci: '', es: '', cp: ''
  });

  const [valCedente, setValCedente] = useState({})

  const [total, setTotal] = useState(0);

  const [accionistas, setAccionistas] = useState([])

  const [titulos, setTitulos] = useState([])

  const [openSnack, setOpenSnack] = useState(false);
  const [openSnackDanger, setOpenSnackDanger] = useState(false);

  const [operacion, setOperacion] = useState(1);

  const [circular, setCircular] = useState(false);

  const [progreso, setProgreso] = useState(0);

  const addOperacion = async () => {
    try {
      if (!valCedente.id) {
        setOpenSnackDanger(true);
        return
      }
      setCircular(true);
      const operacion = {
        ope_fecha: fecha,
        ope_tipo: 4,
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
      const accionistaOperacion = {
        acc_ope_operacion_id: operacionIdNew.data.createOperacion.id,
        acc_ope_accionista_id: valCedente.id,
        acc_ope_detalle: "Desbloqueo"
      }
      await API.graphql(graphqlOperation(createAccionistaOperacion, { input: accionistaOperacion }));
      const transferir = titulos.map(function (e) {
        return { tit_ope_titulo_id: e.id, tit_ope_operacion_id: operacionIdNew.data.createOperacion.id, tit_ope_acciones: e.tit_hasta - e.tit_desde + 1 };
      });
      Promise.all(
        transferir.map(input => API.graphql(graphqlOperation(createTituloPorOperacion, { input: input })))
      );
      console.log('operacion:', operacion);
      console.log('accionistaOperacion:', accionistaOperacion);
      console.log('transferir:', transferir);
      setTitulos([])
      setTotal(0)
      setValCedente({})
      setCircular(false);
      setOpenSnack(true);
    } catch (err) {
      console.log('error creating transaction:', err);
      setOpenSnackDanger(true);
    }
  }

  useEffect(() => {
    fetchAccionistas();
    let user = Auth.user;
    setUserName(user.username);
  }, [])

  async function fetchAccionistas() {
    const filter = {
      acc_estado: {
        eq: 3,
      }
    };
    const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 1000 } });
    const accionistasFromAPI = apiData.data.listAccionistas.items;
    await Promise.all(accionistasFromAPI.map(async accionista => {
      return accionista;
    }))
    setAccionistas(apiData.data.listAccionistas.items);
  }

  async function fetchTitulos(cedenteId) {
    let filter = {
      tit_accionista_id: {
        eq: cedenteId
      }
    };
    const apiData = await API.graphql({ query: listTitulos, variables: { filter: filter, limit: 1000 } });
    const titulosFromAPI = apiData.data.listTitulos.items;
    setTitulos(titulosFromAPI);
    setFormData({ ...formData, 'titulo': "titulo?", 'acciones': 0, 'idCedente': cedenteId, 'cedente': "yo", 'usuarioIngreso': userName })
  }

  const handleClickCedente = (option, value) => {
    if (value) {
      setValCedente(value)
      fetchTitulos(value.id);
      setTotal(value.acc_cantidad_acciones)
      setProgreso(progreso + 50)
    }
    else {
      setFormData({ ...formData, 'idCedente': '', 'cedente': '' })
      setTitulos([])
      setTotal(0)
      setProgreso(progreso - 50)
      setValCedente({})
    }
  }

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
    /*if (!e.target.files[0]) {
      console.log('entro al cancelar')
      return
    }
    const file = e.target.files[0];
    const filename = uuid() + file.name
    setFormData({ ...formData, cs: filename });
    await Storage.put(filename, file);*/
    setProgreso(progreso + 50)
  }


  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Paper variant="elevation" className={classes.paper}>
        <Grid container style={{ width: '90%' }}>
          <Grid item xs={12} >
            <Paper elevation={0} style={{ height: 50, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%', padding: 10, }}>
              <Avatar style={{ backgroundColor: '#f9f9f9', height: '30px', width: '30px' }}>
                <LockOpenOutlinedIcon color='primary' />
              </Avatar>
              <Typography variant='subtitle2' color='primary' style={{ paddingLeft: 10 }}>
                Desbloquear Accionista
              </Typography>
            </Paper>
            <LinearProgress variant="determinate" value={progreso} style={{ width: '100%', marginTop: 5 }} />
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
                getOptionLabel={(option) => option.acc_nombre_completo}
                style={{ width: 'calc(100%)' }}
                renderInput={(params) => <TextField {...params} label="Accionista" margin="normal" variant="outlined" />}
                onChange={(option, value) => handleClickCedente(option, value)}
              />
              {total > 0 &&
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant='caption' color='primary'>
                    Total Acciones Bloqueadas: {total}
                  </Typography>
                </div>
              }
            </div>
          </Grid>

          <Grid item xs={4} >
            {total > 0 &&
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '90%', marginTop: 20 }}>
                <Typography variant='subtitle2' style={{ marginBottom: 10, marginLeft: 20 }}>
                  Títulos
                </Typography>
                <List dense
                  subheader={
                    <ListSubheader component="div" id="nested-list-subheader">
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '90%', marginLeft: 10 }}>
                        <Typography variant='caption' style={{ flex: 1 }}>
                          <strong style={{ color: 'black' }}>F.Compra</strong>
                        </Typography>
                        <Typography variant='caption' style={{ flex: 1 }}>
                          <strong style={{ color: 'black' }}>Título</strong>
                        </Typography>
                        <Typography variant='caption' style={{ flex: 1 }}>
                          <strong style={{ color: 'black' }}>Cantidad</strong>
                        </Typography>
                      </div>
                    </ListSubheader>
                  }
                >
                  {titulos.map(item => (
                    <ListItem key={item.id}>
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                        <ListItemText style={{ flex: 1 }}>{item.createdAt}</ListItemText>
                        <ListItemText style={{ flex: 1 }}>{item.tit_estado == 0 ? "Activo" : "Bloqueado"}</ListItemText>
                        <ListItemText style={{ flex: 1 }}>{item.tit_hasta - item.tit_desde + 1}</ListItemText>
                      </div>
                    </ListItem>

                  ))}
                </List>
              </div>
            }
            {circular && <CircularProgress />}
          </Grid>

          <Grid item xs={4} container>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 20, paddingLeft: 10 }}>
              <Typography variant='subtitle2' style={{ marginBottom: 10 }}>
                Documentación
              </Typography>
              <label htmlFor="upload-photo1">
                <input style={{ display: 'none' }} id="upload-photo1" name="upload-photo1" type="file" accept="application/pdf" onChange={onChangeCS} />
                <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='medium' style={{ textTransform: 'none', }}>Documento de Respaldo</Button>
                {formData.cs.length > 0 && <IconButton ><CheckIcon /></IconButton>}
              </label>
            </div>
          </Grid>

          <Grid item xs={12} container direction='row' justifyContent='center' style={{ paddingTop: 20 }} >
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              startIcon={<SaveIcon />}
              size='medium'
              onClick={addOperacion}
              disabled={total > 0 ? false : true}
            >
              Solicitar aprobación
            </Button>
          </Grid>


        </Grid>
        <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
          <Alert onClose={handleCloseSnack} severity="success">
            Se registró la solicitud de Desbloqueo.
          </Alert>
        </Snackbar>
        <Snackbar open={openSnackDanger} autoHideDuration={6000} onClose={handleCloseSnackDanger}>
          <Alert onClose={handleCloseSnackDanger} severity="error">
            Ocurrio un error al registrar la operación!
          </Alert>
        </Snackbar>
      </Paper>

    </main>

  );
}