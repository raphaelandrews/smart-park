import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";
import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon } from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  return (
    <PlaceholderPage
      title="Pagamentos"
      description="Registro e estorno de pagamentos, com vínculo ao ticket e indicador de pago."
      icon={<HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} />}
    />
  );
}
