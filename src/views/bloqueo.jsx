import React from 'react';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import OperacionTitulos from '../components/operacionTitulos';

// Bloqueo (ope_tipo 1): sobre accionistas activos. Al aprobarse en el blotter, accionista y títulos quedan bloqueados.
const CONFIG = {
  tipo: 1, detalle: 'Bloqueo', estadoAccionistas: 1, icono: <LockOutlinedIcon />,
  titulo: 'Bloquear accionista',
  descripcion: 'Se bloquearán todos los títulos del accionista cuando la operación sea aprobada.',
  documento: 'Documento de respaldo', tituloTabla: 'Títulos a bloquear', sinAccionistas: 'No hay accionistas activos',
};

export default function Bloqueo() {
  return <OperacionTitulos config={CONFIG} />;
}
