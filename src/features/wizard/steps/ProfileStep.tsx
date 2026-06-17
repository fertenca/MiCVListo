import { forwardRef, useImperativeHandle } from 'react';
import { useCVStore } from '../../cv-model';
import type { CVMode } from '../../cv-model';
import type { StepRef } from '..';
import styles from './ProfileStep.module.css';

// ─── Contenido por modo ───────────────────────────────────────────────────────

const HELP: Record<CVMode, string> = {
  experiencia:
    'Escribí un resumen corto de tu experiencia, tus principales habilidades y el tipo de trabajo que estás buscando.',
  'primer-empleo':
    'No hace falta tener experiencia laboral. Podés contar qué estás estudiando, qué sabés hacer, cómo sos trabajando y qué tipo de oportunidad buscás.',
  informal:
    'Podés contar tareas que hiciste aunque hayan sido changas, ayuda en un negocio familiar o trabajos sin registrar. Lo importante es mostrar qué sabés hacer.',
};

const EXAMPLES: Record<CVMode, string> = {
  experiencia:
    'Persona con experiencia en atención al cliente, manejo de caja y tareas administrativas. Me destaco por la responsabilidad, el trato cordial y la capacidad para organizar tareas.',
  'primer-empleo':
    'Busco mi primera oportunidad laboral para aprender y desarrollarme. Soy una persona responsable, con buena predisposición, facilidad para aprender y compromiso con las tareas.',
  informal:
    'Cuento con experiencia en tareas informales de atención al público, organización de pedidos y colaboración en actividades comerciales. Me destaco por la responsabilidad y la buena disposición para trabajar.',
};

const CHAR_SOFT_LIMIT = 600;

// ─── Componente ───────────────────────────────────────────────────────────────

const ProfileStep = forwardRef<StepRef>(function ProfileStep(_, ref) {
  const draft = useCVStore((s) => s.draft)!;
  const setProfile = useCVStore((s) => s.setProfile);

  useImperativeHandle(ref, () => ({
    validate() {
      return true;
    },
  }));

  const profile = draft.profile ?? '';
  const charCount = profile.length;
  const isTooLong = charCount > CHAR_SOFT_LIMIT;

  return (
    <div className={styles.form}>
      <p className={styles.help}>{HELP[draft.mode]}</p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="prf-profile">
          Tu perfil profesional{' '}
          <span className={styles.optional}>(opcional)</span>
        </label>
        <textarea
          id="prf-profile"
          className={`${styles.textarea}${isTooLong ? ' ' + styles.textareaWarn : ''}`}
          value={profile}
          onChange={(e) => setProfile(e.target.value || undefined)}
          placeholder="Escribí un breve resumen sobre vos…"
          rows={6}
        />
        <div className={styles.charRow}>
          <span className={isTooLong ? styles.charCountWarn : styles.charCount}>
            {charCount} {charCount === 1 ? 'carácter' : 'caracteres'}
          </span>
          {isTooLong && (
            <span className={styles.warnMsg}>
              Tu perfil es muy largo. En un CV, los párrafos breves tienen más
              impacto.
            </span>
          )}
        </div>
      </div>

      <div className={styles.example}>
        <p className={styles.exampleLabel}>
          Ejemplo de perfil para tu situación:
        </p>
        <blockquote className={styles.exampleText}>
          {EXAMPLES[draft.mode]}
        </blockquote>
        <p className={styles.exampleNote}>
          Podés usarlo como punto de partida y editarlo a tu gusto.
        </p>
      </div>
    </div>
  );
});

export default ProfileStep;
