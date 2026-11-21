import { describe, expect, test } from "bun:test";

import {
  licensePlateSchema,
  parkingSpaceFormSchema,
  paymentCreateSchema,
  registerSchema,
  tariffCreateSchema,
  vehicleCreateSchema,
} from "@/lib/validation";

describe("license plates", () => {
  test("normalizes case and separators", () => {
    expect(licensePlateSchema.parse(" abc-1d23 ")).toBe("ABC1D23");
    expect(licensePlateSchema.parse("abc1234")).toBe("ABC1234");
  });

  test("rejects invalid plates", () => {
    expect(licensePlateSchema.safeParse("a10").success).toBe(false);
    expect(licensePlateSchema.safeParse("AB12345").success).toBe(false);
  });
});

describe("vehicle validation", () => {
  test("accepts a complete vehicle", () => {
    const parsed = vehicleCreateSchema.parse({
      licensePlate: "abc1d23",
      model: "HB20",
      color: "Prata",
      vehicleType: "CAR",
    });
    expect(parsed.licensePlate).toBe("ABC1D23");
  });

  test("requires model, color and type", () => {
    const result = vehicleCreateSchema.safeParse({
      licensePlate: "ABC1D23",
      model: "",
      color: "",
      vehicleType: "CAR",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0]).sort()).toEqual(["color", "model"]);
    }
  });
});

describe("numeric form inputs", () => {
  test("coerces numeric strings for tariffs", () => {
    const parsed = tariffCreateSchema.parse({
      description: "Padrão",
      firstHourRate: "10",
      additionalHourRate: "5.50",
      toleranceMinutes: "15",
    });
    expect(parsed.firstHourRate).toBe(10);
    expect(parsed.additionalHourRate).toBe(5.5);
    expect(parsed.toleranceMinutes).toBe(15);
  });

  test("rejects empty, negative and overly precise values", () => {
    expect(
      tariffCreateSchema.safeParse({
        description: "Padrão",
        firstHourRate: "",
        additionalHourRate: "5",
        toleranceMinutes: "15",
      }).success,
    ).toBe(false);

    expect(
      tariffCreateSchema.safeParse({
        description: "Padrão",
        firstHourRate: "-1",
        additionalHourRate: "5",
        toleranceMinutes: "15",
      }).success,
    ).toBe(false);

    expect(
      tariffCreateSchema.safeParse({
        description: "Padrão",
        firstHourRate: "10.999",
        additionalHourRate: "5",
        toleranceMinutes: "15",
      }).success,
    ).toBe(false);
  });

  test("requires whole minutes", () => {
    expect(
      tariffCreateSchema.safeParse({
        description: "Padrão",
        firstHourRate: "10",
        additionalHourRate: "5",
        toleranceMinutes: "1.5",
      }).success,
    ).toBe(false);
  });
});

describe("payment validation", () => {
  test("requires a positive ticket ID", () => {
    expect(paymentCreateSchema.parse({ ticketId: "12" }).ticketId).toBe(12);
    expect(paymentCreateSchema.safeParse({ ticketId: "" }).success).toBe(false);
    expect(paymentCreateSchema.safeParse({ ticketId: "0" }).success).toBe(false);
  });
});

describe("parking space validation", () => {
  test("requires a reason only when blocked", () => {
    expect(
      parkingSpaceFormSchema.safeParse({
        code: "A1",
        parkingSpaceTypeId: "1",
        blocked: false,
        blockingReason: "",
      }).success,
    ).toBe(true);

    expect(
      parkingSpaceFormSchema.safeParse({
        code: "A1",
        parkingSpaceTypeId: "1",
        blocked: true,
        blockingReason: "",
      }).success,
    ).toBe(false);
  });
});

describe("registration validation", () => {
  test("requires matching passwords", () => {
    const result = registerSchema.safeParse({
      name: "Motorista",
      email: "motorista@example.com",
      password: "smartpark123",
      confirmPassword: "different123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });
});
