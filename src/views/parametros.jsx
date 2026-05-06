import React, { useState, useEffect } from 'react'
import { makeStyles, Paper, Grid, Button, TextField, CircularProgress, Snackbar, FormControl, InputLabel, Select, MenuItem, Typography } from '@material-ui/core'
import { API, Storage } from 'aws-amplify';
import { getParametro } from './../graphql/queries'
import { updateParametro } from './../graphql/mutations'
import MuiAlert from '@material-ui/lab/Alert';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import { uuid } from 'uuidv4';

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
}));
function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function Parametros() {

    const [cantidadEmitido, setCantidadEmitido] = useState(0);
    const [valorNominal, setValorNominal] = useState(0);
    const [baseImponible, setbaseImponible] = useState(0);
    const [retencionNoResidente, setRetencionNoResidente] = useState(0);

    const [cartaCesion, setCartaCesion] = useState('');
    const [cartaGerente, setCartaGerente] = useState('');
    const [cartaInstrucciones, setCartaInstrucciones] = useState('');
    const [solicitudDividendos, setSolicitudDividendos] = useState('');

    const [FB1, setFB1] = useState(0);
    const [FB2, setFB2] = useState(0);
    const [FB3, setFB3] = useState(0);
    const [FB4, setFB4] = useState(0);
    const [FB5, setFB5] = useState(0);
    const [FB6, setFB6] = useState(0);

    const [FE1, setFE1] = useState(0);
    const [FE2, setFE2] = useState(0);
    const [FE3, setFE3] = useState(0);
    const [FE4, setFE4] = useState(0);
    const [FE5, setFE5] = useState(0);
    const [FE6, setFE6] = useState(0);

    const [RFB1, setRFB1] = useState(0);
    const [RFB2, setRFB2] = useState(0);
    const [RFB3, setRFB3] = useState(0);
    const [RFB4, setRFB4] = useState(0);
    const [RFB5, setRFB5] = useState(0);
    const [RFB6, setRFB6] = useState(0);

    const [RFE1, setRFE1] = useState(0);
    const [RFE2, setRFE2] = useState(0);
    const [RFE3, setRFE3] = useState(0);
    const [RFE4, setRFE4] = useState(0);
    const [RFE5, setRFE5] = useState(0);
    const [RFE6, setRFE6] = useState(0);

    const [retencionMinima, setRetencionMinima] = useState(0);
    const [retencionMaxima, setRetencionMaxima] = useState(0);

    const [Retencion_PN_Loc, setRetencion_PN_Loc] = useState(0);
    const [Retencion_PN_NPF, setRetencion_PN_NPF] = useState(0);
    const [Retencion_PN_PF, setRetencion_PN_PF] = useState(0);
    const [Retencion_PJ_Loc_Loc, setRetencion_PJ_Loc_Loc] = useState(0);
    const [Retencion_PJ_Loc_NPF, setRetencion_PJ_Loc_NPF] = useState(0);
    const [Retencion_PJ_Loc_PF, setRetencion_PJ_Loc_PF] = useState(0);
    const [Retencion_PJ_PF_Loc, setRetencion_PJ_PF_Loc] = useState(0);
    const [Retencion_PJ_PF_NPF, setRetencion_PJ_PF_NPF] = useState(0);
    const [Retencion_PJ_PF_PF, setRetencion_PJ_PF_PF] = useState(0);
    const [Retencion_PJ_NPF_Loc, setRetencion_PJ_NPF_Loc] = useState(0);
    const [Retencion_PJ_NPF_NPF, setRetencion_PJ_NPF_NPF] = useState(0);
    const [Retencion_PJ_NPF_PF, setRetencion_PJ_NPF_PF] = useState(0);


    const handleCantidadEmitidoChange = (event) => {

        setCantidadEmitido(event.target.value.replace(/[^0-9]/g, ''));

    };

    const handleValorNominalChange = (event) => {

        setValorNominal(event.target.value.replace(/[^0-9.]/g, ''));

    };

    const handleBaseImponibleChange = (event) => {

        setbaseImponible(event.target.value.replace(/[^0-9.]/g, ''));

    };

    const handleRetencionNoResidenteChange = (event) => {

        setRetencionNoResidente(event.target.value.replace(/[^0-9.]/g, ''));

    };


    const classes = useStyles();
    const [circular, setCircular] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);

    useEffect(() => {
        fetchParametros();
    }, []);


    async function fetchParametros() {

        const apiData = await API.graphql({ query: getParametro, variables: { id: '1' } });

        const parametrosFromAPI = apiData.data.getParametro;

        console.log('parametrosFromAPI', parametrosFromAPI)
        setCantidadEmitido(parametrosFromAPI.cantidadEmitida);
        setValorNominal(parametrosFromAPI.valorNominal);
        setbaseImponible(parametrosFromAPI.baseImponible);
        setRetencionNoResidente(parametrosFromAPI.noResidente);

        setCartaCesion(parametrosFromAPI.modeloCartaCesion);
        setCartaGerente(parametrosFromAPI.modeloCartaGerente);
        setCartaInstrucciones(parametrosFromAPI.modeloCartaInstrucciones);
        setSolicitudDividendos(parametrosFromAPI.modeloSolicitudDividendos);

    }

    const addCantidadEmitida = async () => {
        try {

            if (!cantidadEmitido) return

            setCircular(true);

            const operID = await API.graphql({
                query: updateParametro, variables: {
                    input: {
                        id: '1', cantidadEmitida: cantidadEmitido, 
                        valorNominal: valorNominal, 
                        baseImponible: baseImponible, 
                        

                        modeloCartaCesion: cartaCesion,
                        modeloCartaGerente: cartaGerente,
                        modeloCartaInstrucciones: cartaInstrucciones,
                        modeloSolicitudDividendos: solicitudDividendos,
                    }
                }
            });

            console.log('leer carta cesion', cartaCesion)
            setCircular(false);
            setOpenSnack(true)

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


    async function onChangeCartaCesion(e) {
        if (!e.target.files[0]) {
            console.log('entro al cancelar')
            return
        }
        const file = e.target.files[0];
        const filename = uuid() + file.name;
        setCartaCesion({ filename });
        console.log('entro al carta cesion', cartaCesion)
        await Storage.put(filename, file);
    }

    async function onChangeCartaGerente(e) {
        if (!e.target.files[0]) {
            console.log('entro al cancelar')
            return
        }
        const file = e.target.files[0];
        const filename = uuid() + file.name;
        setCartaGerente({ filename });
        await Storage.put(filename, file);
    }

    async function onChangeCartaInstrucciones(e) {
        if (!e.target.files[0]) {
            console.log('entro al cancelar')
            return
        }
        const file = e.target.files[0];
        const filename = uuid() + file.name;
        setCartaInstrucciones({ filename });
        await Storage.put(filename, file);
    }

    async function onChangeSolicitudDividendos(e) {
        if (!e.target.files[0]) {
            console.log('entro al cancelar')
            return
        }
        const file = e.target.files[0];
        const filename = uuid() + file.name;
        setSolicitudDividendos({ filename });
        await Storage.put(filename, file);
    }

    return (
        <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Paper variant="outlined" className={classes.paper}>
                <Grid container>
                    <Grid item xs={12} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'normal', }}>
                        <TextField
                            id="outlined-required1"
                            label="Total Emitido"
                            value={cantidadEmitido}
                            onChange={handleCantidadEmitidoChange}
                            style={{ marginRight: 20 }}
                        />
                        <TextField
                            id="outlined-required2"
                            label="Valor Nominal"
                            value={valorNominal}
                            onChange={handleValorNominalChange}
                            style={{ marginRight: 20 }}
                        />
                        <Button onClick={addCantidadEmitida} size='small' variant='contained' color='primary' style={{ marginLeft: 20 }}>Grabar</Button>
                    </Grid>


                    <Grid item xs={12} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'normal', marginTop: '50px' }}>
                        <TextField
                            id="outlined-required3"
                            label="Salario Básico Unificado"
                            value={baseImponible}
                            onChange={handleBaseImponibleChange}
                            style={{ marginRight: 20 }}
                            type="number"
                        />
                    </Grid>

                    <Grid item xs={12} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'normal', marginTop: '50px' }}>
                        <Typography variant="body2">Modelos de Cartas</Typography>
                        <label htmlFor="upload-photo101">
                            <input style={{ display: 'none' }} id="upload-photo101" name="upload-photo101" type="file" accept='.doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' onChange={onChangeCartaCesion} />
                            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', marginLeft: 10 }}>Carta de Cesión</Button>
                        </label>
                        <label htmlFor="upload-photo102">
                            <input style={{ display: 'none' }} id="upload-photo102" name="upload-photo102" type="file" accept='.doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' onChange={onChangeCartaGerente} />
                            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', marginLeft: 10 }}>Carta de Gerente</Button>
                        </label>
                        <label htmlFor="upload-photo103">
                            <input style={{ display: 'none' }} id="upload-photo103" name="upload-photo103" type="file" accept='.doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' onChange={onChangeCartaInstrucciones} />
                            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', marginLeft: 10 }}>Carta de Instrucciones</Button>
                        </label>
                        <label htmlFor="upload-photo104">
                            <input style={{ display: 'none' }} id="upload-photo104" name="upload-photo104" type="file" accept='.doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' onChange={onChangeSolicitudDividendos} />
                            <Button startIcon={<CloudUploadOutlinedIcon />} variant='outlined' component="span" color="primary" size='small' style={{ textTransform: 'none', marginLeft: 10 }}>Solicitud de dividendos</Button>
                        </label>
                    </Grid>

                    {circular && <CircularProgress />}

                </Grid>
                <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
                    <Alert onClose={handleCloseSnack} severity="success">
                        Se registró correctamente.
                    </Alert>
                </Snackbar>
            </Paper>
        </main>
    );
}