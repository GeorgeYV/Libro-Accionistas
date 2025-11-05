import React, { useState } from 'react'
import {
  makeStyles, Paper, TextField, Button, Typography, MenuItem, Select, Divider, Grid,
  IconButton, InputLabel, Snackbar, Switch,
  FormControl, FormHelperText
} from '@material-ui/core';
import { useLocation, useParams } from 'react-router-dom'
import ControlPointIcon from '@material-ui/icons/ControlPoint';
import CheckIcon from '@material-ui/icons/Check';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import { API, Storage, graphqlOperation } from 'aws-amplify';
import { createAccionista, updateAccionista, createPersonaNatural, createConyuge, updateConyuge, updatePersonaNatural } from './../graphql/mutations';
import { uuid } from 'uuidv4';
import MuiAlert from '@material-ui/lab/Alert';
import {
  validarCampos, verificarCamposVacios,
  devolverSoloAccionista, devolverSoloConyuge, devolverSoloPersonaNatural
} from './../components/manejoAccionistas';
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
export default function PersonaNatural() {
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
  const estadoCivil = [
    {
      label: "Soltero",
      value: "0",
    },
    {
      label: "Casado",
      value: "1",
    },
    {
      label: "Unión de Hecho",
      value: "2",
    },
    {
      label: "Divorciado",
      value: "3",
    },
    {
      label: "Viudo",
      value: "4",
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
  const tipoCuenta = [
    {
      label: "Cta Cte",
      value: "1",
    },
    {
      label: "Cta Aho",
      value: "2",
    },
  ];
  var [countTelef, setCountTelef] = useState(1);
  var [countEmail, setCountEmail] = useState(1);
  const [conyugue, setConyugue] = useState(false);
  const location = useLocation();
  var [accionistaGlobal, setAccionistaGlobal] = useState(location.state ? location.state.preloadedValue : {});
  const separarCadenas = (name) => {
    var aux = accionistaGlobal[name].split("&");
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
    pn_primer_nombre: "",
    pn_segundo_nombre: "",
    pn_apellido_paterno: "",
    pn_apellido_materno: "",
    pn_estado_civil: 0,
    pn_doc_identificacion: "",
    con_tipo_identificacion: 0,
    con_identificacion: "",
    con_nombre: "",
    con_nacionalidad: 0,
    con_doc_identifcacion: "",
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
  //Metodos
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
  const classes = useStyles();
  const [countHerederos, setCountHerederos] = useState(location.state ? location.state.preloadedValue.nombreBeneficiario9 != null ? 9 : location.state.preloadedValue.nombreBeneficiario8 != null ? 8 : location.state.preloadedValue.nombreBeneficiario7 != null ? 7 : location.state.preloadedValue.nombreBeneficiario6 != null ? 6 : location.state.preloadedValue.nombreBeneficiario5 != null ? 5 : location.state.preloadedValue.nombreBeneficiario4 != null ? 4 : location.state.preloadedValue.nombreBeneficiario3 != null ? 3 : location.state.preloadedValue.nombreBeneficiario2 != null ? 2 : 1 : 1);
  const [formData, setFormData] = useState({
    docPosesionEfectiva: location.state ? location.state.preloadedValue.docPosesionEfectiva != null ? location.state.preloadedValue.docPosesionEfectiva : '' : '',
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
    respuesta = await verificarCamposVacios(accionistaGlobal, ["acc_decevale", "acc_identificacion", "pn_primer_nombre", "pn_apellido_paterno"]);
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
  const generateSelectEstadoCivil = () => {
    return estadoCivil.map((option) => {
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
      var accionistaAux = devolverSoloAccionista(accionista);
      var personaNaturalAux = devolverSoloPersonaNatural(accionista);
      var conyugeAux = devolverSoloConyuge(accionista);
      console.log("AccionistaAux: ", accionistaAux);
      console.log("personaNaturalAux: ", personaNaturalAux);
      console.log("conyugeAux: ", conyugeAux);
      const accionistaIdNew = await API.graphql(graphqlOperation(createAccionista, { input: accionistaAux }));
      console.log("accionistaIdNew: ", accionistaIdNew);
      personaNaturalAux.id = accionistaIdNew.data.createAccionista.id;
      const personaNaturalIdNew = await API.graphql(graphqlOperation(createPersonaNatural, { input: personaNaturalAux }));
      if (personaNaturalAux.pn_estado_civil == 1 || personaNaturalAux.pn_estado_civil == 2) {
        conyugeAux.id = personaNaturalIdNew.data.createPersonaNatural.id;
        await API.graphql(graphqlOperation(createConyuge, { input: conyugeAux }));
      }
      limpiarForm();
      setMensajeExito('Se registro el accionista correctamente.');
      setOpenSnack(true)
    } catch (err) {
      console.log('error creating accionista:', err);
      setMensajeError(err);
      setOpenSnackDanger(true);
    }
  }
  const editAccionista = async (accionista) => {
    try {
      var accionistaAux = devolverSoloAccionista(accionista);
      var personaNaturalAux = devolverSoloPersonaNatural(accionista);
      await API.graphql({ query: updateAccionista, variables: { input: accionistaAux } });
      await API.graphql({ query: updatePersonaNatural, variables: { input: personaNaturalAux } });
      if (personaNaturalAux.pn_estado_civil == 1 || personaNaturalAux.pn_estado_civil == 2) {
        var conyugeAux = devolverSoloConyuge(accionista);
        await API.graphql({ query: updateConyuge, variables: { input: { conyugeAux } } });
      }
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
    setCountHerederos(1);
    setCountTelef(1);
  }
  const onChangeEstadoCivil = (e) => {
    asignarValores(e);
    if (e.target.value === '2' || e.target.value === '3')
      setConyugue(true)
    else
      setConyugue(false)
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
  async function onChangePE(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    const filename = uuid() + file.name
    setFormData({ ...formData, docPosesionEfectiva: filename });
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
  const [checked, setChecked] = useState(location.state ? location.state.preloadedValue.herederos != null ? location.state.preloadedValue.herederos : '' : '');
  const handleChange = (event) => {
    setChecked(event.target.checked);
  };
  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Paper variant="outlined">
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
                  defaultValue='0'
                  onChange={asignarValoresEnteros}
                >
                  {generateSelectTipoIdentificacion()}
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
              <TextField
                required
                id="pn_primer_nombre"
                name='pn_primer_nombre'
                label="Primer nombre"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.pn_primer_nombre}
                onChange={asignarValores} />
              <TextField
                id="pn_segundo_nombre"
                name='pn_segundo_nombre'
                label="Segundo nombre"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.pn_segundo_nombre}
                onChange={asignarValores} />
              <TextField
                required
                id="pn_apellido_paterno"
                name="pn_apellido_paterno"
                label="Apellido paterno"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.pn_apellido_paterno}
                onChange={asignarValores} />
              <TextField
                id="pn_apellido_materno"
                name='pn_apellido_materno'
                label="Apellido materno"
                variant="outlined"
                className={classes.textFieldEstandar}
                value={accionistaGlobal.pn_apellido_materno}
                onChange={asignarValores} />
              <FormControl required variant="outlined" className={classes.selectEstandar}>
                <InputLabel>Estado civil</InputLabel>
                <Select
                  id="pn_estado_civil"
                  name='pn_estado_civil'
                  label='Estado civil'
                  defaultValue='1'
                  value={accionistaGlobal.pn_estado_civil}
                  variant="outlined"
                  onChange={onChangeEstadoCivil}
                >
                  {generateSelectEstadoCivil()}
                </Select>
              </FormControl>
            </Paper>
          </Grid>
          {conyugue &&
            <Grid item xs={12} md={6} lg={4}>
              <Paper className={classes.paper}>
                <div style={{ marginBottom: 20 }}>
                  <Typography variant='subtitle1' style={{ color: "#000000" }}>Información de Conyuge</Typography>
                </div>
                <FormControl required variant="outlined" className={classes.selectEstandar}>
                  <InputLabel>Tipo de identificación</InputLabel>
                  <Select
                    id="con_tipo_identificacion"
                    name='con_tipo_identificacion'
                    label='Tipo de identificación'
                    value={accionistaGlobal.con_tipo_identificacion}
                    variant="outlined"
                    onChange={asignarValoresEnteros}
                  >
                    {generateSelectTipoIdentificacion()}
                  </Select>
                </FormControl>
                <TextField
                  id="con_identificacion"
                  name='con_identificacion'
                  label="Identificación"
                  variant="outlined"
                  className={classes.textFieldEstandar}
                  value={accionistaGlobal.con_identificacion}
                  required
                  onChange={asignarValores} />
                <TextField
                  id="con_nombre"
                  name='con_nombre'
                  label="Nombre"
                  variant="outlined"
                  className={classes.textFieldEstandar}
                  value={accionistaGlobal.con_nombre}
                  required
                  onChange={asignarValores} />
                <FormControl required variant="outlined" className={classes.selectEstandar}>
                  <InputLabel>Nacionalidad</InputLabel>
                  <Select
                    id="con_nacionalidad"
                    name='con_nacionalidad'
                    label="Nacionalidad"
                    value={accionistaGlobal.con_nacionalidad}
                    variant="outlined"
                    onChange={asignarValores}
                  >
                    {generateSelectPais()}
                  </Select>
                </FormControl>
              </Paper>
            </Grid>
          }
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
              {conyugue &&
                <div className={classes.formSection}>
                  <label htmlFor="upload-photo5">
                    <input style={{ display: 'none' }} id="upload-photo5" name="upload-photo5" type="file" accept="application/pdf" onChange={onChangeDIC} />
                    <Button component="span" color="primary" size='small' >Documento de Identidad Cónyugue</Button>
                    {formData.docIdentidadConyugue.length > 0 && <CheckIcon />}
                  </label>
                </div>
              }
              <div className={classes.formSection}>
                <label htmlFor="upload-photo4">
                  <input style={{ display: 'none' }} id="upload-photo4" name="upload-photo4" type="file" onChange={onChangePE} />
                  <Button component="span" color="primary" size='small' >Posesión Efectiva</Button>
                  {formData.docPosesionEfectiva.length > 0 && <CheckIcon />}
                </label>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Paper className={classes.paper}>
              <div style={{ marginBottom: 20 }}>
                <Typography variant='subtitle1' style={{ color: "#000000" }}>Herederos</Typography>
              </div>
              <div style={{
                marginTop: 10, display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
                <Switch
                  checked={checked}
                  onChange={handleChange}
                  inputProps={{ 'aria-label': 'controlled' }}
                  size="small"
                />
              </div>
              <div>
                {checked && countHerederos > 0 &&
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', }}>
                  </div>
                }
                {countHerederos > 1 &&
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', }}>
                  </div>
                }
                {countHerederos > 2 &&
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', }}>
                  </div>
                }
                {checked &&
                  <div>
                    <IconButton color='primary' onClick={() => setCountHerederos(countHerederos + 1)} disabled={countHerederos === 9 ? true : false}><ControlPointIcon /></IconButton>
                    <IconButton color='primary' onClick={() => setCountHerederos(countHerederos - 1)} disabled={countHerederos === 1 ? true : false} ><RemoveCircleOutlineIcon /></IconButton>
                  </div>
                }
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
