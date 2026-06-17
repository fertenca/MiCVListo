import type {
  CVDocument,
  ExperienceEntry,
  SkillEntry,
} from '../cv-model/types';
import styles from './ClassicTemplate.module.css';

// ─── Mapas de etiquetas ───────────────────────────────────────────────────────

const LEVEL_LABELS: Record<string, string> = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  nativo: 'Nativo',
};

const STATUS_LABELS: Record<string, string> = {
  completo: 'Completo',
  'en-curso': 'En curso',
  incompleto: 'Incompleto',
};

// ─── Helpers locales ──────────────────────────────────────────────────────────

function dateRange(start?: string, end?: string): string | null {
  if (start && end) return `${start} – ${end}`;
  if (start) return `Desde ${start}`;
  if (end) return end;
  return null;
}

function expLabel(e: ExperienceEntry): string {
  return e.org ? `${e.role} — ${e.org}` : e.role;
}

function groupSkills(skills: SkillEntry[]): [string, SkillEntry[]][] {
  const map = new Map<string, SkillEntry[]>();
  for (const sk of skills) {
    const key = sk.category ?? 'Otras habilidades';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(sk);
  }
  return Array.from(map);
}

/** Una habilidad es un chip redundante si su nombre coincide con el de la
 *  categoría que ya se muestra como título (salvo que aporte un certificado). */
function isRedundantChip(sk: SkillEntry, category: string): boolean {
  const sameLabel =
    sk.label.trim().toLowerCase() === category.trim().toLowerCase();
  const hasCert = !!(sk.certificate?.hasCertificate && sk.certificate.name);
  return sameLabel && !hasCert;
}

// ─── Sub-componente: encabezado de sección ────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className={styles.sectionTitle}>{children}</h2>;
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  doc: CVDocument;
}

export function ClassicTemplate({ doc }: Props) {
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
  } = doc;

  // Flags de sección
  const hasExperience = experience.length > 0;
  const hasEducation = education.length > 0;
  const hasCourses = courses.length > 0;
  const hasSkills = skills.length > 0;
  const hasLanguages = languages.length > 0;
  const hasAvailability = !!(
    availability &&
    (availability.scheduleOptions.length > 0 ||
      availability.modalityOptions.length > 0 ||
      availability.location ||
      availability.notes)
  );
  const hasReferences = references.length > 0;

  const skillGroups = groupSkills(skills);
  const contacts = [personal.email, personal.phone, personal.city]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className={styles.cv}>
      {/* ── Encabezado ─────────────────────────────────────────────────── */}
      <header
        className={personal.photo ? `${styles.header} ${styles.headerWithPhoto}` : styles.header}
      >
        {personal.photo && (
          <img
            src={personal.photo}
            alt=""
            aria-hidden="true"
            className={styles.photo}
          />
        )}
        <div className={styles.headerInfo}>
          <h1 className={styles.name}>{personal.fullName || 'Sin nombre'}</h1>
          {personal.headline && (
            <p className={styles.headline}>{personal.headline}</p>
          )}
          {contacts && <p className={styles.contacts}>{contacts}</p>}
          {(personal.links ?? []).length > 0 && (
            <p className={styles.links}>
              {personal.links!.map((l) => l.label || l.url).join(' · ')}
            </p>
          )}
        </div>
      </header>

      {/* ── Perfil ─────────────────────────────────────────────────────── */}
      {profile && (
        <section className={styles.section}>
          <SectionTitle>Perfil</SectionTitle>
          <p className={styles.profileText}>{profile}</p>
        </section>
      )}

      {/* ── Experiencia ────────────────────────────────────────────────── */}
      {hasExperience && (
        <section className={styles.section}>
          <SectionTitle>Experiencia</SectionTitle>
          <div className={styles.entryList}>
            {experience.map((exp) => {
              const dates = dateRange(exp.startDate, exp.endDate);
              return (
                <div key={exp.id} className={styles.entry}>
                  <div className={styles.entryHeader}>
                    <div className={styles.entryTitle}>
                      <span className={styles.entryRole}>{exp.role}</span>
                      {exp.org && (
                        <span className={styles.entryOrg}> · {exp.org}</span>
                      )}
                      {exp.isInformal && (
                        <span className={styles.informalBadge}>informal</span>
                      )}
                    </div>
                    {dates && (
                      <span className={styles.entryDates}>{dates}</span>
                    )}
                  </div>
                  {exp.bullets.length > 0 && (
                    <ul className={styles.bullets}>
                      {exp.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Educación ──────────────────────────────────────────────────── */}
      {hasEducation && (
        <section className={styles.section}>
          <SectionTitle>Educación</SectionTitle>
          <div className={styles.entryList}>
            {education.map((edu) => (
              <div key={edu.id} className={styles.entryRow}>
                <div className={styles.entryRowMain}>
                  <span className={styles.entryRole}>{edu.title}</span>
                  {edu.institution && (
                    <span className={styles.entryOrg}> · {edu.institution}</span>
                  )}
                </div>
                <span className={styles.entryMeta}>
                  {[STATUS_LABELS[edu.status], edu.year].filter(Boolean).join(' · ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Cursos ─────────────────────────────────────────────────────── */}
      {hasCourses && (
        <section className={styles.section}>
          <SectionTitle>Cursos y capacitaciones</SectionTitle>
          <div className={styles.entryList}>
            {courses.map((c) => (
              <div key={c.id} className={styles.entryRow}>
                <div className={styles.entryRowMain}>
                  <span className={styles.entryRole}>{c.name}</span>
                  {c.institution && (
                    <span className={styles.entryOrg}> · {c.institution}</span>
                  )}
                  {c.certificate?.hasCertificate && c.certificate.name && (
                    <span className={styles.certBadge}>
                      Certificado: {c.certificate.name}
                    </span>
                  )}
                </div>
                {c.year && (
                  <span className={styles.entryMeta}>{c.year}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Habilidades ────────────────────────────────────────────────── */}
      {hasSkills && (
        <section className={styles.section}>
          <SectionTitle>Habilidades</SectionTitle>
          <div className={styles.skillGroups}>
            {skillGroups.map(([category, items]) => {
              const visible = items.filter(
                (sk) => !isRedundantChip(sk, category),
              );
              return (
                <div key={category} className={styles.skillGroup}>
                  <span className={styles.skillCategory}>{category}</span>
                  {visible.length > 0 && (
                    <div className={styles.skillChips}>
                      {visible.map((sk) => (
                        <span key={sk.id} className={styles.skillChip}>
                          {sk.label}
                          {sk.certificate?.hasCertificate &&
                            sk.certificate.name && (
                              <span className={styles.skillCert}> ✓</span>
                            )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Idiomas ────────────────────────────────────────────────────── */}
      {hasLanguages && (
        <section className={styles.section}>
          <SectionTitle>Idiomas</SectionTitle>
          <div className={styles.entryList}>
            {languages.map((lang) => (
              <div key={lang.id} className={styles.entryRow}>
                <div className={styles.entryRowMain}>
                  <span className={styles.entryRole}>{lang.language}</span>
                  <span className={styles.entryOrg}>
                    {' · '}{LEVEL_LABELS[lang.level] ?? lang.level}
                  </span>
                  {lang.certificate?.hasCertificate && lang.certificate.name && (
                    <span className={styles.certBadge}>
                      {lang.certificate.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Disponibilidad ─────────────────────────────────────────────── */}
      {hasAvailability && availability && (
        <section className={styles.section}>
          <SectionTitle>Disponibilidad</SectionTitle>
          <div className={styles.availGrid}>
            {availability.scheduleOptions.length > 0 && (
              <div className={styles.availRow}>
                <span className={styles.availLabel}>Horarios</span>
                <span>{availability.scheduleOptions.join(', ')}</span>
              </div>
            )}
            {availability.modalityOptions.length > 0 && (
              <div className={styles.availRow}>
                <span className={styles.availLabel}>Modalidad</span>
                <span>{availability.modalityOptions.join(', ')}</span>
              </div>
            )}
            {availability.location && (
              <div className={styles.availRow}>
                <span className={styles.availLabel}>Zona</span>
                <span>{availability.location}</span>
              </div>
            )}
            {availability.notes && (
              <div className={styles.availRow}>
                <span className={styles.availLabel}>Nota</span>
                <span>{availability.notes}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Referencias ────────────────────────────────────────────────── */}
      {hasReferences && (
        <section className={styles.section}>
          <SectionTitle>Referencias</SectionTitle>
          <div className={styles.entryList}>
            {references.map((ref) => {
              const linkedExp = ref.relatedExperienceId
                ? experience.find((e) => e.id === ref.relatedExperienceId)
                : undefined;
              return (
                <div key={ref.id} className={styles.entryRow}>
                  <div className={styles.entryRowMain}>
                    <span className={styles.entryRole}>{ref.name}</span>
                    {ref.relation && (
                      <span className={styles.entryOrg}> · {ref.relation}</span>
                    )}
                    {linkedExp && (
                      <span className={styles.refLinked}>
                        Referencia de: {expLabel(linkedExp)}
                      </span>
                    )}
                  </div>
                  {ref.phone && (
                    <span className={styles.entryMeta}>{ref.phone}</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
