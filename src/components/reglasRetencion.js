// Editor de las reglas de retención de dividendos (Parámetros) con simulador.
// Los Autocomplete ignoran el motivo 'reset': MUI lo dispara al cambiar las opciones (carga del catálogo) y borraba el texto.
import React, { useState } from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableCell, TextField, MenuItem, IconButton, Button, Typography, Box, Grid,
  InputAdornment, Paper, Tooltip,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import MuiAlert from '@material-ui/lab/Alert';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import RestoreIcon from '@material-ui/icons/Restore';
import {
  PERSONAS, RESIDENCIAS, NACIONALIDADES, REGLAS_INICIALES, validarReglas, indiceRegla, calcularRetencion, conParaisoFiscal, normal,
} from '../utils/retencion';

const formato = (n) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const NUEVA = { persona: 'Todas', residencia: 'Cualquiera', nacionalidad: 'Cualquiera', porcentaje: 0, sbu: 0 };

function Opciones({ value, opciones, onChange, ancho }) {
  return (
    <TextField select size="small" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: ancho }}>
      {opciones.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
    </TextField>
  );
}

export default function ReglasRetencion({ reglas, onChange, sbu, paises = [] }) {
  const opcionesResidencia = [...RESIDENCIAS, ...paises.filter((p) => p.estado === 'Activo').map((p) => p.nombre)];
  const nombresCatalogo = paises.map((p) => p.nombre);
  const paraisos = new Set(paises.filter((p) => p.paraisoFiscal).map((p) => normal(p.nombre)));
  const [prueba, setPrueba] = useState({ persona: 'Natural', residencia: 'Ecuador', nacionalidad: 'Ecuador', monto: '1000' });
  const errores = validarReglas(reglas);

  const cambiar = (i, campo, valor) => onChange(reglas.map((r, j) => (j === i ? { ...r, [campo]: valor } : r)));
  const mover = (i, d) => {
    const copia = [...reglas];
    [copia[i], copia[i + d]] = [copia[i + d], copia[i]];
    onChange(copia);
  };
  const numero = (texto, entero) => {
    const limpio = texto.replace(entero ? /[^0-9]/g : /[^0-9.]/g, '');
    return limpio === '' ? '' : Number(limpio);
  };

  // Simulación con las reglas en pantalla (aunque no estén guardadas).
  const acc = conParaisoFiscal({
    acc_tipo_persona: prueba.persona === 'Jurídica' ? 1 : 0,
    acc_residencia: prueba.residencia,
    acc_nacionalidad: prueba.nacionalidad,
  }, paraisos);
  const monto = parseFloat(prueba.monto) || 0;
  const valida = !errores.length;
  const indice = valida ? indiceRegla(acc, reglas) : -1;
  const retencion = valida ? calcularRetencion(monto, acc, reglas, sbu) : 0;

  return (
    <>
      <Typography variant="body2" color="textSecondary" paragraph>
        Se aplica la <b>primera</b> regla que coincide con el accionista (las excepciones van arriba). El porcentaje se calcula
        sobre el dividendo acumulado del beneficiario en el año y se restan los SBU indicados. Si ninguna regla coincide, la
        retención es 0. Cada reparto guarda una copia de las reglas con que se calculó.
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Persona</TableCell>
            <TableCell>Residencia</TableCell>
            <TableCell>Nacionalidad</TableCell>
            <TableCell>Retención</TableCell>
            <TableCell>SBU a restar</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {reglas.map((r, i) => (
            <TableRow key={i} selected={i === indice}>
              <TableCell>{i + 1}</TableCell>
              <TableCell><Opciones value={r.persona} opciones={PERSONAS} onChange={(v) => cambiar(i, 'persona', v)} ancho={110} /></TableCell>
              <TableCell>
                <Autocomplete
                  freeSolo disableClearable size="small" options={opcionesResidencia} value={r.residencia} inputValue={r.residencia} style={{ width: 170 }}
                  onChange={(e, v) => cambiar(i, 'residencia', v || '')}
                  onInputChange={(e, v, motivo) => motivo !== 'reset' && cambiar(i, 'residencia', v)}
                  renderInput={(params) => <TextField {...params} placeholder="Ecuador, Exterior o un país" />}
                />
              </TableCell>
              <TableCell><Opciones value={r.nacionalidad} opciones={NACIONALIDADES} onChange={(v) => cambiar(i, 'nacionalidad', v)} ancho={130} /></TableCell>
              <TableCell>
                <TextField size="small" value={r.porcentaje} style={{ width: 90 }} onChange={(e) => cambiar(i, 'porcentaje', numero(e.target.value))}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              </TableCell>
              <TableCell>
                <TextField size="small" value={r.sbu} style={{ width: 70 }} onChange={(e) => cambiar(i, 'sbu', numero(e.target.value, true))} />
              </TableCell>
              <TableCell align="right" style={{ whiteSpace: 'nowrap' }}>
                <IconButton size="small" title="Subir" disabled={i === 0} onClick={() => mover(i, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton>
                <IconButton size="small" title="Bajar" disabled={i === reglas.length - 1} onClick={() => mover(i, 1)}><ArrowDownwardIcon fontSize="small" /></IconButton>
                <IconButton size="small" title="Quitar" disabled={reglas.length === 1} onClick={() => onChange(reglas.filter((_, j) => j !== i))}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box display="flex" style={{ gap: 8 }} mt={1}>
        <Button size="small" color="primary" startIcon={<AddIcon />} onClick={() => onChange([...reglas, NUEVA])}>Agregar regla</Button>
        <Tooltip title="Vuelve a la regla con que se calculaban los dividendos antes de parametrizarla">
          <Button size="small" startIcon={<RestoreIcon />} onClick={() => onChange(REGLAS_INICIALES)}>Restaurar reglas iniciales</Button>
        </Tooltip>
      </Box>
      {errores.length > 0 && <MuiAlert severity="error" style={{ marginTop: 8 }}>{errores.join(' ')}</MuiAlert>}

      <Paper variant="outlined" style={{ padding: 12, marginTop: 16 }}>
        <Typography variant="subtitle2" gutterBottom>Simulador</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6} sm={2}>
            <TextField select fullWidth size="small" label="Persona" value={prueba.persona} onChange={(e) => setPrueba({ ...prueba, persona: e.target.value })}>
              {['Natural', 'Jurídica'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Autocomplete freeSolo disableClearable size="small" options={nombresCatalogo} value={prueba.residencia} inputValue={prueba.residencia}
              onChange={(e, v) => setPrueba((x) => ({ ...x, residencia: v || '' }))}
              onInputChange={(e, v, motivo) => motivo !== 'reset' && setPrueba((x) => ({ ...x, residencia: v }))}
              renderInput={(params) => <TextField {...params} fullWidth label="País de residencia" />} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Autocomplete freeSolo disableClearable size="small" options={nombresCatalogo} value={prueba.nacionalidad} inputValue={prueba.nacionalidad}
              onChange={(e, v) => setPrueba((x) => ({ ...x, nacionalidad: v || '' }))}
              onInputChange={(e, v, motivo) => motivo !== 'reset' && setPrueba((x) => ({ ...x, nacionalidad: v }))}
              renderInput={(params) => <TextField {...params} fullWidth label="Nacionalidad (país)" />} />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField fullWidth size="small" label="Dividendo del año" value={prueba.monto}
              onChange={(e) => setPrueba({ ...prueba, monto: e.target.value.replace(/[^0-9.]/g, '') })}
              InputProps={{ startAdornment: <InputAdornment position="start">USD</InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="caption" color="textSecondary">Retención</Typography>
            <Typography variant="h6">{valida ? `USD ${formato(retencion)}` : '—'}</Typography>
          </Grid>
        </Grid>
        <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
          {!valida && 'Corrija las reglas para simular.'}
          {valida && acc.acc_paraiso_fiscal && 'Residencia en paraíso fiscal según el catálogo. '}
          {valida && indice >= 0 && `Aplica la regla ${indice + 1}: ${reglas[indice].porcentaje}% de ${formato(monto)}${reglas[indice].sbu ? ` − ${reglas[indice].sbu} SBU (${formato(reglas[indice].sbu * (sbu || 0))})` : ''} (resaltada en la tabla).`}
          {valida && indice < 0 && 'Ninguna regla coincide: retención 0.'}
        </Typography>
      </Paper>
    </>
  );
}
