// Detalle de un reparto de dividendos: resumen, beneficiarios (búsqueda, pago, Excel) y cuadre contable con la fórmula.
import React, { useState, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Paper, Typography, Chip, IconButton,
  Tabs, Tab, Box, InputAdornment, LinearProgress, Table, TableHead, TableBody, TableRow, TableCell, Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import MuiAlert from '@material-ui/lab/Alert';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import CheckIcon from '@material-ui/icons/Check';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import DescriptionIcon from '@material-ui/icons/Description';
import GetAppIcon from '@material-ui/icons/GetApp';
import { formato, enteros } from './repartoDesdeAsamblea';
import { descargarExcel } from '../services/reportes';
import { cuadreReparto } from '../utils/dividendos';
import { leerReglas } from '../utils/retencion';
import { ACEPTA_PDF } from '../utils/archivos';

const useStyles = makeStyles((theme) => ({
  titulo: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: theme.spacing(1) },
  tarjeta: { padding: theme.spacing(1.5), height: '100%' },
  barra: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: theme.spacing(1.5), margin: theme.spacing(2, 0, 1) },
  formula: { backgroundColor: theme.palette.grey[50], padding: theme.spacing(1.5, 2), fontFamily: 'monospace', fontSize: 13, borderRadius: 4 },
  ok: { color: '#2e7d32' },
}));

const ESTADOS = ['Todos', 'Pendiente', 'Retenido', 'Pagado'];
const COLOR_ESTADO = { Pendiente: 'primary', Retenido: 'default', Pagado: 'secondary' };
const numero = (field, headerName, width = 115) => ({ field, headerName, width, type: 'number', valueFormatter: (p) => formato(p.value) });
const texto = (v, d = 2) => (v == null ? '—' : new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v));

function Resumen({ titulo, valor, detalle }) {
  const classes = useStyles();
  return (
    <Grid item xs={6} sm={4} md={2}>
      <Paper variant="outlined" className={classes.tarjeta}>
        <Typography variant="caption" color="textSecondary">{titulo}</Typography>
        <Typography variant="h6" noWrap>{valor}</Typography>
        {detalle && <Typography variant="caption" color="textSecondary">{detalle}</Typography>}
      </Paper>
    </Grid>
  );
}

function Formula({ paso, titulo, children, explicacion }) {
  const classes = useStyles();
  return (
    <Box mb={2}>
      <Typography variant="subtitle2">{paso}. {titulo}</Typography>
      <div className={classes.formula}>{children}</div>
      {explicacion && <Typography variant="caption" color="textSecondary">{explicacion}</Typography>}
    </Box>
  );
}

export default function DetalleReparto({ reparto, filas, repartos, valorNominal, sbu, reglas, onClose, pagar, verDocumento }) {
  const classes = useStyles();
  const [tab, setTab] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('Todos');

  const visibles = useMemo(() => {
    const t = busqueda.trim().toLowerCase();
    return filas.filter((f) => (estado === 'Todos' || f.estado === estado)
      && (!t || (f.nombre || '').toLowerCase().includes(t) || String(f.identificacion || '').includes(t)));
  }, [filas, busqueda, estado]);

  const periodo = useMemo(() => repartos.filter((r) => r.ddiv_dividendo_id === reparto.ddiv_dividendo_id), [repartos, reparto]);
  const cuadre = useMemo(() => cuadreReparto(reparto, filas, periodo), [reparto, filas, periodo]);
  // Reglas con que se calculó el reparto; los repartos anteriores a la parametrización no las guardaron.
  const reglasGuardadas = !!reparto.ddiv_reglas_retencion;
  const retencion = useMemo(() => leerReglas(reglasGuardadas ? reparto.ddiv_reglas_retencion : reglas), [reglasGuardadas, reparto, reglas]);
  const conteo = (e) => filas.filter((f) => e === 'Todos' || f.estado === e).length;
  const { totales } = cuadre;
  const avance = reparto.monto ? Math.min(100, (reparto.ddiv_dividendo || 0) * 100 / reparto.monto) : 0;
  const descuadres = cuadre.controles.filter((c) => !c.ok).length;
  const asignadoPrevio = cuadre.asignado - (reparto.monto || 0);

  const exportar = () => descargarExcel({
    titulo: 'Detalle de dividendos',
    subtitulo: `${reparto.div_concepto} ${reparto.div_periodo} · Reparto ${reparto.ddiv_secuencial} · Monto USD ${formato(reparto.monto)}`
      + (visibles.length < filas.length ? ` · ${visibles.length} de ${filas.length} beneficiarios (filtrado)` : ''),
    hoja: 'Dividendos',
    encabezados: ['Identificación', 'Persona', 'Residencia', 'Beneficiario', 'Acciones', 'Capital', 'Dividendo', 'Retención',
      'Total neto', 'Por pagar', 'Fecha de pago', 'Estado'],
    filas: visibles.map((f) => [f.identificacion, f.persona, f.residencia, f.nombre, f.acciones, f.acciones * (valorNominal || 0),
      f.dividendo, f.retencion, f.neto, f.porPagar, f.fechaPago, f.estado]),
    archivo: `Dividendos_${reparto.div_periodo}_reparto${reparto.ddiv_secuencial}.xlsx`,
  });

  const columnas = [
    { field: 'identificacion', headerName: 'Identificación', width: 130 },
    { field: 'nombre', headerName: 'Beneficiario', flex: 1, minWidth: 220 },
    { field: 'persona', headerName: 'Persona', width: 90 },
    { field: 'residencia', headerName: 'Residencia', width: 100 },
    { field: 'acciones', headerName: 'Acciones', type: 'number', width: 110, valueFormatter: (p) => enteros(p.value) },
    {
      field: 'capital', headerName: 'Capital', type: 'number', width: 110,
      valueGetter: (p) => p.row.acciones * (valorNominal || 0), valueFormatter: (p) => formato(p.value),
    },
    numero('dividendo', 'Dividendo'),
    numero('retencion', 'Retención'),
    numero('neto', 'Total neto'),
    numero('porPagar', 'Por pagar'),
    { field: 'fechaPago', headerName: 'Fecha de pago', width: 110 },
    {
      field: 'estado', headerName: 'Estado', width: 105,
      renderCell: (p) => <Chip size="small" variant={p.value === 'Pendiente' ? 'default' : 'outlined'} color={COLOR_ESTADO[p.value]} label={p.value} />,
    },
    {
      field: 'pagar', headerName: 'Pago', width: 130, sortable: false, disableExport: true,
      renderCell: (p) => {
        const fila = p.row;
        return (
          <>
            {fila.documento && <IconButton size="small" onClick={() => verDocumento(fila.documento)} title="Ver comprobante"><CheckIcon /></IconButton>}
            {/* Retenido: accionista o título bloqueado al corte; el pago requiere aprobación (pendiente de implementar). */}
            {fila.estado === 'Pendiente' && (
              <label>
                <input style={{ display: 'none' }} type="file" accept={ACEPTA_PDF} onChange={pagar(fila)} />
                <Button component="span" variant="outlined" color="primary" size="small" startIcon={<DescriptionIcon />} style={{ textTransform: 'none' }}>Pagar</Button>
              </label>
            )}
          </>
        );
      },
    },
  ];

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle disableTypography className={classes.titulo}>
        <div>
          <Typography variant="h6">{`${reparto.div_concepto} ${reparto.div_periodo} · Reparto ${reparto.ddiv_secuencial}`}</Typography>
          <Typography variant="body2" color="textSecondary">
            {`Junta ${reparto.ddiv_fecha_junta || '—'} · Pago ${reparto.ddiv_fecha_pago || '—'} · Dividendo del período USD ${formato(reparto.div_dividendo)} · ${formato(reparto.ddiv_porcentaje)}% acordado`}
          </Typography>
        </div>
        <Chip
          icon={descuadres ? <ErrorIcon /> : <CheckCircleIcon className={classes.ok} />}
          label={descuadres ? `${descuadres} descuadre(s)` : 'Cuadre correcto'}
          color={descuadres ? 'primary' : 'default'} variant="outlined" onClick={() => setTab(1)}
        />
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Resumen titulo="Monto del reparto" valor={formato(reparto.monto)} detalle={`${enteros(totales.acciones)} acciones`} />
          <Resumen titulo="Pagado" valor={formato(reparto.ddiv_dividendo)} detalle={`${conteo('Pagado')} beneficiarios`} />
          <Resumen titulo="Saldo" valor={formato(reparto.saldo)} detalle={`${conteo('Pendiente')} pendientes · ${conteo('Retenido')} retenidos`} />
          <Resumen titulo="Retención" valor={formato(totales.retencion)} />
          <Resumen titulo="Total neto" valor={formato(totales.neto)} />
          <Resumen titulo="Valor por acción" valor={texto(reparto.ddiv_valor_accion, 6)} detalle="100% del dividendo anual" />
        </Grid>
        <Box mt={1.5}>
          <Typography variant="caption" color="textSecondary">{`Avance de pago: ${formato(avance)}%`}</Typography>
          <LinearProgress variant="determinate" value={avance} />
        </Box>

        <Tabs value={tab} onChange={(e, v) => setTab(v)} indicatorColor="primary" textColor="primary" style={{ marginTop: 8 }}>
          <Tab label={`Beneficiarios (${filas.length})`} />
          <Tab label="Cuadre y fórmula" />
        </Tabs>
        <Divider />

        {tab === 0 && (
          <>
            <div className={classes.barra}>
              <TextField
                size="small" variant="outlined" placeholder="Buscar por nombre o identificación" value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)} style={{ width: 340 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                  endAdornment: busqueda ? <IconButton size="small" title="Limpiar" onClick={() => setBusqueda('')}><ClearIcon fontSize="small" /></IconButton> : null,
                }}
              />
              <ToggleButtonGroup size="small" exclusive value={estado} onChange={(e, v) => v && setEstado(v)}>
                {ESTADOS.map((e) => <ToggleButton key={e} value={e} style={{ textTransform: 'none' }}>{`${e} (${conteo(e)})`}</ToggleButton>)}
              </ToggleButtonGroup>
              <Button variant="outlined" color="primary" size="small" startIcon={<GetAppIcon />} style={{ textTransform: 'none', marginLeft: 'auto' }}
                disabled={!visibles.length} onClick={exportar}>
                Descargar Excel{visibles.length < filas.length ? ` (${visibles.length})` : ''}
              </Button>
            </div>
            <div style={{ height: 430 }}>
              <DataGrid density="compact" disableColumnMenu disableSelectionOnClick rows={visibles} columns={columnas}
                pageSize={25} rowsPerPageOptions={[25]} />
            </div>
          </>
        )}

        {tab === 1 && (
          <Grid container spacing={3} style={{ marginTop: 4 }}>
            <Grid item xs={12} md={7}>
              <Typography variant="subtitle1" gutterBottom>Cuadre contable</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Control</TableCell>
                    <TableCell align="right">Registrado</TableCell>
                    <TableCell align="right">Calculado</TableCell>
                    <TableCell align="right">Diferencia</TableCell>
                    <TableCell align="center">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cuadre.controles.map((c) => (
                    <TableRow key={c.concepto}>
                      <TableCell>
                        <Typography variant="body2">{c.concepto}</Typography>
                        <Typography variant="caption" color="textSecondary">{c.detalle}</Typography>
                      </TableCell>
                      <TableCell align="right">{c.concepto === 'Acciones' ? enteros(c.esperado) : formato(c.esperado)}</TableCell>
                      <TableCell align="right">{c.concepto === 'Acciones' ? enteros(c.calculado) : formato(c.calculado)}</TableCell>
                      <TableCell align="right">{c.concepto === 'Acciones' ? enteros(c.diferencia) : formato(c.diferencia)}</TableCell>
                      <TableCell align="center">
                        {c.ok ? <CheckCircleIcon className={classes.ok} titleAccess="Cuadra" /> : <ErrorIcon color="primary" titleAccess="No cuadra" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {cuadre.porCubrir > 0 && (
                <MuiAlert severity="info" style={{ marginTop: 12 }}>
                  {`Faltan USD ${formato(cuadre.porCubrir)} por asignar del ${formato(cuadre.declarado)}% declarado: acciones de accionistas que no asistieron. Se pondrán al día en un reparto posterior al que asistan.`}
                </MuiAlert>
              )}

              <Typography variant="subtitle1" gutterBottom style={{ marginTop: 24 }}>Reglas de retención del reparto</Typography>
              <Typography variant="caption" color="textSecondary" component="p" gutterBottom>
                {`Se aplica la primera regla que coincide, sobre el dividendo acumulado del beneficiario en el año. SBU actual (Parámetros) = USD ${formato(sbu)}. `}
                {reglasGuardadas ? 'Copia guardada al generar el reparto.' : 'Este reparto se generó antes de parametrizar la retención: se muestran las reglas actuales de Parámetros.'}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Persona</TableCell>
                    <TableCell>Residencia</TableCell>
                    <TableCell>Nacionalidad</TableCell>
                    <TableCell align="right">Retención</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {retencion.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{r.persona}</TableCell>
                      <TableCell>{r.residencia}</TableCell>
                      <TableCell>{r.nacionalidad}</TableCell>
                      <TableCell align="right">{`${r.porcentaje}%${r.sbu ? ` − ${r.sbu} SBU` : ''}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>

            <Grid item xs={12} md={5}>
              <Typography variant="subtitle1" gutterBottom>Fórmula de cálculo</Typography>
              <Formula paso={1} titulo="Valor por acción (100% del dividendo anual)"
                explicacion="Si hubo aumento de capital en el año, la base crece y el valor se recalcula con lo que falta por repartir.">
                {`V = (Dividendo período × % declarado − asignado antes) ÷ (Acciones base × % declarado − acciones ya cubiertas)`}<br />
                {`  = (${formato(reparto.div_dividendo)} × ${formato(cuadre.declarado)}% − ${formato(asignadoPrevio)}) ÷ (${enteros(reparto.div_acciones_base)} × ${formato(cuadre.declarado)}% − cubiertas)`}<br />
                {`  = ${texto(reparto.ddiv_valor_accion, 6)}`}
              </Formula>
              <Formula paso={2} titulo="Dividendo de cada rango de acciones"
                explicacion="Cada acción de la foto de la asamblea cobra lo que le falta para llegar al % declarado acumulado; quien faltó a un reparto anterior se pone al día y una acción nunca cobra dos veces.">
                {`Dividendo = acciones × (${formato(cuadre.declarado)}% − % ya cobrado por ese rango) × V`}
              </Formula>
              <Formula paso={3} titulo="Centavos"
                explicacion="Así la suma de los beneficiarios es exactamente el monto del reparto y, al completar el 100%, el año suma lo declarado.">
                {'Total del reparto = redondeo(asignado antes + Σ exactos) − asignado antes'}<br />
                {'Se reparte por mayor residuo (centavo a centavo).'}
              </Formula>
              <Formula paso={4} titulo="Retención y neto">
                {'Retención = regla(dividendo acumulado del año) − retención de repartos anteriores'}<br />
                {'Neto = dividendo − retención'}
              </Formula>
              <Formula paso={5} titulo="Período">
                {`Asignado repartos 1–${reparto.ddiv_secuencial} = ${formato(cuadre.asignado)}`}<br />
                {`Tope = ${formato(reparto.div_dividendo)} × ${formato(cuadre.declarado)}% = ${formato(cuadre.tope)}`}
              </Formula>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Salir</Button>
      </DialogActions>
    </Dialog>
  );
}
