export interface FieldError {
  fieldName: string;
  message: string;
}

export interface ApiErrorOptions {
  status: number;
  message: string;
  error?: string;
  path?: string;
  fieldErrors?: FieldError[];
  retryAfter?: number;
  cause?: unknown;
}

/**
 * Normalized error thrown by the API client. Every generated request goes through
 * `customFetch`, so screens and mutations can rely on this shape instead of guessing
 * whether they received a validation body, a Spring error body, or a network failure.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly error?: string;
  readonly path?: string;
  readonly fieldErrors: FieldError[];
  readonly retryAfter?: number;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = "ApiError";
    this.status = options.status;
    this.error = options.error;
    this.path = options.path;
    this.fieldErrors = options.fieldErrors ?? [];
    this.retryAfter = options.retryAfter;
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseFieldErrors(body: unknown): FieldError[] {
  if (!isRecord(body) || !Array.isArray(body.errors)) {
    return [];
  }

  return body.errors.flatMap((entry) => {
    if (!isRecord(entry)) {
      return [];
    }
    const fieldName = typeof entry.fieldName === "string" ? entry.fieldName : undefined;
    const message = typeof entry.message === "string" ? entry.message : undefined;
    return fieldName && message ? [{ fieldName, message }] : [];
  });
}

function fallbackMessage(status: number, retryAfter?: number): string {
  switch (status) {
    case 0:
      return "Não foi possível conectar ao servidor. Verifique sua conexão.";
    case 400:
      return "A requisição enviada é inválida.";
    case 401:
      return "Sessão expirada. Faça login novamente.";
    case 403:
      return "Você não tem permissão para acessar este recurso.";
    case 404:
      return "O recurso solicitado não existe.";
    case 409:
      return "Já existe um registro com esses dados.";
    case 422:
      return "A operação não pôde ser concluída por uma regra de negócio.";
    case 429:
      return retryAfter
        ? `Muitas requisições. Tente novamente em ${retryAfter} segundos.`
        : "Muitas requisições. Tente novamente em instantes.";
    default:
      return "Ocorreu um erro inesperado. Tente novamente.";
  }
}

export function normalizeApiError(status: number, body: unknown, headers?: Headers): ApiError {
  const retryAfterHeader = headers?.get("Retry-After");
  const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;
  const validRetryAfter = retryAfter && Number.isFinite(retryAfter) ? retryAfter : undefined;

  if (isRecord(body)) {
    const message =
      typeof body.message === "string" && body.message.trim().length > 0
        ? body.message
        : fallbackMessage(status, validRetryAfter);

    return new ApiError({
      status,
      message,
      error: typeof body.error === "string" ? body.error : undefined,
      path: typeof body.path === "string" ? body.path : undefined,
      fieldErrors: parseFieldErrors(body),
      retryAfter: validRetryAfter,
    });
  }

  if (typeof body === "string" && body.trim().length > 0) {
    return new ApiError({
      status,
      message: body.trim(),
      retryAfter: validRetryAfter,
    });
  }

  return new ApiError({
    status,
    message: fallbackMessage(status, validRetryAfter),
    retryAfter: validRetryAfter,
  });
}

export function networkError(cause: unknown): ApiError {
  return new ApiError({
    status: 0,
    message: fallbackMessage(0),
    cause,
  });
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  if (typeof error === "string" && error.length > 0) {
    return error;
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
}

/** Field errors keyed by DTO field name, ready for inline form messages. */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!isApiError(error)) {
    return {};
  }

  return Object.fromEntries(error.fieldErrors.map((field) => [field.fieldName, field.message]));
}

export function getErrorStatus(error: unknown): number | undefined {
  return isApiError(error) ? error.status : undefined;
}
