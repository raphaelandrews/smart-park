import { createFileRoute } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { SquareParkingIcon } from "@hugeicons/core-free-icons";

import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/admin/parking-spaces")({
  component: ParkingSpacesPage,
});

function ParkingSpacesPage() {
  return (
    <PlaceholderPage
      title="Vagas"
      description="Gestão das vagas físicas, bloqueio com motivo e status derivado (disponível, ocupada ou bloqueada)."
      icon={<HugeiconsIcon icon={SquareParkingIcon} strokeWidth={2} />}
    />
  );
}
