import React, { useState, useEffect } from 'react';
import {
  Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid,
  InputLabel, LinearProgress, MenuItem, Select, TextField, Typography,
} from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { DataGrid } from '@mui/x-data-grid';
import {
  asambleasDisponibles, revisarAsamblea, obtenerPeriodo, mapaAccionistas, guardarReparto,
} from '../services/repartoDividendos';
import { calcularReparto, coberturaPeriodo } from '../utils/dividendos';

export const formato = (n) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
export const enteros = (n) => new Intl.NumberFormat('en-US').format(n || 0);

const columnas = [
  { field: 'identificacion', headerName: 'Identificación', width: 130 },
  { field: 'nombre', headerName: 'Nombre', flex: 1 },
  { field: 'acciones', headerName: 'Acciones', type: 'number', width: 110 },
  { field: 'capital', headerName: 'Capital', type: 'number', width: 110 },
  { field: 'dividendo', headerName: 'Dividendo', type: 'number', width: 120 },
  { field: 'retencion', headerName: 'Retención', type: 'number', width: 110 },
  { field: 'neto', headerName: 'A pagar', type: 'number', width: 120 },
  { field: 'estado', headerName: 'Estado', width: 100 },
];

const inicial = {
  asambleaId: '', anio: String(new Date().getFullYear() - 1), concepto: 'Resultado', dividendoTotal: '', porcentaje: '', fechaPago: '',
};

// Genera un reparto de dividendos a partir de la foto de títulos de una asamblea.
export default function RepartoDesdeAsamblea({ open, onClose, onGuardado, usuario, cantidadEmitida, sbu, valorNominal }) {
  const [form, setForm] = useState(inicial);
  const [asambleas, setAsambleas] = useState([]);
  const [revision, setRevision] = useState(null);
  const [periodo, setPeriodo] = useState(null);
  const [calculo, setCalculo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const asamblea = asambleas.find((a) => a.id === form.asambleaId);

  async function ejecutar(fn) {
    setCargando(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      console.log('Error en reparto desde asamblea:', err);
      setError(err.message || 'Ocurrió un error al consultar los datos.');
    }
    setCargando(false);
  }

  useEffect(() => {
    if (!open) return;
    setForm(inicial); setRevision(null); setPeriodo(null); setCalculo(null); setError('');
    ejecutar(async () => setAsambleas(await asambleasDisponibles()));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const cambiar = (campo) => (e) => { setForm({ ...form, [campo]: e.target.value }); setCalculo(null); };

  const elegirAsamblea = (e) => {
    const elegida = asambleas.find((a) => a.id === e.target.value);
    setForm({ ...form, asambleaId: elegida.id });
    setRevision(null); setCalculo(null);
    ejecutar(async () => setRevision(await revisarAsamblea(elegida)));
  };

  const cargarPeriodo = () => {
    setPeriodo(null); setCalculo(null);
    const anio = parseInt(form.anio, 10);
    if (!anio) return;
    ejecutar(async () => {
      const p = await obtenerPeriodo(anio);
      setPeriodo(p);
      setForm((f) => ({ ...f, porcentaje: String(Math.max(0, 100 - p.porcentajeDeclarado)) }));
    });
  };

  const existente = periodo && periodo.dividendo;
  const dividendoTotal = existente ? existente.div_dividendo : parseFloat(form.dividendoTotal);
  const accionesBase = existente ? existente.div_acciones_base : cantidadEmitida;
  const porcentajeReparto = parseFloat(form.porcentaje);
  const cobertura = periodo ? coberturaPeriodo(periodo.pagados, accionesBase) : 0;
  const puedeCalcular = asamblea && revision && revision.votacion.aprobada && revision.foto.length > 0 &&
    periodo && dividendoTotal > 0 && porcentajeReparto >= 0 && form.fechaPago;

  const calcular = () => ejecutar(async () => {
    const r = calcularReparto({
      foto: revision.foto,
      pagadosPeriodo: periodo.pagados,
      accionistas: await mapaAccionistas(),
      periodo: { dividendoTotal, accionesBase, porcentajeDeclarado: periodo.porcentajeDeclarado },
      porcentajeReparto,
      sbu: sbu || 0,
      valorNominal: valorNominal || 0,
    });
    if (r.tramos.length === 0) throw new Error('Las acciones de esta asamblea ya cobraron el porcentaje declarado.');
    setCalculo(r);
  });

  const confirmar = () => ejecutar(async () => {
    await guardarReparto({
      asamblea,
      anio: parseInt(form.anio, 10),
      concepto: form.concepto,
      dividendoTotal,
      accionesBase,
      porcentajeReparto,
      fechaPago: form.fechaPago.split('-').reverse().join('-'),
      usuario,
      periodo,
      calculo,
    });
    onGuardado();
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Reparto de dividendos desde asamblea</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="reparto-asamblea-label">Asamblea</InputLabel>
              <Select labelId="reparto-asamblea-label" value={form.asambleaId} onChange={elegirAsamblea}>
                {asambleas.map((a) => (
                  <MenuItem key={a.id} value={a.id}>{`${a.fecha} - ${a.tipo || ''} (tema ${a.temaDividendo})`}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {!cargando && asambleas.length === 0 && (
              <Typography variant="caption">No hay asambleas realizadas con tema de dividendos pendientes de reparto.</Typography>
            )}
            {revision && (
              <MuiAlert severity={revision.votacion.aprobada && revision.foto.length > 0 ? 'success' : 'error'} style={{ marginTop: 10 }}>
                {`Votación tema ${asamblea.temaDividendo}: ${enteros(revision.votacion.accionesAFavor)} de ${enteros(revision.votacion.accionesPresentes)} acciones presentes a favor — ${revision.votacion.aprobada ? 'aprobada' : 'NO aprobada'}. `}
                {`Presentes: ${revision.presentes} accionistas, ${revision.foto.length} títulos, ${enteros(revision.foto.reduce((s, f) => s + f.acciones, 0))} acciones.`}
                {revision.fotoTotal === 0 && ' La asamblea no tiene foto de títulos (se toma al cerrar el quórum).'}
                {revision.fotoTotal > 0 && revision.foto.length === 0 && ' Ningún accionista presente tiene títulos en la foto.'}
              </MuiAlert>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <TextField label="Período (año)" type="number" value={form.anio} onChange={cambiar('anio')} onBlur={cargarPeriodo} />
              <Button size="small" onClick={cargarPeriodo} style={{ marginLeft: 10, textTransform: 'none' }}>Consultar</Button>
            </div>
            {periodo && existente && (
              <div style={{ marginTop: 10 }}>
                <Typography variant="body2">{`Dividendo del período: ${formato(existente.div_dividendo)} USD — asignado: ${formato(existente.div_repartido)} USD`}</Typography>
                <Typography variant="body2">{`Declarado en ${periodo.detalles.length} reparto(s): ${formato(periodo.porcentajeDeclarado)}% — Cubierto: ${formato(cobertura * 100)}% del dividendo anual`}</Typography>
                <LinearProgress variant="determinate" value={Math.min(100, cobertura * 100)} style={{ marginTop: 5 }} />
              </div>
            )}
            {periodo && !existente && (
              <div style={{ marginTop: 10 }}>
                <Typography variant="body2">{`Período nuevo. Base: ${enteros(accionesBase)} acciones (capital ${formato(accionesBase * (valorNominal || 0))} USD).`}</Typography>
                <FormControl fullWidth style={{ marginTop: 10 }}>
                  <InputLabel id="reparto-concepto-label">Concepto</InputLabel>
                  <Select labelId="reparto-concepto-label" value={form.concepto} onChange={cambiar('concepto')}>
                    <MenuItem value="Resultado">Resultado</MenuItem>
                    <MenuItem value="Resultado VPP">Resultado VPP</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Dividendo total del período (USD)" type="number" fullWidth value={form.dividendoTotal} onChange={cambiar('dividendoTotal')} style={{ marginTop: 10 }} />
              </div>
            )}
            {periodo && (
              <TextField
                label="% del dividendo anual a repartir"
                helperText="0% solo pone al día a los accionistas que faltaron en repartos anteriores"
                type="number" fullWidth inputProps={{ min: 0, max: 100 }}
                value={form.porcentaje} onChange={cambiar('porcentaje')} style={{ marginTop: 10 }}
              />
            )}
            <TextField label="Fecha de pago" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.fechaPago} onChange={cambiar('fechaPago')} style={{ marginTop: 10 }} />
          </Grid>

          {error && <Grid item xs={12}><MuiAlert severity="error">{error}</MuiAlert></Grid>}

          {calculo && (
            <Grid item xs={12}>
              <MuiAlert severity="info" style={{ marginBottom: 10 }}>
                {`Declarado acumulado: ${formato(calculo.declarado)}% — Valor del 100% por acción: ${calculo.valorAccion.toFixed(6)} USD. `}
                {`Este reparto: ${enteros(calculo.accionesReparto)} acciones (capital ${formato(calculo.capitalReparto)} USD), ${formato(calculo.montoReparto)} USD. `}
                {`Cubierto después del reparto: ${formato(calculo.coberturaFinal * 100)}% del dividendo anual. `}
                {`Retenidos (bloqueados): ${calculo.porAccionista.filter((a) => a.estado === 'Retenido').length}.`}
              </MuiAlert>
              <div style={{ height: 400 }}>
                <DataGrid rows={calculo.porAccionista} columns={columnas} density="compact" pageSize={50} disableSelectionOnClick />
              </div>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        {cargando && <CircularProgress size={24} />}
        <Button onClick={calcular} disabled={!puedeCalcular || cargando} color="primary" variant="outlined" style={{ textTransform: 'none' }}>Calcular</Button>
        <Button onClick={confirmar} disabled={!calculo || cargando} color="primary" variant="contained" style={{ textTransform: 'none' }}>Confirmar reparto</Button>
        <Button onClick={onClose} color="secondary" style={{ textTransform: 'none' }}>Salir</Button>
      </DialogActions>
    </Dialog>
  );
}
