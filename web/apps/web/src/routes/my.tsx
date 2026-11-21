import { createFileRoute } from "@tanstack/react-router";

import { requireAuthenticated } from "@/auth/session";
import { DriverPage } from "@/features/driver/driver-page";

export const Route = createFileRoute("/my")({
  beforeLoad: requireAuthenticated,
  component: DriverPage,
});
