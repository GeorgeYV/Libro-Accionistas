import { API } from 'aws-amplify';
import { guardarFotoTitulos } from './fotoTitulos';

jest.mock('aws-amplify', () => ({ API: { graphql: jest.fn() } }));

const respuestas = {
  ListTitulos: {
    listTitulos: {
      items: [
        { id: 'IDTituloPadreDeTodos', tit_acciones: 0, tit_desde: 0, tit_hasta: 300, tit_accionista_id: '' },
        { id: 'T1', tit_acciones: 100, tit_desde: 1, tit_hasta: 100, tit_estado: 1, tit_accionista_id: 'A' },
        { id: 'T2', tit_acciones: 100, tit_desde: 101, tit_hasta: 200, tit_estado: 0, tit_accionista_id: 'B' },
        { id: 'T3', tit_acciones: 0, tit_desde: 201, tit_hasta: 200, tit_estado: 1, tit_accionista_id: 'A' },
        { id: 'T4', tit_acciones: 100, tit_desde: 201, tit_hasta: 300, tit_estado: 1, tit_accionista_id: 'C' },
      ],
      nextToken: null,
    },
  },
  ListAccionistas: {
    listAccionistas: { items: [{ id: 'A', acc_estado: 1 }, { id: 'B', acc_estado: 3 }, { id: 'C', acc_estado: 1 }], nextToken: null },
  },
  TitulosxJuntaByAsamblea: {
    titulosxJuntaByAsamblea: { items: [{ id: 'F1', tituloID: 'T4', accionistaID: 'C' }], nextToken: null },
  },
};

beforeEach(() => {
  API.graphql.mockReset();
  API.graphql.mockImplementation(({ query }) => {
    const nombre = Object.keys(respuestas).find((n) => query.includes(`query ${n}(`));
    return Promise.resolve({ data: nombre ? respuestas[nombre] : {} });
  });
});

const creados = () => API.graphql.mock.calls
  .filter(([op]) => op.query.includes('createTituloxJunta'))
  .map(([op]) => op.variables.input);

test('foto de todo el libro: incluye bloqueados, omite raíz, títulos vacíos y ya guardados', async () => {
  expect(await guardarFotoTitulos('ASM')).toBe(2);
  expect(creados()).toEqual([
    expect.objectContaining({ asambleaID: 'ASM', tituloID: 'T1', accionistaID: 'A', desde: 1, hasta: 100, acciones: 100, accionistaEstado: 1 }),
    expect.objectContaining({ tituloID: 'T2', accionistaID: 'B', tituloEstado: 0, accionistaEstado: 3 }),
  ]);
});

test('foto de un accionista', async () => {
  expect(await guardarFotoTitulos('ASM', ['B'])).toBe(1);
  expect(creados().map((c) => c.tituloID)).toEqual(['T2']);
});
