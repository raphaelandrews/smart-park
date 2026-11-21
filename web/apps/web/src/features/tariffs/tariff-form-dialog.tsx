import { useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { TariffResponseDTO } from "@/api/generated";
import {
  getGetTariffQueryKey,
  getListTariffsQueryKey,
  useRegisterTariff,
  useUpdateTariff,
} from "@/api/generated";
import { applyServerFieldErrors } from "@/auth/form-utils";
import { FormDialog } from "@/components/form-dialog";
import { FormError } from "@/components/forms/form-fields";
import { FormSelectField, FormTextField } from "@/components/forms/tanstack-fields";
import { VEHICLE_TYPE_LABEL } from "@/lib/labels";
import { tariffCreateSchema, tariffUpdateSchema } from "@/lib/validation";

const vehicleTypeOptions = Object.entries(VEHICLE_TYPE_LABEL).map(([value, label]) => ({
  value,
  label,
}));

interface TariffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tariff?: TariffResponseDTO | null;
  onCreated?: () => void;
}

export function TariffFormDialog({ open, onOpenChange, tariff, onCreated }: TariffFormDialogProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useRegisterTariff({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });
  const updateMutation = useUpdateTariff({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

  const form = useForm({
    defaultValues: {
      description: "",
      firstHourRate: "" as string | number,
      additionalHourRate: "" as string | number,
      toleranceMinutes: "" as string | number,
      vehicleType: "" as "" | "CAR" | "MOTORCYCLE" | "TRUCK" | "BUS",
    },
    validators: {
      onChange: tariffCreateSchema,
      onSubmit: tariffCreateSchema,
    },
    listeners: {
      onChange: () => setFormError(null),
    },
    onSubmit: async ({ value, formApi }) => {
      setFormError(null);

      try {
        if (tariff) {
          const parsed = tariffUpdateSchema.safeParse(value);
          if (!parsed.success) {
            return;
          }
          await updateMutation.mutateAsync({
            id: tariff.id as number,
            data: { ...parsed.data, vehicleType: parsed.data.vehicleType ?? undefined },
          });
          toast.success("Tarifa atualizada.");
          onOpenChange(false);
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: getListTariffsQueryKey() }),
            tariff.id !== undefined
              ? queryClient.invalidateQueries({ queryKey: getGetTariffQueryKey(tariff.id) })
              : Promise.resolve(),
          ]);
          return;
        }

        const parsed = tariffCreateSchema.safeParse(value);
        if (!parsed.success) {
          return;
        }
        await createMutation.mutateAsync({
          data: { ...parsed.data, vehicleType: parsed.data.vehicleType ?? undefined },
        });
        toast.success("Tarifa cadastrada.");
        onOpenChange(false);
        onCreated?.();
        await queryClient.invalidateQueries({ queryKey: getListTariffsQueryKey() });
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
      tariff
        ? {
            description: tariff.description ?? "",
            firstHourRate: tariff.firstHourRate !== undefined ? String(tariff.firstHourRate) : "",
            additionalHourRate:
              tariff.additionalHourRate !== undefined ? String(tariff.additionalHourRate) : "",
            toleranceMinutes:
              tariff.toleranceMinutes !== undefined ? String(tariff.toleranceMinutes) : "",
            vehicleType: tariff.vehicleType ?? "",
          }
        : {
            description: "",
            firstHourRate: "",
            additionalHourRate: "",
            toleranceMinutes: "",
            vehicleType: "",
          },
    );
    setFormError(null);
  }, [open, tariff, form]);

  const formSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isSubmitting = formSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tariff ? "Editar tarifa" : "Nova tarifa"}
      description="Os valores são usados no cálculo de pagamentos."
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      submitLabel={tariff ? "Salvar" : "Cadastrar"}
      isSubmitting={isSubmitting}
    >
      <FormError message={formError} />
      <form.Field name="description">
        {(field) => (
          <FormTextField
            field={field}
            id="tariff-description"
            label="Descrição"
            placeholder="Ex.: Tarifa padrão"
            maxLength={255}
          />
        )}
      </form.Field>
      <form.Field name="vehicleType">
        {(field) => (
          <FormSelectField
            field={field}
            id="tariff-vehicle-type"
            label="Tipo de veículo"
            options={vehicleTypeOptions}
            placeholder="Padrão (todos os tipos)"
            description="A tarifa é aplicada automaticamente ao abrir o ticket do veículo."
          />
        )}
      </form.Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <form.Field name="firstHourRate">
          {(field) => (
            <FormTextField
              field={field}
              id="tariff-first-hour"
              label="Primeira hora (R$)"
              type="number"
              placeholder="0,00"
              inputMode="decimal"
              min={0}
              step="0.01"
            />
          )}
        </form.Field>
        <form.Field name="additionalHourRate">
          {(field) => (
            <FormTextField
              field={field}
              id="tariff-additional-hour"
              label="Hora adicional (R$)"
              type="number"
              placeholder="0,00"
              inputMode="decimal"
              min={0}
              step="0.01"
            />
          )}
        </form.Field>
      </div>
      <form.Field name="toleranceMinutes">
        {(field) => (
          <FormTextField
            field={field}
            id="tariff-tolerance"
            label="Tolerância (minutos)"
            type="number"
            placeholder="Ex.: 15"
            inputMode="numeric"
            min={0}
            step="1"
            description="Minutos de tolerância antes de cobrar a primeira hora."
          />
        )}
      </form.Field>
    </FormDialog>
  );
}
