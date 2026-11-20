import { createFileRoute } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { TagsIcon } from "@hugeicons/core-free-icons";

import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/admin/parking-space-types")({
  component: ParkingSpaceTypesPage,
});

function ParkingSpaceTypesPage() {
  return (
    <PlaceholderPage
      title="Tipos de vaga"
      description="Categorias de vaga, descrição e indicação de exigência de credencial."
      icon={<HugeiconsIcon icon={TagsIcon} strokeWidth={2} />}
    />
  );
}
