// actions/reports.ts
'use server';

import { Stay,dbConnect } from '@/lib/mongodb';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export async function getMonthlyReport(year: number, month: number) {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(start);
  await dbConnect()
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


// Resumen Anual
export async function getAnnualReport(year: number) {
  await dbConnect();
  
  const startDate = new Date(year, 0, 1); // 1 enero
  const endDate = new Date(year + 1, 0, 1); // 1 enero año siguiente
  
  const allStays = await Stay.find({
    startDate: { $gte: startDate, $lt: endDate },
    status: 'completed'
  }).sort({ startDate: 1 });
  
  if (allStays.length === 0) return null;
  
  // Agrupar por mes
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthStays = allStays.filter(stay => 
      new Date(stay.startDate).getMonth() === i
    );
    
    const totalRevenue = monthStays.reduce((sum, s) => sum + (s.netRevenue || 0), 0);
    const totalCosts = monthStays.reduce((sum, s) => sum + (s.totalCost || 0), 0);
    const profit = monthStays.reduce((sum, s) => sum + (s.profit || 0), 0);
    const totalNights = monthStays.reduce((sum, s) => sum + (s.nights || 0), 0);
    
    return {
      month: i + 1,
      totalStays: monthStays.length,
      totalNights,
      totalRevenue,
      totalCosts,
      profit,
      avgMargin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0
    };
  });
  
  // Totales del año
  const totalStays = allStays.length;
  const totalNights = allStays.reduce((sum, s) => sum + (s.nights || 0), 0);
  const totalRevenue = allStays.reduce((sum, s) => sum + (s.netRevenue || 0), 0);
  const totalCosts = allStays.reduce((sum, s) => sum + (s.totalCost || 0), 0);
  const profit = allStays.reduce((sum, s) => sum + (s.profit || 0), 0);
  const avgMargin = allStays.reduce((sum, s) => sum + (s.profitMargin || 0), 0) / allStays.length;
  
  return {
    year,
    totalStays,
    totalNights,
    totalRevenue,
    totalCosts,
    profit,
    avgMargin,
    monthlyData,
    // Top 5 mejores meses
    topMonths: [...monthlyData]
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5)
  };
}

// Resumen Total (histórico)
export async function getTotalReport() {
  await dbConnect();
  
  const allStays = await Stay.find({ 
    status: 'completed' 
  }).sort({ startDate: 1 });
  
  if (allStays.length === 0) return null;
  
  // Agrupar por año
  const yearlyData: Record<number, any> = {};
  
  allStays.forEach(stay => {
    const year = new Date(stay.startDate).getFullYear();
    if (!yearlyData[year]) {
      yearlyData[year] = {
        year,
        totalStays: 0,
        totalNights: 0,
        totalRevenue: 0,
        totalCosts: 0,
        profit: 0
      };
    }
    
    yearlyData[year].totalStays++;
    yearlyData[year].totalNights += stay.nights || 0;
    yearlyData[year].totalRevenue += stay.netRevenue || 0;
    yearlyData[year].totalCosts += stay.totalCost || 0;
    yearlyData[year].profit += stay.profit || 0;
  });
  
  // Calcular margen por año
  const yearlyArray = Object.values(yearlyData).map(y => ({
    ...y,
    avgMargin: y.totalRevenue > 0 ? (y.profit / y.totalRevenue) * 100 : 0
  }));
  
  // Totales generales
  const totalStays = allStays.length;
  const totalNights = allStays.reduce((sum, s) => sum + (s.nights || 0), 0);
  const totalRevenue = allStays.reduce((sum, s) => sum + (s.netRevenue || 0), 0);
  const totalCosts = allStays.reduce((sum, s) => sum + (s.totalCost || 0), 0);
  const profit = allStays.reduce((sum, s) => sum + (s.profit || 0), 0);
  const avgMargin = allStays.reduce((sum, s) => sum + (s.profitMargin || 0), 0) / allStays.length;
  
  const firstStay = new Date(allStays[0].startDate);
  const lastStay = new Date(allStays[allStays.length - 1].endDate || allStays[allStays.length - 1].startDate);
  
  return {
    totalStays,
    totalNights,
    totalRevenue,
    totalCosts,
    profit,
    avgMargin,
    yearlyData: yearlyArray,
    firstStayDate: firstStay,
    lastStayDate: lastStay,
    years: yearlyArray.length
  };
}