import { createFileRoute, redirect } from "@tanstack/react-router";

import { clearAccessToken, hasAccessToken } from "@/auth/token";
import { homeForRole, meQueryOptions } from "@/auth/session";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    if (!hasAccessToken()) {
      throw redirect({ to: "/login" });
    }

    let user;
    try {
      const response = await queryClient.ensureQueryData(meQueryOptions());
      user = response.data;
    } catch {
      clearAccessToken();
      throw redirect({ to: "/login" });
    }

    throw redirect({ to: homeForRole(user.role) });
  },
});
