// app/estancias/page.tsx
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Calendar, DollarSign, Users, TrendingUp, Plus } from 'lucide-react';
import { getAllStays, getMonthlySummaries } from '@/actions/stays';
import ExportAllToPDF from '@/components/AllStaysPDF';




export default async function EstanciasPage() {
  const stays = await getAllStays();
  const monthlySummaries = await getMonthlySummaries();

  // Ordenamos por fecha descendente
  const sortedStays = stays.sort((a: any, b: any) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Agrupamos por mes/año
  const staysByMonth: Record<string, any[]> = {};
  sortedStays.forEach((stay: any) => {
    const monthKey = format(new Date(stay.startDate), 'yyyy-MM');
    if (!staysByMonth[monthKey]) staysByMonth[monthKey] = [];
    staysByMonth[monthKey].push(stay);
  });

  const monthKeys = Object.keys(staysByMonth).sort((a, b) => b.localeCompare(a));
  console.log(new Date(monthKeys[2]).getMonth());

  return (
    <div className="container mx-auto py-10 max-w-7xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">Todas mis Estancias</h1>
          <p className="text-muted-foreground mt-2">
            {stays.length} estancias registradas en total
          </p>
        </div>
        <div className="flex gap-4">
  
        <Link href="/estancias/nueva">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Nueva Estancia
          </Button>
        </Link>

  <ExportAllToPDF staysByMonth={staysByMonth} monthlySummaries={monthlySummaries} />
</div>
      </div>

      {monthKeys.length === 0 ? (
        <Card className="text-center py-20">
          <CardContent>
            <p className="text-xl text-gray-500">
              Aún no tienes estancias registradas.
            </p>
            <Link href="/estancias/nueva" className="mt-6 inline-block">
              <Button size="lg">Crear tu primera estancia</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-12">
          {monthKeys.map((monthKey) => {
            const stays = staysByMonth[monthKey];
            const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const date = new Date(year, month - 1, 1);
  const monthName = format(date, 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase());
            const summary = monthlySummaries.find((s: any) => 
              s.year === date.getFullYear() && s.month === date.getMonth() + 1
            );

            return (
              <section key={monthKey}>
                {/* RESUMEN MENSUAL CLICABLE */}
                <Link href={`/dashboard/mensual?Pyear=${date.getFullYear()}&Pmonth=${date.getMonth() + 1}`}>
                  <div className="mb-6 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white cursor-pointer hover:opacity-90 transition-opacity shadow-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                          <Calendar className="w-8 h-8" />
                          {monthName}
                          <ArrowRight className="w-6 h-6 ml-2" />
                        </h2>
                        <p className="text-xl mt-2 opacity-90">
                          {stays.length} estancias • {stays.reduce((s: any, stay: any) => s + stay.nights, 0)} noches
                        </p>
                      </div>
                      {summary && (
                        <div className="text-right space-y-2">
                          <div className="text-3xl font-bold">
                            ${summary.profit.toLocaleString()}
                          </div>
                          <div className="text-sm opacity-90">
                            Ganancia neta
                          </div>
                          <Badge variant="secondary" className="text-lg px-4 py-2">
                            {summary.profitMargin.toFixed(1)}% margen
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                <Separator className="mb-8" />

                {/* TARJETAS DE ESTANCIAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {stays.map((stay: any) => (
                    <Link key={stay._id} href={`/estancias/${stay._id}`}>
                      <Card className="hover:shadow-xl transition-all hover:border-blue-500 cursor-pointer h-full">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl">{stay.guestName}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {format(new Date(stay.startDate), 'dd')} → {format(new Date(stay.endDate), 'dd MMM yyyy', { locale: es })}
                              </p>
                            </div>
                            <Badge variant={stay.channel === 'directo' ? 'default' : 'secondary'}>
                              {stay.channel}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {stay.guests} huéspedes
                            </span>
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {stay.nights} noches
                            </span>
                          </div>

                          <div className="pt-4 border-t space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Ingreso neto</span>
                              <span className="font-semibold">${stay.netRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Gastos totales</span>
                              <span className="text-red-600">-${stay.totalCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                              <span className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                Ganancia
                              </span>
                              <span className="text-green-600">
                                ${stay.profit.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-right">
                              <Badge variant={stay.profitMargin >= 60 ? 'default' : stay.profitMargin >= 40 ? 'secondary' : 'destructive'}>
                                {stay.profitMargin.toFixed(1)}% margen
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}