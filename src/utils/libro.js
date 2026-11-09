// Reconstrucción del libro de accionistas a una fecha de corte (solo lectura): parte del estado actual y revierte,
// en memoria, el efecto de cada operación aprobada después de la fecha de corte.

// Fechas de operación -> número aaaammdd (comparable). Los datos tienen "d-m-aaaa", "aaaammdd" (registros antiguos)
// y los filtros usan "aaaa-mm-dd".
export function valorFecha(fecha) {
  const texto = String(fecha || '').trim();
  if (/^\d{8}$/.test(texto)) return Number(texto);
  const partes = texto.split('-').map(Number);
  if (partes.length !== 3 || partes.some(Number.isNaN)) return 0;
  const [a, m, d] = partes[0] > 31 ? partes : [partes[2], partes[1], partes[0]];
  return a * 10000 + m * 100 + d;
}

/**
 * accionistas: estado actual (acc_cantidad_acciones, acc_estado, acc_tipo_acciones).
 * operaciones: todas las operaciones; vinculos: AccionistaOperacion de esas operaciones.
 * herederosPorCausante: Map causanteId -> [Heredero] (cantidades de la posesión efectiva).
 * emitidoActual: Parametro.cantidadEmitida. fechaCorte: "aaaa-mm-dd" (incluye las aprobadas ese día).
 * Devuelve { filas, totalEmitido, advertencias, revertidas }.
 */
export function reconstruirLibro({ accionistas, operaciones, vinculos, herederosPorCausante, emitidoActual, fechaCorte }) {
  const corte = valorFecha(fechaCorte);
  const estado = new Map(accionistas.map((a) => [a.id, {
    acciones: a.acc_cantidad_acciones || 0, acc_estado: a.acc_estado, acc_tipo_acciones: a.acc_tipo_acciones,
  }]));
  const asegurar = (id) => {
    if (!estado.has(id)) estado.set(id, { acciones: 0, acc_estado: 1, acc_tipo_acciones: 1 });
    return estado.get(id);
  };
  const porOperacion = new Map();
  vinculos.forEach((v) => {
    if (!porOperacion.has(v.acc_ope_operacion_id)) porOperacion.set(v.acc_ope_operacion_id, []);
    porOperacion.get(v.acc_ope_operacion_id).push(v);
  });
  const vinculo = (op, detalles) => (porOperacion.get(op.id) || []).find((v) => detalles.includes(v.acc_ope_detalle));

  let totalEmitido = emitidoActual || 0;
  const advertencias = [];
  // Se revierten de la más reciente a la más antigua.
  const posteriores = operaciones
    .filter((op) => op.ope_estado === 1 && valorFecha(op.ope_fecha_aprobacion) > corte)
    .sort((a, b) => valorFecha(b.ope_fecha_aprobacion) - valorFecha(a.ope_fecha_aprobacion));

  posteriores.forEach((op) => {
    const n = op.ope_acciones || 0;
    const principal = vinculo(op, ['Cedente', 'Canje', 'Bloqueo', 'Desbloqueo', 'Aumento Capital']);
    if (!principal) {
      advertencias.push(`Operación ${op.id} (${op.ope_fecha_aprobacion}) sin accionista vinculado: no se pudo revertir.`);
      return;
    }
    const p = asegurar(principal.acc_ope_accionista_id);
    switch (op.ope_tipo) {
      case 0: p.acciones -= n; totalEmitido -= n; break; // aumento de capital
      case 1: p.acc_estado = 1; break; // bloqueo: estaba activo
      case 4: p.acc_estado = 3; break; // desbloqueo: estaba bloqueado
      case 2: p.acc_tipo_acciones = 0; break; // canje: tenía ordinarias
      case 6: { // posesión efectiva: el causante recupera; cada heredero devuelve su parte
        p.acciones += n;
        const herederos = (herederosPorCausante.get(principal.acc_ope_accionista_id) || []).filter((h) => h.her_cant_acciones > 0);
        const repartido = herederos.reduce((s, h) => s + h.her_cant_acciones, 0);
        if (repartido !== n) advertencias.push(`Posesión efectiva ${op.id}: las cantidades actuales de los herederos (${repartido}) no suman la operación (${n}).`);
        herederos.forEach((h) => { asegurar(h.her_identificacion).acciones -= h.her_cant_acciones; });
        break;
      }
      default: { // cesión, donación, testamento
        const c = vinculo(op, ['Cesionario']);
        if (!c) { advertencias.push(`Operación ${op.id} sin cesionario vinculado: no se pudo revertir.`); return; }
        p.acciones += n;
        asegurar(c.acc_ope_accionista_id).acciones -= n;
      }
    }
  });

  // Anuladas: la fecha guardada es la de anulación (se pierde la de aprobación). Si se solicitaron antes del corte y se
  // anularon después, pudieron estar vigentes al corte: se avisa para revisión manual.
  operaciones
    .filter((op) => op.ope_estado === 3 && valorFecha(op.ope_fecha) <= corte && valorFecha(op.ope_fecha_aprobacion) > corte)
    .forEach((op) => advertencias.push(`Operación ${op.id} solicitada el ${op.ope_fecha} y anulada el ${op.ope_fecha_aprobacion}: pudo estar vigente al corte.`));

  const porId = new Map(accionistas.map((a) => [a.id, a]));
  const filas = [...estado.entries()]
    .filter(([, e]) => e.acciones > 0)
    .map(([id, e]) => ({
      ...(porId.get(id) || { id, acc_identificacion: id, acc_nombre_completo: '(no registrado)' }),
      acc_cantidad_acciones: e.acciones,
      acc_estado: e.acc_estado,
      acc_tipo_acciones: e.acc_tipo_acciones,
      acc_participacion: totalEmitido ? e.acciones / totalEmitido : 0,
    }))
    .sort((a, b) => (a.acc_nombre_completo || '').localeCompare(b.acc_nombre_completo || ''));

  [...estado.entries()].filter(([, e]) => e.acciones < 0)
    .forEach(([id, e]) => advertencias.push(`El accionista ${id} queda con ${e.acciones} acciones al revertir: revise sus operaciones.`));
  const suma = filas.reduce((s, f) => s + f.acc_cantidad_acciones, 0);
  if (suma !== totalEmitido) advertencias.push(`Las acciones del libro suman ${suma}; el total emitido al corte es ${totalEmitido}.`);

  return { filas, totalEmitido, advertencias, revertidas: posteriores.length };
}
