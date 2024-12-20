import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { makeStyles } from '@material-ui/core/styles';
import { createTheme } from '@material-ui/core/styles';
import { listAccionistas, getParametro, listAccionistaArchives, listOperaciones, accionistaArchiveByFecha } from '../graphql/queries';
import { createAccionistaArchive, createParametroArchive } from './../graphql/mutations';

import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';

import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import DevicesOutlinedIcon from '@material-ui/icons/DevicesOutlined';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';

import Grid from '@material-ui/core/Grid';

import { Tooltip, Chip, Button } from '@material-ui/core';

import { styled } from '@material-ui//styles';
import { AddCommentRounded } from '@material-ui/icons';

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


      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    </div>

  );
}


export default function AccionistasHistorico() {


  const [cantidadEmitido, setCantidadEmitido] = useState(1);

  function getParticipacion(params) {
    return `${(params.getValue(params.id, 'cantidadAcciones') * 100 / cantidadEmitido).toFixed(15) || ''} `;
  }

  let columns = []

  columns = [
    //{ field: 'id', headerName: 'Nro', width: 80, type: 'number',},
    {
      field: 'secuencial',
      headerName: 'Nro',
      type: 'number',
      width: 50,
      //filterable: false,        
      //renderCell:(index) => index.api.getRowIndex(index.row.id) + 1
    },
    {
      field: 'identificacion',
      headerName: 'Identificacion',
      width: 120,
    },
    {
      field: 'decevale',
      headerName: 'Decevale',
      width: 90,
    },
    {
      field: 'nombre2',
      headerName: 'Nombre',
      width: 250,
      flex: 1,
    },
    {
      field: 'paisNacionalidad',
      headerName: 'Nacionalidad',
      width: 110,
    },
    {
      field: 'direccionPais',
      headerName: 'Residencia',
      width: 110,
    },
    {
      field: 'cantidadAcciones',
      headerName: 'Acciones',
      //type: 'number',
      width: 100,
      align: "right",
    },
    {
      field: 'participacion',
      headerName: 'Participación',
      type: 'number',
      width: 100,
      valueGetter: getParticipacion,
    },
    {
      field: 'tipoAcciones',
      headerName: 'Tipo',
      width: 70,
      renderCell: (cellValues) => {
        return cellValues.row.tipoAcciones == "D" ?
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
      field: 'estado',
      headerName: 'Estado',
      width: 110,
      renderCell: (cellValues) => {
        return <Chip size="small" variant="outlined" label={cellValues.row.estado} color={cellValues.row.estado == 'Activo' ? 'primary' : 'secondary'} />
      }
    },

  ];

  const [accionistas, setAccionistas] = useState([]);
  const [parametros, setParametros] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [rows, setRows] = useState([]);


  useEffect(() => {

    fetchParametros();
    fetchAccionistas();

    fetchOperaciones();


  }, []);


  async function fetchParametros() {

    const apiData = await API.graphql({ query: getParametro, variables: { id: '1' } });

    const parametrosFromAPI = apiData.data.getParametro;

    setParametros(parametrosFromAPI);
    setCantidadEmitido(parametrosFromAPI.cantidadEmitida);
  }

  async function fetchAccionistas() {

    const filter = {
      estado: {
        //eq: estado
        ne: "Eliminado"
      },
    }

    //      const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 10000} });
    const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 10000 } });
    const accionistasFromAPI = apiData.data.listAccionistas.items;

    let numero = 1;
    let nombre_aux = '';
    accionistasFromAPI.forEach(function (obj) {
      nombre_aux = obj.tipoPersona == 'PN' ? obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno + " " + obj.pn_primerNombre + " " + obj.pn_segundoNombre : obj.nombre;
      obj.nombre2 = nombre_aux.toUpperCase();
    });

    setAccionistas(accionistasFromAPI.sort(function (a, b) {
      if (a.nombre2 > b.nombre2) {
        return 1;
      }
      if (a.nombre2 < b.nombre2) {
        return -1;
      }
      // a must be equal to b
      return 0;
    }));

    accionistasFromAPI.forEach(function (obj) {

      obj.secuencial = numero++;
    });
    /*
          const filter2 = {
            estado: {
              //eq: estado
              ne: "Inactivo"
            },        
          fecha: {
            eq: fechaConsulta
          }
          }  
    
    
          const apiData2 = await API.graphql({ query: listAccionistaArchives, variables: { filter: filter2, limit: 10000} });
          const accionistasFromAPI2 = apiData2.data.listAccionistaArchives.items;
    
    
          let numero2 = 1;
          let nombre_aux2 = '';
          accionistasFromAPI2.forEach(function (obj) {        
            nombre_aux2 = obj.tipoPersona == 'PN' ? obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno + " " + obj.pn_primerNombre + " " + obj.pn_segundoNombre : obj.nombre;
            obj.nombre2 = nombre_aux2.toUpperCase();
          });
    
          accionistasFromAPI2.forEach(function (obj) {        
            obj.secuencial = numero2++;
          });
    
          setRows(accionistasFromAPI2);
            */
    console.log("Cantidad de Accionistas", accionistas.length)
  }

  const requestSearch = (searchValue) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
    const filteredRows = accionistas.filter((row) => {
      return Object.keys(row).some((field) => {
        //if (row[field] != null) {
        return row[field] && searchRegex.test(row[field].toString());
        //}

      });
    });
    setRows(filteredRows);
  };

  const [fechas, setFechas] = useState([]);

  async function fetchOperaciones() {

    //console.log('entro de nuevo ??', 'SIIII')

    let arrayFechas = []

    let filter = {
      estado: {
        eq: 'Aprobada' // filter priority = 1
      },

    };

    const apiData = await API.graphql({ query: listOperaciones, variables: { filter: filter, limit: 10000 }, });
    const operacionesFromAPI = apiData.data.listOperaciones.items;


    operacionesFromAPI.sort(function (b, a) {
      if (new Date(+a.fecha.split("-")[2], a.fecha.split("-")[1] - 1, +a.fecha.split("-")[0]) > new Date(+b.fecha.split("-")[2], b.fecha.split("-")[1] - 1, +b.fecha.split("-")[0])) return 1;
      if (new Date(+a.fecha.split("-")[2], a.fecha.split("-")[1] - 1, +a.fecha.split("-")[0]) < new Date(+b.fecha.split("-")[2], b.fecha.split("-")[1] - 1, +b.fecha.split("-")[0])) return -1;
      return 0;
    });


    operacionesFromAPI.forEach(function (obj) {

      //obj.nombre2 = obj.tipoPersona == 'PN' ? obj.pn_primerNombre + " " + obj.pn_segundoNombre + " " + obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno : obj.nombre;
      //nombre_aux = obj.tipoPersona == 'PN' ? obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno + " " + obj.pn_primerNombre + " " + obj.pn_segundoNombre : obj.nombre;
      obj.cedente = obj.cedente.toUpperCase();
      obj.cesionario = obj.cesionario.toUpperCase();

      //var newdate = date.split("-").reverse().join("-");

      arrayFechas.push(obj.fecha.split("-").reverse().join("-"));

    });

    setFechas(arrayFechas);
    console.log("Set de Fechas", arrayFechas)

  }

  function newFindClosest(dates, testDate) {
    var before = [];
    var after = [];
    var max = dates.length;
    for (var i = 0; i < max; i++) {
      var tar = dates[i];

      //var arrDate = new Date(tar.day_year, tar.day_month, tar.day_number);
      var arrDate = new Date(tar);
      var fechaConsultada = new Date(testDate);
      console.log('resultado antes 1', testDate);
      console.log('resultado antes 2', fechaConsultada);

      //console.log('resultado antes',fechaConsultada);
      var fechaConsultada2 = fechaConsultada.setHours(fechaConsultada.getHours() + 5);

      if (arrDate.getHours() > 0) arrDate.setHours(arrDate.getHours() + 5);
      //console.log('resultado despues',fechaConsultada,arrDate,(arrDate - fechaConsultada2) );
      //var fechaConsultada2 = removeTime(fechaConsultada);
      //var fechaConsultada2 = new Date(fechaConsultada.getFullYear(), fechaConsultada.getMonth(), fechaConsultada.getDate());

      //var fechaConsultada = new Date(Date.UTC(testDate.getFullYear(), testDate.getMonth(), testDate.getDate()));
      // 3600 * 24 * 1000 = calculating milliseconds to days, for clarity.
      //var diff = (arrDate - new Date(testDate)) / (3600 * 24 * 1000);
      var diff = (arrDate - fechaConsultada2);

      //console.log('resultado',fechaConsultada,tar,fechaConsultada.setHours(fechaConsultada.getHours() + 5),arrDate)
      if (diff > 0) {
        before.push({ diff: diff, index: i, fecha: arrDate });
      } else {
        after.push({ diff: diff, index: i, fecha: arrDate });
      }
    }
    before.sort(function (a, b) {
      if (a.diff < b.diff) {
        return -1;
      }
      if (a.diff > b.diff) {
        return 1;
      }
      return 0;
    });

    after.sort(function (a, b) {
      if (a.diff > b.diff) {
        return -1;
      }
      if (a.diff < b.diff) {
        return 1;
      }
      return 0;
    });

    //console.log('AFTER',after);

    const closest = Math.min(...after.map(o => o.index));

    return dates[closest];
    //return {Math.max.apply(Math, after.map(function(o) { return o.index; }))};
    //return {after.reduce((prev, current) => (prev.y > current.y) ? prev : current)};
    //return {datesBefore: before, datesAfter: after};
  }

  const consultarLibro = async () => {
    try {
      console.log('Fecha a Consultar', fechaConsulta);

      const fechaPasada = new Date(newFindClosest(fechas, fechaConsulta));

      if (fechaPasada.getHours() > 0) fechaPasada.setHours(fechaPasada.getHours() + 5);

      const MyDateString = fechaPasada.getFullYear() + '-'
        + ('0' + (fechaPasada.getMonth() + 1)).slice(-2) + '-'
        + ('0' + fechaPasada.getDate()).slice(-2);

      //console.log('Fecha Encontrada 1', fechaPasada);
      console.log('Fecha Encontrada', MyDateString);

      const filter = {
        fecha: {
          eq: MyDateString
        },
        estado: {
          eq: "Activo"
          //ne: "Inactivo"
        },

      }

      //console.log("fecha pasada", filter);
      let apiData3 = await API.graphql({ query: listAccionistaArchives, variables: { filter: filter, limit: 20000 } });
      let accionistasFromAPI3 = apiData3.data.listAccionistaArchives.items;

      if (MyDateString == "2023-09-28") {
        const filterAux = {
          estado: {
            eq: "Activo"
            //ne: "Inactivo"
          },

        }
        apiData3 = await API.graphql({ query: listAccionistas, variables: { filter: filterAux, limit: 20000 } });
        accionistasFromAPI3 = apiData3.data.listAccionistas.items;

        let nexttoken4 = null
        if (apiData3.data.listAccionistas.nextToken != null) {
          const apiData4 = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 20000, nextToken: apiData3.data.listAccionistas.nextToken } });
          const accionistasFromAPI4 = apiData4.data.listAccionistas.items;
          accionistasFromAPI3 = accionistasFromAPI3.concat(accionistasFromAPI4);
          console.log("Registros 2", accionistasFromAPI3.length);
          if (apiData4.data.listAccionistas.nextToken != null) nexttoken4 = apiData4.data.listAccionistas.nextToken
        }

        if (nexttoken4 != null) {
          const apiData5 = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit: 20000, nextToken: nexttoken4 } });
          const accionistasFromAPI5 = apiData5.data.listAccionistas.items;
          accionistasFromAPI3 = accionistasFromAPI3.concat(accionistasFromAPI5);
          console.log("Registros 3", accionistasFromAPI3.length);
          //console.log("Buscar TOKEN 3", apiData5.data.listAccionistaArchives.nextToken);
          //if(apiData4.data.listAccionistaArchives.nextToken != null) nexttoken4 ? true
        }



      }

      //console.log("Buscar TOKEN 1", apiData3.data.listAccionistaArchives.nextToken);
      else {
        console.log("Registros 1", accionistasFromAPI3.length);

        let nexttoken4 = null
        if (apiData3.data.listAccionistaArchives.nextToken != null) {
          const apiData4 = await API.graphql({ query: listAccionistaArchives, variables: { filter: filter, limit: 20000, nextToken: apiData3.data.listAccionistaArchives.nextToken } });
          const accionistasFromAPI4 = apiData4.data.listAccionistaArchives.items;
          accionistasFromAPI3 = accionistasFromAPI3.concat(accionistasFromAPI4);
          console.log("Registros 2", accionistasFromAPI3.length);
          //console.log("Buscar TOKEN 2", apiData4.data.listAccionistaArchives.nextToken);
          if (apiData4.data.listAccionistaArchives.nextToken != null) nexttoken4 = apiData4.data.listAccionistaArchives.nextToken
        }

        if (nexttoken4 != null) {
          const apiData5 = await API.graphql({ query: listAccionistaArchives, variables: { filter: filter, limit: 20000, nextToken: nexttoken4 } });
          const accionistasFromAPI5 = apiData5.data.listAccionistaArchives.items;
          accionistasFromAPI3 = accionistasFromAPI3.concat(accionistasFromAPI5);
          console.log("Registros 3", accionistasFromAPI3.length);
          //console.log("Buscar TOKEN 3", apiData5.data.listAccionistaArchives.nextToken);
          //if(apiData4.data.listAccionistaArchives.nextToken != null) nexttoken4 ? true
        }

      }
      let numero2 = 1;
      let nombre_aux2 = '';
      let cantidadTotal = 0;
      accionistasFromAPI3.forEach(function (obj) {
        nombre_aux2 = obj.tipoPersona == 'PN' ? obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno + " " + obj.pn_primerNombre + " " + obj.pn_segundoNombre : obj.nombre;
        obj.nombre2 = nombre_aux2.toUpperCase();
        cantidadTotal = cantidadTotal + obj.cantidadAcciones;
        obj.secuencial = numero2++;
      });

      //accionistasFromAPI3.forEach(function (obj) {        
      //  obj.secuencial = numero2++;
      //});

      setRows(accionistasFromAPI3);
      setCantidadEmitido(cantidadTotal);

      console.log("Cantidad Emitida", cantidadTotal);



    } catch (err) {
      console.log('error creating transaction:', err)
    }
  }


  const copiarLibro = async () => {
    try {

      //console.log('Fechas', inicio, fin);

      //const inicio = '2021-11-30'
      //const FOperaciones = '30-11-2021'

      const inicio = '2021-01-06'
      const FOperaciones = '06-01-2021'

      const filter = {
        fecha: {
          eq: inicio
        },
        estado: {
          ne: "Inactivo"
        },

      }

      //console.log("fecha pasada", filter);
      const apiData3 = await API.graphql({ query: listAccionistaArchives, variables: { filter: filter, limit: 10000 } });
      let accionistasFromAPI3 = apiData3.data.listAccionistaArchives.items;

      //console.log("Buscar TOKEN", apiData3.data.listAccionistaArchives.nextToken);

      console.log("Registros", accionistasFromAPI3.length);


      let nexttoken4 = null
      if (apiData3.data.listAccionistaArchives.nextToken != null) {
        const apiData4 = await API.graphql({ query: listAccionistaArchives, variables: { filter: filter, limit: 20000, nextToken: apiData3.data.listAccionistaArchives.nextToken } });
        const accionistasFromAPI4 = apiData4.data.listAccionistaArchives.items;
        accionistasFromAPI3 = accionistasFromAPI3.concat(accionistasFromAPI4);
        console.log("Registros 2", accionistasFromAPI3.length);
        //console.log("Buscar TOKEN 2", apiData4.data.listAccionistaArchives.nextToken);
        if (apiData4.data.listAccionistaArchives.nextToken != null) nexttoken4 = apiData4.data.listAccionistaArchives.nextToken
      }

      if (nexttoken4 != null) {
        const apiData5 = await API.graphql({ query: listAccionistaArchives, variables: { filter: filter, limit: 20000, nextToken: nexttoken4 } });
        const accionistasFromAPI5 = apiData5.data.listAccionistaArchives.items;
        accionistasFromAPI3 = accionistasFromAPI3.concat(accionistasFromAPI5);
        console.log("Registros 3", accionistasFromAPI3.length);
        //console.log("Buscar TOKEN 3", apiData5.data.listAccionistaArchives.nextToken);
        //if(apiData4.data.listAccionistaArchives.nextToken != null) nexttoken4 ? true
      }


      /*
                if(apiData3.data.listAccionistaArchives.nextToken != null)
                {
                const apiData4 = await API.graphql({query: listAccionistaArchives, variables: { filter: filter, limit: 10000, nextToken: apiData3.data.listAccionistaArchives.nextToken} });
                const accionistasFromAPI4 = apiData4.data.listAccionistaArchives.items;
                accionistasFromAPI3 = accionistasFromAPI3.concat(accionistasFromAPI4);
                //console.log("Registros",accionistasFromAPI3.length);
                }
      */
      //console.log("Buscar TOKEN", apiData4.data.listAccionistaArchives.nextToken);

      //const apiData3 = await API.graphql({query: accionistaArchiveByFecha, variables: { filter: filter, limit: 10000} });
      //const accionistasFromAPI3 = apiData3.data.accionistaArchiveByFecha;

      //console.log("Registros",accionistasFromAPI3.length);
      //console.log("Registros",accionistasFromAPI4.length);

      let numero2 = 1;
      let nombre_aux2 = '';
      let cantidadTotal = 0;
      accionistasFromAPI3.forEach(function (obj) {
        nombre_aux2 = obj.tipoPersona == 'PN' ? obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno + " " + obj.pn_primerNombre + " " + obj.pn_segundoNombre : obj.nombre;
        obj.nombre2 = nombre_aux2.toUpperCase();
        //if (obj.estado = 'Activo') cantidadTotal = cantidadTotal + obj.cantidadAcciones;
        cantidadTotal = cantidadTotal + obj.cantidadAcciones;
        obj.secuencial = numero2++;
      });


      const filter2 = {
        fecha: {
          eq: FOperaciones
        },
        estado: {
          eq: 'Aprobada'
        }
      }
      const apiData5 = await API.graphql({ query: listOperaciones, variables: { filter: filter2, limit: 10000 } });
      let operacionesFromAPI5 = apiData5.data.listOperaciones.items;
      console.log("Operaciones ", operacionesFromAPI5);

      //  update por cada operaciones
      //operacionesFromAPI5.forEach(function (obj) {        
      //  update por cada operaciones
      //});

      //copiar inventario a la siguiente fecha

      //actualizar acciones siguiente fecha


      console.log("Registros", accionistasFromAPI3.length);
      console.log("Cantidad Emitida", cantidadTotal);
      // console.log("Operaciones",operacionesFromAPI5);


    } catch (err) {
      console.log('error creating transaction:', err)
    }
  }



  const addCorteLibro = async () => {
    try {

      const transferir = accionistas.map(function (e) {
        return {
          fecha: fechaConsulta,
          //id: e.id,
          tipoIdentificacion: e.tipoIdentificacion,
          identificacion: e.identificacion,
          nombre: e.nombre,
          cantidadAcciones: e.cantidadAcciones,
          participacion: e.participacion,
          tipoAcciones: e.tipoAcciones,
          estado: e.estado,
          tipoPersona: e.tipoPersona,
          pn_primerNombre: e.pn_primerNombre,
          pn_segundoNombre: e.pn_segundoNombre,
          pn_apellidoPaterno: e.pn_apellidoPaterno,
          pn_apellidoMaterno: e.pn_apellidoMaterno,
          decevale: e.decevale,
          direccionPais: e.direccionPais,
          paisNacionalidad: e.paisNacionalidad,
        };
      })

      console.log("Accionistas a Copiar", transferir)

      Promise.all(
        transferir.map(input => API.graphql(graphqlOperation(createAccionistaArchive, { input: input })))
      ).then(values => {
        console.log('éxito creating transaction:')
      });


    } catch (err) {
      console.log('error creating transaction:', err)
    }
  }


  const addCorteParametro = async () => {
    try {
      console.log("PARAMETROS", parametros);
      /*
                  const transferir = parametros.map(function(e) {
                    return {
                      fecha: '2022-12-31',
                      id: e.id,
                      moneda: e.moneda,
                      cantidadEmitida: e.cantidadEmitida,
                      valorNominal: e.valorNominal,
                      baseImponible: e.baseImponible,
                      noResidente: e.noResidente,
                      IGdesde1: e.IGdesde1,
                      IGhasta1: e.IGhasta1,
                      FBretencion1: e.FBretencion1,
                      FEretencion1: e.FEretencion1,
                      IGdesde2: e.IGdesde2,
                      IGhasta2: e.IGhasta2,
                      FBretencion2: e.FBretencion2,
                      FEretencion2: e.FEretencion2,
                      IGdesde3: e.IGdesde3,
                      IGhasta3: e.IGhasta3,
                      FBretencion3: e.FBretencion3,
                      FEretencion3: e.FEretencion3,
                      IGdesde4: e.IGdesde4,
                      IGhasta4: e.IGhasta4,
                      FBretencion4: e.FBretencion4,
                      FEretencion4: e.FEretencion4,
                      IGdesde5: e.IGdesde5,
                      IGhasta5: e.IGhasta5,
                      FBretencion5: e.FBretencion5,
                      FEretencion5: e.FEretencion5,
                      IGdesde6: e.IGdesde6,
                      IGhasta6: e.IGhasta6,
                      FBretencion6: e.FBretencion6,
                      FEretencion6: e.FEretencion6,  
                      Retencion_Minima: e.Retencion_Minima,
                      Retencion_Maxima: e.Retencion_Maxima,
                      Retencion_PN_Loc: e.Retencion_PN_Loc,
                      Retencion_PN_NPF: e.Retencion_PN_NPF,
                      Retencion_PN_PF: e.Retencion_PN_PF,
                      Retencion_PJ_Loc_Loc: e.Retencion_PJ_Loc_Loc,
                      Retencion_PJ_Loc_NPF: e.Retencion_PJ_Loc_NPF,
                      Retencion_PJ_Loc_PF: e.Retencion_PJ_Loc_PF,
                      Retencion_PJ_PF_Loc: e.Retencion_PJ_PF_Loc,
                      Retencion_PJ_PF_NPF: e.Retencion_PJ_PF_NPF,
                      Retencion_PJ_PF_PF: e.Retencion_PJ_PF_PF,
                      Retencion_PJ_NPF_Loc: e.Retencion_PJ_NPF_Loc,
                      Retencion_PJ_NPF_NPF: e.Retencion_PJ_NPF_NPF,
                      Retencion_PJ_NPF_PF: e.Retencion_PJ_NPF_PF,
                      modeloCartaCesion: e.modeloCartaCesion,
                      modeloCartaGerente: e.modeloCartaGerente,
                      modeloCartaInstrucciones: e.modeloCartaInstrucciones,
                      } ;
                  })
      
      */
      const transferir =
      {
        fecha: fechaConsulta,
        id: parametros.id,
        moneda: parametros.moneda,
        cantidadEmitida: parametros.cantidadEmitida,
        valorNominal: parametros.valorNominal,
        baseImponible: parametros.baseImponible,
        noResidente: parametros.noResidente,
        IGdesde1: parametros.IGdesde1,
        IGhasta1: parametros.IGhasta1,
        FBretencion1: parametros.FBretencion1,
        FEretencion1: parametros.FEretencion1,
        IGdesde2: parametros.IGdesde2,
        IGhasta2: parametros.IGhasta2,
        FBretencion2: parametros.FBretencion2,
        FEretencion2: parametros.FEretencion2,
        IGdesde3: parametros.IGdesde3,
        IGhasta3: parametros.IGhasta3,
        FBretencion3: parametros.FBretencion3,
        FEretencion3: parametros.FEretencion3,
        IGdesde4: parametros.IGdesde4,
        IGhasta4: parametros.IGhasta4,
        FBretencion4: parametros.FBretencion4,
        FEretencion4: parametros.FEretencion4,
        IGdesde5: parametros.IGdesde5,
        IGhasta5: parametros.IGhasta5,
        FBretencion5: parametros.FBretencion5,
        FEretencion5: parametros.FEretencion5,
        IGdesde6: parametros.IGdesde6,
        IGhasta6: parametros.IGhasta6,
        FBretencion6: parametros.FBretencion6,
        FEretencion6: parametros.FEretencion6,
        Retencion_Minima: parametros.Retencion_Minima,
        Retencion_Maxima: parametros.Retencion_Maxima,
        Retencion_PN_Loc: parametros.Retencion_PN_Loc,
        Retencion_PN_NPF: parametros.Retencion_PN_NPF,
        Retencion_PN_PF: parametros.Retencion_PN_PF,
        Retencion_PJ_Loc_Loc: parametros.Retencion_PJ_Loc_Loc,
        Retencion_PJ_Loc_NPF: parametros.Retencion_PJ_Loc_NPF,
        Retencion_PJ_Loc_PF: parametros.Retencion_PJ_Loc_PF,
        Retencion_PJ_PF_Loc: parametros.Retencion_PJ_PF_Loc,
        Retencion_PJ_PF_NPF: parametros.Retencion_PJ_PF_NPF,
        Retencion_PJ_PF_PF: parametros.Retencion_PJ_PF_PF,
        Retencion_PJ_NPF_Loc: parametros.Retencion_PJ_NPF_Loc,
        Retencion_PJ_NPF_NPF: parametros.Retencion_PJ_NPF_NPF,
        Retencion_PJ_NPF_PF: parametros.Retencion_PJ_NPF_PF,
        modeloCartaCesion: parametros.modeloCartaCesion,
        modeloCartaGerente: parametros.modeloCartaGerente,
        modeloCartaInstrucciones: parametros.modeloCartaInstrucciones,
      };


      const operID = await API.graphql(graphqlOperation(createParametroArchive, { input: transferir }))
      /*
              Promise.all(
                transferir.map(input => API.graphql(graphqlOperation(createParametroArchive, { input: input })))
              ).then(values => {          
                  console.log('éxito creating transaction:')
              });*/




    } catch (err) {
      console.log('error creating transaction:', err)
    }
  }




  const classes = useStyles();

  const today = new Date();
  //const fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' +  today.getFullYear();
  const fecha = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

  const MyDateString = today.getFullYear() + '-'
    + ('0' + (today.getMonth() + 1)).slice(-2) + '-'
    + ('0' + today.getDate()).slice(-2);

  const [fechaConsulta, setFechaConsulta] = useState(MyDateString);
  const handleChangeFechaConsulta = (event) => { setFechaConsulta(event.target.value); };


  /*
    const values = {
      someDate: "2017-05-24"
    };
  */

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Grid container spacing={3}>
        <Grid item xs={12}>


          {false &&
            <div>
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                size='medium'
                onClick={addCorteLibro}
              >
                Grabar Libro
              </Button>

              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                size='medium'
                onClick={addCorteParametro}
              >
                Grabar Parametros
              </Button>

            </div>
          }


          {false &&
            <div>
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                size='medium'
                onClick={copiarLibro}
              >
                Copiar Libro
              </Button>


            </div>
          }



          <TextField
            size='small'
            id="datetime-local"
            label="Fecha"
            //type="datetime-local"
            type="date"
            //defaultValue={Date.now()}
            //className={classes.textField}
            variant="standard"
            InputLabelProps={{
              shrink: true
            }}
            //disabled
            value={fechaConsulta}
            //label="Retención Asignada"
            onChange={handleChangeFechaConsulta}
          />

          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            size='small'
            onClick={consultarLibro}
            style={{ 'marginTop': 10, 'marginLeft': 20 }}
          >
            Consultar
          </Button>

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

      </Grid>
    </main>
  );
}