import type { CVMode } from '../cv-model';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Interfaz que los componentes de paso exponen vía ref al WizardShell. */
export interface StepRef {
  /** Valida el paso actual. Devuelve true si es válido; muestra errores inline como efecto secundario. */
  validate: () => boolean;
}

export type StepId =
  | 'personal'
  | 'foto'
  | 'perfil'
  | 'experiencia'
  | 'educacion'
  | 'cursos'
  | 'habilidades'
  | 'idiomas'
  | 'disponibilidad'
  | 'referencias'
  | 'revision';

export interface WizardStep {
  id: StepId;
  /** Etiqueta corta para la barra de progreso. */
  label: string;
  /** Título completo del paso. Puede variar según el modo del CV. */
  title: string | Record<CVMode, string>;
}

// ─── Utilidad ─────────────────────────────────────────────────────────────────

export function getStepTitle(step: WizardStep, mode: CVMode): string {
  return typeof step.title === 'string' ? step.title : step.title[mode];
}

// ─── Definición de pasos ──────────────────────────────────────────────────────

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'personal',
    label: 'Datos personales',
    title: 'Tus datos personales',
  },
  {
    id: 'foto',
    label: 'Foto',
    title: 'Foto (opcional)',
  },
  {
    id: 'perfil',
    label: 'Perfil',
    title: {
      experiencia: 'Un párrafo sobre vos',
      'primer-empleo': '¿Quién sos y qué buscás?',
      informal: '¿Quién sos y qué buscás?',
    },
  },
  {
    id: 'experiencia',
    label: 'Experiencia',
    title: {
      experiencia: 'Tu experiencia laboral',
      'primer-empleo': 'Lo que sabés hacer',
      informal: 'Lo que hiciste',
    },
  },
  {
    id: 'educacion',
    label: 'Educación',
    title: 'Tu formación',
  },
  {
    id: 'cursos',
    label: 'Cursos',
    title: 'Cursos y capacitaciones',
  },
  {
    id: 'habilidades',
    label: 'Habilidades',
    title: 'Tus habilidades',
  },
  {
    id: 'idiomas',
    label: 'Idiomas',
    title: 'Idiomas',
  },
  {
    id: 'disponibilidad',
    label: 'Disponibilidad',
    title: 'Tu disponibilidad',
  },
  {
    id: 'referencias',
    label: 'Referencias',
    title: 'Referencias',
  },
  {
    id: 'revision',
    label: 'Revisión',
    title: 'Revisá tu CV antes de descargarlo',
  },
];
