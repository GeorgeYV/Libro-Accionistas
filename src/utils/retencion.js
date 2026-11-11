// Retención de dividendos parametrizable (Parametro.reglasRetencion). Funciones puras.
//
// Regla: { persona, residencia, nacionalidad, porcentaje, sbu }
//   persona:      'Natural' | 'Jurídica' | 'Todas'
//   residencia:   'Ecuador' | 'Exterior' | 'Paraíso fiscal' | 'Cualquiera' | nombre de un país (p. ej. 'Panamá')
//                 'Paraíso fiscal' = país de residencia marcado así en el catálogo de países (acc_paraiso_fiscal).
//   nacionalidad: 'Ecuatoriana' | 'Otra' | 'Cualquiera'
//   porcentaje:   % sobre el dividendo acumulado del año; sbu: salarios básicos que se restan.
// Se aplica la PRIMERA regla que coincide (las excepciones van arriba). Sin coincidencia: 0%.

export const PERSONAS = ['Natural', 'Jurídica', 'Todas'];
export const RESIDENCIAS = ['Ecuador', 'Exterior', 'Paraíso fiscal', 'Cualquiera'];
const CATEGORIAS = ['ecuador', 'exterior', 'paraiso fiscal', 'cualquiera'];
export const NACIONALIDADES = ['Ecuatoriana', 'Otra', 'Cualquiera'];

// Equivalente exacto a la regla que estaba fija en el código (ver retencion.test.js).
export const REGLAS_INICIALES = [
  { persona: 'Natural', residencia: 'Ecuador', nacionalidad: 'Ecuatoriana', porcentaje: 14, sbu: 3 },
  { persona: 'Natural', residencia: 'Ecuador', nacionalidad: 'Otra', porcentaje: 12, sbu: 3 },
  { persona: 'Natural', residencia: 'Panamá', nacionalidad: 'Ecuatoriana', porcentaje: 10, sbu: 0 },
  { persona: 'Natural', residencia: 'Exterior', nacionalidad: 'Ecuatoriana', porcentaje: 14, sbu: 0 },
  { persona: 'Natural', residencia: 'Exterior', nacionalidad: 'Otra', porcentaje: 10, sbu: 0 },
  { persona: 'Jurídica', residencia: 'Ecuador', nacionalidad: 'Cualquiera', porcentaje: 0, sbu: 0 },
  { persona: 'Jurídica', residencia: 'Exterior', nacionalidad: 'Ecuatoriana', porcentaje: 12, sbu: 3 },
  { persona: 'Jurídica', residencia: 'Exterior', nacionalidad: 'Otra', porcentaje: 10, sbu: 0 },
];

const redondear2 = (x) => Math.round(x * 100) / 100;
// Comparación de textos sin mayúsculas, espacios ni tildes ("Panamá" = "panama ").
export const normal = (t) => String(t || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Lista de reglas desde el valor guardado (AWSJSON llega como texto). Si no hay o es inválido: las iniciales.
export function leerReglas(valor) {
  try {
    const reglas = typeof valor === 'string' ? JSON.parse(valor) : valor;
    return Array.isArray(reglas) && reglas.length && !validarReglas(reglas).length ? reglas : REGLAS_INICIALES;
  } catch (e) {
    return REGLAS_INICIALES;
  }
}

// Errores de la lista (vacía si es válida). Cada error indica la fila (1..n).
export function validarReglas(reglas) {
  const errores = [];
  if (!Array.isArray(reglas) || !reglas.length) return ['Debe existir al menos una regla.'];
  reglas.forEach((r, i) => {
    const fila = `Regla ${i + 1}`;
    if (!PERSONAS.includes(r.persona)) errores.push(`${fila}: tipo de persona inválido.`);
    if (!normal(r.residencia)) errores.push(`${fila}: indique la residencia.`);
    if (!NACIONALIDADES.includes(r.nacionalidad)) errores.push(`${fila}: nacionalidad inválida.`);
    if (!(typeof r.porcentaje === 'number' && r.porcentaje >= 0 && r.porcentaje <= 100)) errores.push(`${fila}: el porcentaje debe estar entre 0 y 100.`);
    if (!(Number.isInteger(r.sbu) && r.sbu >= 0)) errores.push(`${fila}: los SBU a descontar deben ser un entero mayor o igual a 0.`);
  });
  return errores;
}

// Tipo de persona del accionista (acc_tipo_persona; si falta, RUC = jurídica).
export const personaDe = (acc) => {
  const tipo = acc.acc_tipo_persona != null ? Number(acc.acc_tipo_persona) : (Number(acc.acc_tipo_identificacion) === 1 ? 1 : 0);
  return tipo === 1 ? 'Jurídica' : 'Natural';
};

function coincide(regla, acc) {
  const persona = personaDe(acc);
  const residencia = normal(acc.acc_residencia);
  const ecuatoriano = normal(acc.acc_nacionalidad) === 'ecuador';
  if (regla.persona !== 'Todas' && regla.persona !== persona) return false;
  const r = normal(regla.residencia);
  if (r === 'ecuador' && residencia !== 'ecuador') return false;
  if (r === 'exterior' && residencia === 'ecuador') return false;
  if (r === 'paraiso fiscal' && acc.acc_paraiso_fiscal !== true) return false;
  if (!CATEGORIAS.includes(r) && r !== residencia) return false;
  if (regla.nacionalidad === 'Ecuatoriana' && !ecuatoriano) return false;
  if (regla.nacionalidad === 'Otra' && ecuatoriano) return false;
  return true;
}

// Marca si el país de residencia del accionista es paraíso fiscal (paraisos: Set de nombres normalizados).
export const conParaisoFiscal = (acc, paraisos) => ({ ...acc, acc_paraiso_fiscal: paraisos.has(normal(acc.acc_residencia)) });

// Índice de la regla que aplica al accionista (-1 si ninguna).
export const indiceRegla = (acc, reglas) => reglas.findIndex((r) => coincide(r, acc));

// Retención sobre el dividendo acumulado del año (base). acc: { acc_tipo_persona, acc_residencia, acc_nacionalidad }.
export function calcularRetencion(base, acc, reglas, sbu) {
  const regla = reglas[indiceRegla(acc || {}, reglas)];
  if (!regla) return 0;
  const retencion = redondear2(base * regla.porcentaje / 100 - regla.sbu * (sbu || 0));
  return retencion < 0 ? 0 : retencion;
}
