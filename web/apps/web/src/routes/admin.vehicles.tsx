import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";
import { HugeiconsIcon } from "@hugeicons/react";
import { Car01Icon } from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/admin/vehicles")({
  component: VehiclesPage,
});

function VehiclesPage() {
  return (
    <PlaceholderPage
      title="Veículos"
      description="Cadastro, edição e desativação de veículos, com validação de placa e busca por placa, modelo ou cor."
      icon={<HugeiconsIcon icon={Car01Icon} strokeWidth={2} />}
    />
  );
}
