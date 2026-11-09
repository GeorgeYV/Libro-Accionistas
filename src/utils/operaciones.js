// Validación de la selección de títulos en cesión, donación y testamento.

/**
 * seleccion: [{ titulo: { id, tit_acciones }, acciones }] (acciones a transferir de cada título seleccionado).
 * El blotter solo admite transferencia parcial sobre un único título: si hay varios, deben ir completos.
 * Devuelve { total, parcial, error }.
 */
export function validarSeleccion(seleccion) {
  if (seleccion.length === 0) return { total: 0, parcial: false, error: 'Seleccione al menos un título.' };
  for (const { titulo, acciones } of seleccion) {
    if (!Number.isInteger(acciones) || acciones <= 0) return { total: 0, parcial: false, error: `Ingrese las acciones a transferir del título ${titulo.id}.` };
    if (acciones > titulo.tit_acciones) {
      return { total: 0, parcial: false, error: `El título ${titulo.id} tiene ${titulo.tit_acciones} acciones; no se pueden transferir ${acciones}.` };
    }
  }
  const total = seleccion.reduce((s, x) => s + x.acciones, 0);
  const parcial = seleccion.some((x) => x.acciones < x.titulo.tit_acciones);
  if (parcial && seleccion.length > 1) {
    return { total, parcial, error: 'Una transferencia parcial solo puede hacerse sobre un título. Transfiera los demás completos o registre otra operación.' };
  }
  return { total, parcial, error: '' };
}

// Reparto inicial entre herederos: respeta cantidades ya guardadas si suman el total; si no, divide en partes
// iguales y el residuo va al primero (mismo criterio que tenía la pantalla).
export function repartoInicial(herederos, total) {
  const guardadas = herederos.map((h) => h.her_cant_acciones || 0);
  if (guardadas.reduce((s, x) => s + x, 0) === total && total > 0) return guardadas;
  const n = herederos.length;
  if (!n) return [];
  const parte = Math.trunc(total / n);
  return herederos.map((_, i) => parte + (i === 0 ? total % n : 0));
}

// El blotter reparte el título entre los herederos con acciones > 0: la suma debe ser exactamente el total.
export function validarReparto(cantidades, total) {
  if (cantidades.some((c) => !Number.isInteger(c) || c < 0)) return { asignado: 0, error: 'Las acciones de cada heredero deben ser números enteros.' };
  const asignado = cantidades.reduce((s, c) => s + c, 0);
  if (!cantidades.some((c) => c > 0)) return { asignado, error: 'Asigne acciones al menos a un heredero.' };
  if (asignado !== total) {
    return { asignado, error: asignado > total ? `Se asignaron ${asignado - total} acciones de más.` : `Faltan asignar ${total - asignado} acciones.` };
  }
  return { asignado, error: '' };
}
