import { useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { TicketResponseDTO } from "@/api/generated";
import {
  getListAvailableParkingSpacesQueryKey,
  getListPaymentsQueryKey,
  getListTicketsQueryKey,
  useGetTicketQuote,
  useRegisterPayment,
} from "@/api/generated";
import { applyServerFieldErrors } from "@/auth/form-utils";
import { FormDialog } from "@/components/form-dialog";
import { FormError } from "@/components/forms/form-fields";
import { FormSelectField } from "@/components/forms/tanstack-fields";
import { PaymentQuote } from "@/components/payment-quote";
import { formatCompactDateTime, formatCurrency } from "@/lib/format";
import { isTicketOpen } from "@/lib/parking";
import { paymentCreateSchema } from "@/lib/validation";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tickets: TicketResponseDTO[];
  initialTicketId?: string;
  onPaid?: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  tickets,
  initialTicketId,
  onPaid,
}: PaymentDialogProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const registerPayment = useRegisterPayment({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

  const form = useForm({
    defaultValues: {
      ticketId: "" as string | number,
    },
    validators: {
      onChange: paymentCreateSchema,
      onSubmit: paymentCreateSchema,
    },
    listeners: {
      onChange: () => setFormError(null),
    },
    onSubmit: async ({ value, formApi }) => {
      setFormError(null);
      const parsed = paymentCreateSchema.safeParse(value);
      if (!parsed.success) {
        return;
      }

      try {
        const response = await registerPayment.mutateAsync({ data: parsed.data });
        const amount = response.data?.amount;
        toast.success(
          amount !== undefined
            ? `Pagamento de ${formatCurrency(amount)} registrado.`
            : "Pagamento registrado.",
        );
        onOpenChange(false);
        onPaid?.();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() }),
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
    const timer = window.setTimeout(() => {
      form.reset();
      if (initialTicketId) {
        form.setFieldValue("ticketId", initialTicketId);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, initialTicketId, form]);

  const formSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isSubmitting = formSubmitting || registerPayment.isPending;
  const ticketId = useStore(form.store, (state) => state.values.ticketId);
  const quoteTicketId = ticketId === "" || ticketId === undefined ? null : Number(ticketId);
  const quoteQuery = useGetTicketQuote(quoteTicketId ?? 0, {
    query: {
      enabled: quoteTicketId !== null && !Number.isNaN(quoteTicketId),
      retry: false,
      meta: { skipGlobalErrorToast: true },
    },
  });
  const quote = quoteQuery.data?.data;
  const selectedTicket =
    ticketId === "" ? undefined : tickets.find((ticket) => ticket.id === Number(ticketId));

  const options = tickets.flatMap((ticket) =>
    ticket.id === undefined
      ? []
      : [
          {
            value: String(ticket.id),
            label: `#${ticket.id} · ${ticket.licensePlate ?? "—"} · ${
              ticket.parkingSpaceCode ?? "—"
            }${isTicketOpen(ticket) ? " · em andamento" : ""}`,
          },
        ],
  );

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Pagar sessão"
      description="O pagamento encerra a sessão, calcula o valor no servidor e libera a vaga."
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      submitLabel="Pagar e sair"
      submitVariant="ink"
      isSubmitting={isSubmitting}
      submitDisabled={quoteQuery.isFetching || !quote}
    >
      <FormError message={formError} />
      <form.Field name="ticketId">
        {(field) => (
          <FormSelectField
            field={field}
            id="payment-ticket"
            label="Sessão"
            options={options}
            placeholder="Selecione a sessão"
            description="O pagamento encerra a sessão e libera a vaga."
          />
        )}
      </form.Field>
      <PaymentQuote quote={quote} isLoading={quoteQuery.isFetching} error={quoteQuery.error} />
      {selectedTicket ? (
        <dl className="grid gap-1 rounded-xl bg-secondary px-3 py-2.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Placa</dt>
            <dd className="font-mono">{selectedTicket.licensePlate ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Vaga</dt>
            <dd>{selectedTicket.parkingSpaceCode ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Entrada</dt>
            <dd>{formatCompactDateTime(selectedTicket.entryTime)}</dd>
          </div>
        </dl>
      ) : null}
    </FormDialog>
  );
}
