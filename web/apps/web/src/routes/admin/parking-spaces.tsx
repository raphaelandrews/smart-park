import { createFileRoute } from "@tanstack/react-router";

import { ParkingSpacesPage } from "@/features/parking-spaces/parking-spaces-page";

export const Route = createFileRoute("/admin/parking-spaces")({
  component: ParkingSpacesPage,
});
