// Definición de eventos anónimos y metadata permitida.
// Esta lista es la fuente de verdad del frontend; el endpoint valida su
// propia whitelist en el servidor.

export const ANALYTICS_EVENTS = [
  // Navegación / funnel
  'landing_viewed',
  'create_page_viewed',
  'mode_selected',
  'wizard_step_viewed',
  'wizard_step_next_clicked',
  'wizard_step_back_clicked',
  'review_viewed',
  'preview_viewed',
  'pdf_download_clicked',
  'pdf_download_success',
  'pdf_download_error',
  'pdf_share_clicked',
  'pdf_share_success',
  'pdf_share_error',
  'guide_viewed',
  'privacy_viewed',
  'not_found_viewed',
  // Fricción / ayuda
  'validation_hint_shown',
  'helper_opened',
  'helper_applied',
  // Errores técnicos
  'client_error',
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsMode = 'experiencia' | 'primer-empleo' | 'informal';

export type HintType =
  | 'invalid_date'
  | 'end_before_start'
  | 'invalid_year'
  | 'long_experience'
  | 'empty_experience'
  | 'short_profile';

export type HelperType = 'profile' | 'experience' | 'skills';

/** Metadata permitida por evento. Nunca strings libres del CV. */
export interface AnalyticsMeta {
  mode?: AnalyticsMode;
  stepId?: string | number;
  success?: boolean;
  hintType?: HintType;
  helperType?: HelperType;
  area?: string;
  messageCode?: string;
}
