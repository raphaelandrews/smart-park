import { Link } from "@tanstack/react-router";
import { Button } from "@web/ui/components/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@web/ui/components/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Car01Icon,
  ChevronRightIcon,
  CreditCardIcon,
  SquareParkingIcon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";
import { useMemo } from "react";

import type { TicketResponseDTO } from "@/api/generated";
import { useAllParkingSpaces, useAllPayments, useAllTickets } from "@/api/lookups";
import type { DataTableColumn } from "@/components/data-table";
import { DataTable } from "@/components/data-table";
import { InfoStrip } from "@/components/info-strip";
import { MediaThumb } from "@/components/media-thumb";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { StatusBadge } from "@/components/status-badge";
import {
  formatCompactDateTime,
  formatCurrency,
  formatDateTime,
  formatDurationMinutes,
  formatNumber,
  getDurationMinutes,
  getElapsedMinutes,
  parseApiDateTime,
} from "@/lib/format";
import { getOpenTickets, getSpaceStatus, isTicketOpen, isTicketPaid } from "@/lib/parking";

const quickActions = [
  {
    title: "Abrir ticket",
    description: "Inicie uma nova sessão",
    to: "/admin/tickets",
    icon: Ticket01Icon,
  },
  {
    title: "Pagamento",
    description: "Feche uma cobrança",
    to: "/admin/payments",
    icon: CreditCardIcon,
  },
  {
    title: "Vagas",
    description: "Disponibilidade e bloqueios",
    to: "/admin/parking-spaces",
    icon: SquareParkingIcon,
  },
  {
    title: "Veículo",
    description: "Adicione à frota",
    to: "/admin/vehicles",
    icon: Car01Icon,
  },
] as const;

export function DashboardPage() {
  const spaces = useAllParkingSpaces();
  const tickets = useAllTickets();
  const payments = useAllPayments();

  const openTickets = useMemo(() => getOpenTickets(tickets.items), [tickets.items]);

  const occupied = useMemo(
    () => spaces.items.filter((space) => getSpaceStatus(space, openTickets) === "OCCUPIED").length,
    [spaces.items, openTickets],
  );

  const revenueToday = useMemo(() => {
    const today = new Date().toDateString();
    return payments.items
      .filter((payment) => {
        if (payment.active === false) {
          return false;
        }
        const date = parseApiDateTime(payment.paymentDateTime);
        return date ? date.toDateString() === today : false;
      })
      .reduce((total, payment) => total + (payment.amount ?? 0), 0);
  }, [payments.items]);

  const stats = [
    {
      label: "Vagas",
      value: formatNumber(spaces.total),
      hint: "cadastradas",
      icon: SquareParkingIcon,
    },
    {
      label: "Ocupadas",
      value: formatNumber(occupied),
      hint:
        spaces.total > 0 ? `${Math.round((occupied / spaces.total) * 100)}% ocupadas` : "sem vagas",
      icon: Car01Icon,
    },
    {
      label: "Tickets",
      value: formatNumber(openTickets.length),
      hint: "ativas",
      icon: Ticket01Icon,
    },
    {
      label: "Receita hoje",
      value: formatCurrency(revenueToday),
      hint: "recebidos",
      icon: CreditCardIcon,
    },
  ] as const;

  const recentTickets = tickets.items.slice(0, 5);

  const columns: DataTableColumn<TicketResponseDTO>[] = [
    {
      id: "id",
      header: "Ticket",
      cell: (ticket) => (
        <div className="flex items-center gap-3">
          <MediaThumb icon={Ticket01Icon} size="sm" />
          <span className="font-medium">#{ticket.id ?? "—"}</span>
        </div>
      ),
    },
    {
      id: "licensePlate",
      header: "Placa",
      cell: (ticket) => <span className="font-mono font-medium">{ticket.licensePlate ?? "—"}</span>,
    },
    {
      id: "parkingSpaceCode",
      header: "Vaga",
      cell: (ticket) => ticket.parkingSpaceCode ?? "—",
    },
    {
      id: "entryTime",
      header: "Entrada",
      cell: (ticket) => (
        <span className="text-muted-foreground">{formatDateTime(ticket.entryTime)}</span>
      ),
    },
    {
      id: "status",
      header: "Situação",
      cell: (ticket) => {
        const open = isTicketOpen(ticket);
        const paid = ticket.id !== undefined && isTicketPaid(ticket.id, payments.items);
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
        title="Visão geral"
        description="O resumo da operação do estacionamento hoje."
        actions={
          <Button nativeButton={false} render={<Link to="/admin/tickets" />}>
            <HugeiconsIcon icon={Ticket01Icon} strokeWidth={2} className="size-4" />
            Abrir ticket
          </Button>
        }
      />

      <InfoStrip
        icon={Ticket01Icon}
        title={
          openTickets.length === 0
            ? "Sem sessões"
            : openTickets.length === 1
              ? "Sessão ativa"
              : "Sessões ativas"
        }
        description={
          openTickets.length === 0
            ? `${formatNumber(occupied)} de ${formatNumber(spaces.total)} vagas ocupadas agora`
            : `${formatNumber(openTickets.length)} em andamento · ${formatNumber(occupied)} de ${formatNumber(spaces.total)} vagas ocupadas`
        }
        action={
          <Button
            variant="outline"
            className="h-11 rounded-full bg-card px-5 text-[15px] font-medium shadow-floating"
            nativeButton={false}
            render={<Link to="/admin/tickets" />}
            aria-label="Ver tickets"
          >
            Ver
          </Button>
        }
      />

      <section className="rounded-2xl bg-secondary p-2">
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} size="sm">
              <CardHeader>
                <CardDescription className="text-xs font-medium">{stat.label}</CardDescription>
                <CardTitle className="text-2xl font-medium tabular-nums">{stat.value}</CardTitle>
                <CardDescription className="text-[13px] leading-[18px]">
                  {stat.hint}
                </CardDescription>
                <CardAction>
                  <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <HugeiconsIcon icon={stat.icon} strokeWidth={2} className="size-5" />
                  </span>
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeader title="Ações rápidas" description="Atalhos para a operação do dia." />
        <div className="-mr-6 flex snap-x gap-3 overflow-x-auto pb-2 pl-2 pr-6 [scrollbar-width:none] lg:mr-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group w-[168px] shrink-0 snap-start rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50 lg:w-auto"
            >
              <div className="flex items-start justify-between">
                <span className="flex size-[72px] shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary-100 group-hover:text-primary-900">
                  <HugeiconsIcon icon={action.icon} strokeWidth={2} className="size-6" />
                </span>
                <HugeiconsIcon
                  icon={ChevronRightIcon}
                  strokeWidth={2}
                  className="mt-1 size-5 shrink-0 text-muted-foreground"
                />
              </div>
              <span className="mt-3 block truncate text-base leading-6 font-medium">
                {action.title}
              </span>
              <span className="block text-[13px] leading-[18px] text-muted-foreground">
                {action.description}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Sessões recentes"
          description="Últimos tickets registrados no estacionamento."
          action={
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-md text-muted-foreground"
              nativeButton={false}
              render={<Link to="/admin/tickets" />}
              aria-label="Ver todas as sessões"
            >
              <HugeiconsIcon icon={ChevronRightIcon} strokeWidth={2} className="size-5" />
            </Button>
          }
        />
        <DataTable
          columns={columns}
          rows={recentTickets}
          getRowId={(ticket) => ticket.id ?? ticket.qrCodeToken ?? "unknown"}
          isLoading={tickets.query.isPending}
          error={tickets.query.error}
          onRetry={() => void tickets.query.refetch()}
          mobileRow={(ticket) => {
            const open = isTicketOpen(ticket);
            const paid = ticket.id !== undefined && isTicketPaid(ticket.id, payments.items);
            const minutes = isTicketOpen(ticket)
              ? getElapsedMinutes(ticket.entryTime)
              : getDurationMinutes(ticket.entryTime, ticket.exitTime);
            return (
              <div className="flex gap-4 px-2 py-6">
                <MediaThumb icon={Ticket01Icon} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="truncate text-base leading-6 font-medium">
                    #{ticket.id ?? "—"} · {ticket.licensePlate ?? "—"}
                  </h3>
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
          emptyTitle="Nenhuma sessão registrada"
          emptyDescription="Abra o primeiro ticket para começar a operar."
        />
      </section>
    </div>
  );
}
