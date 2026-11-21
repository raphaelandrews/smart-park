import type {
  PaymentResponseDTO,
  ParkingSpaceResponseDTO,
  TicketResponseDTO,
} from "@/api/generated";

export type ParkingSpaceStatus = "AVAILABLE" | "OCCUPIED" | "BLOCKED";

export const PARKING_SPACE_STATUS_LABEL: Record<ParkingSpaceStatus, string> = {
  AVAILABLE: "Disponível",
  OCCUPIED: "Ocupada",
  BLOCKED: "Bloqueada",
};

/**
 * A ticket is open while it is active and has no exit time. The API does not expose a
 * status field, so this is the source of truth used across the UI.
 */
export function isTicketOpen(ticket: TicketResponseDTO): boolean {
  return ticket.active !== false && !ticket.exitTime;
}

function isPaymentActive(payment: PaymentResponseDTO): boolean {
  return payment.active !== false;
}

export function getOpenTickets(tickets: TicketResponseDTO[]): TicketResponseDTO[] {
  return tickets.filter(isTicketOpen);
}

/**
 * Derived space status: blocked flag first, then an open ticket on the space.
 * `openTickets` may contain closed tickets; they are ignored.
 */
export function getSpaceStatus(
  space: ParkingSpaceResponseDTO,
  openTickets: TicketResponseDTO[],
): ParkingSpaceStatus {
  if (space.blocked) {
    return "BLOCKED";
  }

  if (
    space.id !== undefined &&
    openTickets.some((ticket) => isTicketOpen(ticket) && ticket.parkingSpaceId === space.id)
  ) {
    return "OCCUPIED";
  }

  return "AVAILABLE";
}

export function isTicketPaid(ticketId: number, payments: PaymentResponseDTO[]): boolean {
  return payments.some((payment) => isPaymentActive(payment) && payment.ticketId === ticketId);
}
