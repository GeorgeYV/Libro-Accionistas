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

// ---- Estado del accionista según sus acciones ---------------------------------------------------
// acc_estado: 0 heredero (ficha incompleta), 1 activo, 2 inactivo (sin acciones), 3 bloqueado.
export const ESTADO = { HEREDERO: 0, ACTIVO: 1, INACTIVO: 2, BLOQUEADO: 3 };

// Tras una operación que cambia sus acciones: sin acciones pasa a inactivo; un inactivo que recibe acciones vuelve
// a activo. Bloqueado no cambia (se maneja con bloqueo/desbloqueo) y un heredero con acciones sigue heredero.
export function estadoSegunAcciones(estado, acciones) {
  if (estado === ESTADO.BLOQUEADO) return ESTADO.BLOQUEADO;
  if (!(acciones > 0)) return ESTADO.INACTIVO;
  return estado === ESTADO.INACTIVO || estado == null ? ESTADO.ACTIVO : estado;
}

// Al guardar la ficha completa (formulario de persona natural/jurídica) un heredero pasa a activo (o inactivo sin acciones).
export function estadoAlGuardarFicha(estado, acciones) {
  if (estado === ESTADO.HEREDERO) return acciones > 0 ? ESTADO.ACTIVO : ESTADO.INACTIVO;
  return estado == null ? ESTADO.ACTIVO : estado;
}

// ---- Herederos que ya son accionistas (posesión efectiva) ---------------------------------------
const BASICOS_ACCIONISTA = [
  ['acc_identificacion', 'identificación'], ['acc_decevale', 'código DECEVALE'], ['acc_nombre_completo', 'nombre'],
  ['acc_nacionalidad', 'nacionalidad'], ['acc_pais', 'país de residencia'],
];
const BASICOS_PERSONA = {
  0: [['pn_primer_nombre', 'primer nombre'], ['pn_apellido_paterno', 'apellido paterno']],
  1: [['pj_razon_social', 'razón social']],
};
const vacio = (v) => v == null || String(v).trim() === '';

// Faltantes de la ficha (tipo de persona, ficha natural/jurídica y datos básicos). Lista vacía = completa.
export function problemasFicha(accionista, persona) {
  const tipo = accionista.acc_tipo_persona;
  if (tipo !== 0 && tipo !== 1) return ['no tiene tipo de persona (natural o jurídica)'];
  const problemas = [];
  if (!persona) problemas.push(`no tiene registrada su ficha de persona ${tipo === 0 ? 'natural' : 'jurídica'}`);
  const faltan = [
    ...BASICOS_ACCIONISTA.filter(([c]) => vacio(accionista[c])),
    ...(persona ? BASICOS_PERSONA[tipo].filter(([c]) => vacio(persona[c])) : []),
  ].map(([, etiqueta]) => etiqueta);
  if (faltan.length) problemas.push(`le falta: ${faltan.join(', ')}`);
  return problemas;
}

// Heredero sin ficha completa que se acepta igual: sigue como heredero, o quedó inactivo sin acciones
// (p. ej. lo creó una posesión efectiva que luego se anuló). Recibe las acciones en estado Heredero.
export const recibeComoHeredero = (accionista) => accionista.acc_estado === ESTADO.HEREDERO
  || (accionista.acc_estado === ESTADO.INACTIVO && !(accionista.acc_cantidad_acciones > 0));

/**
 * Problemas de un heredero que ya existe como accionista (lista vacía = puede recibir; null = no existe y se creará).
 * accionista: registro Accionista; persona: su PersonaNatural o PersonaJuridica según acc_tipo_persona.
 */
export function problemasHeredero(accionista, persona, causanteId) {
  if (!accionista) return null;
  const problemas = [];
  if (accionista.id === causanteId) problemas.push('es el mismo causante');
  if (accionista.acc_estado === ESTADO.BLOQUEADO) problemas.push('está bloqueado');
  if (problemas.length || recibeComoHeredero(accionista)) return problemas;
  return problemasFicha(accionista, persona);
}
