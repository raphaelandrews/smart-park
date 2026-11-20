import { describe, expect, test } from "bun:test";

import {
  ApiError,
  getErrorMessage,
  getFieldErrors,
  isApiError,
  networkError,
  normalizeApiError,
} from "./errors";

describe("normalizeApiError", () => {
  test("reads the Spring error body", () => {
    const error = normalizeApiError(422, {
      status: 422,
      error: "Regra de negócio",
      message: "A vaga A-01 já está ocupada.",
      path: "/ticket",
    });

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.message).toBe("A vaga A-01 já está ocupada.");
    expect(error.path).toBe("/ticket");
  });

  test("extracts validation field errors", () => {
    const error = normalizeApiError(400, {
      status: 400,
      message: "Um ou mais campos estão inválidos.",
      errors: [{ fieldName: "licensePlate", message: "Placa inválida" }],
    });

    expect(getFieldErrors(error)).toEqual({ licensePlate: "Placa inválida" });
  });

  test("uses the Retry-After header for rate limiting", () => {
    const error = normalizeApiError(429, null, new Headers({ "Retry-After": "12" }));
    expect(error.retryAfter).toBe(12);
    expect(error.message).toContain("12");
  });

  test("falls back to a status message for an empty body", () => {
    const error = normalizeApiError(409, null);
    expect(error.message).toContain("Já existe");
  });
});

describe("error helpers", () => {
  test("recognizes ApiError instances", () => {
    expect(isApiError(new ApiError({ status: 404, message: "x" }))).toBe(true);
    expect(isApiError(new Error("x"))).toBe(false);
  });

  test("wraps network failures", () => {
    const error = networkError(new TypeError("Failed to fetch"));
    expect(error.status).toBe(0);
    expect(getErrorMessage(error)).toContain("conectar");
  });

  test("reads plain errors and unknown values", () => {
    expect(getErrorMessage(new Error("falhou"))).toBe("falhou");
    expect(getErrorMessage("falhou")).toBe("falhou");
    expect(getErrorMessage(undefined)).toContain("inesperado");
  });
});
