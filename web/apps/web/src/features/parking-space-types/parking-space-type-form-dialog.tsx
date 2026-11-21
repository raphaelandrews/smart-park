import { useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { ParkingSpaceTypeResponseDTO } from "@/api/generated";
import {
  getGetParkingSpaceTypeQueryKey,
  getListParkingSpaceTypesQueryKey,
  useRegisterParkingSpaceType,
  useUpdateParkingSpaceType,
} from "@/api/generated";
import { applyServerFieldErrors } from "@/auth/form-utils";
import { FormDialog } from "@/components/form-dialog";
import { FormError } from "@/components/forms/form-fields";
import {
  FormCheckboxField,
  FormTextAreaField,
  FormTextField,
} from "@/components/forms/tanstack-fields";
import {
  parkingSpaceTypeCreateSchema,
  parkingSpaceTypeFormSchema,
  parkingSpaceTypeUpdateSchema,
} from "@/lib/validation";

interface ParkingSpaceTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceType?: ParkingSpaceTypeResponseDTO | null;
  onCreated?: () => void;
}

export function ParkingSpaceTypeFormDialog({
  open,
  onOpenChange,
  spaceType,
  onCreated,
}: ParkingSpaceTypeFormDialogProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useRegisterParkingSpaceType({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });
  const updateMutation = useUpdateParkingSpaceType({
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
        if (spaceType) {
          const parsed = parkingSpaceTypeUpdateSchema.safeParse(value);
          if (!parsed.success) {
            return;
          }
          await updateMutation.mutateAsync({
            id: spaceType.id as number,
            data: parsed.data,
          });
          toast.success("Tipo de vaga atualizado.");
          onOpenChange(false);
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: getListParkingSpaceTypesQueryKey() }),
            spaceType.id !== undefined
              ? queryClient.invalidateQueries({
                  queryKey: getGetParkingSpaceTypeQueryKey(spaceType.id),
                })
              : Promise.resolve(),
          ]);
          return;
        }

        const parsed = parkingSpaceTypeCreateSchema.safeParse(value);
        if (!parsed.success) {
          return;
        }
        await createMutation.mutateAsync({ data: parsed.data });
        toast.success("Tipo de vaga cadastrado.");
        onOpenChange(false);
        onCreated?.();
        await queryClient.invalidateQueries({
          queryKey: getListParkingSpaceTypesQueryKey(),
        });
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
      spaceType
        ? {
            name: spaceType.name ?? "",
            description: spaceType.description ?? "",
            requiresCredential: Boolean(spaceType.requiresCredential),
          }
        : { name: "", description: "", requiresCredential: false },
    );
    setFormError(null);
  }, [open, spaceType, form]);

  const formSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isSubmitting = formSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={spaceType ? "Editar tipo de vaga" : "Novo tipo de vaga"}
      description="Use nomes curtos e descritivos para facilitar a operação."
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      submitLabel={spaceType ? "Salvar" : "Cadastrar"}
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
  );
}
