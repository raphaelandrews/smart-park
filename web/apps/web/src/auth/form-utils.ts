import { getFieldErrors } from "@/api/errors";
import { homeForRole } from "@/auth/session";
import type { AnyFormApi } from "@tanstack/react-form";
/** Distributes API field errors onto the matching TanStack Form fields. */
export function applyServerFieldErrors(form: AnyFormApi, error: unknown) {
  for (const [fieldName, message] of Object.entries(getFieldErrors(error))) {
    form.setFieldMeta(fieldName as never, (previous) => ({
      ...previous,
      errorMap: { ...previous.errorMap, onServer: message },
      errorSourceMap: { ...previous.errorSourceMap, onServer: "field" },
    }));
  }
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
