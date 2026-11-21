import { useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import {
  getListAvailableParkingSpacesQueryKey,
  getListTicketsQueryKey,
  useRegisterTicket,
} from "@/api/generated";
import { useAllTickets, useAllVehicles, useAvailableParkingSpaces } from "@/api/lookups";
import { applyServerFieldErrors } from "@/auth/form-utils";
import { FormDialog } from "@/components/form-dialog";
import { FormError } from "@/components/forms/form-fields";
import { FormSelectField } from "@/components/forms/tanstack-fields";
import { getVehicleTypeLabel } from "@/lib/labels";
import { getOpenTickets } from "@/lib/parking";
import { ticketCreateSchema } from "@/lib/validation";

interface TicketCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function TicketCreateDialog({ open, onOpenChange, onCreated }: TicketCreateDialogProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const vehicles = useAllVehicles();
  const tickets = useAllTickets();
  const availableSpaces = useAvailableParkingSpaces();

  const registerTicket = useRegisterTicket({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

  const openTickets = getOpenTickets(tickets.items);
  const parkedVehicleIds = new Set(
    openTickets.flatMap((ticket) => (ticket.vehicleId !== undefined ? [ticket.vehicleId] : [])),
  );

  const vehicleOptions = vehicles.items.flatMap((vehicle) =>
    vehicle.id !== undefined && !parkedVehicleIds.has(vehicle.id)
      ? [
          {
            value: String(vehicle.id),
            label: `${vehicle.licensePlate ?? "—"} · ${vehicle.model ?? "Sem modelo"} · ${getVehicleTypeLabel(
              vehicle.vehicleType,
            )}`,
          },
        ]
      : [],
  );
  const spaceOptions = availableSpaces.items.flatMap((space) =>
    space.id !== undefined
      ? [
          {
            value: String(space.id),
            label: `${space.code ?? "—"} · ${space.parkingSpaceTypeName ?? "Sem tipo"}`,
          },
        ]
      : [],
  );
  const form = useForm({
    defaultValues: {
      vehicleId: "" as string | number,
      parkingSpaceId: "" as string | number,
    },
    validators: {
      onChange: ticketCreateSchema,
      onSubmit: ticketCreateSchema,
    },
    listeners: {
      onChange: () => setFormError(null),
    },
    onSubmit: async ({ value, formApi }) => {
      setFormError(null);
      const parsed = ticketCreateSchema.safeParse(value);
      if (!parsed.success) {
        return;
      }

      try {
        await registerTicket.mutateAsync({ data: parsed.data });
        toast.success("Ticket aberto.");
        onOpenChange(false);
        onCreated?.();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() }),
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
    form.reset({ vehicleId: "", parkingSpaceId: "" });
    setFormError(null);
  }, [open, form]);

  const formSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isSubmitting = formSubmitting || registerTicket.isPending;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Abrir ticket"
      description="Selecione o veículo e uma vaga disponível. A tarifa é aplicada automaticamente."
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      submitLabel="Abrir ticket"
      isSubmitting={isSubmitting}
    >
      <FormError message={formError} />
      <form.Field name="vehicleId">
        {(field) => (
          <FormSelectField
            field={field}
            id="session-vehicle"
            label="Veículo"
            options={vehicleOptions}
            loading={vehicles.query.isPending}
            placeholder={
              vehicles.query.isPending ? "Carregando veículos..." : "Selecione o veículo"
            }
            description={
              vehicleOptions.length === 0
                ? "Todos os seus veículos já estão em uma sessão aberta."
                : undefined
            }
          />
        )}
      </form.Field>
      <form.Field name="parkingSpaceId">
        {(field) => (
          <FormSelectField
            field={field}
            id="session-space"
            label="Vaga"
            options={spaceOptions}
            loading={availableSpaces.query.isPending}
            placeholder={
              availableSpaces.query.isPending ? "Carregando vagas..." : "Selecione a vaga"
            }
            description={
              spaceOptions.length === 0
                ? "Não há vagas disponíveis no momento."
                : "Somente vagas livres e não bloqueadas aparecem aqui."
            }
          />
        )}
      </form.Field>
      <p className="rounded-xl bg-secondary px-3 py-2.5 text-sm text-muted-foreground">
        A tarifa é definida automaticamente pelo tipo do veículo. Você verá o valor calculado antes
        de pagar.
      </p>
    </FormDialog>
  );
}
