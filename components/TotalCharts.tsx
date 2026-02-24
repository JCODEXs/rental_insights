// components/TotalCharts.tsx
'use client';

import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  report: any;
}

export default function TotalCharts({ report }: Props) {
  const years = report.yearlyData.map((y: any) => y.year);

  // 1. Barras: Ganancia por año
  const profitByYearOption = {
    tooltip: { 
      trigger: 'axis',
      formatter: (params: any) => {
        const value = params[0].value;
        return `${params[0].name}<br/>Ganancia: $${value.toLocaleString()}`;
      }
    },
    xAxis: { type: 'category', data: years },
    yAxis: { type: 'value' },
    series: [{
      name: 'Ganancia',
      type: 'bar',
      data: report.yearlyData.map((y: any) => y.profit),
      itemStyle: { color: '#10b981' },
      label: { 
        show: true, 
        position: 'top', 
        formatter: (params: any) => `$${(params.value / 1000).toFixed(0)}k`
      }
    }]
  };

  // 2. Líneas: Evolución anual (Ingresos, Gastos, Ganancia)
  const evolutionOption = {
    tooltip: { 
      trigger: 'axis',
      formatter: (params: any) => {
        let tooltip = `${params[0].name}<br/>`;
        params.forEach((p: any) => {
          tooltip += `${p.seriesName}: $${p.value.toLocaleString()}<br/>`;
        });
        return tooltip;
      }
    },
    legend: { data: ['Ingresos', 'Gastos', 'Ganancia'] },
    xAxis: { type: 'category', data: years },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Ingresos',
        type: 'line',
        smooth: true,
        data: report.yearlyData.map((y: any) => y.totalRevenue),
        itemStyle: { color: '#3b82f6' },
        lineStyle: { width: 3 }
      },
      {
        name: 'Gastos',
        type: 'line',
        smooth: true,
        data: report.yearlyData.map((y: any) => y.totalCosts),
        itemStyle: { color: '#ef4444' },
        lineStyle: { width: 3 }
      },
      {
        name: 'Ganancia',
        type: 'line',
        smooth: true,
        data: report.yearlyData.map((y: any) => y.profit),
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 3 },
        areaStyle: { color: 'rgba(16, 185, 129, 0.2)' }
      }
    ]
  };

  // 3. Barras agrupadas: Estancias y Noches por año
  const staysAndNightsOption = {
    tooltip: { 
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: { data: ['Estancias', 'Noches'] },
    xAxis: { type: 'category', data: years },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Estancias',
        type: 'bar',
        data: report.yearlyData.map((y: any) => y.totalStays),
        itemStyle: { color: '#8b5cf6' },
        label: { show: true, position: 'top' }
      },
      {
        name: 'Noches',
        type: 'bar',
        data: report.yearlyData.map((y: any) => y.totalNights),
        itemStyle: { color: '#ec4899' },
        label: { show: true, position: 'top' }
      }
    ]
  };

  // 4. Área: Ganancia acumulada
  const cumulativeOption = {
    tooltip: { 
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].name}<br/>Acumulado: $${params[0].value.toLocaleString()}`;
      }
    },
    xAxis: { type: 'category', data: years },
    yAxis: { type: 'value' },
    series: [{
      name: 'Ganancia Acumulada',
      type: 'line',
      smooth: true,
      data: report.yearlyData.reduce((acc: number[], y: any, idx: number) => {
        const prev = idx > 0 ? acc[idx - 1] : 0;
        acc.push(prev + y.profit);
        return acc;
      }, []),
      itemStyle: { color: '#f59e0b' },
      areaStyle: { color: 'rgba(245, 158, 11, 0.3)' },
      lineStyle: { width: 3 },
      label: { 
        show: true, 
        position: 'top',
        formatter: (params: any) => `$${(params.value / 1000).toFixed(0)}k`
      }
    }]
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Ganancia por Año</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={profitByYearOption} style={{ height: 400 }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estancias y Noches por Año</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={staysAndNightsOption} style={{ height: 400 }} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolución Histórica</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={evolutionOption} style={{ height: 400 }} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ganancia Acumulada</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={cumulativeOption} style={{ height: 400 }} />
        </CardContent>
      </Card>
    </div>
  );
}