// app/dashboard/anual/page.tsx
export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Stay, dbConnect } from '@/lib/mongodb';

export default async function AnnualSelectPage() {
  await dbConnect();
  
  // Obtener todos los años con estancias
  const stays = await Stay.find({ status: 'completed' }).sort({ startDate: 1 });
  
  if (stays.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">No hay estancias registradas</h1>
        <Link href="/estancias">
          <Badge variant="outline" className="text-lg px-6 py-3">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a estancias
          </Badge>
        </Link>
      </div>
    );
  }
  
  // Obtener años únicos
  const yearsSet = new Set<number>();
  stays.forEach(stay => {
    const year = new Date(stay.startDate).getFullYear();
    yearsSet.add(year);
  });
  
  const years = Array.from(yearsSet).sort((a, b) => b - a); // Más reciente primero
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-4">
          <Link href="/estancias">
            <Badge variant="outline" className="p-3">
              <ArrowLeft className="w-6 h-6" />
            </Badge>
          </Link>
          Reportes Anuales
        </h1>
        <p className="text-muted-foreground mt-2">
          Selecciona un año para ver el resumen completo
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {years.map((year) => (
          <Link key={year} href={`/dashboard/anual/${year}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{year}</span>
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {year === currentYear && (
                  <Badge variant="default" className="mb-2">
                    Año actual
                  </Badge>
                )}
                <p className="text-sm text-muted-foreground">
                  {stays.filter(s => new Date(s.startDate).getFullYear() === year).length} estancias
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}