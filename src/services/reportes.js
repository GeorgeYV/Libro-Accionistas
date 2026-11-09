// Datos y exportación a Excel de los reportes. Todo es de solo lectura.
import ExcelJS from 'exceljs';
import { API } from 'aws-amplify';
import { listOperacions, listAccionistaOperacions, getParametro } from '../graphql/queries';
import { listarTodos } from './listarTodos';
import { cargarAccionistas } from './accionistas';
import { listarHerederosDe } from './operaciones';
import { reconstruirLibro, valorFecha } from '../utils/libro';
import logoBase64 from '../images/logobase64';

export const fechaHoy = () => new Date().toISOString().slice(0, 10);

/** Descarga un .xlsx con el formato de la empresa (logo, título, fecha de creación y encabezados). */
export async function descargarExcel({ titulo, subtitulo, hoja, encabezados, filas, archivo }) {
  const libro = new ExcelJS.Workbook();
  const sheet = libro.addWorksheet(hoja);
  sheet.addImage(libro.addImage({ base64: logoBase64, extension: 'jpeg' }), { tl: { col: 0, row: 0 }, ext: { width: 415, height: 100 } });
  for (let i = 0; i < 5; i++) sheet.addRow([]);
  sheet.addRow(encabezados);
  const fuente = { name: 'Times New Roman', family: 4 };
  sheet.getRow(7).font = { ...fuente, size: 14, bold: true, color: { argb: 'fc0303' } };
  encabezados.forEach((_, i) => { sheet.getRow(7).getCell(i + 1).border = { bottom: { style: 'thin', color: { argb: '676767' } } }; });
  sheet.mergeCells('D1:F2');
  sheet.getCell('D1').value = titulo;
  sheet.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getCell('D1').font = { ...fuente, size: 16, bold: true, color: { argb: 'fc0303' } };
  sheet.mergeCells('D4:F4');
  sheet.getCell('D4').value = subtitulo || `Fecha de creación: ${fechaHoy()}`;
  sheet.getCell('D4').font = { ...fuente, size: 14 };
  sheet.columns = encabezados.map(() => ({ width: 20 }));
  filas.forEach((f) => sheet.addRow(f));

  const datos = await libro.xlsx.writeBuffer();
  const url = window.URL.createObjectURL(new Blob([datos], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = archivo;
  enlace.click();
  window.URL.revokeObjectURL(url);
}

export async function cargarDatosReportes() {
  const [{ accionistas, parametro }, operaciones] = await Promise.all([
    cargarAccionistas(),
    listarTodos(listOperacions, 'listOperacions'),
  ]);
  return { accionistas, parametro, operaciones };
}

/** Libro de accionistas a la fecha de corte ("aaaa-mm-dd"), revirtiendo en memoria las operaciones posteriores. */
export async function libroAFecha({ accionistas, operaciones }, fechaCorte) {
  const corte = valorFecha(fechaCorte);
  const posteriores = operaciones.filter((o) => o.ope_estado === 1 && valorFecha(o.ope_fecha_aprobacion) > corte);
  const [vinculos, parametro] = await Promise.all([
    posteriores.length ? listarTodos(listAccionistaOperacions, 'listAccionistaOperacions') : [],
    API.graphql({ query: getParametro, variables: { id: '1' } }),
  ]);
  const idsPosteriores = new Set(posteriores.map((o) => o.id));
  const vinculosPosteriores = vinculos.filter((v) => idsPosteriores.has(v.acc_ope_operacion_id));
  const causantes = [...new Set(posteriores.filter((o) => o.ope_tipo === 6)
    .map((o) => (vinculosPosteriores.find((v) => v.acc_ope_operacion_id === o.id && v.acc_ope_detalle === 'Cedente') || {}).acc_ope_accionista_id)
    .filter(Boolean))];
  const herederosPorCausante = new Map(await Promise.all(causantes.map(async (id) => [id, await listarHerederosDe(id)])));
  return reconstruirLibro({
    accionistas, operaciones, vinculos: vinculosPosteriores, herederosPorCausante,
    emitidoActual: parametro.data.getParametro.cantidadEmitida, fechaCorte,
  });
}
