// Dividendos de un accionista en todos los repartos: reporte (pantalla + Excel) y pago de todo lo pendiente
// con un solo comprobante.
import React, { useState, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Paper, Typography, Chip, IconButton,
  CircularProgress, Box,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import MuiAlert from '@material-ui/lab/Alert';
import { DataGrid } from '@mui/x-data-grid';
import CheckIcon from '@material-ui/icons/Check';
import DescriptionIcon from '@material-ui/icons/Description';
import GetAppIcon from '@material-ui/icons/GetApp';
import { dividendosAccionista, pagarTodoAccionista, urlDocumento } from '../services/repartoDividendos';
import { descargarExcel } from '../services/reportes';
import { formato, enteros } from './repartoDesdeAsamblea';

const COLOR_ESTADO = { Pendiente: 'primary', Retenido: 'default', Pagado: 'secondary' };

function Total({ titulo, total, destacado }) {
  return (
    <Grid item xs={12} sm={4}>
      <Paper variant="outlined" style={{ padding: 12, textAlign: 'center', borderColor: destacado ? '#ed5761' : undefined }}>
        <Typography variant="caption" color="textSecondary">{titulo}</Typography>
        <Typography variant="h6">USD {formato(total.neto)}</Typography>
        <Typography variant="caption" color="textSecondary">
          {total.repartos} reparto(s) · bruto {formato(total.dividendo)} · retención {formato(total.retencion)}
        </Typography>
      </Paper>
    </Grid>
  );
}

const numero = (field, headerName, width = 115) => ({ field, headerName, width, type: 'number', valueFormatter: (p) => formato(p.value) });

export default function DividendosAccionista({ open, onClose, accionistas, repartos, onPagado, fecha }) {
  const [accionista, setAccionista] = useState(null);
  const [datos, setDatos] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const opciones = useMemo(() => [...accionistas.values()]
    .sort((a, b) => (a.acc_nombre_completo || '').localeCompare(b.acc_nombre_completo || '')), [accionistas]);

  async function ejecutar(fn) {
    setCargando(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      console.log('Error en dividendos por accionista:', err);
      setError(err.message || 'Ocurrió un error. Intente nuevamente.');
    }
    setCargando(false);
  }

  const elegir = (a) => {
    setAccionista(a);
    setDatos(null);
    setArchivo(null);
    setAviso('');
    if (a) ejecutar(async () => setDatos(await dividendosAccionista(a.id, repartos)));
  };

  const cerrar = () => {
    if (cargando) return;
    elegir(null);
    setError('');
    onClose();
  };

  const pagarTodo = () => ejecutar(async () => {
    const total = datos.totales.Pendiente;
    await pagarTodoAccionista(datos.filas, archivo, fecha);
    setArchivo(null);
    setAviso(`Pago registrado: ${total.repartos} reparto(s) por USD ${formato(total.neto)} con un solo comprobante.`);
    setDatos(await dividendosAccionista(accionista.id, repartos));
    onPagado();
  });

  const exportar = () => ejecutar(() => descargarExcel({
    titulo: 'Dividendos del accionista',
    subtitulo: `${accionista.acc_nombre_completo || ''} (${accionista.acc_identificacion || accionista.id}) · Por cobrar: USD ${formato(datos.totales.Pendiente.neto)}`,
    hoja: 'Dividendos',
    encabezados: ['Período', 'Secuencial', 'Concepto', 'Junta', '% acordado', 'Acciones', 'Dividendo', 'Retención', 'Neto', 'Estado', 'Fecha de pago'],
    filas: datos.filas.map((f) => [f.periodo, f.secuencial, f.concepto, f.fechaJunta, f.porcentaje, f.acciones, f.dividendo, f.retencion, f.neto, f.estado, f.fechaPago]),
    archivo: `Dividendos_${accionista.acc_identificacion || accionista.id}.xlsx`,
  }));

  const columnas = [
    { field: 'periodo', headerName: 'Período', width: 85 },
    { field: 'secuencial', headerName: 'Secuencial', width: 95 },
    { field: 'concepto', headerName: 'Concepto', width: 120 },
    { field: 'fechaJunta', headerName: 'Junta', width: 100 },
    numero('porcentaje', '% acordado', 100),
    { field: 'acciones', headerName: 'Acciones', type: 'number', width: 110, valueFormatter: (p) => enteros(p.value) },
    numero('dividendo', 'Dividendo'),
    numero('retencion', 'Retención'),
    numero('neto', 'Neto'),
    {
      field: 'estado', headerName: 'Estado', width: 105,
      renderCell: (p) => <Chip size="small" variant={p.value === 'Pendiente' ? 'default' : 'outlined'} color={COLOR_ESTADO[p.value]} label={p.value} />,
    },
    { field: 'fechaPago', headerName: 'Fecha de pago', width: 110 },
    {
      field: 'documento', headerName: '', width: 60, sortable: false,
      renderCell: (p) => (p.value
        ? <IconButton size="small" title="Ver comprobante" onClick={() => ejecutar(async () => { window.open(await urlDocumento(p.value)); })}><CheckIcon /></IconButton>
        : null),
    },
  ];

  const pendiente = datos ? datos.totales.Pendiente : null;

  return (
    <Dialog open={open} onClose={cerrar} fullWidth maxWidth="lg">
      <DialogTitle>Dividendos por accionista</DialogTitle>
      <DialogContent>
        <Autocomplete
          options={opciones}
          value={accionista}
          onChange={(e, v) => elegir(v)}
          getOptionLabel={(a) => `${a.acc_nombre_completo || ''} · ${a.acc_identificacion || a.id}`}
          getOptionSelected={(a, v) => a.id === v.id}
          disabled={cargando}
          noOptionsText="Sin coincidencias"
          renderInput={(params) => <TextField {...params} label="Accionista (nombre o identificación)" variant="outlined" size="small" />}
        />

        {error && <MuiAlert severity="error" style={{ marginTop: 12 }}>{error}</MuiAlert>}
        {aviso && <MuiAlert severity="success" style={{ marginTop: 12 }} onClose={() => setAviso('')}>{aviso}</MuiAlert>}

        {cargando && !datos && <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>}

        {datos && (
          <>
            <Grid container spacing={2} style={{ marginTop: 8 }}>
              <Total titulo="Por cobrar (neto)" total={datos.totales.Pendiente} destacado />
              <Total titulo="Retenido (requiere aprobación)" total={datos.totales.Retenido} />
              <Total titulo="Pagado" total={datos.totales.Pagado} />
            </Grid>

            {datos.filas.length === 0 ? (
              <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
                El accionista no tiene dividendos en los repartos generados.
              </Typography>
            ) : (
              <div style={{ height: 380, marginTop: 16 }}>
                <DataGrid density="compact" disableColumnMenu disableSelectionOnClick rows={datos.filas} columns={columnas}
                  pageSize={50} rowsPerPageOptions={[50]} />
              </div>
            )}

            {pendiente.repartos > 0 && (
              <Paper variant="outlined" style={{ padding: 12, marginTop: 16 }}>
                <Typography variant="subtitle2" gutterBottom>Pagar todo lo pendiente</Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Se marcarán como pagados los {pendiente.repartos} reparto(s) pendientes por USD {formato(pendiente.neto)} neto,
                  todos con el mismo comprobante y fecha {fecha}. Los retenidos no se incluyen.
                </Typography>
                <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8 }}>
                  <label>
                    <input style={{ display: 'none' }} type="file" accept="application/pdf"
                      onChange={(e) => { setArchivo(e.target.files[0] || null); e.target.value = ''; }} />
                    <Button component="span" variant="outlined" color="primary" size="small" startIcon={<DescriptionIcon />} disabled={cargando} style={{ textTransform: 'none' }}>
                      {archivo ? 'Cambiar comprobante' : 'Cargar comprobante (PDF)'}
                    </Button>
                  </label>
                  {archivo && <Typography variant="body2">{archivo.name}</Typography>}
                  <Button variant="contained" color="primary" size="small" disabled={!archivo || cargando} onClick={pagarTodo} style={{ textTransform: 'none', marginLeft: 'auto' }}
                    startIcon={cargando ? <CircularProgress size={16} color="inherit" /> : null}>
                    Registrar pago de USD {formato(pendiente.neto)}
                  </Button>
                </Box>
              </Paper>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        {datos && datos.filas.length > 0 && (
          <Button color="primary" startIcon={<GetAppIcon />} disabled={cargando} onClick={exportar} style={{ textTransform: 'none' }}>Descargar Excel</Button>
        )}
        <Button color="primary" disabled={cargando} onClick={cerrar}>Salir</Button>
      </DialogActions>
    </Dialog>
  );
}
