// Funciones puras para la lista de asistencia de una asamblea.

export const NUMERO_TEMAS = 10;

// Votos iniciales de un registro: a favor en cada tema que tenga texto.
export function votosIniciales(asamblea) {
  const votos = {};
  for (let n = 1; n <= NUMERO_TEMAS; n++) {
    if (asamblea['votacionTema' + n]) votos['votacion' + n] = true;
  }
  return votos;
}

/**
 * Lista virtual de asistencia: todos los accionistas activos con acciones (sin registro en la base) más los
 * registros guardados de la asamblea. Solo existe un registro cuando alguien se marca presente o se agrega
 * con representante. Los registros de accionistas que ya no están activos se conservan.
 */
export function unirListaAsistencia(activos, registros) {
  const porAccionista = new Map(registros.map((r) => [r.accionistaID, r]));
  const lista = activos.map((a) => porAccionista.get(a.id) || {
    id: `v-${a.id}`,
    virtual: true,
    accionistaID: a.id,
    nombre: a.acc_nombre_completo || '',
    identificacion: a.acc_identificacion || a.id,
    acciones: a.acc_cantidad_acciones || 0,
    estado: a.acc_estado,
    presente: false,
    representanteNombre: '',
    representanteDocumento: '',
    representanteDI: '',
  });
  const activosIds = new Set(activos.map((a) => a.id));
  registros.forEach((r) => { if (!activosIds.has(r.accionistaID)) lista.push(r); });
  return lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
}

export function filtrarPorNombre(lista, texto) {
  const t = (texto || '').trim().toLowerCase();
  if (!t) return lista;
  return lista.filter((i) => (i.nombre || '').toLowerCase().includes(t) || String(i.identificacion || '').includes(t));
}

export const TEMAS = Array.from({ length: NUMERO_TEMAS }, (_, i) => i + 1);
export const ESTADOS_CERRADOS = ['Realizada', 'DividendoGenerado'];
export const asambleaCerrada = (asamblea) => ESTADOS_CERRADOS.includes(asamblea && asamblea.estado);
// Temas con texto de una asamblea (o de un formulario).
export const temasDe = (asamblea) => TEMAS.filter((n) => asamblea && asamblea['votacionTema' + n]);
export const tieneRepresentante = (r) => !!r.representanteNombre && r.representanteNombre !== 'undefined';

/**
 * Quórum de la asamblea a partir de los registros guardados.
 * totalAccionistas: accionistas de la lista (activos con acciones); emitido: acciones emitidas.
 */
export function resumenQuorum(registros, totalAccionistas, emitido, valorNominal) {
  const grupo = (personas, acciones) => ({
    personas,
    acciones,
    capital: acciones * valorNominal,
    pctCapital: emitido ? acciones * 100 / emitido : 0,
    pctPersonas: totalAccionistas ? personas * 100 / totalAccionistas : 0,
  });
  const suma = (lista) => lista.reduce((s, r) => s + (r.acciones || 0), 0);
  const presentes = registros.filter((r) => r.presente === true);
  const directos = presentes.filter((r) => !tieneRepresentante(r));
  const representados = presentes.filter(tieneRepresentante);
  return {
    total: grupo(totalAccionistas, emitido),
    quorum: grupo(presentes.length, suma(presentes)),
    presentes: grupo(directos.length, suma(directos)),
    representados: grupo(representados.length, suma(representados)),
    ausentes: grupo(totalAccionistas - presentes.length, emitido - suma(presentes)),
  };
}

// Votos de un tema entre los presentes, por personas.
export function conteoVotos(registros, tema) {
  const presentes = registros.filter((r) => r.presente === true);
  const aFavor = presentes.filter((r) => r['votacion' + tema] === true).length;
  return { aFavor, enContra: presentes.length - aFavor };
}
