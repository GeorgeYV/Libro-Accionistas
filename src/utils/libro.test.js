import { reconstruirLibro, valorFecha } from './libro';

const acc = (id, acciones, extra = {}) => ({ id, acc_identificacion: id, acc_nombre_completo: id, acc_cantidad_acciones: acciones, acc_estado: 1, acc_tipo_acciones: 1, ...extra });
const op = (id, tipo, acciones, fechaAprobacion, extra = {}) => ({ id, ope_tipo: tipo, ope_acciones: acciones, ope_estado: 1, ope_fecha: fechaAprobacion, ope_fecha_aprobacion: fechaAprobacion, ...extra });
const v = (operacion, accionista, detalle) => ({ acc_ope_operacion_id: operacion, acc_ope_accionista_id: accionista, acc_ope_detalle: detalle });
const base = { herederosPorCausante: new Map() };

test('valorFecha acepta d-m-aaaa y aaaa-mm-dd', () => {
  expect(valorFecha('5-3-2026')).toBe(20260305);
  expect(valorFecha('2026-03-05')).toBe(20260305);
  expect(valorFecha('20260305')).toBe(20260305); // formato de registros antiguos
  expect(valorFecha('')).toBe(0);
});

test('sin operaciones posteriores el libro es el actual', () => {
  const r = reconstruirLibro({ ...base, accionistas: [acc('A', 60), acc('B', 40)], operaciones: [], vinculos: [], emitidoActual: 100, fechaCorte: '2026-01-01' });
  expect(r.filas.map((f) => [f.id, f.acc_cantidad_acciones, f.acc_participacion])).toEqual([['A', 60, 0.6], ['B', 40, 0.4]]);
  expect(r.advertencias).toEqual([]);
});

test('revierte una cesión posterior al corte (el cesionario nuevo no aparece)', () => {
  const r = reconstruirLibro({
    ...base,
    accionistas: [acc('A', 70), acc('C', 30)],
    operaciones: [op('O1', 3, 30, '10-6-2026')],
    vinculos: [v('O1', 'A', 'Cedente'), v('O1', 'C', 'Cesionario')],
    emitidoActual: 100, fechaCorte: '2026-06-09',
  });
  expect(r.filas.map((f) => [f.id, f.acc_cantidad_acciones])).toEqual([['A', 100]]);
  expect(r.revertidas).toBe(1);
});

test('la operación aprobada el mismo día del corte se mantiene', () => {
  const r = reconstruirLibro({
    ...base, accionistas: [acc('A', 70), acc('C', 30)], operaciones: [op('O1', 3, 30, '10-6-2026')],
    vinculos: [v('O1', 'A', 'Cedente'), v('O1', 'C', 'Cesionario')], emitidoActual: 100, fechaCorte: '2026-06-10',
  });
  expect(r.revertidas).toBe(0);
  expect(r.filas).toHaveLength(2);
});

test('aumento de capital, bloqueo y canje posteriores', () => {
  const r = reconstruirLibro({
    ...base,
    accionistas: [acc('A', 150, { acc_estado: 3 }), acc('B', 50)],
    operaciones: [op('O1', 0, 50, '1-7-2026'), op('O2', 1, 150, '2-7-2026'), op('O3', 2, 50, '3-7-2026')],
    vinculos: [v('O1', 'A', 'Aumento Capital'), v('O2', 'A', 'Bloqueo'), v('O3', 'B', 'Canje')],
    emitidoActual: 200, fechaCorte: '2026-06-30',
  });
  expect(r.totalEmitido).toBe(150);
  expect(r.filas.map((f) => [f.id, f.acc_cantidad_acciones, f.acc_estado, f.acc_tipo_acciones])).toEqual([['A', 100, 1, 1], ['B', 50, 1, 0]]);
  expect(r.advertencias).toEqual([]);
});

test('posesión efectiva posterior: el causante recupera y los herederos devuelven', () => {
  const r = reconstruirLibro({
    herederosPorCausante: new Map([['M', [{ her_identificacion: 'H1', her_cant_acciones: 60 }, { her_identificacion: 'H2', her_cant_acciones: 40 }]]]),
    accionistas: [acc('M', 0), acc('H1', 60), acc('H2', 40)],
    operaciones: [op('O1', 6, 100, '1-8-2026')],
    vinculos: [v('O1', 'M', 'Cedente')],
    emitidoActual: 100, fechaCorte: '2026-07-31',
  });
  expect(r.filas.map((f) => [f.id, f.acc_cantidad_acciones])).toEqual([['M', 100]]);
});

test('advierte anulaciones que pudieron estar vigentes al corte', () => {
  const r = reconstruirLibro({
    ...base, accionistas: [acc('A', 100)], vinculos: [], emitidoActual: 100, fechaCorte: '2026-06-15',
    operaciones: [op('O1', 3, 10, '20-6-2026', { ope_estado: 3, ope_fecha: '10-6-2026' })],
  });
  expect(r.advertencias[0]).toMatch(/pudo estar vigente/);
});
