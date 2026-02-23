// app/consumibles/page.tsx
export const dynamic = "force-dynamic";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getAllConsumables, deleteConsumable } from '@/actions/consumables';

export default async function ConsumiblesPage() {
  const consumables = await getAllConsumables();

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Consumibles Maestros</h1>
        <Link href="/consumibles/nuevo">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Consumible
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consumables.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-10 text-gray-500">
              Aún no tienes consumibles registrados.<br />
              Crea algunos para autocompletar en las estancias.
            </CardContent>
          </Card>
        ) : (
          consumables.map((c: any) => (
            <Card key={c._id} className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{c.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Unidad:</span> {c.unit}
                </div>
                <div className="text-lg font-semibold text-green-600">
                  ${c.unitCost.toLocaleString()} por {c.unit}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Se aplica por:</span>{' '}
                  <span className="capitalize">
                    {c.appliesPer === 'person-night' ? 'persona-noche' : c.appliesPer}
                  </span>
                </div>
                <div className="flex gap-2 pt-4">
                  <Link href={`/consumibles/${c._id}`}>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </Link>
                  <form action={deleteConsumable}>
                    <input type="hidden" name="id" value={c._id.toString()} />
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}