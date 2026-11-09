import { combinarAccionistas, separar, buscarAccionistas } from './accionistas';

const accionistas = [
  { id: 'N1', acc_tipo_persona: 0, acc_nombre_completo: 'Ana Pérez' },
  { id: 'N2', acc_tipo_persona: 0, acc_nombre_completo: 'Sin ficha' },
  { id: 'J1', acc_tipo_persona: 1, acc_nombre_completo: 'Empresa SA' },
];
const pns = [{ id: 'N1', pn_primer_nombre: 'Ana', pn_estado_civil: 1 }];
const pjs = [{ id: 'J1', pj_razon_social: 'Empresa SA', pj_rl_nombre: 'Luis' }];

test('combinarAccionistas no arrastra datos de la persona anterior', () => {
  const [ana, sinFicha, empresa] = combinarAccionistas(accionistas, pns, pjs);
  expect(ana).toEqual(expect.objectContaining({ pn_primer_nombre: 'Ana', pn_estado_civil: 1, pj_razon_social: '' }));
  expect(sinFicha).toEqual(expect.objectContaining({ pn_primer_nombre: '', pn_estado_civil: '' }));
  expect(empresa).toEqual(expect.objectContaining({ pj_rl_nombre: 'Luis', pn_primer_nombre: '' }));
});

test('separar teléfonos/correos por "&" ignorando vacíos', () => {
  expect(separar('099&&022')).toEqual(['099', '022']);
  expect(separar(null)).toEqual([]);
});

test('buscarAccionistas filtra siempre sobre la lista completa', () => {
  const lista = combinarAccionistas(accionistas, pns, pjs);
  expect(buscarAccionistas(lista, 'empresa').map((a) => a.id)).toEqual(['J1']);
  expect(buscarAccionistas(lista, '')).toHaveLength(3);
});

describe('formulario de accionista', () => {
  const { filasContacto, unirContacto, planHerederos, conValorActual } = require('./accionistas');

  test('teléfonos y observaciones quedan alineados por posición', () => {
    expect(filasContacto('099&022&033', '&oficina&')).toEqual([
      { numero: '099', obs: '' }, { numero: '022', obs: 'oficina' }, { numero: '033', obs: '' },
    ]);
    expect(unirContacto([{ numero: '099', obs: '' }, { numero: '', obs: 'x' }, { numero: '022', obs: 'casa' }]))
      .toEqual({ telefonos: '099&022', observaciones: '&casa' });
  });

  test('planHerederos conserva los existentes (y su cantidad de acciones)', () => {
    const existentes = [
      { id: 'H1', her_identificacion: '111', her_nombre: 'Ana', her_cant_acciones: 50 },
      { id: 'H2', her_identificacion: '222', her_nombre: 'Luis' },
    ];
    const plan = planHerederos(existentes, [
      { her_identificacion: '111', her_nombre: 'Ana María' },
      { her_identificacion: '333', her_nombre: 'Eva' },
      { her_identificacion: '', her_nombre: 'vacío' },
    ]);
    expect(plan).toEqual({
      crear: [{ her_identificacion: '333', her_nombre: 'Eva' }],
      actualizar: [{ id: 'H1', her_nombre: 'Ana María' }],
      eliminar: ['H2'],
      total: 2,
    });
  });

  test('conValorActual agrega valores antiguos que no están en las opciones', () => {
    expect(conValorActual(['Ecuador'], 'Ecuador ')).toEqual(['Ecuador', 'Ecuador ']);
    expect(conValorActual(['Ecuador'], 'Ecuador')).toEqual(['Ecuador']);
  });
});
