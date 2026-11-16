// Pestaña "Dividendos" de una asamblea: años que reparte y accionistas que reciben el dividendo.
// La configuración se guarda en la asamblea (dividendoPeriodos, dividendoBeneficiarios) y la usa la página de
// Dividendos al generar el reparto de cada año.
import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid, Typography, Button, Chip, TextField, Checkbox, Box, Paper, Table, TableHead, TableBody, TableRow, TableCell,
  FormControlLabel, InputAdornment,
} from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { DataGrid } from '@mui/x-data-grid';
import SaveIcon from '@material-ui/icons/Save';
import { estadoPeriodos } from '../services/repartoDividendos';
import { filtrarPorNombre, filtrarPorAcciones, leerBeneficiarios } from '../utils/asambleas';

const enteros = (n) => new Intl.NumberFormat('en-US').format(n || 0);
const COLOR_ESTADO = { Disponible: 'primary', Pendiente: 'secondary', Completo: 'default', 'Esquema anterior': 'default' };
const seleccionable = (p) => p.estado === 'Disponible' || p.estado === 'Pendiente';

/**
 * asamblea: registro de la asamblea; lista: lista de asistencia (accionistas activos con acciones + registros).
 * ejecutar(fn, exito): manejo de carga/errores de la vista; guardar(cambios): actualiza la asamblea.
 * soloLectura: la asamblea ya generó todos sus repartos.
 */
export default function DividendosAsamblea({ asamblea, lista, ejecutar, guardar, soloLectura }) {
  const [periodos, setPeriodos] = useState([]);
  const [anios, setAnios] = useState(() => new Set(asamblea.dividendoPeriodos || []));
  const [elegidos, setElegidos] = useState(() => new Set(leerBeneficiarios(asamblea.dividendoBeneficiarios) || []));
  const [filtro, setFiltro] = useState({ texto: '', minimo: '', menorA: '', soloPresentes: false });

  useEffect(() => { ejecutar(async () => setPeriodos(await estadoPeriodos())); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtrados = useMemo(() => filtrarPorAcciones(filtrarPorNombre(lista, filtro.texto), filtro)
    .filter((i) => !filtro.soloPresentes || i.presente === true), [lista, filtro]);
  const accionesElegidas = useMemo(() => lista.filter((i) => elegidos.has(i.accionistaID)).reduce((s, i) => s + (i.acciones || 0), 0), [lista, elegidos]);

  const cambiarAnio = (anio) => setAnios((a) => { const n = new Set(a); if (n.has(anio)) n.delete(anio); else n.add(anio); return n; });
  const cambiarElegidos = (ids, agregar) => setElegidos((e) => {
    const n = new Set(e);
    ids.forEach((id) => (agregar ? n.add(id) : n.delete(id)));
    return n;
  });
  const campo = (nombre) => (e) => setFiltro({ ...filtro, [nombre]: nombre === 'soloPresentes' ? e.target.checked : e.target.value.replace(/[^0-9]/g, '') });

  const guardarConfiguracion = () => ejecutar(async () => {
    if (!anios.size) throw new Error('Seleccione al menos un año a repartir.');
    await guardar({
      dividendoPeriodos: [...anios].sort((a, b) => b - a),
      // Sin beneficiarios elegidos se reparte a los presentes (comportamiento anterior).
      dividendoBeneficiarios: elegidos.size ? JSON.stringify([...elegidos]) : null,
    });
  }, 'Configuración de dividendos guardada. El reparto se genera en la página Dividendos.');

  const columnas = [
    {
      field: 'recibe', headerName: 'Recibe', width: 85, sortable: false,
      renderCell: (p) => (
        <Checkbox color="primary" checked={elegidos.has(p.row.accionistaID)} disabled={soloLectura}
          onChange={(e) => cambiarElegidos([p.row.accionistaID], e.target.checked)} inputProps={{ 'aria-label': `Recibe ${p.row.nombre}` }} />
      ),
    },
    { field: 'nombre', headerName: 'Accionista', flex: 1, minWidth: 220 },
    { field: 'identificacion', headerName: 'Identificación', width: 130 },
    { field: 'acciones', headerName: 'Acciones', type: 'number', width: 120, valueFormatter: (p) => enteros(p.value) },
    { field: 'presente', headerName: 'Presente', width: 90, valueFormatter: (p) => (p.value === true ? 'Sí' : '') },
  ];

  return (
    <Grid container spacing={2}>
      {soloLectura && (
        <Grid item xs={12}><MuiAlert severity="info">La asamblea ya generó todos sus repartos: la configuración es solo de consulta.</MuiAlert></Grid>
      )}
      <Grid item xs={12} md={4}>
        <Paper variant="outlined" style={{ padding: 12 }}>
          <Typography variant="subtitle2">Años a repartir</Typography>
          <Typography variant="caption" color="textSecondary" component="p" gutterBottom>
            Disponible: sin repartos. Pendiente: falta asignar parte del dividendo del año. Se genera un reparto por año.
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Año</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Asignado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {periodos.map((p) => (
                <TableRow key={p.anio} hover>
                  <TableCell padding="checkbox">
                    <Checkbox color="primary" size="small" checked={anios.has(p.anio)} disabled={soloLectura || (!seleccionable(p) && !anios.has(p.anio))}
                      onChange={() => cambiarAnio(p.anio)} inputProps={{ 'aria-label': `Repartir ${p.anio}` }} />
                  </TableCell>
                  <TableCell>{p.anio}</TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" color={COLOR_ESTADO[p.estado]} label={p.estado}
                      title={p.repartos ? `${p.repartos} reparto(s), nivel general ${p.nivelGeneral}%` : ''} />
                  </TableCell>
                  <TableCell align="right">{p.estado === 'Disponible' ? '—' : `${p.cubierto}%`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper variant="outlined" style={{ padding: 12 }}>
          <Typography variant="subtitle2">Accionistas que reciben el dividendo</Typography>
          <Typography variant="caption" color="textSecondary" component="p" gutterBottom>
            La misma lista se usa para todos los años de la asamblea. Si no elige a nadie, el reparto se hace a los presentes.
            Las acciones que se cobran son las de la foto de títulos de la asamblea.
          </Typography>
          <Box display="flex" flexWrap="wrap" alignItems="center" style={{ gap: 8 }} mb={1}>
            <TextField size="small" variant="outlined" label="Buscar" value={filtro.texto} onChange={(e) => setFiltro({ ...filtro, texto: e.target.value })} style={{ width: 200 }} />
            <TextField size="small" variant="outlined" label="Acciones desde (≥)" value={filtro.minimo} onChange={campo('minimo')} style={{ width: 150 }}
              InputProps={{ startAdornment: <InputAdornment position="start">≥</InputAdornment> }} />
            <TextField size="small" variant="outlined" label="Menos de (<)" value={filtro.menorA} onChange={campo('menorA')} style={{ width: 150 }}
              InputProps={{ startAdornment: <InputAdornment position="start">&lt;</InputAdornment> }} />
            <FormControlLabel control={<Checkbox color="primary" size="small" checked={filtro.soloPresentes} onChange={campo('soloPresentes')} />} label="Solo presentes" />
          </Box>
          <Box display="flex" flexWrap="wrap" alignItems="center" style={{ gap: 8 }} mb={1}>
            <Button size="small" variant="outlined" color="primary" disabled={soloLectura || !filtrados.length}
              onClick={() => cambiarElegidos(filtrados.map((i) => i.accionistaID), true)}>{`Seleccionar filtrados (${enteros(filtrados.length)})`}</Button>
            <Button size="small" disabled={soloLectura || !filtrados.length} onClick={() => cambiarElegidos(filtrados.map((i) => i.accionistaID), false)}>Quitar filtrados</Button>
            <Button size="small" disabled={soloLectura || !elegidos.size} onClick={() => setElegidos(new Set())}>Limpiar selección</Button>
            <Chip size="small" color={elegidos.size ? 'primary' : 'default'}
              label={elegidos.size ? `${enteros(elegidos.size)} accionistas — ${enteros(accionesElegidas)} acciones` : 'Sin lista: se usarán los presentes'} />
          </Box>
          <div style={{ height: 340 }}>
            <DataGrid rows={filtrados} columns={columnas} density="compact" disableColumnMenu disableSelectionOnClick pageSize={50} rowsPerPageOptions={[50]} />
          </div>
          {!soloLectura && (
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={guardarConfiguracion}>Guardar configuración</Button>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
