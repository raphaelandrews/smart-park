import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@web/ui/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { Add01Icon, Car01Icon, Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { VehicleResponseDTO } from "@/api/generated";
import {
  getGetVehicleQueryKey,
  getListVehiclesQueryKey,
  useDeactivateVehicle,
  useListVehicles,
  useRegisterVehicle,
  useUpdateVehicle,
} from "@/api/generated";
import { applyServerFieldErrors } from "@/auth/form-utils";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { DataTableColumn } from "@/components/data-table";
import { DataTable } from "@/components/data-table";
import { FormDialog } from "@/components/form-dialog";
import { FormError } from "@/components/forms/form-fields";
import { FormSelectField, FormTextField } from "@/components/forms/tanstack-fields";
import { MediaThumb } from "@/components/media-thumb";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { RowActionsMenu } from "@/components/row-actions-menu";
import { StatusBadge } from "@/components/status-badge";
import { TableActions } from "@/components/table-actions";
import { formatDate, formatDateTime } from "@/lib/format";
import { VEHICLE_TYPE_LABEL, getVehicleTypeLabel } from "@/lib/labels";
import type { SortState } from "@/lib/table";
import { toSortParam } from "@/lib/table";
import { licensePlateSchema, vehicleCreateSchema, vehicleUpdateSchema } from "@/lib/validation";

const PAGE_SIZE = 10;

const vehicleTypeOptions = Object.entries(VEHICLE_TYPE_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export const Route = createFileRoute("/admin/vehicles")({
  component: VehiclesPage,
});

function VehiclesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState>({ field: "model", direction: "asc" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VehicleResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VehicleResponseDTO | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const query = useListVehicles(
    { page, size: PAGE_SIZE, sort: toSortParam(sort) },
    { query: { meta: { skipGlobalErrorToast: true } } },
  );
  const pageData = query.data?.data;

  const createMutation = useRegisterVehicle({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });
  const updateMutation = useUpdateVehicle({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });
  const deleteMutation = useDeactivateVehicle({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

  const form = useForm({
    defaultValues: {
      licensePlate: "",
      model: "",
      color: "",
      vehicleType: "CAR" as NonNullable<VehicleResponseDTO["vehicleType"]>,
    },
    listeners: {
      onChange: () => setFormError(null),
    },
    onSubmit: async ({ value, formApi }) => {
      setFormError(null);

      try {
        if (editing) {
          const parsed = vehicleUpdateSchema.safeParse(value);
          if (!parsed.success) {
            return;
          }
          await updateMutation.mutateAsync({
            id: editing.id as number,
            data: parsed.data,
          });
          toast.success("Veículo atualizado.");
          setDialogOpen(false);
          await invalidate(editing.id);
          return;
        }

        const parsed = vehicleCreateSchema.safeParse(value);
        if (!parsed.success) {
          return;
        }
        await createMutation.mutateAsync({ data: parsed.data });
        toast.success("Veículo cadastrado.");
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
            licensePlate: editing.licensePlate ?? "",
            model: editing.model ?? "",
            color: editing.color ?? "",
            vehicleType: editing.vehicleType ?? "CAR",
          }
        : {
            licensePlate: "",
            model: "",
            color: "",
            vehicleType: "CAR",
          },
    );
  }, [dialogOpen, editing, form]);

  const formSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isSubmitting = formSubmitting || createMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setEditing(null);
    form.reset({
      licensePlate: "",
      model: "",
      color: "",
      vehicleType: "CAR",
    });
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(vehicle: VehicleResponseDTO) {
    setEditing(vehicle);
    form.reset({
      licensePlate: vehicle.licensePlate ?? "",
      model: vehicle.model ?? "",
      color: vehicle.color ?? "",
      vehicleType: vehicle.vehicleType ?? "CAR",
    });
    setFormError(null);
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

      <section className="rounded-2xl bg-secondary p-2">
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

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Editar veículo" : "Novo veículo"}
        description={
          editing
            ? "A placa não pode ser alterada depois do cadastro."
            : "Informe a placa e os dados do veículo."
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
        <form.Field
          name="licensePlate"
          validators={
            editing
              ? undefined
              : {
                  onChange: licensePlateSchema,
                  onSubmit: licensePlateSchema,
                }
          }
        >
          {(field) => (
            <FormTextField
              field={field}
              id="vehicle-plate"
              label="Placa"
              placeholder="ABC1D23"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={7}
              transformValue={(value) => value.toUpperCase().replace(/-/g, "")}
              disabled={Boolean(editing)}
              description={
                editing ? "A placa não pode ser alterada." : "Use o formato ABC1234 ou ABC1D23."
              }
            />
          )}
        </form.Field>
        <form.Field
          name="model"
          validators={{
            onChange: vehicleCreateSchema.shape.model,
            onSubmit: vehicleCreateSchema.shape.model,
          }}
        >
          {(field) => (
            <FormTextField
              field={field}
              id="vehicle-model"
              label="Modelo"
              placeholder="Ex.: HB20"
              maxLength={100}
            />
          )}
        </form.Field>
        <form.Field
          name="color"
          validators={{
            onChange: vehicleCreateSchema.shape.color,
            onSubmit: vehicleCreateSchema.shape.color,
          }}
        >
          {(field) => (
            <FormTextField
              field={field}
              id="vehicle-color"
              label="Cor"
              placeholder="Ex.: Prata"
              maxLength={50}
            />
          )}
        </form.Field>
        <form.Field
          name="vehicleType"
          validators={{
            onChange: vehicleCreateSchema.shape.vehicleType,
            onSubmit: vehicleCreateSchema.shape.vehicleType,
          }}
        >
          {(field) => (
            <FormSelectField
              field={field}
              id="vehicle-type"
              label="Tipo"
              options={vehicleTypeOptions}
              placeholder="Selecione o tipo"
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
