
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit, Trash2, ArrowLeft, DollarSign, Users, Calendar } from 'lucide-react';
import { getStayById, deleteStay } from '@/actions/stays';

import ExportPDFButton from '@/components/StayPDF';




export default async function StayDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const {id}=  await params
  const stay = await getStayById(id);
// console.log(stay,"stay")
  if (!stay) notFound();

  const startDate = new Date(stay.startDate)
const endDate = new Date(stay.endDate)

const formattedStart = format(
  new Date(startDate.toISOString()),
  "dd 'de' MMMM",
  { locale: es }
)

const formattedEnd = format(
  new Date(endDate.toISOString()),
  "dd 'de' MMMM yyyy",
  { locale: es }
)


  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <Link href="/estancias">
          <Button variant="outline">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a estancias
          </Button>
        </Link>

        <div className="flex gap-3">
          <Link href={`/estancias/${id}/editar`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>

<div className="flex gap-3">
  <ExportPDFButton stay={stay} />
  
</div>
          <form action={deleteStay}>
            <input type="hidden" name="id" value={id} />
            <Button variant="destructive" type="submit">
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Info principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl">{stay.guestName}</CardTitle>
                 <p className="text-lg text-muted-foreground mt-2">
  {formattedStart} → {formattedEnd}
</p>
                </div>
                <Badge variant={stay.channel === 'directo' ? 'default' : 'secondary'} className="text-lg px-4">
                  {stay.channel.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    Huéspedes
                  </p>
                  <p className="text-3xl font-bold">{stay.guests}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Noches
                  </p>
                  <p className="text-3xl font-bold">{stay.nights}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ingreso por noche</p>
                  <p className="text-2xl font-bold">
                    ${(stay.netRevenue / stay.nights).toFixed(0).toLocaleString()}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Resumen económico */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Ingreso bruto</span>
                  <span className="font-semibold">${stay.grossRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-red-600">- Comisión plataforma</span>
                  <span className="text-red-600">-${stay.platformFee.toLocaleString()}</span>
                </div>
                {stay.cleaningFeeCharged > 0 && (
                  <div className="flex justify-between text-lg">
                    <span>+ Cargo limpieza huésped</span>
                    <span className="text-green-600">+${stay.cleaningFeeCharged.toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-2xl font-bold">
                  <span>Ingreso Neto</span>
                  <span className="text-blue-600">${stay.netRevenue.toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Gastos registrados</h3>
                <div className="bg-red-50 rounded-lg p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Limpieza </span>
                      <span className="font-medium">${stay.cleaningCost.toLocaleString()}</span>
                    </div>
                    {stay.consumables.length > 0 && (
                      <>
                        <Separator />
                        {stay.consumables.map((c: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>{c.name} × {c.qty}</span>
                            <span>${c.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {stay.otherExpenses.length > 0 && (
                      <>
                        <Separator />
                        {stay.otherExpenses.map((e: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>{e.description}</span>
                            <span>${e.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </>
                    )}
                    <Separator className="border-2 border-red-200" />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total Gastos</span>
                      <span className="text-red-600">${stay.totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RESULTADO FINAL */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white text-center">
                <p className="text-2xl mb-2">GANANCIA NETA</p>
                <p className="text-6xl font-bold">${stay.profit.toLocaleString()}</p>
                <p className="text-3xl mt-4 opacity-90">
                  Margen: {stay.profitMargin.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>

          {stay.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{stay.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna derecha: Resumen rápido */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
            <CardContent className="pt-6 text-center">
              <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-80" />
              <p className="text-4xl font-bold">${stay.profit.toLocaleString()}</p>
              <p className="text-xl mt-2">Ganancia total</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}