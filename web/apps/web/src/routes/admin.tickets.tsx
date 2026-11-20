import { createFileRoute } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Ticket01Icon } from "@hugeicons/core-free-icons";

import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/admin/tickets")({
  component: TicketsPage,
});

function TicketsPage() {
  return (
    <PlaceholderPage
      title="Tickets"
      description="Abertura e encerramento de sessões, filtros de abertos/fechados, QR code e recibo."
      icon={<HugeiconsIcon icon={Ticket01Icon} strokeWidth={2} />}
    />
  );
}
