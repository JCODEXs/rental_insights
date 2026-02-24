// app/dashboard/anual/[year]/page.tsx
export const dynamic = "force-dynamic";

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getAnnualReport } from '@/actions/reports';
import AnnualCharts from '@/components/AnnualCharts';

export default async function AnnualDashboardPage({ 
  params 
}: { 
  params: { year: string } 
}) {
  const { year: yearParam } = await params;
  const year = Number(yearParam);
  
  // Validar que el año sea válido
  if (isNaN(year) || year < 2000 || year > 2100) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Año inválido</h1>
        <Link href="/dashboard/anual">
          <Badge variant="outline" className="text-lg px-6 py-3">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a selección de año
          </Badge>
        </Link>
      </div>
    );
  }
  
  const report = await getAnnualReport(year);

  if (!report || report.totalStays === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">No hay datos para {year}</h1>
        <Link href="/dashboard/anual">
          <Badge variant="outline" className="text-lg px-6 py-3">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a selección de año
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
            <Link href="/dashboard/anual">
              <Badge variant="outline" className="p-3">
                <ArrowLeft className="w-6 h-6" />
              </Badge>
            </Link>
            Resumen Anual {year}
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
          <Badge 
            variant={report.avgMargin >= 60 ? 'default' : report.avgMargin >= 40 ? 'secondary' : 'destructive'} 
            className="text-2xl px-6 py-3 mt-4"
          >
            {report.avgMargin.toFixed(1)}% margen promedio
          </Badge>
        </div>
      </div>

      {/* TARJETAS RESUMEN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              ${report.totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Gastos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              ${report.totalCosts.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Promedio Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              ${(report.profit / 12).toFixed(0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Mejor Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-purple-600">
              {format(new Date(year, report.topMonths[0].month - 1), 'MMMM', { locale: es })}
            </p>
            <p className="text-sm text-muted-foreground">
              ${report.topMonths[0].profit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <AnnualCharts report={report} year={year} />
    </div>
  );
}
