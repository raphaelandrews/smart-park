import { useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { ParkingSpaceResponseDTO } from "@/api/generated";
import {
  getGetParkingSpaceQueryKey,
  getListAvailableParkingSpacesQueryKey,
  getListParkingSpacesQueryKey,
  useRegisterParkingSpace,
  useUpdateParkingSpace,
} from "@/api/generated";
import { useAllParkingSpaceTypes } from "@/api/lookups";
import { applyServerFieldErrors } from "@/auth/form-utils";
import { FormDialog } from "@/components/form-dialog";
import { FormError } from "@/components/forms/form-fields";
import {
  FormCheckboxField,
  FormSelectField,
  FormTextAreaField,
  FormTextField,
} from "@/components/forms/tanstack-fields";
import {
  parkingSpaceCreateSchema,
  parkingSpaceFormSchema,
  parkingSpaceUpdateSchema,
} from "@/lib/validation";

interface ParkingSpaceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space?: ParkingSpaceResponseDTO | null;
  onCreated?: () => void;
}

export function ParkingSpaceFormDialog({
  open,
  onOpenChange,
  space,
  onCreated,
}: ParkingSpaceFormDialogProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const spaceTypes = useAllParkingSpaceTypes();
  const typeOptions = spaceTypes.items.flatMap((type) =>
    type.id !== undefined && type.name ? [{ value: String(type.id), label: type.name }] : [],
  );

  const createMutation = useRegisterParkingSpace({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });
  const updateMutation = useUpdateParkingSpace({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

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
        if (space) {
          const parsed = parkingSpaceUpdateSchema.safeParse(normalized);
          if (!parsed.success) {
            return;
          }
          await updateMutation.mutateAsync({
            id: space.id as number,
            data: parsed.data,
          });
          toast.success("Vaga atualizada.");
          onOpenChange(false);
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: getListParkingSpacesQueryKey() }),
            queryClient.invalidateQueries({
              queryKey: getListAvailableParkingSpacesQueryKey(),
            }),
            space.id !== undefined
              ? queryClient.invalidateQueries({ queryKey: getGetParkingSpaceQueryKey(space.id) })
              : Promise.resolve(),
          ]);
          return;
        }

        const parsed = parkingSpaceCreateSchema.safeParse(normalized);
        if (!parsed.success) {
          return;
        }
        await createMutation.mutateAsync({ data: parsed.data });
        toast.success("Vaga cadastrada.");
        onOpenChange(false);
        onCreated?.();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListParkingSpacesQueryKey() }),
          queryClient.invalidateQueries({
            queryKey: getListAvailableParkingSpacesQueryKey(),
          }),
        ]);
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
      space
        ? {
            code: space.code ?? "",
            parkingSpaceTypeId:
              space.parkingSpaceTypeId !== undefined ? String(space.parkingSpaceTypeId) : "",
            blocked: Boolean(space.blocked),
            blockingReason: space.blockingReason ?? "",
          }
        : {
            code: "",
            parkingSpaceTypeId: "",
            blocked: false,
            blockingReason: "",
          },
    );
    setFormError(null);
  }, [open, space, form]);

  const formSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isSubmitting = formSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={space ? "Editar vaga" : "Nova vaga"}
      description={
        space
          ? "O código da vaga não pode ser alterado."
          : "Informe o código, o tipo e o estado inicial da vaga."
      }
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      submitLabel={space ? "Salvar" : "Cadastrar"}
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
            disabled={Boolean(space)}
            description={space ? "O código da vaga não pode ser alterado." : undefined}
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
            loading={spaceTypes.query.isPending}
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
  );
}
