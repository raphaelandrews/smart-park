import { Link } from "@tanstack/react-router";
import { Button } from "@web/ui/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowRight01Icon,
  CreditCardIcon,
  SquareParkingIcon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { TicketResponseDTO, VehicleResponseDTO } from "@/api/generated";
import { getListVehiclesQueryKey, useDeactivateVehicle, useGetTicketQuote } from "@/api/generated";
import { useAllPayments, useAllTickets, useAllVehicles } from "@/api/lookups";
import { useAuth } from "@/auth/auth-context";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { InfoStrip } from "@/components/info-strip";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { DriverHeader, DriverQuickActions } from "@/features/driver/driver-chrome";
import {
  DriverPaymentsSection,
  DriverSessionsSection,
  DriverVehiclesSection,
} from "@/features/driver/driver-sections";
import { PaymentDialog } from "@/features/payments/payment-dialog";
import { TicketCreateDialog } from "@/features/tickets/ticket-create-dialog";
import { VehicleFormDialog } from "@/features/vehicles/vehicle-form-dialog";
import { cn } from "@web/ui/lib/utils";
import { formatCurrency, formatDurationMinutes, getElapsedMinutes } from "@/lib/format";
import { getRoleLabel } from "@/lib/labels";
import { getOpenTickets, isTicketOpen, isTicketPaid } from "@/lib/parking";

export function DriverPage() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const vehicles = useAllVehicles();
  const tickets = useAllTickets();
  const payments = useAllPayments();

  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VehicleResponseDTO | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentInitialTicketId, setPaymentInitialTicketId] = useState("");
  const [sessionOpen, setSessionOpen] = useState(false);

  const deleteVehicle = useDeactivateVehicle({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

  const openTickets = getOpenTickets(tickets.items);
  const activeTicket = openTickets[0];

  const unpaidTickets = tickets.items
    .filter(
      (ticket) =>
        ticket.id !== undefined &&
        ticket.active !== false &&
        !isTicketPaid(ticket.id, payments.items),
    )
    .sort((first, second) => {
      const openDelta = Number(isTicketOpen(second)) - Number(isTicketOpen(first));
      if (openDelta !== 0) {
        return openDelta;
      }
      return (second.entryTime ?? "").localeCompare(first.entryTime ?? "");
    });

  const pendingTickets = unpaidTickets.filter((ticket) => !isTicketOpen(ticket));

  const activeQuoteQuery = useGetTicketQuote(activeTicket?.id ?? 0, {
    query: {
      enabled: activeTicket?.id !== undefined,
      retry: false,
      refetchInterval: 30_000,
      meta: { skipGlobalErrorToast: true },
    },
  });
  const activeQuote = activeQuoteQuery.data?.data;

  function openNewVehicle() {
    setEditingVehicle(null);
    setVehicleDialogOpen(true);
  }

  function openEditVehicle(vehicle: VehicleResponseDTO) {
    setEditingVehicle(vehicle);
    setVehicleDialogOpen(true);
  }

  function openSession() {
    if (vehicles.items.length === 0) {
      toast.info("Cadastre um veículo antes de abrir uma sessão.");
      openNewVehicle();
      return;
    }
    setSessionOpen(true);
  }

  function openPayment(ticket?: TicketResponseDTO) {
    if (unpaidTickets.length === 0) {
      toast.info("Nenhuma sessão aguardando pagamento.");
      return;
    }

    setPaymentInitialTicketId(String(ticket?.id ?? unpaidTickets[0]?.id));
    setPaymentOpen(true);
  }

  async function handleDeleteVehicle() {
    if (!deleteTarget?.id) {
      return;
    }
    try {
      await deleteVehicle.mutateAsync({ id: deleteTarget.id });
      toast.success("Veículo removido.");
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const roleLabel = getRoleLabel(user?.role);
  const hasBottomBar = Boolean(activeTicket) || pendingTickets.length > 0;

  return (
    <div className="min-h-svh bg-background">
      <DriverHeader />

      <main
        className={cn(
          "mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-6 md:py-8",
          hasBottomBar && "pb-32 md:pb-8",
        )}
      >
        <PageHeader
          title={`Olá, ${user?.name?.split(" ")[0] ?? "motorista"}!`}
          description="Acompanhe seus veículos, sessões e pagamentos em um só lugar."
          actions={
            <>
              <Button onClick={openSession}>
                <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
                Abrir ticket
              </Button>
              <StatusBadge tone={isAdmin ? "brand" : "info"}>{roleLabel}</StatusBadge>
              {isAdmin ? (
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  render={<Link to="/admin" />}
                >
                  Painel administrativo
                </Button>
              ) : null}
            </>
          }
        />

        {activeTicket ? (
          <InfoStrip
            icon={Ticket01Icon}
            title={
              activeQuote
                ? formatCurrency(activeQuote.amount ?? 0)
                : activeQuoteQuery.isFetching
                  ? "Calculando..."
                  : formatDurationMinutes(getElapsedMinutes(activeTicket.entryTime))
            }
            description={`${formatDurationMinutes(
              activeQuote?.durationMinutes ?? getElapsedMinutes(activeTicket.entryTime),
            )} · ${activeTicket.licensePlate ?? "—"} · Vaga ${
              activeTicket.parkingSpaceCode ?? "—"
            }`}
            action={
              <Button
                variant="outline"
                className="hidden h-11 rounded-full bg-card px-5 text-[15px] font-medium shadow-floating md:inline-flex"
                onClick={() => openPayment(activeTicket)}
              >
                Pagar e sair
              </Button>
            }
          />
        ) : pendingTickets.length > 0 ? (
          <InfoStrip
            icon={CreditCardIcon}
            title="Pagamento pendente"
            description={`${pendingTickets.length} ${
              pendingTickets.length === 1 ? "sessão encerrada" : "sessões encerradas"
            } aguardando pagamento`}
            action={
              <Button
                variant="outline"
                className="h-11 rounded-full bg-card px-5 text-[15px] font-medium shadow-floating"
                onClick={() => openPayment(pendingTickets[0])}
              >
                Pagar
              </Button>
            }
          />
        ) : (
          <InfoStrip
            icon={SquareParkingIcon}
            title="Tudo em dia"
            description="Abra uma sessão ao entrar no estacionamento."
            action={
              <Button
                variant="outline"
                className="h-11 rounded-full bg-card px-5 text-[15px] font-medium shadow-floating"
                onClick={openSession}
              >
                Abrir ticket
              </Button>
            }
          />
        )}

        <DriverQuickActions />

        <DriverVehiclesSection
          vehicles={vehicles}
          isAdmin={isAdmin}
          onAdd={openNewVehicle}
          onEdit={openEditVehicle}
          onDelete={setDeleteTarget}
        />

        <DriverSessionsSection
          tickets={tickets}
          payments={payments.items}
          isAdmin={isAdmin}
          onPay={openPayment}
        />

        <DriverPaymentsSection payments={payments} tickets={tickets.items} />
      </main>

      {hasBottomBar ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-32 bg-gradient-to-t from-background via-background/85 to-transparent md:hidden"
          />
          <div className="fixed inset-x-6 bottom-0 z-30 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
            <div className="flex min-h-[60px] items-center gap-4 rounded-2xl bg-ink py-2.5 pr-4 pl-5 text-white shadow-bar">
              {activeTicket ? (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] leading-5 font-medium tabular-nums">
                      {activeQuote ? formatCurrency(activeQuote.amount ?? 0) : "Calculando..."}
                    </p>
                    <p className="truncate text-xs text-white/60">
                      {formatDurationMinutes(
                        activeQuote?.durationMinutes ?? getElapsedMinutes(activeTicket.entryTime),
                      )}{" "}
                      · {activeTicket.licensePlate ?? "—"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 shrink-0 rounded-full px-3 text-[15px] font-medium text-white hover:bg-white/10 hover:text-white"
                    onClick={() => openPayment(activeTicket)}
                  >
                    Pagar e sair
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-5" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] leading-5 font-medium">Pagamento</p>
                    <p className="text-xs text-white/60">
                      {pendingTickets.length}{" "}
                      {pendingTickets.length === 1 ? "sessão encerrada" : "sessões encerradas"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 shrink-0 rounded-full px-3 text-[15px] font-medium text-white hover:bg-white/10 hover:text-white"
                    onClick={() => openPayment(pendingTickets[0])}
                  >
                    Pagar
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      ) : null}

      <TicketCreateDialog open={sessionOpen} onOpenChange={setSessionOpen} />

      <VehicleFormDialog
        open={vehicleDialogOpen}
        onOpenChange={setVehicleDialogOpen}
        vehicle={editingVehicle}
      />

      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        tickets={unpaidTickets}
        initialTicketId={paymentInitialTicketId}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Remover veículo"
        description={`O veículo ${deleteTarget?.licensePlate ?? ""} deixará de aparecer na sua conta. Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        destructive
        isPending={deleteVehicle.isPending}
        onConfirm={handleDeleteVehicle}
      />
    </div>
  );
}
