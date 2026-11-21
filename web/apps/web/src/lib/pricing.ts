import type { TariffResponseDTO, TicketResponseDTO } from "@/api/generated";

import { getDurationMinutes, getElapsedMinutes } from "@/lib/format";

/**
 * Applies the tariff rules exposed by the API to a billable duration:
 * the tolerance window is free, the first billable hour costs `firstHourRate`,
 * and every started additional hour costs `additionalHourRate`.
 *
 * The backend is still the source of truth; this only pre-fills forms so the
 * operator does not have to calculate the amount by hand.
 */
export function estimateAmount(
  minutes: number | null,
  tariff: TariffResponseDTO | undefined,
): number | null {
  if (minutes === null || !tariff) {
    return null;
  }

  const billableMinutes = Math.max(0, minutes - (tariff.toleranceMinutes ?? 0));
  if (billableMinutes === 0) {
    return 0;
  }

  const hours = Math.ceil(billableMinutes / 60);
  const amount =
    (tariff.firstHourRate ?? 0) + Math.max(0, hours - 1) * (tariff.additionalHourRate ?? 0);

  return Math.round(amount * 100) / 100;
}

/** Estimates the amount for a ticket, using the exit time when present. */
export function estimateTicketAmount(
  ticket: TicketResponseDTO,
  tariff: TariffResponseDTO | undefined,
  now: Date = new Date(),
): number | null {
  const minutes = ticket.exitTime
    ? getDurationMinutes(ticket.entryTime, ticket.exitTime)
    : getElapsedMinutes(ticket.entryTime, now);

  return estimateAmount(minutes, tariff);
}
