import { forwardRef, useImperativeHandle } from 'react';
import { useCVStore } from '../../cv-model';
import type { CVMode } from '../../cv-model';
import type { StepRef } from '..';
import styles from './AvailabilityStep.module.css';

// ─── Constantes ───────────────────────────────────────────────────────────────

const CHAR_SOFT_LIMIT = 300;

const HELP: Record<CVMode, string> = {
  experiencia:
    'Agregá disponibilidad horaria, zona de búsqueda o modalidad si querés que aparezca en tu CV.',
  'primer-empleo':
    'Si estás buscando tu primer trabajo, aclarar tu disponibilidad puede ayudar: horarios, zona o si podés empezar pronto.',
  informal:
    'Podés contar qué horarios, zonas o modalidades te sirven para trabajar.',
};

const EXAMPLES = [
  'Disponibilidad full time.',
  'Disponibilidad part time por la tarde.',
  'Disponibilidad inmediata.',
  'Disponibilidad para trabajar fines de semana.',
  'Busco trabajo en zona oeste o alrededores.',
  'Disponibilidad para horarios rotativos.',
];

// ─── AvailabilityStep ─────────────────────────────────────────────────────────

const AvailabilityStep = forwardRef<StepRef>(function AvailabilityStep(_, ref) {
  const draft = useCVStore((s) => s.draft)!;
  const setAvailability = useCVStore((s) => s.setAvailability);

  useImperativeHandle(ref, () => ({
    validate() {
      return true;
    },
  }));

  const value = draft.availability ?? '';
  const charCount = value.length;
  const isOverLimit = charCount > CHAR_SOFT_LIMIT;

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setAvailability(e.target.value || undefined);
  }

  return (
    <div className={styles.step}>
      <p className={styles.help}>{HELP[draft.mode]}</p>

      {/* Textarea */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="availability-text">
          Tu disponibilidad <span className={styles.optional}>(opcional)</span>
        </label>
        <textarea
          id="availability-text"
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          placeholder="Ej: Disponibilidad full time. Busco trabajo en zona norte."
          rows={4}
        />
        <div className={styles.charRow}>
          <span
            className={`${styles.charCount}${isOverLimit ? ' ' + styles.charCountOver : ''}`}
          >
            {charCount} caracteres
            {isOverLimit && ' — te recomendamos ser más breve'}
          </span>
        </div>
      </div>

      {/* Ejemplos */}
      <div className={styles.examples}>
        <p className={styles.examplesTitle}>Ejemplos:</p>
        <ul className={styles.examplesList}>
          {EXAMPLES.map((ex) => (
            <li key={ex} className={styles.exampleItem}>
              {ex}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default AvailabilityStep;
