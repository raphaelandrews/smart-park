import { z } from "zod";

export const LICENSE_PLATE_PATTERN = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
export const LOCAL_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

/** Mirrors the API normalization: uppercase and remove separators. */
export function normalizeLicensePlate(value: string): string {
  return value.toUpperCase().replace(/-/g, "").trim();
}

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} é obrigatório`)
    .max(max, `${label} deve ter no máximo ${max} caracteres`);

const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, `${label} deve ter no máximo ${max} caracteres`).optional();

const positiveId = (label: string) =>
  z
    .number({ error: `${label} é obrigatório` })
    .int(`${label} deve ser um número inteiro`)
    .positive(`${label} deve ser positivo`);

const money = (label: string, min = 0) =>
  z
    .number({ error: `${label} é obrigatório` })
    .min(min, min === 0 ? `${label} não pode ser negativo` : `${label} deve ser maior que zero`)
    .max(99_999_999.99, `${label} deve ter no máximo 8 dígitos inteiros`)
    .refine(
      (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-9,
      `${label} deve ter no máximo 2 casas decimais`,
    );

const nonNegativeMinutes = (label: string) =>
  z
    .number({ error: `${label} é obrigatório` })
    .int(`${label} deve ser um número inteiro`)
    .min(0, `${label} não pode ser negativo`)
    .max(32_767, `${label} é muito grande`);

export const vehicleTypeSchema = z.enum(["CAR", "MOTORCYCLE", "TRUCK", "BUS"], {
  error: "O tipo de veículo é obrigatório",
});

export const licensePlateSchema = z
  .string()
  .trim()
  .min(1, "A placa é obrigatória")
  .transform(normalizeLicensePlate)
  .refine((value) => LICENSE_PLATE_PATTERN.test(value), "Placa inválida (use ABC1234 ou ABC1D23)");

// Vehicles

export const vehicleCreateSchema = z.object({
  licensePlate: licensePlateSchema,
  model: requiredText("O modelo", 100),
  color: requiredText("A cor", 50),
  vehicleType: vehicleTypeSchema,
});

export const vehicleUpdateSchema = z.object({
  model: requiredText("O modelo", 100),
  color: requiredText("A cor", 50),
  vehicleType: vehicleTypeSchema,
});

// Parking space types

export const parkingSpaceTypeCreateSchema = z.object({
  name: requiredText("O nome", 100),
  description: optionalText("A descrição", 255),
  requiresCredential: z.boolean({ error: "Informe se o tipo de vaga exige credencial" }),
});

export const parkingSpaceTypeUpdateSchema = parkingSpaceTypeCreateSchema;

// Parking spaces

export const parkingSpaceCreateSchema = z
  .object({
    code: requiredText("O código", 20),
    parkingSpaceTypeId: positiveId("O tipo da vaga"),
    blocked: z.boolean().default(false),
    blockingReason: optionalText("O motivo do bloqueio", 255),
  })
  .superRefine((value, ctx) => {
    if (value.blocked && !value.blockingReason) {
      ctx.addIssue({
        code: "custom",
        path: ["blockingReason"],
        message: "Informe o motivo do bloqueio",
      });
    }
  });

export const parkingSpaceUpdateSchema = z
  .object({
    parkingSpaceTypeId: positiveId("O tipo da vaga"),
    blocked: z.boolean({ error: "Informe se a vaga está bloqueada" }),
    blockingReason: optionalText("O motivo do bloqueio", 255),
  })
  .superRefine((value, ctx) => {
    if (value.blocked && !value.blockingReason) {
      ctx.addIssue({
        code: "custom",
        path: ["blockingReason"],
        message: "Informe o motivo do bloqueio",
      });
    }
  });

// Tariffs

export const tariffCreateSchema = z.object({
  description: requiredText("A descrição", 255),
  firstHourRate: money("O valor da primeira hora"),
  additionalHourRate: money("O valor da hora adicional"),
  toleranceMinutes: nonNegativeMinutes("Os minutos de tolerância"),
});

export const tariffUpdateSchema = tariffCreateSchema;

// Tickets

export const ticketCreateSchema = z.object({
  vehicleId: positiveId("O veículo"),
  parkingSpaceId: positiveId("A vaga"),
  tariffId: positiveId("A tarifa"),
});

export const ticketCloseSchema = z.object({
  exitTime: z
    .string()
    .min(1, "A data/hora de saída é obrigatória")
    .refine(
      (value) => LOCAL_DATE_TIME_PATTERN.test(value),
      "Informe uma data/hora válida (AAAA-MM-DDTHH:mm)",
    ),
});

// Payments

export const paymentCreateSchema = z.object({
  ticketId: positiveId("O ticket"),
  amount: money("O valor", 0.01),
});

export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;
export type ParkingSpaceTypeCreateInput = z.infer<typeof parkingSpaceTypeCreateSchema>;
export type ParkingSpaceTypeUpdateInput = z.infer<typeof parkingSpaceTypeUpdateSchema>;
export type ParkingSpaceCreateInput = z.infer<typeof parkingSpaceCreateSchema>;
export type ParkingSpaceUpdateInput = z.infer<typeof parkingSpaceUpdateSchema>;
export type TariffCreateInput = z.infer<typeof tariffCreateSchema>;
export type TariffUpdateInput = z.infer<typeof tariffUpdateSchema>;
export type TicketCreateInput = z.infer<typeof ticketCreateSchema>;
export type TicketCloseInput = z.infer<typeof ticketCloseSchema>;
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
