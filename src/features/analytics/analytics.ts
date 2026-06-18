// Capa de analytics anónima del cliente.
//
// Reglas:
// - sessionId anónimo en sessionStorage (no localStorage, no fingerprinting).
// - Solo envía metadata permitida; nunca contenido del CV.
// - Fire-and-forget: si falla el endpoint, se ignora. Nunca rompe la app.

import type { AnalyticsEvent, AnalyticsMeta } from './events';

const ENDPOINT = '/api/analytics/event';
const SID_KEY = 'micvlisto:analytics:sid';
const REF_KEY = 'micvlisto:analytics:ref';

type DeviceType = 'mobile' | 'tablet' | 'desktop';
type BrowserFamily = 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Other';
type ReferrerSource =
  | 'linkedin'
  | 'x'
  | 'whatsapp'
  | 'github'
  | 'direct'
  | 'other';

function uuid(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return (
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }) + ''
  );
}

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SID_KEY);
    if (!id) {
      id = uuid();
      sessionStorage.setItem(SID_KEY, id);
    }
    return id;
  } catch {
    return 'nostore';
  }
}

function getDeviceType(): DeviceType {
  const ua = navigator.userAgent || '';
  if (/\b(iPad|Tablet)\b/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    return 'tablet';
  }
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getBrowserFamily(): BrowserFamily {
  const ua = navigator.userAgent || '';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Firefox\//.test(ua) || /FxiOS/.test(ua)) return 'Firefox';
  if (/Chrome\//.test(ua) || /CriOS/.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari';
  return 'Other';
}

function computeReferrerSource(): ReferrerSource {
  const ref = document.referrer || '';
  if (!ref) return 'direct';
  let host: string;
  try {
    host = new URL(ref).hostname.toLowerCase();
  } catch {
    return 'other';
  }
  if (!host || host === location.hostname) return 'direct';
  if (host.includes('linkedin')) return 'linkedin';
  if (host === 'x.com' || host.endsWith('.x.com') || host.includes('twitter') || host === 't.co') {
    return 'x';
  }
  if (host.includes('whatsapp') || host === 'wa.me') return 'whatsapp';
  if (host.includes('github')) return 'github';
  return 'other';
}

function getReferrerSource(): ReferrerSource {
  try {
    const stored = sessionStorage.getItem(REF_KEY);
    if (stored) return stored as ReferrerSource;
    const computed = computeReferrerSource();
    sessionStorage.setItem(REF_KEY, computed);
    return computed;
  } catch {
    return computeReferrerSource();
  }
}

const ALLOWED_META_KEYS: (keyof AnalyticsMeta)[] = [
  'mode',
  'stepId',
  'success',
  'hintType',
  'helperType',
  'area',
  'messageCode',
];

function cleanMeta(meta: AnalyticsMeta): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of ALLOWED_META_KEYS) {
    const value = meta[key];
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/** Registra un evento anónimo. No bloquea ni lanza errores nunca. */
export function track(event: AnalyticsEvent, meta: AnalyticsMeta = {}): void {
  try {
    const payload = {
      eventName: event,
      sessionId: getSessionId(),
      clientTs: Date.now(),
      path: location.pathname,
      deviceType: getDeviceType(),
      browserFamily: getBrowserFamily(),
      referrerSource: getReferrerSource(),
      ...cleanMeta(meta),
    };
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* analytics nunca rompe la app */
    });
  } catch {
    /* ignore */
  }
}

let initialized = false;

/** Engancha errores globales para registrar 'client_error' sin datos sensibles. */
export function initAnalytics(): void {
  if (initialized) return;
  initialized = true;
  try {
    window.addEventListener('error', (e: ErrorEvent) => {
      const name = e.error && e.error.name ? String(e.error.name) : 'Error';
      track('client_error', { area: 'window', messageCode: name.slice(0, 40) });
    });
    window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      const name =
        reason && reason.name ? String(reason.name) : 'UnhandledRejection';
      track('client_error', { area: 'promise', messageCode: name.slice(0, 40) });
    });
  } catch {
    /* ignore */
  }
}
