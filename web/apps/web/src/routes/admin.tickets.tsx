import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@web/ui/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { Add01Icon, Ticket01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { TicketResponseDTO } from "@/api/generated";
import {
  getListAvailableParkingSpacesQueryKey,
  getListPaymentsQueryKey,
  getListParkingSpacesQueryKey,
  getListTicketsQueryKey,
  getListVehiclesQueryKey,
  useRegisterTicket,
} from "@/api/generated";
import {
  useAllParkingSpaces,
  useAllPayments,
  useAllTariffs,
  useAllTickets,
  useAllVehicles,
} from "@/api/lookups";
import { applyServerFieldErrors } from "@/auth/form-utils";
import type { DataTableColumn } from "@/components/data-table";
import { DataTable } from "@/components/data-table";
import { FormDialog } from "@/components/form-dialog";
import { FormError } from "@/components/forms/form-fields";
import { FormSelectField } from "@/components/forms/tanstack-fields";
import { MediaThumb } from "@/components/media-thumb";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import {
  formatCurrency,
  formatCompactDateTime,
  formatDateTime,
  formatDurationMinutes,
  getDurationMinutes,
  getElapsedMinutes,
} from "@/lib/format";
import { getOpenTickets, getSpaceStatus, isTicketOpen } from "@/lib/parking";
import type { SortState } from "@/lib/table";
import { ticketCreateSchema } from "@/lib/validation";

const PAGE_SIZE = 10;

type TicketFilter = "open" | "closed" | "all";

const FILTER_LABEL: Record<TicketFilter, string> = {
  open: "Abertos",
  closed: "Encerrados",
  all: "Todos",
};

const DATE_SORT_FIELDS = new Set(["entryTime", "exitTime"]);

const collator = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });

function compareTickets(
  first: TicketResponseDTO,
  second: TicketResponseDTO,
  sort: SortState,
): number {
  const isDate = DATE_SORT_FIELDS.has(sort.field);
  const left = isDate
    ? new Date(first[sort.field as "entryTime" | "exitTime"] ?? 0).getTime()
    : (first[sort.field as keyof TicketResponseDTO] ?? "");
  const right = isDate
    ? new Date(second[sort.field as "entryTime" | "exitTime"] ?? 0).getTime()
    : (second[sort.field as keyof TicketResponseDTO] ?? "");

  if (typeof left === "number" && typeof right === "number") {
    return sort.direction === "asc" ? left - right : right - left;
  }

  const result = collator.compare(String(left), String(right));
  return sort.direction === "asc" ? result : -result;
}

export const Route = createFileRoute("/admin/tickets")({
  component: TicketsPage,
});

function TicketsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<TicketFilter>("open");
  const [sort, setSort] = useState<SortState>({ field: "entryTime", direction: "desc" });
  const [createOpen, setCreateOpen] = useState(false);
  const [createFormError, setCreateFormError] = useState<string | null>(null);

  const tickets = useAllTickets();
  const vehicles = useAllVehicles();
  const spaces = useAllParkingSpaces();
  const tariffs = useAllTariffs();
  const payments = useAllPayments();

  const openTickets = useMemo(() => getOpenTickets(tickets.items), [tickets.items]);
  const paymentsByTicket = useMemo(() => {
    const map = new Map<number, boolean>();
    for (const payment of payments.items) {
      if (payment.ticketId === undefined || payment.active === false) {
        continue;
      }
      map.set(payment.ticketId, true);
    }
    return map;
  }, [payments.items]);

  const filteredTickets = useMemo(() => {
    if (filter === "open") {
      return tickets.items.filter(isTicketOpen);
    }
    if (filter === "closed") {
      return tickets.items.filter((ticket) => !isTicketOpen(ticket));
    }
    return tickets.items;
  }, [tickets.items, filter]);

  const filterCounts = useMemo(() => {
    const open = tickets.items.filter(isTicketOpen).length;
    return { open, closed: tickets.items.length - open, all: tickets.items.length };
  }, [tickets.items]);

  const sortedTickets = useMemo(
    () => [...filteredTickets].sort((first, second) => compareTickets(first, second, sort)),
    [filteredTickets, sort],
  );

  const totalPages = Math.max(1, Math.ceil(sortedTickets.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = sortedTickets.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const createMutation = useRegisterTicket({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

  const createForm = useForm({
    defaultValues: {
      vehicleId: "" as string | number,
      parkingSpaceId: "" as string | number,
      tariffId: "" as string | number,
    },
    validators: {
      onChange: ticketCreateSchema,
      onSubmit: ticketCreateSchema,
    },
    listeners: {
      onChange: () => setCreateFormError(null),
    },
    onSubmit: async ({ value, formApi }) => {
      setCreateFormError(null);
      const parsed = ticketCreateSchema.safeParse(value);
      if (!parsed.success) {
        return;
      }

      try {
        await createMutation.mutateAsync({ data: parsed.data });
        toast.success("Ticket aberto.");
        setCreateOpen(false);
        setFilter("open");
        setPage(0);
        await invalidate();
      } catch (error) {
        applyServerFieldErrors(formApi, error);
        setCreateFormError(getErrorMessage(error));
      }
    },
  });

  useEffect(() => {
    if (!createOpen) {
      return;
    }
    createForm.reset({ vehicleId: "", parkingSpaceId: "", tariffId: "" });
  }, [createOpen, createForm]);

  const createFormSubmitting = useStore(createForm.store, (state) => state.isSubmitting);
  const isSubmitting = createFormSubmitting || createMutation.isPending;

  const vehicleOptions = useMemo(() => {
    const parked = new Set(openTickets.map((ticket) => ticket.vehicleId));
    return vehicles.items.flatMap((vehicle) =>
      vehicle.id !== undefined && !parked.has(vehicle.id)
        ? [
            {
              value: String(vehicle.id),
              label: `${vehicle.licensePlate ?? "—"} · ${vehicle.model ?? "Sem modelo"}`,
            },
          ]
        : [],
    );
  }, [vehicles.items, openTickets]);

  const spaceOptions = useMemo(
    () =>
      spaces.items.flatMap((space) =>
        space.id !== undefined && getSpaceStatus(space, openTickets) === "AVAILABLE"
          ? [
              {
                value: String(space.id),
                label: `${space.code ?? "—"} · ${space.parkingSpaceTypeName ?? "Sem tipo"}`,
              },
            ]
          : [],
      ),
    [spaces.items, openTickets],
  );

  const tariffOptions = useMemo(
    () =>
      tariffs.items.flatMap((tariff) =>
        tariff.id !== undefined
          ? [
              {
                value: String(tariff.id),
                label: `${tariff.description ?? "Tarifa"} · ${formatCurrency(tariff.firstHourRate)} / 1ª hora`,
              },
            ]
          : [],
      ),
    [tariffs.items],
  );

  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListParkingSpacesQueryKey() }),
      queryClient.invalidateQueries({
        queryKey: getListAvailableParkingSpacesQueryKey(),
      }),
      queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() }),
    ]);
  }

  function openCreate() {
    createForm.reset({ vehicleId: "", parkingSpaceId: "", tariffId: "" });
    setCreateFormError(null);
    setCreateOpen(true);
  }

  const columns: DataTableColumn<TicketResponseDTO>[] = [
    {
      id: "id",
      header: "Ticket",
      sortField: "id",
      cell: (ticket) => (
        <div className="flex items-center gap-3">
          <MediaThumb icon={Ticket01Icon} size="sm" />
          <div className="grid gap-0.5">
            <span className="font-medium">#{ticket.id ?? "—"}</span>
            {ticket.qrCodeToken ? (
              <span
                className="max-w-[14ch] truncate font-mono text-xs text-muted-foreground"
                title={ticket.qrCodeToken}
              >
                {ticket.qrCodeToken}
              </span>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      id: "licensePlate",
      header: "Placa",
      sortField: "licensePlate",
      cell: (ticket) => <span className="font-mono font-medium">{ticket.licensePlate ?? "—"}</span>,
    },
    {
      id: "parkingSpaceCode",
      header: "Vaga",
      sortField: "parkingSpaceCode",
      cell: (ticket) => ticket.parkingSpaceCode ?? "—",
    },
    {
      id: "tariffDescription",
      header: "Tarifa",
      sortField: "tariffDescription",
      cell: (ticket) => (
        <span className="text-muted-foreground">{ticket.tariffDescription ?? "—"}</span>
      ),
    },
    {
      id: "entryTime",
      header: "Entrada",
      sortField: "entryTime",
      cell: (ticket) => (
        <span className="text-muted-foreground">{formatDateTime(ticket.entryTime)}</span>
      ),
    },
    {
      id: "exitTime",
      header: "Saída",
      sortField: "exitTime",
      cell: (ticket) => (
        <span className="text-muted-foreground">
          {ticket.exitTime ? formatDateTime(ticket.exitTime) : "Em aberto"}
        </span>
      ),
    },
    {
      id: "duration",
      header: "Duração",
      headerClassName: "text-right",
      className: "text-right",
      cell: (ticket) => {
        const minutes = isTicketOpen(ticket)
          ? getElapsedMinutes(ticket.entryTime)
          : getDurationMinutes(ticket.entryTime, ticket.exitTime);
        return <span className="tabular-nums">{formatDurationMinutes(minutes)}</span>;
      },
    },
    {
      id: "status",
      header: "Situação",
      cell: (ticket) => {
        const open = isTicketOpen(ticket);
        const paid = ticket.id !== undefined && (paymentsByTicket.get(ticket.id) ?? false);
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge tone={open ? "warning" : "neutral"}>
              {open ? "Aberto" : "Encerrado"}
            </StatusBadge>
            <StatusBadge tone={paid ? "success" : "info"}>{paid ? "Pago" : "Pendente"}</StatusBadge>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tickets"
        description="Acompanhe as sessões abertas e pagas do estacionamento."
        actions={
          <Button onClick={openCreate}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            Abrir ticket
          </Button>
        }
      />

      <div
        className="flex flex-wrap items-center gap-1.5"
        role="tablist"
        aria-label="Filtrar tickets"
      >
        {(Object.keys(FILTER_LABEL) as TicketFilter[]).map((value) => (
          <Button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            variant={filter === value ? "ink" : "outline"}
            size="sm"
            className="h-11 rounded-full sm:h-8"
            onClick={() => {
              setFilter(value);
              setPage(0);
            }}
          >
            {FILTER_LABEL[value]}
            <span
              className={
                filter === value
                  ? "rounded-full bg-white/15 px-1.5 text-xs tabular-nums"
                  : "rounded-full bg-muted px-1.5 text-xs text-muted-foreground tabular-nums"
              }
            >
              {filterCounts[value]}
            </span>
          </Button>
        ))}
      </div>

      {tickets.hasMore ? (
        <p className="text-sm text-muted-foreground">
          Exibindo os primeiros {tickets.items.length} de {tickets.total} tickets. Refine a operação
          para encontrar registros mais antigos.
        </p>
      ) : null}

      <section className="rounded-2xl bg-secondary p-2">
        <DataTable
          columns={columns}
          rows={pageRows}
          getRowId={(ticket) => ticket.id ?? ticket.qrCodeToken ?? "unknown"}
          isLoading={tickets.query.isPending}
          error={tickets.query.error}
          onRetry={() => void tickets.query.refetch()}
          sort={sort}
          onSortChange={(nextSort) => {
            setSort(nextSort);
            setPage(0);
          }}
          mobileRow={(ticket) => {
            const open = isTicketOpen(ticket);
            const paid = ticket.id !== undefined && (paymentsByTicket.get(ticket.id) ?? false);
            const minutes = open
              ? getElapsedMinutes(ticket.entryTime)
              : getDurationMinutes(ticket.entryTime, ticket.exitTime);
            return (
              <div className="flex gap-4 px-2 py-6">
                <MediaThumb icon={Ticket01Icon} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate text-base leading-6 font-medium">
                      #{ticket.id ?? "—"} · {ticket.licensePlate ?? "—"}
                    </h3>
                  </div>
                  <p className="truncate text-[13px] leading-[18px] text-muted-foreground">
                    Vaga {ticket.parkingSpaceCode ?? "—"} · Entrada{" "}
                    {formatCompactDateTime(ticket.entryTime)}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge tone={open ? "warning" : "neutral"}>
                        {open ? "Aberto" : "Encerrado"}
                      </StatusBadge>
                      <StatusBadge tone={paid ? "success" : "info"}>
                        {paid ? "Pago" : "Pendente"}
                      </StatusBadge>
                    </div>
                    <span className="shrink-0 text-base leading-6 font-medium tabular-nums">
                      {formatDurationMinutes(minutes)}
                    </span>
                  </div>
                </div>
              </div>
            );
          }}
          emptyIcon={<HugeiconsIcon icon={Ticket01Icon} strokeWidth={2} className="size-5" />}
          emptyTitle={
            filter === "open"
              ? "Nenhum ticket aberto"
              : filter === "closed"
                ? "Nenhum ticket encerrado"
                : "Nenhum ticket registrado"
          }
          emptyDescription="Abra um ticket para iniciar uma sessão de estacionamento."
          footer={
            <Pagination
              page={safePage}
              pageSize={PAGE_SIZE}
              totalElements={sortedTickets.length}
              totalPages={totalPages}
              onPageChange={setPage}
              isFetching={tickets.query.isFetching}
            />
          }
        />
      </section>

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Abrir ticket"
        description="Selecione um veículo livre, uma vaga disponível e a tarifa aplicada."
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void createForm.handleSubmit();
        }}
        submitLabel="Abrir ticket"
        isSubmitting={isSubmitting}
      >
        <FormError message={createFormError} />
        <createForm.Field name="vehicleId">
          {(field) => (
            <FormSelectField
              field={field}
              id="ticket-vehicle"
              label="Veículo"
              options={vehicleOptions}
              placeholder={
                vehicles.query.isPending ? "Carregando veículos..." : "Selecione o veículo"
              }
              description={
                vehicleOptions.length === 0
                  ? "Todos os veículos cadastrados já estão em uma sessão aberta."
                  : undefined
              }
            />
          )}
        </createForm.Field>
        <createForm.Field name="parkingSpaceId">
          {(field) => (
            <FormSelectField
              field={field}
              id="ticket-space"
              label="Vaga"
              options={spaceOptions}
              placeholder={spaces.query.isPending ? "Carregando vagas..." : "Selecione a vaga"}
              description={
                spaceOptions.length === 0
                  ? "Não há vagas disponíveis no momento."
                  : "Somente vagas livres e não bloqueadas aparecem aqui."
              }
            />
          )}
        </createForm.Field>
        <createForm.Field name="tariffId">
          {(field) => (
            <FormSelectField
              field={field}
              id="ticket-tariff"
              label="Tarifa"
              options={tariffOptions}
              placeholder={tariffs.query.isPending ? "Carregando tarifas..." : "Selecione a tarifa"}
            />
          )}
        </createForm.Field>
      </FormDialog>
    </div>
  );
}
