import { type FormEvent, useState } from 'react';
import { WIZARD_STEPS } from '../features/wizard';
import styles from './Admin.module.css';

// ─── Tipos del resumen ─────────────────────────────────────────────────────────

interface Summary {
  dbConfigured: boolean;
  generatedAt: number;
  sessions?: { last24h: number; last7d: number };
  totals?: {
    cvsStarted: number;
    previewViews: number;
    pdfDownloads: number;
    modeSelected: number;
    completionRate: number;
  };
  eventCounts?: Record<string, number>;
  stepViews?: { stepId: string; sessions: number }[];
  abandonment?: { stepId: string; sessions: number }[];
  byMode?: { mode: string; sessions: number }[];
  byDevice?: { deviceType: string; sessions: number }[];
  byReferrer?: { referrerSource: string; sessions: number }[];
  hints?: { hintType: string; count: number }[];
  helpers?: { helperType: string; eventName: string; count: number }[];
  errors?: { pdfDownloadError: number; pdfShareError: number; clientError: number };
}

type Status = 'idle' | 'loading' | 'unauthorized' | 'error';

const TOKEN_KEY = 'micvlisto:admin:token';

function readToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

// ─── Helpers de render ─────────────────────────────────────────────────────────

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function toMap(
  rows: { [k: string]: string | number }[] | undefined,
  keyField: string,
  valueField: string,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of rows ?? []) {
    out[String(row[keyField])] = Number(row[valueField]) || 0;
  }
  return out;
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.card}>
      <span className={styles.cardValue}>{value}</span>
      <span className={styles.cardLabel}>{label}</span>
    </div>
  );
}

function Table({
  head,
  rows,
}: {
  head: [string, string];
  rows: [string, number][];
}) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>{head[0]}</th>
          <th className={styles.num}>{head[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={2} className={styles.empty}>
              Sin datos
            </td>
          </tr>
        ) : (
          rows.map(([label, value]) => (
            <tr key={label}>
              <td>{label}</td>
              <td className={styles.num}>{value}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

// ─── Página ────────────────────────────────────────────────────────────────────

function Admin() {
  const [input, setInput] = useState(readToken);
  const [data, setData] = useState<Summary | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  async function load(t: string) {
    if (!t) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/analytics/summary', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401) {
        setStatus('unauthorized');
        setData(null);
        try {
          sessionStorage.removeItem(TOKEN_KEY);
        } catch {
          /* ignore */
        }
        return;
      }
      if (!res.ok) {
        setStatus('error');
        setData(null);
        return;
      }
      const json = (await res.json()) as Summary;
      setData(json);
      setStatus('idle');
      try {
        sessionStorage.setItem(TOKEN_KEY, t);
      } catch {
        /* ignore */
      }
    } catch {
      setStatus('error');
      setData(null);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void load(input.trim());
  }

  // ── Construcción de filas para las tablas ──
  const stepViewMap = toMap(data?.stepViews, 'stepId', 'sessions');
  const abandonMap = toMap(data?.abandonment, 'stepId', 'sessions');
  const ec = data?.eventCounts ?? {};

  const funnelRows: [string, number][] = [
    ['Landing vista', ec['landing_viewed'] ?? 0],
    ['Crear vista', ec['create_page_viewed'] ?? 0],
    ['Modo seleccionado', ec['mode_selected'] ?? 0],
    ...WIZARD_STEPS.map(
      (s) => [`Paso: ${s.label}`, stepViewMap[s.id] ?? 0] as [string, number],
    ),
    ['Vista previa', ec['preview_viewed'] ?? 0],
    ['PDF descargado', ec['pdf_download_success'] ?? 0],
  ];

  const abandonRows: [string, number][] = WIZARD_STEPS.map(
    (s) => [s.label, abandonMap[s.id] ?? 0] as [string, number],
  ).filter(([, n]) => n > 0);

  const modeRows: [string, number][] = (data?.byMode ?? []).map((r) => [
    r.mode,
    r.sessions,
  ]);
  const deviceRows: [string, number][] = (data?.byDevice ?? []).map((r) => [
    r.deviceType,
    r.sessions,
  ]);
  const referrerRows: [string, number][] = (data?.byReferrer ?? []).map((r) => [
    r.referrerSource,
    r.sessions,
  ]);
  const hintRows: [string, number][] = (data?.hints ?? []).map((r) => [
    r.hintType,
    r.count,
  ]);
  const helperRows: [string, number][] = (data?.helpers ?? []).map((r) => [
    `${r.helperType} · ${r.eventName}`,
    r.count,
  ]);

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Dashboard de uso</h1>
      <p className={styles.note}>
        Métricas anónimas y agregadas. No contiene datos personales ni contenido
        de CVs.
      </p>

      <form className={styles.tokenForm} onSubmit={handleSubmit}>
        <input
          className={styles.tokenInput}
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Clave de acceso"
          aria-label="Clave de acceso al dashboard"
        />
        <button className={styles.tokenBtn} type="submit">
          Ver datos
        </button>
      </form>

      {status === 'loading' && <p className={styles.msg}>Cargando…</p>}
      {status === 'unauthorized' && (
        <p className={styles.msgError}>Clave inválida. Probá de nuevo.</p>
      )}
      {status === 'error' && (
        <p className={styles.msgError}>
          No se pudo conectar con el endpoint de métricas.
        </p>
      )}

      {data && data.dbConfigured === false && (
        <p className={styles.msg}>
          La base de datos de analytics todavía no está configurada en
          Cloudflare. Ver <code>docs/analytics-setup.md</code>.
        </p>
      )}

      {data && data.dbConfigured && (
        <>
          <div className={styles.cards}>
            <Card
              label="Sesiones últimas 24 h"
              value={data.sessions?.last24h ?? 0}
            />
            <Card
              label="Sesiones últimos 7 días"
              value={data.sessions?.last7d ?? 0}
            />
            <Card label="CVs iniciados" value={data.totals?.cvsStarted ?? 0} />
            <Card
              label="Vistas de preview"
              value={data.totals?.previewViews ?? 0}
            />
            <Card
              label="PDFs descargados"
              value={data.totals?.pdfDownloads ?? 0}
            />
            <Card
              label="Tasa de finalización"
              value={pct(data.totals?.completionRate ?? 0)}
            />
          </div>

          <div className={styles.grid}>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Funnel</h2>
              <Table head={['Etapa', 'Cantidad']} rows={funnelRows} />
            </div>

            <div className={styles.block}>
              <h2 className={styles.blockTitle}>
                Abandono (último paso visto)
              </h2>
              <Table head={['Paso', 'Sesiones']} rows={abandonRows} />
            </div>

            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Uso por modo</h2>
              <Table head={['Modo', 'Sesiones']} rows={modeRows} />
            </div>

            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Dispositivo</h2>
              <Table head={['Tipo', 'Sesiones']} rows={deviceRows} />
            </div>

            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Origen</h2>
              <Table head={['Fuente', 'Sesiones']} rows={referrerRows} />
            </div>

            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Errores</h2>
              <Table
                head={['Tipo', 'Cantidad']}
                rows={[
                  ['PDF descarga', data.errors?.pdfDownloadError ?? 0],
                  ['PDF compartir', data.errors?.pdfShareError ?? 0],
                  ['Cliente', data.errors?.clientError ?? 0],
                ]}
              />
            </div>

            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Hints de validación</h2>
              <Table head={['Tipo', 'Cantidad']} rows={hintRows} />
            </div>

            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Uso de ayudas</h2>
              <Table head={['Helper · evento', 'Cantidad']} rows={helperRows} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default Admin;
