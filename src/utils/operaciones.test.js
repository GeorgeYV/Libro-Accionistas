import { validarSeleccion } from './operaciones';

const t = (id, acciones) => ({ id, tit_acciones: acciones });

test('títulos completos: suma el total', () => {
  expect(validarSeleccion([{ titulo: t('A', 100), acciones: 100 }, { titulo: t('B', 50), acciones: 50 }]))
    .toEqual({ total: 150, parcial: false, error: '' });
});

test('parcial sobre un título es válido', () => {
  expect(validarSeleccion([{ titulo: t('A', 100), acciones: 30 }])).toEqual({ total: 30, parcial: true, error: '' });
});

test('parcial con varios títulos se rechaza (el blotter no lo aprueba)', () => {
  expect(validarSeleccion([{ titulo: t('A', 100), acciones: 30 }, { titulo: t('B', 50), acciones: 50 }]).error).toMatch(/un título/);
});

test('cantidades inválidas', () => {
  expect(validarSeleccion([]).error).toMatch(/al menos/);
  expect(validarSeleccion([{ titulo: t('A', 10), acciones: 0 }]).error).toMatch(/Ingrese/);
  expect(validarSeleccion([{ titulo: t('A', 10), acciones: 11 }]).error).toMatch(/no se pueden/);
});

describe('reparto de posesión efectiva', () => {
  const { repartoInicial, validarReparto } = require('./operaciones');
  test('reparto inicial en partes iguales con residuo al primero', () => {
    expect(repartoInicial([{}, {}, {}], 100)).toEqual([34, 33, 33]);
  });
  test('respeta cantidades guardadas si suman el total', () => {
    expect(repartoInicial([{ her_cant_acciones: 70 }, { her_cant_acciones: 30 }], 100)).toEqual([70, 30]);
    expect(repartoInicial([{ her_cant_acciones: 70 }, { her_cant_acciones: 10 }], 100)).toEqual([50, 50]);
  });
  test('validarReparto exige que la suma sea el total', () => {
    expect(validarReparto([60, 40], 100)).toEqual({ asignado: 100, error: '' });
    expect(validarReparto([100, 0], 100).error).toBe('');
    expect(validarReparto([60, 30], 100).error).toMatch(/Faltan asignar 10/);
    expect(validarReparto([60, 50], 100).error).toMatch(/10 acciones de más/);
    expect(validarReparto([0, 0], 100).error).toMatch(/al menos/);
  });
});
