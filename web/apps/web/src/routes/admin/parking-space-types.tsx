import { createFileRoute } from "@tanstack/react-router";

import { ParkingSpaceTypesPage } from "@/features/parking-space-types/parking-space-types-page";

export const Route = createFileRoute("/admin/parking-space-types")({
  component: ParkingSpaceTypesPage,
});
