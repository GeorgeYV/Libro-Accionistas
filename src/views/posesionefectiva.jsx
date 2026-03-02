import { useState, useEffect } from 'react';
import {
  makeStyles, Paper, Divider, Grid, Typography, TextField, Button, withStyles, ListItem, ListItemText, ListSubheader,
  List, IconButton, Snackbar, Switch, FormControlLabel, CircularProgress
} from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { API, Storage, graphqlOperation, Auth } from 'aws-amplify';
import { listAccionistas, listHerederos, listTitulos } from './../graphql/queries';
import SaveIcon from '@material-ui/icons/Save';
import CheckIcon from '@material-ui/icons/Check';
import MuiAlert from '@material-ui/lab/Alert';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import { uuid } from 'uuidv4';
import { createAccionistaOperacion, createOperacion, createTituloPorOperacion } from '../graphql/mutations';
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
  cedente: {
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 30,
    paddingLeft: 30,
  },
}));
const today = new Date();
const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
export default function PosesionEfectiva() {
  const [userName, setUserName] = useState("");
  const classes = useStyles();
  const [countHerederos, setCountHerederos] = useState(0);
  const [formData, setFormData] = useState({
    Parti: '', Escri: '', Impue: '', Decla: '', Carta: ''
  });
  var [total, setTotal] = useState(0);
  const [accionistas, setAccionistas] = useState([])
  var [titulos, setTitulos] = useState([])
  const [formHerederos, setFormHerederos] = useState([]);
  var [openSnack, setOpenSnack] = useState(false);
  var [openSnackDanger, setOpenSnackDanger] = useState(false);
  const [totalAccionesHerencia, setTotalAccionesHerencia] = useState(0);
  const [circular, setCircular] = useState(false);
  var [herederos, setHerederos] = useState({});
  var [valCedente, setValCedente] = useState({});
  const limpiarForm = async () => {
    setFormData({ Parti: '', Escri: '', Impue: '', Decla: '', Carta: '' });
    setTitulos([]);
    setTotal(0);
    setCountHerederos(0);
    setHerederos({});
  }
  const addOperacion = async () => {
    try {
      if (!herederos) {
        setOpenSnackDanger(true);
        return;
      }
      setCircular(true);
      var auxDocs = "Parti&" + formData.Parti + "&Escri&" + formData.Escri + "&Impue&" + formData.Impue +
        "&Decla&" + formData.Decla + "&Carta&" + formData.Carta;
      const operacion = {
        ope_fecha: fecha,
        ope_tipo: 6,
        ope_acciones: total,
        ope_estado: 0,
        ope_ingresador: userName,
        ope_aprobador: "",
        ope_fecha_aprobacion: "",
        ope_motivo_rechazo: -1,
        ope_observacion: "",
        ope_documento: auxDocs
      }
      console.log("operacion", operacion);
      var operacionIdNew = await API.graphql(graphqlOperation(createOperacion, { input: operacion }));
      var accionistaOperacion = {
        acc_ope_operacion_id: operacionIdNew.data.createOperacion.id,
        acc_ope_accionista_id: valCedente.id,
        acc_ope_detalle: "Cedente"
      }
      console.log("accionistaOperacion", accionistaOperacion);
      await API.graphql(graphqlOperation(createAccionistaOperacion, { input: accionistaOperacion }));
      var herederosAux = Object.keys(herederos).filter(key => key.includes("her_identificacion")).map(function (e) {
        return {
          acc_ope_operacion_id: operacionIdNew.data.createOperacion.id,
          acc_ope_accionista_id: herederos[e],
          acc_ope_detalle: "Heredero"
        };
      });
      console.log("herederosAux", herederosAux);
      Promise.all(
        herederosAux.map(input => API.graphql(graphqlOperation(createAccionistaOperacion, { input: input })))
      );
      const transferir = titulos.map(function (e) {
        return {
          tit_ope_titulo_id: e.id,
          tit_ope_operacion_id: operacionIdNew.data.createOperacion.id,
          tit_ope_acciones: e.tit_acciones
        };
      });
      Promise.all(
        transferir.map(input => API.graphql(graphqlOperation(createTituloPorOperacion, { input: input })))
      );
      console.log("transferir", transferir);
      setOpenSnack(true);
      setCircular(false);
      limpiarForm();
    } catch (err) {
      console.log('Error agregar operacion:', err)
    }
  }
  useEffect(() => {
    fetchAccionistas();
    let user = Auth.user;
    setUserName(user.username);
  }, [])
  async function fetchAccionistas() {
    const filter = {
      acc_tiene_herederos: {
        eq: true,
      },
      acc_estado: {
        eq: 1
      }
    };
    const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 1000 } });
    setAccionistas(apiData.data.listAccionistas.items);
  }
  async function fetchHerederos(idPadre, totalAux) {
    const filter = {
      her_id_accionisa: {
        eq: idPadre,
      }
    };
    const apiData = await API.graphql({ query: listHerederos, variables: { filter: filter, limit: 1000 } });
    var herederosAux = {};
    apiData.data.listHerederos.items.forEach((e) => {
      herederosAux["her_identificacion" + (apiData.data.listHerederos.items.indexOf(e) + 1)] = e.her_identificacion;
      herederosAux["her_nombre" + (apiData.data.listHerederos.items.indexOf(e) + 1)] = e.her_nombre;
      if (e.her_cant_acciones == null || e.her_cant_acciones == 0) {
        herederosAux["her_acciones" + (apiData.data.listHerederos.items.indexOf(e) + 1)] = Math.trunc(totalAux / apiData.data.listHerederos.items.length);
        if (apiData.data.listHerederos.items.indexOf(e) == 0) {
          herederosAux["her_acciones" + (apiData.data.listHerederos.items.indexOf(e) + 1)] = Math.trunc(totalAux / apiData.data.listHerederos.items.length) + (totalAux % apiData.data.listHerederos.items.length);
        }
      } else {
        herederosAux["her_acciones" + (apiData.data.listHerederos.items.indexOf(e) + 1)] = e.her_cant_acciones;
      }
    });
    setHerederos(herederosAux);
    setCountHerederos(apiData.data.listHerederos.items.length);
    console.log("herederosAux", herederosAux);
  }
  async function fetchTitulos(cedenteId) {
    let filter = {
      tit_accionista_id: {
        eq: cedenteId
      }
    };
    var totalAux = 0;
    var apiData = await API.graphql({ query: listTitulos, variables: { filter: filter, limit: 1000 } });
    setTitulos(apiData.data.listTitulos.items);
    apiData.data.listTitulos.items.forEach((elemento) => totalAux += elemento.tit_acciones);
    setTotal(totalAux);
    return totalAux;
  }
  const handleClickCedente = (option, value) => {
    if (value) {
      fetchTitulos(value.id, value.nombre).then(totAux => {
        fetchHerederos(value.id, totAux);
        setValCedente(value);
      });
    }
    else {
      console.log('entró para borrar cedente', value);
      setHerederos({});
      setCountHerederos(0);
      setFormData({ ...formData, 'idCedente': '', 'cedente': '' });
      setTitulos([]);
      setTotal(0);
      setValCedente({});
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
  async function onChangeParti(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    const filename = "Parti_" + uuid();
    setFormData({ ...formData, Parti: filename });
    await Storage.put(filename, file);
  }
  async function onChangeEscri(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    const filename = "Escri_" + uuid();
    setFormData({ ...formData, Escri: filename });
    await Storage.put(filename, file);
  }
  async function onChangeImpue(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    const filename = "Impue_" + uuid();
    setFormData({ ...formData, Impue: filename });
    await Storage.put(filename, file);
  }
  async function onChangeDecla(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    const filename = "Decla_" + uuid();
    setFormData({ ...formData, Decla: filename });
    await Storage.put(filename, file);
  }
  async function onChangeCarta(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    const filename = "Carta_" + uuid();
    setFormData({ ...formData, Carta: filename });
    await Storage.put(filename, file);
  }
  const asignarValoresHerederos = (event) => {
    if (event.target.name.includes("her_acciones")) {
      const totalAcciones = Object.keys(herederos).filter(key => key.includes("her_acciones")).map(key => parseInt(herederos[key]) || 0).reduce((prev, next) => prev + next, 0);
      if (totalAcciones > total) {
        alert("La cantidad total de acciones asignadas a los herederos no puede ser mayor a la cantidad de acciones del cedente.");
        setHerederos({ ...herederos, [event.target.name]: 0 });
        return;
      } else {
        setHerederos({ ...herederos, [event.target.name]: event.target.value });
      }
    }
    setHerederos({ ...herederos, [event.target.name]: event.target.value });
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
          </Grid>
          <Grid item xs={4} >
            <div className={classes.cedente}>
              <Autocomplete
                value={valCedente}
                size='small'
                //key={operacion}
                id="combo-box-cedente"
                options={accionistas}
                getOptionLabel={(option) => option.acc_nombre_completo ? option.acc_nombre_completo : ""}
                renderInput={(params) => <TextField {...params} label="Cedente" margin="normal" variant="outlined" />}
                onChange={(option, value) => handleClickCedente(option, value)}
              />
              {total > 0 &&
                <Table className={classes.table} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>F.Compra</TableCell>
                      <TableCell>Título</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {titulos.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell component="th" scope="row">
                          {row.createdAt}
                        </TableCell>
                        <TableCell>{row.id}</TableCell>
                        <TableCell align="right">{row.tit_acciones}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} align="right">Total Acciones:</TableCell>
                      <TableCell>{total}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              }
            </div>
          </Grid>
          <Grid item xs={5} >
            <div className={classes.cedente}>
              {countHerederos > 0 &&
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: '10px' }}>
                  <TextField
                    id="her_identificacion1"
                    name='her_identificacion1'
                    label="Identificación"
                    variant="outlined"
                    size='small'
                    value={herederos.her_identificacion1}
                    aria-readonly
                  />
                  <TextField
                    id="her_nombre1"
                    name='her_nombre1'
                    label="Nombre"
                    variant="outlined"
                    size='small'
                    value={herederos.her_nombre1}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_acciones1"
                    name='her_acciones1'
                    label="Acciones"
                    variant="outlined"
                    size='small'
                    value={herederos.her_acciones1}
                    onChange={asignarValoresHerederos}
                  />
                </div>
              }
              {countHerederos > 1 &&
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: '10px' }}>
                  <TextField
                    id="her_identificacion2"
                    name='her_identificacion2'
                    label="Identificación"
                    variant="outlined"
                    size='small'
                    value={herederos.her_identificacion2}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_nombre2"
                    name='her_nombre2'
                    label="Nombre"
                    variant="outlined"
                    size='small'
                    value={herederos.her_nombre2}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_acciones2"
                    name='her_acciones2'
                    label="Acciones"
                    variant="outlined"
                    size='small'
                    value={herederos.her_acciones2}
                    onChange={asignarValoresHerederos}
                  />
                </div>
              }
              {countHerederos > 2 &&
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: '10px' }}>
                  <TextField
                    id="her_identificacion3"
                    name='her_identificacion3'
                    label="Identificación"
                    variant="outlined"
                    size='small'
                    value={herederos.her_identificacion3}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_nombre3"
                    name='her_nombre3'
                    label="Nombre"
                    variant="outlined"
                    size='small'
                    value={herederos.her_nombre3}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_acciones3"
                    name='her_acciones3'
                    label="Acciones"
                    variant="outlined"
                    size='small'
                    value={herederos.her_acciones3}
                    onChange={asignarValoresHerederos}
                  />
                </div>
              }
              {countHerederos > 3 &&
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: '10px' }}>
                  <TextField
                    id="her_identificacion4"
                    name='her_identificacion4'
                    label="Identificación"
                    variant="outlined"
                    size='small'
                    value={herederos.her_identificacion4}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_nombre4"
                    name='her_nombre4'
                    label="Nombre"
                    variant="outlined"
                    size='small'
                    value={herederos.her_nombre4}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_acciones4"
                    name='her_acciones4'
                    label="Acciones"
                    variant="outlined"
                    size='small'
                    value={herederos.her_acciones4}
                    onChange={asignarValoresHerederos}
                  />
                </div>
              }
              {countHerederos > 4 &&
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: '10px' }}>
                  <TextField
                    id="her_identificacion5"
                    name='her_identificacion5'
                    label="Identificación"
                    variant="outlined"
                    size='small'
                    value={herederos.her_identificacion5}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_nombre5"
                    name='her_nombre5'
                    label="Nombre"
                    variant="outlined"
                    size='small'
                    value={herederos.her_nombre5}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_acciones5"
                    name='her_acciones5'
                    label="Acciones"
                    variant="outlined"
                    size='small'
                    value={herederos.her_acciones5}
                    onChange={asignarValoresHerederos}
                  />
                </div>
              }
              {countHerederos > 5 &&
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: '10px' }}>
                  <TextField
                    id="her_identificacion6"
                    name='her_identificacion6'
                    label="Identificación"
                    variant="outlined"
                    size='small'
                    value={herederos.her_identificacion6}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_nombre6"
                    name='her_nombre6'
                    label="Nombre"
                    variant="outlined"
                    size='small'
                    value={herederos.her_nombre6}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_acciones6"
                    name='her_acciones6'
                    label="Acciones"
                    variant="outlined"
                    size='small'
                    value={herederos.her_acciones6}
                    onChange={asignarValoresHerederos}
                  />
                </div>
              }
              {countHerederos > 6 &&
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: '10px' }}>
                  <TextField
                    id="her_identificacion7"
                    name='her_identificacion7'
                    label="Identificación"
                    variant="outlined"
                    size='small'
                    value={herederos.her_identificacion7}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_nombre7"
                    name='her_nombre7'
                    label="Nombre"
                    variant="outlined"
                    size='small'
                    value={herederos.her_nombre7}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_acciones7"
                    name='her_acciones7'
                    label="Acciones"
                    variant="outlined"
                    size='small'
                    value={herederos.her_acciones7}
                    onChange={asignarValoresHerederos}
                  />
                </div>
              }
              {countHerederos > 7 &&
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: '10px' }}>
                  <TextField
                    id="her_identificacion8"
                    name='her_identificacion8'
                    label="Identificación"
                    variant="outlined"
                    size='small'
                    value={herederos.her_identificacion8}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_nombre8"
                    name='her_nombre8'
                    label="Nombre"
                    variant="outlined"
                    size='small'
                    value={herederos.her_nombre8}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_acciones8"
                    name='her_acciones8'
                    label="Acciones"
                    variant="outlined"
                    size='small'
                    value={herederos.her_acciones8}
                    onChange={asignarValoresHerederos}
                  />
                </div>
              }
              {countHerederos > 8 &&
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', }}>
                  <TextField
                    id="her_identificacion9"
                    name='her_identificacion9'
                    label="Identificación"
                    variant="outlined"
                    size='small'
                    value={herederos.her_identificacion9}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_nombre9"
                    name='her_nombre9'
                    label="Nombre"
                    variant="outlined"
                    size='small'
                    value={herederos.her_nombre9}
                    aria-readonly
                    autoFocus={true} />
                  <TextField
                    id="her_acciones9"
                    name='her_acciones9'
                    label="Acciones"
                    variant="outlined"
                    size='small'
                    value={herederos.her_acciones9}
                    onChange={asignarValoresHerederos}
                  />
                </div>
              }
              {total > 0 &&
                <small style={{ color: total - totalAccionesHerencia < 0 ? 'red' : 'black' }}> Saldo: <strong>{total - totalAccionesHerencia}</strong> </small>
              }
            </div>
            {circular && <CircularProgress />}
          </Grid>
          <Grid item xs={3} container direction='column' justifyContent='flex-start' style={{ backgroundColor: '#f9f9f9', padding: 20, }}>
            <BlaclTextTypography variant='subtitle1' >
              Documentos requeridos
            </BlaclTextTypography>
            <label htmlFor="upload-photo1" style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <input style={{ display: 'none' }} id="upload-photo1" name="upload-photo1" type="file" accept="application/pdf" onChange={onChangeParti} />
              <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', }}>Partición extrajudicial</Button>
              {formData.Parti.length > 0 && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}> <CheckIcon color='primary' /> <IconButton onClick={() => setFormData({ ...formData, 'Parti': '' })} ><DeleteOutlineIcon color='aria-readonly' /></IconButton>  </div>}
            </label>
            <label htmlFor="upload-photo4" style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <input style={{ display: 'none' }} id="upload-photo4" name="upload-photo4" type="file" accept="application/pdf" onChange={onChangeDecla} />
              <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', }}>Escritura de Posesión efectiva de Bienes</Button>
              {formData.Escri.length > 0 && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}> <CheckIcon color='primary' /> <IconButton onClick={() => setFormData({ ...formData, 'Escri': '' })} ><DeleteOutlineIcon color='aria-readonly' /></IconButton>  </div>}
            </label>
            <label htmlFor="upload-photo2" style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <input style={{ display: 'none' }} id="upload-photo2" name="upload-photo2" type="file" accept="application/pdf" onChange={onChangeEscri} />
              <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', }}>Impuesto a la Herencia</Button>
              {formData.Impue.length > 0 && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}> <CheckIcon color='primary' /> <IconButton onClick={() => setFormData({ ...formData, 'Impue': '' })} ><DeleteOutlineIcon color='aria-readonly' /></IconButton>  </div>}
            </label>
            <label htmlFor="upload-photo3" style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <input style={{ display: 'none' }} id="upload-photo3" name="upload-photo3" type="file" accept="application/pdf" onChange={onChangeImpue} />
              <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', }}>Declaración Jurada</Button>
              {formData.Decla.length > 0 && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}> <CheckIcon color='primary' /> <IconButton onClick={() => setFormData({ ...formData, 'Decla': '' })} ><DeleteOutlineIcon color='aria-readonly' /></IconButton>  </div>}
            </label>
            <label htmlFor="upload-photo5" style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <input style={{ display: 'none' }} id="upload-photo5" name="upload-photo5" type="file" accept="application/pdf" onChange={onChangeCarta} />
              <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', }}>Carta Poder</Button>
              {formData.Carta.length > 0 && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}> <CheckIcon color='primary' /> <IconButton onClick={() => setFormData({ ...formData, 'Carta': '' })} ><DeleteOutlineIcon color='aria-readonly' /></IconButton>  </div>}
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
            //aria-readonly={total - formHerederos.length > 0 && particion ? totalAccionesHerencia < 0 ? true : false : 0}
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
        <Snackbar open={openSnackDanger} autoHideDuration={6000} onClose={handleCloseSnackDanger}>
          <Alert onClose={handleCloseSnackDanger} severity="error">
            Registre todos los campos requeridos!
          </Alert>
        </Snackbar>
      </Paper>
    </main>
  );
}