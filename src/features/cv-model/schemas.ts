import { z } from 'zod';

// ─── Enumeraciones ───────────────────────────────────────────────────────────

export const cvModeSchema = z.enum([
  'experiencia',
  'primer-empleo',
  'informal',
]);

export const templateIdSchema = z.enum(['clasica', 'moderna', 'primer-empleo']);

export const educationStatusSchema = z.enum([
  'completo',
  'en-curso',
  'incompleto',
]);

export const languageLevelSchema = z.enum([
  'basico',
  'intermedio',
  'avanzado',
  'nativo',
]);

// ─── Sección: Datos personales ───────────────────────────────────────────────

export const personalLinkSchema = z.object({
  label: z.string().min(1, 'Ingresá un nombre para el enlace'),
  url: z.string().url('Ingresá una URL válida'),
});

/** Valida la entrada del usuario en el paso "Datos personales".
 *  El campo `photo` no se valida acá: pasa por el módulo de recorte
 *  y compresión antes de guardarse en el store. */
export const personalSchema = z.object({
  fullName: z.string().min(1, 'Tu nombre completo es obligatorio'),
  headline: z.string().optional(),
  email: z
    .string()
    .email('Ingresá un email válido')
    .or(z.literal(''))
    .optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  links: z.array(personalLinkSchema).optional(),
});

// ─── Sección: Perfil ─────────────────────────────────────────────────────────

export const profileSchema = z.object({
  profile: z.string().optional(),
});

// ─── Sección: Experiencia ────────────────────────────────────────────────────

/** Valida un ítem de experiencia (formal o informal).
 *  El campo `id` lo genera el store, no el usuario. */
export const experienceEntrySchema = z.object({
  role: z.string().min(1, 'Contanos qué hacías o cuál era tu cargo'),
  org: z.string().optional(),
  isInformal: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bullets: z
    .array(z.string().min(1))
    .min(1, 'Agregá al menos una descripción de lo que hacías'),
});

// ─── Sección: Educación ──────────────────────────────────────────────────────

export const educationEntrySchema = z.object({
  title: z.string().min(1, 'Indicá tu nivel de estudios o carrera'),
  institution: z.string().optional(),
  status: educationStatusSchema,
  year: z.string().optional(),
});

// ─── Sección: Cursos ─────────────────────────────────────────────────────────

export const courseEntrySchema = z.object({
  name: z.string().min(1, 'Ingresá el nombre del curso o capacitación'),
  institution: z.string().optional(),
  year: z.string().optional(),
});

// ─── Sección: Habilidades ────────────────────────────────────────────────────

export const skillEntrySchema = z.object({
  label: z.string().min(1),
  category: z.string().optional(),
});

// ─── Sección: Idiomas ────────────────────────────────────────────────────────

export const languageEntrySchema = z.object({
  language: z.string().min(1, 'Ingresá el idioma'),
  level: languageLevelSchema,
});

// ─── Sección: Referencias ────────────────────────────────────────────────────

export const referenceEntrySchema = z.object({
  name: z
    .string()
    .min(1, 'Ingresá el nombre de quien te puede dar referencias'),
  relation: z.string().optional(),
  phone: z.string().optional(),
});
