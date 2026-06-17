import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCVStore } from '../features/cv-model';
import { ClassicTemplate } from '../features/cv-template/ClassicTemplate';
import styles from './Preview.module.css';

type ActionState = 'idle' | 'generating' | 'error';

/** Detecta si el navegador puede compartir archivos (Web Share API nivel 2).
 *  No carga el chunk pesado del generador de PDF: usa un File de prueba. */
function canShareFiles(): boolean {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.canShare !== 'function'
  ) {
    return false;
  }
  try {
    const dummy = new File(['cv'], 'cv.pdf', { type: 'application/pdf' });
    return navigator.canShare({ files: [dummy] });
  } catch {
    return false;
  }
}

// ─── Acciones (se repiten arriba y abajo de la preview) ────────────────────────

interface ActionsProps {
  className: string;
  pdfState: ActionState;
  shareState: ActionState;
  canShare: boolean;
  onDownload: () => void;
  onShare: () => void;
}

function PreviewActions({
  className,
  pdfState,
  shareState,
  canShare,
  onDownload,
  onShare,
}: ActionsProps) {
  return (
    <div className={className}>
      <Link to="/wizard?paso=11" className={styles.btnEdit}>
        Volver a editar
      </Link>
      <button
        type="button"
        className={styles.btnPdf}
        onClick={onDownload}
        disabled={pdfState === 'generating'}
      >
        {pdfState === 'generating' ? 'Generando PDF...' : 'Descargar PDF'}
        {pdfState === 'error' && (
          <span className={styles.btnPdfNote}>
            Ocurrió un error. Intentá de nuevo.
          </span>
        )}
      </button>
      {canShare && (
        <button
          type="button"
          className={styles.btnShare}
          onClick={onShare}
          disabled={shareState === 'generating'}
        >
          {shareState === 'generating' ? 'Preparando...' : 'Compartir PDF'}
          {shareState === 'error' && (
            <span className={styles.btnShareNote}>
              No se pudo compartir. Probá descargarlo.
            </span>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Página ────────────────────────────────────────────────────────────────────

function Preview() {
  const navigate = useNavigate();
  const draft = useCVStore((s) => s.draft);
  const [pdfState, setPdfState] = useState<ActionState>('idle');
  const [shareState, setShareState] = useState<ActionState>('idle');
  const [canShare] = useState(canShareFiles);

  useEffect(() => {
    if (!draft) navigate('/crear', { replace: true });
  }, [draft, navigate]);

  if (!draft) return null;

  async function handleDownloadPdf() {
    if (!draft) return;
    setPdfState('generating');
    try {
      const { downloadCVPdf } = await import(
        '../features/cv-template/pdfGenerator'
      );
      await downloadCVPdf(draft);
      setPdfState('idle');
    } catch (err) {
      console.error('PDF generation failed:', err);
      setPdfState('error');
    }
  }

  async function handleSharePdf() {
    if (!draft) return;
    setShareState('generating');
    try {
      const { shareCVPdf } = await import(
        '../features/cv-template/pdfGenerator'
      );
      const shared = await shareCVPdf(draft);
      setShareState(shared ? 'idle' : 'error');
    } catch (err) {
      // El usuario canceló el diálogo de compartir: no es un error.
      if (err instanceof DOMException && err.name === 'AbortError') {
        setShareState('idle');
        return;
      }
      console.error('PDF share failed:', err);
      setShareState('error');
    }
  }

  const actionsProps = {
    pdfState,
    shareState,
    canShare,
    onDownload: handleDownloadPdf,
    onShare: handleSharePdf,
  };

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
        <PreviewActions className={styles.actions} {...actionsProps} />
      </div>

      <div className={styles.previewFrame}>
        <ClassicTemplate doc={draft} />
      </div>

      <PreviewActions className={styles.actionsBottom} {...actionsProps} />
    </div>
  );
}

export default Preview;
