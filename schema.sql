-- Esquema de la base de analytics anónima de MiCVListo (Cloudflare D1).
--
-- Solo guarda eventos anónimos y agregables. NUNCA contenido del CV ni datos
-- personales (nombre, email, teléfono, ciudad, foto, textos, referencias, etc.),
-- ni IP cruda ni User-Agent completo.
--
-- Para aplicarlo:
--   wrangler d1 execute micvlisto-analytics --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  ts              INTEGER NOT NULL,  -- momento de recepción en el servidor (ms epoch)
  client_ts       INTEGER,           -- timestamp informado por el cliente (ms epoch)
  session_id      TEXT NOT NULL,     -- UUID anónimo de sesión (sessionStorage)
  event_name      TEXT NOT NULL,     -- nombre del evento (whitelist)
  path            TEXT,              -- pathname (sin query), acotado
  mode            TEXT,              -- experiencia | primer-empleo | informal
  step_id         TEXT,             -- id de paso del wizard
  device_type     TEXT,             -- mobile | desktop | tablet
  browser_family  TEXT,             -- Chrome | Safari | Firefox | Edge | Other
  referrer_source TEXT,             -- linkedin | x | whatsapp | github | direct | other
  success         INTEGER,          -- 0 | 1 | NULL
  hint_type       TEXT,             -- tipo de hint de validación
  helper_type     TEXT,             -- profile | experience | skills
  area            TEXT,             -- área del error técnico
  message_code    TEXT              -- categoría simple de error (sin stack ni datos)
);

CREATE INDEX IF NOT EXISTS idx_events_ts ON events (ts);
CREATE INDEX IF NOT EXISTS idx_events_session ON events (session_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON events (event_name);
