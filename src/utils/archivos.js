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

// ---- Descarga: tipo real del archivo y nombre con extensión ---------------------------------------
// S3 guarda los archivos como "binary/octet-stream": sin el tipo, el navegador descarga el PDF con el nombre del blob
// y sin extensión. Se detecta por la firma del contenido y, si no se reconoce, por la extensión del nombre.
const TIPOS = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  png: 'image/png',
  jpg: 'image/jpeg',
  csv: 'text/csv',
};
const empieza = (bytes, firma) => firma.every((b, i) => bytes[i] === b);

// cabecera: primeros bytes (Uint8Array). Devuelve { extension, tipo }; extension '' si no se reconoce.
export function tipoArchivo(nombre, cabecera) {
  const bytes = Array.from(cabecera || []);
  const deNombre = ((/\.([a-z0-9]+)$/i.exec(nombre || '') || [])[1] || '').toLowerCase();
  let extension = deNombre;
  if (empieza(bytes, [0x25, 0x50, 0x44, 0x46])) extension = 'pdf'; // %PDF
  else if (empieza(bytes, [0x89, 0x50, 0x4e, 0x47])) extension = 'png';
  else if (empieza(bytes, [0xff, 0xd8, 0xff])) extension = 'jpg';
  else if (empieza(bytes, [0xd0, 0xcf, 0x11, 0xe0])) extension = 'doc';
  else if (empieza(bytes, [0x50, 0x4b, 0x03, 0x04]) && !['docx', 'xlsx'].includes(deNombre)) extension = 'docx'; // ZIP de Office
  return { extension, tipo: TIPOS[extension] || 'application/octet-stream' };
}

// Nombre para guardar: sin el uuid que se antepone al subir y con la extensión del tipo real.
export function nombreDescarga(clave, extension) {
  const base = String(clave || '').replace(/^(public\/)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, '').trim() || 'documento';
  if (!extension) return base;
  const conExtension = base.toLowerCase().endsWith(`.${extension}`);
  return `${conExtension ? base.slice(0, -extension.length - 1) : base}.${extension}`;
}
