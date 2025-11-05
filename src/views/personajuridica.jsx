import React, { useState } from 'react'
import {
  makeStyles, Paper, TextField, Button,
  Typography, MenuItem, Select, Divider,
  Grid, IconButton, InputLabel, Snackbar,
  FormControl,
} from '@material-ui/core';
import { useLocation } from 'react-router-dom'
import ControlPointIcon from '@material-ui/icons/ControlPoint';
import CheckIcon from '@material-ui/icons/Check';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import { API, Storage, graphqlOperation } from 'aws-amplify';
import { createAccionista, createPersonaJuridica, updateAccionista, updatePersonaJuridica } from './../graphql/mutations';
import {
  validarCampos, verificarCamposVacios,
  devolverSoloAccionista, devolverSoloPersonaNatural,
  devolverSoloPersonaJuridica
} from './../components/manejoAccionistas';
import { uuid } from 'uuidv4';
import MuiAlert from '@material-ui/lab/Alert';
import { listPersonaJuridicas } from '../graphql/queries';
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'left',
    color: theme.palette.text.secondary,
    height: 'calc(100%)',
  },
  appBarSpacer: {
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  formSectionTitulo: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  formSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formSectionEnd: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    margin: '15px'
  },
  formSectionContacto: {
    display: 'flex',
    flexDirection: 'column',
    //justifyContent:'flex-start',
    alignItems: 'flex-start',
  },
  gridSpace: {
    flexDirection: 'column',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    marginLeft: 50,
    borderRadius: 5,
    padding: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#0000003b'
  },
  divider: {
    marginTop: 20,
    marginBottom: 20,
  },
  customTextField: {
    "& input::placeholder": {
      fontSize: "10px"
    }
  },
  textFieldEstandar: {
    minWidth: '180px',
    margin: '5px'
  },
  selectEstandar: {
    minWidth: '180px',
    margin: '5px'
  },
  inputLabelCustom: {
    left: '5px'
  }
}));
export default function PersonaJuridica() {
  const tipoIdentificacion = [
    {
      label: "Cédula",
      value: 0,
    },
    {
      label: "Pasaporte",
      value: 2,
    },
  ];
  const pais = [
    {
      label: "Ecuador",
      value: "Ecuador",
    },
    {
      label: "Perú",
      value: "Perú",
    },
    {
      label: "Estados Unidos",
      value: "Estados Unidos",
    },
  ];
  var [accionistaDefault, setAccionistaDefault] = useState({
    id: "",
    acc_decevale: "",
    acc_estado: 1,
    acc_tipo_identificacion: 0,
    acc_identificacion: "",
    acc_nacionalidad: 0,
    acc_residencia: "",
    acc_pais: "",
    acc_provincia: "",
    acc_ciudad: "",
    acc_direccion: "",
    acc_dir_numero: "",
    acc_banco: "",
    acc_tipo_cuenta: "",
    acc_cuenta_bancaria: "",
    acc_doc_certificado_bancario: "",
    acc_doc_actualizacion_datos: "",
    acc_doc_uso_datos: "",
    acc_doc_posesion_efectiva: "",
    acc_telefonos: "",
    acc_obs_telefonos: "",
    acc_correos: "",
    acc_cantidad_acciones: 0,
    acc_participacion: 0,
    acc_tipo_acciones: 0,
    pj_rl_tipo_identificacion: 0,
    pj_razon_social: "",
    pj_rl_identificacion: "",
    pj_rl_nombre: "",
    pj_rl_nacionalidad: "",
    pj_rl_telefono: "",
    pj_rl_email: "",
    pj_doc_nombramiento: "",
    acc_telefonos1: "",
    acc_telefonos2: "",
    acc_telefonos3: "",
    acc_obs_telefonos1: "",
    acc_obs_telefonos2: "",
    acc_obs_telefonos3: "",
    acc_correos1: "",
    acc_correos2: "",
    acc_correos3: "",
  });
  var [countTelef, setCountTelef] = useState(1);
  var [countEmail, setCountEmail] = useState(1);
  const location = useLocation();
  var [accionistaGlobal, setAccionistaGlobal] = useState(location.state ? location.state.preloadedValue : {});
  const separarCadenas = (name) => {
    var aux = accionistaGlobal[name] != "" ? accionistaGlobal[name].split("&") : [];
    if (aux[0]) accionistaGlobal[name + "1"] = aux[0];
    if (aux[1]) accionistaGlobal[name + "1"] = aux[1];
    if (aux[2]) accionistaGlobal[name + "1"] = aux[2];
    if(name=="acc_telefonos") countTelef = aux.length > countTelef ? aux.length : countTelef;
    if(name=="acc_correos") countEmail = aux.length > countEmail ? aux.length : countEmail;
  }
  if (location.state) {
    console.log("location", location);
    separarCadenas("acc_telefonos");
    separarCadenas("acc_obs_telefonos");
    separarCadenas("acc_correos");
  }
  const classes = useStyles();
  const [formData, setFormData] = useState({
    docIdentidadPrincipal: location.state ? location.state.preloadedValue.docIdentidadPrincipal != null ? location.state.preloadedValue.docIdentidadPrincipal : '' : '',
    docCertificadoBancario: location.state ? location.state.preloadedValue.docCertificadoBancario != null ? location.state.preloadedValue.docCertificadoBancario : '' : '',
    docIdentidadConyugue: location.state ? location.state.preloadedValue.docIdentidadConyugue != null ? location.state.preloadedValue.docIdentidadConyugue : '' : ''
  });
  const [openSnack, setOpenSnack] = useState(false);
  const [openSnackDanger, setOpenSnackDanger] = useState(false);
  var [mensajeError, setMensajeError] = useState('');
  var [mensajeExito, setMensajeExito] = useState('Se registró el accionista correctamente');
  const onSubmit = async (data) => {
    var respuesta = await validarCampos(accionistaGlobal);
    setMensajeError(respuesta.mensaje);
    if (respuesta.error && !location.state) {
      setOpenSnackDanger(true);
      return;
    }
    respuesta = await verificarCamposVacios(accionistaGlobal, ["acc_decevale", "acc_identificacion"]);
    if (respuesta.error) {
      setMensajeError(respuesta.mensaje);
      setOpenSnackDanger(true)
      return;
    }
    crearCadenas("acc_telefonos");
    crearCadenas("acc_obs_telefonos");
    crearCadenas("acc_correos");
    location.state ? editAccionista(accionistaGlobal) : addAccionista(accionistaGlobal);
  }
  const generateSelectTipoIdentificacion = () => {
    return tipoIdentificacion.map((option) => {
      return (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      );
    });
  };
  const generateSelectPais = () => {
    return pais.map((option) => {
      return (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      );
    });
  };
  const addAccionista = async (accionista) => {
    try {
      /*const operID = await API.graphql(graphqlOperation(createAccionista, { input: accionista }))
      setFormData({ docIdentidadPrincipal: '', docCertificadoBancario: '', docIdentidadConyugue: '' })*/
      setOpenSnack(true)
    } catch (err) {
      console.log('error creating accionista:', err)
    }
  }
  const editAccionista = async (accionista) => {
    try {
      var accionistaAux = devolverSoloAccionista(accionista);
      console.log('accionistaAux', accionistaAux);
      var personaJuridicalAux = devolverSoloPersonaJuridica(accionista);
      console.log('personaJuridicalAux', personaJuridicalAux);
      await API.graphql({ query: updateAccionista, variables: { input: accionistaAux } });
      await API.graphql({ query: updatePersonaJuridica, variables: { input: personaJuridicalAux } });
      setFormData({ docIdentidadPrincipal: '', docCertificadoBancario: '', docIdentidadConyugue: '', docPosesionEfectiva: '' })
      setMensajeExito('Se actualizó el accionista correctamente.');
      setOpenSnack(true)
    } catch (err) {
      console.log('error updating accionista:', err)
      setMensajeError(err);
      setOpenSnackDanger(true);
    }
  }
  const limpiarForm = async () => {
    setFormData({ docIdentidadPrincipal: '', docCertificadoBancario: '', docIdentidadConyugue: '', docPosesionEfectiva: '' })
    setAccionistaGlobal(accionistaDefault);
    setCountEmail(1);
    setCountTelef(1);
  }
  const asignarValores = (event) => {
    setAccionistaGlobal({ ...accionistaGlobal, [event.target.name]: event.target.value });
  };
  const asignarValoresEnteros = (event) => {
    setAccionistaGlobal({ ...accionistaGlobal, [event.target.name]: parseInt(event.target.value) });
  };
  const crearCadenas = (name) => {
    var aux = "";
    if (accionistaGlobal[name + "1"]) aux = accionistaGlobal[name + "1"];
    if (accionistaGlobal[name + "2"]) aux = aux + "&" + accionistaGlobal[name + "2"];
    if (accionistaGlobal[name + "3"]) aux = aux + "&" + accionistaGlobal[name + "3"];
    accionistaGlobal[name] = aux;
  }
  async function onChangeDI(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    const filename = uuid() + file.name
    setFormData({ ...formData, docIdentidadPrincipal: filename });
    await Storage.put(filename, file);
  }
  async function onChangeCB(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    const filename = uuid() + file.name
    setFormData({ ...formData, docCertificadoBancario: filename });
    await Storage.put(filename, file);
  }
  async function onChangeDIC(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    const filename = uuid() + file.name
    setFormData({ ...formData, docIdentidadConyugue: filename });
    await Storage.put(filename, file);
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
  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Paper variant="outlined" className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper className={classes.paper} variant='outlined'>
              <div style={{ marginBottom: 20 }}>
                <Typography variant='subtitle1' style={{ color: "#000000" }}>Información Básica</Typography>
              </div>
              <TextField
                id="acc_decevale"
                name="acc_decevale"
                value={accionistaGlobal.acc_decevale}
                label="Decevale"
                variant='outlined'
                className={classes.textFieldEstandar}
                onChange={asignarValores} />
              <FormControl required variant="outlined" className={classes.selectEstandar}>
                <InputLabel id='acc_nacionalidad-label'>Nacionalidad</InputLabel>
                <Select
                  id='acc_nacionalidad'
                  name='acc_nacionalidad'
                  labelId="acc_nacionalidad-label"
                  label="Nacionalidad"
                  value={accionistaGlobal.acc_nacionalidad}
                  defaultValue='Ecuador'
                  onChange={asignarValores}
                >
                  {generateSelectPais()}
                </Select>
              </FormControl>
              <FormControl required variant="outlined" className={classes.selectEstandar}>
                <InputLabel>Tipo de identificación</InputLabel>
                <Select
                  id="acc_tipo_identificacion"
                  name='acc_tipo_identificacion'
                  label='Tipo de identificación'
                  value={accionistaGlobal.acc_tipo_identificacion}
                  variant="outlined"
                  defaultValue='1'
                  onChange={asignarValoresEnteros}
                >
                  <MenuItem key={1} value={1}>
                  RUC
                  </MenuItem>
                </Select>
              </FormControl>
              <TextField
                required
                id="acc_identificacion"
                name='acc_identificacion'
                label="Identificación"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.acc_identificacion}
                onChange={asignarValores} />
              <TextField
                required
                id="pj_razon_social"
                name='pj_razon_social'
                label="Razón Social"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.pj_razon_social}
                onChange={asignarValores} />
              <FormControl required variant="outlined" className={classes.selectEstandar}>
                <InputLabel>Tipo de acciones</InputLabel>
                <Select
                  id="acc_tipo_acciones"
                  name='acc_tipo_acciones'
                  label='Tipo de acciones'
                  value={accionistaGlobal.acc_tipo_acciones}
                  onChange={asignarValores}
                  defaultValue='1'
                >
                  <MenuItem value={0}>Ordinaria</MenuItem>
                  <MenuItem value={1}>Desmaterializada</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Paper className={classes.paper}>
              <div style={{ marginBottom: 20 }}>
                <Typography variant='subtitle1' style={{ color: "#000000" }}>Dirección</Typography>
              </div>
              <FormControl required variant="outlined" className={classes.selectEstandar}>
                <InputLabel>País</InputLabel>
                <Select
                  id="acc_pais"
                  name='acc_pais'
                  label="País"
                  value={accionistaGlobal.acc_pais}
                  variant="outlined"
                  defaultValue='Ecuador'
                  onChange={asignarValores}
                >
                  {generateSelectPais()}
                </Select>
              </FormControl>
              <TextField
                id="acc_provincia"
                name='acc_provincia'
                label="Provincia"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.acc_provincia}
                onChange={asignarValores} />
              <TextField
                id="acc_ciudad"
                name='acc_ciudad'
                label="Ciudad"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.acc_ciudad}
                onChange={asignarValores} />
              <TextField
                id="acc_direccion"
                name='acc_direccion'
                label="Dirección"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.acc_direccion}
                onChange={asignarValores} />
              <TextField
                id="acc_dir_numero"
                name='acc_dir_numero'
                label="Número"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.acc_dir_numero}
                onChange={asignarValores} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Paper className={classes.paper}>
              <div style={{ marginBottom: 20 }}>
                <Typography variant='subtitle1' style={{ color: "#000000" }}>Cuenta Bancaria</Typography>
              </div>
              <TextField
                id="acc_banco"
                name='acc_banco'
                label="Banco"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.acc_banco}
                onChange={asignarValores} />
              <TextField
                id="acc_tipo_cuenta"
                name='acc_tipo_cuenta'
                label="Tipo de cuenta"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.acc_tipo_cuenta}
                onChange={asignarValores} />
              <TextField
                id="acc_cuenta_bancaria"
                name='acc_cuenta_bancaria'
                label="Número de cuenta"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.acc_cuenta_bancaria}
                onChange={asignarValores} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Paper className={classes.paper}>
              <div style={{ marginBottom: 20 }}>
                <Typography variant='subtitle1' style={{ color: "#000000" }}>Información Representante Legal</Typography>
              </div>
              <FormControl required variant="outlined" className={classes.selectEstandar}>
                <InputLabel>Tipo de identificación</InputLabel>
                <Select
                  id="pj_rl_tipo_identificacion"
                  name='pj_rl_tipo_identificacion'
                  label='Tipo de identificación Rep Leg'
                  value={accionistaGlobal.pj_rl_tipo_identificacion}
                  variant="outlined"
                  defaultValue='0'
                  onChange={asignarValoresEnteros}
                >
                  {generateSelectTipoIdentificacion()}
                </Select>
              </FormControl>
              <TextField
                id="pj_rl_identificacion"
                name='pj_rl_identificacion'
                label="Identificación Rep Leg"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.pj_rl_identificacion}
                onChange={asignarValores} />
              <TextField
                id="pj_rl_nombre"
                name='pj_rl_nombre'
                label="Nombre Completo Rep Leg"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.pj_rl_nombre}
                onChange={asignarValores} />
              <FormControl required variant="outlined" className={classes.selectEstandar}>
                <InputLabel>Nacionalidad</InputLabel>
                <Select
                  id="pj_rl_nacionalidad"
                  name='pj_rl_nacionalidad'
                  label="País"
                  value={accionistaGlobal.pj_rl_nacionalidad}
                  variant="outlined"
                  defaultValue='Ecuador'
                  onChange={asignarValores}
                >
                  {generateSelectPais()}
                </Select>
              </FormControl>
              <TextField
                id="pj_rl_telefono"
                name='pj_rl_telefono'
                label="Telefóno Rep Leg"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.pj_rl_telefono}
                onChange={asignarValores} />
              <TextField
                id="pj_rl_email"
                name='pj_rl_email'
                label="Correo Electrónico Rep Leg"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.pj_rl_email}
                onChange={asignarValores} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Paper className={classes.paper}>
              <div style={{ marginBottom: 20 }}>
                <Typography variant='subtitle1' style={{ color: "#000000" }}>Medios de Contacto</Typography>
              </div>
              <div className={classes.formSection}>
                <TextField
                  id="acc_telefonos1"
                  name='acc_telefonos1'
                  onChange={asignarValores}
                  value={accionistaGlobal.acc_telefonos1}
                  label={"Teléfono"}
                  variant='outlined'
                  style={{ minWidth: 130 }} />
                <TextField
                  id="acc_obs_telefonos1"
                  name='acc_obs_telefonos1'
                  onChange={asignarValores}
                  value={accionistaGlobal.acc_obs_telefonos1}
                  label={"Observación"}
                  variant='outlined'
                  fullWidth />
              </div>
              {countTelef > 1 &&
                <div className={classes.formSection}>
                  <TextField
                    id="acc_telefonos2"
                    name='acc_telefonos2'
                    onChange={asignarValores}
                    value={accionistaGlobal.acc_telefonos2}
                    label={"Teléfono Aux"}
                    variant='outlined'
                    style={{ minWidth: 130 }} />
                  <TextField
                    id="acc_obs_telefonos2"
                    name='acc_obs_telefonos2'
                    onChange={asignarValores}
                    value={accionistaGlobal.acc_obs_telefonos2}
                    label={"Observación Aux"}
                    variant='outlined'
                    fullWidth />
                </div>
              }
              {countTelef > 2 &&
                <div className={classes.formSection}>
                  <TextField
                    id="acc_telefonos3"
                    name='acc_telefonos3'
                    onChange={asignarValores}
                    value={accionistaGlobal.acc_telefonos3}
                    label={"Teléfono Aux"}
                    variant='outlined'
                    style={{ minWidth: 130 }} />
                  <TextField
                    id="acc_obs_telefonos3"
                    name='acc_obs_telefonos3'
                    onChange={asignarValores}
                    value={accionistaGlobal.acc_obs_telefonos3}
                    label={"Observación Aux"}
                    variant='outlined'
                    fullWidth />
                </div>
              }
              <div>
                <IconButton color='primary' onClick={() => setCountTelef(countTelef + 1)} disabled={countTelef === 3 ? true : false}><ControlPointIcon /></IconButton>
                <IconButton color='primary' onClick={() => setCountTelef(countTelef - 1)} disabled={countTelef === 1 ? true : false} ><RemoveCircleOutlineIcon /></IconButton>
              </div>
              <div className={classes.formSectionContacto}>
                <TextField
                  id="acc_correos1"
                  name='acc_correos1'
                  onChange={asignarValores}
                  value={accionistaGlobal.acc_correos1}
                  label={"Correo Principal"}
                  variant='outlined'
                  type='email'
                  fullWidth />
                {countEmail > 1 &&
                  <TextField
                    id="acc_correos2"
                    name='acc_correos2'
                    onChange={asignarValores}
                    value={accionistaGlobal.acc_correos2}
                    label={"Correo Auxiliar"}
                    variant='outlined'
                    type='email'
                    fullWidth />
                }
                {countEmail > 2 &&
                  <TextField
                    id="acc_correos3"
                    name='acc_correos3'
                    onChange={asignarValores}
                    value={accionistaGlobal.acc_correos3}
                    label={"Correo Auxiliar"}
                    variant='outlined'
                    type='email'
                    fullWidth />
                }
                <div>
                  <IconButton color='primary' onClick={() => setCountEmail(countEmail + 1)} disabled={countEmail === 3 ? true : false}><ControlPointIcon /></IconButton>
                  <IconButton color='primary' onClick={() => setCountEmail(countEmail - 1)} disabled={countEmail === 1 ? true : false}><RemoveCircleOutlineIcon /></IconButton>
                </div>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Paper className={classes.paper}>
              <div style={{ marginBottom: 20 }}>
                <Typography variant='subtitle1' style={{ color: "#000000" }}>Documentos Habilitantes</Typography>
              </div>
              <div className={classes.formSection}>
                <label htmlFor="upload-photo1">
                  <input style={{ display: 'none' }} id="upload-photo1" name="upload-photo1" type="file" accept="application/pdf" onChange={onChangeDI} />
                  <Button component="span" color="primary" size='small'>Documento de Identidad</Button>
                  {formData.docIdentidadPrincipal.length > 0 && <CheckIcon />}
                </label>
              </div>
              <div className={classes.formSection}>
                <label htmlFor="upload-photo2">
                  <input style={{ display: 'none' }} id="upload-photo2" name="upload-photo2" type="file" accept="application/pdf" onChange={onChangeCB} />
                  <Button component="span" color="primary" size='small' >Certificado Bancario</Button>
                  {formData.docCertificadoBancario.length > 0 && <CheckIcon />}
                </label>
              </div>
              <div className={classes.formSection}>
                <label htmlFor="upload-photo3">
                  <input style={{ display: 'none' }} id="upload-photo3" name="upload-photo3" type="file" accept="application/pdf" />
                  <Button component="span" color="primary" size='small'>Carta de actualización de datos</Button>
                  {formData.docIdentidadPrincipal.length > 0 && <CheckIcon />}
                </label>
              </div>
              <div className={classes.formSection}>
                <label htmlFor="upload-photo4">
                  <input style={{ display: 'none' }} id="upload-photo4" name="upload-photo4" type="file" accept="application/pdf" />
                  <Button component="span" color="primary" size='small' >Autorización para uso de datos</Button>
                  {formData.docCertificadoBancario.length > 0 && <CheckIcon />}
                </label>
              </div>
            </Paper>
          </Grid>
        </Grid>
        <Divider className={classes.divider} />
        <div className={classes.formSectionEnd}>
          <Button size='small' onClick={limpiarForm} style={{ textTransform: 'none' }} color='primary'>Limpiar</Button>
          <Button siza='small' onClick={onSubmit} variant='contained' color='primary' style={{ textTransform: 'none' }}>{location.state ? "Actualizar Accionista" : "Registrar Accionista"}</Button>
        </div>
        <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
          <Alert onClose={handleCloseSnack} severity="success">
            {mensajeExito}
          </Alert>
        </Snackbar>
        <Snackbar open={openSnackDanger} autoHideDuration={6000} onClose={handleCloseSnackDanger}>
          <Alert onClose={handleCloseSnackDanger} severity="error">
            {mensajeError}
          </Alert>
        </Snackbar>
      </Paper>
    </main>
  );
}
