import React, { useState, useEffect } from 'react';

import {
  Snackbar,Grid, Button, Typography, makeStyles, ButtonGroup, Badge, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, TextField,
  ListItem, ListItemText, ListSubheader, List, CircularProgress, ListItemIcon, Switch, FormControlLabel, InputLabel, MenuItem, Select, OutlinedInput, Icon
} from '@material-ui/core';

import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import CheckIcon from '@material-ui/icons/Check';
import WarningIcon from '@material-ui/icons/ErrorOutlineOutlined';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import DescriptionIcon from '@material-ui/icons/Description';
import FiberNewOutlined from '@material-ui/icons/FiberNewOutlined';
import MuiAlert from '@material-ui/lab/Alert';

import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { API, Storage, Auth, graphqlOperation } from 'aws-amplify';
import { listOperacions, listTituloPorOperacions, listTitulos, getParametro, listAccionistaOperacions, listAccionistas, getAccionista, getPersonaNatural, getPersonaJuridica, getTitulo } from './../graphql/queries';
import { updateTitulo, createTitulo, updateAccionista, updateOperacion, createHeredero, createTituloPorOperacion, updateParametro } from './../graphql/mutations';
import PropTypes from 'prop-types';

import { styled } from '@material-ui//styles';
import { uuid } from 'uuidv4';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: {
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  root: {
    padding: theme.spacing(0.5, 0.5, 0),
    justifyContent: 'flex-end',
    display: 'flex',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  textField: {
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
    margin: theme.spacing(1, 0.5, 1.5),
    '& .MuiSvgIcon-root': {
      marginRight: theme.spacing(0.5),
    },
    '& .MuiInput-underline:before': {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
  botonAnular: {
    backgroundColor: theme.palette.error.light,
  },
  botonCellAnular: {
    color: theme.palette.error.light,
  }
}));

const Input = styled('input')({
  display: 'none',
});

function escapeRegExp(value) {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function QuickSearchToolbar(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <TextField
        variant="standard"
        value={props.value}
        onChange={props.onChange}
        placeholder="Buscar..."
        className={classes.textField}
        InputProps={{
          startAdornment: <SearchIcon fontSize="small" />,
          endAdornment: (
            <IconButton
              title="Clear"
              aria-label="Clear"
              size="small"
              style={{ visibility: props.value ? 'visible' : 'hidden' }}
              onClick={props.clearSearch}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    </div>
  );
}

QuickSearchToolbar.propTypes = {
  clearSearch: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};
const today = new Date();
const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
export default function Operaciones() {
  const classes = useStyles();
  var [accionistaGlobal, setAccionistaGlobal] = useState([]);
  var [cesionario, setCesionario] = useState([]);
  var [listaAccionistaOperaciones, setListaAccionistaOperaciones] = useState([]);
  const [userName, setUserName] = useState("");
  const [operaciones, setOperaciones] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [openRevisar, setOpenRevisar] = useState(false);
  const [imageCS, setImageCS] = useState('');
  const [transferencia, setTransferencia] = useState([]);
  const [estado, setEstado] = useState(0);
  const [titulos, setTitulos] = useState([])
  const [countEstado, setCountEstado] = useState([0, 0, 0, 0])
  const [circular, setCircular] = useState(false);
  const [herederos, setHerederos] = useState([]);
  const [anular, setAnular] = useState(false);
  const [rechazo, setRechazo] = useState(false);
  const [motivosRechazo, setMotivosRechazo] = useState([]);
  const [formData, setFormData] = useState({ cs: '', cg: '', ci: '', es: '', cp: '' });
  const [openSnack, setOpenSnack] = useState(false);
  const columns = [
    //{ field: 'id', headerName: 'Nro', width: 80, type: 'number' },
    {
      field: 'ope_fecha',
      headerName: 'Fecha',
      flex: 1,
    },
    {
      field: 'ope_tipo_letras',
      headerName: 'Operación',
      //width: 180,
      flex: 1,
    },
    {
      field: 'ope_ingresador',
      headerName: 'Ingresador',
      //width: 180,
      flex: 1,
    },
    {
      field: 'ope_acciones',
      headerName: 'Acciones',
      type: 'number',
      //width: 150,
      flex: 1,
    },
    {
      field: "Opciones",
      flex: 1,
      type: 'number',
      hide: (estado == 1 || estado == 0) ? false : true,
      renderCell: (cellValues) => {
        return (
          <Button
            //variant="contained"
            color="primary"
            onClick={(event) => {
              handleClickRevisar(event, cellValues);
            }}
          >
            Revisar
          </Button>
        );
      }
    },
    {
      field: "Anular",
      flex: 1,
      hide: estado == 1 ? false : true,
      //width: 180,
      renderCell: (cellValues) => {
        return (
          <Button
            //variant="contained"
            //color="primary"
            classes={{ root: classes.botonCellAnular }}
            onClick={(event) => {
              handleClickAnular(event, cellValues);
            }}
          >
            Anular
          </Button>
        );
      }
    },
    {
      field: "Detalles",
      flex: 1,
      hide: (estado == 1 || estado == 0) ? true : false,
      renderCell: (cellValues) => {
        return (
          <IconButton
            //variant="contained"
            //color="primary"
            onClick={(event) => {
              handleClickRevisar(event, cellValues);
              //console.log('click Icon',event,cellValues)
            }}
          >
            <DescriptionIcon />
          </IconButton>
        );
      }
    },

  ];

  const motivoRechazo = [
    {
      label: "Falta documentación",
      value: "1",
    },
    {
      label: "Documentación errada",
      value: "2",
    },
    {
      label: "Documentación duplicada",
      value: "3",
    },
    {
      label: "Error en acciones",
      value: "4",
    },
    {
      label: "Error en valor",
      value: "5",
    },
  ];

  const generateSelectMotivoRechazo = () => {
    return motivoRechazo.map((option) => {
      return (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      );
    });
  };

  function getUser() {
    //console.log("AUTH.USER",Auth)
    let user
    if (Auth.user != null) user = Auth.user.username;
    return user;
  }

  useEffect(() => {
    fetchOperaciones("Pendiente");
    fetchParametros();
    const user = getUser();
    setUserName(user);
  }, [operaciones.length, count]);
  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnack(false);
  };

  async function fetchOperaciones() {
    let filter = {
      ope_estado: {
        eq: estado
      }
    };
    const apiData = await API.graphql({ query: listOperacions, variables: { filter: filter, limit: 10000 }, });
    var operacionesFromAPI = apiData.data.listOperacions.items;
    var pendientes, aprobada, rechazada, anulada;
    operacionesFromAPI = operacionesFromAPI.map(function (e) {
      if (e.ope_estado == 0) pendientes = + 1;
      if (e.ope_estado == 1) aprobada = + 1;
      if (e.ope_estado == 2) rechazada = + 1;
      if (e.ope_estado == 3) anulada = + 1;
      return {
        id: e.id,
        ope_fecha: e.ope_fecha,
        ope_tipo_letras: e.ope_tipo == 0 ? 'Aumento de Capital' : e.ope_tipo == 1 ? 'Bloqueo' :
          e.ope_tipo == 2 ? 'Canje' : e.ope_tipo == 3 ? 'Cesión' : e.ope_tipo == 4 ? 'Desbloqueo' :
            e.ope_tipo == 5 ? 'Donación' : e.ope_tipo == 6 ? 'Posesión Efectiva' : e.ope_tipo == 7 ? 'Testamento' : 'Desconocida',
        ope_tipo: e.ope_tipo,
        ope_acciones: e.ope_acciones,
        ope_estado: e.ope_estado,
        ope_ingresador: e.ope_ingresador,
        ope_aprobador: e.ope_aprobador,
        ope_fecha_aprobacion: e.ope_fecha_aprobacion,
        ope_motivo_rechazo: e.ope_motivo_rechazo,
        ope_observacion: e.ope_observacion,
        ope_documento: e.ope_documento
      }
    });
    setOperaciones(operacionesFromAPI);
    if (count === 0) {
      setCount(1);
      setRows(operacionesFromAPI);
    }
    setCountEstado([pendientes, aprobada, rechazada, anulada]);
  }

  const [cantidadEmitida, setCantidadEmitida] = useState(0);
  const [valorNominal, setValorNominal] = useState(0);

  async function fetchParametros() {

    const apiData = await API.graphql({ query: getParametro, variables: { id: '1' } });

    const parametrosFromAPI = apiData.data.getParametro;

    setCantidadEmitida(parametrosFromAPI.cantidadEmitida);
    console.log(parametrosFromAPI.cantidadEmitida);
    setValorNominal(parametrosFromAPI.valorNominal);

  }

  const requestSearch = (searchValue) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
    const filteredRows = operaciones.filter((row) => {
      return Object.keys(row).some((field) => {

        //if (row[field] != null) {
        return row[field] && searchRegex.test(row[field].toString());
        //}
      });
    });
    setRows(filteredRows);
  };

  const handleClickAnular = (e, values) => {

    setTransferencia(values.row);
    setOpenRevisar(true);
    setAnular(true);
    fetchTitulos(values.row.id);
    console.log('values anular', values.row);
    //console.log('operacion',values.row.id);
  };


  const handleClickRevisar = (e, values) => {
    setTransferencia(values.row);
    setOpenRevisar(true);
    if (values.row.ope_tipo != 0) fetchTitulos(values.row.id);
    fetchAccionistaOperacions(values.row.id);
    setFormData({ cs: values.row.cs, cg: values.row.cg, ci: values.row.ci, es: values.row.es, cp: values.row.cp })
    console.log('values', values.row);
  };


  const handleRevisarOperacion = () => {
    setOpenRevisar(false);
    setAnular(false);
    setRechazo(false);
  };


  const handleReenviarOperacion = async () => {

    setCircular(true);
    const operacion = { ...formData }

    //Actualizar estado de operacion Rechazada a Pendiente
    //console.log('Aprobar operacion y actualizar Fecha', transferencia.id)
    //actualizar estado y fechaAprobacion de operacion aprobada
    //const today = new Date();
    //const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();

    const apiDataUpdateOper = await API.graphql({ query: updateOperacion, variables: { input: { id: transferencia.id, estado: 'Pendiente', cs: operacion.cs, cg: operacion.cg, ci: operacion.ci, es: operacion.es, cp: operacion.cp, } } });
    //console.log('xxxxxxxxxxxxxxxxxxxx', transferencia.id, operacion.cs, operacion.cg, operacion.ci, operacion.es, operacion.cp)

    setFormData({ cs: '', cg: '', ci: '', es: '', cp: '' })
    setCircular(false);
    setOpenRevisar(false);
    setAnular(false);
    setCount(0);
    setTransferencia([]);
    setTitulos([]);
    fetchOperaciones("Rechazada");
    setRechazo(false);
    setMotivosRechazo([]);

  }


  const handleActualizarDocumentos = async () => {

    setCircular(true);
    const operacion = { ...formData }

    const apiDataUpdateOper = await API.graphql({ query: updateOperacion, variables: { input: { id: transferencia.id, cs: operacion.cs, cg: operacion.cg, ci: operacion.ci, es: operacion.es, cp: operacion.cp, } } });

    setFormData({ cs: '', cg: '', ci: '', es: '', cp: '' })
    setCircular(false);
    setOpenRevisar(false);
    setAnular(false);
    setCount(0);
    setTransferencia([]);
    setTitulos([]);
    fetchOperaciones("Aprobada");
    setRechazo(false);
    setMotivosRechazo([]);

  }



  const handleAnularOperacion = async () => {

    setCircular(true);

    console.log('Anular Operacion')

    //Preguntar si tienen titulos ?

    //Desbloquear Titulos
    for (const titulo of titulos) {
      console.log('Titulo a Desbloquear', titulo)
      const apiData = await API.graphql({ query: updateTitulo, variables: { input: { id: titulo.tituloId, estado: 'Activo' } } });
      console.log('Titulo Desbloqueado', apiData)
    }

    //Actualizar estado de operacion a Anulada
    console.log('Aprobar operacion y actualizar Fecha', transferencia.id)
    //actualizar estado y fechaAprobacion de operacion aprobada
    const apiDataUpdateOper = await API.graphql({ query: updateOperacion, variables: { input: { id: transferencia.id, estado: 'Anulada', fechaAprobacion: fecha } } });
    console.log(' Pasó Aprobar operacion y actualizar Fecha', apiDataUpdateOper)


    setCircular(false);
    setOpenRevisar(false);
    setAnular(false);
    setCount(0);
    setTransferencia([]);
    setTitulos([]);
    fetchOperaciones("Pendiente");
    setRechazo(false);
  }

  const handleRechazarOperacion = async () => {
    setCircular(true);
    let obs = '';
    const res = motivosRechazo.map(motivo => {
      obs = obs + motivoRechazo.find(item => item.value == motivo).label + ' | '
    });
    const apiDataUpdateOper = await API.graphql({
      query: updateOperacion,
      variables: { input: { id: transferencia.id, estado: 'Rechazada', fechaAprobacion: fecha, motivoRechazo: motivosRechazo, observacion: obs } }
    });
    for (const titulo of titulos) {
      const apiData = await API.graphql({ query: updateTitulo, variables: { input: { id: titulo.tituloId, estado: 'Activo' } } });
    }
    setCircular(false);
    setOpenRevisar(false);
    setAnular(false);
    setCount(0);
    setTransferencia([]);
    setTitulos([]);
    fetchOperaciones("Pendiente");
    setRechazo(false);
    setMotivosRechazo([]);
  }

  async function aprobarOperacion(idOperacion) {
    try {
      const operacion = {
        id: idOperacion,
        ope_estado: 1,
        ope_aprobador: userName,
        ope_fecha_aprobacion: fecha,
      }
      await API.graphql(graphqlOperation(updateOperacion, { input: operacion }));
      return true;
    } catch (err) {
      console.log('Error aprobando la operación:', err);
      return false;
    }
  }

  
  async function operacionBloqueoDesbloqueo(acc_estadoAux, tit_estadoAux) {
    try {
      if (!(await aprobarOperacion(transferencia.id)).valueOf()) return false;
      await API.graphql(graphqlOperation(updateAccionista, { input: { id: accionistaGlobal.id, acc_estado: acc_estadoAux } }));
      Promise.all(
        titulos.map(input => API.graphql({ query: updateTitulo, variables: { input: { id: input.tit_ope_titulo_id, tit_estado: tit_estadoAux } } }))
      );
      return true;
    } catch (error) {
      console.log('Error aprobando la operación:', error);
      return false;
    }
  }

  async function actualizarParticipacionAccionistas(cantidadEmitida) {
    try {
      const api =await API.graphql({query: listAccionistas});
      const listaAccionistas = api.data.listAccionistas.items;
      Promise.all(
        listaAccionistas.map(input => 
          API.graphql({ query: updateAccionista, 
            variables: { input: { id: input.id, 
              acc_participacion: input.acc_cantidad_acciones/cantidadEmitida
        }}}))
      );
    } catch (err) {
      console.log('error creating transaction:', err);
    }
  }
  const operacionAumentoCapital = async () => {
    try {
      if (!(await aprobarOperacion(transferencia.id)).valueOf()) return false;
      var apiData = await API.graphql({ query: getTitulo, variables: { id: 'IDTituloPadreDeTodos' } });
      const tituloPadre = apiData.data.getTitulo;
      const tituloAux = {
        tit_accionista_id: accionistaGlobal.id,
        tit_estado: 1,
        tit_acciones: transferencia.ope_acciones,
        tit_desde: parseInt(tituloPadre.tit_hasta + 1),
        tit_hasta: parseInt(tituloPadre.tit_hasta + transferencia.ope_acciones),
        tit_padre: tituloPadre.id,
        tit_nivel: 1,
      }
      var tituloIdNew = await API.graphql(graphqlOperation(createTitulo, { input: tituloAux }));
      var tituloPorOperacionAux = {
        tit_ope_operacion_id: transferencia.id,
        tit_ope_titulo_id: tituloIdNew.data.createTitulo.id,
        tit_ope_acciones: transferencia.ope_acciones
      };
      await API.graphql(graphqlOperation(createTituloPorOperacion, { input: tituloPorOperacionAux }));
      const tituloPadreAux = {
        id: "IDTituloPadreDeTodos",
        tit_hasta: tituloPadre.tit_hasta + transferencia.ope_acciones
      }
      await API.graphql(graphqlOperation(updateTitulo, { input: tituloPadreAux }));
      accionistaGlobal.acc_cantidad_acciones += transferencia.ope_acciones;
      actualizarParticipacionAccionistas(tituloPadreAux.tit_hasta);
      await API.graphql(graphqlOperation(updateAccionista, {
        input: {
          id: accionistaGlobal.id,
          acc_estado:1,
          acc_cantidad_acciones: accionistaGlobal.acc_cantidad_acciones,
          acc_participacion: accionistaGlobal.acc_cantidad_acciones / tituloPadreAux.tit_hasta
        }
      }));
      await API.graphql(graphqlOperation(updateParametro, { input: { id: '1', cantidadEmitida: tituloPadreAux.tit_hasta } }));
      return true;
    } catch (err) {
      console.log('error creating transaction:', err);
      return false;
    }
  }

  const operacionCesion = async () => {
    try {
      if (!(await aprobarOperacion(transferencia.id)).valueOf()) return false;
      await API.graphql(graphqlOperation(updateAccionista, {
        input: {
          id: accionistaGlobal.id,
          acc_cantidad_acciones: accionistaGlobal.acc_cantidad_acciones - transferencia.ope_acciones,
          acc_participacion: (accionistaGlobal.acc_cantidad_acciones - transferencia.ope_acciones) / cantidadEmitida
        }
      }));
      console.log("accionistaGlobal",accionistaGlobal);
      console.log("transferencia",transferencia);
      console.log("cantidadEmitida",cantidadEmitida);
      await API.graphql(graphqlOperation(updateAccionista, {
        input: {
          id: cesionario.id,
          acc_cantidad_acciones: cesionario.acc_cantidad_acciones + transferencia.ope_acciones,
          acc_participacion: (cesionario.acc_cantidad_acciones + transferencia.ope_acciones) / cantidadEmitida
        }
      }));
      console.log("cantidades",titulos[0], transferencia.ope_acciones);
      if (titulos[0].tit_ope_acciones == transferencia.ope_acciones) {
        Promise.all(
          titulos.map(input => API.graphql({
            query: updateTitulo, variables: {
              input: {
                id: input.tit_ope_titulo_id,
                tit_accionista_id: cesionario.id
              }
            }
          }))
        );
      } else {
        var auxLenght = 0;
        titulos.map(input => {auxLenght++})
        if (auxLenght == 1) {
          var tituloPadre = await API.graphql(graphqlOperation(getTitulo, {
            id: titulos[0].tit_ope_titulo_id
          }));
          await API.graphql(graphqlOperation(updateTitulo, {
            input: {
              id: titulos[0].tit_ope_titulo_id,
              tit_acciones: tituloPadre.data.getTitulo.tit_acciones - transferencia.ope_acciones,
            }
          }));
          await API.graphql(graphqlOperation(createTitulo, {
            input: {
              tit_accionista_id: cesionario.id,
              tit_estado: 1,
              tit_acciones: transferencia.ope_acciones,
              tit_desde: parseInt(tituloPadre.data.getTitulo.tit_acciones - transferencia.ope_acciones + 1),
              tit_hasta: parseInt(tituloPadre.data.getTitulo.tit_acciones),
              tit_padre: tituloPadre.data.getTitulo.id,
              tit_nivel: tituloPadre.data.getTitulo.tit_nivel + 1,
            }
          }));
        }
      }
      return true;
    } catch (error) {
      console.log('Error aprobando la operación:', error);
      return false;
    }
  }

  const handleAprobarOperacion = async () => {
    var control = true;
    setCircular(true);
    switch (transferencia.ope_tipo_letras) {
      case "Aumento de Capital":
        control = (await operacionAumentoCapital()).valueOf();
        break;
      case "Bloqueo":
        control = (await operacionBloqueoDesbloqueo(3, 0)).valueOf();
        break;
      case "Cesión":
        control = (await operacionCesion()).valueOf();
        break;
      case "Desbloqueo":
        control = (await operacionBloqueoDesbloqueo(1, 1)).valueOf();
        break;
      default:
        control = false;
        console.log('Error aprobando la operación');
        break;
    }
    if (control) {
      console.log("Operación completada correctamente");
      setOpenSnack(true);
    }
    else {
      console.log("Error al aprobar la operación. Proceso: handleAprobarOperacion");
    }
    handleRevisarOperacion();
    setCircular(false);
    setOpenRevisar(false);
    setAnular(false);
    setCount(0);
    setTransferencia([]);
    setTitulos([]);
    fetchOperaciones("Pendiente");
  }
  async function fetchAccionistaOperacions(idOperacion) {
    let filter = {
      acc_ope_operacion_id: {
        eq: idOperacion
      }
    };
    const apiData = await API.graphql({ query: listAccionistaOperacions, variables: { filter: filter } });
    apiData.data.listAccionistaOperacions.items.forEach(element => {
      fetchAccionista(element.acc_ope_accionista_id).then(
        data => {
          if (element.acc_ope_detalle == "Bloqueo" ||
            element.acc_ope_detalle == "Desbloqueo" ||
            element.acc_ope_detalle == "Aumento Capital" ||
            element.acc_ope_detalle == "Cedente") setAccionistaGlobal(data);
          if (element.acc_ope_detalle == "Cesionario") setCesionario(data);
        }
      );
    });
  }

  async function fetchAccionista(idAccionista) {
    var accionista;
    var apiData = await API.graphql({ query: getAccionista, variables: { id: idAccionista } });
    accionista = apiData.data.getAccionista;
    /*if (accionista.acc_tipo_persona == 0) {
      apiData = await API.graphql({ query: getPersonaNatural, variables: { id: apiData.data.getAccionista.id } });
      accionista.nombre_completo = apiData.data.getPersonaNatural.pn_primer_nombre + ' ' + apiData.data.getPersonaNatural.pn_apellido_paterno;
    }
    if (accionista.acc_tipo_persona == 1) {
      apiData = await API.graphql({ query: getPersonaJuridica, variables: { id: apiData.data.getAccionista.id } });
      accionista.nombre_completo = apiData.data.getPersonaJuridica.pj_razon_social;
    }*/
    return accionista;
  }

  async function fetchTitulos(idOper) {
    let filter = {
      tit_ope_operacion_id: {
        eq: idOper
      }
    };
    const apiData = await API.graphql({ query: listTituloPorOperacions, variables: { filter: filter, limit: 10000 } });
    setTitulos(apiData.data.listTituloPorOperacions.items);
  }

  const getPictureCS = e => {
    e.stopPropagation();

    Storage.get(transferencia.cs)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function (response) {
          if (response.status === 200) {
            console.log("DOCUMENTOOOO CS", url);
            setImageCS(url);
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));

  };

  const getPictureCG = e => {
    e.stopPropagation();

    Storage.get(transferencia.cg)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function (response) {
          if (response.status === 200) {
            console.log("DOCUMENTOOOO CG", url.url);
            setImageCS(url);
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));

  };

  const getPictureCI = e => {
    e.stopPropagation();

    Storage.get(transferencia.ci)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function (response) {
          if (response.status === 200) {
            setImageCS(url);
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));

  };

  const getPictureES = e => {
    e.stopPropagation();

    Storage.get(transferencia.es)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function (response) {
          if (response.status === 200) {
            setImageCS(url);
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));

  };

  const getPictureCP = e => {
    e.stopPropagation();

    Storage.get(transferencia.cp)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function (response) {
          if (response.status === 200) {
            setImageCS(url);
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));

  };

  const handleChangeRechazo = (event) => {
    setRechazo(event.target.checked);
  };

  const handleChangeMotivosRechazo = (event) => {
    const {
      target: { value },
    } = event;
    console.log('motivos', event)
    setMotivosRechazo(
      // On autofill we get a the stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
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


  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />

      <Grid container spacing={3} >
        <Grid item xs={12} >
          <ButtonGroup size="medium" variant="text" aria-label="text button group" style={{ paddingBottom: 0, backgroundColor: 'white' }} fullWidth='true'>
            <Button onClick={() => { setEstado(0); setCount(0) }} variant={estado == "Pendiente" ? "contained" : "text"} startIcon={<EditIcon color={estado == 'Pendiente' ? 'inherit' : 'disabled'} />} size="medium" color={estado == "Pendiente" ? "primary" : 'inherit'}>
              <Typography variant='subtitle2' style={estado == "Pendiente" ? { color: 'white' } : { color: 'grey' }}>Pendientes</Typography>
              <Badge color="secondary" overlap="circular" badgeContent={countEstado[0]} style={{ left: 30, }}>
              </Badge>
            </Button>
            <Button onClick={() => { setEstado(1); setCount(0) }} variant={estado == "Aprobada" ? "contained" : "text"} startIcon={<CheckIcon color={estado == 'Aprobada' ? 'inherit' : 'disabled'} />} size='medium' color={estado == "Aprobada" ? "primary" : 'inherit'}>
              <Typography variant='subtitle2' style={estado == "Aprobada" ? { color: 'white' } : { color: 'grey' }} >Aprobadas</Typography>
              <Badge color="secondary" overlap="circular" badgeContent={countEstado[1]} style={{ left: 30, }}>
              </Badge>
            </Button>
            <Button onClick={() => { setEstado(2); setCount(0) }} variant={estado == "Rechazada" ? "contained" : "text"} startIcon={<WarningIcon color={estado == 'Rechazada' ? 'inherit' : 'disabled'} />} size='medium' color={estado == "Rechazada" ? "primary" : 'inherit'}>
              <Typography variant='subtitle2' style={estado == "Rechazada" ? { color: 'white' } : { color: 'grey' }}>Rechazadas</Typography>
              <Badge color="secondary" overlap="circular" badgeContent={countEstado[2]} style={{ left: 30, }}>
              </Badge>
            </Button>
            <Button onClick={() => { setEstado(3); setCount(0) }} variant={estado == "Anulada" ? "contained" : "text"} startIcon={<DeleteIcon color={estado == 'Anulada' ? 'inherit' : 'disabled'} />} size='medium' color={estado == "Anulada" ? "primary" : 'inherit'}>
              <Typography variant='subtitle2' style={estado == "Anulada" ? { color: 'white' } : { color: 'grey' }}>Anuladas</Typography>
              <Badge color="secondary" overlap="circular" badgeContent={countEstado[3]} style={{ left: 30, }}>
              </Badge>
            </Button>
          </ButtonGroup>

          <DataGrid
            disableColumnMenu
            //sortModel={ [{field: 'fecha', sort: 'desc',}]}
            style={{ backgroundColor: 'white' }}
            density="compact"
            autoHeight='true'
            autoPageSize='true'
            components={{ Toolbar: QuickSearchToolbar }}
            rows={rows}
            columns={columns}
            componentsProps={{
              toolbar: {
                value: searchText,
                onChange: (event) => requestSearch(event.target.value),
                clearSearch: () => requestSearch(''),
              },
            }}
          />

        </Grid>
      </Grid>

      <Dialog fullWidth='false' maxWidth='lg' open={openRevisar} onClose={handleRevisarOperacion} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" style={{ backgroundColor: '#ed5761' }}>
          <div>{transferencia.ope_tipo_letras}</div>
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            <Grid container style={{ display: 'flex' }}>
              <Grid item xs={4} >
                <Typography variant='h6'>
                  Detalle Operación
                </Typography>
                <Typography variant='subtitle1'>
                  <small>Fecha Solicitud</small>
                </Typography>
                <Typography variant='subtitle1'>
                  {transferencia.ope_fecha}
                </Typography>
                <Typography variant='subtitle1'>
                  {transferencia.ope_tipo_letras != "Cesión" &&
                    <small>Accionista</small>
                  }
                  {transferencia.ope_tipo_letras == "Cesión" &&
                    <small>Cedente</small>
                  }
                </Typography>
                <Typography variant='subtitle1'>
                  {accionistaGlobal.acc_nombre_completo}
                </Typography>
                {transferencia.ope_tipo_letras == "Cesión" &&
                  <Typography variant='subtitle1'>
                    <small>Cesionario</small>
                  </Typography>
                }
                {transferencia.ope_tipo_letras == "Cesión" &&
                  <Typography variant='subtitle1'>
                    {cesionario.acc_nombre_completo}
                  </Typography>
                }
                <Typography variant='subtitle1'>
                  <small>Total de acciones</small>
                </Typography>
                <Typography variant='subtitle1'>
                  {transferencia.ope_acciones}
                </Typography>
                {transferencia.ope_tipo_letras == 'Posesión Efectiva' &&
                  <List dense='true'
                    subheader={
                      <ListSubheader component="div" id="nested-list-subheader">
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 10, paddingRight: 70 }}>
                          <Typography variant='caption' style={{ flex: 1 }}>
                            Nro. Título
                          </Typography>
                          <Typography variant='caption' style={{ flex: 1 }}>
                            Acciones
                          </Typography>
                        </div>
                      </ListSubheader>
                    }>
                    {titulos.map(item => (
                      <ListItem key={item.id}>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingRight: 50 }}>
                          <div style={{ flex: 1 }}>
                            <ListItemText>{item.titulo}</ListItemText>
                          </div>
                          <div style={{ flex: 1 }}>
                            <ListItemText>{item.acciones}</ListItemText>
                          </div>
                        </div>
                      </ListItem>
                    ))}
                  </List>
                }
              </Grid>

              <Grid item xs={4} >
                {transferencia.ope_tipo_letras == 'Posesión Efectiva' &&
                  <div>
                    <Typography variant='h6'>
                      Herederos
                    </Typography>
                    <List dense='true' >
                      {herederos.map(item => (
                        <ListItem key={item.id}  >
                          <ListItemIcon>
                            <PersonOutlineIcon />
                          </ListItemIcon>
                          <ListItemText secondary={item.cantidad > 0 && <div style={{ fontSize: 10, fontWeight: 'bold' }}>Acciones: {item.cantidad}</div>}> {item.nombre} </ListItemText>
                        </ListItem>
                      ))}
                    </List>
                  </div>
                }
                {transferencia.ope_tipo_letras != 'Posesión Efectiva' && transferencia.ope_tipo_letras != 'Canje' && transferencia.ope_tipo_letras != 'Bloqueo' && transferencia.ope_tipo_letras != 'Desbloqueo' && transferencia.ope_tipo_letras != 'Aumento de Capital' &&
                  <div>
                    <Typography variant='h6'>
                      Acciones a Transferir
                    </Typography>
                    <List dense='true'
                      subheader={
                        <ListSubheader component="div" id="nested-list-subheader">
                          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 10 }}>
                            <Typography variant='caption' style={{ flex: 1 }}>
                              Título
                            </Typography>
                            <Typography variant='caption' style={{ flex: 1 }}>
                              Acciones
                            </Typography>
                            <Typography variant='caption' style={{ flex: 2 }}>
                              Transferir
                            </Typography>
                          </div>
                        </ListSubheader>

                      }>
                      {titulos.map(item => (
                        <ListItem key={item.id}>
                          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingRight: 40 }}>
                            <div style={{ flex: 1 }}>
                              <ListItemText>{item.tit_ope_titulo_id}</ListItemText>
                            </div>
                            <div style={{ flex: 1 }}>
                              <ListItemText>{item.tit_ope_acciones}</ListItemText>
                            </div>
                            <div style={{ flex: 1 }}>
                              <ListItemText style={{ color: '#FFB74D' }}>{transferencia.ope_acciones}</ListItemText>
                            </div>
                          </div>
                        </ListItem>
                      ))}
                    </List>
                  </div>
                }

                {(transferencia.ope_tipo_letras == 'Canje' || transferencia.ope_tipo_letras == 'Bloqueo' || transferencia.ope_tipo_letras == 'Desbloqueo') &&
                  <div>
                    <Typography variant='h6'>
                      Acciones
                    </Typography>
                    <List dense='true'
                      subheader={
                        <ListSubheader component="div" id="nested-list-subheader">
                          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 10, paddingRight: 50 }}>
                            <Typography variant='caption' style={{ flex: 1 }}>
                              Título
                            </Typography>
                            <Typography variant='caption' style={{ flex: 1 }}>
                              Acciones
                            </Typography>
                          </div>
                        </ListSubheader>

                      }>
                      {titulos.map(item => (
                        <ListItem key={item.id}>
                          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingRight: 40 }}>
                            <div style={{ flex: 1 }}>
                              <ListItemText>{item.id}</ListItemText>
                            </div>
                            <div style={{ flex: 1 }}>
                              <ListItemText>{item.tit_ope_acciones}</ListItemText>
                            </div>
                          </div>
                        </ListItem>
                      ))}
                    </List>
                  </div>
                }
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {circular && <CircularProgress />}
                </div>
              </Grid>
              <Grid item xs={4} >
                <Typography variant='h6'>
                  Documentación
                </Typography>
                {transferencia.ope_tipo_letras != 'Aumento Capital' &&
                  <div>
                    {(estado == 'Rechazada' || estado == 'Aprobada') && !anular &&
                      <label htmlFor="icon-button-fileCS">
                        <Input id="icon-button-fileCS" type="file" accept="application/pdf" onChange={onChangeCS} />
                        <IconButton color="primary" aria-label="upload picture" component="span">
                          <EditIcon fontSize="small" color='secondary' />
                        </IconButton>
                      </label>}
                    <Button component="span" color="primary" size='small' style={{ marginTop: 10 }} onClick={getPictureCS} disabled={transferencia.cs ? false : true}>
                      {transferencia.ope_tipo_letras == 'Cesión' ? 'Carta de Cesión y Gerente' : transferencia.ope_tipo_letras == 'Posesión Efectiva' ? 'Carta de Posesión Efectiva' : transferencia.ope_tipo_letras == 'Bloqueo' || transferencia.ope_tipo_letras == 'Desbloqueo' ? 'Documento de Respaldo' : transferencia.ope_tipo_letras == 'Testamento' ? 'Carta de Testamento' : transferencia.ope_tipo_letras == 'Donación' ? 'Carta de Donación' : 'Titulo Ordinario'}
                    </Button>
                    {transferencia.cs && <CheckIcon />}
                    {formData.cs && <FiberNewOutlined color='secondary' />}
                  </div>
                }
                {transferencia.ope_tipo_letras != 'Canje' && transferencia.ope_tipo_letras != 'Bloqueo' && transferencia.ope_tipo_letras != 'Desbloqueo' && transferencia.ope_tipo_letras != 'Aumento Capital' &&
                  <div>
                    {(estado == 'Rechazada' || estado == 'Aprobada') && !anular &&
                      <label htmlFor="icon-button-fileCG">
                        <Input id="icon-button-fileCG" type="file" accept="application/pdf" onChange={onChangeCG} />
                        <IconButton color="primary" aria-label="upload picture" component="span">
                          <EditIcon fontSize="small" color='secondary' />
                        </IconButton>
                      </label>}
                    <Button component="span" color="primary" size='small' onClick={getPictureCG} disabled={transferencia.cg ? false : true}>
                      {transferencia.ope_tipo_letras == 'Cesión' ? 'Cédulas' : transferencia.ope_tipo_letras == 'Testamento' ? 'Escritura de Testamento' : transferencia.ope_tipo_letras == 'Donación' ? 'Escritura de Donación de Bienes' : 'Impuesto a la Herencia'}

                    </Button>
                    {transferencia.cg && <CheckIcon />}
                    {formData.cg && <FiberNewOutlined color='secondary' />}
                  </div>
                }

                {transferencia.ope_tipo_letras != 'Canje' && transferencia.ope_tipo_letras != 'Bloqueo' && transferencia.ope_tipo_letras != 'Desbloqueo' && transferencia.ope_tipo_letras != 'Aumento Capital' &&
                  <div>
                    {(estado == 'Rechazada' || estado == 'Aprobada') && !anular &&
                      <label htmlFor="icon-button-fileCI">
                        <Input id="icon-button-fileCI" type="file" accept="application/pdf" onChange={onChangeCI} />
                        <IconButton color="primary" aria-label="upload picture" component="span">
                          <EditIcon fontSize="small" color='secondary' />
                        </IconButton>
                      </label>}
                    <Button component="span" color="primary" size='small' onClick={getPictureCI} disabled={transferencia.ci ? false : true}>
                      {transferencia.ope_tipo_letras == 'Cesión' ? 'Carta de Instrucciones' : transferencia.ope_tipo_letras == 'Testamento' ? 'Pago de Impuestos' : transferencia.ope_tipo_letras == 'Donación' ? 'Pago de Impuestos' : 'Declaración Jurada'}
                    </Button>
                    {transferencia.ci && <CheckIcon />}
                    {formData.ci && <FiberNewOutlined color='secondary' />}
                  </div>
                }
                {transferencia.ope_tipo_letras != 'Canje' && transferencia.ope_tipo_letras != 'Bloqueo' && transferencia.ope_tipo_letras != 'Desbloqueo' &&
                  <div>
                    {(estado == 'Rechazada' || estado == 'Aprobada') && !anular &&
                      <label htmlFor="icon-button-fileES">
                        <Input id="icon-button-fileES" type="file" accept="application/pdf" onChange={onChangeES} />
                        <IconButton color="primary" aria-label="upload picture" component="span">
                          <EditIcon fontSize="small" color='secondary' />
                        </IconButton>
                      </label>}
                    <Button component="span" color="primary" size='small' onClick={getPictureES} disabled={transferencia.es ? false : true}>
                      {transferencia.ope_tipo_letras == 'Aumento Capital' ? 'Escritura' : transferencia.ope_tipo_letras == 'Cesión' ? 'Escrituras' : transferencia.ope_tipo_letras == 'Testamento' ? 'Declaración Jurada' : transferencia.ope_tipo_letras == 'Donación' ? 'Declaración Jurada' : 'Escritura Posesión efectiva de Bienes'}
                    </Button>
                    {transferencia.es && <CheckIcon />}
                    {formData.es && <FiberNewOutlined color='secondary' />}
                  </div>
                }

                {transferencia.ope_tipo_letras != 'Cesión' && transferencia.ope_tipo_letras != 'Canje' && transferencia.ope_tipo_letras != 'Bloqueo' && transferencia.ope_tipo_letras != 'Desbloqueo' && transferencia.ope_tipo_letras != 'Aumento Capital' &&
                  <div>
                    {(estado == 'Rechazada' || estado == 'Aprobada') && !anular &&
                      <label htmlFor="icon-button-fileCP">
                        <Input id="icon-button-fileCP" type="file" accept="application/pdf" onChange={onChangeCP} />
                        <IconButton color="primary" aria-label="upload picture" component="span">
                          <EditIcon fontSize="small" color='secondary' />
                        </IconButton>
                      </label>}
                    <Button component="span" color="primary" size='small' onClick={getPictureCP} disabled={transferencia.cp ? false : true}>Poder</Button>
                    {transferencia.cp && <CheckIcon />}
                    {formData.cp && <FiberNewOutlined color='secondary' />}
                  </div>
                }
              </Grid>
            </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 'normal', fontSize: 10, color: 'grey' }}>Solicitante: {transferencia.ope_ingresador}</div>
          {transferencia.usuarioAprobador && <div style={{ fontWeight: 'normal', fontSize: 10, color: 'grey' }}>Aprobador: {transferencia.usuarioAprobador}    Fecha: {transferencia.fechaAprobacion} </div>}
          {!anular && estado == 0 &&
            <FormControlLabel control={<Switch size="small" checked={rechazo} onChange={handleChangeRechazo} />} label="Rechazar" />
          }

          <div>
            {!anular && !rechazo && estado == 0 &&
              <div>
                <Button onClick={handleAprobarOperacion} color="primary" variant='contained'>
                  Aprobar
                </Button>
              </div>
            }

            {rechazo && !anular && (estado == 1 || estado == 0) &&
              <div>

                <InputLabel id="rec"><small>Motivos de Rechazo</small></InputLabel>
                <Select labelId="rec" id="rechazo-multiple" multiple onChange={handleChangeMotivosRechazo} value={motivosRechazo} style={{ height: 37, minWidth: 150, marginRight: 20, fontSize: 10 }}>
                  {generateSelectMotivoRechazo()}
                </Select>

                <Button onClick={handleRechazarOperacion} color="secondary" variant='contained' >
                  Rechazar
                </Button>
              </div>
            }

            {anular && estado == 1 &&
              <Button onClick={handleAnularOperacion} classes={{ root: classes.botonAnular }} variant='contained'>
                Anular
              </Button>
            }

            {!anular && estado == 1 &&
              <Button onClick={handleReenviarOperacion} color="primary" variant='contained'>
                Volver a Solicitar Aprobación
              </Button>
            }

            {!anular && estado == 2 &&
              <Button onClick={handleActualizarDocumentos} color="secondary" variant='contained'>
                Actualizar documentos
              </Button>
            }

          </div>
        </DialogActions>
      </Dialog>
      <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnack} severity="success">
          La operación se aprobo correctamente.
        </MuiAlert>
      </Snackbar>
    </main>
  );
}