import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCVStore } from '../features/cv-model';
import { ClassicTemplate } from '../features/cv-template/ClassicTemplate';
import styles from './Preview.module.css';

function Preview() {
  const navigate = useNavigate();
  const draft = useCVStore((s) => s.draft);

  useEffect(() => {
    if (!draft) navigate('/crear', { replace: true });
  }, [draft, navigate]);

  if (!draft) return null;

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
          <button type="button" className={styles.btnPdf} disabled>
            Descargar PDF
            <span className={styles.btnPdfNote}>Próximamente</span>
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
