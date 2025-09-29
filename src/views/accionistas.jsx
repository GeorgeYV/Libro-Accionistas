import React, { useState, useEffect } from 'react';
import { API, Storage,graphqlOperation } from 'aws-amplify';
import { makeStyles } from '@material-ui/core/styles';
import { createTheme } from '@material-ui/core/styles';
import { Link, Route, BrowserRouter } from "react-router-dom";
import { listAccionistas, listTitulos, listOperacions, getParametro, listHerederos, listPersonaNaturals, listPersonaJuridicas, getTitulo } from '../graphql/queries';

import { DataGrid } from '@mui/x-data-grid';

import jsPDF from "jspdf";
import "jspdf-autotable";

import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';

import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import EditIcon from '@material-ui/icons/Edit';
import PageviewIcon from '@material-ui/icons/Pageview';
import DevicesOutlinedIcon from '@material-ui/icons/DevicesOutlined';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import CheckIcon from '@material-ui/icons/Check';
import PrintIcon from '@material-ui/icons/Print';

import BorderAllIcon from '@material-ui/icons/BorderAll';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';

import Grid from '@material-ui/core/Grid';
import QRcode from 'qrcode.react';
import marco from '../images/Recurso 1.png';
import fondoUnacem from '../images/Recurso 2.png';
import logoSolo from '../images/Recurso 3.png';
import logoCompleto from '../images/Recurso 4.png';

import {
  Typography, Button, ListItem, ListItemText, ListSubheader, List, Tooltip, Chip,
  FormControl, RadioGroup, FormControlLabel, Radio, Box, Tabs, Tab,
  Dialog, DialogActions, DialogContent, DialogTitle, ListItemIcon,
} from '@material-ui/core';

import { styled } from '@material-ui//styles';
import { createTitulo, updateAccionista } from '../graphql/mutations';

const defaultTheme = createTheme();
const useStyles = makeStyles(
  (theme) => ({
    root: {
      padding: theme.spacing(0, 2, 0),
      justifyContent: 'space-between',
      display: 'flex',
      alignItems: 'center',
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
    appBarSpacer: {
      ...theme.mixins.toolbar,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(2),
    },
  }),
  { defaultTheme },
);

const Input = styled('input')({
  display: 'none',
});


function escapeRegExp(value) {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}


QuickSearchToolbar.propTypes = {
  clearSearch: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};




function QuickSearchToolbar(props) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <TextField
        variant="standard"
        value={props.value}
        onChange={props.onChange}
        placeholder="Buscar accionista…"
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
    </div>

  );
}


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}



export default function Accionistas() {

  const [consultaDetallada, setConsultaDetallada] = useState(false);

  const [cantidadEmitido, setCantidadEmitido] = useState(1);
  const [openTitulos, setOpenTitulos] = useState(false);
  const handleClose = () => setOpenTitulos(false);

  const [estado, setEstado] = useState(1);

  let columns = []
  if (consultaDetallada) {
    columns = [
      { field: 'acc_tipo_identificacion', headerName: 'Tipo Id', },
      {
        field: 'acc_identificacion',
        headerName: 'Identificacion',
      },
      {
        field: 'acc_decevale',
        headerName: 'Decevale',
      },
      {
        field: 'acc_nombre_completo',
        headerName: 'Nombre',
      },
      { field: 'acc_direccion', headerName: 'Calle', },
      { field: 'acc_dir_numero', headerName: 'Numero', },
      { field: 'acc_banco', headerName: 'Banco', },
      { field: 'acc_tipo_cuenta', headerName: 'Tipo Cta', },
      { field: 'acc_cuenta_bancaria', headerName: 'Cuenta', },
      { field: 'acc_pais', headerName: 'Nacionalidad', },
      { field: 'acc_cantidad_acciones', headerName: 'Acciones', align: "right", },
      { field: 'acc_participacion', headerName: 'Participacion', type: 'number' },
      { field: 'acc_tipo_acciones', headerName: 'Tipo Acciones', },
      { field: 'acc_telefonos', headerName: 'Telefonos', },
      { field: 'acc_correos', headerName: 'Correos', },
      { field: 'acc_tipo_persona', headerName: 'Persona', },
    ]
  } else {
    columns = [
      {
        field: 'acc_identificacion',
        headerName: 'Identificacion',
        width: 120,
      },
      {
        field: 'acc_decevale',
        headerName: 'Decevale',
        width: 90,
      },
      {
        field: 'acc_nombre_completo',
        headerName: 'Nombre',
        width: 250,
        flex: 1,
      },
      {
        field: 'acc_nacionalidad',
        headerName: 'Nacionalidad',
        width: 110,
      },
      {
        field: 'acc_residencia',
        headerName: 'Residencia',
        width: 110,
      },
      {
        field: 'acc_cantidad_acciones',
        headerName: 'Acciones',
        //type: 'number',
        width: 100,
        align: "right",
      },
      {
        field: 'acc_participacion',
        headerName: 'Participación',
        type: 'number',
        width: 100,
      },
      {
        field: 'acc_tipo_acciones',
        headerName: 'Tipo',
        width: 70,
        renderCell: (cellValues) => {
          return cellValues.row.acc_tipo_acciones == 1 ?
            <Tooltip title="Desmaterializadas" >
              <DevicesOutlinedIcon />
            </Tooltip>
            :
            <Tooltip title="Ordinarias" >
              <DescriptionOutlinedIcon color='error' />
            </Tooltip>
        }
      },
      {
        field: 'acc_estado',
        headerName: 'Estado',
        width: 110,
        renderCell: (cellValues) => {
          return <Chip variant="outlined" size="small" label={cellValues.row.acc_estado == 0 ? 'Inactivo' : cellValues.row.acc_estado == 1 ? 'Activo' : 'Bloqueado'} color={cellValues.row.acc_estado == 1 ? 'primary' : 'secondary'} />
        }
      },

      {
        field: "Info",
        width: 70,
        renderCell: (cellValues) => {
          return <IconButton onClick={() => {
            fetchTitulos(cellValues.row);
          }
          } color='primary'><PageviewIcon /></IconButton>
        }
      },

      {
        field: "Edit",
        width: 80,
        renderCell: (cellValues) => {


          return <Link to={{
            pathname: cellValues.row.acc_tipo_identificacion == 0 ? "/personanatural" : "/personajuridica",
            state: {
              preloadedValue: cellValues.row.id,
            },
          }} color='primary'><EditIcon /></Link>;
        }
      }
    ];
  }

  const [accionistas, setAccionistas] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [rows, setRows] = useState([]);
  //const [count, setCount] = useState(0);
  const [titulos, setTitulos] = useState([])
  const [titulosHerencia, setTitulosHerencia] = useState([])
  const [accionistaSeleccionado, setAccionistaSeleccionado] = useState({});
  const [operaciones, setOperaciones] = useState([]);
  const [value, setValue] = useState(0);

  const handleChange = (event) => {
    console.log("estado", event.target.value)
    setEstado(event.target.value);
  };




  useEffect(() => {
    fetchParametros();
    fetchAccionistas();
  }, [estado]);


  async function fetchParametros() {

    const apiData = await API.graphql({ query: getParametro, variables: { id: '1' } });

    const parametrosFromAPI = apiData.data.getParametro;

    setCantidadEmitido(parametrosFromAPI.cantidadEmitida);
  }

  async function fetchAccionistas() {
    const filtro = {
      acc_estado: {
        eq: estado
      },
    }
    var apiData = await API.graphql({ query: listAccionistas, variables: {filter: filtro, limit: 1000 } });
    const accionistasFromAPI = apiData.data.listAccionistas.items;
    /*var apiData = await API.graphql({ query: getTitulo, variables: { id: 'IDTituloPadreDeTodos' } });
    const tituloPadre = apiData.data.getTitulo;
    var tituloAux = {
      tit_accionista_id: "",
      tit_estado: 1,
      tit_acciones: 0,
      tit_desde: 0,
      tit_hasta: 0,
      tit_padre: tituloPadre.id,
      tit_nivel: 1,
    }
    var desde=1;
    accionistasFromAPI.map(async accionistaAux => {
      tituloAux = {
        tit_accionista_id: accionistaAux.id,
        tit_estado: 1,
        tit_acciones: accionistaAux.acc_cantidad_acciones,
        tit_desde: parseInt(desde),
        tit_hasta: parseInt(desde + accionistaAux.acc_cantidad_acciones-1),
        tit_padre: tituloPadre.id,
        tit_nivel: 1,
      }
      desde = desde + accionistaAux.acc_cantidad_acciones;
      await API.graphql(graphqlOperation(createTitulo, { input: tituloAux }));
      await API.graphql(graphqlOperation(updateAccionista, { input: {id:accionistaAux.id,acc_estado:1} }));
    })*/
    apiData = await API.graphql({ query: listPersonaNaturals, variables: { limit: 1000 } });
    const personasNaturales = apiData.data.listPersonaNaturals.items;
    apiData = await API.graphql({ query: listPersonaJuridicas, variables: { limit: 1000 } });
    const personasJuridicas = apiData.data.listPersonaJuridicas.items;
    var nombre_completo="",pnAux,pjAux,
    pjVar={
      pj_rl_tipo_identificacion: "",
      pj_razon_social: "",
      pj_rl_identificacion: "",
      pj_rl_nombre: "",
      pj_rl_nacionalidad: "",
      pj_rl_telefono: "",
      pj_rl_email: "",
      pj_doc_nombramiento: "",
    },
    pnVar={
      pn_primer_nombre: "",
      pn_segundo_nombre: "",
      pn_apellido_paterno: "",
      pn_apellido_materno: "",
      pn_estado_civil: "",
      pn_doc_identificacion: ""
    };
    const accFinal = accionistasFromAPI.map(accionistaMap => {
      /*if (accionistaMap.acc_tipo_persona == 0) {
        pnAux = personasNaturales.find(({ id }) => id === accionistaMap.id);
        nombre_completo = pnAux.pn_primer_nombre + ' ' + pnAux.pn_apellido_paterno;
        pnVar.pn_primer_nombre = pnAux.pn_primer_nombre;
        pnVar.pn_segundo_nombre = pnAux.pn_segundo_nombre;
        pnVar.pn_apellido_paterno = pnAux.pn_apellido_paterno;
        pnVar.pn_apellido_materno = pnAux.pn_apellido_materno;
        pnVar.pn_estado_civil = pnAux.pn_estado_civil;
        pnVar.pn_doc_identificacion = pnAux.pn_doc_identificacion;
        pjVar={
          pj_rl_tipo_identificacion: "",
          pj_razon_social: "",
          pj_rl_identificacion: "",
          pj_rl_nombre: "",
          pj_rl_nacionalidad: "",
          pj_rl_telefono: "",
          pj_rl_email: "",
          pj_doc_nombramiento: "",
        };
      }
      if (accionistaMap.acc_tipo_persona == 1) {
        pjAux = personasJuridicas.find(({ id }) => id === accionistaMap.id);
        nombre_completo = pjAux.pj_razon_social;
        pjVar.pj_rl_tipo_identificacion = pjAux.pj_rl_tipo_identificacion;
        pjVar.pj_razon_social= pjAux.pj_razon_social;
        pjVar.pj_rl_identificacion= pjAux.pj_rl_identificacion;
        pjVar.pj_rl_nombre= pjAux.pj_rl_nombre;
        pjVar.pj_rl_nacionalidad= pjAux.pj_rl_nacionalidad;
        pjVar.pj_rl_telefono= pjAux.pj_rl_telefono;
        pjVar.pj_rl_email= pjAux.pj_rl_email;
        pjVar.pj_doc_nombramiento= pjAux.pj_doc_nombramiento;
        pnVar={
          pn_primer_nombre: "",
          pn_segundo_nombre: "",
          pn_apellido_paterno: "",
          pn_apellido_materno: "",
          pn_estado_civil: "",
          pn_doc_identificacion: ""
        };
      }*/
      return {
        id: accionistaMap.id,
        acc_decevale: accionistaMap.acc_decevale,
        acc_estado: accionistaMap.acc_estado,
        acc_tipo_identificacion: accionistaMap.acc_tipo_identificacion,
        acc_identificacion: accionistaMap.acc_identificacion,
        acc_nacionalidad: accionistaMap.acc_nacionalidad,
        acc_residencia: accionistaMap.acc_residencia,
        acc_pais: accionistaMap.acc_pais,
        acc_provincia: accionistaMap.acc_provincia,
        acc_ciudad: accionistaMap.acc_ciudad,
        acc_direccion: accionistaMap.acc_direccion,
        acc_dir_numero: accionistaMap.acc_dir_numero,
        acc_banco: accionistaMap.acc_banco,
        acc_tipo_cuenta: accionistaMap.acc_tipo_cuenta,
        acc_cuenta_bancaria: accionistaMap.acc_cuenta_bancaria,
        acc_doc_certificado_bancario: accionistaMap.acc_doc_certificado_bancario,
        acc_doc_actualizacion_datos: accionistaMap.acc_doc_actualizacion_datos,
        acc_doc_uso_datos: accionistaMap.acc_doc_uso_datos,
        acc_doc_posesion_efectiva: accionistaMap.acc_doc_posesion_efectiva,
        acc_telefonos: accionistaMap.acc_telefonos,
        acc_obs_telefonos: accionistaMap.acc_obs_telefonos,
        acc_correos: accionistaMap.acc_correos,
        acc_cantidad_acciones: accionistaMap.acc_cantidad_acciones,
        acc_participacion: accionistaMap.acc_participacion,
        acc_tipo_acciones: accionistaMap.acc_tipo_acciones,
        acc_tipo_persona: accionistaMap.acc_tipo_persona,
        /*pn_primer_nombre: pnVar.pn_primer_nombre,
        pn_segundo_nombre: pnVar.pn_segundo_nombre,
        pn_apellido_paterno: pnVar.pn_apellido_paterno,
        pn_apellido_materno: pnVar.pn_apellido_materno,
        pn_estado_civil: pnVar.pn_estado_civil,
        pn_doc_identificacion: pnVar.pn_doc_identificacion,
        pj_rl_tipo_identificacion: pjVar.pj_rl_tipo_identificacion,
        pj_razon_social: pjVar.pj_razon_social,
        pj_rl_identificacion: pjVar.pj_rl_identificacion,
        pj_rl_nombre: pjVar.pj_rl_nombre,
        pj_rl_nacionalidad: pjVar.pj_rl_nacionalidad,
        pj_rl_telefono: pjVar.pj_rl_telefono,
        pj_rl_email: pjVar.pj_rl_email,
        pj_doc_nombramiento: pjVar.pj_doc_nombramiento,*/
        acc_nombre_completo: accionistaMap.acc_nombre_completo
      }
    });
    setAccionistas(accFinal);
    setRows(accFinal);
  }

  const requestSearch = (searchValue) => {
    if (searchValue) {
      setSearchText(searchValue);
      const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
      const filteredRows = rows.filter((row) => {
        return Object.keys(row).some((field) => {
          if (row[field] != null) {
            return row[field] && searchRegex.test(row[field].toString());
          }
        });
      });
      setRows(filteredRows);
    }else{
      setSearchText('');
      setRows(accionistas)
    }
  };

  async function fetchTitulos(row) {

    console.log('entro', row)

    let filter = {
      tit_accionista_id: {
        eq: row.id 
      },
      tit_estado: {
        eq: 1
      }
    };

    const apiData = await API.graphql({ query: listTitulos, variables: { filter: filter, limit: 1000 } });
    const titulosFromAPI = apiData.data.listTitulos.items;

    setTitulos(titulosFromAPI);
    setAccionistaSeleccionado(row)
    setOpenTitulos(true)
    console.log('titulos', titulosFromAPI)
  }
  
  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };


  const getPictureDI = e => {
    e.stopPropagation();

    Storage.get(accionistaSeleccionado.docIdentidadPrincipal)
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

  const getPicturePE = e => {
    e.stopPropagation();

    Storage.get(accionistaSeleccionado.docPosesionEfectiva)
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

  const get_PDF = (e) => {
    Storage.get(e)
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

  const exportPDFCertificado = async () => {
    let base64Image = document.getElementById('qrcode').toDataURL()

    const unit = "pt";
    const size = "A4";
    const orientation = "landscape";

    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(12);

    const title = "UNACEM ECUADOR S.A.";

    doc.addImage(marco, "JPEG", 0, 3, 840, 590)
    doc.addImage(fondoUnacem, "JPEG", 90, 90, 663, 413)
    doc.addImage(logoSolo, "JPEG", 420, 120, 30, 30)

    doc.addImage(base64Image, "png", 95, 430, 80, 80)
    doc.addImage(logoCompleto, "PNG", 590, 450, 150, 50)

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.setFontSize(34);
    doc.text(title, 230, 200);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(137, 34, 28);
    doc.setFontSize(12);
    doc.text("CAPITAL SUSCRITO Y AUTORIZADO USD 1,717,204.32", 280, 215);

    doc.setTextColor(100);
    doc.setFontSize(11);
    const texto1 = "ESTE CERTIFICADO TOKENIZADO ACREDITA QUE";
    doc.text(texto1, 300, 250);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    const texto2 = accionistaSeleccionado.nombre_completo;
    doc.text(texto2, 220, 290);

    doc.setDrawColor(100);
    doc.setLineWidth(0.5);
    doc.line(150, 300, 690, 300);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const texto3 = "ES PROPIETARIO DE " + accionistaSeleccionado.acc_cantidad_acciones + " ACCIONES DE US$ 0.04 CENTAVOS DE DOLAR";
    doc.text(texto3, 230, 320);

    const texto4 = "DE LOS ESTADOS UNIDOS DE AMERICA, CON TODOS LOS DERECHOS Y OBLIGACIONES ";
    doc.text(texto4, 190, 340);

    const texto5 = "QUE LE CORRESPONDEN A LA LEY Y LOS ESTATUTOS SOCIALES DE LA COMPAÑIA.";
    doc.text(texto5, 200, 360);


    doc.setDrawColor(137, 34, 28);
    doc.setLineWidth(0.5);
    doc.line(250, 382, 590, 382);

    const months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];

    const d = new Date();

    doc.setFont("helvetica", "bold");
    doc.setTextColor(137, 34, 28);
    const texto6 = "EXPEDIDO EL " + d.getDate() + " DE " + months[d.getMonth()] + " DEL " + d.getFullYear() + " A LAS " + d.getHours() + ":" + ('0' + d.getMinutes()).slice(-2) + ".";
    doc.text(texto6, 280, 400);

    doc.setDrawColor(137, 34, 28);
    doc.setLineWidth(0.5);
    doc.line(250, 410, 590, 410);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150);

    const texto7 = "Fuente de Información Plataforma de Accionistas Unacem"
    doc.text(texto7, 195, 460);
    const texto8 = "https://develop.d1uap272r7bnzf.amplifyapp.com/"
    doc.text(texto8, 195, 470);
    const texto9 = "El código QR lo direccionará a la página de verificación";
    doc.text(texto9, 195, 490);
    doc.save("CertificadoAccionistas.pdf")
  }

  const classes = useStyles();

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl component="fieldset" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <RadioGroup
              row
              aria-label="gender"
              name="controlled-radio-buttons-group"
              value={estado}
              onChange={handleChange}
            >
              <FormControlLabel checked={estado == 1} value="1" control={<Radio color="secondary" size="small" />} label={<span style={{ fontSize: '0.8rem' }}>Activos</span>} />
              <FormControlLabel checked={estado == 3} value="3" control={<Radio color="secondary" size="small" />} label={<span style={{ fontSize: '0.8rem' }}>Bloqueados</span>} />
              <FormControlLabel checked={estado == 2} value="2" control={<Radio color="secondary" size="small" />} label={<span style={{ fontSize: '0.8rem' }}>Inactivos</span>} />
              <FormControlLabel checked={estado == 0} value="0" control={<Radio color="secondary" size="small" />} label={<span style={{ fontSize: '0.8rem' }}>Herederos</span>} />
              <IconButton color={consultaDetallada ? "default" : "primary"} onClick={() => { setConsultaDetallada(false) }}>
                <BorderAllIcon />
              </IconButton>
              <IconButton color={consultaDetallada ? "primary" : "default"} onClick={() => { setConsultaDetallada(true) }}>
                <ViewColumnIcon />
              </IconButton>
            </RadioGroup>
          </FormControl>



          <DataGrid
            //getRowId= {(row) => row.code}
            style={{ backgroundColor: 'white' }}
            //sortModel={ [{field: 'cantidadAcciones', sort: 'desc',}]}
            density="compact"
            autoHeight='true'
            autoPageSize='true'
            disableColumnMenu
            components={{ Toolbar: QuickSearchToolbar }}
            rows={rows}
            columns={columns}
            pageSize={20}
            rowsPerPageOptions={[20]}
            componentsProps={{
              toolbar: {
                value: searchText,
                onChange: (event) => requestSearch(event.target.value),
                clearSearch: () => requestSearch(''),
              },
            }}
          />
        </Grid>
        <Dialog open={openTitulos} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth='md' fullWidth={true}>
          <DialogTitle id="form-dialog-title">{accionistaSeleccionado.acc_nombre_completo}</DialogTitle>
          <DialogContent style={{ height: '60vh' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleChangeTab} aria-label="basic tabs example">
                <Tab label="Info" {...a11yProps(0)} />
                <Tab label="Documentos" {...a11yProps(1)} />
                <Tab label="Títulos" {...a11yProps(2)} />
                <Tab label="Operaciones" {...a11yProps(3)} />
                <Tab label="Certificado" {...a11yProps(4)} />
              </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption' >
                    <strong>Tipo Identificación</strong>
                  </Typography>
                  <Typography variant='body2'>
                    {accionistaSeleccionado.acc_tipo_identificacion==0?"Cedula":
                    accionistaSeleccionado.acc_tipo_identificacion==1?"RUC":"Pasaporte"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Identificación</strong>
                  </Typography>
                  <Typography variant='body2'>
                    {accionistaSeleccionado.acc_identificacion}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Nacionalidad</strong>
                  </Typography>
                  <Typography variant='body2'>
                    {accionistaSeleccionado.acc_nacionalidad}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Dirección</strong>
                  </Typography>
                  <Typography variant='body2'>
                    {accionistaSeleccionado.acc_direccion + ' ' + accionistaSeleccionado.acc_dir_numero}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Cuenta Bancaria</strong>
                  </Typography>
                  <Typography variant='body2'>
                    {accionistaSeleccionado.acc_banco == null ? '-' : accionistaSeleccionado.acc_banco + ' ' + accionistaSeleccionado.acc_tipo_cuenta + ' ' + accionistaSeleccionado.acc_cuenta_bancaria}
                  </Typography>
                </Grid>
                {accionistaSeleccionado.acc_tipo_persona == 0 &&
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Typography variant='caption'>
                      <strong>Estado Civil</strong>
                    </Typography>
                    <Typography variant='body2'>
                      {accionistaSeleccionado.pn_estado_civil == 0 ? 'soltero' : 
                      accionistaSeleccionado.pn_estado_civil == 1 ? "Casado":
                      accionistaSeleccionado.pn_estado_civil == 2 ? "Unión de hecho":
                      accionistaSeleccionado.pn_estado_civil == 3 ? "Divorciado": "Viudo"}
                    </Typography>
                  </Grid>
                }
                {accionistaSeleccionado.pn_estado_civil == 1 || accionistaSeleccionado.pn_estado_civil == 2 &&
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography variant='caption'>
                        <strong>Detalles Cónyugue</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Typography variant='caption'>
                        <strong>Tipo Identificación</strong>
                      </Typography>
                      <Typography variant='body2'>
                        {accionistaSeleccionado.con_}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Typography variant='caption'>
                        <strong>Identificación</strong>
                      </Typography>
                      <Typography variant='body2'>
                        {accionistaSeleccionado.conyugue_identificacion}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Typography variant='caption'>
                        <strong>Nombre</strong>
                      </Typography>
                      <Typography variant='body2'>
                        {accionistaSeleccionado.conyugue_nombre}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Typography variant='caption'>
                        <strong>Nacionalidad</strong>
                      </Typography>
                      <Typography variant='body2'>
                        {accionistaSeleccionado.conyugue_nacionalidad}
                      </Typography>
                    </Grid>
                  </Grid>
                }

                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Teléfono #1</strong>
                  </Typography>
                  <Typography variant='body2'>
                    {accionistaSeleccionado.telefono1 == null ? '-' : accionistaSeleccionado.telefono1}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Observación</strong>
                  </Typography>
                  <Typography variant='body2'>
                    {accionistaSeleccionado.obs1 == null ? '-' : accionistaSeleccionado.obs1}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Teléfono #2</strong>
                  </Typography>
                  <Typography variant='body2'>
                    {accionistaSeleccionado.telefono2 == null ? '-' : accionistaSeleccionado.telefono2}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Observación</strong>
                  </Typography>
                  <Typography variant='body2'>
                    {accionistaSeleccionado.obs2 == null ? '-' : accionistaSeleccionado.obs2}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Teléfono #3</strong>
                  </Typography>
                  <Typography variant='body2'>
                    {accionistaSeleccionado.telefono3 == null ? '-' : accionistaSeleccionado.telefono3}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Observación</strong>
                  </Typography>
                  <Typography variant='body2'>
                    {accionistaSeleccionado.obs3 == null ? '-' : accionistaSeleccionado.obs3}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Email #1</strong>
                  </Typography>
                  <Typography variant='body2'>
                    {accionistaSeleccionado.email1 == null ? '-' : accionistaSeleccionado.email1}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Email #2</strong>
                  </Typography>
                  <Typography variant='body2'>
                    {accionistaSeleccionado.email2 == null ? '-' : accionistaSeleccionado.email2}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Email #3</strong>
                  </Typography>
                  <Typography variant='body2'>
                    {accionistaSeleccionado.email3 == null ? '-' : accionistaSeleccionado.email3}
                  </Typography>
                </Grid>
                {accionistaSeleccionado.tipoPersona == 'PJ' &&
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography variant='caption'>
                        <strong>Detalles Representante Legal</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Typography variant='caption'>
                        <strong>Tipo Identificación</strong>
                      </Typography>
                      <Typography variant='body2'>
                        {accionistaSeleccionado.repLegal_tipoIdentificacion == null ? '-' : accionistaSeleccionado.repLegal_tipoIdentificacion}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Typography variant='caption'>
                        <strong>Identificación</strong>
                      </Typography>
                      <Typography variant='body2'>
                        {accionistaSeleccionado.repLegal_identificacion == null ? '-' : accionistaSeleccionado.repLegal_identificacion}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Typography variant='caption'>
                        <strong>Nombre</strong>
                      </Typography>
                      <Typography variant='body2'>
                        {accionistaSeleccionado.repLegal_nombre == null ? '-' : accionistaSeleccionado.repLegal_nombre}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Typography variant='caption'>
                        <strong>Nacionalidad</strong>
                      </Typography>
                      <Typography variant='body2'>
                        {accionistaSeleccionado.repLegal_nacionalidad == null ? '-' : accionistaSeleccionado.repLegal_nacionalidad}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Typography variant='caption'>
                        <strong>Teléfono</strong>
                      </Typography>
                      <Typography variant='body2'>
                        {accionistaSeleccionado.repLegal_telefono == null ? '-' : accionistaSeleccionado.repLegal_telefono}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Typography variant='caption'>
                        <strong>Email</strong>
                      </Typography>
                      <Typography variant='body2'>
                        {accionistaSeleccionado.repLegal_email == null ? '-' : accionistaSeleccionado.repLegal_email}
                      </Typography>
                    </Grid>
                  </Grid>
                }
              </Grid>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Documento de Identidad</strong>
                  </Typography>
                  {accionistaSeleccionado.docIdentidadPrincipal &&
                    <div>
                      <CheckIcon />
                      <Button component="span" color="primary" size='small' onClick={getPictureDI}>Ver</Button>
                    </div>
                  }
                  {!accionistaSeleccionado.docIdentidadPrincipal &&
                    <div>
                      -
                    </div>
                  }
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Certificado Bancario</strong>
                  </Typography>
                  {accionistaSeleccionado.docCertificadoBancario &&
                    <div>
                      <CheckIcon />
                      <Button component="span" color="primary" size='small' onClick={getPictureDI}>Ver</Button>
                    </div>
                  }
                  {!accionistaSeleccionado.docCertificadoBancario &&
                    <div>
                      -
                    </div>
                  }
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Typography variant='caption'>
                    <strong>Posesión Efectiva</strong>
                  </Typography>
                  {accionistaSeleccionado.docPosesionEfectiva &&
                    <div>
                      <CheckIcon />
                      <Button component="span" color="primary" size='small' onClick={getPicturePE}>Ver</Button>
                    </div>
                  }
                  {!accionistaSeleccionado.docPosesionEfectiva &&
                    <div>
                      -
                    </div>
                  }
                </Grid>
                {accionistaSeleccionado.pn_estadoCivil == 'Casado' &&
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Typography variant='caption'>
                      <strong>Documento de Identidad Cónyugue</strong>
                    </Typography>
                    {accionistaSeleccionado.docIdentidadConyugue &&
                      <div>
                        <CheckIcon />
                        <Button component="span" color="primary" size='small' onClick={getPictureDI}>Ver</Button>
                      </div>
                    }
                    {!accionistaSeleccionado.docIdentidadConyugue &&
                      <div>
                        -
                      </div>
                    }
                  </Grid>
                }
              </Grid>
            </TabPanel>
            <TabPanel value={value} index={2}>
              <List dense='true'
                subheader={
                  <ListSubheader component="div" id="nested-list-subheader">
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingLeft: '100px' }}>
                      <Typography variant='caption' style={{ flex: 2, fontWeight: 'bold' }}>
                        F.Compra
                      </Typography>
                      <Typography variant='caption' style={{ flex: 1, fontWeight: 'bold' }}>
                        Título
                      </Typography>
                      <Typography variant='caption' style={{ flex: 1, fontWeight: 'bold', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingRight: '30px' }}>
                        Cantidad
                      </Typography>
                      <Typography variant='caption' style={{ flex: 1, fontWeight: 'bold', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingRight: '30px' }}>
                        Desde
                      </Typography>
                      <Typography variant='caption' style={{ flex: 1, fontWeight: 'bold', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingRight: '30px' }}>
                        Hasta
                      </Typography>
                      <Typography variant='caption' style={{ flex: 2, fontWeight: 'bold' }}>
                        Estado
                      </Typography>
                    </div>
                  </ListSubheader>
                }>
                {
                  titulos.map(item => (
                    <ListItem key={item.id}>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingLeft: '100px' }}>
                        <ListItemText style={{ flex: 2 }}>{item.updatedAt}</ListItemText>
                        <ListItemText style={{ flex: 1 }}>{item.id}</ListItemText>
                        <ListItemText style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingRight: '30px' }}>{item.tit_acciones}</ListItemText>
                        <ListItemText style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingRight: '30px' }}>{item.tit_desde}</ListItemText>
                        <ListItemText style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingRight: '30px' }}>{item.tit_hasta}</ListItemText>
                        <ListItemText style={{ flex: 2 }}>{item.tit_estado}</ListItemText>
                      </div>
                    </ListItem>))}
              </List>
            </TabPanel>
            <TabPanel value={value} index={3}>
              <List dense='true'
                subheader={
                  <ListSubheader component="div" id="nested-list-subheader">
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Typography variant='caption' style={{ flex: 1, fontWeight: 'bold' }}>
                        Fecha
                      </Typography>
                      <Typography variant='caption' style={{ flex: 1, fontWeight: 'bold' }}>
                        Operación
                      </Typography>
                      <Typography variant='caption' style={{ flex: 1, fontWeight: 'bold', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingRight: '30px' }}>
                        Cantidad
                      </Typography>
                      <Typography variant='caption' style={{ flex: 2, fontWeight: 'bold' }}>
                        Cedente
                      </Typography>
                      <Typography variant='caption' style={{ flex: 2, fontWeight: 'bold' }}>
                        Cesionario
                      </Typography>
                      <Typography variant='caption' style={{ flex: 1, fontWeight: 'bold' }}>
                        Estado
                      </Typography>
                      <Typography variant='caption' style={{ flex: 1, fontWeight: 'bold' }}>
                        Documentación
                      </Typography>
                    </div>
                  </ListSubheader>
                }>
                {operaciones.map(item => (
                  <ListItem key={item.id}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <ListItemText style={{ flex: 1 }}><small>{item.fecha}</small></ListItemText>
                      <ListItemText style={{ flex: 1 }}><small>{item.operacion}</small></ListItemText>
                      <ListItemText style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingRight: '30px' }}><small>{item.acciones}</small></ListItemText>
                      <ListItemText style={{ flex: 2 }}><small>{item.cedente}</small></ListItemText>
                      <ListItemText style={{ flex: 2 }}><small>{item.cesionario}</small></ListItemText>
                      <ListItemText style={{ flex: 1 }}><small>{item.estado}</small></ListItemText>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {item.cs && <ListItemIcon style={{ flex: 1 }} ><IconButton onClick={() => get_PDF(item.cs)}>  <PageviewIcon /> </IconButton> </ListItemIcon>}
                        {item.cg && <ListItemIcon style={{ flex: 1 }}><IconButton onClick={() => get_PDF(item.cg)}><PageviewIcon /> </IconButton> </ListItemIcon>}
                        {item.ci && <ListItemIcon style={{ flex: 1 }}><IconButton onClick={() => get_PDF(item.ci)}><PageviewIcon /> </IconButton> </ListItemIcon>}
                        {item.es && <ListItemIcon style={{ flex: 1 }}><IconButton onClick={() => get_PDF(item.es)}><PageviewIcon /> </IconButton> </ListItemIcon>}
                        {item.ced && <ListItemIcon style={{ flex: 1 }}><IconButton onClick={() => get_PDF(item.ced)}><PageviewIcon /> </IconButton> </ListItemIcon>}
                        {item.cb && <ListItemIcon style={{ flex: 1 }}><IconButton onClick={() => get_PDF(item.cb)}><PageviewIcon /> </IconButton> </ListItemIcon>}
                        {item.nom && <ListItemIcon style={{ flex: 1 }}><IconButton onClick={() => get_PDF(item.nom)}><PageviewIcon /> </IconButton> </ListItemIcon>}
                      </div>
                    </div>
                  </ListItem>))}
              </List>
            </TabPanel>
            <TabPanel value={value} index={4}>
              <Grid container justifyContent="center" alignItems="center" direction="column">
                <Grid item>
                  <QRcode value={'https://production.dnyw5qmklx2h.amplifyapp.com/?id='} id='qrcode' size={100} />
                </Grid>
                <Grid item>
                  <Button startIcon={<PrintIcon />} size="small" variant="contained" color="primary" style={{ textTransform: 'none', height: '22px', marginTop: '15px' }} onClick={exportPDFCertificado}><small>Imprimir Certificado de Acciones</small></Button>
                </Grid>
              </Grid>
            </TabPanel>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary" >
              Salir
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </main>
  );
}