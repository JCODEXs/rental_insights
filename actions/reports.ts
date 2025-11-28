// actions/reports.ts
'use server';

import { Stay } from '@/lib/mongodb';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export async function getMonthlyReport(year: number, month: number) {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(start);

  const stays = await Stay.find({
    startDate: { $gte: start, $lte: end },
    status: 'completed'
  }).sort({ startDate: 1 });

  if (stays.length === 0) return null;

  const totalRevenue = stays.reduce((s, stay) => s + stay.netRevenue, 0);
  const totalCosts = stays.reduce((s, stay) => s + stay.totalCost, 0);
  const profit = totalRevenue - totalCosts;
  const totalNights = stays.reduce((s, stay) => s + stay.nights, 0);
  const avgMargin = stays.reduce((s, stay) => s + stay.profitMargin, 0) / stays.length;

  // Desglose de gastos
  const byCategory = {
    limpieza: stays.reduce((s, stay) => s + stay.cleaningCost, 0),
    consumibles: stays.reduce((s, stay) => s + stay.consumables.reduce((a: any, c: any) => a + c.total, 0), 0),
    otros: stays.reduce((s, stay) => s + stay.otherExpenses.reduce((a: any, e: any) => a + e.amount, 0), 0),
  };

  // Datos diarios
  const days = eachDayOfInterval({ start, end });
  const daily = days.map(day => {
    const dayStays = stays.filter(s => {
      const d = new Date(s.startDate);
      return d.toDateString() === day.toDateString();
    });
    const netRevenue = dayStays.reduce((s, stay) => s + stay.netRevenue, 0);
    return { day: format(day, 'dd'), netRevenue };
  });

  // Ocupación (suponiendo 30 días max)
  const occupancyRate = (totalNights / 30) * 100;
  // Solo nombres cortos y ganancia → súper ligero
const staysSummary = stays.map(s => ({
  guestName: s.guestName.split(' ')[0],  // solo primer nombre
  profit: s.profit
}));

  return {
    year,
    month,
    totalStays: stays.length,
    totalNights,
    totalRevenue,
    totalCosts,
    profit,
    avgMargin,
    occupancyRate,
    byCategory,
    staysSummary,
    // stays,
    daily
  };
}