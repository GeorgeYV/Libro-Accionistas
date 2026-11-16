import { motivoNoPdf, tipoArchivo, nombreDescarga } from './archivos';

const bytes = (texto) => new Uint8Array([...texto].map((c) => c.charCodeAt(0)));

test('acepta un PDF real', () => {
  expect(motivoNoPdf('acta.PDF', 'application/pdf', bytes('%PDF-1.7'))).toBeNull();
  expect(motivoNoPdf('acta.pdf', '', bytes('%PDF-1.4'))).toBeNull(); // algunos navegadores no informan el tipo
});

test('rechaza otras extensiones, tipos o contenidos', () => {
  expect(motivoNoPdf('carta.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', bytes('PK\u0003\u0004'))).toMatch(/extensión/);
  expect(motivoNoPdf('foto.pdf', 'image/png', bytes('%PDF-'))).toMatch(/tipo/);
  expect(motivoNoPdf('renombrado.pdf', 'application/pdf', bytes('PK\u0003\u0004x'))).toMatch(/contenido/);
  expect(motivoNoPdf('vacio.pdf', 'application/pdf', new Uint8Array())).toMatch(/contenido/);
});

test('tamaño máximo de 10 MB', () => {
  const { motivoTamano } = require('./archivos');
  expect(motivoTamano(10 * 1024 * 1024)).toBeNull();
  expect(motivoTamano(10 * 1024 * 1024 + 1)).toMatch(/10 MB/);
});

test('tipo real del archivo por su firma y nombre de descarga con extensión', () => {
  const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  const zip = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
  expect(tipoArchivo('x', pdf)).toEqual({ extension: 'pdf', tipo: 'application/pdf' });
  expect(tipoArchivo('carta.DOCX', zip).extension).toBe('docx');
  expect(tipoArchivo('modelo', zip).extension).toBe('docx');
  expect(tipoArchivo('datos.csv', new Uint8Array([0x61])).tipo).toBe('text/csv');
  expect(tipoArchivo('raro', new Uint8Array([0]))).toEqual({ extension: '', tipo: 'application/octet-stream' });
  const id = '0f8fad5b-d9cb-469f-a165-70867728950e';
  expect(nombreDescarga(`${id}Escritura.pdf`, 'pdf')).toBe('Escritura.pdf');
  expect(nombreDescarga(`${id}Escritura`, 'pdf')).toBe('Escritura.pdf');
  expect(nombreDescarga(`${id}Escritura.PDF`, 'pdf')).toBe('Escritura.pdf');
  expect(nombreDescarga(id, 'pdf')).toBe('documento.pdf');
  expect(nombreDescarga(`${id}Acta v1.2`, 'pdf')).toBe('Acta v1.2.pdf');
  expect(nombreDescarga(`${id}notas`, '')).toBe('notas');
});
