import { redirect } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

import { getGetCurrentUserQueryOptions, type UserResponseDTO } from "@/api/generated";

import { clearAccessToken, hasAccessToken } from "./token";

export type AuthRole = UserResponseDTO["role"];

export function homeForRole(role: AuthRole | string | undefined): "/admin" | "/my" {
  return role === "ADMIN" ? "/admin" : "/my";
}

export function meQueryOptions() {
  return getGetCurrentUserQueryOptions({
    query: {
      retry: false,
      staleTime: 5 * 60_000,
      meta: { skipGlobalErrorToast: true },
    },
  });
}

interface AuthRouteContext {
  location: { href: string };
  context: { queryClient: QueryClient };
}

async function loadCurrentUser(queryClient: QueryClient): Promise<UserResponseDTO> {
  const response = await queryClient.ensureQueryData(meQueryOptions());
  return response.data;
}

export async function requireAuthenticated({ location, context }: AuthRouteContext) {
  if (!hasAccessToken()) {
    throw redirect({ to: "/login", search: { redirect: location.href } });
  }

  try {
    return { user: await loadCurrentUser(context.queryClient) };
  } catch {
    clearAccessToken();
    throw redirect({ to: "/login", search: { redirect: location.href } });
  }
}

export async function requireAdmin(route: AuthRouteContext) {
  const { user } = await requireAuthenticated(route);
  if (user.role !== "ADMIN") {
    throw redirect({ to: "/my" });
  }
  return { user };
}
