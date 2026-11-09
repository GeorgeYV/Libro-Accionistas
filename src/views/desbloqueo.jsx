import React from 'react';
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined';
import OperacionTitulos from '../components/operacionTitulos';

// Desbloqueo (ope_tipo 4): sobre accionistas bloqueados. Al aprobarse en el blotter, accionista y títulos vuelven a activos.
const CONFIG = {
  tipo: 4, detalle: 'Desbloqueo', estadoAccionistas: 3, icono: <LockOpenOutlinedIcon />,
  titulo: 'Desbloquear accionista',
  descripcion: 'Se desbloquearán todos los títulos del accionista cuando la operación sea aprobada.',
  documento: 'Documento de respaldo', tituloTabla: 'Títulos a desbloquear', sinAccionistas: 'No hay accionistas bloqueados',
};

export default function Desbloqueo() {
  return <OperacionTitulos config={CONFIG} />;
}
