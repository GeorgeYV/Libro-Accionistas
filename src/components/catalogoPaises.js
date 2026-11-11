// Mantenimiento del catálogo de países (Parámetros): buscar, agregar, editar, activar/desactivar y marcar paraíso fiscal.
// No se borra ni se renombra un país: su nombre es el valor guardado en los accionistas.
import React, { useState, useMemo } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography, Chip, IconButton,
  InputAdornment, FormControlLabel, Switch,
} from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@material-ui/icons/Search';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import { guardarPais } from '../services/paises';

const VACIO = { nombre: '', nombreCorto: '', nacionalidad: '', codigoTelefono: '', estado: 'Activo', paraisoFiscal: false };

export default function CatalogoPaises({ paises, onCambio, ejecutar }) {
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null);
  const [soloParaisos, setSoloParaisos] = useState(false);

  const visibles = useMemo(() => {
    const t = busqueda.trim().toLowerCase();
    return paises.filter((p) => (!soloParaisos || p.paraisoFiscal)
      && (!t || p.nombre.toLowerCase().includes(t) || (p.nombreCorto || '').toLowerCase() === t || (p.nacionalidad || '').toLowerCase().includes(t)));
  }, [paises, busqueda, soloParaisos]);
  const paraisos = paises.filter((p) => p.paraisoFiscal).length;

  const guardar = () => ejecutar(async () => {
    await guardarPais(editando, paises);
    setEditando(null);
    await onCambio();
  }, 'País guardado.');

  const columnas = [
    { field: 'nombre', headerName: 'País', flex: 1, minWidth: 180 },
    { field: 'nombreCorto', headerName: 'Código', width: 85 },
    { field: 'nacionalidad', headerName: 'Nacionalidad', width: 150 },
    { field: 'codigoTelefono', headerName: 'Teléfono', width: 95 },
    {
      field: 'paraisoFiscal', headerName: 'Paraíso fiscal', width: 125,
      renderCell: (p) => (p.value ? <Chip size="small" color="primary" label="Sí" /> : ''),
    },
    {
      field: 'estado', headerName: 'Estado', width: 100,
      renderCell: (p) => <Chip size="small" variant="outlined" color={p.value === 'Activo' ? 'secondary' : 'default'} label={p.value} />,
    },
    {
      field: 'editar', headerName: '', width: 60, sortable: false,
      renderCell: (p) => <IconButton size="small" title="Editar" onClick={() => setEditando({ ...VACIO, ...p.row })}><EditIcon fontSize="small" /></IconButton>,
    },
  ];

  return (
    <>
      <Typography variant="body2" color="textSecondary" paragraph>
        {`Lista de países para residencia y nacionalidad de los accionistas, y para la retención "Paraíso fiscal". `}
        {`${paises.length} países · ${paraisos} marcados como paraíso fiscal. Los inactivos no se ofrecen en los formularios.`}
      </Typography>
      {paises.length === 0 && (
        <MuiAlert severity="info" style={{ marginBottom: 8 }}>
          El catálogo está vacío: los formularios usan Ecuador, Perú y Estados Unidos. Cárguelo con scripts/cargar-paises.js o agregue países.
        </MuiAlert>
      )}
      <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 12 }} mb={1}>
        <TextField size="small" variant="outlined" placeholder="Buscar país, código o nacionalidad" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: 300 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
        <FormControlLabel control={<Switch size="small" color="primary" checked={soloParaisos} onChange={(e) => setSoloParaisos(e.target.checked)} />}
          label="Solo paraísos fiscales" />
        <Button size="small" color="primary" variant="outlined" startIcon={<AddIcon />} style={{ marginLeft: 'auto' }} onClick={() => setEditando(VACIO)}>
          Agregar país
        </Button>
      </Box>
      <div style={{ height: 380 }}>
        <DataGrid density="compact" disableColumnMenu disableSelectionOnClick rows={visibles} columns={columnas} pageSize={50} rowsPerPageOptions={[50]} />
      </div>

      <Dialog open={!!editando} onClose={() => setEditando(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{editando && editando.id ? `Editar ${editando.nombre}` : 'Agregar país'}</DialogTitle>
        {editando && (
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField fullWidth size="small" variant="outlined" label="Nombre" value={editando.nombre} disabled={!!editando.id}
                  helperText={editando.id ? 'No se puede cambiar: es el valor guardado en los accionistas.' : 'Tal como se mostrará y guardará, p. ej. Panamá'}
                  onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth size="small" variant="outlined" label="Código ISO" value={editando.nombreCorto} inputProps={{ maxLength: 2 }}
                  onChange={(e) => setEditando({ ...editando, nombreCorto: e.target.value.toUpperCase() })} />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField fullWidth size="small" variant="outlined" label="Nacionalidad" value={editando.nacionalidad}
                  onChange={(e) => setEditando({ ...editando, nacionalidad: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth size="small" variant="outlined" label="Código telefónico" value={editando.codigoTelefono || ''}
                  onChange={(e) => setEditando({ ...editando, codigoTelefono: e.target.value.replace(/[^0-9+]/g, '') })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel label="Paraíso fiscal / menor imposición"
                  control={<Switch color="primary" checked={!!editando.paraisoFiscal} onChange={(e) => setEditando({ ...editando, paraisoFiscal: e.target.checked })} />} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel label="Activo"
                  control={<Switch color="primary" checked={editando.estado === 'Activo'} onChange={(e) => setEditando({ ...editando, estado: e.target.checked ? 'Activo' : 'Inactivo' })} />} />
              </Grid>
            </Grid>
            <Typography variant="caption" color="textSecondary">
              La marca de paraíso fiscal se aplica en los repartos que se generen después de guardarla.
            </Typography>
          </DialogContent>
        )}
        <DialogActions>
          <Button color="primary" onClick={() => setEditando(null)}>Cancelar</Button>
          <Button color="primary" variant="contained" onClick={guardar}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
