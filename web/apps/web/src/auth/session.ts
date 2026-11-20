import { redirect } from "@tanstack/react-router";

import { getGetCurrentUserQueryOptions, type UserResponseDTO } from "@/api/generated";
import { queryClient } from "@/lib/query-client";

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

async function loadCurrentUser(): Promise<UserResponseDTO> {
  const response = await queryClient.ensureQueryData(meQueryOptions());
  return response.data;
}

export async function requireAuthenticated({ location }: { location: { href: string } }) {
  if (!hasAccessToken()) {
    throw redirect({ to: "/login", search: { redirect: location.href } });
  }

  try {
    return { user: await loadCurrentUser() };
  } catch {
    clearAccessToken();
    throw redirect({ to: "/login", search: { redirect: location.href } });
  }
}

export async function requireAdmin({ location }: { location: { href: string } }) {
  const { user } = await requireAuthenticated({ location });
  if (user.role !== "ADMIN") {
    throw redirect({ to: "/my" });
  }
  return { user };
}
