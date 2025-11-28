// lib/schemas.ts
import { z } from 'zod';
const dateSchema = z.preprocess(
  (arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  },
  z.date()
);

export const staySchema = z.object({
  guestName: z.string().min(2, 'Nombre muy corto'),
  
  channel: z.enum(['airbnb', 'booking', 'directo', 'otros']),
  status: z.enum(['reserved', 'ongoing', 'completed', 'cancelled']).optional(),

  startDate: dateSchema,
  endDate: dateSchema ,
  nights: z.number().min(0),
  guests: z.number().min(1),

  grossRevenue: z.number().min(0),
  platformFee: z.number().min(0),
  cleaningFeeCharged: z.number().min(0),
  netRevenue: z.number().min(0),

  cleaningCost: z.number().min(0),

  consumables: z.array(z.object({
    name: z.string().min(1, 'Nombre obligatorio'),
    qty: z.number().min(0),
    unitCost: z.number().min(0),
    total: z.number().min(0),
  })),

  otherExpenses: z.array(z.object({
    description: z.string().min(1, 'Descripción obligatoria'),
    amount: z.number().min(1, 'Monto debe ser mayor a 0'),
  })),

  totalCost: z.number(),
  profit: z.number(),
  profitMargin: z.number().optional(),

  notes: z.string().optional(),
});

export type StayFormData = z.infer<typeof staySchema>;

// lib/schemas.ts (añade esto al final)
export const consumableSchema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  unit: z.string().min(1, 'Unidad obligatoria'),
  unitCost: z.number().min(0, 'Costo no puede ser negativo'),
  appliesPer: z.enum(['stay', 'guest', 'night', 'person-night']),
  isActive: z.boolean().optional(),
});

export type ConsumableFormData = z.infer<typeof consumableSchema>;