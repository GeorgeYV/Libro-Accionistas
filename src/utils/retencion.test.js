import { REGLAS_INICIALES, calcularRetencion, leerReglas, validarReglas, indiceRegla } from './retencion';

// Copia fija de la regla que estaba en el código antes de parametrizarla (referencia de equivalencia).
function retencionAnterior(base, persona, residente, beneficiario, sbu) {
  const r2 = (x) => Math.round(x * 100) / 100;
  let num = 0, reduccion = 0;
  const tipo = parseInt(persona, 10);
  const res = (residente || '').trim();
  const ben = (beneficiario || '').trim();
  if (tipo === 3) return r2(base * 14 / 100);
  if (tipo === 0 && res === 'Ecuador') { num = 12; reduccion = 3 * sbu; }
  if (tipo === 1 && res !== 'Ecuador') num = 10;
  if (tipo === 0 && res !== 'Ecuador') num = 10;
  if (tipo === 1 && res === 'Ecuador' && ben === 'Ecuador') num = 0;
  if (tipo === 1 && res !== 'Ecuador' && ben === 'Ecuador') { num = 12; reduccion = 3 * sbu; }
  if (tipo === 0 && res !== 'Panama' && ben === 'Ecuador') num = 14;
  const retencion = r2(base * num / 100 - reduccion);
  return retencion < 0 ? 0 : retencion;
}

test('las reglas iniciales dan exactamente lo mismo que la regla anterior', () => {
  const residencias = ['Ecuador', 'Ecuador ', 'Panama', 'Estados Unidos', 'Perú', '', null];
  const nacionalidades = ['Ecuador', 'Ecuador ', 'Estados Unidos', 'Perú', '', null];
  let casos = 0;
  [0, 1].forEach((tipo) => residencias.forEach((res) => nacionalidades.forEach((nac) => [0, 1000, 5000, 123456.78].forEach((base) => {
    const acc = { acc_tipo_persona: tipo, acc_residencia: res, acc_nacionalidad: nac };
    expect([tipo, res, nac, base, calcularRetencion(base, acc, REGLAS_INICIALES, 482)])
      .toEqual([tipo, res, nac, base, retencionAnterior(base, tipo, res, nac, 482)]);
    casos++;
  }))));
  expect(casos).toBe(336);
});

test('primera regla que coincide, país sin tildes y sin coincidencia = 0', () => {
  const natural = (res, nac) => ({ acc_tipo_persona: 0, acc_residencia: res, acc_nacionalidad: nac });
  expect(indiceRegla(natural('Panamá', 'Ecuador'), REGLAS_INICIALES)).toBe(2); // "Panamá" con tilde también aplica
  expect(calcularRetencion(1000, natural('Ecuador', 'Ecuador'), [{ persona: 'Jurídica', residencia: 'Cualquiera', nacionalidad: 'Cualquiera', porcentaje: 10, sbu: 0 }], 0)).toBe(0);
  expect(calcularRetencion(1000, { acc_tipo_identificacion: 1, acc_residencia: 'Perú', acc_nacionalidad: 'Perú' }, REGLAS_INICIALES, 0)).toBe(100); // sin tipo de persona: RUC = jurídica
});

test('leerReglas y validarReglas', () => {
  expect(leerReglas(null)).toBe(REGLAS_INICIALES);
  expect(leerReglas('no es json')).toBe(REGLAS_INICIALES);
  const propias = [{ persona: 'Todas', residencia: 'Cualquiera', nacionalidad: 'Cualquiera', porcentaje: 7.5, sbu: 0 }];
  expect(leerReglas(JSON.stringify(propias))).toEqual(propias);
  expect(validarReglas([{ persona: 'Natural', residencia: '', nacionalidad: 'Otra', porcentaje: 120, sbu: 1.5 }])).toHaveLength(3);
  expect(validarReglas([])).toHaveLength(1);
});

test('residencia Paraíso fiscal según el catálogo de países', () => {
  const { conParaisoFiscal } = require('./retencion');
  const reglas = [
    { persona: 'Todas', residencia: 'Paraíso fiscal', nacionalidad: 'Cualquiera', porcentaje: 25, sbu: 0 },
    { persona: 'Todas', residencia: 'Exterior', nacionalidad: 'Cualquiera', porcentaje: 10, sbu: 0 },
  ];
  const paraisos = new Set(['bahamas']);
  const enBahamas = conParaisoFiscal({ acc_tipo_persona: 1, acc_residencia: 'Bahamas ', acc_nacionalidad: 'Bahamas' }, paraisos);
  const enPeru = conParaisoFiscal({ acc_tipo_persona: 1, acc_residencia: 'Perú', acc_nacionalidad: 'Perú' }, paraisos);
  expect(enBahamas.acc_paraiso_fiscal).toBe(true);
  expect(calcularRetencion(1000, enBahamas, reglas, 0)).toBe(250);
  expect(calcularRetencion(1000, enPeru, reglas, 0)).toBe(100);
  // Sin marcar en el catálogo, la regla de paraíso fiscal no aplica.
  expect(calcularRetencion(1000, { acc_tipo_persona: 1, acc_residencia: 'Bahamas' }, reglas, 0)).toBe(100);
});
