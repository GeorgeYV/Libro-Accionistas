import { unirListaAsistencia, votosIniciales, filtrarPorNombre } from './asambleas';

const activos = [
  { id: 'A', acc_nombre_completo: 'Bravo', acc_identificacion: '111', acc_cantidad_acciones: 10, acc_estado: 1 },
  { id: 'B', acc_nombre_completo: 'Alfa', acc_identificacion: '222', acc_cantidad_acciones: 20, acc_estado: 1 },
];

test('lista virtual: activos sin registro aparecen como ausentes, los registrados con su registro', () => {
  const registros = [
    { id: 'R1', accionistaID: 'A', nombre: 'Bravo', presente: true, acciones: 10 },
    { id: 'R2', accionistaID: 'Z', nombre: 'Zeta (ya no activo)', presente: true, acciones: 5 },
  ];
  const lista = unirListaAsistencia(activos, registros);
  expect(lista.map((i) => i.id)).toEqual(['v-B', 'R1', 'R2']);
  expect(lista[0]).toEqual(expect.objectContaining({ virtual: true, accionistaID: 'B', presente: false, acciones: 20 }));
});

test('votosIniciales: a favor solo en temas con texto', () => {
  expect(votosIniciales({ votacionTema1: 'Balance', votacionTema2: '', votacionTema3: 'Dividendos' }))
    .toEqual({ votacion1: true, votacion3: true });
});

test('filtrarPorNombre busca por nombre o identificación', () => {
  const lista = unirListaAsistencia(activos, []);
  expect(filtrarPorNombre(lista, 'alf').map((i) => i.accionistaID)).toEqual(['B']);
  expect(filtrarPorNombre(lista, '111').map((i) => i.accionistaID)).toEqual(['A']);
  expect(filtrarPorNombre(lista, '')).toHaveLength(2);
});

describe('quórum y votos', () => {
  const { resumenQuorum, conteoVotos, asambleaCerrada, temasDe } = require('./asambleas');
  const registros = [
    { presente: true, acciones: 30, representanteNombre: '', votacion1: true },
    { presente: true, acciones: 20, representanteNombre: 'Ana', votacion1: false },
    { presente: false, acciones: 10, representanteNombre: 'undefined' },
  ];
  test('resumenQuorum separa presentes, representados y ausentes', () => {
    const r = resumenQuorum(registros, 4, 100, 0.5);
    expect(r.quorum).toEqual({ personas: 2, acciones: 50, capital: 25, pctCapital: 50, pctPersonas: 50 });
    expect(r.presentes.acciones).toBe(30);
    expect(r.representados.personas).toBe(1);
    expect(r.ausentes).toEqual(expect.objectContaining({ personas: 2, acciones: 50 }));
  });
  test('conteoVotos solo entre presentes', () => {
    expect(conteoVotos(registros, 1)).toEqual({ aFavor: 1, enContra: 1 });
  });
  test('estados cerrados y temas con texto', () => {
    expect(asambleaCerrada({ estado: 'DividendoGenerado' })).toBe(true);
    expect(asambleaCerrada({ estado: 'Convocatoria' })).toBe(false);
    expect(temasDe({ votacionTema1: 'A', votacionTema3: 'B' })).toEqual([1, 3]);
  });
});
