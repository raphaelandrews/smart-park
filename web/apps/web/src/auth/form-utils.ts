import { getFieldErrors } from "@/api/errors";
import { homeForRole } from "@/auth/session";
import type { ZodError } from "zod";

export function fieldErrorsFromZod(error: ZodError): Record<string, string> {
  const entries = error.issues.flatMap((issue) => {
    const field = issue.path[0];
    return typeof field === "string" ? [[field, issue.message] as const] : [];
  });
  return Object.fromEntries(entries);
}

export function mergeFieldErrors(
  first: Record<string, string>,
  error: unknown,
): Record<string, string> {
  return { ...first, ...getFieldErrors(error) };
}

export function resolvePostLoginPath(
  redirectTo: string | undefined,
  role: string | undefined,
): string {
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    if (redirectTo.startsWith("/admin") && role !== "ADMIN") {
      return homeForRole(role);
    }
    return redirectTo;
  }
  return homeForRole(role);
}
