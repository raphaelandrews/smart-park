import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@web/ui/components/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@web/ui/components/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Car01Icon,
  CreditCardIcon,
  SquareParkingIcon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";

import type { VehicleResponseDTO } from "@/api/generated";
import { useListVehicles } from "@/api/generated";
import type { DataTableColumn } from "@/components/data-table";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { getVehicleTypeLabel } from "@/lib/labels";
import type { SortState } from "@/lib/table";
import { toSortParam } from "@/lib/table";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

const PREVIEW_PAGE_SIZE = 5;

const stats = [
  { label: "Vagas", value: "—", icon: SquareParkingIcon },
  { label: "Ocupadas", value: "—", icon: Car01Icon },
  { label: "Tickets abertos", value: "—", icon: Ticket01Icon },
  { label: "Receita hoje", value: "—", icon: CreditCardIcon },
] as const;

const vehicleColumns: DataTableColumn<VehicleResponseDTO>[] = [
  {
    id: "licensePlate",
    header: "Placa",
    sortField: "licensePlate",
    cell: (vehicle) => <span className="font-mono">{vehicle.licensePlate ?? "—"}</span>,
  },
  {
    id: "model",
    header: "Modelo",
    sortField: "model",
    cell: (vehicle) => vehicle.model ?? "—",
  },
  {
    id: "color",
    header: "Cor",
    sortField: "color",
    cell: (vehicle) => vehicle.color ?? "—",
  },
  {
    id: "vehicleType",
    header: "Tipo",
    sortField: "vehicleType",
    cell: (vehicle) => (
      <StatusBadge tone="brand">{getVehicleTypeLabel(vehicle.vehicleType)}</StatusBadge>
    ),
  },
];

function DashboardPage() {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState>({ field: "model", direction: "asc" });

  const vehiclesQuery = useListVehicles(
    { page, size: PREVIEW_PAGE_SIZE, sort: toSortParam(sort) },
    { query: { meta: { skipGlobalErrorToast: true } } },
  );
  const vehiclesPage = vehiclesQuery.data?.data;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Olá! 👋" description="Aqui está o resumo do estacionamento hoje." />

      <section className="rounded-2xl bg-secondary p-2">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            return (
              <Card key={stat.label} size="sm">
                <CardHeader>
                  <CardDescription className="text-xs font-medium">{stat.label}</CardDescription>
                  <CardTitle className="text-2xl font-medium tabular-nums">{stat.value}</CardTitle>
                  <CardAction>
                    <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                      <HugeiconsIcon icon={stat.icon} strokeWidth={2} className="size-5" />
                    </span>
                  </CardAction>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-secondary p-2">
        <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl leading-7 font-medium">Veículos cadastrados</h2>
            <p className="text-sm text-muted-foreground">Veículos ativos no estacionamento.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/admin/vehicles" />}
          >
            Ver todos
          </Button>
        </div>

        <DataTable
          columns={vehicleColumns}
          rows={vehiclesPage?.content ?? []}
          getRowId={(vehicle) => vehicle.id ?? vehicle.licensePlate ?? "unknown"}
          isLoading={vehiclesQuery.isPending}
          error={vehiclesQuery.error}
          onRetry={() => void vehiclesQuery.refetch()}
          sort={sort}
          onSortChange={(nextSort) => {
            setSort(nextSort);
            setPage(0);
          }}
          emptyTitle="Nenhum veículo cadastrado"
          emptyDescription="Cadastre um veículo para começar."
          footer={
            <Pagination
              page={page}
              pageSize={PREVIEW_PAGE_SIZE}
              totalElements={vehiclesPage?.totalElements ?? 0}
              totalPages={vehiclesPage?.totalPages ?? 0}
              onPageChange={setPage}
              isFetching={vehiclesQuery.isFetching}
            />
          }
        />
      </section>
    </div>
  );
}
