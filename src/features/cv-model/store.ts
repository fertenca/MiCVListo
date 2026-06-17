import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  CVDocument,
  CVMode,
  TemplateId,
  PersonalInfo,
  ExperienceEntry,
  EducationEntry,
  CourseEntry,
  SkillEntry,
  LanguageEntry,
  ReferenceEntry,
} from './types';

// ─── Constantes ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'micvlisto:draft';
const DEFAULT_TEMPLATE: TemplateId = 'clasica';

// ─── Helpers de módulo (no exportados) ───────────────────────────────────────

function createEmptyDraft(mode: CVMode): CVDocument {
  const now = Date.now();
  return {
    id: nanoid(),
    schemaVersion: 1,
    mode,
    template: DEFAULT_TEMPLATE,
    personal: { fullName: '' },
    experience: [],
    education: [],
    courses: [],
    skills: [],
    languages: [],
    references: [],
    meta: { createdAt: now, updatedAt: now },
  };
}

/** Actualiza `meta.updatedAt` sin mutar el objeto original. */
function touch(draft: CVDocument): CVDocument {
  return { ...draft, meta: { ...draft.meta, updatedAt: Date.now() } };
}

// ─── Interfaz del store ───────────────────────────────────────────────────────

export interface CVStore {
  draft: CVDocument | null;

  // Ciclo de vida del borrador
  /** Crea un borrador nuevo solo si no existe uno previo. */
  initDraft: (mode: CVMode) => void;
  /** Siempre reemplaza el borrador actual. Usar cuando el usuario
   *  elige explícitamente empezar de cero. */
  resetDraft: (mode: CVMode) => void;
  /** Borra el borrador del store y del localStorage. */
  clearDraft: () => void;

  // Campos de nivel superior
  setMode: (mode: CVMode) => void;
  setTemplate: (template: TemplateId) => void;

  // Datos personales
  updatePersonal: (data: Partial<PersonalInfo>) => void;

  // Perfil / resumen
  setProfile: (profile: string | undefined) => void;

  // Experiencia (array)
  /** Agrega una entrada y devuelve su id generado. */
  addExperience: (entry: Omit<ExperienceEntry, 'id'>) => string;
  updateExperience: (
    id: string,
    data: Partial<Omit<ExperienceEntry, 'id'>>,
  ) => void;
  removeExperience: (id: string) => void;

  // Educación (array)
  addEducation: (entry: Omit<EducationEntry, 'id'>) => string;
  updateEducation: (
    id: string,
    data: Partial<Omit<EducationEntry, 'id'>>,
  ) => void;
  removeEducation: (id: string) => void;

  // Cursos (array)
  addCourse: (entry: Omit<CourseEntry, 'id'>) => string;
  updateCourse: (id: string, data: Partial<Omit<CourseEntry, 'id'>>) => void;
  removeCourse: (id: string) => void;

  // Habilidades (array)
  /** Agrega una habilidad y devuelve su id. */
  addSkill: (label: string, category?: string) => string;
  updateSkill: (id: string, data: Partial<Omit<SkillEntry, 'id'>>) => void;
  removeSkill: (id: string) => void;
  /** Reemplaza el array completo (útil para el selector por chips). */
  setSkills: (skills: SkillEntry[]) => void;

  // Idiomas (array)
  addLanguage: (entry: Omit<LanguageEntry, 'id'>) => string;
  updateLanguage: (
    id: string,
    data: Partial<Omit<LanguageEntry, 'id'>>,
  ) => void;
  removeLanguage: (id: string) => void;

  // Disponibilidad
  setAvailability: (availability: string | undefined) => void;

  // Referencias (array)
  addReference: (entry: Omit<ReferenceEntry, 'id'>) => string;
  updateReference: (
    id: string,
    data: Partial<Omit<ReferenceEntry, 'id'>>,
  ) => void;
  removeReference: (id: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCVStore = create<CVStore>()(
  persist(
    (set) => ({
      draft: null,

      // ── Ciclo de vida ──────────────────────────────────────────────────────

      initDraft: (mode) =>
        set((s) => (s.draft ? s : { draft: createEmptyDraft(mode) })),

      resetDraft: (mode) => set({ draft: createEmptyDraft(mode) }),

      clearDraft: () => set({ draft: null }),

      // ── Campos de nivel superior ───────────────────────────────────────────

      setMode: (mode) =>
        set((s) => (s.draft ? { draft: touch({ ...s.draft, mode }) } : s)),

      setTemplate: (template) =>
        set((s) => (s.draft ? { draft: touch({ ...s.draft, template }) } : s)),

      // ── Datos personales ───────────────────────────────────────────────────

      updatePersonal: (data) =>
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  personal: { ...s.draft.personal, ...data },
                }),
              }
            : s,
        ),

      // ── Perfil ─────────────────────────────────────────────────────────────

      setProfile: (profile) =>
        set((s) => (s.draft ? { draft: touch({ ...s.draft, profile }) } : s)),

      // ── Experiencia ────────────────────────────────────────────────────────

      addExperience: (entry) => {
        const id = nanoid();
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  experience: [...s.draft.experience, { ...entry, id }],
                }),
              }
            : s,
        );
        return id;
      },

      updateExperience: (id, data) =>
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  experience: s.draft.experience.map((exp) =>
                    exp.id === id ? { ...exp, ...data } : exp,
                  ),
                }),
              }
            : s,
        ),

      removeExperience: (id) =>
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  experience: s.draft.experience.filter((exp) => exp.id !== id),
                }),
              }
            : s,
        ),

      // ── Educación ──────────────────────────────────────────────────────────

      addEducation: (entry) => {
        const id = nanoid();
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  education: [...s.draft.education, { ...entry, id }],
                }),
              }
            : s,
        );
        return id;
      },

      updateEducation: (id, data) =>
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  education: s.draft.education.map((edu) =>
                    edu.id === id ? { ...edu, ...data } : edu,
                  ),
                }),
              }
            : s,
        ),

      removeEducation: (id) =>
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  education: s.draft.education.filter((edu) => edu.id !== id),
                }),
              }
            : s,
        ),

      // ── Cursos ────────────────────────────────────────────────────────────

      addCourse: (entry) => {
        const id = nanoid();
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  courses: [...s.draft.courses, { ...entry, id }],
                }),
              }
            : s,
        );
        return id;
      },

      updateCourse: (id, data) =>
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  courses: s.draft.courses.map((c) =>
                    c.id === id ? { ...c, ...data } : c,
                  ),
                }),
              }
            : s,
        ),

      removeCourse: (id) =>
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  courses: s.draft.courses.filter((c) => c.id !== id),
                }),
              }
            : s,
        ),

      // ── Habilidades ────────────────────────────────────────────────────────

      addSkill: (label, category) => {
        const id = nanoid();
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  skills: [...s.draft.skills, { id, label, category }],
                }),
              }
            : s,
        );
        return id;
      },

      updateSkill: (id, data) =>
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  skills: s.draft.skills.map((sk) =>
                    sk.id === id ? { ...sk, ...data } : sk,
                  ),
                }),
              }
            : s,
        ),

      removeSkill: (id) =>
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  skills: s.draft.skills.filter((sk) => sk.id !== id),
                }),
              }
            : s,
        ),

      setSkills: (skills) =>
        set((s) => (s.draft ? { draft: touch({ ...s.draft, skills }) } : s)),

      // ── Idiomas ────────────────────────────────────────────────────────────

      addLanguage: (entry) => {
        const id = nanoid();
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  languages: [...s.draft.languages, { ...entry, id }],
                }),
              }
            : s,
        );
        return id;
      },

      updateLanguage: (id, data) =>
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  languages: s.draft.languages.map((lang) =>
                    lang.id === id ? { ...lang, ...data } : lang,
                  ),
                }),
              }
            : s,
        ),

      removeLanguage: (id) =>
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  languages: s.draft.languages.filter((lang) => lang.id !== id),
                }),
              }
            : s,
        ),

      // ── Disponibilidad ─────────────────────────────────────────────────────

      setAvailability: (availability) =>
        set((s) =>
          s.draft ? { draft: touch({ ...s.draft, availability }) } : s,
        ),

      // ── Referencias ────────────────────────────────────────────────────────

      addReference: (entry) => {
        const id = nanoid();
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  references: [...s.draft.references, { ...entry, id }],
                }),
              }
            : s,
        );
        return id;
      },

      updateReference: (id, data) =>
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  references: s.draft.references.map((ref) =>
                    ref.id === id ? { ...ref, ...data } : ref,
                  ),
                }),
              }
            : s,
        ),

      removeReference: (id) =>
        set((s) =>
          s.draft
            ? {
                draft: touch({
                  ...s.draft,
                  references: s.draft.references.filter((ref) => ref.id !== id),
                }),
              }
            : s,
        ),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      // Cuando schemaVersion suba: agregar `migrate` acá para transformar
      // borradores guardados al nuevo esquema sin perder el trabajo del usuario.
    },
  ),
);
