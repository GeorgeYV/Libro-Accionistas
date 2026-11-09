// Certificado de acciones en PDF (vista de accionistas y dashboard del accionista).
// Requiere en la página un <QRcode id="qrcode" value={URL_VERIFICACION} />.
import jsPDF from 'jspdf';
import fondoUnacem from '../images/FondoCertificado.png';

export const URL_VERIFICACION = 'main.d1uap272r7bnzf.amplifyapp.com';

export function exportarCertificado(accionista, parametro) {
  const capital = parametro.cantidadEmitida * parametro.valorNominal;
  const doc = new jsPDF('landscape', 'pt', 'A4');
  doc.addImage(fondoUnacem, 'JPEG', 0, 0, 845, 600);
  doc.addImage(document.getElementById('qrcode').toDataURL(), 'png', 90, 460, 80, 80);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.setFontSize(16);
  doc.text(`CAPITAL SUSCRITO Y AUTORIZADO USD ${capital}`, 220, 190);
  doc.setFontSize(14);
  doc.text('ESTE CERTIFICADO TOKENIZADO ACREDITA QUE', 250, 240);

  const nombre = accionista.acc_nombre_completo || '';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(nombre.length > 25 ? 30 : 40);
  doc.text(nombre, nombre.length < 26 ? 357 - nombre.length * 10 : 357 - nombre.length * 7.5, 295);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text(`ES PROPIETARIO DE ${accionista.acc_cantidad_acciones} ACCIONES DE US$ ${parametro.valorNominal} CENTAVOS DE DÓLAR DE LOS `, 155, 335);
  doc.text('ESTADOS UNIDOS DE AMÉRICA, CON TODOS LOS DERECHOS Y ', 195, 355);
  doc.text('OBLIGACIONES QUE LE CORRESPONDEN A LA LEY Y LOS ESTATUTOS', 175, 375);
  doc.text('SOCIALES DE LA COMPAÑÍA.', 320, 395);

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Fuente de Información Plataforma de Accionistas Unacem', 200, 487);
  doc.text(`${URL_VERIFICACION}/`, 200, 502);
  doc.text('El código QR lo direccionará a la página de verificación', 200, 517);
  doc.save('CertificadoAccionistas.pdf');
}
