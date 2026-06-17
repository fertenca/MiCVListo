import { forwardRef, useImperativeHandle } from 'react';
import { useCVStore } from '../../cv-model';
import type { AvailabilityData, CVMode } from '../../cv-model';
import type { StepRef } from '..';
import styles from './AvailabilityStep.module.css';

// ─── Constantes ───────────────────────────────────────────────────────────────

const SCHEDULE_OPTIONS = [
  'Full time',
  'Part time mañana',
  'Part time tarde',
  'Part time noche',
  'Fines de semana',
  'Horarios rotativos',
  'Disponibilidad inmediata',
  'A convenir',
];

const MODALITY_OPTIONS = ['Presencial', 'Remoto', 'Híbrido', 'A convenir'];

const HELP: Record<CVMode, string> = {
  experiencia:
    'Agregá disponibilidad horaria, zona de búsqueda o modalidad si querés que aparezca en tu CV.',
  'primer-empleo':
    'Si estás buscando tu primer trabajo, aclarar tu disponibilidad puede ayudar: horarios, zona o si podés empezar pronto.',
  informal:
    'Podés contar qué horarios, zonas o modalidades te sirven para trabajar.',
};

const EMPTY: AvailabilityData = { scheduleOptions: [], modalityOptions: [] };

// ─── AvailabilityStep ─────────────────────────────────────────────────────────

const AvailabilityStep = forwardRef<StepRef>(function AvailabilityStep(_, ref) {
  const draft = useCVStore((s) => s.draft)!;
  const setAvailability = useCVStore((s) => s.setAvailability);

  useImperativeHandle(ref, () => ({ validate: () => true }));

  // Defensive: handle legacy string format from before v2 migration
  const raw = draft.availability;
  const avail: AvailabilityData =
    !raw || typeof raw === 'string' ? EMPTY : raw;

  function update(patch: Partial<AvailabilityData>) {
    const next = { ...avail, ...patch };
    const isEmpty =
      next.scheduleOptions.length === 0 &&
      next.modalityOptions.length === 0 &&
      !next.location?.trim() &&
      !next.notes?.trim();
    setAvailability(isEmpty ? undefined : next);
  }

  function toggleSchedule(option: string) {
    const current = avail.scheduleOptions;
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    update({ scheduleOptions: next });
  }

  function toggleModality(option: string) {
    const current = avail.modalityOptions;
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    update({ modalityOptions: next });
  }

  const isEmpty =
    avail.scheduleOptions.length === 0 &&
    avail.modalityOptions.length === 0 &&
    !avail.location?.trim() &&
    !avail.notes?.trim();

  return (
    <div className={styles.step}>
      <p className={styles.help}>{HELP[draft.mode]}</p>

      {/* Disponibilidad horaria */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>Disponibilidad horaria</p>
        <div className={styles.optionGrid}>
          {SCHEDULE_OPTIONS.map((opt) => (
            <label key={opt} className={styles.optionLabel}>
              <input
                type="checkbox"
                checked={avail.scheduleOptions.includes(opt)}
                onChange={() => toggleSchedule(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Modalidad */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>Modalidad de trabajo</p>
        <div className={styles.optionGrid}>
          {MODALITY_OPTIONS.map((opt) => (
            <label key={opt} className={styles.optionLabel}>
              <input
                type="checkbox"
                checked={avail.modalityOptions.includes(opt)}
                onChange={() => toggleModality(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Zona geográfica */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="avail-location">
          Zona geográfica o ciudad{' '}
          <span className={styles.optional}>(opcional)</span>
        </label>
        <input
          id="avail-location"
          className={styles.input}
          type="text"
          value={avail.location ?? ''}
          onChange={(e) => update({ location: e.target.value || undefined })}
          placeholder="Ej: Zona oeste · Moreno · CABA · A convenir"
        />
      </div>

      {/* Comentario adicional */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="avail-notes">
          Comentario adicional{' '}
          <span className={styles.optional}>(opcional)</span>
        </label>
        <textarea
          id="avail-notes"
          className={styles.textarea}
          value={avail.notes ?? ''}
          onChange={(e) => update({ notes: e.target.value || undefined })}
          placeholder="Ej: Puedo empezar de forma inmediata y tengo disponibilidad para horarios rotativos."
          rows={3}
        />
      </div>

      {/* Nota suave si no cargó nada */}
      {isEmpty && (
        <p className={styles.softNote}>
          Si no completás este paso podés continuar igual. No es obligatorio.
        </p>
      )}
    </div>
  );
});

export default AvailabilityStep;
