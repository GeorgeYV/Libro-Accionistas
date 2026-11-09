// Funciones puras para manejar rangos de acciones de los títulos (tit_desde..tit_hasta).
// Invariante: tit_hasta - tit_desde + 1 === tit_acciones y los rangos vigentes no se solapan.

export const ID_TITULO_RAIZ = 'IDTituloPadreDeTodos';

export function accionesDeRango(desde, hasta) {
  return hasta - desde + 1;
}

// Cesión parcial: el hijo toma las últimas `acciones` del rango del padre.
export function dividirRango(titulo, acciones) {
  if (!Number.isInteger(acciones) || acciones <= 0) {
    throw new Error('La cantidad de acciones a ceder debe ser un entero positivo.');
  }
  if (accionesDeRango(titulo.tit_desde, titulo.tit_hasta) !== titulo.tit_acciones) {
    throw new Error(`El título ${titulo.id} tiene un rango inconsistente (${titulo.tit_desde}-${titulo.tit_hasta} para ${titulo.tit_acciones} acciones). Corríjalo antes de operar.`);
  }
  if (acciones >= titulo.tit_acciones) {
    throw new Error('Una cesión parcial debe ceder menos acciones de las que tiene el título.');
  }
  const nuevoHastaPadre = titulo.tit_hasta - acciones;
  return {
    padre: { tit_acciones: titulo.tit_acciones - acciones, tit_hasta: nuevoHastaPadre },
    hijo: { tit_acciones: acciones, tit_desde: nuevoHastaPadre + 1, tit_hasta: titulo.tit_hasta },
  };
}

// Anulación de cesión parcial: devuelve el rango del hijo al padre (deben ser contiguos).
export function unirRango(padre, hijo) {
  if (hijo.tit_desde !== padre.tit_hasta + 1) {
    throw new Error(`Los títulos ${padre.id} y ${hijo.id} no son contiguos; no se puede revertir automáticamente.`);
  }
  return {
    tit_acciones: padre.tit_acciones + hijo.tit_acciones,
    tit_hasta: hijo.tit_hasta,
  };
}

// Posesión efectiva: reparte el rango completo del título en tramos consecutivos.
export function repartirRango(titulo, cantidades) {
  const total = cantidades.reduce((suma, c) => suma + c, 0);
  if (total !== titulo.tit_acciones) {
    throw new Error(`La suma repartida (${total}) no coincide con las acciones del título (${titulo.tit_acciones}).`);
  }
  if (accionesDeRango(titulo.tit_desde, titulo.tit_hasta) !== titulo.tit_acciones) {
    throw new Error(`El título ${titulo.id} tiene un rango inconsistente. Corríjalo antes de operar.`);
  }
  let desde = titulo.tit_desde;
  return cantidades.map((acciones) => {
    const tramo = { tit_acciones: acciones, tit_desde: desde, tit_hasta: desde + acciones - 1 };
    desde += acciones;
    return tramo;
  });
}

// Parte `rango` ({desde, hasta}) en segmentos con la suma de `valor` de los `cubiertos` que los tocan.
// cubiertos: [{desde, hasta, valor}]. Los segmentos sin cobertura tienen suma 0.
export function segmentarCobertura(rango, cubiertos) {
  const tocan = cubiertos.filter((c) => c.hasta >= rango.desde && c.desde <= rango.hasta);
  const cortes = new Set([rango.desde, rango.hasta + 1]);
  tocan.forEach((c) => {
    cortes.add(Math.max(c.desde, rango.desde));
    cortes.add(Math.min(c.hasta, rango.hasta) + 1);
  });
  const puntos = [...cortes].sort((a, b) => a - b);
  const segmentos = [];
  for (let i = 0; i < puntos.length - 1; i++) {
    const desde = puntos[i];
    const hasta = puntos[i + 1] - 1;
    const suma = tocan.filter((c) => c.desde <= desde && c.hasta >= desde).reduce((s, c) => s + c.valor, 0);
    segmentos.push({ desde, hasta, suma });
  }
  return segmentos;
}

// Revisa todos los títulos y devuelve la lista de problemas encontrados (no modifica nada).
// titulos: lista completa de Titulo; accionistas: lista de Accionista; totalEmitido: acciones emitidas.
export function validarTitulos(titulos, accionistas, totalEmitido) {
  const problemas = [];
  const vigentes = titulos.filter((t) => t.id !== ID_TITULO_RAIZ && t.tit_acciones > 0);

  vigentes.forEach((t) => {
    if (!Number.isInteger(t.tit_desde) || !Number.isInteger(t.tit_hasta)) {
      problemas.push({ tipo: 'Rango vacío', titulo: t.id, accionista: t.tit_accionista_id, detalle: 'El título no tiene desde/hasta.' });
    } else if (accionesDeRango(t.tit_desde, t.tit_hasta) !== t.tit_acciones) {
      problemas.push({
        tipo: 'Rango inconsistente', titulo: t.id, accionista: t.tit_accionista_id,
        detalle: `${t.tit_desde}-${t.tit_hasta} cubre ${accionesDeRango(t.tit_desde, t.tit_hasta)} acciones, pero el título tiene ${t.tit_acciones}.`,
      });
    }
  });

  const conRango = vigentes
    .filter((t) => Number.isInteger(t.tit_desde) && Number.isInteger(t.tit_hasta))
    .sort((a, b) => a.tit_desde - b.tit_desde);

  let siguiente = 1;
  let anterior = null;
  conRango.forEach((t) => {
    if (t.tit_desde > siguiente) {
      problemas.push({ tipo: 'Hueco', titulo: '', accionista: '', detalle: `Acciones ${siguiente}-${t.tit_desde - 1} no pertenecen a ningún título.` });
    } else if (t.tit_desde < siguiente && anterior) {
      problemas.push({
        tipo: 'Solape', titulo: `${anterior.id} / ${t.id}`, accionista: `${anterior.tit_accionista_id} / ${t.tit_accionista_id}`,
        detalle: `${anterior.tit_desde}-${anterior.tit_hasta} se cruza con ${t.tit_desde}-${t.tit_hasta}.`,
      });
    }
    if (t.tit_hasta + 1 > siguiente) {
      siguiente = t.tit_hasta + 1;
      anterior = t;
    }
  });
  if (totalEmitido && siguiente - 1 < totalEmitido) {
    problemas.push({ tipo: 'Hueco', titulo: '', accionista: '', detalle: `Acciones ${siguiente}-${totalEmitido} no pertenecen a ningún título.` });
  }
  if (totalEmitido && siguiente - 1 > totalEmitido) {
    problemas.push({ tipo: 'Exceso', titulo: '', accionista: '', detalle: `Hay títulos hasta la acción ${siguiente - 1}, pero el total emitido es ${totalEmitido}.` });
  }

  const sumaTotal = vigentes.reduce((suma, t) => suma + t.tit_acciones, 0);
  if (totalEmitido && sumaTotal !== totalEmitido) {
    problemas.push({ tipo: 'Total', titulo: '', accionista: '', detalle: `Los títulos suman ${sumaTotal} acciones; el total emitido es ${totalEmitido}.` });
  }

  const porAccionista = new Map();
  vigentes.forEach((t) => porAccionista.set(t.tit_accionista_id, (porAccionista.get(t.tit_accionista_id) || 0) + t.tit_acciones));
  accionistas.forEach((a) => {
    const enTitulos = porAccionista.get(a.id) || 0;
    if (enTitulos !== (a.acc_cantidad_acciones || 0)) {
      problemas.push({
        tipo: 'Accionista descuadrado', titulo: '', accionista: a.id,
        detalle: `${a.acc_nombre_completo || ''}: tiene ${a.acc_cantidad_acciones || 0} acciones, sus títulos suman ${enTitulos}.`,
      });
    }
    porAccionista.delete(a.id);
  });
  porAccionista.forEach((acciones, idAccionista) => {
    problemas.push({ tipo: 'Título huérfano', titulo: '', accionista: idAccionista, detalle: `${acciones} acciones en títulos de un accionista que no existe.` });
  });

  return problemas;
}
