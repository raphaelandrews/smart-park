import { createFileRoute, redirect } from "@tanstack/react-router";

import { clearAccessToken, hasAccessToken } from "@/auth/token";
import { homeForRole, meQueryOptions } from "@/auth/session";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!hasAccessToken()) {
      throw redirect({ to: "/login" });
    }

    let user;
    try {
      const response = await context.queryClient.ensureQueryData(meQueryOptions());
      user = response.data;
    } catch {
      clearAccessToken();
      throw redirect({ to: "/login" });
    }

    throw redirect({ to: homeForRole(user.role) });
  },
});
