import { Button } from "@web/ui/components/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  Add01Icon,
  Delete02Icon,
  PencilEdit02Icon,
  ReceiptTextIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { TariffResponseDTO } from "@/api/generated";
import {
  getGetTariffQueryKey,
  getListTariffsQueryKey,
  useDeactivateTariff,
  useListTariffs,
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
import { TariffFormDialog } from "@/features/tariffs/tariff-form-dialog";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getVehicleTypeLabel } from "@/lib/labels";
import type { SortState } from "@/lib/table";
import { toSortParam } from "@/lib/table";

const PAGE_SIZE = 10;

export function TariffsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState>({
    field: "description",
    direction: "asc",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TariffResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TariffResponseDTO | null>(null);

  const query = useListTariffs(
    { page, size: PAGE_SIZE, sort: toSortParam(sort) },
    { query: { meta: { skipGlobalErrorToast: true } } },
  );
  const pageData = query.data?.data;

  const deleteMutation = useDeactivateTariff({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(tariff: TariffResponseDTO) {
    setEditing(tariff);
    setDialogOpen(true);
  }

  async function invalidate(tariffId?: number) {
    await queryClient.invalidateQueries({ queryKey: getListTariffsQueryKey() });
    if (tariffId !== undefined) {
      await queryClient.invalidateQueries({ queryKey: getGetTariffQueryKey(tariffId) });
    }
  }

  async function handleDeactivate() {
    if (!deleteTarget?.id) {
      return;
    }
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id });
      toast.success("Tarifa desativada.");
      setDeleteTarget(null);
      if ((pageData?.content?.length ?? 0) === 1 && page > 0) {
        setPage((current) => current - 1);
      }
      await invalidate(deleteTarget.id);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<TariffResponseDTO>[] = [
    {
      id: "description",
      header: "Descrição",
      sortField: "description",
      cell: (tariff) => (
        <div className="flex items-center gap-3">
          <MediaThumb icon={ReceiptTextIcon} size="sm" />
          <span className="font-medium">{tariff.description ?? "—"}</span>
        </div>
      ),
    },
    {
      id: "vehicleType",
      header: "Tipo de veículo",
      sortField: "vehicleType",
      cell: (tariff) => (tariff.vehicleType ? getVehicleTypeLabel(tariff.vehicleType) : "Padrão"),
    },
    {
      id: "firstHourRate",
      header: "Primeira hora",
      sortField: "firstHourRate",
      headerClassName: "text-right",
      className: "text-right",
      cell: (tariff) => (
        <span className="tabular-nums">{formatCurrency(tariff.firstHourRate)}</span>
      ),
    },
    {
      id: "additionalHourRate",
      header: "Hora adicional",
      sortField: "additionalHourRate",
      headerClassName: "text-right",
      className: "text-right",
      cell: (tariff) => (
        <span className="tabular-nums">{formatCurrency(tariff.additionalHourRate)}</span>
      ),
    },
    {
      id: "toleranceMinutes",
      header: "Tolerância",
      sortField: "toleranceMinutes",
      headerClassName: "text-right",
      className: "text-right",
      cell: (tariff) => <span className="tabular-nums">{tariff.toleranceMinutes ?? 0} min</span>,
    },
    {
      id: "createdAt",
      header: "Cadastrada em",
      sortField: "createdAt",
      cell: (tariff) => (
        <span className="text-muted-foreground">{formatDateTime(tariff.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      headerClassName: "text-right",
      cell: (tariff) => (
        <TableActions onEdit={() => openEdit(tariff)} onDelete={() => setDeleteTarget(tariff)} />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tarifas"
        description="Valores por tipo de veículo. A tarifa sem tipo é o padrão."
        actions={
          <Button onClick={openCreate}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            Nova tarifa
          </Button>
        }
      />

      <section className="rounded-2xl bg-secondary p-2">
        <DataTable
          columns={columns}
          rows={pageData?.content ?? []}
          getRowId={(tariff) => tariff.id ?? tariff.description ?? "unknown"}
          isLoading={query.isPending}
          error={query.error}
          onRetry={() => void query.refetch()}
          sort={sort}
          onSortChange={(nextSort) => {
            setSort(nextSort);
            setPage(0);
          }}
          mobileRow={(tariff) => (
            <div className="flex gap-4 px-2 py-6">
              <MediaThumb icon={ReceiptTextIcon} />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate text-base leading-6 font-medium">
                    {tariff.description ?? "—"}
                  </h3>
                  <RowActionsMenu
                    label="Opções da tarifa"
                    items={[
                      {
                        label: "Editar",
                        icon: PencilEdit02Icon,
                        onSelect: () => openEdit(tariff),
                      },
                      {
                        label: "Desativar",
                        icon: Delete02Icon,
                        destructive: true,
                        onSelect: () => setDeleteTarget(tariff),
                      },
                    ]}
                  />
                </div>
                <p className="text-[13px] leading-[18px] text-muted-foreground tabular-nums">
                  1ª hora · +{formatCurrency(tariff.additionalHourRate)}/h
                </p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <span className="flex items-center gap-1.5">
                    <StatusBadge tone="info">
                      {tariff.vehicleType ? getVehicleTypeLabel(tariff.vehicleType) : "Padrão"}
                    </StatusBadge>
                    <span title={`Tolerância de ${tariff.toleranceMinutes ?? 0} minutos`}>
                      <StatusBadge tone="neutral">{tariff.toleranceMinutes ?? 0} min</StatusBadge>
                    </span>
                  </span>
                  <span className="shrink-0 text-base leading-6 font-medium tabular-nums">
                    {formatCurrency(tariff.firstHourRate)}
                  </span>
                </div>
              </div>
            </div>
          )}
          emptyIcon={<HugeiconsIcon icon={ReceiptTextIcon} strokeWidth={2} className="size-5" />}
          emptyTitle="Nenhuma tarifa cadastrada"
          emptyDescription="Cadastre uma tarifa padrão para permitir a abertura de tickets."
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

      <TariffFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tariff={editing}
        onCreated={() => setPage(0)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Desativar tarifa"
        description={`A tarifa ${deleteTarget?.description ?? ""} deixará de aparecer nas listas. Tickets existentes não são alterados. Esta ação não pode ser desfeita.`}
        confirmLabel="Desativar"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
