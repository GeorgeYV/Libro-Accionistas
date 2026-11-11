import { Storage } from 'aws-amplify';
import { uuid } from 'uuidv4';
import { motivoNoPdf, motivoTamano } from '../utils/archivos';

const rechazar = (archivo, motivo) => new Error(`El documento "${archivo.name}" no se cargó porque ${motivo}.`);

// Aplica a toda subida, sea PDF o no.
function validarTamano(archivo) {
  const motivo = motivoTamano(archivo.size);
  if (motivo) throw rechazar(archivo, motivo);
}

// Lanza un error con mensaje para el usuario si el archivo no es un PDF (no confía en la extensión).
export async function validarPdf(archivo) {
  validarTamano(archivo);
  const cabecera = new Uint8Array(await archivo.slice(0, 5).arrayBuffer());
  const motivo = motivoNoPdf(archivo.name, archivo.type, cabecera);
  if (motivo) throw new Error(`Solo se permiten documentos PDF: "${archivo.name}" no se cargó porque ${motivo}.`);
}

// Sube un archivo a S3 con nombre único y devuelve la clave guardada en la base.
// Solo PDF, salvo que se indique lo contrario (modelos de carta en Word de Parámetros).
export async function subirArchivo(archivo, { soloPdf = true } = {}) {
  if (soloPdf) await validarPdf(archivo); else validarTamano(archivo);
  const nombre = uuid() + archivo.name;
  await Storage.put(nombre, archivo);
  return nombre;
}

// Abre un PDF en otra pestaña o descarga otro tipo de archivo (Word) con su nombre original.
// Se descarga antes de abrir para avisar si no existe (antes se abría el error XML de S3).
export async function abrirArchivo(nombre) {
  if (!nombre || nombre.startsWith('{')) {
    // Valores antiguos guardados como "{filename=...}" por un error ya corregido: no apuntan a un archivo real.
    throw new Error('El documento no está disponible (se registró con un formato antiguo). Vuelva a subirlo.');
  }
  let archivo;
  try {
    archivo = await Storage.get(nombre, { download: true });
  } catch (err) {
    console.log('No se pudo descargar el documento:', err);
    throw new Error('El documento no se encuentra en el almacenamiento. Vuelva a subirlo.');
  }
  const url = URL.createObjectURL(archivo.Body);
  if (/\.pdf$/i.test(nombre)) {
    window.open(url);
  } else {
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, '');
    enlace.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
