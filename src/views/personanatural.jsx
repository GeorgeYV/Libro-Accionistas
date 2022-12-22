import React, { useState } from 'react'
import { makeStyles, Paper, TextField, Button, Typography, MenuItem, Select, Divider, Grid, IconButton, InputLabel, Snackbar   } from '@material-ui/core';
import { Controller, useForm } from "react-hook-form";
import { useLocation } from 'react-router-dom'

import ControlPointIcon from '@material-ui/icons/ControlPoint';
import CheckIcon from '@material-ui/icons/Check';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';

import { API, Storage, graphqlOperation } from 'aws-amplify';
import {createAccionista, updateAccionista} from './../graphql/mutations';

import { uuid } from 'uuidv4';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

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
    formSectionTitulo: {
        display : 'flex',
        flexDirection : 'row',
        justifyContent:'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    formSection: {
        display : 'flex',
        flexDirection : 'row',
        justifyContent:'space-between',
        alignItems: 'center',
    },
    formSectionContacto: {
      display : 'flex',
      flexDirection : 'column',
      //justifyContent:'flex-start',
      alignItems: 'flex-start',
  },    
    gridSpace: {
        flexDirection: 'column',
        backgroundColor:'#f9f9f9',
        display : 'flex',
        marginLeft : 50,
        borderRadius : 5,
        padding: 20,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#00BCD4'
    },
    divider: {
        marginTop : 20,
        marginBottom : 20,
    },
    customTextField: {
        "& input::placeholder": {
          fontSize: "10px"
        }
      }
  }));
  
  const defaultValues = {
    id: '',
    apellidoMaterno: '',
    apellidoPaterno: '',
    banco: '1',
    calle: '',
    ciudadDireccion: '1',
    cuenta: '',
    email: '',
    estadoCivil: '1',
    identificacion: '',
    decevale: '',
    nacionalidad: '1',
    cantidadAcciones: '0',
    numero: '',
    observaciónTelefono: '',
    paisBanco: '1',
    paisDireccion: '1',
    pn_primerNombre: '',
    provinciaDireccion: '1',
    segundoNombre: '',
    telefono: '',
    tipoCuenta: '1',
    tipoIdentificacion: '1',
    tipoIdentificacionConyugue: '1',
    identificacionConyugue: '',
    nacionalidadConyugue : '1',
    nombreConyugue : '',
    observacionTelefono: '',
    telefonoAux1: '',
    observacionTelefonoAux1: '',
    telefonoAux2: '',
    observacionTelefonoAux2: '',
    emailAux1: '',
    emailAux2: '',
    docIdentidadPrincipal : '',
    docCertificadoBancario: '',
    docIdentidadConyugue : '',
  };
  
export default function PersonaNatural() {


  const tipoIdentificacion = [
    {
      label: "Cédula",
      value: "1",
    },
    {
      label: "RUC",
      value: "2",
    },
    {
    label: "Pasaporte",
    value: "3",
    },        
  ];
  const estadoCivil = [
    {
      label: "Soltero",
      value: "1",
    },
    {
      label: "Casado",
      value: "2",
    },
    {
      label: "Unión de Hecho",
      value: "3",
    },
    {
      label: "Divorciado",
      value: "4",
    },
    {
      label: "Viudo",
      value: "5",
    },
  ];
  const nacionalidad = [
    {
      label: "Ecuatoriana",
      value: "1",
    },
    {
      label: "Peruana",
      value: "2",
    },
    {
        label: "Estadoudinense",
        value: "3",
      },        
  ];
  const pais = [
    {
      label: "Ecuador",
      value: "1",
    },
    {
      label: "Perú",
      value: "2",
    },
    {
        label: "Estados Unidos",
        value: "3",
      },        
  ];
  const provincia = [
    {
      label: "Pichincha",
      value: "1",
    },
    {
      label: "Guayas",
      value: "2",
    },
    {
        label: "Chimborazo",
        value: "3",
      },    
      
      {
        label: "Azuay",
        value: "4",
      },
      {
        label: "Bolívar",
        value: "5",
      },
      {
        label: "Cañar",
        value: "6",
      },
      {
        label: "Carchi",
        value: "7",
      },
      {
        label: "Cotopaxi",
        value: "8",
      },
      {
        label: "El Oro",
        value: "9",
      },
      {
        label: "Esmeraldas",
        value: "10",
      },
      {
        label: "Galápagos",
        value: "11",
      },
      {
        label: "Imbabura",
        value: "12",
      },
      {
        label: "Loja",
        value: "13",
      },
      {
        label: "Los Ríos",
        value: "14",
      },
      {
        label: "Manabí",
        value: "15",
      },
      {
        label: "Morona Santiago",
        value: "16",
      },
      {
        label: "Napo",
        value: "17",
      },
      {
        label: "Orellana",
        value: "18",
      },
      {
        label: "Pastaza",
        value: "19",
      },
      {
        label: "Santa Elena",
        value: "20",
      },
      {
        label: "Santo Domingo de los Tsáchilas",
        value: "21",
      },
      {
        label: "Sucumbíos",
        value: "22",
      },
      {
        label: "Tungurahua",
        value: "23",
      },
      {
        label: "Zamora Chinchipe",
        value: "24",
      },
  ];
  const ciudad = [
    { label: "Alamor",  value: "139",},
    { label: "Alausí",  value: "116",},
    { label: "Alfredo Baquerizo Moreno",  value: "98",},
    { label: "Amaluza",  value: "186",},
    { label: "Ambato",  value: "10",},
    { label: "Arajuno",  value: "194",},
    { label: "Archidona",  value: "129",},
    { label: "Arenillas",  value: "63",},
    { label: "Atacames",  value: "68",},
    { label: "Atuntaqui",  value: "57",},
    { label: "Azogues",  value: "42",},
    { label: "Baba",  value: "131",},
    { label: "Babahoyo",  value: "17",},
    { label: "Baeza",  value: "183",},
    { label: "Bahía de Caráquez",  value: "58",},
    { label: "Balao",  value: "91",},
    { label: "Balsas",  value: "144",},
    { label: "Balzar",  value: "47",},
    { label: "Baños de Agua Santa",  value: "75",},
    { label: "Biblián",  value: "128",},
    { label: "Bolívar",  value: "163",},
    { label: "Buena Fe",  value: "35",},
    { label: "Calceta",  value: "62",},
    { label: "Caluma",  value: "117",},
    { label: "Camilo Ponce Enríquez",  value: "134",},
    { label: "Cañar",  value: "73",},
    { label: "Cariamanga",  value: "74",},
    { label: "Carlos Julio Arosemena Tola",  value: "208",},
    { label: "Catacocha",  value: "114",},
    { label: "Catamayo",  value: "54",},
    { label: "Catarama",  value: "118",},
    { label: "Cayambe",  value: "34",},
    { label: "Celica",  value: "142",},
    { label: "Cevallos",  value: "168",},
    { label: "Chaguarpamba",  value: "203",},
    { label: "Chambo",  value: "140",},
    { label: "Chilla",  value: "206",},
    { label: "Chillanes",  value: "165",},
    { label: "Chimbo",  value: "141",},
    { label: "Chone",  value: "22",},
    { label: "Chordeleg",  value: "143",},
    { label: "Chunchi",  value: "150",},
    { label: "Cnel. Marcelino Maridueña",  value: "110",},
    { label: "Colimes",  value: "120",},
    { label: "Cotacachi",  value: "94",},
    { label: "Cuenca",  value: "3",},
    { label: "Cumandá",  value: "96",},
    { label: "Daule",  value: "19",},
    { label: "Déleg",  value: "218",},
    { label: "Durán",  value: "6",},
    { label: "Echeandía",  value: "121",},
    { label: "El Ángel",  value: "138",},
    { label: "El Carmen",  value: "27",},
    { label: "El Chaco",  value: "146",},
    { label: "El Corazón",  value: "184",},
    { label: "El Dorado de Cascales",  value: "177",},
    { label: "El Guabo",  value: "55",},
    { label: "El Pan",  value: "220",},
    { label: "El Pangui",  value: "161",},
    { label: "El Tambo",  value: "136",},
    { label: "El Triunfo",  value: "39",},
    { label: "Esmeraldas",  value: "11",},
    { label: "Flavio Alfaro",  value: "119",},
    { label: "General Villamil",  value: "41",},
    { label: "Girón",  value: "147",},
    { label: "Gonzanamá",  value: "190",},
    { label: "Gral. Antonio Elizalde (Bucay)",  value: "123",},
    { label: "Gral. Leonidas Plaza Gutiérrez (Limón)",  value: "154",},
    { label: "Guachapala",  value: "201",},
    { label: "Gualaceo",  value: "71",},
    { label: "Gualaquiza",  value: "107",},
    { label: "Guamote",  value: "167",},
    { label: "Guano",  value: "104",},
    { label: "Guaranda",  value: "50",},
    { label: "Guayaquil",  value: "2",},
    { label: "Guayzimi",  value: "182",},
    { label: "Huaca",  value: "148",},
    { label: "Huamboya",  value: "211",},
    { label: "Huaquillas",  value: "26",},
    { label: "Ibarra",  value: "15",},
    { label: "Isidro Ayora",  value: "124",},
    { label: "Jama",  value: "122",},
    { label: "Jaramijó",  value: "64",},
    { label: "Jipijapa",  value: "31",},
    { label: "Junín",  value: "130",},
    { label: "La Bonita",  value: "219",},
    { label: "La Concordia",  value: "45",},
    { label: "La Joya de los Sachas",  value: "81",},
    { label: "La Libertad",  value: "16",},
    { label: "La Maná",  value: "51",},
    { label: "La Troncal",  value: "38",},
    { label: "La Victoria",  value: "200",},
    { label: "Las Naves",  value: "187",},
    { label: "Latacunga",  value: "20",},
    { label: "Logroño",  value: "188",},
    { label: "Loja",  value: "9",},
    { label: "Lomas de Sargentillo",  value: "72",},
    { label: "Loreto",  value: "156",},
    { label: "Lumbaqui",  value: "178",},
    { label: "Macará",  value: "77",},
    { label: "Macas",  value: "60",},
    { label: "Machachi",  value: "66",},
    { label: "Machala",  value: "5",},
    { label: "Manta",  value: "7",},
    { label: "Marcabelí",  value: "152",},
    { label: "Mera",  value: "215",},
    { label: "Milagro",  value: "14",},
    { label: "Mira",  value: "160",},
    { label: "Mocache",  value: "100",},
    { label: "Mocha",  value: "199",},
    { label: "Montalvo",  value: "76",},
    { label: "Montecristi",  value: "28",},
    { label: "Muisne",  value: "125",},
    { label: "Nabón",  value: "198",},
    { label: "Naranjal",  value: "49",},
    { label: "Naranjito",  value: "48",},
    { label: "Nobol",  value: "99",},
    { label: "Nueva Loja",  value: "25",},
    { label: "Olmedo",  value: "175",},
    { label: "Olmedo",  value: "217",},
    { label: "Oña",  value: "213",},
    { label: "Otavalo",  value: "33",},
    { label: "Pablo Sexto",  value: "216",},
    { label: "Paccha",  value: "185",},
    { label: "Paján",  value: "111",},
    { label: "Palanda",  value: "179",},
    { label: "Palenque",  value: "115",},
    { label: "Palestina",  value: "97",},
    { label: "Pallatanga",  value: "151",},
    { label: "Palora",  value: "159",},
    { label: "Paquisha",  value: "207",},
    { label: "Pasaje",  value: "23",},
    { label: "Patate",  value: "174",},
    { label: "Paute",  value: "108",},
    { label: "Pedernales",  value: "56",},
    { label: "Pedro Carbo",  value: "59",},
    { label: "Pedro Vicente Maldonado",  value: "127",},
    { label: "Pelileo",  value: "84",},
    { label: "Penipe",  value: "204",},
    { label: "Pichincha",  value: "149",},
    { label: "Píllaro",  value: "105",},
    { label: "Pimampiro",  value: "133",},
    { label: "Pindal",  value: "181",},
    { label: "Piñas",  value: "69",},
    { label: "Portovelo",  value: "102",},
    { label: "Portoviejo",  value: "8",},
    { label: "Pucará",  value: "210",},
    { label: "Puebloviejo",  value: "101",},
    { label: "Puerto Ayora",  value: "80",},
    { label: "Puerto Baquerizo Moreno",  value: "113",},
    { label: "Puerto El Carmen de Putumayo",  value: "173",},
    { label: "Puerto Francisco de Orellana",  value: "30",},
    { label: "Puerto López",  value: "87",},
    { label: "Puerto Quito",  value: "162",},
    { label: "Puerto Villamil",  value: "176",},
    { label: "Pujilí",  value: "85",},
    { label: "Puyo",  value: "43",},
    { label: "Quero",  value: "166",},
    { label: "Quevedo",  value: "12",},
    { label: "Quilanga",  value: "212",},
    { label: "Quinsaloma",  value: "137",},
    { label: "Quito",  value: "1",},
    { label: "Riobamba",  value: "13",},
    { label: "Rioverde",  value: "157",},
    { label: "Rocafuerte",  value: "92",},
    { label: "Rosa Zárate",  value: "46",},
    { label: "Salinas",  value: "40",},
    { label: "Salitre",  value: "82",},
    { label: "Samborondón",  value: "29",},
    { label: "San Fernando",  value: "189",},
    { label: "San Gabriel",  value: "70",},
    { label: "San Juan Bosco",  value: "191",},
    { label: "San Lorenzo",  value: "53",},
    { label: "San Miguel",  value: "112",},
    { label: "San Miguel de Los Bancos",  value: "135",},
    { label: "San Miguel de Salcedo",  value: "78",},
    { label: "San Vicente",  value: "88",},
    { label: "Sangolquí",  value: "18",},
    { label: "Santa Ana",  value: "89",},
    { label: "Santa Clara",  value: "193",},
    { label: "Santa Elena",  value: "32",},
    { label: "Santa Isabel",  value: "126",},
    { label: "Santa Lucía",  value: "95",},
    { label: "Santa Rosa",  value: "24",},
    { label: "Santiago",  value: "202",},
    { label: "Santiago de Méndez",  value: "171",},
    { label: "Santo Domingo",  value: "4",},
    { label: "Saquisilí",  value: "109",},
    { label: "Saraguro",  value: "145",},
    { label: "Sevilla de Oro",  value: "214",},
    { label: "Shushufindi",  value: "67",},
    { label: "Sigchos",  value: "180",},
    { label: "Sígsig",  value: "153",},
    { label: "Simón Bolívar",  value: "106",},
    { label: "Sozoranga",  value: "209",},
    { label: "Sucre",  value: "164",},
    { label: "Sucúa",  value: "103",},
    { label: "Suscal",  value: "197",},
    { label: "Tabacundo",  value: "86",},
    { label: "Taisha",  value: "205",},
    { label: "Tarapoa",  value: "195",},
    { label: "Tena",  value: "52",},
    { label: "Tiputini",  value: "221",},
    { label: "Tisaleo",  value: "196",},
    { label: "Tosagua",  value: "83",},
    { label: "Tulcán",  value: "21",},
    { label: "Urcuquí",  value: "155",},
    { label: "Valdez (Limones)",  value: "132",},
    { label: "Valencia",  value: "65",},
    { label: "Velasco Ibarra",  value: "37",},
    { label: "Ventanas",  value: "36",},
    { label: "Villa La Unión (Cajabamba)",  value: "170",},
    { label: "Vinces",  value: "44",},
    { label: "Yacuambi",  value: "192",},
    { label: "Yaguachi",  value: "61",},
    { label: "Yantzaza",  value: "93",},
    { label: "Zamora",  value: "79",},
    { label: "Zapotillo",  value: "169",},
    { label: "Zaruma",  value: "90",},
    { label: "Zumba",  value: "158",},
    { label: "Zumbi",  value: "172",},
                ];
  const banco = [
    {
      label: "Banco Pichincha",
      value: "1",
    },
    {
      label: "Banco Guayaquil",
      value: "2",
    },
    {
        label: "Banco Internacional",
        value: "3",
      },        
      {
        label: "Banco del Pacífico",
        value: "4",
      },
      {
        label: "Banco Bolivariano",
        value: "5",
      },
      {
        label: "Diners Club",
        value: "6",
      },
      {
        label: "Banco ProCredit",
        value: "7",
      },
      {
        label: "Banco General Rumiñahui",
        value: "8",
      },
      {
        label: "Produbanco",
        value: "9",
      },   
      {
        label: "Banco del Austro",
        value: "10",
      },                                      

      {
        label: "Banco Capital",
        value: "11",
      },       
      {
        label: "Banco Comercial de Manabi",
        value: "12",
      },       
      {
        label: "CoopNacional",
        value: "13",
      },       
      {
        label: "DelBank",
        value: "14",
      },       
      {
        label: "D-Miro",
        value: "15",
      },  
      {
        label: "Banco Finca",
        value: "16",
      },      
      {
        label: "Banco Litoral",
        value: "17",
      },    
      {
        label: "Banco Loja",
        value: "18",
      },          
      {
        label: "Banco Machala",
        value: "19",
      },   
      {
        label: "Banco Solidario",
        value: "20",
      },    
      {
        label: "Banco Sudamericano",
        value: "21",
      },    
      {
        label: "Banco VisionFund Ecuador",
        value: "22",
      },           
      { label: "CAJA CENTRAL - FINANCOOP",value: "23",},
      { label: "COOPERATIVA CAMARA DE COMERCIO DE AMBATO",value: "24",},
      { label: "COOPERATIVA MUSHUC RUNA LTDA.",value: "25",},
      { label: "COOPERATIVA PADRE JULIAN LORENTE LTDA.",value: "26",},
      { label: "COOPERATIVA 15 DE ABRIL LTDA.",value: "27",},
      { label: "COOPERATIVA 23 DE JULIO",value: "28",},
      { label: "COOPERATIVA 29 DE OCTUBRE",value: "29",},
      { label: "COOPERATIVA ANDALUCIA",value: "30",},
      { label: "COOPERATIVA COOPROGRESO",value: "31",},
      { label: "COOPERATIVA 9 DE OCTUBRE LTDA",value: "32",},
      { label: "COOPERATIVA COTOCOLLAO",value: "33",},
      { label: "COOPERATIVA ONCE DE JUNIO",value: "34",},
      { label: "COOPERATIVA DE LA PEQUEÑA EMPRESA CACPE BIBLIAN LTDA.",value: "35",},
      { label: "COOPERATIVA DESARROLLO DE LOS PUEBLOS",value: "36",},
      { label: "COOPERATIVA EL SAGRARIO",value: "37",},
      { label: "COOPERATIVA LA DOLOROSA LTDA.",value: "38",},
      { label: "COOPERATIVA OSCUS",value: "39",},
      { label: "COOPERATIVA RIOBAMBA",value: "40",},
      { label: "COOPERATIVA SAN FRANCISCO",value: "41",},
      { label: "COOPERATIVA SANTA ANA LTDA.",value: "42",},
      { label: "COOPERATIVA TULCAN",value: "43",},
      { label: "COOPERATIVA ALIANZA DEL VALLE LTDA.",value: "44",},
      { label: "COOPERATIVA ATUNTAQUI LTDA.",value: "45",},
      { label: "COOPERATIVA PEQUEÑA EMPRESA DE COTOPAXI LTDA. (CACPECO)",value: "46",},
      { label: "COOPERATIVA COMERCIO LTDA.",value: "47",},
      { label: "COOPERATIVA CONSTRUCCION COMERCIO Y PRODUCCIÓN LTDA",value: "48",},
      { label: "COOPERATIVA DE LA PEQUEÑA EMPRESA DE PASTAZA",value: "49",},
      { label: "COOPERATIVA GUARANDA LTDA.",value: "50",},
      { label: "COOPERATIVA JARDIN AZUAYO",value: "51",},
      { label: "COOPERATIVA JUVENTUD ECUATORIANA PROGRESISTA LTDA.",value: "52",},
      { label: "COOPERATIVA MANUEL ESTEBAN GODOY ORTEGA LTDA. COOPMEGO",value: "53",},
      { label: "COOPERATIVA PABLO MUÑOZ VEGA.",value: "54",},
      { label: "COOPERATIVA PREVISION AHORRO Y DESARROLLO - COOPAD",value: "55",},
      { label: "COOPERATIVA SANTA ROSA LTDA.",value: "56",},
      { label: "COOPERATIVA CALCETA LTDA.",value: "57",},
      { label: "COOPERATIVA CHONE LTDA.",value: "58",},
      { label: "COOPERATIVA DE LA PEQUEÑA EMPRESA DE LOJA CACPE LOJA LTDA.",value: "59",},
      { label: "COOPERATIVA SAN FRANCISCO DE ASIS LTDA.",value: "60",},
      { label: "COOPERATIVA SAN JOSE LTDA.",value: "61",},
      
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


  
  

//cargar los documentos

//setFormData({ ...formData, docIdentidadPrincipal: location.state.preloadedValue.docIdentidadPrincipal });



//
  const location = useLocation()
  const { preloadedValue } = location.state ? {preloadedValue : 
    { 
      id:  location.state.preloadedValue.id,
      tipoIdentificacion: tipoIdentificacion.find(o => o.label === location.state.preloadedValue.tipoIdentificacion).value,
      identificacion : location.state.preloadedValue.identificacion, 
      decevale: location.state.preloadedValue.decevale,       
      apellidoMaterno: location.state.preloadedValue.pn_apellidoMaterno,
      apellidoPaterno: location.state.preloadedValue.pn_apellidoPaterno,
      banco: banco.find(o => o.label === location.state.preloadedValue.nombreBanco) ? banco.find(o => o.label === location.state.preloadedValue.nombreBanco).value : '1',
      calle: location.state.preloadedValue.direccionCalle,
      ciudadDireccion: ciudad.find(o => o.label === location.state.preloadedValue.direccionCiudad) ? ciudad.find(o => o.label === location.state.preloadedValue.direccionCiudad).value : '1',
      cuenta: location.state.preloadedValue.cuentaBancaria,
      email: location.state.preloadedValue.email1,
      estadoCivil: estadoCivil.find(o => o.label === location.state.preloadedValue.pn_estadoCivil) ? estadoCivil.find(o => o.label === location.state.preloadedValue.pn_estadoCivil).value : '1',
      nacionalidad: nacionalidad.find(o => o.label === location.state.preloadedValue.paisNacionalidad) ? nacionalidad.find(o => o.label === location.state.preloadedValue.paisNacionalidad).value : '1',
      cantidadAcciones: location.state.preloadedValue.cantidadAcciones,
      numero: location.state.preloadedValue.direccionNumero,
      paisBanco: pais.find(o => o.label === location.state.preloadedValue.paisNacionalidad) ? pais.find(o => o.label === location.state.preloadedValue.paisNacionalidad).value : '1',
      paisDireccion: pais.find(o => o.label === location.state.preloadedValue.direccionPais) ? pais.find(o => o.label === location.state.preloadedValue.direccionPais).value : '1',
      pn_primerNombre: location.state.preloadedValue.pn_primerNombre,
      provinciaDireccion: provincia.find(o => o.label === location.state.preloadedValue.direccionProvincia) ? provincia.find(o => o.label === location.state.preloadedValue.direccionProvincia).value : '1',
      segundoNombre: location.state.preloadedValue.pn_segundoNombre,
      telefono: location.state.preloadedValue.telefono1,
      tipoCuenta: tipoCuenta.find(o => o.label === location.state.preloadedValue.tipoCuenta) ? tipoCuenta.find(o => o.label === location.state.preloadedValue.tipoCuenta).value : '1',
      tipoIdentificacionConyugue: tipoIdentificacion.find(o => o.label === location.state.preloadedValue.conyugue_tipoIdentificacion) ? tipoIdentificacion.find(o => o.label === location.state.preloadedValue.conyugue_tipoIdentificacion).value : '1',
      identificacionConyugue: location.state.preloadedValue.conyugue_identificacion,
      nacionalidadConyugue : nacionalidad.find(o => o.label === location.state.preloadedValue.conyugue_nacionalidad) ? nacionalidad.find(o => o.label === location.state.preloadedValue.conyugue_nacionalidad).value : '1',
      nombreConyugue : location.state.preloadedValue.conyugue_nombre,
      observacionTelefono: location.state.preloadedValue.obs1,
      telefonoAux1: location.state.preloadedValue.telefono2,
      observacionTelefonoAux1: location.state.preloadedValue.obs2,
      telefonoAux2: location.state.preloadedValue.telefono3,
      observacionTelefonoAux2: location.state.preloadedValue.obs3,
      emailAux1: location.state.preloadedValue.email2,
      emailAux2: location.state.preloadedValue.email3,
      docIdentidadPrincipal : location.state.preloadedValue.docIdentidadPrincipal,
      docCertificadoBancario: location.state.preloadedValue.docCertificadoBancario,
      docIdentidadConyugue : location.state.preloadedValue.docIdentidadConyugue,
  }} : defaultValues;


  const classes = useStyles();
  const [countTelef, setCountTelef] = useState(1);
  const [countEmail, setCountEmail] = useState(1);
  const [conyugue, setConyugue] = useState(false);

  const [formData, setFormData] = useState({
    docIdentidadPrincipal: location.state ?  location.state.preloadedValue.docIdentidadPrincipal != null ? location.state.preloadedValue.docIdentidadPrincipal : '' : '', 
    docCertificadoBancario: location.state ?  location.state.preloadedValue.docCertificadoBancario != null ? location.state.preloadedValue.docCertificadoBancario : '' :'', 
    docIdentidadConyugue: location.state ?  location.state.preloadedValue.docIdentidadConyugue != null ? location.state.preloadedValue.docIdentidadConyugue : '' : ''});
  
  const [openSnack, setOpenSnack] = useState(false);

  const { handleSubmit, reset, control } = useForm({ defaultValues : location.state ? preloadedValue: defaultValues});

  //location.state ? setFormData({ ...formData, docIdentidadPrincipal: location.state.preloadedValue.docIdentidadPrincipal }) :
  //setFormData({ ...formData, docIdentidadPrincipal: '', docCertificadoBancario: '', docIdentidadConyugue: '' });


    const onSubmit = (data) => {
        const accionista = {                    
            tipoIdentificacion: tipoIdentificacion.find(o => o.value === data.tipoIdentificacion) ? tipoIdentificacion.find(o => o.value === data.tipoIdentificacion).label : '',
            identificacion: data.identificacion,
            decevale: data.decevale,
            nombre: data.pn_primerNombre.concat(' ',  data.segundoNombre == null ? '' :  data.segundoNombre,' ', data.apellidoPaterno,' ',  data.apellidoMaterno == null ? '' :  data.apellidoMaterno)  , 
            direccionPais: pais.find(o => o.value === data.paisDireccion) ? pais.find(o => o.value === data.paisDireccion).label : '',
            direccionProvincia: provincia.find(o => o.value === data.provinciaDireccion) ? provincia.find(o => o.value === data.provinciaDireccion).label : '',
            direccionCiudad: ciudad.find(o => o.value === data.ciudadDireccion) ? ciudad.find(o => o.value === data.ciudadDireccion).label : '',
            direccionCalle: data.calle,
            direccionNumero: data.numero,
            nombreBanco:  banco.find(o => o.value === data.banco) ? banco.find(o => o.value === data.banco).label : '',
            tipoCuenta: tipoCuenta.find(o => o.value === data.tipoCuenta) ? tipoCuenta.find(o => o.value === data.tipoCuenta).label : '', 
            cuentaBancaria: data.cuenta,
            paisNacionalidad: nacionalidad.find(o => o.value === data.nacionalidad) ? nacionalidad.find(o => o.value === data.nacionalidad).label : '', 
            cantidadAcciones: 0,
            tipoAcciones: 'D',
            estado: 'Activo',
            tipoPersona: 'PN',
            pn_primerNombre: data.pn_primerNombre,
            pn_segundoNombre: data.segundoNombre,
            pn_apellidoPaterno: data.apellidoPaterno,
            pn_apellidoMaterno: data.apellidoMaterno,
            pn_estadoCivil: estadoCivil.find(o => o.value === data.estadoCivil) ? estadoCivil.find(o => o.value === data.estadoCivil).label : '', 
            conyugue_tipoIdentificacion: tipoIdentificacion.find(o => o.value === data.tipoIdentificacionConyugue) ? tipoIdentificacion.find(o => o.value === data.tipoIdentificacionConyugue).label : '',
            conyugue_identificacion: data.identificacionConyugue,
            conyugue_nombre: data.nombreConyugue,
            conyugue_nacionalidad: nacionalidad.find(o => o.value === data.nacionalidadConyugue) ? nacionalidad.find(o => o.value === data.nacionalidadConyugue).label : '',           
            telefono1: data.telefono,
            obs1: data.observacionTelefono,
            telefono2: countTelef > 1 ? data.telefonoAux1 : '',
            obs2: countTelef > 1 ? data.observacionTelefonoAux1 : '',
            telefono3: countTelef > 2 ? data.telefonoAux2 : '',
            obs3: countTelef > 2 ? data.observacionTelefonoAux2 : '',
            email1 : data.email,
            email2 : countEmail > 1 ? data.emailAux1 : '',
            email3 : countEmail > 2 ? data.emailAux2 : '',
            docIdentidadPrincipal : formData.docIdentidadPrincipal,
            docCertificadoBancario: formData.docCertificadoBancario,
            docIdentidadConyugue : formData.docIdentidadConyugue,

         };

         // console.log('data',data);
         data.id ? editAccionista(data.id, accionista) : addAccionista(accionista);
         

         //console.log('data',data);
         //console.log('accionista',accionista);
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



      const generateSelectNacionalidad = () => {
        return nacionalidad.map((option) => {
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



      const generateSelectProvincia = () => {
        return provincia.map((option) => {
          return (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          );
        });
      };



      const generateSelectCiudad = () => {
        return ciudad.map((option) => {
          return (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          );
        });
      };


      const generateSelectBanco = () => {
        return banco.map((option) => {
          return (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          );
        });
      };


      const generateSelectTipoCuenta = () => {
        return tipoCuenta.map((option) => {
          return (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          );
        });
      };


      const addAccionista = async (accionista) => {
        try {          
            const operID = await API.graphql(graphqlOperation(createAccionista, { input: accionista }))
            setFormData({ docIdentidadPrincipal: '', docCertificadoBancario: '', docIdentidadConyugue: '' })
            reset(defaultValues);
            setOpenSnack(true)

        } catch (err) {
            console.log('error creating accionista:', err)
        }        
      }


      const editAccionista = async (idAccionista, accionista) => {
        try {
            console.log("id", idAccionista);   
            console.log("direccionCalle", accionista.direccionCalle);
            console.log("segundoNombre", accionista.segundoNombre);
            console.log("apellidoPaterno", accionista.apellidoPaterno);
            console.log("apellidoMaterno", accionista.apellidoMaterno);

            //const apiDataUpdateAccionista = await API.graphql({ query: updateAccionista, variables: { input: {id: idAccionista, direccionCalle: accionista.direccionCalle} } });
            //const operID = await API.graphql(graphqlOperation(updateAccionista, { input: {id: idAccionista } }))
            const operID  = await API.graphql({ query: updateAccionista, variables: { input: {id: idAccionista, 
              
              tipoIdentificacion: accionista.tipoIdentificacion,
              identificacion: accionista.identificacion,
              decevale: accionista.decevale,
              nombre: accionista.pn_primerNombre.concat(' ',  accionista.pn_segundoNombre == null ? '' :  accionista.pn_segundoNombre,' ', accionista.pn_apellidoPaterno == null ? '' :   accionista.pn_apellidoPaterno,' ',  accionista.pn_apellidoMaterno == null ? '' :  accionista.pn_apellidoMaterno)  , 
              direccionPais: accionista.direccionPais,
              direccionProvincia: accionista.direccionProvincia,
              direccionCiudad: accionista.direccionCiudad,
              direccionCalle: accionista.direccionCalle,
              direccionNumero: accionista.direccionNumero,
              nombreBanco:  accionista.nombreBanco,
              tipoCuenta: accionista.tipoCuenta,
              cuentaBancaria: accionista.cuentaBancaria,
              paisNacionalidad: accionista.paisNacionalidad,
              pn_primerNombre: accionista.pn_primerNombre,
              pn_segundoNombre: accionista.pn_segundoNombre,
              pn_apellidoPaterno: accionista.pn_apellidoPaterno,
              pn_apellidoMaterno: accionista.pn_apellidoMaterno,
              pn_estadoCivil: accionista.pn_estadoCivil,
              conyugue_tipoIdentificacion: accionista.conyugue_tipoIdentificacion,
              conyugue_identificacion: accionista.conyugue_identificacion,
              conyugue_nombre: accionista.conyugue_nombre,
              conyugue_nacionalidad: accionista.conyugue_nacionalidad,
              telefono1: accionista.telefono1,
              obs1: accionista.obs1,
              telefono2: accionista.telefono2,
              obs2: accionista.obs2,
              telefono3: accionista.telefono3,
              obs3: accionista.obs3,
              email1 : accionista.email1,
              email2 : accionista.email2,
              email3 : accionista.email3,
              docIdentidadPrincipal : accionista.docIdentidadPrincipal,
              docCertificadoBancario: accionista.docCertificadoBancario,
              docIdentidadConyugue : accionista.docIdentidadConyugue
           
            } } });

            console.log('respuesta:', operID)
            setFormData({ docIdentidadPrincipal: '', docCertificadoBancario: '', docIdentidadConyugue: '' })
            reset(defaultValues);
            setOpenSnack(true)
            

        } catch (err) {
            console.log('error updating accionista:', err)
        }        
      }

      const limpiarForm = async () => {
            setFormData({ docIdentidadPrincipal: '', docCertificadoBancario: '', docIdentidadConyugue: '' })
            reset(defaultValues);
      }

      const eliminarAccionista = async () => {
        const apiDataUpdateAccionista = await API.graphql({ query: updateAccionista, variables: { input: {id: location.state.preloadedValue.id, estado: 'Eliminado'} } });
        setFormData({ docIdentidadPrincipal: '', docCertificadoBancario: '', docIdentidadConyugue: '' })
        reset(defaultValues);
  }


    const onChangeEstadoCivil = (e) =>{
      //console.log('estado civil', e.target.value);
      if(e.target.value === '2' || e.target.value === '3')
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

    const handleCloseSnack = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
    
      setOpenSnack(false);
    };
    return (
        <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Paper variant="outlined" className={classes.paper}>        
                <form>
                    <Grid container>
                        <Grid item xs={8}>
                            <div className={classes.formSection}>
                                <div>
                                    <Typography variant='subtitle1' style={{color:"#000000"}}>Identificación</Typography>
                                    <Controller                    
                                        control={control}
                                        name={"tipoIdentificacion"}
                                        //label={"Y Ahora"}
                                        render={({ field: { onChange, value } }) => (
                                            <Select onChange={onChange} value={value}  variant="outlined" style={{height:37, minWidth:150}}>
                                            {generateSelectTipoIdentificacion()}
                                            </Select>
                                        )}/>
                                        &nbsp;&nbsp;
                                    <Controller
                                    id={"identificacion"}
                                    name={"identificacion"}
                                    control={control}
                                    rules={{
                                        required: 'Requerido'
                                      }}
                                    render={({ field: { onChange, value }, fieldState: { error }, }) => (
                                        <TextField size='small' onChange={onChange} value={value} label={"Identificación"} variant='outlined' error={!!error} helperText={error ? error.message : null}  style={{height:37, width:150}}/>
                                    )}
                                     />
                                        &nbsp;&nbsp;
                                    {location.state  &&
                                    <Controller
                                    id={"decevale"}
                                    name={"decevale"}
                                    control={control}
                                    render={({ field: { onChange, value }, fieldState: { error }, }) => (
                                        <TextField disabled='true' size='small' onChange={onChange} value={value} label={"Decevale"} variant='outlined' error={!!error} helperText={error ? error.message : null} style={{height:37, width:100}} />                                        
                                    )}
                                     />    
                                    }                                 
                                </div>

                                <div>
                                    <Controller
                                    control={control}
                                    name={"nacionalidad"}
                                    render={({ field: { onChange, value } }) => (<div>
                                        <InputLabel id="ec"><small>Nacionalidad</small></InputLabel>
                                        <Select labelId="nac" id="nacid" onChange={onChange} value={value} defaultValue='1' variant="outlined" style={{height:37, minWidth:150}}>
                                        {generateSelectNacionalidad()}
                                        </Select>
                                        </div>
                                    )}/>
                                </div>
                                <div>
                                    <Controller
                                    control={control}
                                    name={"estadoCivil"}                                      
                                    render={({ field: { onChange, value } }) => (<div>
                                        <InputLabel id="ec"><small>Estado Civil</small></InputLabel>
                                        <Select labelId="ec" id="ecid" onChange={(e) => {onChange(e);  onChangeEstadoCivil(e); }} value={value} defaultValue='1' variant="outlined" style={{height:37, minWidth:150}}>
                                        {generateSelectEstadoCivil()}
                                        </Select>
                                        </div>
                                    )}/>
                                </div>

                            </div>

                            <div className={classes.formSectionTitulo}>
                                <Typography variant='subtitle1' style={{color:"#000000"}}>Nombre</Typography>
                            </div>                                
                            <div className={classes.formSection}>
                                <Controller
                                name={"pn_primerNombre"}
                                control={control}
                                rules={{required: 'Requerido'}}
                                render={({ field: { onChange, value }, fieldState: { error }, }) => (
                                    <TextField size='small' onChange={onChange} value={value} label={"Primer Nombre"}  variant='outlined' error={!!error} helperText={error ? error.message : null}/>
                                )} />
                                <Controller
                                name={"segundoNombre"}
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <TextField size='small' onChange={onChange} value={value} label={"Segundo Nombre"}  variant='outlined'/>
                                )} />
                                <Controller
                                name={"apellidoPaterno"}
                                control={control}
                                rules={{required: 'Requerido'}}
                                render={({ field: { onChange, value }, fieldState: { error }, }) => (
                                    <TextField size='small' onChange={onChange} value={value} label={"Apellido Paterno"}  variant='outlined' error={!!error} helperText={error ? error.message : null}/>
                                )} />
                                <Controller
                                name={"apellidoMaterno"}
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <TextField size='small' onChange={onChange} value={value} label={"Apellido Materno"}  variant='outlined'/>
                                )} />          
                            </div>
                            <div className={classes.formSectionTitulo}>
                                <Typography variant='subtitle1' style={{color:"#000000"}}>Dirección</Typography>
                            </div>    
                            <div className={classes.formSection}>                            
                                <Controller
                                    control={control}
                                    name={"paisDireccion"}
                                    render={({ field: { onChange, value } }) => (
                                        <Select onChange={onChange} value={value} defaultValue='1'  variant="outlined" style={{height:37, minWidth:140}}>
                                        {generateSelectPais()}
                                        </Select>
                                    )}/>
                                <Controller
                                    control={control}
                                    name={"provinciaDireccion"}
                                    render={({ field: { onChange, value } }) => (
                                        <Select onChange={onChange} value={value} defaultValue='1'  variant="outlined" style={{height:37, minWidth:140}}>
                                        {generateSelectProvincia()}
                                        </Select>
                                    )}/>
                                <Controller
                                    control={control}
                                    name={"ciudadDireccion"}
                                    render={({ field: { onChange, value } }) => (
                                        <Select onChange={onChange} value={value} defaultValue='1'  variant="outlined" style={{height:37, minWidth:140}}>
                                        {generateSelectCiudad()}
                                        </Select>
                                    )}/>
                                <Controller
                                name={"calle"}
                                control={control}
                                //rules={{required: 'Requerido'}}
                                render={({ field: { onChange, value }, fieldState: { error }, }) => (
                                    <TextField size='small' onChange={onChange} value={value} label={"Calle"} variant='outlined' style={{minWidth: 300}} error={!!error} helperText={error ? error.message : null}/>
                                )} />
                                <Controller
                                name={"numero"}
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <TextField size='small' onChange={onChange} value={value} label={"Nro"} variant='outlined' style={{width: 80}}/>
                                )} />
                            </div>   
                            <div className={classes.formSectionTitulo}>
                                <Typography variant='subtitle1' style={{color:"#000000"}}>Cuenta Bancaria</Typography>
                            </div>    
                            <div className={classes.formSectionBanco}>                                 
     
                                <Controller
                                    control={control}
                                    name={"banco"}
                                    render={({ field: { onChange, value } }) => (
                                        <Select onChange={onChange} value={value} defaultValue='1' variant="outlined" style={{height:37,minWidth: 220}}>
                                        {generateSelectBanco()}
                                        </Select>
                                    )}/>        
                                    &nbsp;&nbsp;
                                <Controller
                                    control={control}
                                    name={"tipoCuenta"}
                                    render={({ field: { onChange, value } }) => (
                                        <Select onChange={onChange} value={value} defaultValue='1' variant="outlined" style={{height:37,minWidth: 100}}>
                                        {generateSelectTipoCuenta()}
                                        </Select>
                                    )}/>   
                                    &nbsp;&nbsp;                                      
                                <Controller
                                name={"cuenta"}
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <TextField size='small' onChange={onChange} value={value} label={"Nro Cuenta"} variant='outlined'/>
                                )} />
                            </div>
                            &nbsp;&nbsp;    
                            { conyugue &&
                            <div> 
                              <Divider/>    
                              &nbsp;                            
                              <Typography variant='subtitle1' style={{color:"#000000"}}>Identificación Cónyugue</Typography>
                              <div style={{display: 'flex', alignItems:'center', justifyContent: 'space-between'}}>
                                <div>
                                      <Controller                    
                                        control={control}
                                        name={"tipoIdentificacionConyugue"}
                                        render={({ field: { onChange, value } }) => (
                                            <Select onChange={onChange} value={value}  variant="outlined" style={{height:37, minWidth:150}}>
                                            {generateSelectTipoIdentificacion()}
                                            </Select>
                                        )}/>
                                        &nbsp;&nbsp;
                                      <Controller
                                      id={"identificacionConyugue"}
                                      name={"identificacionConyugue"}
                                      control={control}
                                      render={({ field: { onChange, value }, fieldState: { error }, }) => (
                                          <TextField  size='small' onChange={onChange} value={value} label={"Identificación Cónyugue"} variant='outlined'  />
                                      )}
                                      />     
                                      </div>     

                                      <Controller
                                      id={"nacionalidadConyugue"}
                                      control={control}
                                      name={"nacionalidadConyugue"}
                                      render={({ field: { onChange, value } }) => (<div>
                                          <InputLabel id="naidcon"><small>Nacionalidad Cónyugue</small></InputLabel>
                                          <Select labelId="naidcon" id="nacidconlb" onChange={onChange} value={value} defaultValue='1' variant="outlined" style={{height:37, minWidth:150}}>
                                          {generateSelectNacionalidad()}
                                          </Select>
                                          </div>
                                      )}/>                      

                              </div>

                              <div className={classes.formSectionTitulo}>
                                  <Typography variant='subtitle1' style={{color:"#000000"}}>Nombre Cónyugue</Typography>
                              </div>                                
                              <div className={classes.formSection}>
                                  <Controller
                                  name={"nombreConyugue"}
                                  control={control}
                                  //rules={{required: 'Requerido'}}
                                  render={({ field: { onChange, value }, fieldState: { error }, }) => (
                                      <TextField size='small' onChange={onChange} value={value} label={"Nombre Completo Cónyugue"}  variant='outlined' fullWidth/>
                                  )} />
                              </div>
                            </div>   
                            }                           
                        </Grid>

                        <Grid item xs={4} >
                            <div className={classes.gridSpace}>

                                <div style={{marginBottom: 20}}>
                                    <Typography variant='subtitle1' style={{color:"#000000"}}>Medios de Contacto</Typography>
                                </div>  

                                <div className={classes.formSection}>   
                                <Controller
                                name={"telefono"}
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <TextField size='small' onChange={onChange} value={value} label={"Teléfono"} variant='outlined' style={{minWidth: 130}}  margin='dense'/>
                                )} />
                                <Controller
                                name={"observacionTelefono"}
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <TextField size='small' onChange={onChange} value={value} label={"Observación"} variant='outlined' fullWidth  margin='dense'/>
                                )} />
                                </div>
                                { countTelef > 1 &&
                                <div className={classes.formSection}>   
                                <Controller
                                name={"telefonoAux1"}
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <TextField size='small' onChange={onChange} value={value} label={"Teléfono aux"} variant='outlined' style={{minWidth: 130}} margin='dense'/>
                                )} />
                                <Controller
                                name={"observacionTelefonoAux1"}
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <TextField size='small' onChange={onChange} value={value} label={"Observación aux"} variant='outlined' fullWidth  margin='dense'/>
                                )} />
                                </div>
                                }
                                { countTelef > 2 &&
                                <div className={classes.formSection}>   
                                <Controller
                                name={"telefonoAux2"}
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <TextField size='small' onChange={onChange} value={value} label={"Teléfono aux"} variant='outlined' style={{minWidth: 130}} margin='dense'/>
                                )} />
                                <Controller
                                name={"observacionTelefonoAux2"}
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <TextField size='small' onChange={onChange} value={value} label={"Observación aux"} variant='outlined' fullWidth  margin='dense'/>
                                )} />
                                </div>   
                                }                                                             
                                <div>                            
                                    <IconButton color='primary' onClick={() => setCountTelef(countTelef + 1)} disabled={countTelef===3 ? true : false}><ControlPointIcon/></IconButton>
                                    <IconButton color='primary' onClick={() => setCountTelef(countTelef - 1)} disabled={countTelef===1 ? true : false} ><RemoveCircleOutlineIcon/></IconButton>
                                  </div>                                

                                <div className={classes.formSectionContacto}>  
                                    <Controller
                                    type='email'
                                    name={"email"}
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <TextField size='small' onChange={onChange} value={value} label={"Email"} variant='outlined'  fullWidth  margin='dense'/>
                                    )} />       
                                    { countEmail > 1 &&
                                    <Controller
                                    type='email'
                                    name={"emailAux1"}
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <TextField size='small' onChange={onChange} value={value} label={"Email auxiliar"} variant='outlined'  fullWidth  margin='dense'/>
                                    )} />       
                                    }     
                                    { countEmail > 2 &&                        
                                    <Controller
                                    type='email'
                                    name={"emailAux2"}
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <TextField size='small' onChange={onChange} value={value} label={"Email auxiliar"} variant='outlined'  fullWidth  margin='dense'/>
                                    )} />   
                                    }     
                                  <div>                            
                                    <IconButton color='primary' onClick={() => setCountEmail(countEmail + 1)} disabled={countEmail===3 ? true : false}><ControlPointIcon/></IconButton>
                                    <IconButton color='primary' onClick={() => setCountEmail(countEmail - 1)} disabled={countEmail===1 ? true : false}><RemoveCircleOutlineIcon/></IconButton>
                                  </div>
                                </div>   

                                <div style={{marginTop: 20}}>
                                    <Typography variant='subtitle1' style={{color:"#000000"}}>Documentos Habilitantes</Typography>
                                </div>  
                                
                                <div className={classes.formSection}>   
                                <label htmlFor="upload-photo1">
                                    <input style={{ display: 'none' }} id="upload-photo1" name="upload-photo1" type="file" onChange={onChangeDI} />
                                    <Button component="span" color="primary" size='small'>Documento de Identidad</Button>
                                    {formData.docIdentidadPrincipal.length > 0 && <CheckIcon />}
                                </label>
                                </div>  
                                <div className={classes.formSection}>   
                                <label htmlFor="upload-photo2">
                                    <input style={{ display: 'none' }} id="upload-photo2" name="upload-photo2" type="file" onChange={onChangeCB} />
                                    <Button component="span" color="primary" size='small' >Certificado Bancario</Button>
                                    {formData.docCertificadoBancario.length > 0 && <CheckIcon />}
                                </label>
                                </div>  
                                { conyugue &&
                                <div className={classes.formSection}>   
                                <label htmlFor="upload-photo3">
                                    <input style={{ display: 'none' }} id="upload-photo3" name="upload-photo3" type="file" onChange={onChangeDIC} />
                                    <Button component="span" color="primary" size='small' >Documento de Identidad Cónyugue</Button>
                                    {formData.docIdentidadConyugue.length > 0 && <CheckIcon />}
                                </label>
                                </div>  
                                }
                            </div>
                        </Grid>                        
                    </Grid>

                    <Divider className={classes.divider}/>
                    <div className={classes.formSection}>  
                        <Button size='small' onClick={limpiarForm} style={{textTransform: 'none'}} color='primary'>Limpiar</Button>
                        <Button siza='small' onClick={handleSubmit(onSubmit)} variant='contained' color='primary' style={{textTransform: 'none'}}>{location.state ?  "Actualizar Accionista" :  "Registrar Accionista"}</Button>
                       {location.state ?  (location.state.preloadedValue.cantidadAcciones === 0 || location.state.preloadedValue.cantidadAcciones === null || location.state.preloadedValue.cantidadAcciones === undefined) && <Button siza='small' onClick={eliminarAccionista} variant='contained' color='secondary' style={{textTransform: 'none'}}>Eliminar Accionista</Button> : null}

                    </div>
                    <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
                      <Alert onClose={handleCloseSnack} severity="success">
                        Se registró el accionista correctamente!
                      </Alert>
                    </Snackbar>
                </form>    
            </Paper>
        </main>      
    );
}
