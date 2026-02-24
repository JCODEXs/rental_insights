// app/dashboard/total/page.tsx
export const dynamic = "force-dynamic";

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getTotalReport } from '@/actions/reports';
import TotalCharts from '@/components/TotalCharts';

export default async function TotalDashboardPage() {
  const report = await getTotalReport();
//   console.log(report,"report")

  if (!report) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">No hay datos disponibles</h1>
        <Link href="/estancias">
          <Badge variant="outline" className="text-lg px-6 py-3">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a estancias
          </Badge>
        </Link>
      </div>
    );
  }

  const dateRange = `${format(report.firstStayDate, 'MMM yyyy', { locale: es })} - ${format(report.lastStayDate, 'MMM yyyy', { locale: es })}`;

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
            Resumen Total
          </h1>
          <p className="text-muted-foreground mt-2">
            {dateRange} • {report.years} años • {report.totalStays} estancias
          </p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-green-600">
            ${report.profit.toLocaleString()}
          </div>
          <p className="text-xl text-muted-foreground">Ganancia histórica</p>
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
            <CardTitle className="text-lg">Noches Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {report.totalNights.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Promedio por Noche</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              ${(report.profit / report.totalNights).toFixed(0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Promedio Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${(report.profit / report.years).toFixed(0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <TotalCharts report={report} />
    </div>
  );
}