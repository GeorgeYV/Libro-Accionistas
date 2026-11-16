import { textoAnulacion, MOTIVOS_ANULACION, esHistorica, INGRESADOR_HISTORICO } from './aprobacion';

test('motivo de anulación: obligatorio, "Otro" exige detalle y se guarda con el detalle', () => {
  expect(textoAnulacion('Operación duplicada', '  ')).toBe('Operación duplicada');
  expect(textoAnulacion('Solicitud del accionista', 'carta del 10-11-2026')).toBe('Solicitud del accionista: carta del 10-11-2026');
  expect(textoAnulacion('Otro', 'error del banco')).toBe('Otro: error del banco');
  expect(() => textoAnulacion('', '')).toThrow('Seleccione el motivo');
  expect(() => textoAnulacion('Inventado', 'x')).toThrow('Seleccione el motivo');
  expect(() => textoAnulacion('Otro', ' ')).toThrow('Describa el motivo');
  expect(MOTIVOS_ANULACION).toContain('Otro');
});

test('operaciones históricas del Kárdex: solo consulta', () => {
  expect(esHistorica({ ope_ingresador: INGRESADOR_HISTORICO })).toBe(true);
  expect(esHistorica({ ope_ingresador: 'alexander' })).toBe(false);
  expect(esHistorica(null)).toBe(false);
});
