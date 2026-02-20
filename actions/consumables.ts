// actions/consumables.ts
'use server';

import { revalidatePath } from 'next/cache';
import { Consumable } from '@/lib/mongodb';
import { consumableSchema } from '@/lib/schemas';

export async function getAllConsumables() {
  return await Consumable.find({ isActive: true }).sort({ name: 1 });
}

export async function getConsumableById(id: string) {
  const consumable = await Consumable.findById(id).lean();
  if (!consumable) return null;
  return {
    ...consumable,
    _id: consumable._id.toString(),
  };

}

export async function createConsumable(data: any) {
  try {
    const validated = consumableSchema.parse(data);
    await Consumable.create(validated);
    revalidatePath('/consumibles');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateConsumable(id: string, data: any) {
  try {
    const validated = consumableSchema.parse(data);
    await Consumable.findByIdAndUpdate(id, validated);
    revalidatePath('/consumibles');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteConsumable(formData: FormData) {
  const id = formData.get('id') as string;
  await Consumable.findByIdAndUpdate(id, { isActive: false });
  revalidatePath('/consumibles');
}