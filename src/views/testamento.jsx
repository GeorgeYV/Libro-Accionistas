import React from 'react';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import OperacionTransferencia from '../components/operacionTransferencia';

// Testamento (ope_tipo 7). Documentos en el orden de ope_documento: cs, cg, ci, es, cp.
const CONFIG = {
  tipo: 7, icono: <DescriptionOutlinedIcon />, titulo: 'Testamento',
  descripcion: 'Transfiere por testamento las acciones del testador al beneficiario. Los títulos se mueven al aprobarse la operación.',
  etiquetaCedente: 'Testador', etiquetaCesionario: 'Beneficiario',
  documentos: ['Carta de testamento', 'Escritura de testamento', 'Pago de impuestos', 'Poder', 'Declaración jurada'],
};

export default function Testamento() {
  return <OperacionTransferencia config={CONFIG} />;
}
