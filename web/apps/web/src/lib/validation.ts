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
    .min(1, `Informe ${label.toLowerCase()}`)
    .max(max, `${label}: máximo de ${max} caracteres`);

const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, `${label}: máximo de ${max} caracteres`).optional();

const positiveId = (label: string) =>
  z
    .number({ error: `Informe ${label.toLowerCase()}` })
    .int(`${label}: deve ser um número inteiro`)
    .positive(`${label}: deve ser positivo`);

const money = (label: string, min = 0) =>
  z
    .number({ error: `Informe ${label.toLowerCase()}` })
    .min(min, min === 0 ? `${label}: não pode ser negativo` : `${label}: deve ser maior que zero`)
    .max(99_999_999.99, `${label}: máximo de 8 dígitos inteiros`)
    .refine(
      (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-9,
      `${label}: use no máximo 2 casas decimais`,
    );

const nonNegativeMinutes = (label: string) =>
  z
    .number({ error: `Informe ${label.toLowerCase()}` })
    .int(`${label}: deve ser um número inteiro`)
    .min(0, `${label}: não pode ser negativo`)
    .max(32_767, `${label}: valor muito alto`);

/**
 * Form inputs yield strings; TanStack Form validators must reject empty values and
 * coerce valid numeric strings before applying the numeric rules. The output remains
 * a number so the parsed value can be sent to the API unchanged.
 */
const numberFromInput = (label: string, schema: z.ZodNumber) =>
  z
    .union([z.string(), z.number()])
    .transform((value, ctx) => {
      const raw = typeof value === "string" ? value.trim() : value;
      if (raw === "" || (typeof raw === "number" && !Number.isFinite(raw))) {
        ctx.addIssue({ code: "custom", message: `Informe ${label.toLowerCase()}` });
        return z.NEVER;
      }
      const parsed = typeof raw === "string" ? Number(raw) : raw;
      if (!Number.isFinite(parsed)) {
        ctx.addIssue({ code: "custom", message: `${label}: número inválido` });
        return z.NEVER;
      }
      return parsed;
    })
    .pipe(schema);

const idInput = (label: string) => numberFromInput(label, positiveId(label));
const moneyInput = (label: string, min = 0) => numberFromInput(label, money(label, min));
const minutesInput = (label: string) => numberFromInput(label, nonNegativeMinutes(label));

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

/** Form validator: keeps description as a string so it matches the controlled input. */
export const parkingSpaceTypeFormSchema = z.object({
  name: requiredText("O nome", 100),
  description: z.string().trim().max(255, "A descrição: máximo de 255 caracteres"),
  requiresCredential: z.boolean({ error: "Informe se o tipo de vaga exige credencial" }),
});

// Parking spaces

export const parkingSpaceCreateSchema = z
  .object({
    code: requiredText("O código", 20),
    parkingSpaceTypeId: idInput("O tipo da vaga"),
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
    parkingSpaceTypeId: idInput("O tipo da vaga"),
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

/** Shared create/edit validator: keeps the code field for the edit form. */
export const parkingSpaceFormSchema = z
  .object({
    code: requiredText("O código", 20),
    parkingSpaceTypeId: idInput("O tipo da vaga"),
    blocked: z.boolean({ error: "Informe se a vaga está bloqueada" }),
    blockingReason: z
      .string()
      .trim()
      .max(255, "O motivo do bloqueio deve ter no máximo 255 caracteres"),
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
  firstHourRate: moneyInput("O valor da primeira hora"),
  additionalHourRate: moneyInput("O valor da hora adicional"),
  toleranceMinutes: minutesInput("Os minutos de tolerância"),
});

export const tariffUpdateSchema = tariffCreateSchema;

// Tickets

export const ticketCreateSchema = z.object({
  vehicleId: idInput("O veículo"),
  parkingSpaceId: idInput("A vaga"),
  tariffId: idInput("A tarifa"),
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
  ticketId: idInput("O ticket"),
  amount: moneyInput("O valor", 0.01),
});

// Authentication

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "O email é obrigatório")
    .email("Email inválido")
    .max(255, "O email deve ter no máximo 255 caracteres"),
  password: z.string().min(1, "A senha é obrigatória"),
});

export const registerSchema = z
  .object({
    name: requiredText("O nome", 100),
    email: z
      .string()
      .trim()
      .min(1, "O email é obrigatório")
      .email("Email inválido")
      .max(255, "O email deve ter no máximo 255 caracteres"),
    password: z
      .string()
      .min(8, "A senha deve ter entre 8 e 72 caracteres")
      .max(72, "A senha deve ter entre 8 e 72 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
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
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
