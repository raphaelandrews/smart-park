import { useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { VehicleResponseDTO } from "@/api/generated";
import {
  getGetVehicleQueryKey,
  getListVehiclesQueryKey,
  useRegisterVehicle,
  useUpdateVehicle,
} from "@/api/generated";
import { applyServerFieldErrors } from "@/auth/form-utils";
import { FormDialog } from "@/components/form-dialog";
import { FormError } from "@/components/forms/form-fields";
import { FormSelectField, FormTextField } from "@/components/forms/tanstack-fields";
import { VEHICLE_TYPE_LABEL } from "@/lib/labels";
import { licensePlateSchema, vehicleCreateSchema, vehicleUpdateSchema } from "@/lib/validation";

const vehicleTypeOptions = Object.entries(VEHICLE_TYPE_LABEL).map(([value, label]) => ({
  value,
  label,
}));

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: VehicleResponseDTO | null;
}

export function VehicleFormDialog({ open, onOpenChange, vehicle }: VehicleFormDialogProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useRegisterVehicle({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });
  const updateMutation = useUpdateVehicle({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

  const form = useForm({
    defaultValues: {
      licensePlate: "",
      model: "",
      color: "",
      vehicleType: "CAR" as NonNullable<VehicleResponseDTO["vehicleType"]>,
    },
    onSubmit: async ({ value, formApi }) => {
      setFormError(null);

      try {
        if (vehicle) {
          const parsed = vehicleUpdateSchema.safeParse(value);
          if (!parsed.success) {
            return;
          }
          await updateMutation.mutateAsync({
            id: vehicle.id as number,
            data: parsed.data,
          });
          toast.success("Veículo atualizado.");
          onOpenChange(false);
          await queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
          if (vehicle.id !== undefined) {
            await queryClient.invalidateQueries({
              queryKey: getGetVehicleQueryKey(vehicle.id),
            });
          }
          return;
        }

        const parsed = vehicleCreateSchema.safeParse(value);
        if (!parsed.success) {
          return;
        }
        await createMutation.mutateAsync({ data: parsed.data });
        toast.success("Veículo cadastrado.");
        onOpenChange(false);
        await queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
      } catch (error) {
        applyServerFieldErrors(formApi, error);
        setFormError(getErrorMessage(error));
      }
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset(
      vehicle
        ? {
            licensePlate: vehicle.licensePlate ?? "",
            model: vehicle.model ?? "",
            color: vehicle.color ?? "",
            vehicleType: vehicle.vehicleType ?? "CAR",
          }
        : {
            licensePlate: "",
            model: "",
            color: "",
            vehicleType: "CAR",
          },
    );
    setFormError(null);
  }, [open, vehicle, form]);

  const formSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isSubmitting = formSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={vehicle ? "Editar veículo" : "Novo veículo"}
      description={
        vehicle
          ? "A placa não pode ser alterada depois do cadastro."
          : "Informe a placa e os dados do veículo."
      }
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      submitLabel={vehicle ? "Salvar" : "Cadastrar"}
      isSubmitting={isSubmitting}
    >
      <FormError message={formError} />
      <form.Field
        name="licensePlate"
        validators={
          vehicle
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
            disabled={Boolean(vehicle)}
            description={
              vehicle ? "A placa não pode ser alterada." : "Use o formato ABC1234 ou ABC1D23."
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
  );
}
