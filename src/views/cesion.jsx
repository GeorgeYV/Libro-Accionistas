import React from 'react';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import OperacionTransferencia from '../components/operacionTransferencia';

// Cesión (ope_tipo 3). Documentos en el orden de ope_documento: cs, cg, ci, es, cp.
const CONFIG = {
  tipo: 3, icono: <SwapHorizIcon />, titulo: 'Cesión',
  descripcion: 'Transfiere acciones de un accionista a otro. Los títulos se mueven al aprobarse la operación.',
  etiquetaCedente: 'Cedente', etiquetaCesionario: 'Cesionario',
  documentos: ['Carta de cesión y gerente', 'Documentos de identidad', 'Carta de instrucciones', 'Respaldo de adquisición', 'Poderes'],
};

export default function Cesion() {
  return <OperacionTransferencia config={CONFIG} />;
}
