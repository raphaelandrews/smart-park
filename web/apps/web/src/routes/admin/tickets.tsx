import { createFileRoute } from "@tanstack/react-router";

import { TicketsPage } from "@/features/tickets/tickets-page";

export const Route = createFileRoute("/admin/tickets")({
  component: TicketsPage,
});
