import { createFileRoute } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { ReceiptTextIcon } from "@hugeicons/core-free-icons";

import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/admin/tariffs")({
  component: TariffsPage,
});

function TariffsPage() {
  return (
    <PlaceholderPage
      title="Tarifas"
      description="Valores de primeira hora, hora adicional e tolerância, com calculadora estimada."
      icon={<HugeiconsIcon icon={ReceiptTextIcon} strokeWidth={2} />}
    />
  );
}
