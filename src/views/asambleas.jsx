import React, { useState, useEffect } from 'react'
import { API,Storage,graphqlOperation } from 'aws-amplify';
import { listTitulos, listOperacions,getParametro, listAsambleas, listAccionistasxJuntas, listAccionistas, } from '../graphql/queries';
import { Link } from "react-router-dom";

import { makeStyles } from '@material-ui/core/styles';
import { createTheme } from '@material-ui/core/styles';

import { Grid, Typography,  Button, ListItem, ListItemText, ListSubheader, List, Tooltip, Chip, TextField , LinearProgress,
    FormControl, RadioGroup, FormControlLabel, Radio, Box, Tabs, Tab, IconButton, Checkbox, InputLabel,Select, MenuItem, Card,
    Dialog, DialogActions,DialogContent,DialogContentText,DialogTitle, ListItemIcon,Snackbar, CircularProgress, Paper, Divider, StepIcon} from '@material-ui/core';

import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import PropTypes from 'prop-types';

import PageviewIcon from '@material-ui/icons/Pageview';
import CheckIcon from '@material-ui/icons/Check';
import DevicesOutlinedIcon from '@material-ui/icons/DevicesOutlined';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import GroupOutlinedIcon from '@material-ui/icons/GroupOutlined';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import DeleteIcon from '@material-ui/icons/Delete';


import { uuid } from 'uuidv4';
import { createAccionistasxJunta, createAsamblea, deleteAccionistasxJunta, updateAccionistasxJunta, updateAsamblea } from '../graphql/mutations';
import MuiAlert from '@material-ui/lab/Alert';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { PieChart } from "react-minimal-pie-chart";

import jsPDF from "jspdf";
import "jspdf-autotable";

import logo from '../images/logoUNACEMmedMarco.jpg';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }
  

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
    appBarSpacer: {
      ...theme.mixins.toolbar,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(2),        
    },
    button: {
        borderRadius: 20,
      }
  }),
  { defaultTheme },
);

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


export default function Asambleas() {

    const [accionistasxJuntas, setAccionistasxJuntas] = useState([])
    const [cantidadEmitido, setCantidadEmitido] = useState(1);
    const [valorNominal, setValorNominal] = useState(1);
    
    const [openAccionistas, setOpenAccionistas] = useState(false);

    const handleClose = () => 
    {
        //setAsambleaSeleccionada({});
        //setAccionistasxJuntas({});
        //setRows({});
        //setValCedente({});
        setOpenAccionistas(false);
    }

    //const [estado, setEstado] = useState('Activo');
    const [asambleas, setAsambleas] = useState([]);

    const [checked, setChecked] = useState([1]);

    const handleToggle = (value) => () => {
        
        console.log("check", value);

      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];
  
      if (currentIndex === -1) {
        newChecked.push(value);
        const updatePresencia = API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: value, presente: 'true'} } });
        //setRefrescar(!refrescar);
      } else {
        newChecked.splice(currentIndex, 1);
        const updatePresencia = API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: value, presente: 'false'} } });
        //setRefrescar(!refrescar);
      }
  
      //setChecked(newChecked);

      setRefrescar(!refrescar);

    };

    const handleTogglePresente = (id, presente) => async() => {
        
        console.log("Presente", id, presente)
        const updatePresencia = await API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: id, presente: presente} } });
        console.log("updatePresencia", updatePresencia)
        setRefrescar(!refrescar);

    };

    const handleToggleVotacionAccionista = (id, votacion, aprobacion) => async() => {
        
        console.log("Votacion por Accionista", id,votacion, aprobacion)
        
        let updatePresencia = await API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: id, votacion1: aprobacion} } });
        if(votacion === "2") updatePresencia = await API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: id, votacion2: aprobacion} } });
        if(votacion === "3") updatePresencia = await API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: id, votacion3: aprobacion} } });
        if(votacion === "4") updatePresencia = await API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: id, votacion4: aprobacion} } });
        if(votacion === "5") updatePresencia = await API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: id, votacion5: aprobacion} } });
        if(votacion === "6") updatePresencia = await API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: id, votacion6: aprobacion} } });
        if(votacion === "7") updatePresencia = await API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: id, votacion7: aprobacion} } });
        if(votacion === "8") updatePresencia = await API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: id, votacion8: aprobacion} } });
        if(votacion === "9") updatePresencia = await API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: id, votacion9: aprobacion} } });
        if(votacion === "10") updatePresencia = await API.graphql({ query: updateAccionistasxJunta , variables: { input: {id: id, votacion10: aprobacion} } });
        setRefrescar(!refrescar);

    };

    const eliminarAccionistaJunta = (id) => async() => {
        
        console.log("Eliminar Accionista", id)
        const updatePresencia = await API.graphql({ query: deleteAccionistasxJunta , variables: { input: {id: id} } });
        console.log("updatePresencia", updatePresencia)
        setRefrescar(!refrescar);

    };


    function getParticipacion(params) {
        return `${params.getValue(params.id, 'cantidadAcciones') * 100 / cantidadEmitido || ''} `;
      }
  
    const [openCrearAsamblea, setOpenCrearAsambleas] = useState(false);
    const handleCloseCrearAsamblea = () => {
        //setLugar('');
        //setLink('');
        //setTipoAsamblea('');

        setFormData({tipo: '', fecha: '', hora:'', junta: '', lugar: '' , link: '', ordenDia: '', estado: 'Convocatoria', 
        email: '', registrados: 0, quorum: 0, acciones: 0,participacion:0,capital:0,acta: '', votaciones:0, 
        votacionTema1:'',votacionTema2:'',votacionTema3:'',votacionTema4:'',votacionTema5:'',
        votacionTema6:'',votacionTema7:'',votacionTema8:'',votacionTema9:'',votacionTema10:'',
    });

        setOpenCrearAsambleas(false);
        setNroVotaciones(0);
    }
    const handleOpenCrearAsamblea = () => setOpenCrearAsambleas(true);

    const handleCrearAsamblea = () => console.log("CREAR",valCedente);

    const tipoDeAsamblea = [
        {
          label: "Ordinaria",
          value: "1",
        },
        {
          label: "Extraordinaria",
          value: "2",
        },     
      ];

    const columns = [
        {
          field: 'tipo',
          headerName: 'Asamblea',
          width: 120,
        },
        {
          field: 'fecha',
          headerName: 'Fecha',
          width: 100,
        },      
        {
          field: 'hora',
          headerName: 'Hora',
          width: 80,
        },
        /*
        {
          field: 'junta',
          headerName: 'Junta',
          width: 180,
        },  
        */    
        {
          field: 'lugar',
          headerName: 'Lugar',
          width: 120,
        },  
        {
            field: 'link',
            headerName: 'Enlace',
            width: 220,
          },   
        {
            field: 'estado',
            headerName: 'Estado',
            width: 110,
            renderCell: (cellValues) => {
              return <Chip size="small" variant="outlined" label={cellValues.row.estado} color={cellValues.row.estado == 'Convocatoria' ? 'primary' : 'secondary'} />
            }
        }, 
        {
            field: 'registrados',
            headerName: 'Reg.',
            type: 'number',
            width: 80,
          },                          
        {
          field: "Quorum",
          width: 100,
          renderCell: (cellValues) => {
            return <IconButton  onClick={() =>  
              {
                fetchAccionistas(cellValues.row);
              }
            } color='primary'><PageviewIcon /></IconButton>
          }
        },
        {
            field: 'votaciones',
            headerName: 'Votación',
            type: 'number',
            width: 120,
          },   
      ];
  
          
    const [value, setValue] = useState(0);
    const [rows, setRows] = useState([]);
    const [asambleaSeleccionada, setAsambleaSeleccionada]= useState({});

    const [openSnack, setOpenSnack] = useState(false);
    
    const [circular, setCircular] = useState(false);

    const handleChangeTab = (event, newValue) => {
      setValue(newValue);
    };

    const [valCedente,setValCedente]=useState({})    
    const [accionistas, setAccionistas] = useState([])
    
    const [nroVotaciones,setNroVotaciones]=useState(0)    

    const[refrescar, setRefrescar]=useState(false);

    const [temaVotacion,setTemaVotacion]=useState(1)    
    
    const [progreso, setProgreso] = useState(0);

    const [nombreRepresentante, setNombreRepresentante] = useState('');
    const [identificacionRepresentante, setIdentificacionRepresentante] = useState('');

    const handleClickCedente = (option, value) => {  
        if(value)
        {
          setValCedente(value)
          //fetchTitulos(value.id,value.nombre);
          //setTotal(0)
          //setProgreso(progreso+50)
        }
        else {
          //setFormData({ ...formData, 'idCedente': '', 'cedente': '' })
          //setTitulos([])
          //setTotal(0)
          //setProgreso(progreso-50)
          setValCedente({})
        }
      }
      

    const get_PDF = (e) => {
        Storage.get(e)
          .then(url => {
            var myRequest = new Request(url);
            fetch(myRequest).then(function(response) {
              if (response.status === 200) {
                window.open(url)
              }
            });
          })
          .catch(err => console.log(err));          
      };

      const getPictureDI = e => {
        e.stopPropagation();
              
        Storage.get(asambleaSeleccionada.docIdentidadPrincipal)
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



      useEffect(() => {

        fetchParametros();
        fetchAsambleas();
        fetchTodosAccionistas();
        if (asambleaSeleccionada.id) refrescarAccionistas();
  
      }, [refrescar]);
     
  
      async function fetchParametros() {
  
        const apiData = await API.graphql({ query: getParametro , variables: { id: '1' } });
  
        const parametrosFromAPI = apiData.data.getParametro;    
  
        setCantidadEmitido(parametrosFromAPI.cantidadEmitida);
        setValorNominal(parametrosFromAPI.valorNominal);
    }
  
      async function fetchAsambleas() {

        const apiData = await API.graphql({ query: listAsambleas, variables: {  limit: 1000} });
        const asambleasFromAPI = apiData.data.listAsambleas.items;
  
        setAsambleas(asambleasFromAPI);
        setRows(asambleasFromAPI);
          
      }
  
      async function fetchAccionistas(row) {

        let filter = {
          asambleaID: {
              eq: row.id // filter priority = 1
          },
        };
    
        console.log('entro a fetchAccionistas', row.id);
        const apiData = await API.graphql({ query: listAccionistasxJuntas, variables: { filter: filter, limit : 1000} });
        const accionistasxJuntasFromAPI = apiData.data.listAccionistasxJuntas.items;       
                
        setAccionistasxJuntas(accionistasxJuntasFromAPI);
        setAsambleaSeleccionada(row)
        setOpenAccionistas(true)

        setItems(accionistasxJuntasFromAPI);
        setItemsVotacion(accionistasxJuntasFromAPI.filter(o => o.presente === true));
      }


      async function refrescarAccionistas() {

        let filter = {
          asambleaID: {
              eq: asambleaSeleccionada.id // filter priority = 1
          },
        };
    
        const apiData = await API.graphql({ query: listAccionistasxJuntas, variables: { filter: filter, limit : 1000} });
        const accionistasxJuntasFromAPI = apiData.data.listAccionistasxJuntas.items;       
                
        setAccionistasxJuntas(accionistasxJuntasFromAPI);

        console.log("Entró a refrescar accionistas",accionistasxJuntasFromAPI);
        setItems(accionistasxJuntasFromAPI);
        setItemsVotacion(accionistasxJuntasFromAPI.filter(o => o.presente === true));

      }

      async function fetchTodosAccionistas() {
        const filter = {
          acc_estado: {
            eq: 'Activo',
          },
        };
        const apiData = await API.graphql({ query: listAccionistas , variables:{filter: filter, limit:1000}});
        const accionistasFromAPI = apiData.data.listAccionistas.items;
        await Promise.all(accionistasFromAPI.map(async accionista => {
        return accionista;
        }))
        setAccionistas(apiData.data.listAccionistas.items);
        
      }

    //const [lugar, setLugar] = useState('');
    //const handleLugarChange = (event) => {setLugar(event.target.value);};
    const handleLugarChange = (event) => {setFormData({ ...formData, 'lugar': event.target.value})};
    //const [link, setLink] = useState('');
    //const handleLinkChange = (event) => {setLink(event.target.value);};
    const handleLinkChange = (event) => {setFormData({ ...formData, 'link': event.target.value})};

    //const [tipoAsamblea, setTipoAsamblea] = useState('');
    //const handleChangeTipoAsamblea = (event) => {setTipoAsamblea(event.target.value); };
    const handleChangeTipoAsamblea = (event) => {        
        setFormData({ ...formData, 'tipo': tipoDeAsamblea.find(o => o.value === event.target.value) ? tipoDeAsamblea.find(o => o.value === event.target.value).label : ''})};

    const handleChangeFecha = (event) => {
        console.log("FEcha", event.target.value.split(" ")[0].split("-").reverse().join("-"));
        setFormData({ ...formData, 'fecha': event.target.value.split(" ")[0].split("-").reverse().join("-") })
    };

    const handleChangeHora = (event) => {setFormData({ ...formData, 'hora': event.target.value})};

    const handleTemaVotacionChange1 = (event) => {setFormData({ ...formData, 'votacionTema1': event.target.value})};
    const handleTemaVotacionChange2 = (event) => {setFormData({ ...formData, 'votacionTema2': event.target.value})};
    const handleTemaVotacionChange3 = (event) => {setFormData({ ...formData, 'votacionTema3': event.target.value})};
    const handleTemaVotacionChange4 = (event) => {setFormData({ ...formData, 'votacionTema4': event.target.value})};
    const handleTemaVotacionChange5 = (event) => {setFormData({ ...formData, 'votacionTema5': event.target.value})};
    const handleTemaVotacionChange6 = (event) => {setFormData({ ...formData, 'votacionTema6': event.target.value})};
    const handleTemaVotacionChange7 = (event) => {setFormData({ ...formData, 'votacionTema7': event.target.value})};
    const handleTemaVotacionChange8 = (event) => {setFormData({ ...formData, 'votacionTema8': event.target.value})};
    const handleTemaVotacionChange9 = (event) => {setFormData({ ...formData, 'votacionTema9': event.target.value})};
    const handleTemaVotacionChange10 = (event) => {setFormData({ ...formData, 'votacionTema10': event.target.value})};    

    const handleChangeNroVotaciones = (event) => {
        setFormData({ ...formData, 'votaciones': event.target.value})
        setNroVotaciones(event.target.value); };

    const [formData, setFormData] = useState({
        tipo: '', fecha: '', hora:'', junta: '', lugar: '' , link: '', ordenDia: '', estado: 'Convocatoria', 
        email: '', registrados: 0, quorum: 0, acciones: 0,participacion:0,capital:0,acta: '', votaciones:0,
        votacionTema1:'',votacionTema2:'',votacionTema3:'',votacionTema4:'',votacionTema5:'',
        votacionTema6:'',votacionTema7:'',votacionTema8:'',votacionTema9:'',votacionTema10:'',
    });
    
    const handleChangeTemaVotacion = (event) => { setTemaVotacion(event.target.value); };

    const handleChangeNombreRepresentante = (event) => { setNombreRepresentante(event.target.value); };
    const handleChangeIdentificacionRepresentante = (event) => { setIdentificacionRepresentante(event.target.value); };

    async function onChangeOD(e) {
        if (!e.target.files[0]){
          console.log('entro al cancelar')
          return
        }
        const file = e.target.files[0];
        const filename = uuid() + file.name
        setFormData({ ...formData, ordenDia: filename });
        await Storage.put(filename, file);
      }

      const[IDRepresentante,setIDRepresentante] = useState('');

      async function onChangeIDRepresentante(e) {
        if (!e.target.files[0]){
          console.log('entro al cancelar')
          return
        }
        const file = e.target.files[0];
        const filename = uuid() + file.name
        //setFormData({ ...formData, ordenDia: filename });
        setIDRepresentante({ filename });
        await Storage.put(filename, file);
      }

      async function onChangeActaFin(e) {
        if (!e.target.files[0]){
          console.log('entro al cancelar')
          return
        }
        const file = e.target.files[0];
        const filename = uuid() + file.name
        //setFormData({ ...formData, acta: filename });
        await Storage.put(filename, file);
        
        console.log('Datos de Acta de Cierre',asambleaSeleccionada.id,filename)
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, acta: filename} } });

        setAsambleaSeleccionada({...asambleaSeleccionada, acta:filename });
        setRefrescar(!refrescar);

      }


      async function onRemoveActaFin() {

        const filename = asambleaSeleccionada.acta;

        //await Storage.put(filename, file);
        await Storage.remove(asambleaSeleccionada.acta);
        
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, acta: ''} } });

        setAsambleaSeleccionada({...asambleaSeleccionada, acta:'' });
        setRefrescar(!refrescar);

      }


      async function onRemoveHabilitante1() {
        const filename = asambleaSeleccionada.habilitanteTema1;
        await Storage.remove(asambleaSeleccionada.habilitanteTema1);        
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema1: ''} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema1:'' });
        setRefrescar(!refrescar);
      }
      async function onRemoveHabilitante2() {
        const filename = asambleaSeleccionada.habilitanteTema2;
        await Storage.remove(asambleaSeleccionada.habilitanteTema2);        
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema2: ''} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema2:'' });
        setRefrescar(!refrescar);
      }
      async function onRemoveHabilitante3() {
        const filename = asambleaSeleccionada.habilitanteTema3;
        await Storage.remove(asambleaSeleccionada.habilitanteTema3);        
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema3: ''} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema3:'' });
        setRefrescar(!refrescar);
      }
      async function onRemoveHabilitante4() {
        const filename = asambleaSeleccionada.habilitanteTema4;
        await Storage.remove(asambleaSeleccionada.habilitanteTema4);        
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema4: ''} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema4:'' });
        setRefrescar(!refrescar);
      }
      async function onRemoveHabilitante5() {
        const filename = asambleaSeleccionada.habilitanteTema5;
        await Storage.remove(asambleaSeleccionada.habilitanteTema5);        
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema5: ''} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema5:'' });
        setRefrescar(!refrescar);
      }
      async function onRemoveHabilitante6() {
        const filename = asambleaSeleccionada.habilitanteTema6;
        await Storage.remove(asambleaSeleccionada.habilitanteTema6);        
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema6: ''} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema6:'' });
        setRefrescar(!refrescar);
      }
      async function onRemoveHabilitante7() {
        const filename = asambleaSeleccionada.habilitanteTema7;
        await Storage.remove(asambleaSeleccionada.habilitanteTema7);        
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema7: ''} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema7:'' });
        setRefrescar(!refrescar);
      }
      async function onRemoveHabilitante8() {
        const filename = asambleaSeleccionada.habilitanteTema8;
        await Storage.remove(asambleaSeleccionada.habilitanteTema8);        
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema8: ''} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema8:'' });
        setRefrescar(!refrescar);
      }
      async function onRemoveHabilitante9() {
        const filename = asambleaSeleccionada.habilitanteTema9;
        await Storage.remove(asambleaSeleccionada.habilitanteTema9);        
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema9: ''} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema9:'' });
        setRefrescar(!refrescar);
      }
      async function onRemoveHabilitante10() {
        const filename = asambleaSeleccionada.habilitanteTema10;
        await Storage.remove(asambleaSeleccionada.habilitanteTema10);        
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema10: ''} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema10:'' });
        setRefrescar(!refrescar);
      }

      async function onChangeHabilitante1(e) {
          console.log("HABiLITANTE",e);
        if (!e.target.files[0]){return}
        const file = e.target.files[0];
        const filename = uuid() + file.name
        await Storage.put(filename, file);
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema1: filename} } });
        console.log("HABiLITANTE 2",filename);
        console.log("HABiLITANTE 3",updateAsambleaReturn);
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema1:filename });
        setRefrescar(!refrescar);
      }


      
      async function onChangeHabilitante2(e) {
        if (!e.target.files[0]){return}
        const file = e.target.files[0];
        const filename = uuid() + file.name
        await Storage.put(filename, file);
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema2: filename} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema2:filename });
        setRefrescar(!refrescar);
      }
      async function onChangeHabilitante3(e) {
        if (!e.target.files[0]){return}
        const file = e.target.files[0];
        const filename = uuid() + file.name
        await Storage.put(filename, file);
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema3: filename} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema3:filename });
        setRefrescar(!refrescar);
      }
      async function onChangeHabilitante4(e) {
        if (!e.target.files[0]){return}
        const file = e.target.files[0];
        const filename = uuid() + file.name
        await Storage.put(filename, file);
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema4: filename} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema4:filename });
        setRefrescar(!refrescar);
      }
      async function onChangeHabilitante5(e) {
        if (!e.target.files[0]){return}
        const file = e.target.files[0];
        const filename = uuid() + file.name
        await Storage.put(filename, file);
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema5: filename} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema5:filename });
        setRefrescar(!refrescar);
      }
      async function onChangeHabilitante6(e) {
        if (!e.target.files[0]){return}
        const file = e.target.files[0];
        const filename = uuid() + file.name
        await Storage.put(filename, file);
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema6: filename} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema6:filename });
        setRefrescar(!refrescar);
      }
      async function onChangeHabilitante7(e) {
        if (!e.target.files[0]){return}
        const file = e.target.files[0];
        const filename = uuid() + file.name
        await Storage.put(filename, file);
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema7: filename} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema7:filename });
        setRefrescar(!refrescar);
      }
      async function onChangeHabilitante8(e) {
        if (!e.target.files[0]){return}
        const file = e.target.files[0];
        const filename = uuid() + file.name
        await Storage.put(filename, file);
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema8: filename} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema8:filename });
        setRefrescar(!refrescar);
      }
      async function onChangeHabilitante9(e) {
        if (!e.target.files[0]){return}
        const file = e.target.files[0];
        const filename = uuid() + file.name
        await Storage.put(filename, file);
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema9: filename} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema9:filename });
        setRefrescar(!refrescar);
      }
      async function onChangeHabilitante10(e) {
        if (!e.target.files[0]){return}
        const file = e.target.files[0];
        const filename = uuid() + file.name
        await Storage.put(filename, file);
        if (!asambleaSeleccionada ) return
        const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, habilitanteTema10: filename} } });
        setAsambleaSeleccionada({...asambleaSeleccionada, habilitanteTema10:filename });
        setRefrescar(!refrescar);
      }

      
      const addAsamblea = async () => {
        try {
            
            if (!formData.tipo || !formData.lugar || !formData.fecha || !formData.hora ) return
    
            setCircular(true);
    
            //setFormData({...formData, fecha: formData.fecha.split("-").reverse().join("-") });
            //setFormData({...formData, fecha: formData.fecha.split(" ")[0].split("-").reverse().join("-")});
            const asamblea = { ...formData }
    
            //new Date(event.target.value).split("-").reverse().join("-")


            setFormData({tipo: '', fecha: '', hora:'', junta: '', lugar: '' , link: '', ordenDia: '', estado: 'Convocatoria', 
            email: '', registrados: 0, quorum: 0, acciones: 0,participacion:0,capital:0,acta: '',votaciones:0,
            votacionTema1:'',votacionTema2:'',votacionTema3:'',votacionTema4:'',votacionTema5:'',
            votacionTema6:'',votacionTema7:'',votacionTema8:'',votacionTema9:'',votacionTema10:'',
            });
    
    
            const asambleaID = await API.graphql(graphqlOperation(createAsamblea, { input: asamblea }))
        
            setCircular(false);

            handleCloseCrearAsamblea();

            setRefrescar(!refrescar);

    
             } catch (err) {
            console.log('error creating transaction:', err)
        }   
      }

      
      const handleFinalizarAsamblea = async () => {
            try {

            if (!asambleaSeleccionada ) return
            const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, estado: 'Realizada'} } });
            //console.log("updateAsamblea desp", updateAsamblea);

            //setFormData({ ...formData, ordenDia: filename });
            setAsambleaSeleccionada({...asambleaSeleccionada, estado:'Realizada' });
            setRefrescar(!refrescar);
            
            } catch (err) {
            console.log('error creating transaction:', err)
            }   
        }

        const handleCerrarQuorum = async () => {
            try {

            if (!asambleaSeleccionada ) return

            const d = new Date();
            let hour = d.getHours();
            let minute = (d.getMinutes()<10?'0':'') + d.getMinutes();
            let hora = hour.toString() + ":" + minute.toString();

            const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, cierreQuorum: true, horaCierreQuorum: hora} } });
            //console.log("updateAsamblea desp", updateAsamblea);

            //setFormData({ ...formData, ordenDia: filename });
            setAsambleaSeleccionada({...asambleaSeleccionada, cierreQuorum:true, horaCierreQuorum: hora });
            setRefrescar(!refrescar);
            
            } catch (err) {
            console.log('error creating transaction:', err)
            }   
        }


      const addAccionista = async () => {
        try {
            
            //idAsamblea.stopPropagation();
            console.log("Nro Asamblea",asambleaSeleccionada.id);
            
            if (!valCedente ) return
    
            const accionista =  { asambleaID:asambleaSeleccionada.id, accionistaID: valCedente.id, nombre: valCedente.nombre, identificacion: valCedente.identificacion, acciones: valCedente.cantidadAcciones, estado: valCedente.estado, presente: 'false', representanteNombre: nombreRepresentante, representanteDocumento: identificacionRepresentante, representanteDI: IDRepresentante.filename, 
            votacion1: asambleaSeleccionada.votacionTema1 ? true : '',
            votacion2: asambleaSeleccionada.votacionTema2 ? true : '',
            votacion3: asambleaSeleccionada.votacionTema3 ? true : '',
            votacion4: asambleaSeleccionada.votacionTema4 ? true : '',
            votacion5: asambleaSeleccionada.votacionTema5 ? true : '',
            votacion6: asambleaSeleccionada.votacionTema6 ? true : '',
            votacion7: asambleaSeleccionada.votacionTema7 ? true : '',
            votacion8: asambleaSeleccionada.votacionTema8 ? true : '',
            votacion9: asambleaSeleccionada.votacionTema9 ? true : '',
            votacion10: asambleaSeleccionada.votacionTema10 ? true : '',
            }  
    

            setValCedente({});
            setNombreRepresentante('');
            setIdentificacionRepresentante('');
            setIDRepresentante('');
    
            const accionistaxJuntaID = await API.graphql(graphqlOperation(createAccionistasxJunta, { input: accionista }))
    
            setRefrescar(!refrescar);

            console.log("Datos Accionista", accionista);

            console.log("updateAsamblea antes", asambleaSeleccionada.id, accionistasxJuntas.length);
            //const updateAsamblea = await API.graphql(graphqlOperation(updateAsamblea, { id: asambleaSeleccionada.id, registrados : accionistasxJuntas.length + 1 }))
            const updateAsambleaReturn = await API.graphql({ query: updateAsamblea , variables: { input: {id: asambleaSeleccionada.id, registrados: accionistasxJuntas.length + 1} } });
            console.log("updateAsamblea desp", updateAsamblea);

            
             } catch (err) {
            console.log('error creating transaction:', err)
        }   
      }


      const handleCloseSnack = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpenSnack(false);
      };


      function LinearProgressWithLabel(props) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">{`${Math.round(
                props.value,
              )}%`}</Typography>
            </Box>
          </Box>
        );
      }

      LinearProgressWithLabel.propTypes = {
        /**
         * The value of the progress indicator for the determinate and buffer variants.
         * Value between 0 and 100.
         */
        value: PropTypes.number.isRequired,
      };

/*
      const capitalData = [
        { title: "Presentes", value: (accionistasxJuntas.filter(o => o.presente  === true && (o.representanteNombre === "undefined" || o.representanteNombre === "" || o.representanteNombre === null  )).reduce((a, b) => +a + +b.acciones, 0) * valorNominal).toFixed(2), color: "orange" },
        { title: "Representados", value: (accionistasxJuntas.filter(o => o.presente  === true && o.representanteNombre).reduce((a, b) => +a + +b.acciones, 0) * valorNominal).toFixed(2), color: "green" },
        { title: "Ausentes", value: ((cantidadEmitido*valorNominal) - (accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0) * valorNominal)).toFixed(2), color: "purple" },
      ];
*/
      const capitalData =  [
        { title: "Presentes", value: accionistasxJuntas.filter(o => o.presente  === true && (o.representanteNombre === "undefined" || o.representanteNombre === "" || o.representanteNombre === null  )).reduce((a, b) => +a + +b.acciones, 0) * valorNominal, color: "#00BCD4" },
        { title: "Representados", value: accionistasxJuntas.filter(o => o.presente  === true && o.representanteNombre).reduce((a, b) => +a + +b.acciones, 0) * valorNominal, color: "#CDDC39" },
        { title: "Ausentes", value: (cantidadEmitido*valorNominal) - (accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0) * valorNominal), color: "#FFB74D" },
      ];

      const accionistaData = [
        { title: "Presentes", value: accionistasxJuntas.filter(o => o.presente  === true && (o.representanteNombre === "undefined" || o.representanteNombre === "" || o.representanteNombre === null  )  ).length, color: "#00BCD4" },
        { title: "Representados", value: accionistasxJuntas.filter(o => o.presente  === true && o.representanteNombre).length, color: "#CDDC39" },
        { title: "Ausentes", value: accionistas.length - accionistasxJuntas.filter(o => o.presente  === true ).length, color: "#FFB74D" },
      ];



      const [items, setItems] = useState(accionistasxJuntas);
      const [searched, setSearched] = useState("");
      
      const requestSearch = (searchedVal) => {
        const filteredItems = accionistasxJuntas.filter((item) => {
          console.log("ESTA BUSCANDO",searchedVal.target.value,);
          return item.nombre.toString().toLowerCase().includes(searchedVal.target.value.toString().toLowerCase());
        });
        setItems(filteredItems);
      };
      
      //const cancelSearch = () => {
      //  setSearched("");
      //  requestSearch(searched);
      //};

      const [itemsVotacion, setItemsVotacion] = useState(accionistasxJuntas.filter(o => o.presente === true));
      const requestSearchVotacion = (searchedVal) => {
        const filteredItems = accionistasxJuntas.filter(o => o.presente === true).filter((item) => {
          console.log("ESTA BUSCANDO",searchedVal.target.value,);
          return item.nombre.toString().toLowerCase().includes(searchedVal.target.value.toString().toLowerCase());
        });
        setItemsVotacion(filteredItems);
      };


      const getPictureID = async(e) => {
        //e.stopPropagation();
        console.log("getPicture I",e);
        console.log("getPicture II",e.filename);
     
        await Storage.get(e)
          .then(url => {
            var myRequest = new Request(url);
            fetch(myRequest).then(function(response) {
              if (response.status === 200) {
                //setIDRepresentante(url);
                window.open(url)
              }
            });
          })
          .catch(err => console.log(err));         
      };


    const getPictureActa = e => {
            e.stopPropagation();     

         Storage.get(asambleaSeleccionada.acta)
          .then(url => {
            var myRequest = new Request(url);
            fetch(myRequest).then(function(response) {
              if (response.status === 200) {
                //setIDRepresentante(url);
                window.open(url)
              }
            });
          })
          .catch(err => console.log(err));         
      };


    const getPictureHabilitante1 = e => {
        e.stopPropagation();     
        Storage.get(asambleaSeleccionada.habilitanteTema1)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function(response) {
          if (response.status === 200) {
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));         
    };
    const getPictureHabilitante2 = e => {
        e.stopPropagation();     
        Storage.get(asambleaSeleccionada.habilitanteTema2)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function(response) {
          if (response.status === 200) {
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));         
    };
    const getPictureHabilitante3 = e => {
        e.stopPropagation();     
        Storage.get(asambleaSeleccionada.habilitanteTema3)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function(response) {
          if (response.status === 200) {
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));         
    };
    const getPictureHabilitante4 = e => {
        e.stopPropagation();     
        Storage.get(asambleaSeleccionada.habilitanteTema4)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function(response) {
          if (response.status === 200) {
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));         
    };
    const getPictureHabilitante5 = e => {
        e.stopPropagation();     
        Storage.get(asambleaSeleccionada.habilitanteTema5)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function(response) {
          if (response.status === 200) {
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));         
    };
    const getPictureHabilitante6 = e => {
        e.stopPropagation();     
        Storage.get(asambleaSeleccionada.habilitanteTema6)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function(response) {
          if (response.status === 200) {
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));         
    };
    const getPictureHabilitante7 = e => {
        e.stopPropagation();     
        Storage.get(asambleaSeleccionada.habilitanteTema7)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function(response) {
          if (response.status === 200) {
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));         
    };
    const getPictureHabilitante8 = e => {
        e.stopPropagation();     
        Storage.get(asambleaSeleccionada.habilitanteTema8)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function(response) {
          if (response.status === 200) {
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));         
    };
    const getPictureHabilitante9 = e => {
        e.stopPropagation();     
        Storage.get(asambleaSeleccionada.habilitanteTema9)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function(response) {
          if (response.status === 200) {
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));         
    };
    const getPictureHabilitante10 = e => {
        e.stopPropagation();     
        Storage.get(asambleaSeleccionada.habilitanteTema10)
      .then(url => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function(response) {
          if (response.status === 200) {
            window.open(url)
          }
        });
      })
      .catch(err => console.log(err));         
    };

      const exportPDFListadoAccionistas = async() => {
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        //const orientation = "portrait"; // portrait or landscape
        const orientation = "landscape"; // portrait or landscape
    
        const marginLeft = 40;
        const doc = new jsPDF(orientation, unit, size);
    
        doc.setFontSize(12);
        
        const title = "Listado de Accionistas para Asamblea";

        //const headers = [["Identificacion", "Nombre", "Nacionalidad", "Acciones","Tipo","Persona","Participación","Valor"]];
        const headers = [["Código", "Nombre", "Identificacion", "Acciones", "Participación", "Capital","Representante", "Presente"]];
        const data = accionistasxJuntas.map(elt=> [elt.accionistaID, elt.nombre, elt.identificacion, elt.acciones, (elt.acciones * 100.00 / cantidadEmitido).toFixed(10) , (elt.acciones * valorNominal).toFixed(2), elt.representanteNombre, elt.presente === true ? 'Sí' : '']);
    
        let content = {
          theme: 'plain',
          startY: 70,
          head: headers,
          body: data,
          columnStyles:{
            0: {halign:'center'},
            2: {halign:'center'},
            3: {halign:'right'},
            4: {halign:'right'},
            5: {halign:'right'},
            7: {halign:'center'},
    }
        };
    
        doc.addImage(logo,"JPEG",700,20,80,30)
        doc.text(title, marginLeft, 40);
        doc.setTextColor(100);
        doc.setFontSize(10);
        doc.text("Asamblea " + asambleaSeleccionada.tipo + "   -   " + asambleaSeleccionada.fecha + "   -   " + asambleaSeleccionada.lugar, marginLeft,55);
        doc.autoTable(content);
    
        doc.addPage("A4","l");
        doc.text("Quorum en Acciones  :     " + (accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0)).toString(), marginLeft, 50);
        doc.text("Quorum en Capital $ :     " + (accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0) * valorNominal).toFixed(2).toString(), marginLeft, 80);
        doc.text("Quorum Participación:     " + ((accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0)  / cantidadEmitido) * 100.00).toFixed(8).toString(), marginLeft, 110);
    
        doc.save("ListadoAccionistasAsamblea.pdf")
        
      }
    
      const exportPDFResumenQuorum = async() => {
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        //const orientation = "portrait"; // portrait or landscape
        const orientation = "landscape"; // portrait or landscape
    
        
        const doc = new jsPDF(orientation, unit, size);
    
        doc.setFontSize(12);
        
        const title = "Quorum Asamblea";

        doc.addImage(logo,"JPEG",700,20,80,30)
        doc.text(title, 40, 40);
        doc.setTextColor(100);
        doc.setFontSize(10);
        doc.text("Asamblea " + asambleaSeleccionada.tipo + "   -   " + asambleaSeleccionada.fecha + "   -   " + asambleaSeleccionada.lugar, 40,55);

        //doc.text("Quorum en Acciones  :     " + (accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0)).toString(), 40, 50);
        //doc.text("Quorum en Capital $ :     " + (accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0) * valorNominal).toFixed(2).toString(), 40, 80);
        //doc.text("Quorum Participación:     " + ((accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0)  / cantidadEmitido) * 100.00).toFixed(8).toString(), 40, 110);

        doc.setTextColor(0);
        doc.text("Capital",200,80);
        doc.text("Porcentajes",300,80);
        doc.text("Accionistas",500,80);
        doc.text("Porcentajes",600,80);

        
        doc.text("Presentes :",40,120);
        doc.text("Representados :",40,140);
        doc.text("Ausentes :",40,160);
        


        //Presentes
        //doc.setFont("normal", "normal");
        doc.text((accionistasxJuntas.filter(o => o.presente  === true && (o.representanteNombre === "undefined" || o.representanteNombre === "" || o.representanteNombre === null  )).reduce((a, b) => +a + +b.acciones, 0) * valorNominal).toFixed(2).toString() ,250,120,null,null,"right");
        doc.text((100.00*(accionistasxJuntas.filter(o => o.presente  === true && (o.representanteNombre === "undefined" || o.representanteNombre === "" || o.representanteNombre === null  )).reduce((a, b) => +a + +b.acciones, 0) * valorNominal)/(cantidadEmitido * valorNominal)).toFixed(2).toString()+"%",350,120,null,null,"right");
        doc.text(accionistasxJuntas.filter(o => o.presente  === true && (o.representanteNombre === "undefined" || o.representanteNombre === "" || o.representanteNombre === null  )).length.toString() ,550,120,null,null,"right");
        doc.text((100.00* accionistasxJuntas.filter(o => o.presente  === true && (o.representanteNombre === "undefined" || o.representanteNombre === "" || o.representanteNombre === null  )).length / (accionistas.length)).toFixed(2).toString() + "%" ,650,120,null,null,"right");

        //Representados
        doc.text((accionistasxJuntas.filter(o => o.presente  === true && o.representanteNombre).reduce((a, b) => +a + +b.acciones, 0) * valorNominal).toFixed(2).toString() ,250,140,null,null,"right");
        doc.text((100.00*(accionistasxJuntas.filter(o => o.presente  === true && o.representanteNombre).reduce((a, b) => +a + +b.acciones, 0) * valorNominal) / (cantidadEmitido * valorNominal)).toFixed(2).toString()+"%",350,140,null,null,"right");
        doc.text((accionistasxJuntas.filter(o => o.presente  === true && o.representanteNombre)).length.toString() ,550,140,null,null,"right");
        doc.text((100.00*(accionistasxJuntas.filter(o => o.presente  === true && o.representanteNombre).length) / (accionistas.length) ).toFixed(2).toString() + "%" ,650,140,null,null,"right");

        //Ausentes
        doc.text(((cantidadEmitido*valorNominal) - (accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0) * valorNominal)).toFixed(2).toString() ,250,160,null,null,"right");
        doc.text((100.00 * ((cantidadEmitido*valorNominal) - (accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0) * valorNominal)) / (cantidadEmitido * valorNominal)).toFixed(2).toString()+"%",350,160,null,null,"right");
        doc.text((accionistas.length - accionistasxJuntas.filter(o => o.presente  === true ).length).toString() ,550,160,null,null,"right");
        doc.text((100.00 * (accionistas.length - accionistasxJuntas.filter(o => o.presente  === true ).length) / (accionistas.length)).toFixed(2).toString() + "%" ,650,160,null,null,"right");

        //Quorum
        doc.setTextColor("blue");
        doc.text("Quorum :",40,180);
        doc.text((accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0) * valorNominal).toFixed(2).toString() ,250,180,null,null,"right");
        doc.text(((accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0)  / cantidadEmitido) * 100.00).toFixed(2).toString() + "%",350,180,null,null,"right");
        doc.text(accionistasxJuntas.filter(o => o.presente  === true ).length.toString() ,550,180,null,null,"right");
        doc.text((100.00 * (accionistasxJuntas.filter(o => o.presente  === true ).length / accionistas.length)).toFixed(2).toString()+"%",650,180,null,null,"right");

        //Total
        //console.log("FONTS", doc.getFontList());
        doc.setTextColor("black");
        doc.setFont("Helvetica", "Bold");
        doc.text("Total :",40,100);
        doc.text((cantidadEmitido * valorNominal).toString() ,250,100,null,null,"right");
        doc.text("100.00%",350,100,null,null,"right");
        doc.text(accionistas.length.toString() ,550,100,null,null,"right");
        doc.text("100.00%",650,100,null,null,"right");

        doc.setTextColor("black");
        //doc.setFont("Helvetica", "normal");
        { asambleaSeleccionada.horaCierreQuorum && doc.text("Hora de Cierre Quorum : " + asambleaSeleccionada.horaCierreQuorum,40,220)};



        doc.save("ResumenQuorumAsamblea.pdf")
        
      }

      const exportPDFListadoVotaciones = async() => {
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        //const orientation = "portrait"; // portrait or landscape
        const orientation = "landscape"; // portrait or landscape
    
        const marginLeft = 40;
        const doc = new jsPDF(orientation, unit, size);
    
        doc.setFontSize(12);
        
        const title = "Votaciones de Asamblea";

        const Tema1 = asambleaSeleccionada.votacionTema1 ? "Tema 1" : "";
        const Tema2 = asambleaSeleccionada.votacionTema2 ? "Tema 2" : "";
        const Tema3 = asambleaSeleccionada.votacionTema3 ? "Tema 3" : "";
        const Tema4 = asambleaSeleccionada.votacionTema4 ? "Tema 4" : "";
        const Tema5 = asambleaSeleccionada.votacionTema5 ? "Tema 5" : "";
        const Tema6 = asambleaSeleccionada.votacionTema6 ? "Tema 6" : "";
        const Tema7 = asambleaSeleccionada.votacionTema7 ? "Tema 7" : "";
        const Tema8 = asambleaSeleccionada.votacionTema8 ? "Tema 8" : "";
        const Tema9 = asambleaSeleccionada.votacionTema9 ? "Tema 9" : "";
        const Tema10 = asambleaSeleccionada.votacionTema10 ? "Tema 10" : "";

        //let headers = [["Nombre", "Tema 1", "Tema 2", "Tema 3", "Tema 4","Tema 5", "Tema 6", "Tema 7", "Tema 8", "Tema 9", "Tema 10"]];
        let headers = [["Nombre", Tema1, Tema2, Tema3, Tema4,Tema5, Tema6, Tema7, Tema8, Tema9, Tema10]];
        let data = accionistasxJuntas.filter(o => o.presente  === true ).map(elt=> [elt.nombre, elt.votacion1 === true ? 'Sí' : '', elt.votacion2 === true ? 'Sí' : '', elt.votacion3 === true ? 'Sí' : '', elt.votacion4 === true ? 'Sí' : '', elt.votacion5 === true ? 'Sí' : '', elt.votacion6 === true ? 'Sí' : '', elt.votacion7 === true ? 'Sí' : '', elt.votacion8 === true ? 'Sí' : '', elt.votacion9 === true ? 'Sí' : '', elt.votacion10 === true ? 'Sí' : '']);
        
        


        let content = {
          theme: 'plain',
          startY: 70,
          head: headers,
          body: data,
          columnStyles:{
            0: {halign:'left', fontSize:8},
            1: {halign:'center', fontSize:8},
            2: {halign:'center', fontSize:8},
            3: {halign:'center', fontSize:8},
            4: {halign:'center', fontSize:8},
            5: {halign:'center', fontSize:8},
            6: {halign:'center', fontSize:8},
            7: {halign:'center', fontSize:8},
            8: {halign:'center', fontSize:8},
            9: {halign:'center', fontSize:8},
            10: {halign:'center', fontSize:8},
            },
          headStyles:{fontSize:8

            }

        };
    
        doc.addImage(logo,"JPEG",700,20,80,30)
        doc.text(title, marginLeft, 40);
        doc.setTextColor(100);
        doc.setFontSize(10);
        doc.text("Asamblea " + asambleaSeleccionada.tipo + "   -   " + asambleaSeleccionada.fecha + "   -   " + asambleaSeleccionada.lugar, marginLeft,55);
        doc.setFontSize(8);
        doc.autoTable(content);
    
        doc.addPage("A4","l");
        doc.setFontSize(10);
        {asambleaSeleccionada.votacionTema1 && doc.text("Tema 1 :  " + asambleaSeleccionada.votacionTema1 + " (a favor " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion1 === true ).length + ", en contra " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion1 !== true ).length + ")",  marginLeft, 50)};
        {asambleaSeleccionada.votacionTema2 && doc.text("Tema 2 :  " + asambleaSeleccionada.votacionTema2 + " (a favor " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion2 === true ).length + ", en contra " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion2 !== true ).length + ")", marginLeft, 65)};
        {asambleaSeleccionada.votacionTema3 && doc.text("Tema 3 :  " + asambleaSeleccionada.votacionTema3 + " (a favor " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion3 === true ).length + ", en contra " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion3 !== true ).length + ")", marginLeft, 80)};
        {asambleaSeleccionada.votacionTema4 && doc.text("Tema 4 :  " + asambleaSeleccionada.votacionTema4 + " (a favor " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion4 === true ).length + ", en contra " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion4 !== true ).length + ")", marginLeft, 95)};
        {asambleaSeleccionada.votacionTema5 && doc.text("Tema 5 :  " + asambleaSeleccionada.votacionTema5 + " (a favor " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion5 === true ).length + ", en contra " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion5 !== true ).length + ")", marginLeft, 110)};
        {asambleaSeleccionada.votacionTema6 && doc.text("Tema 6 :  " + asambleaSeleccionada.votacionTema6 + " (a favor " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion6 === true ).length + ", en contra " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion6 !== true ).length + ")", marginLeft, 125)};
        {asambleaSeleccionada.votacionTema7 && doc.text("Tema 7 :  " + asambleaSeleccionada.votacionTema7 + " (a favor " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion7 === true ).length + ", en contra " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion7 !== true ).length + ")", marginLeft, 140)};
        {asambleaSeleccionada.votacionTema8 && doc.text("Tema 8 :  " + asambleaSeleccionada.votacionTema8 + " (a favor " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion8 === true ).length + ", en contra " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion8 !== true ).length + ")", marginLeft, 155)};
        {asambleaSeleccionada.votacionTema9 && doc.text("Tema 9 :  " + asambleaSeleccionada.votacionTema9 + " (a favor " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion9 === true ).length + ", en contra " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion9 !== true ).length + ")", marginLeft, 170)};
        {asambleaSeleccionada.votacionTema10 && doc.text("Tema 10 :  " + asambleaSeleccionada.votacionTema10 + " (a favor " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion10 === true ).length + ", en contra " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion10 !== true ).length + ")", marginLeft, 185) };
    
        doc.save("ListadoVotacionesAsamblea.pdf")
        
      }

      

    const classes = useStyles();

    return (

        <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <div>
            <Button                
                variant="contained"
                color="primary"
                className={classes.button}
                size='small'
                onClick={ handleOpenCrearAsamblea }
                style={{textTransform: 'none'}}
            >
                +  Crear Asamblea
            </Button>                
            </div>

            <DataGrid
              style={{backgroundColor:'white'}}
              density="compact"             
              autoHeight='true'
              autoPageSize='true'
              disableColumnMenu 
              rows={rows}
              columns={columns}
              pageSize={20}
              rowsPerPageOptions={[20]}
            />
          </Grid>
  
  
          <Dialog open={openAccionistas} onClose={handleClose} aria-labelledby="form-dialog-title"  maxWidth = 'md'  >          
            <DialogTitle id="form-dialog-title">{asambleaSeleccionada.nombre}</DialogTitle>
            <DialogContent style={{height: '500px', width:'900px'}}>
  
  
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChangeTab} aria-label="basic tabs example">
                <Tab label="Accionistas" {...a11yProps(0)} />
                <Tab label="Quorum" {...a11yProps(1)} />
                <Tab label="Votaciones" {...a11yProps(2)} />
                <Tab label="Cierre" {...a11yProps(3)} />
                </Tabs>
              </Box>

              <TabPanel value={value} index={0}>

              <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', marginBottom: '20px' }}>
                <Autocomplete
                    value={valCedente}
                    size='small'
                    key={value}
                    id="combo-box-cedente"
                    options={accionistas}
                    getOptionLabel={(option) => option.nombre ? option.nombre : ""}
                    style={{ width: 'calc(100%)', marginRight: 10,}}
                    renderInput={(params) => <TextField {...params} label={<small>Buscar accionista para registro ...</small>} margin="normal"  variant="outlined"  />}
                    onChange={(option, value) => handleClickCedente(option, value)}
                />


                <TextField
                    id="outlined-required"
                    label={<small>Nombre Representante</small>}
                    value={nombreRepresentante}
                    onChange={handleChangeNombreRepresentante}
                    size='small'
                    variant="outlined"
                    style={{width: '300px', marginTop:7}}
              /> 
              <TextField
                    id="outlined-required"
                    label={<small>Identificación</small>}
                    value={identificacionRepresentante}
                    onChange={handleChangeIdentificacionRepresentante}
                    size='small'
                    variant="outlined"
                    style={{width: '200px',marginTop:7}}
              /> 

                <label htmlFor="upload-photo10">
                    <input style={{ display: 'none' }} id="upload-photo10" name="upload-photo10" type="file" onChange={onChangeIDRepresentante} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='medium' style={{textTransform: 'none',marginTop:7}}>Doc</Button>
                    {IDRepresentante.length > 0 && <IconButton ><CheckIcon /></IconButton>}
                </label>

                <Button                
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    size='medium'
                    //onClick={ addAccionista(asambleaSeleccionada.id) }
                    onClick={ addAccionista }
                    style={{textTransform: 'none', marginLeft: 10}}
                >
                    Agregar
                </Button>   

              </div>




            <Divider/>

              <List dense='true'           
                  subheader={
                  <ListSubheader component="div" id="nested-list-subheader">
                    <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', marginTop:'20px'}}>                
                      <Typography variant='caption' style={{flex:6, fontWeight:'bold'}}>
                        Nombre Accionista
                      </Typography>
                      <Typography variant='caption' style={{flex:1, fontWeight:'bold', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'10px'}}>
                        Identificación
                      </Typography>
                      <Typography variant='caption' style={{flex:1, fontWeight:'bold', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'10px'}}>
                        Acciones
                      </Typography>
                      <Typography variant='caption' style={{flex:1, fontWeight:'bold', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'10px'}}>
                        Participación
                      </Typography>
                      <Typography variant='caption' style={{flex:1, fontWeight:'bold', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'0px'}}>
                        Presente
                      </Typography>    
                      <Typography variant='caption' style={{flex:2, fontWeight:'bold', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'10px'}}>
                        Representante
                      </Typography>                                    
                      <Typography variant='caption' style={{flex:1, fontWeight:'bold', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:''}}>
                        Identif.Rep.
                      </Typography> 
                      <Typography variant='caption' style={{flex:1, fontWeight:'bold', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'60px'}}>
                        Doc
                      </Typography> 

                    </div>                           
                  </ListSubheader>                              
                  }> 

            <input
                type="text"
                placeholder="Buscar nombre..."
                //value={items}
                onChange={requestSearch}
                style={{width: 150, marginLeft:15, fontSize:10,}}
            />

                  {
                  items.sort((a,b) => (a.nombre > b.nombre) ? 1 : ((b.nombre > a.nombre) ? -1 : 0)).map(item => (
                    <ListItem  key={item.id}
                    //button onClick={handleTogglePresente(item.id, !item.presente)}
                    style={{paddingTop:'0px', paddingBottom:'0px'}}                  
                    >
                      <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', }}>                                                            
                        <ListItemText style={{flex:6,}}> <small>{item.nombre}</small>  </ListItemText>                                
                        <ListItemText style={{flex:1, display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'10px'}}> <small>{item.identificacion}</small>  </ListItemText>                                
                        <ListItemText style={{flex:1, display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'20px'}}> <small>{item.acciones}</small></ListItemText>
                        <ListItemText style={{flex:1, display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'0px'}}><small> {(item.acciones * 100 / cantidadEmitido).toFixed(6) }</small></ListItemText>
                        <ListItemIcon style={{flex:1, display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'20px'}}>
                            <Checkbox
                                edge="start"
                                onClick={handleTogglePresente(item.id, !item.presente)}
                                //checked={checked.indexOf(item.id) !== -1}
                                checked={item.presente}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{ 'aria-labelledby': `checkbox-list-label-${item.id}` }}
                                disabled={asambleaSeleccionada.estado == "Realizada" ? true : false}
                            />
                        </ListItemIcon>    
                        <ListItemText style={{flex:2, display:'flex', alignItems:'flex-start', justifyContent:'flex-start'}}><small>{item.representanteNombre}</small></ListItemText>                    
                        <ListItemText style={{flex:1, display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:''}}> <small>{item.representanteDocumento}</small>  </ListItemText>                                

                        <ListItemIcon style={{flex:1, display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'0px'}}>
                            {item.representanteDI &&
                            <IconButton edge="end" aria-label="delete" onClick={() => getPictureID(item.representanteDI)}>
                                <PageviewIcon />
                            </IconButton>
                            }
                        </ListItemIcon>
                        <ListItemIcon style={{flex:1, display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'0px'}}>
                            <IconButton id='123456789' edge="end" aria-label="delete2" onClick={eliminarAccionistaJunta(item.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemIcon>


                      </div>
                    </ListItem>))}                    
                </List>
              </TabPanel>

              <TabPanel value={value} index={1}>

                <div style={{display:'flex', flexDirection:'row', alignItems:'flex-start', justifyContent:'space-around', width:'100%', marginBottom: '0px' }}>
                    <Box display="flex" flexDirection='column' >
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom align="center">
                            Quorum
                        </Typography>
                        <Typography variant="h5" component="div" align="center">
                            {accionistasxJuntas.filter(o => o.presente  === true ).length}
                        </Typography>
                    </Box>
                    <Box display="flex" flexDirection='column' >
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom align="center">
                            Acciones Quorum
                        </Typography>
                        <Typography variant="h5" component="div" align="center">
                        {(accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0))}
                        </Typography>
                    </Box>                       
                    <Box display="flex" flexDirection='column' >
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom align="center">
                            Capital Quorum
                        </Typography>
                        <Typography variant="h5" component="div" align="center">
                        {(accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0) * valorNominal).toFixed(2)}
                        </Typography>
                    </Box>   
                    <Box display="flex" flexDirection='column' >
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom align="center">
                            % Capital Quorum
                        </Typography>
                        <Typography variant="h5" component="div" align="center">
                        {((accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0)  / cantidadEmitido) * 100.00).toFixed(8)}
                        </Typography>
                    </Box>   
                    <Box display="flex" flexDirection='column' >
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom align="center">
                            % Accionistas
                        </Typography>
                        <Typography variant="h5" component="div" align="center">
                        {((accionistasxJuntas.filter(o => o.presente  === true ).length / accionistas.length) * 100.00).toFixed(8)}
                        </Typography>
                    </Box>  
                </div>
               <Divider/> 
                <div style={{display:'flex', flexDirection:'row', alignItems:'flex-start', justifyContent:'space-around', width:'100%', marginBottom: '0px' }}>
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        Presentes
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {accionistasxJuntas.filter(o => o.presente  === true && (o.representanteNombre === "undefined" || o.representanteNombre === "" || o.representanteNombre === null  )  ).length}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        Acciones Presentes
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {(accionistasxJuntas.filter(o => o.presente  === true && (o.representanteNombre === "undefined" || o.representanteNombre === "" || o.representanteNombre === null  )).reduce((a, b) => +a + +b.acciones, 0))}
                        </Typography>
                    </Box>                    
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        Capital Presentes
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {(accionistasxJuntas.filter(o => o.presente  === true && (o.representanteNombre === "undefined" || o.representanteNombre === "" || o.representanteNombre === null  )).reduce((a, b) => +a + +b.acciones, 0) * valorNominal).toFixed(2)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        % Capital Presentes
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {((accionistasxJuntas.filter(o => o.presente  === true && (o.representanteNombre === "undefined" || o.representanteNombre === "" || o.representanteNombre === null  ) ).reduce((a, b) => +a + +b.acciones, 0)  / cantidadEmitido) * 100.00).toFixed(8)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        % Presentes
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {((accionistasxJuntas.filter(o => o.presente  === true && (o.representanteNombre === "undefined" || o.representanteNombre === "" || o.representanteNombre === null  )).length / accionistas.length) * 100.00).toFixed(8) }
                        </Typography>
                    </Box>                                                            
                </div>
                <Divider/> 
                <div style={{display:'flex', flexDirection:'row', alignItems:'flex-start', justifyContent:'space-around', width:'100%', marginBottom: '0px' }}>
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        Representados
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {accionistasxJuntas.filter(o => o.presente  === true && o.representanteNombre).length}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        Acciones Representados
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {(accionistasxJuntas.filter(o => o.presente  === true && o.representanteNombre).reduce((a, b) => +a + +b.acciones, 0))}
                        </Typography>
                    </Box>                    
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        Capital Representados
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {(accionistasxJuntas.filter(o => o.presente  === true && o.representanteNombre).reduce((a, b) => +a + +b.acciones, 0) * valorNominal).toFixed(2)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        % Capital Representados
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {((accionistasxJuntas.filter(o => o.presente  === true && o.representanteNombre).reduce((a, b) => +a + +b.acciones, 0)  / cantidadEmitido) * 100.00).toFixed(8)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        % Representados
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {((accionistasxJuntas.filter(o => o.presente  === true && o.representanteNombre ).length / accionistas.length) * 100.00).toFixed(8)}
                        </Typography>
                    </Box>                                                            
                </div>
                <Divider/> 
                <div style={{display:'flex', flexDirection:'row', alignItems:'flex-start', justifyContent:'space-around', width:'100%', marginBottom: '0px' }}>
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        Ausentes
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {accionistas.length - accionistasxJuntas.filter(o => o.presente  === true ).length}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        Acciones Ausentes
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {((cantidadEmitido) - (accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0)))}
                        </Typography>
                    </Box>                    
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        Capital Ausentes
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {((cantidadEmitido*valorNominal) - (accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0) * valorNominal)).toFixed(2)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        % Capital Ausentes
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {((1 - (accionistasxJuntas.filter(o => o.presente  === true ).reduce((a, b) => +a + +b.acciones, 0)  / cantidadEmitido)) * 100.00).toFixed(8)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" align="center">
                        % Ausentes
                        </Typography>                
                        <Typography variant="body2" align="center">
                        {((1 - (accionistasxJuntas.filter(o => o.presente  === true ).length / accionistas.length)) * 100.00).toFixed(8)}
                        </Typography>
                    </Box>                                                            
                </div>
                <Divider/> 
                <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center', width:'100%', marginTop: '0px' }}>
                    <div style={{ width:'100px', height: '100px' }}>
                        <Typography variant='body2'>
                        Capital
                        </Typography>                        
                        <PieChart                            
                            data={capitalData}
                            viewBoxSize={[100, 100]}
                        />                        
                    </div>
                    <div style={{ width:'100px', height: '100px', marginLeft:'20px' }}>
                        <Typography variant='body2'>
                        Accionistas
                        </Typography>
                        <PieChart
                            id="cool-canvas2"
                            data={accionistaData}
                            viewBoxSize={[100, 100]}
                        />
                    </div>                    
                </div> 
                <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center', width:'100%', marginTop: '20px' }}>
                    <div >
                        <Chip size="small" label="Representados"  style={{width:'80px', height:'15px', fontSize:8, backgroundColor:'#CDDC39'}}/>
                        <Chip size="small" label="Presentes" color="primary" style={{width:'80px', height:'15px', fontSize:8}}/>
                        <Chip size="small" label="Ausentes" color="secondary" style={{width:'80px', height:'15px', fontSize:8}}/>
                    </div>
                </div> 

              </TabPanel>

              <TabPanel value={value} index={2}>

                <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'space-between', width:'100%', marginBottom: '20px' }}>

                        <FormControl style={{width:'100%', marginBottom: 20}}>
                            <InputLabel id="demo-simple-select-label">Temas de votación</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={temaVotacion}
                                label="Tipo Asamblea"
                                onChange={handleChangeTemaVotacion}
                            >
                                <MenuItem value={"1"}>{asambleaSeleccionada.votacionTema1}</MenuItem>
                                <MenuItem value={"2"}>{asambleaSeleccionada.votacionTema2}</MenuItem>
                                <MenuItem value={"3"}>{asambleaSeleccionada.votacionTema3}</MenuItem>
                                <MenuItem value={"4"}>{asambleaSeleccionada.votacionTema4}</MenuItem>
                                <MenuItem value={"5"}>{asambleaSeleccionada.votacionTema5}</MenuItem>
                                <MenuItem value={"6"}>{asambleaSeleccionada.votacionTema6}</MenuItem>
                                <MenuItem value={"7"}>{asambleaSeleccionada.votacionTema7}</MenuItem>
                                <MenuItem value={"8"}>{asambleaSeleccionada.votacionTema8}</MenuItem>                            
                                <MenuItem value={"9"}>{asambleaSeleccionada.votacionTema9}</MenuItem>
                                <MenuItem value={"10"}>{asambleaSeleccionada.votacionTema10}</MenuItem>                            
                            </Select>
                        </FormControl>

                        <Divider/>

                        <Box sx={{display:'flex', flexDirection:'row', justifyContent:'flex-end',  width: '100%' }}>
                            

                            <Typography variant='body2'>                                
                                {temaVotacion === "1" && "Acuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion1 === true ).length}
                                {temaVotacion === "2" && "Acuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion2 === true ).length}
                                {temaVotacion === "3" && "Acuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion3 === true ).length}
                                {temaVotacion === "4" && "Acuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion4 === true ).length}
                                {temaVotacion === "5" && "Acuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion5 === true ).length}
                                {temaVotacion === "6" && "Acuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion6 === true ).length}
                                {temaVotacion === "7" && "Acuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion7 === true ).length}
                                {temaVotacion === "8" && "Acuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion8 === true ).length}
                                {temaVotacion === "9" && "Acuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion9 === true ).length}
                                {temaVotacion === "10" && "Acuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion10 === true ).length}
                                
                                {temaVotacion === "1" && "  /  Desacuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion1 !== true ).length}
                                {temaVotacion === "2" && "  /  Desacuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion2 !== true ).length}
                                {temaVotacion === "3" && "  /  Desacuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion3 !== true ).length}
                                {temaVotacion === "4" && "  /  Desacuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion4 !== true ).length}
                                {temaVotacion === "5" && "  /  Desacuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion5 !== true ).length}
                                {temaVotacion === "6" && "  /  Desacuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion6 !== true ).length}
                                {temaVotacion === "7" && "  /  Desacuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion7 !== true ).length}
                                {temaVotacion === "8" && "  /  Desacuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion8 !== true ).length}
                                {temaVotacion === "9" && "  /  Desacuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion9 !== true ).length}
                                {temaVotacion === "10" && "  /  Desacuerdo:  " + accionistasxJuntas.filter(o => o.presente  === true && o.votacion10 !== true ).length}
                            </Typography>
                        </Box>
 
                        {temaVotacion &&
                        <List dense='true'     
                            style={{width:'100%'}}
                            subheader={
                            <ListSubheader component="div" id="nested-list-subheader">
                            <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', marginTop:'20px'}}>                
                                <Typography variant='caption' style={{flex:'6', fontWeight:'bold'}}>
                                Nombre
                                </Typography>
                                <Typography variant='caption' style={{flex:1, fontWeight:'bold', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'0'}}>
                                Acciones
                                </Typography>              
                                <Typography variant='caption' style={{flex:1, fontWeight:'bold', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', paddingRight:'0'}}>
                                Aprobar
                                </Typography>                                        

                            </div>                                
                            </ListSubheader>            
                            }> 
            <input
                type="text"
                placeholder="Buscar nombre..."
                //value={items}
                onChange={requestSearchVotacion}
                style={{width: 150, marginLeft:15, fontSize:10,}}
            />                            
                            {
                            itemsVotacion.filter(o => o.presente === true).sort((a,b) => (parseInt(a.nombre) > parseInt(b.nombre)) ? 1 : ((parseInt(b.nombre) > parseInt(a.nombre)) ? -1 : 0)).map(item => (
                            <ListItem  key={item.id}
                            button onClick={handleToggleVotacionAccionista(item.id, temaVotacion, temaVotacion == "1" ? !item.votacion1 : temaVotacion == "2" ? !item.votacion2 : temaVotacion == "3" ? !item.votacion3 : temaVotacion == "4" ? !item.votacion4 : temaVotacion == "5" ? !item.votacion5 : temaVotacion == "6" ? !item.votacion6 : temaVotacion == "7" ? !item.votacion7 : temaVotacion == "8" ? !item.votacion8 : temaVotacion == "9" ? !item.votacion9 : !item.votacion10)}
                            style={{paddingTop:'0px', paddingBottom:'0px'}}
                            >
                                <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-evenly', width:'100%', }}>                                                            
                                <ListItemText style={{flex:6,}}> <small>{item.nombre}</small>  </ListItemText>                                
                                <ListItemText style={{flex:1, display:'flex', alignItems:'flex-end', justifyContent:'flex-end'}}> <small>{item.acciones}</small>  </ListItemText>                                
                                <ListItemIcon style={{flex:1, display:'flex', alignItems:'flex-end', justifyContent:'flex-end'}}>
                                    <Checkbox
                                        edge="end"
                                        //checked={checked.indexOf(item.id) !== -1}
                                        checked={temaVotacion == "1" ? item.votacion1 : temaVotacion == "2" ? item.votacion2 : temaVotacion == "3" ? item.votacion3 : temaVotacion == "4" ? item.votacion4 : temaVotacion == "5" ? item.votacion5 : temaVotacion == "6" ? item.votacion6 : temaVotacion == "7" ? item.votacion7 : temaVotacion == "8" ? item.votacion8 : temaVotacion == "9" ? item.votacion9 : temaVotacion == "10" ? item.votacion10 : ""}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': `checkbox-list-label-${item.id}` }}
                                        disabled={asambleaSeleccionada.estado == "Realizada" ? true : false}
                                    />
                                </ListItemIcon>    


                                </div>
                            </ListItem>))}
                        </List>
                        }


                </div> 
              </TabPanel>
              <TabPanel value={value} index={3}>

                <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between', width:'100%', marginBottom: '20px' }}>

                {asambleaSeleccionada.estado !== 'Realizada' &&
                <Button onClick={handleFinalizarAsamblea} color="primary" variant="contained">
                    Finalizar Asamblea
                </Button>
                }

                {asambleaSeleccionada.estado === 'Realizada' &&
                    <Typography variant="h4">
                        Asamblea Finalizada !!!
                    </Typography>
                }

                <label htmlFor="upload-photo100">
                    <input style={{ display: 'none' }} id="upload-photo100" name="upload-photo100" type="file" onChange={onChangeActaFin} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='medium' style={{textTransform: 'none',marginTop:7}}>Acta de Cierre</Button>
                    {asambleaSeleccionada.acta &&  <IconButton onClick={getPictureActa} ><PageviewIcon /></IconButton>}
                    {asambleaSeleccionada.acta &&  <IconButton onClick={onRemoveActaFin} ><DeleteIcon /></IconButton>}
                    
                </label>
                
                

                <div style={{marginTop:20}}>
                Expediente del Acta de Junta
                </div>
                {asambleaSeleccionada.votacionTema1 && <label htmlFor="upload-photo101">
                    <input style={{ display: 'none' }} id="upload-photo101" name="upload-photo101" type="file" onChange={onChangeHabilitante1} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',marginTop:7}}>Expendiente 1</Button>                    
                    {asambleaSeleccionada.habilitanteTema1 &&  <IconButton onClick={getPictureHabilitante1} ><PageviewIcon /></IconButton>}
                    {asambleaSeleccionada.habilitanteTema1 &&  <IconButton onClick={onRemoveHabilitante1} ><DeleteIcon /></IconButton>}
                </label>}
                {asambleaSeleccionada.votacionTema2 && <label htmlFor="upload-photo102">
                    <input style={{ display: 'none' }} id="upload-photo102" name="upload-photo102" type="file" onChange={onChangeHabilitante2} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',marginTop:7}}>Expendiente 2</Button>
                    {asambleaSeleccionada.habilitanteTema2 &&  <IconButton onClick={getPictureHabilitante2} ><PageviewIcon /></IconButton>}
                    {asambleaSeleccionada.habilitanteTema2 &&  <IconButton onClick={onRemoveHabilitante2} ><DeleteIcon /></IconButton>}
                </label>}
                {asambleaSeleccionada.votacionTema3 && <label htmlFor="upload-photo103">
                    <input style={{ display: 'none' }} id="upload-photo103" name="upload-photo103" type="file" onChange={onChangeHabilitante3} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',marginTop:7}}>Expendiente 3</Button>
                    {asambleaSeleccionada.habilitanteTema3 &&  <IconButton onClick={getPictureHabilitante3} ><PageviewIcon /></IconButton>}
                    {asambleaSeleccionada.habilitanteTema3 &&  <IconButton onClick={onRemoveHabilitante3} ><DeleteIcon /></IconButton>}
                </label>}
                {asambleaSeleccionada.votacionTema4 && <label htmlFor="upload-photo104">
                    <input style={{ display: 'none' }} id="upload-photo104" name="upload-photo104" type="file" onChange={onChangeHabilitante4} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',marginTop:7}}>Expendiente 4</Button>
                    {asambleaSeleccionada.habilitanteTema4 &&  <IconButton onClick={getPictureHabilitante4} ><PageviewIcon /></IconButton>}
                    {asambleaSeleccionada.habilitanteTema4 &&  <IconButton onClick={onRemoveHabilitante4} ><DeleteIcon /></IconButton>}
                </label>}
                {asambleaSeleccionada.votacionTema5 && <label htmlFor="upload-photo105">
                    <input style={{ display: 'none' }} id="upload-photo105" name="upload-photo105" type="file" onChange={onChangeHabilitante5} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',marginTop:7}}>Expendiente 5</Button>
                    {asambleaSeleccionada.habilitanteTema5 &&  <IconButton onClick={getPictureHabilitante5} ><PageviewIcon /></IconButton>}
                    {asambleaSeleccionada.habilitanteTema5 &&  <IconButton onClick={onRemoveHabilitante5} ><DeleteIcon /></IconButton>}
                </label>}
                {asambleaSeleccionada.votacionTema6 && <label htmlFor="upload-photo106">
                    <input style={{ display: 'none' }} id="upload-photo106" name="upload-photo106" type="file" onChange={onChangeHabilitante6} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',marginTop:7}}>Expendiente 6</Button>
                    {asambleaSeleccionada.habilitanteTema6 &&  <IconButton onClick={getPictureHabilitante6} ><PageviewIcon /></IconButton>}
                    {asambleaSeleccionada.habilitanteTema6 &&  <IconButton onClick={onRemoveHabilitante6} ><DeleteIcon /></IconButton>}
                </label>}
                {asambleaSeleccionada.votacionTema7 && <label htmlFor="upload-photo107">
                    <input style={{ display: 'none' }} id="upload-photo107" name="upload-photo107" type="file" onChange={onChangeHabilitante7} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',marginTop:7}}>Expendiente 7</Button>
                    {asambleaSeleccionada.habilitanteTema7 &&  <IconButton onClick={getPictureHabilitante7} ><PageviewIcon /></IconButton>}
                    {asambleaSeleccionada.habilitanteTema7 &&  <IconButton onClick={onRemoveHabilitante7} ><DeleteIcon /></IconButton>}
                </label>}
                {asambleaSeleccionada.votacionTema8 && <label htmlFor="upload-photo108">
                    <input style={{ display: 'none' }} id="upload-photo108" name="upload-photo108" type="file" onChange={onChangeHabilitante8} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',marginTop:7}}>Expendiente 8</Button>
                    {asambleaSeleccionada.habilitanteTema8 &&  <IconButton onClick={getPictureHabilitante8} ><PageviewIcon /></IconButton>}
                    {asambleaSeleccionada.habilitanteTema8 &&  <IconButton onClick={onRemoveHabilitante8} ><DeleteIcon /></IconButton>}
                </label>}
                {asambleaSeleccionada.votacionTema9 && <label htmlFor="upload-photo109">
                    <input style={{ display: 'none' }} id="upload-photo109" name="upload-photo109" type="file" onChange={onChangeHabilitante9} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',marginTop:7}}>Expendiente 9</Button>
                    {asambleaSeleccionada.habilitanteTema9 &&  <IconButton onClick={getPictureHabilitante9} ><PageviewIcon /></IconButton>}
                    {asambleaSeleccionada.habilitanteTema9 &&  <IconButton onClick={onRemoveHabilitante9} ><DeleteIcon /></IconButton>}
                </label>}
                {asambleaSeleccionada.votacionTema10 && <label htmlFor="upload-photo110">
                    <input style={{ display: 'none' }} id="upload-photo110" name="upload-photo110" type="file" onChange={onChangeHabilitante10} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{textTransform: 'none',marginTop:7}}>Expendiente 10</Button>
                    {asambleaSeleccionada.habilitanteTema10 &&  <IconButton onClick={getPictureHabilitante10} ><PageviewIcon /></IconButton>}
                    {asambleaSeleccionada.habilitanteTema10 &&  <IconButton onClick={onRemoveHabilitante10} ><DeleteIcon /></IconButton>}
                </label>}                                                                                                                                

                </div> 
              </TabPanel>
            </DialogContent>
            <DialogActions style={{display:'flex', flexDirection:'row', alignItems:'flex-end', justifyContent:'space-between', width:'100%' }}>            
            { value === 0 &&
              <div>
                <Button onClick={exportPDFListadoAccionistas} color="primary"  size="small" style={{marginRight:50}}>
                Imprimir Listado
                </Button>    
              </div>          
              }
              { value === 1 &&
              <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'flex-start', width:'100%' }}>

                {!asambleaSeleccionada.cierreQuorum &&
                <Button onClick={handleCerrarQuorum} color="primary" variant="contained" size="small" style={{marginRight:10}}>
                    Cerrar Quorum
                </Button>
                    }
                <Button onClick={exportPDFResumenQuorum} color="primary"  size="small" style={{marginRight:50}}>
                    Imprimir Quorum
                </Button>    

                {asambleaSeleccionada.cierreQuorum &&
                <div>
                <Typography variant="body2"> 
                    Cierre Quorum : {asambleaSeleccionada.horaCierreQuorum}
                </Typography> 
                </div>
                }

                </div>          
              }
            { value === 2 &&
              <div>
                <Button onClick={exportPDFListadoVotaciones} color="primary"  size="small" style={{marginRight:50}}>
                Imprimir Votación
                </Button>    
              </div>          
              }   
            { value === 3 &&
              <div>

                {asambleaSeleccionada.acta && 
                <Button onClick={getPictureActa} color="primary"  size="small" style={{marginRight:50}}>
                Imprimir Acta
                </Button> 
                }                   

              </div>          
              }                         
              <Button onClick={handleClose} color="secondary" >
                Salir
              </Button>
            </DialogActions>
          </Dialog>
  
  
          <Dialog open={openCrearAsamblea} onClose={handleCloseCrearAsamblea} aria-labelledby="form-dialog-title"  maxWidth = 'lg'  >          
            <DialogTitle id="form-dialog-title">Crear nueva asamblea</DialogTitle>
            <DialogContent style={{height: '400px', width:'600px' }}>
  
            <div style={{display:'flex', flexDirection:'row', alignItems: 'flex-start', justifyContent:'space-between', width:'100%', }}>
            

                <div style={{display:'flex', flexDirection:'column', alignItems: 'flex-start', justifyContent:'space-between', width:'90%', }}>

                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Tipo de Asamblea</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={
                                formData.tipo != '' ? tipoDeAsamblea.find(o => o.label === formData.tipo).value : ''
                                }
                            label="Tipo Asamblea"
                            onChange={handleChangeTipoAsamblea}
                        >
                            <MenuItem value={"1"}>Ordinaria</MenuItem>
                            <MenuItem value={"2"}>Extraordinaria</MenuItem>

                        </Select>
                    </FormControl>
                    <TextField
                                id="outlined-required"
                                label="Lugar"
                                value={formData.lugar}
                                onChange={handleLugarChange}
                                fullWidth
                            /> 
                    <TextField
                                id="outlined-required"
                                label="Link"
                                value={formData.link}
                                onChange={handleLinkChange}
                                fullWidth
                            /> 
                    <FormControl fullWidth style={{paddingTop:10}}>
                        <TextField
                            size='small'
                            id="datetime-local"
                            label="Fecha"
                            type="date"
                            defaultValue={Date.now()}
                            variant="standard"
                            InputLabelProps={{
                                shrink: true,
                            }}     
                            value={formData.fecha.split(" ")[0].split("-").reverse().join("-")}
                            onChange={handleChangeFecha}     
                            fullWidth='false'          
                        />
                    </FormControl>
                    <FormControl fullWidth style={{paddingTop:10, marginBottom:20}}>
                        <TextField
                            size='small'
                            id="time-local"
                            label="Hora"
                            type="time"
                            defaultValue={Date.now()}
                            variant="standard"
                            InputLabelProps={{
                                shrink: true,
                            }}    
                            value={formData.hora}
                            onChange={handleChangeHora}                      
                        />
                    </FormControl>
                    <label htmlFor="upload-photo1">
                    <input style={{ display: 'none' }} id="upload-photo1" name="upload-photo1" type="file" onChange={onChangeOD} />
                    <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='medium' style={{textTransform: 'none',}}>Orden del día</Button>
                    {formData.ordenDia.length > 0 && <IconButton ><CheckIcon /></IconButton>}
                    </label>
                </div>

                <div style={{display:'flex', flexDirection:'column', alignItems: 'flex-start', justifyContent:'space-between', width:'100%', }}>                
                <Grid container direction='column' justifyContent= 'flex-start' style={{backgroundColor:'#f9f9f9', padding:20, borderRadius: 10, marginLeft: 20, marginRight: 20}}>
                    Votación
                    <FormControl >
                        <InputLabel id="demo-simple-select-label"># Temas de votación</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={nroVotaciones}
                            label="Tipo Asamblea"
                            onChange={handleChangeNroVotaciones}
                        >
                            <MenuItem value={"0"}>0</MenuItem>
                            <MenuItem value={"1"}>1</MenuItem>
                            <MenuItem value={"2"}>2</MenuItem>
                            <MenuItem value={"3"}>3</MenuItem>
                            <MenuItem value={"4"}>4</MenuItem>
                            <MenuItem value={"5"}>5</MenuItem>
                            <MenuItem value={"6"}>6</MenuItem>
                            <MenuItem value={"7"}>7</MenuItem>
                            <MenuItem value={"8"}>8</MenuItem>                            
                            <MenuItem value={"9"}>9</MenuItem>
                            <MenuItem value={"10"}>10</MenuItem>                            
                        </Select>
                    </FormControl>

                    {nroVotaciones>=1 && <TextField id="outlined-required1" label="Tema 1" value={formData.votacionTema1} onChange={handleTemaVotacionChange1} fullWidth /> }
                    {nroVotaciones>=2 && <TextField id="outlined-required2" label="Tema 2" value={formData.votacionTema2} onChange={handleTemaVotacionChange2} fullWidth /> }
                    {nroVotaciones>=3 && <TextField id="outlined-required3" label="Tema 3" value={formData.votacionTema3} onChange={handleTemaVotacionChange3} fullWidth /> }
                    {nroVotaciones>=4 && <TextField id="outlined-required4" label="Tema 4" value={formData.votacionTema4} onChange={handleTemaVotacionChange4} fullWidth /> }
                    {nroVotaciones>=5 && <TextField id="outlined-required5" label="Tema 5" value={formData.votacionTema5} onChange={handleTemaVotacionChange5} fullWidth /> }
                    {nroVotaciones>=6 && <TextField id="outlined-required6" label="Tema 6" value={formData.votacionTema6} onChange={handleTemaVotacionChange6} fullWidth /> }
                    {nroVotaciones>=7 && <TextField id="outlined-required7" label="Tema 7" value={formData.votacionTema7} onChange={handleTemaVotacionChange7} fullWidth /> }
                    {nroVotaciones>=8 && <TextField id="outlined-required8" label="Tema 8" value={formData.votacionTema8} onChange={handleTemaVotacionChange8} fullWidth /> }
                    {nroVotaciones>=9 && <TextField id="outlined-required9" label="Tema 9" value={formData.votacionTema9} onChange={handleTemaVotacionChange9} fullWidth /> }
                    {nroVotaciones>=10 && <TextField id="outlined-required10" label="Tema 10" value={formData.votacionTema10} onChange={handleTemaVotacionChange10} fullWidth /> }


                </Grid>

                </div>

            </div>

  
            </DialogContent>
            <DialogActions>
            <Button                
                variant="contained"
                color="primary"
                className={classes.button}
                size='small'
                onClick={ addAsamblea }
                style={{textTransform: 'none'}}
            >
                Crear Asamblea
            </Button>   
              <Button onClick={handleCloseCrearAsamblea} color="secondary" style={{textTransform: 'none'}}>
                Salir
              </Button>
            </DialogActions>
          </Dialog>

          {circular && <CircularProgress />}
        <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
            <Alert onClose={handleCloseSnack} severity="success">
            Se registró correctamente la asamblea.
        </Alert>
      </Snackbar>
           
        </Grid>
      </main>
  


    );
}