// Validación pura de documentos PDF: extensión, tipo declarado y firma del contenido ("%PDF-").
export const ACEPTA_PDF = 'application/pdf,.pdf';
const TIPOS_PDF = ['application/pdf', 'application/x-pdf', ''];

// cabecera: primeros bytes del archivo (Uint8Array). Devuelve el motivo del rechazo o null si es un PDF.
export function motivoNoPdf(nombre, tipo, cabecera) {
  if (!/\.pdf$/i.test(nombre || '')) return 'la extensión no es .pdf';
  if (!TIPOS_PDF.includes(tipo || '')) return 'el tipo de archivo no es PDF';
  const firma = String.fromCharCode(...Array.from(cabecera || []).slice(0, 5));
  if (firma !== '%PDF-') return 'el contenido no es un PDF válido';
  return null;
}

export const TAMANO_MAXIMO_MB = 10;
export const motivoTamano = (bytes) => (bytes > TAMANO_MAXIMO_MB * 1024 * 1024 ? `supera el tamaño máximo de ${TAMANO_MAXIMO_MB} MB` : null);

// Modelos de cartas que se suben en Parámetros (campo de Parametro, etiqueta) y descarga el accionista en su portal.
export const MODELOS_CARTA = [
  ['modeloCartaCesion', 'Carta de cesión'],
  ['modeloCartaGerente', 'Carta de gerente'],
  ['modeloCartaInstrucciones', 'Carta de instrucciones'],
  ['modeloSolicitudDividendos', 'Solicitud de dividendos'],
];
