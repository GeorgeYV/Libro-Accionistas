// Funciones puras de certificados de acciones.

// Identificación para mostrar en público: conserva los 2 primeros y 2 últimos caracteres.
export function enmascarar(identificacion) {
  const texto = String(identificacion || '');
  if (texto.length <= 4) return '*'.repeat(Math.max(texto.length - 1, 0)) + texto.slice(-1);
  return texto.slice(0, 2) + '*'.repeat(texto.length - 4) + texto.slice(-2);
}

// Accionistas cuyas acciones o estado cambian con la operación (sus certificados dejan de ser vigentes).
export function accionistasAfectados({ principal, cesionario, herederos = [] }) {
  const ids = [principal && principal.id, cesionario && cesionario.id, ...herederos.map((h) => h.her_identificacion)];
  return [...new Set(ids.filter(Boolean))];
}
