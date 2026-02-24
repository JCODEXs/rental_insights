// components/AnnualCharts.tsx
'use client';

import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  report: any;
  year: number;
}

export default function AnnualCharts({ report, year }: Props) {
  // Nombres de meses
  const monthNames = report.monthlyData.map((m: any) => 
    format(new Date(year, m.month - 1), 'MMM', { locale: es })
  );

  // 1. Barras: Ganancia mensual
  const profitBarOption = {
    tooltip: { 
      trigger: 'axis',
      formatter: (params: any) => {
        const value = params[0].value;
        return `${params[0].name}<br/>Ganancia: $${value.toLocaleString()}`;
      }
    },
    xAxis: { 
      type: 'category', 
      data: monthNames
    },
    yAxis: { type: 'value' },
    series: [{
      name: 'Ganancia',
      type: 'bar',
      data: report.monthlyData.map((m: any) => m.profit),
      itemStyle: { color: '#10b981' },
      label: { 
        show: true, 
        position: 'top', 
        formatter: (params: any) => `$${(params.value / 1000).toFixed(0)}k`
      }
    }]
  };

  // 2. Líneas: Ingresos vs Gastos por mes
  const revenueVsCostsOption = {
    tooltip: { 
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].name}<br/>` +
          `${params[0].seriesName}: $${params[0].value.toLocaleString()}<br/>` +
          `${params[1].seriesName}: $${params[1].value.toLocaleString()}`;
      }
    },
    legend: { data: ['Ingresos', 'Gastos'] },
    xAxis: { type: 'category', data: monthNames },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Ingresos',
        type: 'line',
        smooth: true,
        data: report.monthlyData.map((m: any) => m.totalRevenue),
        itemStyle: { color: '#3b82f6' },
        areaStyle: { color: 'rgba(59, 130, 246, 0.2)' }
      },
      {
        name: 'Gastos',
        type: 'line',
        smooth: true,
        data: report.monthlyData.map((m: any) => m.totalCosts),
        itemStyle: { color: '#ef4444' },
        areaStyle: { color: 'rgba(239, 68, 68, 0.2)' }
      }
    ]
  };

  // 3. Barras: Noches ocupadas por mes
  const nightsBarOption = {
    tooltip: { 
      trigger: 'axis',
      formatter: (params: any) => `${params[0].name}<br/>Noches: ${params[0].value}`
    },
    xAxis: { type: 'category', data: monthNames },
    yAxis: { type: 'value' },
    series: [{
      name: 'Noches',
      type: 'bar',
      data: report.monthlyData.map((m: any) => m.totalNights),
      itemStyle: { color: '#8b5cf6' },
      label: { show: true, position: 'top' }
    }]
  };

  // 4. Pie: Margen promedio por trimestre
  const quarters = [
    { 
      name: 'Q1 (Ene-Mar)', 
      profit: report.monthlyData.slice(0, 3).reduce((sum: number, m: any) => sum + m.profit, 0)
    },
    { 
      name: 'Q2 (Abr-Jun)', 
      profit: report.monthlyData.slice(3, 6).reduce((sum: number, m: any) => sum + m.profit, 0)
    },
    { 
      name: 'Q3 (Jul-Sep)', 
      profit: report.monthlyData.slice(6, 9).reduce((sum: number, m: any) => sum + m.profit, 0)
    },
    { 
      name: 'Q4 (Oct-Dic)', 
      profit: report.monthlyData.slice(9, 12).reduce((sum: number, m: any) => sum + m.profit, 0)
    },
  ];

  const quarterPieOption = {
    tooltip: { 
      trigger: 'item',
      formatter: (params: any) => `${params.name}<br/>$${params.value.toLocaleString()} (${params.percent}%)`
    },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: quarters.map(q => ({ value: q.profit, name: q.name })),
      emphasis: { 
        itemStyle: { 
          shadowBlur: 10, 
          shadowOffsetX: 0, 
          shadowColor: 'rgba(0,0,0,0.5)' 
        } 
      }
    }]
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Ganancia Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={profitBarOption} style={{ height: 400 }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Trimestre</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={quarterPieOption} style={{ height: 400 }} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolución de Ingresos vs Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={revenueVsCostsOption} style={{ height: 400 }} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Noches Ocupadas por Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={nightsBarOption} style={{ height: 400 }} />
        </CardContent>
      </Card>
    </div>
  );
}