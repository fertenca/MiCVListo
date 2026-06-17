import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCVStore } from '../features/cv-model';
import type { CVMode } from '../features/cv-model';
import styles from './Crear.module.css';

const MODES: { id: CVMode; title: string; description: string }[] = [
  {
    id: 'experiencia',
    title: 'Tengo experiencia laboral',
    description:
      'Trabajé en relación de dependencia, freelance o en proyectos formales.',
  },
  {
    id: 'primer-empleo',
    title: 'Es mi primer empleo',
    description:
      'Busco mi primer trabajo o pasantía y aún no tengo experiencia laboral.',
  },
  {
    id: 'informal',
    title: 'Trabajé de forma informal',
    description:
      'Hice changas, cuidado de personas, ventas u otros trabajos. También cuenta.',
  },
];

function Crear() {
  const navigate = useNavigate();
  const draft = useCVStore((s) => s.draft);
  const initDraft = useCVStore((s) => s.initDraft);
  const resetDraft = useCVStore((s) => s.resetDraft);
  const [showNew, setShowNew] = useState(false);

  function handleModeSelect(mode: CVMode) {
    if (showNew) {
      resetDraft(mode);
    } else {
      initDraft(mode);
    }
    navigate('/wizard');
  }

  if (draft && !showNew) {
    return (
      <section className={styles.page}>
        <h1 className={styles.title}>Tenés un CV guardado</h1>
        <div className={styles.draftAlert}>
          <p className={styles.draftText}>
            Tu borrador se guardó automáticamente en este navegador. ¿Querés
            continuar donde dejaste o empezar uno nuevo?
          </p>
          <div className={styles.draftActions}>
            <button
              className={styles.btnPrimary}
              onClick={() => navigate('/wizard')}
            >
              Continuar mi CV
            </button>
            <button
              className={styles.btnGhost}
              onClick={() => setShowNew(true)}
            >
              Empezar uno nuevo
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>¿Cómo es tu situación laboral?</h1>
      <p className={styles.subtitle}>
        Elegí la opción que mejor te describe. Podés cambiarla después.
      </p>
      {showNew && (
        <p className={styles.warning}>
          Si elegís empezar de cero, el borrador guardado se va a perder.
        </p>
      )}
      <div className={styles.grid}>
        {MODES.map((mode) => (
          <button
            key={mode.id}
            className={styles.card}
            onClick={() => handleModeSelect(mode.id)}
          >
            <span className={styles.cardTitle}>{mode.title}</span>
            <span className={styles.cardDesc}>{mode.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default Crear;
