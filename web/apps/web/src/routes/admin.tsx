import { createFileRoute } from "@tanstack/react-router";

import { requireAdmin } from "@/auth/session";
import { AdminShell } from "@/components/layout/admin-shell";

export const Route = createFileRoute("/admin")({
  beforeLoad: requireAdmin,
  component: AdminShell,
});
