// Funciones puras de la vista de accionistas.

export const ESTADOS_ACCIONISTA = [
  { valor: 1, etiqueta: 'Activos', singular: 'Activo' },
  { valor: 3, etiqueta: 'Bloqueados', singular: 'Bloqueado' },
  { valor: 2, etiqueta: 'Inactivos', singular: 'Inactivo' },
  { valor: 0, etiqueta: 'Herederos', singular: 'Heredero' },
];
export const TIPOS_IDENTIFICACION = { 0: 'Cédula', 1: 'RUC', 2: 'Pasaporte' };
export const ESTADOS_CIVILES = { 0: 'Soltero', 1: 'Casado', 2: 'Unión de hecho', 3: 'Divorciado', 4: 'Viudo' };
export const TIPOS_TITULO = { 0: 'Bloqueado', 1: 'Activo' };

const CAMPOS_PN = ['pn_primer_nombre', 'pn_segundo_nombre', 'pn_apellido_paterno', 'pn_apellido_materno', 'pn_estado_civil', 'pn_doc_identificacion'];
const CAMPOS_PJ = ['pj_rl_tipo_identificacion', 'pj_razon_social', 'pj_rl_identificacion', 'pj_rl_nombre', 'pj_rl_nacionalidad',
  'pj_rl_telefono', 'pj_rl_email', 'pj_doc_nombramiento'];

const tomar = (origen, campos) => Object.fromEntries(campos.map((c) => [c, origen && origen[c] != null ? origen[c] : '']));

// Une cada accionista con su ficha de persona natural o jurídica (mismo id). Los campos que no aplican quedan vacíos.
// Es el objeto que reciben los formularios de edición (personanatural / personajuridica).
export function combinarAccionistas(accionistas, personasNaturales, personasJuridicas) {
  const pn = new Map(personasNaturales.map((p) => [p.id, p]));
  const pj = new Map(personasJuridicas.map((p) => [p.id, p]));
  return accionistas.map((a) => ({
    ...a,
    ...tomar(a.acc_tipo_persona === 0 ? pn.get(a.id) : null, CAMPOS_PN),
    ...tomar(a.acc_tipo_persona === 1 ? pj.get(a.id) : null, CAMPOS_PJ),
  }));
}

// Los teléfonos, observaciones y correos se guardan separados por "&".
export const separar = (texto) => (texto ? String(texto).split('&').filter((t) => t.trim() !== '') : []);

// Búsqueda en todas las columnas de texto/número del accionista.
export function buscarAccionistas(lista, texto) {
  const t = (texto || '').trim().toLowerCase();
  if (!t) return lista;
  return lista.filter((a) => Object.values(a).some((v) => v != null && typeof v !== 'object' && String(v).toLowerCase().includes(t)));
}

// Teléfonos y observaciones se guardan en dos cadenas "&" alineadas por posición.
export function filasContacto(telefonos, observaciones) {
  const tel = telefonos ? String(telefonos).split('&') : [];
  const obs = observaciones ? String(observaciones).split('&') : [];
  return tel.map((numero, i) => ({ numero: numero.trim(), obs: (obs[i] || '').trim() })).filter((f) => f.numero !== '');
}

export function unirContacto(filas) {
  const validas = filas.filter((f) => (f.numero || '').trim() !== '');
  return { telefonos: validas.map((f) => f.numero.trim()).join('&'), observaciones: validas.map((f) => (f.obs || '').trim()).join('&') };
}

// Opciones de un select incluyendo el valor actual si no está en la lista (datos antiguos).
export const conValorActual = (opciones, valor) => (valor && !opciones.includes(valor) ? [...opciones, valor] : opciones);

/**
 * Cambios de herederos al guardar: conserva los registros existentes cuya identificación sigue en la lista
 * (para no perder her_cant_acciones), crea los nuevos y elimina los quitados.
 */
export function planHerederos(existentes, nuevos) {
  const lista = nuevos
    .map((h) => ({ her_identificacion: (h.her_identificacion || '').trim(), her_nombre: (h.her_nombre || '').trim() }))
    .filter((h) => h.her_identificacion !== '');
  const porIdentificacion = new Map(existentes.map((e) => [e.her_identificacion, e]));
  const usados = new Set();
  const crear = [];
  const actualizar = [];
  lista.forEach((h) => {
    const previo = porIdentificacion.get(h.her_identificacion);
    if (previo && !usados.has(previo.id)) {
      usados.add(previo.id);
      if (previo.her_nombre !== h.her_nombre) actualizar.push({ id: previo.id, her_nombre: h.her_nombre });
    } else {
      crear.push(h);
    }
  });
  return { crear, actualizar, eliminar: existentes.filter((e) => !usados.has(e.id)).map((e) => e.id), total: lista.length };
}

// ---- Formato de identificación y nombres (formularios de persona natural y jurídica) -------------------------
// Cédula (tipo 0) y RUC (tipo 1): solo números. Pasaporte (tipo 2): letras y números.
const soloNumeros = (tipo) => Number(tipo) === 0 || Number(tipo) === 1;
const LETRAS = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ';

// Filtros al escribir: quitan los caracteres no permitidos.
export const limpiarIdentificacion = (valor, tipo) => String(valor).replace(soloNumeros(tipo) ? /[^0-9]/g : /[^A-Za-z0-9]/g, '');
export const limpiarNombre = (valor) => String(valor).replace(new RegExp(`[^${LETRAS} ]`, 'g'), '').replace(/ {2,}/g, ' ');

// Validación al guardar (datos pegados, cambio de tipo o registros antiguos). '' = correcto o vacío.
export function problemaIdentificacion(valor, tipo) {
  const v = String(valor == null ? '' : valor).trim();
  if (!v) return '';
  if (soloNumeros(tipo)) return /^[0-9]+$/.test(v) ? '' : `${Number(tipo) === 1 ? 'El RUC' : 'La cédula'} solo admite números`;
  return /^[A-Za-z0-9]+$/.test(v) ? '' : 'El pasaporte solo admite letras y números';
}
export function problemaNombre(valor) {
  const v = String(valor == null ? '' : valor).trim();
  return !v || new RegExp(`^[${LETRAS}]+( [${LETRAS}]+)*$`).test(v) ? '' : 'Solo se admiten letras';
}
