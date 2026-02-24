// actions/stays.ts
'use server';

import { revalidatePath } from 'next/cache';
import { staySchema, type StayFormData } from '@/lib/schemas';
import { IConsumable, IStay, Stay,dbConnect } from '@/lib/mongodb'; // <-- este archivo lo creamos en el paso 3
import { redirect } from 'next/navigation';
import { sileo } from 'sileo';

export async function createStay(data: StayFormData) {
  try {
    // Validamos de nuevo en el servidor (seguridad)
    const validated = staySchema.parse(data);
    await dbConnect()
    // Guardamos en MongoDB
    await Stay.create({
      ...validated,
      status: validated.status || 'completed', // por defecto completada
    });

    revalidatePath('/estancias');
    return { success: true };
  } catch (error: any) {
    console.error('Error creando estancia:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function updateStay(id: string, data: StayFormData) {
  try {
    await dbConnect()
    const validated = staySchema.parse(data);
    await Stay.findByIdAndUpdate(id, validated);
    revalidatePath('/estancias');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// actions/stays.ts (añade estas funciones)
// actions/stays.ts

export type StaySummary = {
  _id: string;
  guestName: string;
  startDate: string;     // ISO string para fechas
  endDate: string;
  nights: number;
  guests: number;
  channel: string;
  grossRevenue: number;
  platformFee: number;
  cleaningFeeCharged: number;
  netRevenue: number;
  cleaningCost: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
};

export async function getAllStays(): Promise<StaySummary[]> {
  await dbConnect()
  const stays = await Stay.find({})
    .sort({ startDate: -1 })
    .lean(); // ← ya devuelve plain objects, pero vamos más allá por seguridad

  return stays.map((stay: any) => ({
    _id: stay._id.toString(),
    guestName: stay.guestName,
    startDate: stay.startDate.toISOString(),
    endDate: stay.endDate.toISOString(),
    nights: stay.nights,
    guests: stay.guests,
    channel: stay.channel,
    grossRevenue: stay.grossRevenue,
    platformFee: stay.platformFee,
    cleaningFeeCharged: stay.cleaningFeeCharged,
    netRevenue: stay.netRevenue,
    cleaningCost: stay.cleaningCost,
    totalCost: stay.totalCost,
    profit: stay.profit,
    profitMargin: Number(stay.profitMargin.toFixed(2)), // opcional: redondeamos bonito
  }));
}

export async function getMonthlySummaries() {
    await dbConnect()
  return await Stay.aggregate([
    {
      $group: {
        _id: { year: { $year: "$startDate" }, month: { $month: "$startDate" } },
        profit: { $sum: "$profit" },
        profitMargin: { $avg: "$profitMargin" },
        totalStays: { $sum: 1 },
      }
    },
    {
      $project: {
        year: "$_id.year",
        month: "$_id.month",
        profit: 1,
        profitMargin: 1,
        totalStays: 1,
        _id: 0
      }
    },
    { $sort: { year: -1, month: -1 } }
  ]);
}
// actions/stays.ts
export async function getStayById(id: string) {
  await dbConnect()
  const stay = await Stay.findById(id).lean<IStay>()
  // console.log(stay,"stay")
  if (!stay) return null;

  return {
    ...stay,
    _id: stay._id.toString(),
    startDate: stay.startDate.toISOString().split('T')[0], // para <input type="date">
    endDate: stay.endDate.toISOString().split('T')[0],
    consumables: stay.consumables.map((c: any) => ({
      ...c,
      _id: c._id.toString()
    })),
    otherExpenses: stay.otherExpenses.map((e: any) => ({
      ...e,
      _id: e._id.toString()
    })),
  };
}

// export async function updateStay(id: string, data: StayFormData) {
//   try {
//     const validated = staySchema.parse(data);
//     await Stay.findByIdAndUpdate(id, validated);
//     revalidatePath('/estancias');
//     return { success: true };
//   } catch (error: any) {
//     return { success: false, error: error.message };
//   }
// }

export async function deleteStay(formData: FormData) {
  await dbConnect()

  const id = formData.get('id') as string;
  await Stay.findByIdAndDelete(id);
  redirect('/estancias')
  revalidatePath('/estancias');
}