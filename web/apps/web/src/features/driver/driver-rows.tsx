import { Skeleton } from "@web/ui/components/skeleton";
import { Button } from "@web/ui/components/button";
import { CreditCardIcon, Ticket01Icon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";

import type { PaymentResponseDTO, TicketResponseDTO } from "@/api/generated";
import { MediaThumb } from "@/components/media-thumb";
import { StatusBadge } from "@/components/status-badge";
import {
  formatCompactDateTime,
  formatCurrency,
  formatDurationMinutes,
  getDurationMinutes,
  getElapsedMinutes,
} from "@/lib/format";
import { isTicketOpen } from "@/lib/parking";

export function SessionRow({
  ticket,
  paid,
  onPay,
}: {
  ticket: TicketResponseDTO;
  paid: boolean;
  onPay: () => void;
}) {
  const open = isTicketOpen(ticket);
  const minutes = open
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
          Vaga {ticket.parkingSpaceCode ?? "—"} · Entrada {formatCompactDateTime(ticket.entryTime)}
        </p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {open ? (
              <StatusBadge tone="warning">Em andamento</StatusBadge>
            ) : (
              <StatusBadge tone={paid ? "success" : "info"}>
                {paid ? "Pago" : "Pendente"}
              </StatusBadge>
            )}
            {!paid ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="relative h-8 rounded-full px-2 after:absolute after:-inset-1.5"
                onClick={onPay}
              >
                {open ? "Pagar e sair" : "Pagar"}
              </Button>
            ) : null}
          </div>
          <span className="shrink-0 text-base leading-6 font-medium tabular-nums">
            {formatDurationMinutes(minutes)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PaymentRow({
  payment,
  ticket,
}: {
  payment: PaymentResponseDTO;
  ticket?: TicketResponseDTO;
}) {
  return (
    <div className="flex gap-4 px-2 py-6">
      <MediaThumb icon={CreditCardIcon} />
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="truncate text-base leading-6 font-medium">
          Ticket #{payment.ticketId ?? "—"}
          {ticket?.licensePlate ? ` · ${ticket.licensePlate}` : ""}
        </h3>
        <p className="truncate text-[13px] leading-[18px] text-muted-foreground">
          {ticket?.parkingSpaceCode ? `Vaga ${ticket.parkingSpaceCode} · ` : ""}
          {formatCompactDateTime(payment.paymentDateTime)}
        </p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <StatusBadge tone="success">Pago</StatusBadge>
          <span className="shrink-0 text-base leading-6 font-medium tabular-nums">
            {formatCurrency(payment.amount)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="divide-y divide-border">
        {[0, 1].map((index) => (
          <div key={index} className="flex gap-4 px-2 py-6">
            <Skeleton className="size-[88px] shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectionEmpty({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="space-y-1">
        <p className="text-base leading-6 font-medium">{title}</p>
        <p className="max-w-sm text-[13px] leading-[18px] text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
