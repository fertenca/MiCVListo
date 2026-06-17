/**
 * Validaciones suaves y no bloqueantes para fechas y años del wizard.
 *
 * El objetivo es acompañar al usuario, no impedir que avance: estas funciones
 * solo detectan texto claramente inválido (por ejemplo "20pp") o rangos de
 * fechas invertidos, para mostrar consejos amables. Nunca bloquean el guardado.
 *
 * No exigimos un formato rígido: para un CV alcanza con un año o un mes/año.
 */

const MIN_YEAR = 1950;
const MAX_YEAR = new Date().getFullYear() + 10;

/** Palabras que indican que el trabajo sigue en curso. */
const CURRENT_WORDS = ['actualidad', 'actual', 'presente', 'hoy', 'ahora'];

/** Meses en español (nombres completos y abreviaturas) → número 1-12. */
const MONTHS: Record<string, number> = {
  enero: 1, ene: 1,
  febrero: 2, feb: 2,
  marzo: 3, mar: 3,
  abril: 4, abr: 4,
  mayo: 5, may: 5,
  junio: 6, jun: 6,
  julio: 7, jul: 7,
  agosto: 8, ago: 8,
  septiembre: 9, setiembre: 9, sep: 9, set: 9,
  octubre: 10, oct: 10,
  noviembre: 11, nov: 11,
  diciembre: 12, dic: 12,
};

export interface ParsedDate {
  /** false solo si hay texto que no podemos interpretar como fecha. */
  valid: boolean;
  /** Valor comparable (año * 12 + mes) para ordenar; null si está vacío. */
  rank: number | null;
  /** true si el texto indica "Actualidad" o similar. */
  isCurrent: boolean;
}

/**
 * Interpreta una fecha escrita libremente: "2024", "03/2024", "marzo 2024",
 * "Actualidad", etc. Devuelve si es interpretable y un valor comparable.
 */
export function parseFlexibleDate(raw: string): ParsedDate {
  const s = raw.trim().toLowerCase();
  if (!s) return { valid: true, rank: null, isCurrent: false };

  if (CURRENT_WORDS.some((w) => s.includes(w))) {
    return { valid: true, rank: Number.POSITIVE_INFINITY, isCurrent: true };
  }

  const years = (s.match(/\d{4}/g) ?? [])
    .map(Number)
    .filter((y) => y >= MIN_YEAR && y <= MAX_YEAR);

  if (years.length === 0) {
    return { valid: false, rank: null, isCurrent: false };
  }

  const year = years[0];
  const rest = s.replace(String(year), ' ');

  let month = 0;
  for (const name of Object.keys(MONTHS)) {
    if (new RegExp(`\\b${name}\\b`).test(rest)) {
      month = MONTHS[name];
      break;
    }
  }
  if (month === 0) {
    const m = rest.match(/\b(0?[1-9]|1[0-2])\b/);
    if (m) month = Number(m[1]);
  }

  return {
    valid: true,
    rank: year * 12 + (month > 0 ? month - 1 : 0),
    isCurrent: false,
  };
}

/**
 * ¿Parece un año válido? Usado en educación y cursos.
 * Acepta cualquier texto que contenga un año razonable (ej "2024").
 * Devuelve false ante texto claramente erróneo como "20pp".
 */
export function isLikelyValidYear(raw: string): boolean {
  const s = raw.trim();
  if (!s) return true;
  const years = (s.match(/\d{4}/g) ?? [])
    .map(Number)
    .filter((y) => y >= MIN_YEAR && y <= MAX_YEAR);
  return years.length > 0;
}

/**
 * Genera consejos suaves para las fechas de una experiencia.
 * Nunca bloquea: solo devuelve mensajes para mostrar como ayuda.
 */
export function validateExperienceDates(
  start: string,
  end: string,
  isCurrent: boolean,
): string[] {
  const msgs: string[] = [];
  const startP = parseFlexibleDate(start);

  if (start.trim() && !startP.valid) {
    msgs.push('Revisá la fecha de inicio. Tiene que ser una fecha válida.');
  }

  if (!isCurrent) {
    const endP = parseFlexibleDate(end);
    if (end.trim() && !endP.valid) {
      msgs.push('Revisá la fecha de fin. Tiene que ser una fecha válida.');
    }
    if (
      startP.valid &&
      endP.valid &&
      startP.rank != null &&
      endP.rank != null &&
      !endP.isCurrent &&
      endP.rank < startP.rank
    ) {
      msgs.push('La fecha de fin debería ser posterior a la fecha de inicio.');
      msgs.push('Si todavía trabajás ahí, podés marcar Actualidad.');
    }
  }

  return msgs;
}
