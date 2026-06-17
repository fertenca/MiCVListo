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

export async function downloadCVPdf(doc: CVDocument): Promise<void> {
  const blob = await pdf(<ClassicPdfTemplate doc={doc} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = sanitizeFilename(doc.personal.fullName);
  a.href = url;
  a.download = safeName ? `CV-${safeName}.pdf` : 'CV.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
