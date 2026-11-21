import { Button } from "@web/ui/components/button";
import {
  Add01Icon,
  Car01Icon,
  CreditCardIcon,
  Delete02Icon,
  PencilEdit02Icon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { PaymentResponseDTO, TicketResponseDTO, VehicleResponseDTO } from "@/api/generated";
import type { useAllPayments, useAllTickets, useAllVehicles } from "@/api/lookups";
import { toLookupMap } from "@/api/lookups";
import { ErrorState } from "@/components/error-state";
import { MediaThumb } from "@/components/media-thumb";
import { RowActionsMenu } from "@/components/row-actions-menu";
import { SectionHeader } from "@/components/section-header";
import { StatusBadge } from "@/components/status-badge";
import { ListSkeleton, PaymentRow, SectionEmpty, SessionRow } from "@/features/driver/driver-rows";
import { formatCompactDateTime } from "@/lib/format";
import { getVehicleTypeLabel } from "@/lib/labels";
import { isTicketPaid } from "@/lib/parking";

type VehiclesResult = ReturnType<typeof useAllVehicles>;
type TicketsResult = ReturnType<typeof useAllTickets>;
type PaymentsResult = ReturnType<typeof useAllPayments>;

interface VehiclesSectionProps {
  vehicles: VehiclesResult;
  isAdmin: boolean;
  onAdd: () => void;
  onEdit: (vehicle: VehicleResponseDTO) => void;
  onDelete: (vehicle: VehicleResponseDTO) => void;
}

export function DriverVehiclesSection({
  vehicles,
  isAdmin,
  onAdd,
  onEdit,
  onDelete,
}: VehiclesSectionProps) {
  return (
    <section id="veiculos" className="scroll-mt-24 space-y-3">
      <SectionHeader
        title={isAdmin ? "Veículos" : "Meus veículos"}
        description="Cadastre, edite ou remova os veículos da sua conta."
        action={
          <Button size="sm" onClick={onAdd}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            Adicionar
          </Button>
        }
      />

      {vehicles.query.error ? (
        <ErrorState error={vehicles.query.error} onRetry={() => void vehicles.query.refetch()} />
      ) : vehicles.query.isPending ? (
        <ListSkeleton />
      ) : vehicles.items.length === 0 ? (
        <SectionEmpty
          icon={<HugeiconsIcon icon={Car01Icon} strokeWidth={2} className="size-5" />}
          title="Nenhum veículo cadastrado"
          description="Cadastre um veículo para acompanhar suas sessões e pagamentos."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <div className="divide-y divide-border">
            {vehicles.items.map((vehicle) => (
              <div key={vehicle.id ?? vehicle.licensePlate} className="flex gap-4 px-2 py-6">
                <MediaThumb icon={Car01Icon} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate font-mono text-base leading-6 font-medium">
                      {vehicle.licensePlate ?? "—"}
                    </h3>
                    <RowActionsMenu
                      label="Opções do veículo"
                      items={[
                        {
                          label: "Editar",
                          icon: PencilEdit02Icon,
                          onSelect: () => onEdit(vehicle),
                        },
                        {
                          label: "Remover",
                          icon: Delete02Icon,
                          destructive: true,
                          onSelect: () => onDelete(vehicle),
                        },
                      ]}
                    />
                  </div>
                  <p className="text-[13px] leading-[18px] text-muted-foreground">
                    {[vehicle.model, vehicle.color].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <StatusBadge tone="brand">
                      {getVehicleTypeLabel(vehicle.vehicleType)}
                    </StatusBadge>
                    <span className="shrink-0 text-[13px] leading-[18px] text-muted-foreground">
                      {formatCompactDateTime(vehicle.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface SessionsSectionProps {
  tickets: TicketsResult;
  payments: PaymentResponseDTO[];
  isAdmin: boolean;
  onPay: (ticket: TicketResponseDTO) => void;
}

export function DriverSessionsSection({ tickets, payments, isAdmin, onPay }: SessionsSectionProps) {
  return (
    <section id="sessoes" className="scroll-mt-24 space-y-3">
      <SectionHeader
        title={isAdmin ? "Sessões" : "Minhas sessões"}
        description="Abra uma sessão ao entrar e pague para encerrá-la."
      />

      {tickets.query.error ? (
        <ErrorState error={tickets.query.error} onRetry={() => void tickets.query.refetch()} />
      ) : tickets.query.isPending ? (
        <ListSkeleton />
      ) : tickets.items.length === 0 ? (
        <SectionEmpty
          icon={<HugeiconsIcon icon={Ticket01Icon} strokeWidth={2} className="size-5" />}
          title="Nenhuma sessão registrada"
          description="Abra um ticket ao entrar no estacionamento para iniciar uma sessão."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <div className="divide-y divide-border">
            {tickets.items.map((ticket) => (
              <SessionRow
                key={ticket.id ?? ticket.qrCodeToken}
                ticket={ticket}
                paid={ticket.id !== undefined && isTicketPaid(ticket.id, payments)}
                onPay={() => onPay(ticket)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface PaymentsSectionProps {
  payments: PaymentsResult;
  tickets: TicketResponseDTO[];
}

export function DriverPaymentsSection({ payments, tickets }: PaymentsSectionProps) {
  const ticketMap = toLookupMap(tickets);

  return (
    <section id="pagamentos" className="scroll-mt-24 space-y-3">
      <SectionHeader title="Pagamentos" description="Histórico de pagamentos das suas sessões." />

      {payments.query.error ? (
        <ErrorState error={payments.query.error} onRetry={() => void payments.query.refetch()} />
      ) : payments.query.isPending ? (
        <ListSkeleton />
      ) : payments.items.length === 0 ? (
        <SectionEmpty
          icon={<HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} className="size-5" />}
          title="Nenhum pagamento"
          description="Seus pagamentos aparecerão aqui depois que forem registrados."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <div className="divide-y divide-border">
            {payments.items.map((payment) => (
              <PaymentRow
                key={payment.id ?? `${payment.ticketId}-${payment.paymentDateTime}`}
                payment={payment}
                ticket={
                  payment.ticketId !== undefined ? ticketMap.get(payment.ticketId) : undefined
                }
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
