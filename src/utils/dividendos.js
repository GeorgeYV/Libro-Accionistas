// Cálculo puro de un reparto de dividendos por rango de acciones (sin llamadas al API).
import { segmentarCobertura, accionesDeRango } from './rangos';
import { calcularRetencion, leerReglas } from './retencion';

export const redondear2 = (x) => Math.round(x * 100) / 100;

// Resultado de la votación de un tema por mayoría de acciones presentes.
export function resultadoVotacion(registrosJunta, tema) {
  const presentes = registrosJunta.filter((r) => r.presente === true);
  const accionesPresentes = presentes.reduce((s, r) => s + (r.acciones || 0), 0);
  const accionesAFavor = presentes.filter((r) => r['votacion' + tema] === true).reduce((s, r) => s + (r.acciones || 0), 0);
  return { accionesPresentes, accionesAFavor, aprobada: accionesPresentes > 0 && accionesAFavor * 2 > accionesPresentes };
}

// Reparte `total` entre partes proporcionales a `pesos`, en centavos, sin perder ni sobrar centavos.
function repartirCentavos(total, pesos) {
  const sumaPesos = pesos.reduce((s, p) => s + p, 0);
  if (sumaPesos === 0) return pesos.map(() => 0);
  let asignado = 0;
  return pesos.map((p, i) => {
    if (i === pesos.length - 1) return redondear2(total - asignado);
    const parte = redondear2(total * p / sumaPesos);
    asignado = redondear2(asignado + parte);
    return parte;
  });
}

/**
 * Convierte montos exactos (sin redondear) a centavos de modo que sumen exactamente `totalCentavos`
 * (método del mayor residuo): cada uno recibe su parte entera y los centavos que faltan o sobran se ajustan
 * en los de mayor (o menor) fracción. Ninguno queda negativo.
 */
export function repartirExacto(totalCentavos, exactos) {
  const base = exactos.map((x) => Math.floor(x * 100 + 1e-7));
  const fraccion = exactos.map((x, i) => x * 100 - base[i]);
  let diferencia = totalCentavos - base.reduce((s, c) => s + c, 0);
  const orden = exactos.map((_, i) => i);
  if (diferencia > 0) {
    orden.sort((a, b) => fraccion[b] - fraccion[a]);
    for (let k = 0; diferencia > 0; k = (k + 1) % orden.length) { base[orden[k]]++; diferencia--; }
  } else if (diferencia < 0) {
    orden.sort((a, b) => fraccion[a] - fraccion[b]);
    for (let k = 0, sinCambio = 0; diferencia < 0 && sinCambio < orden.length; k = (k + 1) % orden.length) {
      if (base[orden[k]] > 0) { base[orden[k]]--; diferencia++; sinCambio = 0; } else sinCambio++;
    }
  }
  return base.map((c) => c / 100);
}

const EPS = 1e-9;
// % del dividendo del período que ya cobró un tramo (null = 100: tramos generados antes de existir el porcentaje).
export const porcentajePagado = (p) => (p.div_tit_porcentaje == null ? 100 : p.div_tit_porcentaje);

/**
 * foto: TituloxJunta[] de la asamblea.
 * pagadosPeriodo: DividendosTitulos[] ya generados en el período (con div_tit_desde/hasta/porcentaje).
 * accionistas: Map id -> { acc_tipo_identificacion, acc_residencia, acc_nacionalidad, acc_nombre_completo, acc_identificacion }
 * periodo: { dividendoTotal, accionesBase, porcentajeDeclarado } (porcentajeDeclarado: suma de % de repartos anteriores)
 * porcentajeReparto: % del dividendo del año que declara este reparto (puede ser 0 para solo poner al día).
 * reglas: reglas de retención (Parametro.reglasRetencion); sin ellas, las iniciales.
 * sbu: salario básico unificado (Parametro.baseImponible). valorNominal: Parametro.valorNominal (para mostrar capital).
 *
 * Cada acción de la foto cobra lo que le falta para llegar al % acumulado declarado (anteriores + este).
 */
export function calcularReparto({ foto, pagadosPeriodo, accionistas, periodo, porcentajeReparto, sbu, valorNominal = 0, reglas: reglasDadas }) {
  const reglas = leerReglas(reglasDadas);
  if (!(porcentajeReparto >= 0)) throw new Error('El porcentaje a repartir no es válido.');
  const declarado = (periodo.porcentajeDeclarado || 0) + porcentajeReparto;
  if (declarado <= 0) throw new Error('Indique el porcentaje a repartir.');
  if (declarado > 100 + EPS) throw new Error(`Con este reparto se declararía el ${declarado.toFixed(2)}% del dividendo del año (máximo 100%).`);
  // La foto no puede tener rangos cruzados (se pagaría dos veces la misma acción).
  const ordenada = [...foto].sort((a, b) => a.desde - b.desde);
  for (let i = 0; i < ordenada.length; i++) {
    const f = ordenada[i];
    if (accionesDeRango(f.desde, f.hasta) !== f.acciones) throw new Error(`El título ${f.tituloID} de la foto tiene un rango inconsistente.`);
    if (i > 0 && f.desde <= ordenada[i - 1].hasta) throw new Error(`Los títulos ${ordenada[i - 1].tituloID} y ${f.tituloID} de la foto se cruzan.`);
    if (f.hasta > periodo.accionesBase) throw new Error(`El título ${f.tituloID} supera las acciones base del período (${periodo.accionesBase}).`);
  }

  const cubiertos = pagadosPeriodo.map((p) => ({ desde: p.div_tit_desde, hasta: p.div_tit_hasta, valor: porcentajePagado(p) }));
  // Unidades = acciones × fracción del dividendo anual cobrada.
  const unidadesPagadas = pagadosPeriodo.reduce((s, p) => s + (p.div_tit_acciones || 0) * porcentajePagado(p) / 100, 0);
  const montoAsignado = redondear2(pagadosPeriodo.reduce((s, p) => s + (p.div_tit_dividendo || 0), 0));
  const unidadesPendientes = periodo.accionesBase * declarado / 100 - unidadesPagadas;
  const montoPendiente = periodo.dividendoTotal * declarado / 100 - montoAsignado;
  if (unidadesPendientes <= EPS) throw new Error(`Todas las acciones ya cobraron el ${declarado.toFixed(2)}% declarado.`);
  if (montoPendiente < 0) throw new Error('Lo ya asignado supera el monto del porcentaje declarado.');
  // Valor del 100% del dividendo por acción. Si hubo aumento de capital, la base creció y se recalcula
  // repartiendo lo que falta del monto declarado entre lo que falta por cubrir.
  const valorAccion = montoPendiente / unidadesPendientes;

  const tramos = [];
  ordenada.forEach((f) => {
    segmentarCobertura({ desde: f.desde, hasta: f.hasta }, cubiertos).forEach((s) => {
      const porcentaje = declarado - s.suma;
      if (porcentaje <= EPS) return;
      const acciones = accionesDeRango(s.desde, s.hasta);
      tramos.push({
        accionistaID: f.accionistaID,
        tituloID: f.tituloID,
        desde: s.desde,
        hasta: s.hasta,
        acciones,
        porcentaje: Math.round(porcentaje * 1e6) / 1e6,
        exacto: acciones * porcentaje / 100 * valorAccion,
        estado: f.accionistaEstado === 3 || f.tituloEstado === 0 ? 'Retenido' : 'Pendiente',
      });
    });
  });

  // Centavos: el total del reparto lleva lo asignado en el año a su valor exacto (absorbe los redondeos de
  // repartos anteriores) y se reparte por mayor residuo, así la suma de los tramos cuadra al centavo.
  const exactoReparto = tramos.reduce((s, t) => s + t.exacto, 0);
  const totalCentavos = Math.round((montoAsignado + exactoReparto) * 100) - Math.round(montoAsignado * 100);
  repartirExacto(Math.max(0, totalCentavos), tramos.map((t) => t.exacto)).forEach((d, i) => {
    tramos[i].dividendo = d;
    delete tramos[i].exacto;
  });

  // Retención sobre lo acumulado del año por beneficiario, menos lo ya retenido.
  const porId = new Map();
  tramos.forEach((t) => {
    if (!porId.has(t.accionistaID)) porId.set(t.accionistaID, []);
    porId.get(t.accionistaID).push(t);
  });
  const porAccionista = [];
  porId.forEach((susTramos, id) => {
    const acc = accionistas.get(id) || {};
    const previos = pagadosPeriodo.filter((p) => p.div_tit_accionista_id === id);
    const dividendoPrevio = redondear2(previos.reduce((s, p) => s + (p.div_tit_dividendo || 0), 0));
    const retencionPrevia = redondear2(previos.reduce((s, p) => s + (p.div_tit_retencion || 0), 0));
    const dividendo = redondear2(susTramos.reduce((s, t) => s + t.dividendo, 0));
    const retencionAnual = calcularRetencion(dividendoPrevio + dividendo, acc, reglas, sbu);
    const retencion = Math.max(0, redondear2(retencionAnual - retencionPrevia));
    repartirCentavos(retencion, susTramos.map((t) => t.dividendo)).forEach((r, i) => { susTramos[i].retencion = r; });
    const accionesAcc = susTramos.reduce((s, t) => s + t.acciones, 0);
    porAccionista.push({
      id,
      identificacion: acc.acc_identificacion || id,
      nombre: acc.acc_nombre_completo || '',
      acciones: accionesAcc,
      capital: redondear2(accionesAcc * valorNominal),
      dividendo,
      retencion,
      neto: redondear2(dividendo - retencion),
      estado: susTramos.some((t) => t.estado === 'Retenido') ? 'Retenido' : 'Pendiente',
    });
  });

  const accionesReparto = tramos.reduce((s, t) => s + t.acciones, 0);
  const unidadesReparto = tramos.reduce((s, t) => s + t.acciones * t.porcentaje / 100, 0);
  return {
    valorAccion,
    declarado,
    tramos,
    porAccionista,
    accionesReparto,
    capitalReparto: redondear2(accionesReparto * valorNominal),
    montoReparto: redondear2(tramos.reduce((s, t) => s + t.dividendo, 0)),
    pagadosConsiderados: pagadosPeriodo.length,
    reglas, // se guardan con el reparto
    // Fracción del dividendo anual (acciones × %) cubierta después de este reparto.
    coberturaFinal: (unidadesPagadas + unidadesReparto) / periodo.accionesBase,
  };
}

// Fracción del dividendo anual ya cubierta (acciones × %) sobre la base del período.
export function coberturaPeriodo(pagados, accionesBase) {
  if (!accionesBase) return 0;
  return pagados.reduce((s, p) => s + (p.div_tit_acciones || 0) * porcentajePagado(p) / 100, 0) / accionesBase;
}

// ---- Cambio de dueño con dividendos pendientes ------------------------------------------------

const estaPagado = (t) => !!t.div_tit_fecha_pago || t.div_tit_estado === 'Pagado';
const CAMPOS_COMPARAR = ['div_tit_accionista_id', 'div_tit_titulo_id', 'div_tit_desde', 'div_tit_hasta', 'div_tit_acciones',
  'div_tit_dividendo', 'div_tit_retencion', 'div_tit_base_imponible', 'div_tit_participacion', 'div_tit_estado'];

/**
 * Pasa al nuevo dueño la parte PENDIENTE de los dividendos de las acciones transferidas (los pagados no se tocan)
 * y recalcula la retención anual de los accionistas involucrados.
 *
 * tramos: DividendosTitulos de los accionistas involucrados en los períodos afectados (con desde/hasta).
 * transferencias: [{ desde, hasta, de, a, tituloID }] rangos de acciones que cambiaron de dueño.
 * accionistas: Map id -> Accionista (acc_estado y datos de retención).
 * secuencialDetalle: Map div_tit_ddiv_id -> secuencial del reparto dentro del período.
 * Devuelve { actualizar: [{ id, ...campos }], crear: [input], nuevosPorDetalle: Map ddivId -> cantidad }.
 */
export function reasignarPendientes({ tramos, transferencias, accionistas, secuencialDetalle, sbu, reglas: reglasDadas }) {
  const reglas = leerReglas(reglasDadas);
  let trabajo = tramos.map((t) => ({ ...t }));

  transferencias.forEach((tr) => {
    const siguiente = [];
    trabajo.forEach((t) => {
      const toca = t.div_tit_accionista_id === tr.de && !estaPagado(t) && t.div_tit_desde != null &&
        t.div_tit_hasta >= tr.desde && t.div_tit_desde <= tr.hasta;
      if (!toca) { siguiente.push(t); return; }
      // Partes: antes del rango, dentro (cambia de dueño), después.
      const partes = [];
      if (t.div_tit_desde < tr.desde) partes.push({ desde: t.div_tit_desde, hasta: tr.desde - 1, mueve: false });
      partes.push({ desde: Math.max(t.div_tit_desde, tr.desde), hasta: Math.min(t.div_tit_hasta, tr.hasta), mueve: true });
      if (t.div_tit_hasta > tr.hasta) partes.push({ desde: tr.hasta + 1, hasta: t.div_tit_hasta, mueve: false });
      const acciones = partes.map((p) => accionesDeRango(p.desde, p.hasta));
      const dividendos = repartirCentavos(t.div_tit_dividendo || 0, acciones);
      const destino = accionistas.get(tr.a) || {};
      partes.forEach((p, i) => {
        const pieza = {
          ...t,
          div_tit_desde: p.desde,
          div_tit_hasta: p.hasta,
          div_tit_acciones: acciones[i],
          div_tit_dividendo: dividendos[i],
          div_tit_base_imponible: dividendos[i],
          div_tit_participacion: t.div_tit_acciones ? Math.round((t.div_tit_participacion || 0) * acciones[i] / t.div_tit_acciones * 10000) / 10000 : 0,
        };
        if (p.mueve) {
          pieza.div_tit_accionista_id = tr.a;
          pieza.div_tit_titulo_id = tr.tituloID;
          pieza.div_tit_estado = destino.acc_estado === 3 ? 'Retenido' : 'Pendiente';
        }
        // La primera pieza conserva el registro original; las demás son nuevas.
        if (i > 0) { delete pieza.id; pieza.nuevo = true; }
        siguiente.push(pieza);
      });
    });
    trabajo = siguiente;
  });

  // Retención anual acumulada por accionista involucrado, reparto por reparto (los pagados quedan fijos).
  const involucrados = new Set(transferencias.flatMap((tr) => [tr.de, tr.a]));
  const grupos = new Map(); // periodo|accionista -> tramos
  trabajo.filter((t) => involucrados.has(t.div_tit_accionista_id)).forEach((t) => {
    const clave = `${t.div_tit_periodo}|${t.div_tit_accionista_id}`;
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(t);
  });
  grupos.forEach((susTramos) => {
    const acc = accionistas.get(susTramos[0].div_tit_accionista_id) || {};
    const porDetalle = new Map();
    susTramos.forEach((t) => {
      if (!porDetalle.has(t.div_tit_ddiv_id)) porDetalle.set(t.div_tit_ddiv_id, []);
      porDetalle.get(t.div_tit_ddiv_id).push(t);
    });
    const orden = [...porDetalle.keys()].sort((a, b) => (secuencialDetalle.get(a) || 0) - (secuencialDetalle.get(b) || 0));
    let divAcum = 0, retAcum = 0;
    orden.forEach((ddiv) => {
      const lista = porDetalle.get(ddiv);
      const pagados = lista.filter(estaPagado);
      const pendientes = lista.filter((t) => !estaPagado(t));
      const divPagado = pagados.reduce((s, t) => s + (t.div_tit_dividendo || 0), 0);
      const retPagada = pagados.reduce((s, t) => s + (t.div_tit_retencion || 0), 0);
      const divPendiente = pendientes.reduce((s, t) => s + (t.div_tit_dividendo || 0), 0);
      if (pendientes.length) {
        const total = redondear2(divAcum + divPagado + divPendiente);
        const retencion = Math.max(0, redondear2(calcularRetencion(total, acc, reglas, sbu) - retAcum - retPagada));
        repartirCentavos(retencion, pendientes.map((t) => t.div_tit_dividendo || 0)).forEach((r, i) => { pendientes[i].div_tit_retencion = r; });
      }
      divAcum = redondear2(divAcum + divPagado + divPendiente);
      retAcum = redondear2(retAcum + lista.reduce((s, t) => s + (t.div_tit_retencion || 0), 0));
    });
  });

  const originales = new Map(tramos.map((t) => [t.id, t]));
  const actualizar = [];
  const crear = [];
  const nuevosPorDetalle = new Map();
  trabajo.forEach((t) => {
    if (t.nuevo) {
      const { nuevo, createdAt, updatedAt, __typename, ...input } = t;
      crear.push(input);
      nuevosPorDetalle.set(t.div_tit_ddiv_id, (nuevosPorDetalle.get(t.div_tit_ddiv_id) || 0) + 1);
      return;
    }
    const original = originales.get(t.id);
    const cambios = CAMPOS_COMPARAR.filter((c) => t[c] !== original[c]);
    if (cambios.length) {
      const entrada = { id: t.id };
      cambios.forEach((c) => { entrada[c] = t[c]; });
      actualizar.push(entrada);
    }
  });
  return { actualizar, crear, nuevosPorDetalle };
}

// ---- Dividendos de un accionista (todos los repartos) -----------------------------------------

export const estadoTramo = (t) => {
  if (t.div_tit_fecha_pago || t.div_tit_estado === 'Pagado') return 'Pagado';
  return t.div_tit_estado === 'Retenido' ? 'Retenido' : 'Pendiente';
};

/**
 * Agrupa los tramos (DividendosTitulos) de un accionista por reparto y estado.
 * repartos: filas de listarRepartos (DetalleDividendo + período). Devuelve { filas, totales } con montos por estado.
 */
export function dividendosDeAccionista(tramos, repartos) {
  const porReparto = new Map(repartos.map((r) => [r.id, r]));
  const grupos = new Map();
  tramos.forEach((t) => {
    const estado = estadoTramo(t);
    const clave = `${t.div_tit_ddiv_id}|${estado}`;
    if (!grupos.has(clave)) grupos.set(clave, { repartoId: t.div_tit_ddiv_id, estado, lista: [] });
    grupos.get(clave).lista.push(t);
  });
  const suma = (lista, campo) => redondear2(lista.reduce((s, t) => s + (t[campo] || 0), 0));
  const filas = [...grupos.entries()].map(([id, { repartoId, estado, lista }]) => {
    const r = porReparto.get(repartoId) || {};
    const dividendo = suma(lista, 'div_tit_dividendo');
    const retencion = suma(lista, 'div_tit_retencion');
    const pagado = lista.find((t) => t.div_tit_fecha_pago) || {};
    return {
      id,
      repartoId,
      periodo: r.div_periodo != null ? r.div_periodo : lista[0].div_tit_periodo,
      secuencial: r.ddiv_secuencial,
      concepto: r.div_concepto || '',
      fechaJunta: r.ddiv_fecha_junta || '',
      porcentaje: r.ddiv_porcentaje,
      acciones: lista.reduce((s, t) => s + (t.div_tit_acciones || 0), 0),
      dividendo,
      retencion,
      neto: redondear2(dividendo - retencion),
      estado,
      fechaPago: pagado.div_tit_fecha_pago || '',
      documento: pagado.div_tit_documento || '',
      tramos: lista.map((t) => t.id),
    };
  }).sort((a, b) => ((a.periodo || 0) - (b.periodo || 0)) || ((a.secuencial || 0) - (b.secuencial || 0)) || a.estado.localeCompare(b.estado));

  const totales = {};
  ['Pendiente', 'Retenido', 'Pagado'].forEach((estado) => {
    const deEstado = filas.filter((f) => f.estado === estado);
    totales[estado] = {
      repartos: deEstado.length,
      dividendo: redondear2(deEstado.reduce((s, f) => s + f.dividendo, 0)),
      retencion: redondear2(deEstado.reduce((s, f) => s + f.retencion, 0)),
      neto: redondear2(deEstado.reduce((s, f) => s + f.neto, 0)),
    };
  });
  return { filas, totales };
}

// ---- Cuadre contable de un reparto ------------------------------------------------------------

/**
 * Verificaciones del reparto a partir de sus beneficiarios (filas de detalleReparto) y los repartos del período.
 * Cada control: { concepto, detalle, esperado, calculado, diferencia, ok }.
 */
export function cuadreReparto(reparto, filas, repartosPeriodo) {
  const suma = (campo) => redondear2(filas.reduce((s, f) => s + (f[campo] || 0), 0));
  const totales = {
    beneficiarios: filas.length,
    acciones: filas.reduce((s, f) => s + (f.acciones || 0), 0),
    dividendo: suma('dividendo'),
    retencion: suma('retencion'),
    neto: suma('neto'),
    pendiente: suma('dividendoPendiente'),
  };
  totales.pagado = redondear2(totales.dividendo - totales.pendiente);

  const anteriores = repartosPeriodo.filter((r) => r.ddiv_secuencial <= reparto.ddiv_secuencial);
  const declarado = anteriores.reduce((s, r) => s + (r.ddiv_porcentaje || 0), 0);
  const asignado = redondear2(anteriores.reduce((s, r) => s + (r.monto || 0), 0));
  const tope = redondear2((reparto.div_dividendo || 0) * declarado / 100);

  const control = (concepto, detalle, esperado, calculado, ok) => {
    const diferencia = redondear2(calculado - esperado);
    return { concepto, detalle, esperado, calculado, diferencia, ok: ok != null ? ok : Math.abs(diferencia) < 0.005 };
  };
  const controles = [
    control('Monto del reparto', 'Suma del dividendo de todos los beneficiarios = monto registrado del reparto.', reparto.monto, totales.dividendo),
    control('Pagado', 'Dividendo de los beneficiarios pagados = pagado registrado en el reparto.', reparto.ddiv_dividendo || 0, totales.pagado),
    control('Saldo', 'Monto − pagado = dividendo pendiente o retenido de los beneficiarios.', redondear2(reparto.monto - (reparto.ddiv_dividendo || 0)), totales.pendiente),
    control('Neto', 'Dividendo − retención = neto de los beneficiarios.', redondear2(totales.dividendo - totales.retencion), totales.neto),
  ];
  if (reparto.ddiv_acciones != null) {
    controles.push(control('Acciones', 'Acciones de los beneficiarios = acciones registradas en el reparto.', reparto.ddiv_acciones, totales.acciones));
  }
  // Lo asignado nunca puede superar lo declarado; si es menor, falta cubrir acciones (ausentes en las asambleas).
  const periodo = control('Período (acumulado)',
    `Repartos 1 a ${reparto.ddiv_secuencial} del período: asignado ≤ dividendo del período × ${redondear2(declarado)}% declarado.`,
    tope, asignado, asignado <= tope + 0.005);
  controles.push(periodo);
  return { totales, controles, declarado, asignado, tope, porCubrir: redondear2(Math.max(0, tope - asignado)) };
}
