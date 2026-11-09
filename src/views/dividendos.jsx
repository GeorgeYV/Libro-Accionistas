import React, { useState, useEffect, useCallback } from 'react';
import { Auth, API } from 'aws-amplify';
import {
  Grid, Typography, Button, Chip, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import MuiAlert from '@material-ui/lab/Alert';
import PageviewIcon from '@material-ui/icons/Pageview';
import DescriptionIcon from '@material-ui/icons/Description';
import CheckIcon from '@material-ui/icons/Check';
import { getParametro } from '../graphql/queries';
import {
  listarRepartos, mapaAccionistas, detalleReparto, pagarAccionista, urlDocumento, sincronizarPendientesConTitulos,
} from '../services/repartoDividendos';
import RepartoDesdeAsamblea, { formato, enteros } from '../components/repartoDesdeAsamblea';
import DividendosAccionista from '../components/dividendosAccionista';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: { ...theme.mixins.toolbar },
  content: { flexGrow: 1, padding: theme.spacing(2) },
  button: { borderRadius: 20, textTransform: 'none' },
}));

function fechaHoy() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

function Toolbar() {
  return <GridToolbarContainer><GridToolbarExport /></GridToolbarContainer>;
}

const numero = (field, headerName, width = 120) => ({
  field, headerName, width, type: 'number', valueFormatter: (p) => formato(p.value),
});

export default function Dividendos() {
  const classes = useStyles();
  const [parametros, setParametros] = useState({ cantidadEmitida: 0, valorNominal: 0, baseImponible: 0 });
  const [repartos, setRepartos] = useState([]);
  const [accionistas, setAccionistas] = useState(new Map());
  const [repartoSeleccionado, setRepartoSeleccionado] = useState(null);
  const [filasDetalle, setFilasDetalle] = useState([]);
  const [openReparto, setOpenReparto] = useState(false);
  const [openPorAccionista, setOpenPorAccionista] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: 'success' | 'error', texto }

  const ejecutar = useCallback(async (fn) => {
    setCargando(true);
    try {
      await fn();
    } catch (err) {
      console.log('Error en dividendos:', err);
      setMensaje({ tipo: 'error', texto: err.message || 'Ocurrió un error al consultar los datos.' });
    }
    setCargando(false);
  }, []);

  const cargar = useCallback(() => ejecutar(async () => {
    const [p, lista, mapa] = await Promise.all([
      API.graphql({ query: getParametro, variables: { id: '1' } }),
      listarRepartos(),
      mapaAccionistas(),
    ]);
    setParametros(p.data.getParametro);
    setRepartos(lista);
    setAccionistas(mapa);
  }), [ejecutar]);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirDetalle = (reparto) => ejecutar(async () => {
    setFilasDetalle(await detalleReparto(reparto, accionistas));
    setRepartoSeleccionado(reparto);
  });

  const pagar = (fila) => (e) => {
    const archivo = e.target.files[0];
    e.target.value = '';
    if (!archivo) return;
    ejecutar(async () => {
      const fecha = fechaHoy();
      const { documento, pagado } = await pagarAccionista(repartoSeleccionado, fila, archivo, fecha);
      const reparto = { ...repartoSeleccionado, ddiv_dividendo: pagado, saldo: Math.round((repartoSeleccionado.monto - pagado) * 100) / 100 };
      setRepartoSeleccionado(reparto);
      setRepartos((lista) => lista.map((r) => (r.id === reparto.id ? reparto : r)));
      setFilasDetalle((filas) => filas.map((f) => (f.id === fila.id
        ? { ...f, fechaPago: fecha, documento, estado: 'Pagado', porPagar: 0, dividendoPendiente: 0, tramos: [] } : f)));
      setMensaje({ tipo: 'success', texto: `Pago registrado para ${fila.nombre || fila.identificacion}.` });
    });
  };

  const sincronizar = () => ejecutar(async () => {
    const cambios = await sincronizarPendientesConTitulos();
    setMensaje({ tipo: 'success', texto: cambios ? `Se actualizaron ${cambios} tramos pendientes.` : 'Los dividendos pendientes ya coinciden con los dueños actuales.' });
    if (cambios) await cargar();
  });

  const verDocumento = (documento) => ejecutar(async () => { window.open(await urlDocumento(documento)); });

  const columnasRepartos = [
    { field: 'div_periodo', headerName: 'Período', width: 90 },
    { field: 'ddiv_secuencial', headerName: 'Secuencial', width: 95 },
    { field: 'div_concepto', headerName: 'Concepto', width: 120 },
    { field: 'ddiv_fecha_junta', headerName: 'Junta', width: 100 },
    { field: 'ddiv_fecha_pago', headerName: 'Pago', width: 100 },
    numero('div_dividendo', 'Dividendo período', 140),
    numero('ddiv_porcentaje', '% acordado', 100),
    numero('monto', 'Monto reparto', 130),
    numero('ddiv_dividendo', 'Pagado', 120),
    numero('saldo', 'Saldo', 120),
    {
      field: 'detalle', headerName: 'Detalle', width: 80, sortable: false,
      renderCell: (p) => <IconButton color="primary" onClick={() => abrirDetalle(p.row)}><PageviewIcon /></IconButton>,
    },
  ];

  const columnasDetalle = [
    { field: 'identificacion', headerName: 'Identificación', width: 130 },
    { field: 'persona', headerName: 'Persona', width: 90 },
    { field: 'residencia', headerName: 'Residencia', width: 100 },
    { field: 'nombre', headerName: 'Beneficiario', flex: 1, minWidth: 220 },
    { field: 'acciones', headerName: 'Acciones', type: 'number', width: 110, valueFormatter: (p) => enteros(p.value) },
    {
      field: 'capital', headerName: 'Capital', type: 'number', width: 110,
      valueGetter: (p) => p.row.acciones * (parametros.valorNominal || 0), valueFormatter: (p) => formato(p.value),
    },
    numero('dividendo', 'Dividendo', 110),
    numero('retencion', 'Retención', 110),
    numero('neto', 'Total neto', 110),
    numero('porPagar', 'Por pagar', 110),
    { field: 'fechaPago', headerName: 'Fecha de pago', width: 110 },
    { field: 'estado', headerName: 'Estado', width: 90 },
    {
      field: 'pagar', headerName: 'Pagar', width: 150, sortable: false,
      renderCell: (p) => {
        const fila = p.row;
        return (
          <>
            {fila.documento && <IconButton onClick={() => verDocumento(fila.documento)} title="Ver comprobante"><CheckIcon /></IconButton>}
            {/* Retenido: accionista o título bloqueado al corte; el pago requiere aprobación (pendiente de implementar). */}
            {fila.estado === 'Retenido' && <Chip size="small" label="Retenido" />}
            {fila.estado === 'Pendiente' && (
              <label>
                <input style={{ display: 'none' }} type="file" accept="application/pdf" onChange={pagar(fila)} />
                <Button component="span" variant="outlined" color="primary" size="small" startIcon={<DescriptionIcon />} style={{ textTransform: 'none' }}>PDF</Button>
              </label>
            )}
          </>
        );
      },
    },
  ];

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" size="small" className={classes.button} onClick={() => setOpenReparto(true)}>
            +  Reparto desde asamblea
          </Button>
          <Button variant="outlined" color="primary" size="small" className={classes.button} style={{ marginLeft: 10 }} onClick={sincronizar}>
            Sincronizar pendientes con dueños actuales
          </Button>
          <Button variant="outlined" color="primary" size="small" className={classes.button} style={{ marginLeft: 10 }} onClick={() => setOpenPorAccionista(true)}>
            Dividendos por accionista
          </Button>
          <DataGrid
            style={{ backgroundColor: 'white', marginTop: 10 }}
            density="compact"
            autoHeight
            disableColumnMenu
            rows={repartos}
            columns={columnasRepartos}
            pageSize={20}
            rowsPerPageOptions={[20]}
          />
        </Grid>
      </Grid>

      <Dialog open={!!repartoSeleccionado} onClose={() => setRepartoSeleccionado(null)} fullWidth maxWidth="xl">
        {repartoSeleccionado && (
          <DialogTitle>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography>{`${repartoSeleccionado.div_concepto}: ${repartoSeleccionado.div_periodo} - ${repartoSeleccionado.ddiv_secuencial}`}</Typography>
              <Typography>{`Dividendo del período: ${formato(repartoSeleccionado.div_dividendo)}`}</Typography>
              <Typography>{`% acordado: ${formato(repartoSeleccionado.ddiv_porcentaje)}%`}</Typography>
              <Typography>{`Monto del reparto: ${formato(repartoSeleccionado.monto)}`}</Typography>
              <Typography>{`Saldo: ${formato(repartoSeleccionado.saldo)}`}</Typography>
            </div>
          </DialogTitle>
        )}
        <DialogContent style={{ height: 500 }}>
          <DataGrid
            style={{ backgroundColor: 'white' }}
            density="compact"
            disableColumnMenu
            disableSelectionOnClick
            rows={filasDetalle}
            columns={columnasDetalle}
            pageSize={25}
            rowsPerPageOptions={[25]}
            components={{ Toolbar }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRepartoSeleccionado(null)} color="primary">Salir</Button>
        </DialogActions>
      </Dialog>

      <RepartoDesdeAsamblea
        open={openReparto}
        onClose={() => setOpenReparto(false)}
        onGuardado={() => {
          setOpenReparto(false);
          setMensaje({ tipo: 'success', texto: 'Se registró correctamente el reparto.' });
          cargar();
        }}
        usuario={Auth.user ? Auth.user.username : ''}
        cantidadEmitida={parametros.cantidadEmitida}
        sbu={parametros.baseImponible}
        valorNominal={parametros.valorNominal}
      />

      <DividendosAccionista
        open={openPorAccionista}
        onClose={() => setOpenPorAccionista(false)}
        accionistas={accionistas}
        repartos={repartos}
        fecha={fechaHoy()}
        onPagado={() => listarRepartos().then(setRepartos).catch((err) => console.log('Error al actualizar repartos:', err))}
      />

      {cargando && <CircularProgress style={{ position: 'fixed', top: '50%', left: '50%' }} />}
      <Snackbar open={!!mensaje} autoHideDuration={8000} onClose={() => setMensaje(null)}>
        {mensaje ? <MuiAlert elevation={6} variant="filled" severity={mensaje.tipo} onClose={() => setMensaje(null)}>{mensaje.texto}</MuiAlert> : <span />}
      </Snackbar>
    </main>
  );
}
