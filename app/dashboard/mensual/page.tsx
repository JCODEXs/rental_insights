// app/dashboard/mensual/page.tsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getMonthlyReport } from '@/actions/reports';
import MonthlyCharts from '@/components/MonthlyCharts';
import ExportMonthlyPDFButton from '@/components/ExportMonthlyPDFButton';




export default async function MonthlyDashboardPage({ searchParams }: { searchParams: { Pyear?: string; Pmonth?: string } }) {
  const {Pyear,Pmonth} = await searchParams
 
    const year = Number(Pyear) || new Date().getFullYear();
    const month = Number(Pmonth) || new Date().getMonth() + 1;

  const report = await getMonthlyReport(year, month);


//     // 1. Barras: Ganancia por estancia
//   const barOption = {
//     tooltip: { trigger: 'axis' },
//     xAxis: { type: 'category', data: report?.staysSummary.map((s: any) => s.guestName.substring(0, 10)) },
//     yAxis: { type: 'value' },
//     series: [{
//       name: 'Ganancia',
//       type: 'bar',
//       data: report?.staysSummary.map((s: any) => s.profit),
//       itemStyle: { color: '#10b981' },
//       label: { show: true, position: 'top', formatter: '${c}' }
//     }]
//   };

//   // 2. Pie: Distribución de gastos
//   const pieOption = {
//     tooltip: { trigger: 'item' },
//     series: [{
//       type: 'pie',
//       radius: ['40%', '70%'],
//       data: [
//         { value: report?.byCategory.limpieza, name: 'Limpieza + Lavandería' },
//         { value: report?.byCategory.consumibles, name: 'Consumibles' },
//         { value: report?.byCategory.otros, name: 'Otros Gastos' },
//       ],
//       emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } }
//     }]
//   };



  const monthName = format(new Date(year, month - 1), 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase());

  if (!report) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">No hay datos para {monthName}</h1>
        <Link href="/estancias">
          <Badge variant="outline" className="text-lg px-6 py-3">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a estancias
          </Badge>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-7xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-4">
            <Link href="/estancias">
              <Badge variant="outline" className="p-3">
                <ArrowLeft className="w-6 h-6" />
              </Badge>
            </Link>
            Resumen {monthName}
          </h1>
          <p className="text-muted-foreground mt-2">
            {report.totalStays} estancias • {report.totalNights} noches ocupadas
          </p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-green-600">
            ${report.profit.toLocaleString()}
          </div>
          <p className="text-xl text-muted-foreground">Ganancia neta</p>
          <Badge variant={report.avgMargin >= 60 ? 'default' : report.avgMargin >= 40 ? 'secondary' : 'destructive'} className="text-2xl px-6 py-3 mt-4">
            {report.avgMargin.toFixed(1)}% margen promedio
          </Badge>
        </div>
      </div>

      {/* TARJETAS RESUMEN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Ingresos Netos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">${report.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Gastos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">${report.totalCosts.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Promedio por Noche</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${(report.profit / report.totalNights || 0).toFixed(0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Ocupación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {report.occupancyRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICOS ECHARTS */}
    
<div className="mt-10">
 <ExportMonthlyPDFButton report={report} year={year} month={month} />
    
</div>


<MonthlyCharts report={report} year={year} month={month} />
    </div>
  );
}