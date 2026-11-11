import { calcularReparto, resultadoVotacion, coberturaPeriodo } from './dividendos';
import { segmentarCobertura } from './rangos';

describe('segmentarCobertura', () => {
  test('suma la cobertura por segmento', () => {
    expect(segmentarCobertura({ desde: 1, hasta: 100 }, [
      { desde: 1, hasta: 60, valor: 50 },
      { desde: 41, hasta: 100, valor: 25 },
    ])).toEqual([
      { desde: 1, hasta: 40, suma: 50 },
      { desde: 41, hasta: 60, suma: 75 },
      { desde: 61, hasta: 100, suma: 25 },
    ]);
  });
  test('sin cobertura devuelve un solo segmento en 0', () => {
    expect(segmentarCobertura({ desde: 5, hasta: 8 }, [{ desde: 20, hasta: 30, valor: 100 }])).toEqual([{ desde: 5, hasta: 8, suma: 0 }]);
  });
});

const sinRetencion = new Map(['A', 'B', 'C'].map((id) => [id, { acc_tipo_identificacion: 1, acc_residencia: 'Ecuador', acc_nacionalidad: 'Ecuador' }]));
const foto = (accionistaID, tituloID, desde, hasta, extra = {}) =>
  ({ accionistaID, tituloID, desde, hasta, acciones: hasta - desde + 1, accionistaEstado: 1, tituloEstado: 1, ...extra });
const pagado = (accionistaID, desde, hasta, porcentaje, dividendo, retencion = 0) => ({
  div_tit_accionista_id: accionistaID, div_tit_desde: desde, div_tit_hasta: hasta, div_tit_acciones: hasta - desde + 1,
  div_tit_porcentaje: porcentaje, div_tit_dividendo: dividendo, div_tit_retencion: retencion,
});
const base = { foto: [], pagadosPeriodo: [], accionistas: sinRetencion, sbu: 0 };
const periodo = { dividendoTotal: 1000, accionesBase: 100, porcentajeDeclarado: 0 };

describe('calcularReparto', () => {
  test('reparto del 50%: paga la mitad del valor por acción', () => {
    const r = calcularReparto({ ...base, foto: [foto('A', 'T1', 1, 60)], periodo, porcentajeReparto: 50, valorNominal: 0.04 });
    expect(r.valorAccion).toBe(10);
    expect(r.montoReparto).toBe(300);
    expect(r.porAccionista[0]).toEqual(expect.objectContaining({ acciones: 60, capital: 2.4, dividendo: 300 }));
    expect(r.coberturaFinal).toBeCloseTo(0.3);
  });

  test('quien faltó al reparto anterior se pone al día con el % acumulado', () => {
    // Reparto 1 (50%): solo A 1-60. Reparto 2 (50%): A 1-60 y C 61-100.
    const r = calcularReparto({
      ...base,
      foto: [foto('A', 'T1', 1, 60), foto('C', 'T3', 61, 100)],
      pagadosPeriodo: [pagado('A', 1, 60, 50, 300)],
      periodo: { ...periodo, porcentajeDeclarado: 50 }, porcentajeReparto: 50,
    });
    expect(r.tramos).toEqual([
      expect.objectContaining({ accionistaID: 'A', desde: 1, hasta: 60, porcentaje: 50, dividendo: 300 }),
      expect.objectContaining({ accionistaID: 'C', desde: 61, hasta: 100, porcentaje: 100, dividendo: 400 }),
    ]);
    expect(r.coberturaFinal).toBe(1);
  });

  test('reparto del 0%: solo pone al día a los que faltaron', () => {
    const r = calcularReparto({
      ...base,
      foto: [foto('A', 'T1', 1, 60), foto('C', 'T3', 61, 100)],
      pagadosPeriodo: [pagado('A', 1, 60, 50, 300)],
      periodo: { ...periodo, porcentajeDeclarado: 50 }, porcentajeReparto: 0,
    });
    expect(r.tramos).toEqual([expect.objectContaining({ accionistaID: 'C', porcentaje: 50, dividendo: 200 })]);
  });

  test('cambio de dueño parcial: el nuevo dueño no vuelve a cobrar el % ya pagado', () => {
    // Reparto 1 (100%) pagó 1-60 a A; A cedió 41-60 a B.
    const r = calcularReparto({
      ...base,
      foto: [foto('A', 'T1', 1, 40), foto('B', 'T2', 41, 60), foto('C', 'T3', 61, 100)],
      pagadosPeriodo: [pagado('A', 1, 60, 100, 600)],
      periodo: { ...periodo, porcentajeDeclarado: 100 }, porcentajeReparto: 0,
    });
    expect(r.tramos).toEqual([expect.objectContaining({ accionistaID: 'C', desde: 61, hasta: 100, dividendo: 400 })]);
  });

  test('tramos sin porcentaje guardado cuentan como 100%', () => {
    const r = calcularReparto({
      ...base,
      foto: [foto('A', 'T1', 1, 100)],
      pagadosPeriodo: [{ ...pagado('A', 1, 60, null, 600) }],
      periodo: { ...periodo, porcentajeDeclarado: 60 }, porcentajeReparto: 40,
    });
    expect(r.tramos).toEqual([expect.objectContaining({ desde: 61, hasta: 100, porcentaje: 100, dividendo: 400 })]);
  });

  test('aumento de capital: la base crece y el valor se recalcula sobre lo pendiente', () => {
    const r = calcularReparto({
      ...base,
      foto: [foto('C', 'T3', 61, 120)],
      pagadosPeriodo: [pagado('A', 1, 60, 100, 600)],
      periodo: { dividendoTotal: 1000, accionesBase: 120, porcentajeDeclarado: 100 }, porcentajeReparto: 0,
    });
    expect(r.valorAccion).toBeCloseTo(400 / 60);
    expect(r.montoReparto).toBe(400);
  });

  test('accionista o título bloqueado queda Retenido', () => {
    const r = calcularReparto({
      ...base, foto: [foto('A', 'T1', 1, 50, { accionistaEstado: 3 }), foto('B', 'T2', 51, 100, { tituloEstado: 0 })],
      periodo, porcentajeReparto: 100,
    });
    expect(r.porAccionista.map((a) => a.estado)).toEqual(['Retenido', 'Retenido']);
  });

  test('retención anual: se descuenta lo ya retenido en el año', () => {
    const r = calcularReparto({
      ...base, accionistas: new Map([['A', { acc_tipo_persona: 0, acc_residencia: 'Estados Unidos', acc_nacionalidad: 'Ecuador' }]]), // 14% fijo
      foto: [foto('A', 'T1', 1, 100)],
      pagadosPeriodo: [pagado('A', 1, 100, 50, 500, 70)],
      periodo: { ...periodo, porcentajeDeclarado: 50 }, porcentajeReparto: 50,
    });
    expect(r.porAccionista[0].retencion).toBe(70); // 14% de 1000 = 140, ya retenidos 70
  });

  test('validaciones', () => {
    expect(() => calcularReparto({ ...base, foto: [foto('A', 'T1', 1, 60), foto('B', 'T2', 50, 70)], periodo, porcentajeReparto: 100 })).toThrow(/se cruzan/);
    expect(() => calcularReparto({ ...base, foto: [foto('A', 'T1', 1, 10)], periodo: { ...periodo, porcentajeDeclarado: 60 }, porcentajeReparto: 50 })).toThrow(/máximo 100%/);
    expect(() => calcularReparto({ ...base, foto: [foto('A', 'T1', 1, 10)], periodo, porcentajeReparto: 0 })).toThrow(/porcentaje/);
    expect(() => calcularReparto({
      ...base, foto: [foto('A', 'T1', 1, 100)], pagadosPeriodo: [pagado('A', 1, 100, 100, 1000)],
      periodo: { ...periodo, porcentajeDeclarado: 100 }, porcentajeReparto: 0,
    })).toThrow(/ya cobraron/);
  });
});

test('coberturaPeriodo', () => {
  expect(coberturaPeriodo([pagado('A', 1, 60, 50, 0), pagado('C', 61, 100, 100, 0)], 100)).toBeCloseTo(0.7);
});

test('resultadoVotacion por mayoría de acciones presentes', () => {
  const junta = [
    { presente: true, acciones: 60, votacion2: true },
    { presente: true, acciones: 40, votacion2: false },
    { presente: false, acciones: 500, votacion2: false },
  ];
  expect(resultadoVotacion(junta, 2)).toEqual({ accionesPresentes: 100, accionesAFavor: 60, aprobada: true });
});

describe('reasignarPendientes', () => {
  const { reasignarPendientes } = require('./dividendos');
  const acc = new Map([
    ['A', { acc_estado: 1, acc_tipo_identificacion: 1, acc_residencia: 'Ecuador', acc_nacionalidad: 'Ecuador' }],
    ['B', { acc_estado: 1, acc_tipo_persona: 0, acc_residencia: 'Estados Unidos', acc_nacionalidad: 'Ecuador' }], // 14% fijo
    ['H', { acc_estado: 3, acc_tipo_identificacion: 1, acc_residencia: 'Ecuador', acc_nacionalidad: 'Ecuador' }],
  ]);
  const tramo = (id, accionista, desde, hasta, dividendo, extra = {}) => ({
    id, div_tit_ddiv_id: 'D1', div_tit_periodo: 2027, div_tit_accionista_id: accionista, div_tit_titulo_id: 'T1',
    div_tit_desde: desde, div_tit_hasta: hasta, div_tit_acciones: hasta - desde + 1, div_tit_porcentaje: 50,
    div_tit_dividendo: dividendo, div_tit_retencion: 0, div_tit_base_imponible: dividendo, div_tit_participacion: 10,
    div_tit_estado: 'Pendiente', div_tit_fecha_pago: '', ...extra,
  });
  const sec = new Map([['D1', 1], ['D2', 2]]);

  test('cesión parcial: divide el tramo pendiente y pasa la parte cedida con su retención', () => {
    const r = reasignarPendientes({
      tramos: [tramo('X', 'A', 1, 100, 1000)],
      transferencias: [{ desde: 61, hasta: 100, de: 'A', a: 'B', tituloID: 'T2' }],
      accionistas: acc, secuencialDetalle: sec, sbu: 0,
    });
    expect(r.actualizar).toEqual([expect.objectContaining({ id: 'X', div_tit_hasta: 60, div_tit_acciones: 60, div_tit_dividendo: 600 })]);
    expect(r.crear).toEqual([expect.objectContaining({
      div_tit_accionista_id: 'B', div_tit_titulo_id: 'T2', div_tit_desde: 61, div_tit_hasta: 100,
      div_tit_dividendo: 400, div_tit_retencion: 56, div_tit_porcentaje: 50, div_tit_estado: 'Pendiente',
    })]);
    expect(r.crear[0].id).toBeUndefined();
    expect(r.nuevosPorDetalle.get('D1')).toBe(1);
  });

  test('tramos ya pagados no se tocan', () => {
    const r = reasignarPendientes({
      tramos: [tramo('X', 'A', 1, 100, 1000, { div_tit_fecha_pago: '01-01-2027', div_tit_estado: 'Pagado' })],
      transferencias: [{ desde: 1, hasta: 100, de: 'A', a: 'B', tituloID: 'T1' }],
      accionistas: acc, secuencialDetalle: sec, sbu: 0,
    });
    expect(r).toEqual({ actualizar: [], crear: [], nuevosPorDetalle: new Map() });
  });

  test('cesión total a un heredero bloqueado: el tramo pasa como Retenido', () => {
    const r = reasignarPendientes({
      tramos: [tramo('X', 'A', 1, 100, 1000)],
      transferencias: [{ desde: 1, hasta: 100, de: 'A', a: 'H', tituloID: 'T1' }],
      accionistas: acc, secuencialDetalle: sec, sbu: 0,
    });
    expect(r.crear).toEqual([]);
    expect(r.actualizar).toEqual([{ id: 'X', div_tit_accionista_id: 'H', div_tit_estado: 'Retenido' }]);
  });

  test('retención del destino considera lo que ya cobró en el año', () => {
    // B ya cobró 500 (retenido 70) en D1; recibe un tramo pendiente de 500 en D2 => 14% de 1000 - 70 = 70.
    const r = reasignarPendientes({
      tramos: [
        tramo('P', 'B', 201, 250, 500, { div_tit_retencion: 70, div_tit_fecha_pago: '01-01-2027', div_tit_estado: 'Pagado' }),
        tramo('X', 'A', 1, 50, 500, { div_tit_ddiv_id: 'D2' }),
      ],
      transferencias: [{ desde: 1, hasta: 50, de: 'A', a: 'B', tituloID: 'T1' }],
      accionistas: acc, secuencialDetalle: sec, sbu: 0,
    });
    expect(r.actualizar).toEqual([{ id: 'X', div_tit_accionista_id: 'B', div_tit_retencion: 70 }]);
  });
});

describe('dividendosDeAccionista', () => {
  const { dividendosDeAccionista } = require('./dividendos');
  const repartos = [
    { id: 'R1', div_periodo: 2025, ddiv_secuencial: 1, div_concepto: 'Ordinario' },
    { id: 'R2', div_periodo: 2026, ddiv_secuencial: 1, div_concepto: 'Ordinario' },
  ];
  const tramo = (id, ddiv, dividendo, retencion, extra = {}) =>
    ({ id, div_tit_ddiv_id: ddiv, div_tit_dividendo: dividendo, div_tit_retencion: retencion, div_tit_acciones: 10, ...extra });

  test('agrupa por reparto y estado, y totaliza lo por cobrar', () => {
    const { filas, totales } = dividendosDeAccionista([
      tramo('a', 'R2', 100, 10),
      tramo('b', 'R2', 50, 5),
      tramo('c', 'R1', 30, 0, { div_tit_fecha_pago: '1-1-2026', div_tit_documento: 'doc', div_tit_estado: 'Pagado' }),
      tramo('d', 'R1', 20, 2),
      tramo('e', 'R2', 40, 0, { div_tit_estado: 'Retenido' }),
    ], repartos);
    expect(filas.map((f) => [f.repartoId, f.estado, f.neto, f.tramos])).toEqual([
      ['R1', 'Pagado', 30, ['c']],
      ['R1', 'Pendiente', 18, ['d']],
      ['R2', 'Pendiente', 135, ['a', 'b']],
      ['R2', 'Retenido', 40, ['e']],
    ]);
    expect(totales.Pendiente).toEqual({ repartos: 2, dividendo: 170, retencion: 17, neto: 153 });
    expect(totales.Retenido.neto).toBe(40);
    expect(totales.Pagado.neto).toBe(30);
    expect(filas[0].documento).toBe('doc');
  });

  test('sin tramos', () => {
    expect(dividendosDeAccionista([], repartos).totales.Pendiente.neto).toBe(0);
  });
});

describe('cuadre al centavo', () => {
  const { repartirExacto, calcularReparto } = require('./dividendos');
  const sinRet = (ids) => new Map(ids.map((id) => [id, { acc_tipo_identificacion: 1, acc_residencia: 'Ecuador', acc_nacionalidad: 'Ecuador' }]));
  const fotoDe = (cantidades) => {
    let desde = 1;
    return cantidades.map((n, i) => {
      const f = { accionistaID: `A${i}`, tituloID: `T${i}`, desde, hasta: desde + n - 1, acciones: n, accionistaEstado: 1, tituloEstado: 1 };
      desde += n;
      return f;
    });
  };
  const centavos = (tramos) => Math.round(tramos.reduce((s, t) => s + t.dividendo, 0) * 100);

  test('repartirExacto suma exactamente el total y no deja negativos', () => {
    expect(repartirExacto(10000, [100 / 3, 100 / 3, 100 / 3])).toEqual([33.34, 33.33, 33.33]);
    expect(repartirExacto(1, [0.004, 0.004, 0.004]).reduce((s, x) => s + x, 0)).toBeCloseTo(0.01, 10);
    expect(repartirExacto(0, [0.001, 0.002])).toEqual([0, 0]);
  });

  test('370 tramos con fracciones suman exactamente el monto declarado', () => {
    // Cantidades que dejan fracciones de centavo en cada tramo (antes la suma se desviaba).
    const cantidades = Array(370).fill(3); // con redondeo por tramo sumaba 9,892,952.70
    const base = cantidades.reduce((s, n) => s + n, 0);
    const r = calcularReparto({
      foto: fotoDe(cantidades), pagadosPeriodo: [], accionistas: sinRet(cantidades.map((_, i) => `A${i}`)),
      periodo: { dividendoTotal: 9892953.6, accionesBase: base, porcentajeDeclarado: 0 }, porcentajeReparto: 100, sbu: 0,
    });
    expect(centavos(r.tramos)).toBe(989295360);
    expect(r.montoReparto).toBe(9892953.6);
  });

  test('el último reparto compensa el redondeo de los anteriores y el año cuadra', () => {
    const cantidades = [3, 3, 3];
    const foto = fotoDe(cantidades);
    // Reparto anterior al 50% que quedó 0.01 por encima de lo exacto (50.00 → 50.01).
    const previos = foto.map((f, i) => ({
      div_tit_accionista_id: f.accionistaID, div_tit_desde: f.desde, div_tit_hasta: f.hasta, div_tit_acciones: 3,
      div_tit_porcentaje: 50, div_tit_dividendo: [16.67, 16.67, 16.67][i], div_tit_retencion: 0,
    }));
    const r = calcularReparto({
      foto, pagadosPeriodo: previos, accionistas: sinRet(['A0', 'A1', 'A2']),
      periodo: { dividendoTotal: 100, accionesBase: 9, porcentajeDeclarado: 50 }, porcentajeReparto: 50, sbu: 0,
    });
    expect(centavos(r.tramos) + 5001).toBe(10000);
  });
});

describe('cuadreReparto', () => {
  const { cuadreReparto } = require('./dividendos');
  const reparto = { id: 'R2', ddiv_secuencial: 2, ddiv_porcentaje: 50, monto: 150, ddiv_dividendo: 100, ddiv_acciones: 30, div_dividendo: 400 };
  const periodo = [{ id: 'R1', ddiv_secuencial: 1, ddiv_porcentaje: 25, monto: 100 }, reparto, { id: 'R3', ddiv_secuencial: 3, ddiv_porcentaje: 25, monto: 1 }];
  const filas = [
    { acciones: 20, dividendo: 100, retencion: 10, neto: 90, dividendoPendiente: 0 },
    { acciones: 10, dividendo: 50, retencion: 0, neto: 50, dividendoPendiente: 50 },
  ];

  test('todo cuadra', () => {
    const r = cuadreReparto(reparto, filas, periodo);
    expect(r.controles.every((c) => c.ok)).toBe(true);
    expect(r.totales).toMatchObject({ dividendo: 150, pagado: 100, pendiente: 50, retencion: 10, neto: 140, acciones: 30 });
    // Repartos 1 y 2: 75% de 400 = 300 declarado; asignado 250 → faltan 50 por cubrir.
    expect(r).toMatchObject({ declarado: 75, asignado: 250, tope: 300, porCubrir: 50 });
  });

  test('detecta descuadres', () => {
    const r = cuadreReparto({ ...reparto, monto: 150.05 }, filas, periodo);
    const monto = r.controles.find((c) => c.concepto === 'Monto del reparto');
    expect(monto).toMatchObject({ ok: false, diferencia: -0.05 });
    const excedido = cuadreReparto(reparto, filas, [{ ...periodo[0], monto: 160 }, reparto]);
    expect(excedido.controles.find((c) => c.concepto === 'Período (acumulado)').ok).toBe(false);
  });

});
