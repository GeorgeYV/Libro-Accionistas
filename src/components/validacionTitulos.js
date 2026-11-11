import React, { useState } from 'react';
import { Button, Typography } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { API } from 'aws-amplify';
import { listTitulos, listAccionistas, getParametro } from '../graphql/queries';
import { listarTodos } from '../services/listarTodos';
import { validarTitulos } from '../utils/rangos';
import Cargando from './cargando';

const columnas = [
  { field: 'tipo', headerName: 'Problema', width: 200 },
  { field: 'titulo', headerName: 'Título', width: 280 },
  { field: 'accionista', headerName: 'Accionista', width: 180 },
  { field: 'detalle', headerName: 'Detalle', flex: 1 },
];

function Toolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport csvOptions={{ fileName: 'validacion-titulos' }} />
    </GridToolbarContainer>
  );
}

// Solo lectura: revisa rangos de títulos y cuadre con accionistas. No modifica datos.
export default function ValidacionTitulos() {
  const [cargando, setCargando] = useState(false);
  const [problemas, setProblemas] = useState(null);
  const [error, setError] = useState('');

  const validar = async () => {
    setCargando(true);
    setError('');
    try {
      const [titulos, accionistas, parametro] = await Promise.all([
        listarTodos(listTitulos, 'listTitulos'),
        listarTodos(listAccionistas, 'listAccionistas'),
        API.graphql({ query: getParametro, variables: { id: '1' } }),
      ]);
      const totalEmitido = parametro.data.getParametro.cantidadEmitida;
      setProblemas(validarTitulos(titulos, accionistas, totalEmitido).map((p, i) => ({ id: i, ...p })));
    } catch (err) {
      console.log('Error validando títulos:', err);
      setError('No se pudo completar la validación.');
    }
    setCargando(false);
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2">Validación de títulos</Typography>
        <Button onClick={validar} disabled={cargando} size="small" variant="outlined" color="primary" style={{ marginLeft: 10, textTransform: 'none' }}>
          Validar rangos
        </Button>
        <Cargando abierto={cargando} />
      </div>
      {error && <MuiAlert severity="error" style={{ marginTop: 10 }}>{error}</MuiAlert>}
      {problemas && problemas.length === 0 && (
        <MuiAlert severity="success" style={{ marginTop: 10 }}>Los títulos están cuadrados: sin huecos, solapes ni descuadres.</MuiAlert>
      )}
      {problemas && problemas.length > 0 && (
        <div style={{ height: 400, marginTop: 10 }}>
          <MuiAlert severity="warning" style={{ marginBottom: 10 }}>{problemas.length} problemas encontrados.</MuiAlert>
          <DataGrid rows={problemas} columns={columnas} pageSize={50} density="compact" components={{ Toolbar }} />
        </div>
      )}
    </div>
  );
}
