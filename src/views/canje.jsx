import React from 'react';
import SyncOutlinedIcon from '@material-ui/icons/SyncOutlined';
import OperacionTitulos from '../components/operacionTitulos';

// Canje (ope_tipo 2): sobre accionistas activos con acciones ordinarias (acc_tipo_acciones 0).
// Al aprobarse en el blotter, el accionista pasa a acciones desmaterializadas (acc_tipo_acciones 1).
const CONFIG = {
  tipo: 2, detalle: 'Canje', estadoAccionistas: 1, filtro: (a) => a.acc_tipo_acciones === 0, icono: <SyncOutlinedIcon />,
  titulo: 'Canjear acciones ordinarias',
  descripcion: 'Las acciones ordinarias del accionista pasarán a desmaterializadas cuando la operación sea aprobada.',
  documento: 'Título ordinario', tituloTabla: 'Títulos a canjear', sinAccionistas: 'No hay accionistas activos con acciones ordinarias',
};

export default function Canje() {
  return <OperacionTitulos config={CONFIG} />;
}
