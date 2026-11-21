import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@web/ui/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import {
  Add01Icon,
  Delete02Icon,
  PencilEdit02Icon,
  SquareParkingIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { ParkingSpaceResponseDTO } from "@/api/generated";
import {
  getGetParkingSpaceQueryKey,
  getListParkingSpacesQueryKey,
  useDeactivateParkingSpace,
  useListParkingSpaces,
  useRegisterParkingSpace,
  useUpdateParkingSpace,
} from "@/api/generated";
import { useAllParkingSpaceTypes, useAllTickets } from "@/api/lookups";
import { applyServerFieldErrors } from "@/auth/form-utils";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { DataTableColumn } from "@/components/data-table";
import { DataTable } from "@/components/data-table";
import { FormDialog } from "@/components/form-dialog";
import { FormError } from "@/components/forms/form-fields";
import {
  FormCheckboxField,
  FormSelectField,
  FormTextAreaField,
  FormTextField,
} from "@/components/forms/tanstack-fields";
import { MediaThumb } from "@/components/media-thumb";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { RowActionsMenu } from "@/components/row-actions-menu";
import { StatusBadge } from "@/components/status-badge";
import { TableActions } from "@/components/table-actions";
import { formatCompactDateTime, formatDateTime } from "@/lib/format";
import {
  PARKING_SPACE_STATUS_LABEL,
  getOpenTickets,
  getSpaceStatus,
  type ParkingSpaceStatus,
} from "@/lib/parking";
import type { SortState } from "@/lib/table";
import { toSortParam } from "@/lib/table";
import {
  parkingSpaceCreateSchema,
  parkingSpaceFormSchema,
  parkingSpaceUpdateSchema,
} from "@/lib/validation";

const PAGE_SIZE = 10;

const statusTone: Record<ParkingSpaceStatus, "success" | "warning" | "danger"> = {
  AVAILABLE: "success",
  OCCUPIED: "warning",
  BLOCKED: "danger",
};

export const Route = createFileRoute("/admin/parking-spaces")({
  component: ParkingSpacesPage,
});

function ParkingSpacesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState>({ field: "code", direction: "asc" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ParkingSpaceResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ParkingSpaceResponseDTO | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const query = useListParkingSpaces(
    { page, size: PAGE_SIZE, sort: toSortParam(sort) },
    { query: { meta: { skipGlobalErrorToast: true } } },
  );
  const pageData = query.data?.data;

  const spaceTypes = useAllParkingSpaceTypes();
  const tickets = useAllTickets();
  const openTickets = getOpenTickets(tickets.items);

  const createMutation = useRegisterParkingSpace({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });
  const updateMutation = useUpdateParkingSpace({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });
  const deleteMutation = useDeactivateParkingSpace({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

  const typeOptions = spaceTypes.items.flatMap((type) =>
    type.id !== undefined && type.name ? [{ value: String(type.id), label: type.name }] : [],
  );

  const form = useForm({
    defaultValues: {
      code: "",
      parkingSpaceTypeId: "" as string | number,
      blocked: false,
      blockingReason: "",
    },
    validators: {
      onChange: parkingSpaceFormSchema,
      onSubmit: parkingSpaceFormSchema,
    },
    listeners: {
      onChange: () => setFormError(null),
    },
    onSubmit: async ({ value, formApi }) => {
      setFormError(null);
      const normalized = {
        ...value,
        blockingReason: value.blocked ? value.blockingReason : "",
      };

      try {
        if (editing) {
          const parsed = parkingSpaceUpdateSchema.safeParse(normalized);
          if (!parsed.success) {
            return;
          }
          await updateMutation.mutateAsync({
            id: editing.id as number,
            data: parsed.data,
          });
          toast.success("Vaga atualizada.");
          setDialogOpen(false);
          await invalidate(editing.id);
          return;
        }

        const parsed = parkingSpaceCreateSchema.safeParse(normalized);
        if (!parsed.success) {
          return;
        }
        await createMutation.mutateAsync({ data: parsed.data });
        toast.success("Vaga cadastrada.");
        setDialogOpen(false);
        setPage(0);
        await invalidate();
      } catch (error) {
        applyServerFieldErrors(formApi, error);
        setFormError(getErrorMessage(error));
      }
    },
  });

  useEffect(() => {
    if (!dialogOpen) {
      return;
    }
    form.reset(
      editing
        ? {
            code: editing.code ?? "",
            parkingSpaceTypeId:
              editing.parkingSpaceTypeId !== undefined ? String(editing.parkingSpaceTypeId) : "",
            blocked: Boolean(editing.blocked),
            blockingReason: editing.blockingReason ?? "",
          }
        : {
            code: "",
            parkingSpaceTypeId: "",
            blocked: false,
            blockingReason: "",
          },
    );
  }, [dialogOpen, editing, form]);

  const formSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isSubmitting = formSubmitting || createMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setEditing(null);
    form.reset({
      code: "",
      parkingSpaceTypeId: "",
      blocked: false,
      blockingReason: "",
    });
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(space: ParkingSpaceResponseDTO) {
    setEditing(space);
    form.reset({
      code: space.code ?? "",
      parkingSpaceTypeId:
        space.parkingSpaceTypeId !== undefined ? String(space.parkingSpaceTypeId) : "",
      blocked: Boolean(space.blocked),
      blockingReason: space.blockingReason ?? "",
    });
    setFormError(null);
    setDialogOpen(true);
  }

  async function invalidate(spaceId?: number) {
    await queryClient.invalidateQueries({ queryKey: getListParkingSpacesQueryKey() });
    if (spaceId !== undefined) {
      await queryClient.invalidateQueries({
        queryKey: getGetParkingSpaceQueryKey(spaceId),
      });
    }
  }

  async function handleDeactivate() {
    if (!deleteTarget?.id) {
      return;
    }
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id });
      toast.success("Vaga desativada.");
      setDeleteTarget(null);
      if ((pageData?.content?.length ?? 0) === 1 && page > 0) {
        setPage((current) => current - 1);
      }
      await invalidate(deleteTarget.id);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<ParkingSpaceResponseDTO>[] = [
    {
      id: "code",
      header: "Código",
      sortField: "code",
      cell: (space) => (
        <div className="flex items-center gap-3">
          <MediaThumb icon={SquareParkingIcon} size="sm" />
          <span className="font-mono font-medium">{space.code ?? "—"}</span>
        </div>
      ),
    },
    {
      id: "parkingSpaceTypeName",
      header: "Tipo",
      sortField: "type.name",
      cell: (space) => space.parkingSpaceTypeName ?? "—",
    },
    {
      id: "status",
      header: "Status",
      cell: (space) => {
        const status = getSpaceStatus(space, openTickets);
        return (
          <StatusBadge tone={statusTone[status]}>{PARKING_SPACE_STATUS_LABEL[status]}</StatusBadge>
        );
      },
    },
    {
      id: "blockingReason",
      header: "Motivo do bloqueio",
      cell: (space) =>
        space.blocked ? (
          <span className="text-muted-foreground">{space.blockingReason || "—"}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "createdAt",
      header: "Cadastrada em",
      sortField: "createdAt",
      cell: (space) => (
        <span className="text-muted-foreground">{formatDateTime(space.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      headerClassName: "text-right",
      cell: (space) => (
        <TableActions onEdit={() => openEdit(space)} onDelete={() => setDeleteTarget(space)} />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Vagas"
        description="Gerencie as vagas físicas, o tipo e o bloqueio de cada uma."
        actions={
          <Button onClick={openCreate}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            Nova vaga
          </Button>
        }
      />

      <section className="rounded-2xl bg-secondary p-2">
        <DataTable
          columns={columns}
          rows={pageData?.content ?? []}
          getRowId={(space) => space.id ?? space.code ?? "unknown"}
          isLoading={query.isPending}
          error={query.error}
          onRetry={() => void query.refetch()}
          sort={sort}
          onSortChange={(nextSort) => {
            setSort(nextSort);
            setPage(0);
          }}
          mobileRow={(space) => {
            const status = getSpaceStatus(space, openTickets);
            return (
              <div className="flex gap-4 px-2 py-6">
                <MediaThumb icon={SquareParkingIcon} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate font-mono text-base leading-6 font-medium">
                      {space.code ?? "—"}
                    </h3>
                    <RowActionsMenu
                      label="Opções da vaga"
                      items={[
                        {
                          label: "Editar",
                          icon: PencilEdit02Icon,
                          onSelect: () => openEdit(space),
                        },
                        {
                          label: "Desativar",
                          icon: Delete02Icon,
                          destructive: true,
                          onSelect: () => setDeleteTarget(space),
                        },
                      ]}
                    />
                  </div>
                  <p className="text-[13px] leading-[18px] text-muted-foreground">
                    {space.parkingSpaceTypeName ?? "Sem tipo"}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <StatusBadge tone={statusTone[status]}>
                      {PARKING_SPACE_STATUS_LABEL[status]}
                    </StatusBadge>
                    <span className="max-w-[55%] truncate text-right text-[13px] leading-[18px] text-muted-foreground">
                      {space.blocked && space.blockingReason
                        ? space.blockingReason
                        : formatCompactDateTime(space.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          }}
          emptyIcon={<HugeiconsIcon icon={SquareParkingIcon} strokeWidth={2} className="size-5" />}
          emptyTitle="Nenhuma vaga cadastrada"
          emptyDescription="Cadastre a primeira vaga para começar a operar."
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

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Editar vaga" : "Nova vaga"}
        description={
          editing
            ? "O código da vaga não pode ser alterado."
            : "Informe o código, o tipo e o estado inicial da vaga."
        }
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        submitLabel={editing ? "Salvar" : "Cadastrar"}
        isSubmitting={isSubmitting}
      >
        <FormError message={formError} />
        <form.Field name="code">
          {(field) => (
            <FormTextField
              field={field}
              id="space-code"
              label="Código"
              placeholder="Ex.: A1"
              autoComplete="off"
              maxLength={20}
              transformValue={(value) => value.toUpperCase()}
              disabled={Boolean(editing)}
              description={editing ? "O código da vaga não pode ser alterado." : undefined}
            />
          )}
        </form.Field>
        <form.Field name="parkingSpaceTypeId">
          {(field) => (
            <FormSelectField
              field={field}
              id="space-type"
              label="Tipo de vaga"
              options={typeOptions}
              placeholder={spaceTypes.query.isPending ? "Carregando tipos..." : "Selecione o tipo"}
            />
          )}
        </form.Field>
        <form.Field name="blocked">
          {(field) => (
            <FormCheckboxField
              field={field}
              id="space-blocked"
              label="Vaga bloqueada"
              description="Vagas bloqueadas não podem receber novos tickets."
            />
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.values.blocked}>
          {(blocked) =>
            blocked ? (
              <form.Field name="blockingReason">
                {(field) => (
                  <FormTextAreaField
                    field={field}
                    id="space-blocking-reason"
                    label="Motivo do bloqueio"
                    placeholder="Ex.: Manutenção no piso"
                    maxLength={255}
                  />
                )}
              </form.Field>
            ) : null
          }
        </form.Subscribe>
      </FormDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Desativar vaga"
        description={`A vaga ${deleteTarget?.code ?? ""} deixará de aparecer nas listas. Se houver um ticket aberto, finalize-o antes. Esta ação não pode ser desfeita.`}
        confirmLabel="Desativar"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
