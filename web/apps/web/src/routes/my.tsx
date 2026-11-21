import { Link, createFileRoute } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@web/ui/components/avatar";
import { Button } from "@web/ui/components/button";
import { Skeleton } from "@web/ui/components/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowRight01Icon,
  Car01Icon,
  ChevronRightIcon,
  CreditCardIcon,
  Delete02Icon,
  Logout01Icon,
  PencilEdit02Icon,
  SquareParkingIcon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/errors";
import type { PaymentResponseDTO, TicketResponseDTO, VehicleResponseDTO } from "@/api/generated";
import {
  getListAvailableParkingSpacesQueryKey,
  getListPaymentsQueryKey,
  getListTicketsQueryKey,
  getListVehiclesQueryKey,
  useDeactivateVehicle,
  useGetTicketQuote,
  useRegisterPayment,
  useRegisterTicket,
  useRegisterVehicle,
  useUpdateVehicle,
} from "@/api/generated";
import {
  toLookupMap,
  useAllPayments,
  useAllTariffs,
  useAllTickets,
  useAllVehicles,
  useAvailableParkingSpaces,
} from "@/api/lookups";
import { useAuth } from "@/auth/auth-context";
import { applyServerFieldErrors } from "@/auth/form-utils";
import { requireAuthenticated } from "@/auth/session";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormDialog } from "@/components/form-dialog";
import { FormError } from "@/components/forms/form-fields";
import { FormSelectField, FormTextField } from "@/components/forms/tanstack-fields";
import { InfoStrip } from "@/components/info-strip";
import { MediaThumb } from "@/components/media-thumb";
import { PageHeader } from "@/components/page-header";
import { PaymentQuote } from "@/components/payment-quote";
import { SectionHeader } from "@/components/section-header";
import { StatusBadge } from "@/components/status-badge";
import { RowActionsMenu } from "@/components/row-actions-menu";
import { ErrorState } from "@/components/error-state";
import { cn } from "@web/ui/lib/utils";
import {
  formatCompactDateTime,
  formatCurrency,
  formatDateTime,
  formatDurationMinutes,
  getDurationMinutes,
  getElapsedMinutes,
} from "@/lib/format";
import { getInitials, getRoleLabel, getVehicleTypeLabel, VEHICLE_TYPE_LABEL } from "@/lib/labels";
import { getOpenTickets, isTicketOpen, isTicketPaid } from "@/lib/parking";
import {
  licensePlateSchema,
  paymentCreateSchema,
  ticketCreateSchema,
  vehicleCreateSchema,
  vehicleUpdateSchema,
} from "@/lib/validation";

export const Route = createFileRoute("/my")({
  beforeLoad: requireAuthenticated,
  component: MyHomePage,
});

const vehicleTypeOptions = Object.entries(VEHICLE_TYPE_LABEL).map(([value, label]) => ({
  value,
  label,
}));

const quickActions = [
  {
    title: "Meus veículos",
    description: "Gerencie placas e modelos",
    href: "#veiculos",
    icon: Car01Icon,
  },
  {
    title: "Sessões",
    description: "Acompanhe entradas e saídas",
    href: "#sessoes",
    icon: Ticket01Icon,
  },
  {
    title: "Pagamentos",
    description: "Histórico e pendências",
    href: "#pagamentos",
    icon: CreditCardIcon,
  },
] as const;

function MyHomePage() {
  const { user, isAdmin, logout } = useAuth();
  const queryClient = useQueryClient();

  const vehicles = useAllVehicles();
  const tickets = useAllTickets();
  const payments = useAllPayments();
  const availableSpaces = useAvailableParkingSpaces();
  const tariffs = useAllTariffs();

  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VehicleResponseDTO | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentInitialTicketId, setPaymentInitialTicketId] = useState("");
  const [sessionOpen, setSessionOpen] = useState(false);

  const [vehicleFormError, setVehicleFormError] = useState<string | null>(null);
  const [paymentFormError, setPaymentFormError] = useState<string | null>(null);
  const [sessionFormError, setSessionFormError] = useState<string | null>(null);

  const createVehicle = useRegisterVehicle({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });
  const updateVehicle = useUpdateVehicle({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });
  const deleteVehicle = useDeactivateVehicle({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });
  const registerPayment = useRegisterPayment({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });
  const registerTicket = useRegisterTicket({
    mutation: { meta: { skipGlobalErrorToast: true } },
  });

  const openTickets = getOpenTickets(tickets.items);
  const activeTicket = openTickets[0];
  const ticketMap = toLookupMap(tickets.items);

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

  const unpaidTicketOptions = unpaidTickets.flatMap((ticket) =>
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

  const vehicleForm = useForm({
    defaultValues: {
      licensePlate: "",
      model: "",
      color: "",
      vehicleType: "CAR" as NonNullable<VehicleResponseDTO["vehicleType"]>,
    },
    listeners: {
      onChange: () => setVehicleFormError(null),
    },
    onSubmit: async ({ value, formApi }) => {
      setVehicleFormError(null);

      try {
        if (editingVehicle) {
          const parsed = vehicleUpdateSchema.safeParse(value);
          if (!parsed.success) {
            return;
          }
          await updateVehicle.mutateAsync({
            id: editingVehicle.id as number,
            data: parsed.data,
          });
          toast.success("Veículo atualizado.");
          setVehicleDialogOpen(false);
          await queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
          return;
        }

        const parsed = vehicleCreateSchema.safeParse(value);
        if (!parsed.success) {
          return;
        }
        await createVehicle.mutateAsync({ data: parsed.data });
        toast.success("Veículo cadastrado.");
        setVehicleDialogOpen(false);
        await queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
      } catch (error) {
        applyServerFieldErrors(formApi, error);
        setVehicleFormError(getErrorMessage(error));
      }
    },
  });

  const sessionForm = useForm({
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
      onChange: () => setSessionFormError(null),
    },
    onSubmit: async ({ value, formApi }) => {
      setSessionFormError(null);
      const parsed = ticketCreateSchema.safeParse(value);
      if (!parsed.success) {
        return;
      }

      try {
        await registerTicket.mutateAsync({ data: parsed.data });
        toast.success("Sessão aberta.");
        setSessionOpen(false);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() }),
          queryClient.invalidateQueries({
            queryKey: getListAvailableParkingSpacesQueryKey(),
          }),
        ]);
      } catch (error) {
        applyServerFieldErrors(formApi, error);
        setSessionFormError(getErrorMessage(error));
      }
    },
  });

  const paymentForm = useForm({
    defaultValues: {
      ticketId: "" as string | number,
    },
    listeners: {
      onChange: () => setPaymentFormError(null),
    },
    validators: {
      onChange: paymentCreateSchema,
      onSubmit: paymentCreateSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      setPaymentFormError(null);
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
        setPaymentOpen(false);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() }),
          queryClient.invalidateQueries({
            queryKey: getListAvailableParkingSpacesQueryKey(),
          }),
        ]);
      } catch (error) {
        applyServerFieldErrors(formApi, error);
        setPaymentFormError(getErrorMessage(error));
      }
    },
  });

  useEffect(() => {
    if (!sessionOpen) {
      return;
    }
    sessionForm.reset({ vehicleId: "", parkingSpaceId: "", tariffId: "" });
  }, [sessionOpen, sessionForm]);

  useEffect(() => {
    if (!vehicleDialogOpen) {
      return;
    }
    vehicleForm.reset(
      editingVehicle
        ? {
            licensePlate: editingVehicle.licensePlate ?? "",
            model: editingVehicle.model ?? "",
            color: editingVehicle.color ?? "",
            vehicleType: editingVehicle.vehicleType ?? "CAR",
          }
        : {
            licensePlate: "",
            model: "",
            color: "",
            vehicleType: "CAR",
          },
    );
  }, [vehicleDialogOpen, editingVehicle, vehicleForm]);

  const vehicleFormSubmitting = useStore(vehicleForm.store, (state) => state.isSubmitting);
  const paymentFormSubmitting = useStore(paymentForm.store, (state) => state.isSubmitting);
  const isVehicleSubmitting =
    vehicleFormSubmitting || createVehicle.isPending || updateVehicle.isPending;
  const isPaymentSubmitting = paymentFormSubmitting || registerPayment.isPending;
  const paymentTicketId = useStore(paymentForm.store, (state) => state.values.ticketId);
  const paymentQuoteId =
    paymentTicketId === "" || paymentTicketId === undefined ? null : Number(paymentTicketId);
  const paymentQuoteQuery = useGetTicketQuote(paymentQuoteId ?? 0, {
    query: {
      enabled: paymentQuoteId !== null && !Number.isNaN(paymentQuoteId),
      retry: false,
      meta: { skipGlobalErrorToast: true },
    },
  });
  const paymentQuote = paymentQuoteQuery.data?.data;
  const selectedPaymentTicket =
    paymentTicketId === "" ? undefined : ticketMap.get(Number(paymentTicketId));

  const parkedVehicleIds = new Set(
    openTickets.flatMap((ticket) => (ticket.vehicleId !== undefined ? [ticket.vehicleId] : [])),
  );
  const sessionVehicleOptions = vehicles.items.flatMap((vehicle) =>
    vehicle.id !== undefined && !parkedVehicleIds.has(vehicle.id)
      ? [
          {
            value: String(vehicle.id),
            label: `${vehicle.licensePlate ?? "—"} · ${vehicle.model ?? "Sem modelo"}`,
          },
        ]
      : [],
  );
  const sessionSpaceOptions = availableSpaces.items.flatMap((space) =>
    space.id !== undefined
      ? [
          {
            value: String(space.id),
            label: `${space.code ?? "—"} · ${space.parkingSpaceTypeName ?? "Sem tipo"}`,
          },
        ]
      : [],
  );
  const sessionTariffOptions = tariffs.items.flatMap((tariff) =>
    tariff.id !== undefined
      ? [
          {
            value: String(tariff.id),
            label: `${tariff.description ?? "Tarifa"} · ${formatCurrency(tariff.firstHourRate)} / 1ª hora`,
          },
        ]
      : [],
  );
  const sessionSubmitting = useStore(sessionForm.store, (state) => state.isSubmitting);
  const isSessionSubmitting = sessionSubmitting || registerTicket.isPending;

  useEffect(() => {
    if (!paymentOpen) {
      return;
    }
    const timer = window.setTimeout(() => {
      paymentForm.reset();
      paymentForm.setFieldValue("ticketId", paymentInitialTicketId);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [paymentOpen, paymentInitialTicketId, paymentForm]);

  function openNewVehicle() {
    setEditingVehicle(null);
    vehicleForm.reset({
      licensePlate: "",
      model: "",
      color: "",
      vehicleType: "CAR",
    });
    setVehicleFormError(null);
    setVehicleDialogOpen(true);
  }

  function openEditVehicle(vehicle: VehicleResponseDTO) {
    setEditingVehicle(vehicle);
    vehicleForm.reset({
      licensePlate: vehicle.licensePlate ?? "",
      model: vehicle.model ?? "",
      color: vehicle.color ?? "",
      vehicleType: vehicle.vehicleType ?? "CAR",
    });
    setVehicleFormError(null);
    setVehicleDialogOpen(true);
  }

  function openSession() {
    if (vehicles.items.length === 0) {
      toast.info("Cadastre um veículo antes de abrir uma sessão.");
      openNewVehicle();
      return;
    }
    sessionForm.reset({ vehicleId: "", parkingSpaceId: "", tariffId: "" });
    setSessionFormError(null);
    setSessionOpen(true);
  }

  function openPayment(ticket?: TicketResponseDTO) {
    if (unpaidTickets.length === 0) {
      toast.info("Nenhuma sessão aguardando pagamento.");
      return;
    }

    setPaymentInitialTicketId(String(ticket?.id ?? unpaidTickets[0]?.id));
    setPaymentFormError(null);
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
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between gap-3 px-6">
          <span className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-ink text-primary">
              <HugeiconsIcon icon={SquareParkingIcon} strokeWidth={2} className="size-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-medium">Smart Park</span>
              <span className="block text-xs text-muted-foreground">Área do motorista</span>
            </span>
          </span>

          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-5 font-medium">{user?.name ?? "Motorista"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Avatar size="lg">
              {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name ?? ""} /> : null}
              <AvatarFallback className="bg-primary-100 text-primary-900">
                {getInitials(user?.name, user?.email)}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 rounded-full bg-card shadow-floating sm:size-10"
              aria-label="Sair"
              onClick={() => void logout()}
            >
              <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-4" />
            </Button>
          </div>
        </div>
      </header>

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

        <section className="space-y-5">
          <SectionHeader title="Atalhos" description="Acesso rápido para o que você precisa." />
          <div className="-mr-6 flex snap-x gap-3 overflow-x-auto pb-2 pl-2 pr-6 [scrollbar-width:none] lg:mr-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
            {quickActions.map((action) => (
              <a
                key={action.href}
                href={action.href}
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
              </a>
            ))}
          </div>
        </section>

        <section id="veiculos" className="scroll-mt-24 space-y-3">
          <SectionHeader
            title={isAdmin ? "Veículos" : "Meus veículos"}
            description="Cadastre, edite ou remova os veículos da sua conta."
            action={
              <Button size="sm" onClick={openNewVehicle}>
                <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
                Adicionar
              </Button>
            }
          />

          {vehicles.query.error ? (
            <ErrorState
              error={vehicles.query.error}
              onRetry={() => void vehicles.query.refetch()}
            />
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
                              onSelect: () => openEditVehicle(vehicle),
                            },
                            {
                              label: "Remover",
                              icon: Delete02Icon,
                              destructive: true,
                              onSelect: () => setDeleteTarget(vehicle),
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
                    paid={ticket.id !== undefined && isTicketPaid(ticket.id, payments.items)}
                    onPay={() => openPayment(ticket)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <section id="pagamentos" className="scroll-mt-24 space-y-3">
          <SectionHeader
            title="Pagamentos"
            description="Histórico de pagamentos das suas sessões."
          />

          {payments.query.error ? (
            <ErrorState
              error={payments.query.error}
              onRetry={() => void payments.query.refetch()}
            />
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

      <FormDialog
        open={sessionOpen}
        onOpenChange={setSessionOpen}
        title="Abrir ticket"
        description="Selecione o veículo, uma vaga disponível e a tarifa aplicada."
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void sessionForm.handleSubmit();
        }}
        submitLabel="Abrir ticket"
        isSubmitting={isSessionSubmitting}
      >
        <FormError message={sessionFormError} />
        <sessionForm.Field name="vehicleId">
          {(field) => (
            <FormSelectField
              field={field}
              id="session-vehicle"
              label="Veículo"
              options={sessionVehicleOptions}
              placeholder={
                vehicles.query.isPending ? "Carregando veículos..." : "Selecione o veículo"
              }
              description={
                sessionVehicleOptions.length === 0
                  ? "Todos os seus veículos já estão em uma sessão aberta."
                  : undefined
              }
            />
          )}
        </sessionForm.Field>
        <sessionForm.Field name="parkingSpaceId">
          {(field) => (
            <FormSelectField
              field={field}
              id="session-space"
              label="Vaga"
              options={sessionSpaceOptions}
              placeholder={
                availableSpaces.query.isPending ? "Carregando vagas..." : "Selecione a vaga"
              }
              description={
                sessionSpaceOptions.length === 0
                  ? "Não há vagas disponíveis no momento."
                  : "Somente vagas livres e não bloqueadas aparecem aqui."
              }
            />
          )}
        </sessionForm.Field>
        <sessionForm.Field name="tariffId">
          {(field) => (
            <FormSelectField
              field={field}
              id="session-tariff"
              label="Tarifa"
              options={sessionTariffOptions}
              placeholder={tariffs.query.isPending ? "Carregando tarifas..." : "Selecione a tarifa"}
            />
          )}
        </sessionForm.Field>
      </FormDialog>

      <FormDialog
        open={vehicleDialogOpen}
        onOpenChange={setVehicleDialogOpen}
        title={editingVehicle ? "Editar veículo" : "Novo veículo"}
        description={
          editingVehicle
            ? "A placa não pode ser alterada depois do cadastro."
            : "Informe a placa e os dados do veículo."
        }
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void vehicleForm.handleSubmit();
        }}
        submitLabel={editingVehicle ? "Salvar" : "Cadastrar"}
        isSubmitting={isVehicleSubmitting}
      >
        <FormError message={vehicleFormError} />
        <vehicleForm.Field
          name="licensePlate"
          validators={
            editingVehicle
              ? undefined
              : {
                  onChange: licensePlateSchema,
                  onSubmit: licensePlateSchema,
                }
          }
        >
          {(field) => (
            <FormTextField
              field={field}
              id="my-vehicle-plate"
              label="Placa"
              placeholder="ABC1D23"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={7}
              transformValue={(value) => value.toUpperCase().replace(/-/g, "")}
              disabled={Boolean(editingVehicle)}
              description={
                editingVehicle
                  ? "A placa não pode ser alterada."
                  : "Use o formato ABC1234 ou ABC1D23."
              }
            />
          )}
        </vehicleForm.Field>
        <vehicleForm.Field
          name="model"
          validators={{
            onChange: vehicleCreateSchema.shape.model,
            onSubmit: vehicleCreateSchema.shape.model,
          }}
        >
          {(field) => (
            <FormTextField
              field={field}
              id="my-vehicle-model"
              label="Modelo"
              placeholder="Ex.: HB20"
              maxLength={100}
            />
          )}
        </vehicleForm.Field>
        <vehicleForm.Field
          name="color"
          validators={{
            onChange: vehicleCreateSchema.shape.color,
            onSubmit: vehicleCreateSchema.shape.color,
          }}
        >
          {(field) => (
            <FormTextField
              field={field}
              id="my-vehicle-color"
              label="Cor"
              placeholder="Ex.: Prata"
              maxLength={50}
            />
          )}
        </vehicleForm.Field>
        <vehicleForm.Field
          name="vehicleType"
          validators={{
            onChange: vehicleCreateSchema.shape.vehicleType,
            onSubmit: vehicleCreateSchema.shape.vehicleType,
          }}
        >
          {(field) => (
            <FormSelectField
              field={field}
              id="my-vehicle-type"
              label="Tipo"
              options={vehicleTypeOptions}
              placeholder="Selecione o tipo"
            />
          )}
        </vehicleForm.Field>
      </FormDialog>

      <FormDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        title="Pagar sessão"
        description="O valor é calculado pelo servidor com base na tarifa e no tempo da sessão."
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void paymentForm.handleSubmit();
        }}
        submitLabel="Pagar e sair"
        submitVariant="ink"
        isSubmitting={isPaymentSubmitting}
        submitDisabled={paymentQuoteQuery.isFetching || !paymentQuote}
      >
        <FormError message={paymentFormError} />
        <paymentForm.Field name="ticketId">
          {(field) => (
            <FormSelectField
              field={field}
              id="my-payment-ticket"
              label="Sessão"
              options={unpaidTicketOptions}
              placeholder="Selecione a sessão"
              description="O pagamento encerra a sessão e libera a vaga."
            />
          )}
        </paymentForm.Field>
        <PaymentQuote
          quote={paymentQuote}
          isLoading={paymentQuoteQuery.isFetching}
          error={paymentQuoteQuery.error}
        />
        {selectedPaymentTicket ? (
          <dl className="grid gap-1 rounded-xl bg-secondary px-3 py-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Placa</dt>
              <dd className="font-mono">{selectedPaymentTicket.licensePlate ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Vaga</dt>
              <dd>{selectedPaymentTicket.parkingSpaceCode ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Entrada</dt>
              <dd>{formatDateTime(selectedPaymentTicket.entryTime)}</dd>
            </div>
          </dl>
        ) : null}
      </FormDialog>

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

function SessionRow({
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

function PaymentRow({
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

function ListSkeleton() {
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

function SectionEmpty({
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
