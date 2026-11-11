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

describe('estado del accionista', () => {
  const { estadoSegunAcciones, estadoAlGuardarFicha, ESTADO } = require('./operaciones');
  test('sin acciones queda inactivo; inactivo que recibe acciones vuelve a activo', () => {
    expect(estadoSegunAcciones(ESTADO.ACTIVO, 0)).toBe(ESTADO.INACTIVO);
    expect(estadoSegunAcciones(ESTADO.HEREDERO, 0)).toBe(ESTADO.INACTIVO);
    expect(estadoSegunAcciones(ESTADO.INACTIVO, 50)).toBe(ESTADO.ACTIVO);
    expect(estadoSegunAcciones(ESTADO.ACTIVO, 50)).toBe(ESTADO.ACTIVO);
    expect(estadoSegunAcciones(ESTADO.HEREDERO, 50)).toBe(ESTADO.HEREDERO);
    expect(estadoSegunAcciones(ESTADO.BLOQUEADO, 0)).toBe(ESTADO.BLOQUEADO);
    expect(estadoSegunAcciones(null, 10)).toBe(ESTADO.ACTIVO);
  });
  test('el heredero pasa a activo al guardar su ficha', () => {
    expect(estadoAlGuardarFicha(ESTADO.HEREDERO, 120)).toBe(ESTADO.ACTIVO);
    expect(estadoAlGuardarFicha(ESTADO.HEREDERO, 0)).toBe(ESTADO.INACTIVO);
    expect(estadoAlGuardarFicha(ESTADO.BLOQUEADO, 10)).toBe(ESTADO.BLOQUEADO);
    expect(estadoAlGuardarFicha(ESTADO.INACTIVO, 0)).toBe(ESTADO.INACTIVO);
    expect(estadoAlGuardarFicha(undefined, 0)).toBe(ESTADO.ACTIVO); // alta nueva
  });
});

describe('problemasHeredero', () => {
  const { problemasHeredero } = require('./operaciones');
  const acc = (extra = {}) => ({
    id: 'H1', acc_identificacion: 'H1', acc_decevale: 'D1', acc_nombre_completo: 'Ana Pérez', acc_nacionalidad: 'Ecuador',
    acc_pais: 'Ecuador', acc_estado: 1, acc_tipo_persona: 0, ...extra,
  });
  const pn = { pn_primer_nombre: 'Ana', pn_apellido_paterno: 'Pérez' };

  test('heredero nuevo (no es accionista): null; completo: sin problemas', () => {
    expect(problemasHeredero(null, null, 'C')).toBeNull();
    expect(problemasHeredero(acc(), pn, 'C')).toEqual([]);
    expect(problemasHeredero(acc({ acc_estado: 2 }), pn, 'C')).toEqual([]); // inactivo puede recibir
    expect(problemasHeredero(acc({ acc_tipo_persona: 1 }), { pj_razon_social: 'Empresa S.A.' }, 'C')).toEqual([]);
  });

  test('detecta bloqueado, sin tipo de persona, sin ficha y datos faltantes', () => {
    expect(problemasHeredero(acc({ acc_estado: 3 }), pn, 'C')).toEqual(['está bloqueado']);
    expect(problemasHeredero(acc({ acc_tipo_persona: null }), pn, 'C')).toEqual(['no tiene tipo de persona (natural o jurídica)']);
    expect(problemasHeredero(acc(), null, 'C')).toEqual(['no tiene registrada su ficha de persona natural']);
    expect(problemasHeredero(acc({ acc_decevale: ' ', acc_pais: null }), { pn_primer_nombre: 'Ana' }, 'C'))
      .toEqual(['le falta: código DECEVALE, país de residencia, apellido paterno']);
    expect(problemasHeredero(acc({ id: 'C' }), pn, 'C')).toEqual(['es el mismo causante']);
  });
});

test('se aceptan sin ficha los herederos en estado Heredero o inactivos sin acciones', () => {
  const { problemasHeredero, recibeComoHeredero } = require('./operaciones');
  const incompleto = { id: 'H9', acc_identificacion: 'H9', acc_nombre_completo: 'Heredero', acc_tipo_persona: 0, acc_cantidad_acciones: 0 };
  expect(problemasHeredero({ ...incompleto, acc_estado: 0 }, null, 'C')).toEqual([]);
  expect(problemasHeredero({ ...incompleto, acc_estado: 2 }, null, 'C')).toEqual([]);
  expect(recibeComoHeredero({ ...incompleto, acc_estado: 2 })).toBe(true);
  // Inactivo con acciones o activo: se exige la ficha completa.
  expect(problemasHeredero({ ...incompleto, acc_estado: 2, acc_cantidad_acciones: 5 }, null, 'C').length).toBeGreaterThan(0);
  expect(problemasHeredero({ ...incompleto, acc_estado: 1 }, null, 'C').length).toBeGreaterThan(0);
  expect(problemasHeredero({ ...incompleto, acc_estado: 3 }, null, 'C')).toEqual(['está bloqueado']);
});
