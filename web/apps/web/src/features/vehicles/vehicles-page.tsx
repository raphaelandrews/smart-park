import { Button } from "@web/ui/components/button";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { Add01Icon, Car01Icon, Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { VehicleResponseDTO } from "@/api/generated";
import {
  getGetVehicleQueryKey,
  getListVehiclesQueryKey,
  useDeactivateVehicle,
  useListVehicles,
} from "@/api/generated";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { DataTableColumn } from "@/components/data-table";
import { DataTable } from "@/components/data-table";
import { MediaThumb } from "@/components/media-thumb";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { RowActionsMenu } from "@/components/row-actions-menu";
import { StatusBadge } from "@/components/status-badge";
import { TableActions } from "@/components/table-actions";
import { VehicleFormDialog } from "@/features/vehicles/vehicle-form-dialog";
import { formatDate, formatDateTime } from "@/lib/format";
import { getVehicleTypeLabel } from "@/lib/labels";
import type { SortState } from "@/lib/table";
import { toSortParam } from "@/lib/table";

const PAGE_SIZE = 10;

export function VehiclesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState>({ field: "model", direction: "asc" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VehicleResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VehicleResponseDTO | null>(null);

  const query = useListVehicles(
    { page, size: PAGE_SIZE, sort: toSortParam(sort) },
    { query: { placeholderData: keepPreviousData, meta: { skipGlobalErrorToast: true } } },
  );
  const pageData = query.data?.data;

  const deleteMutation = useDeactivateVehicle({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(vehicle: VehicleResponseDTO) {
    setEditing(vehicle);
    setDialogOpen(true);
  }

  async function invalidate(vehicleId?: number) {
    await queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
    if (vehicleId !== undefined) {
      await queryClient.invalidateQueries({ queryKey: getGetVehicleQueryKey(vehicleId) });
    }
  }

  async function handleDeactivate() {
    if (!deleteTarget?.id) {
      return;
    }
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id });
      toast.success("Veículo desativado.");
      setDeleteTarget(null);
      if ((pageData?.content?.length ?? 0) === 1 && page > 0) {
        setPage((current) => current - 1);
      }
      await invalidate(deleteTarget.id);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<VehicleResponseDTO>[] = [
    {
      id: "licensePlate",
      header: "Placa",
      sortField: "licensePlate",
      cell: (vehicle) => (
        <div className="flex items-center gap-3">
          <MediaThumb icon={Car01Icon} size="sm" />
          <span className="font-mono font-medium">{vehicle.licensePlate ?? "—"}</span>
        </div>
      ),
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
    {
      id: "createdAt",
      header: "Cadastrado em",
      sortField: "createdAt",
      cell: (vehicle) => (
        <span className="text-muted-foreground">{formatDateTime(vehicle.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      headerClassName: "text-right",
      cell: (vehicle) => (
        <TableActions onEdit={() => openEdit(vehicle)} onDelete={() => setDeleteTarget(vehicle)} />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Veículos"
        description="Cadastre, edite e desative veículos do estacionamento."
        actions={
          <Button onClick={openCreate}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            Novo veículo
          </Button>
        }
      />

      <section>
        <DataTable
          columns={columns}
          rows={pageData?.content ?? []}
          getRowId={(vehicle) => vehicle.id ?? vehicle.licensePlate ?? "unknown"}
          isLoading={query.isPending}
          error={query.error}
          onRetry={() => void query.refetch()}
          sort={sort}
          onSortChange={(nextSort) => {
            setSort(nextSort);
            setPage(0);
          }}
          mobileRow={(vehicle) => (
            <div className="flex gap-4 px-2 py-6">
              <MediaThumb icon={Car01Icon} />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate font-mono text-base leading-6 font-medium">
                    {vehicle.licensePlate ?? "—"}
                  </h3>
                  <RowActionsMenu
                    label="Opções do veículo"
                    items={[
                      {
                        label: "Editar",
                        icon: PencilEdit02Icon,
                        onSelect: () => openEdit(vehicle),
                      },
                      {
                        label: "Desativar",
                        icon: Delete02Icon,
                        destructive: true,
                        onSelect: () => setDeleteTarget(vehicle),
                      },
                    ]}
                  />
                </div>
                <p className="text-[13px] leading-[18px] text-muted-foreground">
                  {[vehicle.model, vehicle.color].filter(Boolean).join(" · ") || "—"}
                </p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <StatusBadge tone="brand">{getVehicleTypeLabel(vehicle.vehicleType)}</StatusBadge>
                  <span className="shrink-0 text-[13px] leading-[18px] text-muted-foreground">
                    Desde {formatDate(vehicle.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          )}
          emptyIcon={<HugeiconsIcon icon={Car01Icon} strokeWidth={2} className="size-5" />}
          emptyTitle="Nenhum veículo cadastrado"
          emptyDescription="Cadastre o primeiro veículo para começar."
          footer={
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              totalElements={pageData?.totalElements ?? 0}
              totalPages={pageData?.totalPages ?? 0}
              onPageChange={setPage}
              isFetching={query.isFetching}
            />
          }
        />
      </section>

      <VehicleFormDialog open={dialogOpen} onOpenChange={setDialogOpen} vehicle={editing} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Desativar veículo"
        description={`O veículo ${deleteTarget?.licensePlate ?? ""} deixará de aparecer nas listas. Esta ação não pode ser desfeita.`}
        confirmLabel="Desativar"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
