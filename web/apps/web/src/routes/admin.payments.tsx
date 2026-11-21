import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@web/ui/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { Add01Icon, CreditCardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { PaymentResponseDTO } from "@/api/generated";
import {
  getListAvailableParkingSpacesQueryKey,
  getListPaymentsQueryKey,
  getListTicketsQueryKey,
  useGetTicketQuote,
  useListPayments,
  useRegisterPayment,
} from "@/api/generated";
import { toLookupMap, useAllPayments, useAllTickets } from "@/api/lookups";
import { applyServerFieldErrors } from "@/auth/form-utils";
import type { DataTableColumn } from "@/components/data-table";
import { DataTable } from "@/components/data-table";
import { FormDialog } from "@/components/form-dialog";
import { FormError } from "@/components/forms/form-fields";
import { FormSelectField } from "@/components/forms/tanstack-fields";
import { MediaThumb } from "@/components/media-thumb";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { PaymentQuote } from "@/components/payment-quote";
import { StatusBadge } from "@/components/status-badge";
import { formatCompactDateTime, formatCurrency, formatDateTime } from "@/lib/format";
import { isTicketOpen } from "@/lib/parking";
import type { SortState } from "@/lib/table";
import { toSortParam } from "@/lib/table";
import { paymentCreateSchema } from "@/lib/validation";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState>({
    field: "paymentDateTime",
    direction: "desc",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const query = useListPayments(
    { page, size: PAGE_SIZE, sort: toSortParam(sort) },
    { query: { meta: { skipGlobalErrorToast: true } } },
  );
  const pageData = query.data?.data;

  const tickets = useAllTickets();
  const allPayments = useAllPayments();

  const ticketMap = useMemo(() => toLookupMap(tickets.items), [tickets.items]);

  const paidTicketIds = useMemo(
    () =>
      new Set(
        allPayments.items.flatMap((payment) =>
          payment.ticketId !== undefined && payment.active !== false ? [payment.ticketId] : [],
        ),
      ),
    [allPayments.items],
  );

  const createMutation = useRegisterPayment({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

  const ticketOptions = useMemo(
    () =>
      tickets.items
        .filter(
          (ticket) =>
            ticket.id !== undefined && !paidTicketIds.has(ticket.id) && ticket.active !== false,
        )
        .sort((first, second) => {
          const openDelta = Number(isTicketOpen(second)) - Number(isTicketOpen(first));
          if (openDelta !== 0) {
            return openDelta;
          }
          return (second.entryTime ?? "").localeCompare(first.entryTime ?? "");
        })
        .flatMap((ticket) =>
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
        ),
    [tickets.items, paidTicketIds],
  );

  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() }),
      queryClient.invalidateQueries({
        queryKey: getListAvailableParkingSpacesQueryKey(),
      }),
    ]);
  }

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
        const response = await createMutation.mutateAsync({ data: parsed.data });
        const amount = response.data?.amount;
        toast.success(
          amount !== undefined
            ? `Pagamento de ${formatCurrency(amount)} registrado.`
            : "Pagamento registrado.",
        );
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
    form.reset({ ticketId: "" });
  }, [dialogOpen, form]);

  const formSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isSubmitting = formSubmitting || createMutation.isPending;
  const formTicketId = useStore(form.store, (state) => state.values.ticketId);
  const quoteTicketId =
    formTicketId === "" || formTicketId === undefined ? null : Number(formTicketId);
  const quoteQuery = useGetTicketQuote(quoteTicketId ?? 0, {
    query: {
      enabled: quoteTicketId !== null && !Number.isNaN(quoteTicketId),
      retry: false,
      meta: { skipGlobalErrorToast: true },
    },
  });
  const quote = quoteQuery.data?.data;

  function openCreate() {
    form.reset({ ticketId: "" });
    setFormError(null);
    setDialogOpen(true);
  }

  const columns: DataTableColumn<PaymentResponseDTO>[] = [
    {
      id: "id",
      header: "Pagamento",
      sortField: "id",
      cell: (payment) => (
        <div className="flex items-center gap-3">
          <MediaThumb icon={CreditCardIcon} size="sm" />
          <span className="font-medium">#{payment.id ?? "—"}</span>
        </div>
      ),
    },
    {
      id: "ticketId",
      header: "Ticket",
      sortField: "ticketId",
      cell: (payment) => {
        const ticket = payment.ticketId !== undefined ? ticketMap.get(payment.ticketId) : undefined;
        return (
          <div className="grid gap-0.5">
            <span className="font-medium">#{payment.ticketId ?? "—"}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {ticket?.licensePlate ?? "—"}
              {ticket?.parkingSpaceCode ? ` · ${ticket.parkingSpaceCode}` : ""}
            </span>
          </div>
        );
      },
    },
    {
      id: "amount",
      header: "Valor",
      sortField: "amount",
      headerClassName: "text-right",
      className: "text-right",
      cell: (payment) => (
        <span className="font-medium tabular-nums">{formatCurrency(payment.amount)}</span>
      ),
    },
    {
      id: "paymentDateTime",
      header: "Pago em",
      sortField: "paymentDateTime",
      cell: (payment) => (
        <span className="text-muted-foreground">{formatDateTime(payment.paymentDateTime)}</span>
      ),
    },
    {
      id: "status",
      header: "Situação",
      cell: (payment) =>
        payment.active === false ? (
          <StatusBadge tone="neutral">Desativado</StatusBadge>
        ) : (
          <StatusBadge tone="success">Ativo</StatusBadge>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Pagamentos"
        description="Registre pagamentos e encerre sessões em andamento."
        actions={
          <Button onClick={openCreate}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            Novo pagamento
          </Button>
        }
      />

      <section className="rounded-2xl bg-secondary p-2">
        <DataTable
          columns={columns}
          rows={pageData?.content ?? []}
          getRowId={(payment) => payment.id ?? `${payment.ticketId}-${payment.paymentDateTime}`}
          isLoading={query.isPending}
          error={query.error}
          onRetry={() => void query.refetch()}
          sort={sort}
          onSortChange={(nextSort) => {
            setSort(nextSort);
            setPage(0);
          }}
          mobileRow={(payment) => {
            const ticket =
              payment.ticketId !== undefined ? ticketMap.get(payment.ticketId) : undefined;
            return (
              <div className="flex gap-4 px-2 py-6">
                <MediaThumb icon={CreditCardIcon} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate text-base leading-6 font-medium">
                      Ticket #{payment.ticketId ?? "—"}
                      {ticket?.licensePlate ? ` · ${ticket.licensePlate}` : ""}
                    </h3>
                  </div>
                  <p className="truncate text-[13px] leading-[18px] text-muted-foreground">
                    {ticket?.parkingSpaceCode ? `Vaga ${ticket.parkingSpaceCode} · ` : ""}
                    {formatCompactDateTime(payment.paymentDateTime)}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    {payment.active === false ? (
                      <StatusBadge tone="neutral">Desativado</StatusBadge>
                    ) : (
                      <StatusBadge tone="success">Ativo</StatusBadge>
                    )}
                    <span className="shrink-0 text-base leading-6 font-medium tabular-nums">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                </div>
              </div>
            );
          }}
          emptyIcon={<HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} className="size-5" />}
          emptyTitle="Nenhum pagamento registrado"
          emptyDescription="Registre o primeiro pagamento de um ticket encerrado."
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
        title="Novo pagamento"
        description="O pagamento encerra a sessão e registra o valor calculado pelo servidor. Um ticket aceita apenas um pagamento."
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        submitLabel="Registrar"
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
              label="Ticket"
              options={ticketOptions}
              placeholder={tickets.query.isPending ? "Carregando tickets..." : "Selecione o ticket"}
              description={
                ticketOptions.length === 0
                  ? "Todos os tickets ativos já possuem pagamento registrado."
                  : undefined
              }
            />
          )}
        </form.Field>
        <PaymentQuote quote={quote} isLoading={quoteQuery.isFetching} error={quoteQuery.error} />
      </FormDialog>
    </div>
  );
}
