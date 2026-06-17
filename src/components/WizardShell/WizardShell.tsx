import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCVStore } from '../../features/cv-model';
import { WIZARD_STEPS, getStepTitle } from '../../features/wizard';
import type { StepRef } from '../../features/wizard';
import PersonalStep from '../../features/wizard/steps/PersonalStep';
import ProfileStep from '../../features/wizard/steps/ProfileStep';
import ExperienceStep from '../../features/wizard/steps/ExperienceStep';
import EducationStep from '../../features/wizard/steps/EducationStep';
import styles from './WizardShell.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSavedAt(ts: number): string {
  return new Date(ts).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const TOTAL = WIZARD_STEPS.length;

// ─── Componente ───────────────────────────────────────────────────────────────

function WizardShell() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const draft = useCVStore((s) => s.draft);
  const stepRef = useRef<StepRef>(null);

  useEffect(() => {
    if (!draft) navigate('/crear', { replace: true });
  }, [draft, navigate]);

  if (!draft) return null;

  const rawPaso = parseInt(searchParams.get('paso') ?? '1', 10);
  const stepIndex = Number.isNaN(rawPaso)
    ? 0
    : Math.max(0, Math.min(rawPaso - 1, TOTAL - 1));
  const step = WIZARD_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === TOTAL - 1;
  const progress = ((stepIndex + 1) / TOTAL) * 100;

  function goTo(index: number) {
    setSearchParams({ paso: String(index + 1) });
  }

  function handleNext() {
    if (stepRef.current) {
      const valid = stepRef.current.validate();
      if (!valid) return;
    }
    if (isLast) {
      navigate('/vista-previa');
    } else {
      goTo(stepIndex + 1);
    }
  }

  return (
    <div className={styles.shell}>
      {/* Autosave */}
      <div className={styles.autosaveBar}>
        <span className={styles.savedMark}>Guardado ✓</span>
        <span className={styles.savedText}>
          Borrador local · {formatSavedAt(draft.meta.updatedAt)}
        </span>
      </div>

      {/* Progreso */}
      <div className={styles.progressWrap}>
        <div
          className={styles.progressBar}
          role="progressbar"
          aria-valuenow={stepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-label="Progreso del wizard"
        >
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className={styles.progressMeta}>
          Paso {stepIndex + 1} de {TOTAL} — {step.label}
        </p>
      </div>

      {/* Paso actual */}
      <main className={styles.stepArea}>
        <h1 className={styles.stepTitle}>{getStepTitle(step, draft.mode)}</h1>

        {step.id === 'personal' ? (
          <PersonalStep ref={stepRef} />
        ) : step.id === 'perfil' ? (
          <ProfileStep ref={stepRef} />
        ) : step.id === 'experiencia' ? (
          <ExperienceStep ref={stepRef} />
        ) : step.id === 'educacion' ? (
          <EducationStep ref={stepRef} />
        ) : (
          <div className={styles.stepPlaceholder}>
            <span className={styles.placeholderBadge}>
              Próximamente · Fase 4
            </span>
            <p className={styles.placeholderText}>
              El formulario de este paso llega en la Fase 4.
            </p>
          </div>
        )}
      </main>

      {/* Navegación */}
      <footer className={styles.navFooter}>
        <button
          className={styles.btnGhost}
          onClick={() => navigate('/')}
          type="button"
        >
          Salir
        </button>
        <div className={styles.navRight}>
          {!isFirst && (
            <button
              className={styles.btnSecondary}
              onClick={() => goTo(stepIndex - 1)}
              type="button"
            >
              Atrás
            </button>
          )}
          <button
            className={styles.btnPrimary}
            onClick={handleNext}
            type="button"
          >
            {isLast ? 'Ver mi CV' : 'Siguiente'}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default WizardShell;
