import { pdf } from '@react-pdf/renderer';
import type { CVDocument } from '../cv-model/types';
import { ClassicPdfTemplate } from './ClassicPdfTemplate';

function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);
}

/** Nombre del archivo PDF: "CV-Nombre-Apellido.pdf". */
export function cvPdfFilename(doc: CVDocument): string {
  const safeName = sanitizeFilename(doc.personal.fullName);
  return safeName ? `CV-${safeName}.pdf` : 'CV.pdf';
}

/** Genera el PDF como Blob, en el dispositivo. Nada se sube a un servidor. */
export async function generateCVPdfBlob(
  doc: CVDocument,
): Promise<{ blob: Blob; filename: string }> {
  const blob = await pdf(<ClassicPdfTemplate doc={doc} />).toBlob();
  return { blob, filename: cvPdfFilename(doc) };
}

/** Descarga el PDF al dispositivo del usuario. */
export async function downloadCVPdf(doc: CVDocument): Promise<void> {
  const { blob, filename } = await generateCVPdfBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Comparte el archivo PDF real usando la Web Share API (cuando el navegador
 * lo soporta). Comparte el File, no un enlace blob:, así sirve para enviar por
 * WhatsApp o email. Devuelve false si el navegador no soporta compartir
 * archivos. Si el usuario cancela, se propaga un AbortError.
 */
export async function shareCVPdf(doc: CVDocument): Promise<boolean> {
  const { blob, filename } = await generateCVPdfBlob(doc);
  const file = new File([blob], filename, { type: 'application/pdf' });

  if (
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      files: [file],
      title: filename,
    });
    return true;
  }

  return false;
}
