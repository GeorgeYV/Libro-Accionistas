import { motivoNoPdf } from './archivos';

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
