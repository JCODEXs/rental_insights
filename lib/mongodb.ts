// src/lib/mongodb.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

// =============================================
// CONEXIÓN CACHÉ (imprescindible en Next.js)
// =============================================
const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Por favor define MONGODB_URI en tu .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// =============================================
// 1. CONSUMABLE (maestro de consumibles)
// =============================================
export interface IConsumable extends Document {
  _id: Types.ObjectId;
  name: string;
  unit: string;
  unitCost: number;
  appliesPer: 'stay' | 'guest' | 'night' | 'person-night';
  isActive: boolean;
}

const ConsumableSchema = new Schema<IConsumable>(
  {
    name: { type: String, required: true, trim: true },
    unit: { type: String, default: 'unidad' },
    unitCost: { type: Number, required: true, min: 0 },
    appliesPer: {
      type: String,
      enum: ['stay', 'guest', 'night', 'person-night'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Consumable =
  mongoose.models.Consumable || mongoose.model<IConsumable>('Consumable', ConsumableSchema);

// =============================================
// 2. STAY (versión DEFINITIVA con referencia a Consumable)
// =============================================
export interface IStay extends Document {
  propertyId?: Types.ObjectId;

  guestName: string;
  channel: 'airbnb' | 'booking' | 'directo' | 'otros';
  status: 'reserved' | 'ongoing' | 'completed' | 'cancelled';

  startDate: Date;
  endDate: Date;
  nights: number;
  guests: number;

  // Ingresos
  grossRevenue: number;
  platformFee: number;
  cleaningFeeCharged: number;
  netRevenue: number;

  // Costos
  cleaningHours?: number;
  cleaningCost: number;

  consumables: {
    consumableId?: Types.ObjectId;
    name: string;
    qty: number;
    unitCost: number;
    total: number;
  }[];

  otherExpenses: {
    description: string;
    amount: number;
  }[];

  totalCost: number;
  profit: number;
  profitMargin: number;

  notes?: string;
}

const StaySchema = new Schema<IStay>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },

    guestName: { type: String, required: true },
    channel: {
      type: String,
      enum: ['airbnb', 'booking', 'directo', 'otros'],
      default: 'airbnb',
    },
    status: {
      type: String,
      enum: ['reserved', 'ongoing', 'completed', 'cancelled'],
      default: 'reserved',
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    nights: { type: Number, required: true },
    guests: { type: Number, required: true, min: 1 },

    grossRevenue: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, default: 0 },
    cleaningFeeCharged: { type: Number, default: 0 },
    netRevenue: { type: Number, required: true },

    cleaningHours: { type: Number },
    cleaningCost: { type: Number, default: 0 },

    consumables: [
      {
        consumableId: { type: Schema.Types.ObjectId, ref: 'Consumable' },
        name: { type: String, required: true },
        qty: { type: Number, required: true, min: 0 },
        unitCost: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],

    otherExpenses: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],

    totalCost: { type: Number, required: true },
    profit: { type: Number, required: true },
    profitMargin: { type: Number },

    notes: String,
  },
  { timestamps: true }
);

// Índices para rendimiento
StaySchema.index({ startDate: 1 });
StaySchema.index({ channel: 1 });
StaySchema.index({ status: 1 });

export const Stay = mongoose.models.Stay || mongoose.model<IStay>('Stay', StaySchema);

// =============================================
// CONEXIÓN AUTOMÁTICA AL INICIAR LA APP
// =============================================
// dbConnect().catch((err) => console.error('Error conectando a MongoDB:', err));