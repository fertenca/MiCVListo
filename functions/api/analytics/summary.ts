// Endpoint de resumen para el dashboard privado: GET /api/analytics/summary
//
// Protegido con un token: header "Authorization: Bearer <ADMIN_ANALYTICS_TOKEN>".
// El token vive en una variable de entorno de Cloudflare (nunca en el repo).
// Devuelve solo métricas agregadas, nunca contenido del CV.

// ─── Tipos mínimos de D1 ───────────────────────────────────────────────────────

interface D1QueryResult<T> {
  results: T[];
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1QueryResult<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
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

// ─── Auth ──────────────────────────────────────────────────────────────────────

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── Helpers de consulta ───────────────────────────────────────────────────────

async function scalar(
  db: D1Database,
  query: string,
  ...params: unknown[]
): Promise<number> {
  const row = await db
    .prepare(query)
    .bind(...params)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function onRequestGet(context: EventContext): Promise<Response> {
  const { request, env } = context;

  const auth = request.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const expected = env.ADMIN_ANALYTICS_TOKEN ?? '';

  if (!expected || !safeEqual(token, expected)) {
    return json({ error: 'unauthorized' }, 401);
  }

  if (!env.DB) {
    return json({ dbConfigured: false, generatedAt: Date.now() });
  }

  const db = env.DB;
  const now = Date.now();
  const day = now - 24 * 60 * 60 * 1000;
  const week = now - 7 * 24 * 60 * 60 * 1000;

  const [
    sessions24h,
    sessions7d,
    cvsStarted,
    previewViews,
    pdfDownloads,
    modeSelected,
    eventCounts,
    stepViews,
    abandonment,
    byMode,
    byDevice,
    byReferrer,
    hints,
    helpers,
  ] = await Promise.all([
    scalar(
      db,
      'SELECT COUNT(DISTINCT session_id) AS n FROM events WHERE ts > ?',
      day,
    ),
    scalar(
      db,
      'SELECT COUNT(DISTINCT session_id) AS n FROM events WHERE ts > ?',
      week,
    ),
    scalar(
      db,
      "SELECT COUNT(DISTINCT session_id) AS n FROM events WHERE event_name = 'mode_selected'",
    ),
    scalar(
      db,
      "SELECT COUNT(DISTINCT session_id) AS n FROM events WHERE event_name = 'preview_viewed'",
    ),
    scalar(
      db,
      "SELECT COUNT(*) AS n FROM events WHERE event_name = 'pdf_download_success'",
    ),
    scalar(
      db,
      "SELECT COUNT(*) AS n FROM events WHERE event_name = 'mode_selected'",
    ),
    db
      .prepare(
        'SELECT event_name AS eventName, COUNT(*) AS count FROM events GROUP BY event_name',
      )
      .all<{ eventName: string; count: number }>(),
    db
      .prepare(
        "SELECT step_id AS stepId, COUNT(DISTINCT session_id) AS sessions FROM events WHERE event_name = 'wizard_step_viewed' AND step_id IS NOT NULL GROUP BY step_id",
      )
      .all<{ stepId: string; sessions: number }>(),
    db
      .prepare(
        `SELECT step_id AS stepId, COUNT(*) AS sessions FROM (
           SELECT session_id, step_id,
             ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY ts DESC, id DESC) AS rn
           FROM events WHERE event_name = 'wizard_step_viewed' AND step_id IS NOT NULL
         ) WHERE rn = 1 GROUP BY step_id`,
      )
      .all<{ stepId: string; sessions: number }>(),
    db
      .prepare(
        "SELECT mode, COUNT(DISTINCT session_id) AS sessions FROM events WHERE event_name = 'mode_selected' AND mode IS NOT NULL GROUP BY mode",
      )
      .all<{ mode: string; sessions: number }>(),
    db
      .prepare(
        'SELECT device_type AS deviceType, COUNT(DISTINCT session_id) AS sessions FROM events WHERE device_type IS NOT NULL GROUP BY device_type',
      )
      .all<{ deviceType: string; sessions: number }>(),
    db
      .prepare(
        'SELECT referrer_source AS referrerSource, COUNT(DISTINCT session_id) AS sessions FROM events WHERE referrer_source IS NOT NULL GROUP BY referrer_source',
      )
      .all<{ referrerSource: string; sessions: number }>(),
    db
      .prepare(
        "SELECT hint_type AS hintType, COUNT(*) AS count FROM events WHERE event_name = 'validation_hint_shown' AND hint_type IS NOT NULL GROUP BY hint_type",
      )
      .all<{ hintType: string; count: number }>(),
    db
      .prepare(
        "SELECT helper_type AS helperType, event_name AS eventName, COUNT(*) AS count FROM events WHERE event_name IN ('helper_opened', 'helper_applied') AND helper_type IS NOT NULL GROUP BY helper_type, event_name",
      )
      .all<{ helperType: string; eventName: string; count: number }>(),
  ]);

  const counts: Record<string, number> = {};
  for (const r of eventCounts.results) counts[r.eventName] = r.count;

  return json({
    dbConfigured: true,
    generatedAt: now,
    sessions: { last24h: sessions24h, last7d: sessions7d },
    totals: {
      cvsStarted,
      previewViews,
      pdfDownloads,
      modeSelected,
      completionRate: modeSelected > 0 ? pdfDownloads / modeSelected : 0,
    },
    eventCounts: counts,
    stepViews: stepViews.results,
    abandonment: abandonment.results,
    byMode: byMode.results,
    byDevice: byDevice.results,
    byReferrer: byReferrer.results,
    hints: hints.results,
    helpers: helpers.results,
    errors: {
      pdfDownloadError: counts['pdf_download_error'] ?? 0,
      pdfShareError: counts['pdf_share_error'] ?? 0,
      clientError: counts['client_error'] ?? 0,
    },
  });
}
