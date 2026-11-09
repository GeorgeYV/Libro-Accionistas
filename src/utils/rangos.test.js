import { dividirRango, unirRango, repartirRango, validarTitulos, ID_TITULO_RAIZ } from './rangos';

const titulo = (id, desde, hasta, acc = 'A', acciones = hasta - desde + 1) =>
  ({ id, tit_desde: desde, tit_hasta: hasta, tit_acciones: acciones, tit_accionista_id: acc });

describe('dividirRango', () => {
  test('el hijo toma el final del rango del padre', () => {
    const r = dividirRango(titulo('T', 1001, 2000), 300);
    expect(r.padre).toEqual({ tit_acciones: 700, tit_hasta: 1700 });
    expect(r.hijo).toEqual({ tit_acciones: 300, tit_desde: 1701, tit_hasta: 2000 });
  });
  test('rechaza ceder todo o más', () => {
    expect(() => dividirRango(titulo('T', 1, 10), 10)).toThrow();
    expect(() => dividirRango(titulo('T', 1, 10), 0)).toThrow();
  });
  test('rechaza títulos con rango inconsistente', () => {
    expect(() => dividirRango(titulo('T', 1, 10, 'A', 5), 2)).toThrow(/inconsistente/);
  });
});

describe('unirRango', () => {
  test('revierte una división', () => {
    const padre = titulo('T', 1001, 2000);
    const { padre: p, hijo: h } = dividirRango(padre, 300);
    expect(unirRango({ ...padre, ...p }, { id: 'H', ...h })).toEqual({ tit_acciones: 1000, tit_hasta: 2000 });
  });
  test('rechaza rangos no contiguos', () => {
    expect(() => unirRango(titulo('T', 1, 10), titulo('H', 20, 25))).toThrow(/contiguos/);
  });
});

describe('repartirRango', () => {
  test('tramos consecutivos desde el inicio del título', () => {
    expect(repartirRango(titulo('T', 101, 1100), [300, 700])).toEqual([
      { tit_acciones: 300, tit_desde: 101, tit_hasta: 400 },
      { tit_acciones: 700, tit_desde: 401, tit_hasta: 1100 },
    ]);
  });
  test('la suma debe ser igual a las acciones del título', () => {
    expect(() => repartirRango(titulo('T', 1, 100), [50, 40])).toThrow();
  });
});

describe('validarTitulos', () => {
  const accionistas = [{ id: 'A', acc_cantidad_acciones: 60 }, { id: 'B', acc_cantidad_acciones: 40 }];

  test('libro cuadrado no reporta problemas', () => {
    const titulos = [
      { id: ID_TITULO_RAIZ, tit_desde: 0, tit_hasta: 100, tit_acciones: 0 },
      titulo('T1', 1, 60, 'A'),
      titulo('T2', 61, 100, 'B'),
    ];
    expect(validarTitulos(titulos, accionistas, 100)).toEqual([]);
  });

  test('detecta el error de la cesión parcial antigua', () => {
    // Padre 1-100 cede 40: antes quedaba padre 1-100 con 60 acciones e hijo 21-60.
    const titulos = [titulo('T1', 1, 100, 'A', 60), titulo('T2', 21, 60, 'B')];
    const tipos = validarTitulos(titulos, accionistas, 100).map((p) => p.tipo);
    expect(tipos).toContain('Rango inconsistente');
    expect(tipos).toContain('Solape');
  });

  test('detecta huecos, descuadres y huérfanos', () => {
    const titulos = [titulo('T1', 1, 50, 'A'), titulo('T2', 61, 100, 'X')];
    const tipos = validarTitulos(titulos, accionistas, 100).map((p) => p.tipo);
    expect(tipos).toEqual(expect.arrayContaining(['Hueco', 'Total', 'Accionista descuadrado', 'Título huérfano']));
  });
});
