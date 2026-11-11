// Catálogo de países (tabla Pais). Se guarda el NOMBRE del país en los accionistas, igual que antes.
import { API } from 'aws-amplify';
import { listarTodos } from './listarTodos';

// Lista usada antes del catálogo: respaldo si el catálogo está vacío o no carga.
export const PAISES_RESPALDO = ['Ecuador', 'Perú', 'Estados Unidos'];

const CAMPOS = 'id nombre nombreCorto nacionalidad codigoTelefono estado paraisoFiscal';
const listar = /* GraphQL */ `
  query ListarPaises($limit: Int, $nextToken: String) {
    listPais(limit: $limit, nextToken: $nextToken) { items { ${CAMPOS} } nextToken }
  }
`;
const crear = /* GraphQL */ `mutation CrearPais($input: CreatePaisInput!) { createPais(input: $input) { ${CAMPOS} } }`;
const actualizar = /* GraphQL */ `mutation ActualizarPais($input: UpdatePaisInput!) { updatePais(input: $input) { ${CAMPOS} } }`;

const normal = (t) => String(t || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Una sola carga por sesión (se comparte entre formularios, Parámetros y dividendos).
let cache = null;
export function cargarPaises({ recargar = false } = {}) {
  if (!cache || recargar) {
    cache = listarTodos(listar, 'listPais')
      .then((l) => l.sort((a, b) => a.nombre.localeCompare(b.nombre)))
      .catch((err) => { cache = null; throw err; });
  }
  return cache;
}

// Nombres de países activos para los selectores; si no hay catálogo, la lista anterior.
export async function nombresPaises() {
  try {
    const activos = (await cargarPaises()).filter((p) => p.estado === 'Activo').map((p) => p.nombre);
    return activos.length ? activos : PAISES_RESPALDO;
  } catch (err) {
    console.log('No se pudo cargar el catálogo de países:', err);
    return PAISES_RESPALDO;
  }
}

// Nombres (normalizados) de los países marcados como paraíso fiscal.
export async function paraisosFiscales() {
  try {
    return new Set((await cargarPaises()).filter((p) => p.paraisoFiscal).map((p) => normal(p.nombre)));
  } catch (err) {
    console.log('No se pudo cargar el catálogo de países:', err);
    return new Set();
  }
}

// Crea o actualiza un país. El nombre no cambia al editar: es el valor guardado en los accionistas.
export async function guardarPais(pais, existentes) {
  const datos = {
    nombre: (pais.nombre || '').trim(),
    nombreCorto: (pais.nombreCorto || '').trim().toUpperCase(),
    nacionalidad: (pais.nacionalidad || '').trim(),
    codigoTelefono: (pais.codigoTelefono || '').trim(),
    estado: pais.estado === 'Inactivo' ? 'Inactivo' : 'Activo',
    paraisoFiscal: !!pais.paraisoFiscal,
  };
  if (!datos.nombre || !datos.nacionalidad) throw new Error('Indique el nombre y la nacionalidad del país.');
  if (!/^[A-Z]{2}$/.test(datos.nombreCorto)) throw new Error('El código del país debe tener 2 letras (ISO), por ejemplo EC.');
  if (existentes.some((p) => p.id !== pais.id && normal(p.nombre) === normal(datos.nombre))) throw new Error(`El país "${datos.nombre}" ya existe.`);
  if (existentes.some((p) => p.id !== pais.id && p.nombreCorto === datos.nombreCorto)) throw new Error(`El código ${datos.nombreCorto} ya está en uso.`);
  const resultado = pais.id
    ? (await API.graphql({ query: actualizar, variables: { input: { id: pais.id, ...datos, nombre: undefined } } })).data.updatePais
    : (await API.graphql({ query: crear, variables: { input: datos } })).data.createPais;
  cache = null;
  return resultado;
}
