// components/MonthlyCharts.tsx
'use client';

import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  report: any;
  year: number;
  month: number;
}

export default function MonthlyCharts({ report }: Props) {
  // 1. Barras: Ganancia por estancia
  const barOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: report.staysSummary.map((s: any) => s.guestName.substring(0, 10)) },
    yAxis: { type: 'value' },
    series: [{
      name: 'Ganancia',
      type: 'bar',
      data: report.staysSummary.map((s: any) => s.profit),
      itemStyle: { color: '#10b981' },
      label: { show: true, position: 'top', formatter: '${c}' }
    }]
  };

  // 2. Pie: Distribución de gastos
  const pieOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: report.byCategory.limpieza, name: 'Limpieza' },
        { value: report.byCategory.consumibles, name: 'Consumibles' },
        { value: report.byCategory.otros, name: 'Otros Gastos' },
      ],
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } }
    }]
  };

  // 3. Línea: Evolución diaria de ingresos netos
  const lineOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: report.daily.map((d: any) => d.day) },
    yAxis: { type: 'value' },
    series: [{
      name: 'Ingreso Neto Diario',
      type: 'line',
      smooth: true,
      data: report.daily.map((d: any) => d.netRevenue),
      areaStyle: { color: 'rgba(59, 130, 246, 0.3)' },
      itemStyle: { color: '#3b82f6' }
    }]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader><CardTitle>Ganancia por Estancia</CardTitle></CardHeader>
        <CardContent>
          <ReactECharts option={barOption} style={{ height: 400 }} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Distribución de Gastos</CardTitle></CardHeader>
        <CardContent>
          <ReactECharts option={pieOption} style={{ height: 400 }} />
        </CardContent>
      </Card>

      {/* <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Ingresos Netos Diarios</CardTitle></CardHeader>
        <CardContent>
          <ReactECharts option={lineOption} style={{ height: 400 }} />
        </CardContent>
      </Card> */}
    </div>
  );
}