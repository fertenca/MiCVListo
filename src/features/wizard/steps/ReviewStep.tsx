import { forwardRef, useImperativeHandle, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCVStore } from '../../cv-model';
import type { LanguageLevel } from '../../cv-model';
import type { StepRef } from '..';
import styles from './ReviewStep.module.css';

// ─── Constantes ───────────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<LanguageLevel, string> = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  nativo: 'Nativo',
};

// ─── SectionCard ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  paso: number;
  children: React.ReactNode;
}

function SectionCard({ title, paso, children }: SectionCardProps) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <Link to={`/wizard?paso=${paso}`} className={styles.editLink}>
          Editar
        </Link>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text?: string }) {
  return <p className={styles.emptyState}>{text ?? 'Sin cargar · Opcional'}</p>;
}

// ─── ReviewStep ───────────────────────────────────────────────────────────────

const ReviewStep = forwardRef<StepRef>(function ReviewStep(_, ref) {
  const draft = useCVStore((s) => s.draft)!;
  const [showNameWarning, setShowNameWarning] = useState(false);

  useImperativeHandle(ref, () => ({
    validate() {
      if (!draft.personal.fullName.trim()) {
        setShowNameWarning(true);
        return false;
      }
      return true;
    },
  }));

  const {
    personal,
    profile,
    experience,
    education,
    courses,
    skills,
    languages,
    availability,
    references,
    mode,
  } = draft;

  return (
    <div className={styles.step}>
      {/* Intro */}
      <div className={styles.intro}>
        <p className={styles.introText}>
          Revisá que esté todo bien antes de ver tu CV.
        </p>
        <p className={styles.introSub}>
          Después vas a poder ver cómo queda y descargarlo en PDF.
        </p>
      </div>

      {/* Advertencia si falta nombre */}
      {showNameWarning && (
        <div role="alert" className={styles.nameWarning}>
          <strong>Falta tu nombre.</strong> Para continuar necesitás completar
          al menos tu nombre en{' '}
          <Link to="/wizard?paso=1" className={styles.warningLink}>
            Datos personales
          </Link>
          .
        </div>
      )}

      {/* Mensaje suave para primer empleo */}
      {mode === 'primer-empleo' && experience.length === 0 && (
        <div className={styles.reassurance}>
          No tenés experiencia cargada y está bien. Tu formación, habilidades y
          disponibilidad son suficientes para armar un buen CV.
        </div>
      )}

      {/* ── Datos personales ────────────────────────────────────────────── */}
      <SectionCard title="Datos personales" paso={1}>
        {personal.fullName.trim() ? (
          <ul className={styles.dataList}>
            <li className={styles.dataName}>{personal.fullName}</li>
            {personal.headline && <li>{personal.headline}</li>}
            {personal.email && <li>{personal.email}</li>}
            {personal.phone && <li>{personal.phone}</li>}
            {personal.city && <li>{personal.city}</li>}
          </ul>
        ) : (
          <p className={`${styles.emptyState} ${styles.emptyStateWarn}`}>
            ⚠ Falta tu nombre — es el único campo obligatorio
          </p>
        )}
      </SectionCard>

      {/* ── Perfil ──────────────────────────────────────────────────────── */}
      <SectionCard title="Perfil" paso={3}>
        {profile ? (
          <p className={styles.profileText}>
            {profile.length > 180 ? profile.slice(0, 180) + '…' : profile}
          </p>
        ) : (
          <EmptyState />
        )}
      </SectionCard>

      {/* ── Experiencia ─────────────────────────────────────────────────── */}
      <SectionCard title="Experiencia" paso={4}>
        {experience.length > 0 ? (
          <ul className={styles.dataList}>
            {experience.map((e) => (
              <li key={e.id}>
                <span className={styles.itemPrimary}>{e.role}</span>
                {e.org && (
                  <span className={styles.itemSecondary}> · {e.org}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState text="Sin cargar · Opcional" />
        )}
      </SectionCard>

      {/* ── Educación ───────────────────────────────────────────────────── */}
      <SectionCard title="Educación" paso={5}>
        {education.length > 0 ? (
          <ul className={styles.dataList}>
            {education.map((e) => (
              <li key={e.id}>
                <span className={styles.itemPrimary}>{e.title}</span>
                {e.institution && (
                  <span className={styles.itemSecondary}>
                    {' '}
                    · {e.institution}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState />
        )}
      </SectionCard>

      {/* ── Cursos ──────────────────────────────────────────────────────── */}
      <SectionCard title="Cursos y capacitaciones" paso={6}>
        {courses.length > 0 ? (
          <ul className={styles.dataList}>
            {courses.map((c) => (
              <li key={c.id}>
                <span className={styles.itemPrimary}>{c.name}</span>
                {c.institution && (
                  <span className={styles.itemSecondary}>
                    {' '}
                    · {c.institution}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState />
        )}
      </SectionCard>

      {/* ── Habilidades ─────────────────────────────────────────────────── */}
      <SectionCard title="Habilidades" paso={7}>
        {skills.length > 0 ? (
          <p className={styles.chipRow}>
            {skills.map((s) => (
              <span key={s.id} className={styles.chip}>
                {s.label}
              </span>
            ))}
          </p>
        ) : (
          <EmptyState />
        )}
      </SectionCard>

      {/* ── Idiomas ─────────────────────────────────────────────────────── */}
      <SectionCard title="Idiomas" paso={8}>
        {languages.length > 0 ? (
          <ul className={styles.dataList}>
            {languages.map((l) => (
              <li key={l.id}>
                <span className={styles.itemPrimary}>{l.language}</span>
                <span className={styles.itemSecondary}>
                  {' '}
                  · {LEVEL_LABELS[l.level]}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState />
        )}
      </SectionCard>

      {/* ── Disponibilidad ──────────────────────────────────────────────── */}
      <SectionCard title="Disponibilidad" paso={9}>
        {availability ? (
          <p className={styles.profileText}>
            {availability.length > 180
              ? availability.slice(0, 180) + '…'
              : availability}
          </p>
        ) : (
          <EmptyState />
        )}
      </SectionCard>

      {/* ── Referencias ─────────────────────────────────────────────────── */}
      <SectionCard title="Referencias" paso={10}>
        {references.length > 0 ? (
          <ul className={styles.dataList}>
            {references.map((r) => (
              <li key={r.id}>
                <span className={styles.itemPrimary}>{r.name}</span>
                {r.relation && (
                  <span className={styles.itemSecondary}> · {r.relation}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState />
        )}
      </SectionCard>
    </div>
  );
});

export default ReviewStep;
