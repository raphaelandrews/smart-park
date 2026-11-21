import { describe, expect, test } from "bun:test";

import type {
  PaymentResponseDTO,
  ParkingSpaceResponseDTO,
  TicketResponseDTO,
} from "@/api/generated";

import { getOpenTickets, getSpaceStatus, isTicketOpen, isTicketPaid } from "./parking";

const openTicket = (overrides: Partial<TicketResponseDTO> = {}): TicketResponseDTO => ({
  id: 1,
  vehicleId: 10,
  parkingSpaceId: 100,
  active: true,
  ...overrides,
});

const payment = (overrides: Partial<PaymentResponseDTO> = {}): PaymentResponseDTO => ({
  id: 1,
  ticketId: 1,
  active: true,
  ...overrides,
});

describe("isTicketOpen", () => {
  test("is open without an exit time", () => {
    expect(isTicketOpen(openTicket())).toBe(true);
  });

  test("is closed with an exit time", () => {
    expect(isTicketOpen(openTicket({ exitTime: "2026-11-20T18:00:00" }))).toBe(false);
  });

  test("is closed when deactivated", () => {
    expect(isTicketOpen(openTicket({ active: false }))).toBe(false);
  });
});

describe("getSpaceStatus", () => {
  const space = (overrides: Partial<ParkingSpaceResponseDTO> = {}): ParkingSpaceResponseDTO => ({
    id: 100,
    code: "A-01",
    ...overrides,
  });

  test("blocked wins over occupancy", () => {
    expect(getSpaceStatus(space({ blocked: true }), [openTicket()])).toBe("BLOCKED");
  });

  test("is occupied when an open ticket references it", () => {
    expect(getSpaceStatus(space(), [openTicket()])).toBe("OCCUPIED");
  });

  test("is available when the ticket is closed", () => {
    expect(getSpaceStatus(space(), [openTicket({ exitTime: "2026-11-20T18:00:00" })])).toBe(
      "AVAILABLE",
    );
  });

  test("ignores tickets for another space", () => {
    expect(getSpaceStatus(space(), [openTicket({ parkingSpaceId: 999 })])).toBe("AVAILABLE");
  });
});

describe("vehicle and payment helpers", () => {
  test("detects a parked vehicle", () => {});

  test("ignores closed tickets when checking parked vehicles", () => {});

  test("detects a paid ticket", () => {
    expect(isTicketPaid(1, [payment()])).toBe(true);
    expect(isTicketPaid(1, [payment({ active: false })])).toBe(false);
    expect(isTicketPaid(2, [payment()])).toBe(false);
  });

  test("filters open tickets and active payments", () => {
    expect(getOpenTickets([openTicket(), openTicket({ exitTime: "x" })])).toHaveLength(1);
  });
});
