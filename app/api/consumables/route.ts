// app/api/consumables/route.ts

import { NextResponse } from 'next/server';
import { Consumable,dbConnect } from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect()
    const consumables = await Consumable.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json(consumables);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}