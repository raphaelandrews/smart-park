const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

const compactDateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export const EMPTY_VALUE = "—";

/**
 * The API serializes LocalDateTime values with a trailing `Z` even though they are
 * local wall-clock values. Parsing them as UTC would shift the displayed time, so the
 * suffix is removed and the value is parsed in the browser's timezone.
 */
export function parseApiDateTime(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const normalized = trimmed.endsWith("Z") ? trimmed.slice(0, -1) : trimmed;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return EMPTY_VALUE;
  }

  const number = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(number) ? currencyFormatter.format(number) : EMPTY_VALUE;
}

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value)
    ? EMPTY_VALUE
    : new Intl.NumberFormat("pt-BR").format(value);
}

export function formatDateTime(value: string | null | undefined): string {
  const date = parseApiDateTime(value);
  return date ? dateTimeFormatter.format(date) : EMPTY_VALUE;
}

/** Compact date/time for media-row meta lines (day/month, hour:minute). */
export function formatCompactDateTime(value: string | null | undefined): string {
  const date = parseApiDateTime(value);
  return date ? compactDateTimeFormatter.format(date) : EMPTY_VALUE;
}

export function formatDate(value: string | null | undefined): string {
  const date = parseApiDateTime(value);
  return date ? dateFormatter.format(date) : EMPTY_VALUE;
}

export function getDurationMinutes(
  start: string | null | undefined,
  end: string | null | undefined,
): number | null {
  const startDate = parseApiDateTime(start);
  const endDate = parseApiDateTime(end);
  if (!startDate || !endDate) {
    return null;
  }

  const diff = endDate.getTime() - startDate.getTime();
  return diff < 0 ? null : Math.floor(diff / 60_000);
}

export function getElapsedMinutes(
  start: string | null | undefined,
  now: Date = new Date(),
): number | null {
  const startDate = parseApiDateTime(start);
  if (!startDate) {
    return null;
  }

  const diff = now.getTime() - startDate.getTime();
  return diff < 0 ? 0 : Math.floor(diff / 60_000);
}

export function formatDurationMinutes(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || !Number.isFinite(minutes)) {
    return EMPTY_VALUE;
  }

  const total = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(total / 60);
  const remainingMinutes = total % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}min`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMinutes}min`;
}
