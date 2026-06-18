// Endpoint de ingesta de eventos anónimos: POST /api/analytics/event
//
// Principios:
// - Solo acepta eventos de una whitelist y metadata permitida.
// - Limpia/descarta cualquier campo no permitido.
// - NUNCA guarda IP cruda, User-Agent completo ni contenido del CV.
// - Si falla (o no hay D1 configurado), responde 204 igual: el cliente nunca
//   debe romperse por analytics.

// ─── Tipos mínimos de D1 (evita depender de @cloudflare/workers-types) ─────────

interface D1Result {
  success: boolean;
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
interface Env {
  DB?: D1Database;
  ADMIN_ANALYTICS_TOKEN?: string;
}
interface EventContext {
  request: Request;
  env: Env;
}

// ─── Whitelists ────────────────────────────────────────────────────────────────

const ALLOWED_EVENTS = new Set<string>([
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
  'validation_hint_shown',
  'helper_opened',
  'helper_applied',
  'client_error',
]);

const MODES = new Set(['experiencia', 'primer-empleo', 'informal']);
const DEVICES = new Set(['mobile', 'desktop', 'tablet']);
const BROWSERS = new Set(['Chrome', 'Safari', 'Firefox', 'Edge', 'Other']);
const REFERRERS = new Set([
  'linkedin',
  'x',
  'whatsapp',
  'github',
  'direct',
  'other',
]);
const STEP_IDS = new Set([
  'personal',
  'foto',
  'perfil',
  'experiencia',
  'educacion',
  'cursos',
  'habilidades',
  'idiomas',
  'disponibilidad',
  'referencias',
  'revision',
]);
const HINT_TYPES = new Set([
  'invalid_date',
  'end_before_start',
  'invalid_year',
  'long_experience',
  'empty_experience',
  'short_profile',
]);
const HELPER_TYPES = new Set(['profile', 'experience', 'skills']);

const MAX_BODY_BYTES = 2000;

// ─── Helpers de sanitización ───────────────────────────────────────────────────

function enumOrNull(value: unknown, allowed: Set<string>): string | null {
  return typeof value === 'string' && allowed.has(value) ? value : null;
}

function stringOrNull(value: unknown, maxLen: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, maxLen);
  return trimmed.length > 0 ? trimmed : null;
}

function stepOrNull(value: unknown): string | null {
  if (typeof value === 'string' && STEP_IDS.has(value)) return value;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Math.trunc(value)).slice(0, 8);
  }
  return null;
}

function successOrNull(value: unknown): number | null {
  if (value === true) return 1;
  if (value === false) return 0;
  return null;
}

function pathOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const noQuery = value.split('?')[0].slice(0, 120);
  return noQuery.length > 0 ? noQuery : null;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function onRequestPost(
  context: EventContext,
): Promise<Response> {
  const { request, env } = context;

  let text: string;
  try {
    text = await request.text();
  } catch {
    return new Response(null, { status: 400 });
  }

  if (text.length > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  if (typeof data !== 'object' || data === null) {
    return new Response(null, { status: 400 });
  }

  const body = data as Record<string, unknown>;

  const eventName = body.eventName;
  if (typeof eventName !== 'string' || !ALLOWED_EVENTS.has(eventName)) {
    return new Response(null, { status: 400 });
  }

  const sessionId = stringOrNull(body.sessionId, 64);
  if (!sessionId) {
    return new Response(null, { status: 400 });
  }

  // Si no hay base configurada (p. ej. en dev), no es un error: simplemente
  // no guardamos nada y respondemos OK para que el cliente siga normal.
  if (!env.DB) {
    return new Response(null, { status: 204 });
  }

  const row = {
    ts: Date.now(),
    clientTs:
      typeof body.clientTs === 'number' && Number.isFinite(body.clientTs)
        ? Math.trunc(body.clientTs)
        : null,
    sessionId,
    eventName,
    path: pathOrNull(body.path),
    mode: enumOrNull(body.mode, MODES),
    stepId: stepOrNull(body.stepId),
    deviceType: enumOrNull(body.deviceType, DEVICES),
    browserFamily: enumOrNull(body.browserFamily, BROWSERS),
    referrerSource: enumOrNull(body.referrerSource, REFERRERS),
    success: successOrNull(body.success),
    hintType: enumOrNull(body.hintType, HINT_TYPES),
    helperType: enumOrNull(body.helperType, HELPER_TYPES),
    area: stringOrNull(body.area, 40),
    messageCode: stringOrNull(body.messageCode, 40),
  };

  try {
    await env.DB.prepare(
      `INSERT INTO events (
        ts, client_ts, session_id, event_name, path, mode, step_id,
        device_type, browser_family, referrer_source, success,
        hint_type, helper_type, area, message_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        row.ts,
        row.clientTs,
        row.sessionId,
        row.eventName,
        row.path,
        row.mode,
        row.stepId,
        row.deviceType,
        row.browserFamily,
        row.referrerSource,
        row.success,
        row.hintType,
        row.helperType,
        row.area,
        row.messageCode,
      )
      .run();
  } catch {
    // No filtramos detalles del error; nunca rompemos por analytics.
    return new Response(null, { status: 204 });
  }

  return new Response(null, { status: 204 });
}
