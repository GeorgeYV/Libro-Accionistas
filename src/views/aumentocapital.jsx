import React, { useState, useEffect } from 'react';
import {
  makeStyles, Paper, Divider, Grid, Typography, TextField, Button, withStyles, ListItem, ListItemText, ListSubheader, ListItemIcon,
  List, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Checkbox, Snackbar, CircularProgress, Chip
} from '@material-ui/core';



import Autocomplete from '@material-ui/lab/Autocomplete';
import { API, Storage, graphqlOperation, Auth } from 'aws-amplify';
import { listAccionistas, getParametro, getTitulo } from './../graphql/queries';
import { createAccionistaOperacion, createAumentoCapital, createOperacion, createTitulo, createTituloPorOperacion, updateAccionista, updateParametro, updateTitulo } from './../graphql/mutations';

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



export default function AumentoCapital() {
  useEffect(() => {
    fetchAccionistas();
    fetchParametros();
    let user = getUser();
    setUserName(user);
  }, []);
  function getUser() {
    let user
    if (Auth.user != null) user = Auth.user.username;
    return user;
  }
  const [userName, setUserName] = useState(Auth.user.username);
  var [tituloGlobal, setTituloGlobal] = useState({
    tit_accionista_id: "",
    tit_acciones: 0,
    tit_estado: 0,
    tit_desde: 0,
    tit_hasta: 0,
    tit_padre: "",
    tit_nivel: 0
  });
  var [operacionGlobal, setOperacionGlobal] = useState({
    ope_fecha: fecha,
    ope_tipo: 0,
    ope_acciones: 0,
    ope_estado: 0,
    ope_ingresador: "Admin",
    ope_aprobador: "",
    ope_fecha_aprobacion: "",
    ope_motivo_rechazo: -1,
    ope_observacion: "",
    ope_documento: ""
  });
  var [aumentoCapitalGlobal, setAumentoCapitalGlobal] = useState({
    id: "",
    aum_cap_valor_nominal: 0,
    aum_cap_capital: 0
  });
  var [accionistaGlobal, setAccionistaGlobal] = useState({ acc_identificacion: '' });
  const classes = useStyles();

  const [formData, setFormData] = useState({
    fecha: fecha, operacion: 'Aumento Capital',
    idCedente: '', cedente: '', idCesionario: '', cesionario: '',
    titulo: '', acciones: 0,
    estado: 'Pendiente', usuarioIngreso: '', usuarioAprobador: '',
    cs: '', cg: '', ci: '', es: '', cp: '',
    valorNominal: 0, capital: 0, fechaValor: ''
  });
  const [accionistas, setAccionistas] = useState([])
  const [openSnack, setOpenSnack] = useState(false);
  const [openSnackDanger, setOpenSnackDanger] = useState(false);

  const addOperacion = async () => {
    try {
      if (tituloGlobal.tit_accionista_id == "" || tituloGlobal.tit_acciones == 0) {
        setOpenSnackDanger(true);
        return;
      }
      operacionGlobal.ope_acciones = tituloGlobal.tit_acciones;
      operacionGlobal.ope_documento = 'filename';
      operacionGlobal.ope_ingresador = userName;
      var operacionIdNew = await API.graphql(graphqlOperation(createOperacion, { input: operacionGlobal }));
      aumentoCapitalGlobal.id = operacionIdNew.data.createOperacion.id;
      await API.graphql(graphqlOperation(createAumentoCapital, { input: aumentoCapitalGlobal }));
      const accionistaOperacion = {
        acc_ope_operacion_id: operacionIdNew.data.createOperacion.id,
        acc_ope_accionista_id: accionistaGlobal.id,
        acc_ope_detalle: "Aumento Capital"
      };
      await API.graphql(graphqlOperation(createAccionistaOperacion, { input: accionistaOperacion }));
      tituloGlobal.tit_accionista_id = "";
      tituloGlobal.tit_acciones = 0;
      aumentoCapitalGlobal.aum_cap_capital = 0;
      setAccionistaGlobal({ acc_identificacion: '' });
      console.log("accionista:", accionistaGlobal);
      setOpenSnack(true);
    } catch (err) {
      console.log('error creating transaction:', err);
      setOpenSnackDanger(true);
    }
  }

  async function fetchAccionistas() {
    const filter = {
      or: [
        {acc_estado: {
          eq: 1
        }},
        {acc_estado: {
          eq: 2
        }}
      ]
    };
    const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 1000 } });
    const accionistasFromAPI = apiData.data.listAccionistas.items;
    setAccionistas(accionistasFromAPI);
  }

  async function fetchParametros() {
    var apiData = await API.graphql({ query: getParametro, variables: { id: '1' } });
    var parametrosFromAPI = apiData.data.getParametro;
    setAumentoCapitalGlobal({
      ...aumentoCapitalGlobal,
      'aum_cap_valor_nominal': parseFloat(parametrosFromAPI.valorNominal)
    });
  }

  const handleClickCesionario = (option, value) => {
    if (value) {
      setAccionistaGlobal(value);
      setTituloGlobal({ ...tituloGlobal, 'tit_accionista_id': value.id })
    }
    else {
      setAccionistaGlobal({ acc_identificacion: '' });
      setTituloGlobal({ ...tituloGlobal, 'tit_accionista_id': '' })
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
        fetch(myRequest).then(function (response) {
          if (response.status === 200) {
            //setImageCS(url);
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));
  };
  const handleCantidadEmitidoChange = (event) => {
    setAumentoCapitalGlobal({
      ...aumentoCapitalGlobal,
      'aum_cap_capital': parseFloat((event.target.value.replace(/[^0-9]/g, '') * aumentoCapitalGlobal.aum_cap_valor_nominal)).toFixed(2)
    });
    setTituloGlobal({
      ...tituloGlobal,
      'tit_acciones': parseInt(event.target.value.replace(/[^0-9]/g, ''))
    });
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
              value={accionistaGlobal}
              size='small'
              id="combo-box-cecionario"
              options={accionistas}
              getOptionLabel={(option) => option.acc_nombre_completo}
              style={{ width: 'calc(100%)' }}
              renderInput={(params) => <TextField {...params} label="Beneficiario" margin="normal" variant='outlined' />}
              onChange={(option, value) => handleClickCesionario(option, value)}
            />
            <TextField
              id="outlined-required1"
              label="Cantidad Emitida"
              value={tituloGlobal.tit_acciones}
              onChange={handleCantidadEmitidoChange}
              style={{ marginTop: 20 }}
            />
            <TextField
              id="outlined-required2"
              label="Valor Nominal"
              value={aumentoCapitalGlobal.aum_cap_valor_nominal}
              style={{ marginTop: 20 }}
              disabled
            />
            <TextField
              id="outlined-required1"
              label="Capital"
              value={aumentoCapitalGlobal.aum_cap_capital}
              style={{ marginTop: 20 }}
              disabled
            />
          </Grid>
          <Grid item xs={1} >
          </Grid>
          <Grid item xs={4}>
          </Grid>
          <Grid item xs={1} >
          </Grid>

          <Grid item xs={3} container direction='column' justifyContent='flex-start' style={{ backgroundColor: '#f9f9f9', padding: 20, borderRadius: 10, }}>
            <BlaclTextTypography variant='h6' >
              Documentos Requeridos
            </BlaclTextTypography>

            <label htmlFor="upload-photo4" style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <input style={{ display: 'none' }} id="upload-photo4" name="upload-photo4" type="file" accept="application/pdf" onChange={onChangeES} />
              <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', }}>Escrituras</Button>
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
              disabled={tituloGlobal.accionistaID != '' && tituloGlobal.tit_acciones == 0}
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
        <Snackbar open={openSnackDanger} autoHideDuration={6000} onClose={handleCloseSnackDanger}>
          <Alert onClose={handleCloseSnackDanger} severity="error">
            Registre todos los campos requeridos!
          </Alert>
        </Snackbar>
      </Paper>
    </main>
  );
}