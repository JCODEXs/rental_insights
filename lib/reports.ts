// lib/reports.ts
import { Stay } from '@/lib/mongodb';
export async function getMonthlyReport(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const result = await Stay.aggregate([
    { $match: { 
      startDate: { $gte: start, $lte: end },
      status: 'completed'
    }},
    {
      $group: {
        _id: null,
        totalStays: { $sum: 1 },
        totalNights: { $sum: '$nights' },
        totalGross: { $sum: '$grossRevenue' },
        totalNet: { $sum: '$netRevenue' },
        totalCost: { $sum: '$totalCost' },
        totalProfit: { $sum: '$profit' },
        avgMargin: { $avg: '$profitMargin' },
        
        // Desglose por categoría de gasto
        cleaningCost: { $sum: '$cleaningCost' },
        consumablesCost: { $sum: { $sum: '$consumables.total' } },
        otherCost: { $sum: { $sum: '$otherExpenses.amount' } },
      }
    },
    {
      $project: {
        year, month,
        totalStays: 1,
        totalNights: 1,
        totalRevenue: '$totalNet',
        totalCosts: '$totalCost',
        profit: '$totalProfit',
        avgProfitMargin: '$avgMargin',
        byCategory: {
          limpieza: '$cleaningCost',
          consumibles: '$consumablesCost',
          otros: '$otherCost'
        }
      }
    }
  ]);

  return result[0] || null;
}