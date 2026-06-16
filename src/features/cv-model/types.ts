// ─── Enumeraciones ───────────────────────────────────────────────────────────

/** Modo con que el usuario inició el wizard. Controla qué sugerencias y textos
 *  se muestran en cada sección. */
export type CVMode = 'experiencia' | 'primer-empleo' | 'informal';

/** Plantilla visual del CV. */
export type TemplateId = 'clasica' | 'moderna' | 'primer-empleo';

export type EducationStatus = 'completo' | 'en-curso' | 'incompleto';

export type LanguageLevel = 'basico' | 'intermedio' | 'avanzado' | 'nativo';

// ─── Sub-tipos ───────────────────────────────────────────────────────────────

export interface PersonalLink {
  label: string;
  url: string;
}

export interface PersonalInfo {
  fullName: string;
  headline?: string;
  email?: string;
  phone?: string;
  city?: string;
  /** data-URL comprimido a ~80-150 KB. Local en la V0.
   *  Si en el futuro se persiste en Firestore, debe ir comprimida
   *  y con aclaración de privacidad al usuario. */
  photo?: string;
  links?: PersonalLink[];
}

export interface ExperienceEntry {
  id: string;
  role: string;
  org?: string;
  isInformal: boolean;
  /** Texto libre: "2022-03" o solo "2022". */
  startDate?: string;
  /** Texto libre o "Actualidad". */
  endDate?: string;
  /** Frases generadas por el motor o escritas a mano por el usuario. */
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  title: string;
  institution?: string;
  status: EducationStatus;
  year?: string;
}

export interface CourseEntry {
  id: string;
  name: string;
  institution?: string;
  year?: string;
}

export interface SkillEntry {
  id: string;
  label: string;
  category?: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  level: LanguageLevel;
}

export interface ReferenceEntry {
  id: string;
  name: string;
  relation?: string;
  phone?: string;
}

export interface CVMeta {
  createdAt: number;
  updatedAt: number;
}

// ─── Documento principal ─────────────────────────────────────────────────────

export interface CVDocument {
  id: string;
  /** Número de versión del esquema. Incrementar cuando el modelo cambie
   *  de forma incompatible, para poder migrar borradores guardados. */
  schemaVersion: 1;
  mode: CVMode;
  template: TemplateId;
  personal: PersonalInfo;
  profile?: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  courses: CourseEntry[];
  skills: SkillEntry[];
  languages: LanguageEntry[];
  availability?: string;
  references: ReferenceEntry[];
  meta: CVMeta;
}
