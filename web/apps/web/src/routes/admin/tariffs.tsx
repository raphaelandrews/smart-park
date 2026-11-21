import { createFileRoute } from "@tanstack/react-router";

import { TariffsPage } from "@/features/tariffs/tariffs-page";

export const Route = createFileRoute("/admin/tariffs")({
  component: TariffsPage,
});
