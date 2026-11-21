import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@web/ui/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { Add01Icon, Delete02Icon, PencilEdit02Icon, TagsIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { ParkingSpaceTypeResponseDTO } from "@/api/generated";
import {
  getGetParkingSpaceTypeQueryKey,
  getListParkingSpaceTypesQueryKey,
  useDeactivateParkingSpaceType,
  useListParkingSpaceTypes,
  useRegisterParkingSpaceType,
  useUpdateParkingSpaceType,
} from "@/api/generated";
import { applyServerFieldErrors } from "@/auth/form-utils";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { DataTableColumn } from "@/components/data-table";
import { DataTable } from "@/components/data-table";
import { FormDialog } from "@/components/form-dialog";
import { FormError } from "@/components/forms/form-fields";
import {
  FormCheckboxField,
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
import type { SortState } from "@/lib/table";
import { toSortParam } from "@/lib/table";
import {
  parkingSpaceTypeCreateSchema,
  parkingSpaceTypeFormSchema,
  parkingSpaceTypeUpdateSchema,
} from "@/lib/validation";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/admin/parking-space-types")({
  component: ParkingSpaceTypesPage,
});

function ParkingSpaceTypesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ParkingSpaceTypeResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ParkingSpaceTypeResponseDTO | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const query = useListParkingSpaceTypes(
    { page, size: PAGE_SIZE, sort: toSortParam(sort) },
    { query: { meta: { skipGlobalErrorToast: true } } },
  );
  const pageData = query.data?.data;

  const createMutation = useRegisterParkingSpaceType({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });
  const updateMutation = useUpdateParkingSpaceType({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });
  const deleteMutation = useDeactivateParkingSpaceType({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      requiresCredential: false,
    },
    validators: {
      onChange: parkingSpaceTypeFormSchema,
      onSubmit: parkingSpaceTypeFormSchema,
    },
    listeners: {
      onChange: () => setFormError(null),
    },
    onSubmit: async ({ value, formApi }) => {
      setFormError(null);

      try {
        if (editing) {
          const parsed = parkingSpaceTypeUpdateSchema.safeParse(value);
          if (!parsed.success) {
            return;
          }
          await updateMutation.mutateAsync({
            id: editing.id as number,
            data: parsed.data,
          });
          toast.success("Tipo de vaga atualizado.");
          setDialogOpen(false);
          await invalidate(editing.id);
          return;
        }

        const parsed = parkingSpaceTypeCreateSchema.safeParse(value);
        if (!parsed.success) {
          return;
        }
        await createMutation.mutateAsync({ data: parsed.data });
        toast.success("Tipo de vaga cadastrado.");
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
            name: editing.name ?? "",
            description: editing.description ?? "",
            requiresCredential: Boolean(editing.requiresCredential),
          }
        : { name: "", description: "", requiresCredential: false },
    );
  }, [dialogOpen, editing, form]);

  const formSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isSubmitting = formSubmitting || createMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", description: "", requiresCredential: false });
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(type: ParkingSpaceTypeResponseDTO) {
    setEditing(type);
    form.reset({
      name: type.name ?? "",
      description: type.description ?? "",
      requiresCredential: Boolean(type.requiresCredential),
    });
    setFormError(null);
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

      <section className="rounded-2xl bg-secondary p-2">
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

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Editar tipo de vaga" : "Novo tipo de vaga"}
        description="Use nomes curtos e descritivos para facilitar a operação."
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        submitLabel={editing ? "Salvar" : "Cadastrar"}
        isSubmitting={isSubmitting}
      >
        <FormError message={formError} />
        <form.Field name="name">
          {(field) => (
            <FormTextField
              field={field}
              id="type-name"
              label="Nome"
              placeholder="Ex.: Coberta"
              maxLength={100}
            />
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => (
            <FormTextAreaField
              field={field}
              id="type-description"
              label="Descrição"
              placeholder="Detalhes opcionais sobre este tipo de vaga"
              maxLength={255}
            />
          )}
        </form.Field>
        <form.Field name="requiresCredential">
          {(field) => (
            <FormCheckboxField
              field={field}
              id="type-requires-credential"
              label="Exige credencial"
              description="Marque se o acesso a este tipo de vaga exige credencial."
            />
          )}
        </form.Field>
      </FormDialog>

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
