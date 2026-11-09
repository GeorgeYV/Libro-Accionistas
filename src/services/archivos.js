import { Storage } from 'aws-amplify';
import { uuid } from 'uuidv4';

// Sube un archivo a S3 con nombre único y devuelve la clave guardada en la base.
export async function subirArchivo(archivo) {
  const nombre = uuid() + archivo.name;
  await Storage.put(nombre, archivo);
  return nombre;
}

export async function abrirArchivo(nombre) {
  window.open(await Storage.get(nombre));
}
