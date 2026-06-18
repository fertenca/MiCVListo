import { useEffect, useRef } from 'react';
import { track } from './analytics';
import type { AnalyticsEvent, AnalyticsMeta, HintType } from './events';

/**
 * Registra un evento una sola vez, al montar el componente.
 * Captura los valores de montaje vía el inicializador de useRef (sin escribir
 * la ref durante el render).
 */
export function useTrackPageView(
  event: AnalyticsEvent,
  meta?: AnalyticsMeta,
): void {
  const payload = useRef({ event, meta });
  useEffect(() => {
    track(payload.current.event, payload.current.meta);
  }, []);
}

/**
 * Registra 'validation_hint_shown' una vez por tipo de hint mientras el
 * componente esté montado. Evita repetir el evento en cada tecla.
 */
export function useValidationHints(
  stepId: string,
  activeHints: HintType[],
): void {
  const seen = useRef<Set<string>>(new Set());
  const latest = useRef(activeHints);

  // Mantener la ref actualizada solo dentro de un efecto (no en el render).
  useEffect(() => {
    latest.current = activeHints;
  });

  const key = activeHints.join(',');
  useEffect(() => {
    for (const hint of latest.current) {
      if (!seen.current.has(hint)) {
        seen.current.add(hint);
        track('validation_hint_shown', { hintType: hint, stepId });
      }
    }
  }, [key, stepId]);
}
