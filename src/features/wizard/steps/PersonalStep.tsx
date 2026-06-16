import { forwardRef, useImperativeHandle, useState } from 'react';
import { useCVStore, personalSchema } from '../../cv-model';
import type { CVMode, PersonalInfo } from '../../cv-model';
import type { StepRef } from '..';
import styles from './PersonalStep.module.css';

// ─── Textos por modo ──────────────────────────────────────────────────────────

const HELP: Record<CVMode, string> = {
  experiencia: 'Usá el nombre que querés que vea quien recibe tu CV.',
  'primer-empleo':
    'No necesitás tener experiencia para empezar. Con estos datos ya armamos la base.',
  informal:
    'Aunque tu experiencia haya sido informal, estos datos ayudan a presentar tu CV de forma clara.',
};

// ─── Tipos locales ────────────────────────────────────────────────────────────

type OptionalField = Extract<
  keyof PersonalInfo,
  'headline' | 'email' | 'phone' | 'city'
>;
type FieldErrors = Partial<Record<string, string>>;

// ─── Componente ───────────────────────────────────────────────────────────────

const PersonalStep = forwardRef<StepRef>(function PersonalStep(_, ref) {
  const draft = useCVStore((s) => s.draft)!;
  const updatePersonal = useCVStore((s) => s.updatePersonal);
  const [errors, setErrors] = useState<FieldErrors>({});

  useImperativeHandle(ref, () => ({
    validate() {
      const result = personalSchema.safeParse(draft.personal);
      if (!result.success) {
        const fieldErrors: FieldErrors = {};
        for (const issue of result.error.issues) {
          const key = String(issue.path[0] ?? 'fullName');
          if (!fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        setErrors(fieldErrors);
        return false;
      }
      setErrors({});
      return true;
    },
  }));

  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleOptional(field: OptionalField, value: string) {
    updatePersonal({ [field]: value || undefined });
    clearError(field);
  }

  const p = draft.personal;

  return (
    <div className={styles.form}>
      <p className={styles.help}>{HELP[draft.mode]}</p>

      {/* Nombre y apellido */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="ps-fullName">
          Nombre y apellido <span className={styles.required}>*</span>
        </label>
        <input
          id="ps-fullName"
          className={`${styles.input}${errors.fullName ? ' ' + styles.inputError : ''}`}
          type="text"
          value={p.fullName}
          onChange={(e) => {
            updatePersonal({ fullName: e.target.value });
            clearError('fullName');
          }}
          placeholder="Ej: María González"
          autoComplete="name"
        />
        {errors.fullName && (
          <span role="alert" className={styles.errorMsg}>
            {errors.fullName}
          </span>
        )}
      </div>

      {/* Título o descripción breve */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="ps-headline">
          Título o descripción breve{' '}
          <span className={styles.optional}>(opcional)</span>
        </label>
        <input
          id="ps-headline"
          className={styles.input}
          type="text"
          value={p.headline ?? ''}
          onChange={(e) => handleOptional('headline', e.target.value)}
          placeholder="Ej: Atención al cliente · Cajero · Estudiante secundario"
        />
        <span className={styles.hint}>
          Aparece debajo de tu nombre en el CV.
        </span>
      </div>

      {/* Email + Teléfono */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ps-email">
            Email <span className={styles.optional}>(opcional)</span>
          </label>
          <input
            id="ps-email"
            className={`${styles.input}${errors.email ? ' ' + styles.inputError : ''}`}
            type="email"
            value={p.email ?? ''}
            onChange={(e) => handleOptional('email', e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
          />
          {errors.email && (
            <span role="alert" className={styles.errorMsg}>
              {errors.email}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="ps-phone">
            Teléfono <span className={styles.optional}>(opcional)</span>
          </label>
          <input
            id="ps-phone"
            className={styles.input}
            type="tel"
            value={p.phone ?? ''}
            onChange={(e) => handleOptional('phone', e.target.value)}
            placeholder="Ej: 11 1234-5678"
            autoComplete="tel"
          />
        </div>
      </div>

      {/* Ciudad */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="ps-city">
          Ciudad o localidad <span className={styles.optional}>(opcional)</span>
        </label>
        <input
          id="ps-city"
          className={styles.input}
          type="text"
          value={p.city ?? ''}
          onChange={(e) => handleOptional('city', e.target.value)}
          placeholder="Ej: Buenos Aires · Rosario · Córdoba"
          autoComplete="address-level2"
        />
      </div>
    </div>
  );
});

export default PersonalStep;
