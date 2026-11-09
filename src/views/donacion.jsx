import React from 'react';
import CardGiftcardIcon from '@material-ui/icons/CardGiftcard';
import OperacionTransferencia from '../components/operacionTransferencia';

// Donación (ope_tipo 5). Documentos en el orden de ope_documento: cs, cg, ci, es, cp.
const CONFIG = {
  tipo: 5, icono: <CardGiftcardIcon />, titulo: 'Donación',
  descripcion: 'Dona acciones a otro accionista. Los títulos se mueven al aprobarse la operación.',
  etiquetaCedente: 'Donante', etiquetaCesionario: 'Donatario',
  documentos: ['Carta de donación', 'Escritura de donación de bienes', 'Pago de impuestos', 'Poder', 'Declaración jurada'],
};

export default function Donacion() {
  return <OperacionTransferencia config={CONFIG} />;
}
