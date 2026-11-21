import { createFileRoute } from "@tanstack/react-router";

import { VehiclesPage } from "@/features/vehicles/vehicles-page";

export const Route = createFileRoute("/admin/vehicles")({
  component: VehiclesPage,
});
