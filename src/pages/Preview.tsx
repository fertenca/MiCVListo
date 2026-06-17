import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCVStore } from '../features/cv-model';
import { ClassicTemplate } from '../features/cv-template/ClassicTemplate';
import styles from './Preview.module.css';

type PdfState = 'idle' | 'generating' | 'error';

function Preview() {
  const navigate = useNavigate();
  const draft = useCVStore((s) => s.draft);
  const [pdfState, setPdfState] = useState<PdfState>('idle');

  useEffect(() => {
    if (!draft) navigate('/crear', { replace: true });
  }, [draft, navigate]);

  if (!draft) return null;

  async function handleDownloadPdf() {
    if (!draft) return;
    setPdfState('generating');
    try {
      const { downloadCVPdf } = await import('../features/cv-template/pdfGenerator');
      await downloadCVPdf(draft);
      setPdfState('idle');
    } catch (err) {
      console.error('PDF generation failed:', err);
      setPdfState('error');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Vista previa de tu CV</h1>
          <p className={styles.subtext}>
            Revisá cómo está quedando. Si querés cambiar algo, podés volver a
            editar.
          </p>
        </div>
        <div className={styles.actions}>
          <Link to="/wizard?paso=11" className={styles.btnEdit}>
            Volver a editar
          </Link>
          <button
            type="button"
            className={styles.btnPdf}
            onClick={handleDownloadPdf}
            disabled={pdfState === 'generating'}
          >
            {pdfState === 'generating' ? 'Generando PDF...' : 'Descargar PDF'}
            {pdfState === 'error' && (
              <span className={styles.btnPdfNote}>
                Ocurrió un error. Intentá de nuevo.
              </span>
            )}
          </button>
        </div>
      </div>

      <div className={styles.previewFrame}>
        <ClassicTemplate doc={draft} />
      </div>
    </div>
  );
}

export default Preview;
