// Certificado de acciones en PDF (vista de accionistas y dashboard del accionista).
// Cada impresión registra un Certificado; el QR lleva a la página pública /verificar/<id>.
import React from 'react';
import ReactDOM from 'react-dom';
import { Auth } from 'aws-amplify';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';
import fondoUnacem from '../images/FondoCertificado.png';
import { emitirCertificado, urlVerificacion } from '../services/certificados';

// Dibuja el QR fuera de pantalla y devuelve la imagen (qrcode.react pinta el canvas después de montar).
async function imagenQR(valor) {
  const contenedor = document.createElement('div');
  ReactDOM.render(<QRCodeCanvas value={valor} size={240} level="M" includeMargin />, contenedor);
  const canvas = contenedor.querySelector('canvas');
  const dibujado = () => {
    const d = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] && d[i] < 128) return true;
    return false;
  };
  for (let intento = 0; intento < 50 && !dibujado(); intento++) await new Promise((r) => setTimeout(r, 20));
  const listo = dibujado();
  const imagen = canvas.toDataURL('image/png');
  ReactDOM.unmountComponentAtNode(contenedor);
  if (!listo) throw new Error('No se pudo generar el código QR del certificado.');
  return imagen;
}

export async function exportarCertificado(accionista, parametro) {
  const id = await emitirCertificado(accionista, parametro, Auth.user ? Auth.user.username : '');
  const url = urlVerificacion(id);
  const qr = await imagenQR(url);

  const capital = parametro.cantidadEmitida * parametro.valorNominal;
  const doc = new jsPDF('landscape', 'pt', 'A4');
  doc.addImage(fondoUnacem, 'JPEG', 0, 0, 845, 600);
  doc.addImage(qr, 'PNG', 90, 460, 80, 80);

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
  doc.text(`${window.location.origin}/verificar`, 200, 502);
  doc.text('Escanee el código QR para verificar la validez de este certificado.', 200, 517);
  doc.text(`Código de verificación: ${id}`, 200, 532);
  doc.save('CertificadoAccionistas.pdf');
}
