import { Button } from "@web/ui/components/button";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { Add01Icon, Delete02Icon, PencilEdit02Icon, TagsIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { ParkingSpaceTypeResponseDTO } from "@/api/generated";
import {
  getGetParkingSpaceTypeQueryKey,
  getListParkingSpaceTypesQueryKey,
  useDeactivateParkingSpaceType,
  useListParkingSpaceTypes,
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
import { ParkingSpaceTypeFormDialog } from "@/features/parking-space-types/parking-space-type-form-dialog";
import { formatCompactDateTime, formatDateTime } from "@/lib/format";
import type { SortState } from "@/lib/table";
import { toSortParam } from "@/lib/table";

const PAGE_SIZE = 10;

export function ParkingSpaceTypesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ParkingSpaceTypeResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ParkingSpaceTypeResponseDTO | null>(null);

  const query = useListParkingSpaceTypes(
    { page, size: PAGE_SIZE, sort: toSortParam(sort) },
    { query: { placeholderData: keepPreviousData, meta: { skipGlobalErrorToast: true } } },
  );
  const pageData = query.data?.data;

  const deleteMutation = useDeactivateParkingSpaceType({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(type: ParkingSpaceTypeResponseDTO) {
    setEditing(type);
    setDialogOpen(true);
  }

  async function invalidate(typeId?: number) {
    await queryClient.invalidateQueries({
      queryKey: getListParkingSpaceTypesQueryKey(),
    });
    if (typeId !== undefined) {
      await queryClient.invalidateQueries({
        queryKey: getGetParkingSpaceTypeQueryKey(typeId),
      });
    }
  }

  async function handleDeactivate() {
    if (!deleteTarget?.id) {
      return;
    }
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id });
      toast.success("Tipo de vaga desativado.");
      setDeleteTarget(null);
      if ((pageData?.content?.length ?? 0) === 1 && page > 0) {
        setPage((current) => current - 1);
      }
      await invalidate(deleteTarget.id);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<ParkingSpaceTypeResponseDTO>[] = [
    {
      id: "name",
      header: "Nome",
      sortField: "name",
      cell: (type) => (
        <div className="flex items-center gap-3">
          <MediaThumb icon={TagsIcon} size="sm" />
          <span className="font-medium">{type.name ?? "—"}</span>
        </div>
      ),
    },
    {
      id: "description",
      header: "Descrição",
      cell: (type) => <span className="text-muted-foreground">{type.description || "—"}</span>,
    },
    {
      id: "requiresCredential",
      header: "Exige credencial",
      sortField: "requiresCredential",
      cell: (type) =>
        type.requiresCredential ? (
          <StatusBadge tone="brand">Sim</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">Não</StatusBadge>
        ),
    },
    {
      id: "createdAt",
      header: "Cadastrado em",
      sortField: "createdAt",
      cell: (type) => (
        <span className="text-muted-foreground">{formatDateTime(type.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      headerClassName: "text-right",
      cell: (type) => (
        <TableActions onEdit={() => openEdit(type)} onDelete={() => setDeleteTarget(type)} />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tipos de vaga"
        description="Categorias de vaga e regras de credencial."
        actions={
          <Button onClick={openCreate}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            Novo tipo
          </Button>
        }
      />

      <section>
        <DataTable
          columns={columns}
          rows={pageData?.content ?? []}
          getRowId={(type) => type.id ?? type.name ?? "unknown"}
          isLoading={query.isPending}
          error={query.error}
          onRetry={() => void query.refetch()}
          sort={sort}
          onSortChange={(nextSort) => {
            setSort(nextSort);
            setPage(0);
          }}
          mobileRow={(type) => (
            <div className="flex gap-4 px-2 py-6">
              <MediaThumb icon={TagsIcon} />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate text-base leading-6 font-medium">{type.name ?? "—"}</h3>
                  <RowActionsMenu
                    label="Opções do tipo de vaga"
                    items={[
                      {
                        label: "Editar",
                        icon: PencilEdit02Icon,
                        onSelect: () => openEdit(type),
                      },
                      {
                        label: "Desativar",
                        icon: Delete02Icon,
                        destructive: true,
                        onSelect: () => setDeleteTarget(type),
                      },
                    ]}
                  />
                </div>
                <p className="line-clamp-2 text-[13px] leading-[18px] text-muted-foreground">
                  {type.description || "Sem descrição"}
                </p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <StatusBadge tone={type.requiresCredential ? "brand" : "neutral"}>
                    {type.requiresCredential ? "Exige credencial" : "Sem credencial"}
                  </StatusBadge>
                  <span className="shrink-0 text-[13px] leading-[18px] text-muted-foreground">
                    {formatCompactDateTime(type.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          )}
          emptyIcon={<HugeiconsIcon icon={TagsIcon} strokeWidth={2} className="size-5" />}
          emptyTitle="Nenhum tipo de vaga cadastrado"
          emptyDescription="Cadastre o primeiro tipo para organizar as vagas."
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

      <ParkingSpaceTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        spaceType={editing}
        onCreated={() => setPage(0)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Desativar tipo de vaga"
        description={`O tipo ${deleteTarget?.name ?? ""} deixará de aparecer nas listas. As vagas existentes podem ficar sem um tipo ativo. Esta ação não pode ser desfeita.`}
        confirmLabel="Desativar"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
