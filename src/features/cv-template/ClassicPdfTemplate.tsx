import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { CVDocument, ExperienceEntry, SkillEntry } from '../cv-model/types';

// ─── Labels ──────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1c2430',
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    lineHeight: 1.55,
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e6ec',
    borderStyle: 'solid',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#e2e6ec',
    borderStyle: 'solid',
  },
  name: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: '#1c2430',
    lineHeight: 1.2,
  },
  headline: {
    fontSize: 12,
    color: '#5b6675',
  },
  contacts: {
    fontSize: 10,
    color: '#5b6675',
  },
  links: {
    fontSize: 10,
    color: '#2563eb',
  },

  // Sections
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#2563eb',
    borderStyle: 'solid',
    paddingBottom: 4,
    marginBottom: 10,
  },

  // Profile
  profileText: {
    fontSize: 11,
    lineHeight: 1.65,
    color: '#1c2430',
  },

  // Entry list
  entryList: {
    flexDirection: 'column',
    gap: 10,
  },

  // Experience entry
  entry: {
    flexDirection: 'column',
    gap: 3,
  },
  entryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  entryLeft: {
    flex: 1,
  },
  entryRole: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#1c2430',
  },
  entryOrg: {
    fontSize: 11,
    color: '#5b6675',
  },
  entryInformal: {
    fontSize: 9.5,
    color: '#5b6675',
  },
  entryDates: {
    fontSize: 9.5,
    color: '#5b6675',
  },

  // Bullets
  bulletList: {
    marginTop: 2,
    flexDirection: 'column',
    gap: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 4,
  },
  bulletDot: {
    fontSize: 10,
    color: '#1c2430',
    lineHeight: 1.5,
    width: 10,
  },
  bulletText: {
    fontSize: 10,
    color: '#1c2430',
    flex: 1,
    lineHeight: 1.5,
  },

  // Entry row (education, courses, languages, references)
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  entryRowLeft: {
    flex: 1,
  },
  entryMeta: {
    fontSize: 9.5,
    color: '#5b6675',
  },
  entryCert: {
    fontSize: 9.5,
    color: '#166534',
  },
  refLinked: {
    fontSize: 9.5,
    color: '#5b6675',
    fontFamily: 'Helvetica-Oblique',
  },

  // Skills
  skillGroups: {
    flexDirection: 'column',
    gap: 8,
  },
  skillGroupRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  skillCategoryLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: '#5b6675',
    width: 110,
    paddingTop: 2,
  },
  skillChipWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillChip: {
    backgroundColor: '#f7f8fa',
    borderWidth: 1,
    borderColor: '#e2e6ec',
    borderStyle: 'solid',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  skillChipText: {
    fontSize: 9,
    color: '#1c2430',
  },

  // Availability
  availGrid: {
    flexDirection: 'column',
    gap: 5,
  },
  availRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  availLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#5b6675',
    width: 70,
  },
  availValue: {
    flex: 1,
    fontSize: 10,
    color: '#1c2430',
  },
});

// ─── Section title ────────────────────────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  doc: CVDocument;
}

export function ClassicPdfTemplate({ doc }: Props) {
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
    <Document title="Mi CV" author={personal.fullName || undefined}>
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={personal.photo ? styles.headerRow : undefined}>
            {personal.photo && (
              <Image src={personal.photo} style={styles.photo} />
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{personal.fullName || 'Sin nombre'}</Text>
              {personal.headline && (
                <Text style={styles.headline}>{personal.headline}</Text>
              )}
              {contacts ? <Text style={styles.contacts}>{contacts}</Text> : null}
              {(personal.links ?? []).length > 0 && (
                <Text style={styles.links}>
                  {personal.links!.map((l) => l.label || l.url).join(' · ')}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Profile ── */}
        {profile && (
          <View style={styles.section}>
            <SectionTitle label="Perfil" />
            <Text style={styles.profileText}>{profile}</Text>
          </View>
        )}

        {/* ── Experience ── */}
        {hasExperience && (
          <View style={styles.section}>
            <SectionTitle label="Experiencia" />
            <View style={styles.entryList}>
              {experience.map((exp) => {
                const dates = dateRange(exp.startDate, exp.endDate);
                return (
                  <View key={exp.id} style={styles.entry}>
                    <View style={styles.entryHeaderRow}>
                      <View style={styles.entryLeft}>
                        <Text>
                          <Text style={styles.entryRole}>{exp.role}</Text>
                          {exp.org && (
                            <Text style={styles.entryOrg}> · {exp.org}</Text>
                          )}
                          {exp.isInformal && (
                            <Text style={styles.entryInformal}> (informal)</Text>
                          )}
                        </Text>
                      </View>
                      {dates && (
                        <Text style={styles.entryDates}>{dates}</Text>
                      )}
                    </View>
                    {exp.bullets.length > 0 && (
                      <View style={styles.bulletList}>
                        {exp.bullets.map((b, i) => (
                          <View key={i} style={styles.bulletRow}>
                            <Text style={styles.bulletDot}>{'•'}</Text>
                            <Text style={styles.bulletText}>{b}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Education ── */}
        {hasEducation && (
          <View style={styles.section}>
            <SectionTitle label="Educación" />
            <View style={styles.entryList}>
              {education.map((edu) => (
                <View key={edu.id} style={styles.entryRow}>
                  <View style={styles.entryRowLeft}>
                    <Text>
                      <Text style={styles.entryRole}>{edu.title}</Text>
                      {edu.institution && (
                        <Text style={styles.entryOrg}> · {edu.institution}</Text>
                      )}
                    </Text>
                  </View>
                  <Text style={styles.entryMeta}>
                    {[STATUS_LABELS[edu.status], edu.year].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Courses ── */}
        {hasCourses && (
          <View style={styles.section}>
            <SectionTitle label="Cursos y capacitaciones" />
            <View style={styles.entryList}>
              {courses.map((c) => (
                <View key={c.id} style={styles.entryRow}>
                  <View style={styles.entryRowLeft}>
                    <Text>
                      <Text style={styles.entryRole}>{c.name}</Text>
                      {c.institution && (
                        <Text style={styles.entryOrg}> · {c.institution}</Text>
                      )}
                      {c.certificate?.hasCertificate && c.certificate.name && (
                        <Text style={styles.entryCert}>
                          {' '}(Cert: {c.certificate.name})
                        </Text>
                      )}
                    </Text>
                  </View>
                  {c.year && <Text style={styles.entryMeta}>{c.year}</Text>}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Skills ── */}
        {hasSkills && (
          <View style={styles.section}>
            <SectionTitle label="Habilidades" />
            <View style={styles.skillGroups}>
              {skillGroups.map(([category, items]) => {
                const visible = items.filter(
                  (sk) => !isRedundantChip(sk, category),
                );
                return (
                  <View key={category} style={styles.skillGroupRow}>
                    <Text style={styles.skillCategoryLabel}>{category}</Text>
                    {visible.length > 0 && (
                      <View style={styles.skillChipWrap}>
                        {visible.map((sk) => (
                          <View key={sk.id} style={styles.skillChip}>
                            <Text style={styles.skillChipText}>
                              {sk.label}
                              {sk.certificate?.hasCertificate &&
                              sk.certificate.name
                                ? ' (cert.)'
                                : ''}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Languages ── */}
        {hasLanguages && (
          <View style={styles.section}>
            <SectionTitle label="Idiomas" />
            <View style={styles.entryList}>
              {languages.map((lang) => (
                <View key={lang.id} style={styles.entryRow}>
                  <View style={styles.entryRowLeft}>
                    <Text>
                      <Text style={styles.entryRole}>{lang.language}</Text>
                      <Text style={styles.entryOrg}>
                        {' · '}{LEVEL_LABELS[lang.level] ?? lang.level}
                      </Text>
                      {lang.certificate?.hasCertificate && lang.certificate.name && (
                        <Text style={styles.entryCert}>
                          {' '}({lang.certificate.name})
                        </Text>
                      )}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Availability ── */}
        {hasAvailability && availability && (
          <View style={styles.section}>
            <SectionTitle label="Disponibilidad" />
            <View style={styles.availGrid}>
              {availability.scheduleOptions.length > 0 && (
                <View style={styles.availRow}>
                  <Text style={styles.availLabel}>Horarios</Text>
                  <Text style={styles.availValue}>
                    {availability.scheduleOptions.join(', ')}
                  </Text>
                </View>
              )}
              {availability.modalityOptions.length > 0 && (
                <View style={styles.availRow}>
                  <Text style={styles.availLabel}>Modalidad</Text>
                  <Text style={styles.availValue}>
                    {availability.modalityOptions.join(', ')}
                  </Text>
                </View>
              )}
              {availability.location && (
                <View style={styles.availRow}>
                  <Text style={styles.availLabel}>Zona</Text>
                  <Text style={styles.availValue}>{availability.location}</Text>
                </View>
              )}
              {availability.notes && (
                <View style={styles.availRow}>
                  <Text style={styles.availLabel}>Nota</Text>
                  <Text style={styles.availValue}>{availability.notes}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── References ── */}
        {hasReferences && (
          <View style={styles.section}>
            <SectionTitle label="Referencias" />
            <View style={styles.entryList}>
              {references.map((ref) => {
                const linkedExp = ref.relatedExperienceId
                  ? experience.find((e) => e.id === ref.relatedExperienceId)
                  : undefined;
                return (
                  <View key={ref.id} style={styles.entryRow}>
                    <View style={styles.entryRowLeft}>
                      <Text>
                        <Text style={styles.entryRole}>{ref.name}</Text>
                        {ref.relation && (
                          <Text style={styles.entryOrg}> · {ref.relation}</Text>
                        )}
                      </Text>
                      {linkedExp && (
                        <Text style={styles.refLinked}>
                          Referencia de: {expLabel(linkedExp)}
                        </Text>
                      )}
                    </View>
                    {ref.phone && (
                      <Text style={styles.entryMeta}>{ref.phone}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

      </Page>
    </Document>
  );
}
