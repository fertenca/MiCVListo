// Tipos
export type {
  CVMode,
  TemplateId,
  EducationStatus,
  LanguageLevel,
  PersonalLink,
  PersonalInfo,
  ExperienceEntry,
  EducationEntry,
  CourseEntry,
  SkillEntry,
  LanguageEntry,
  ReferenceEntry,
  CVMeta,
  CVDocument,
} from './types';

// Esquemas Zod (validación por paso del wizard)
export {
  cvModeSchema,
  templateIdSchema,
  educationStatusSchema,
  languageLevelSchema,
  personalLinkSchema,
  personalSchema,
  profileSchema,
  experienceEntrySchema,
  educationEntrySchema,
  courseEntrySchema,
  skillEntrySchema,
  languageEntrySchema,
  referenceEntrySchema,
} from './schemas';

// Store (Zustand + persist → autosave a localStorage)
export type { CVStore } from './store';
export { useCVStore } from './store';
