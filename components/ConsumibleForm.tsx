// components/ConsumibleForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { consumableSchema, type ConsumableFormData } from '@/lib/schemas';
import { createConsumable, updateConsumable } from '@/actions/consumables';
import { useEffect } from 'react';

export default function ConsumibleForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConsumableFormData>({
    resolver: zodResolver(consumableSchema),
    defaultValues: initialData || {
      name: '',
      unit: 'unidad',
      unitCost: 0,
      appliesPer: 'night',
      isActive: true,
    },
  });

  // Si es edición, cargar datos
  useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name);
      setValue('unit', initialData.unit);
      setValue('unitCost', initialData.unitCost);
      setValue('appliesPer', initialData.appliesPer);
      setValue('isActive', initialData.isActive);
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: ConsumableFormData) => {
    let result;

  if (isEdit) {
    result = await updateConsumable(initialData._id, data);
  } else {
    result = await createConsumable(data);
  }

    if (result.success) {
      router.push('/consumibles');
      router.refresh();
    } else {
      alert('Error: ' + result.error);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEdit ? 'Editar Consumible' : 'Nuevo Consumible'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label>Nombre del consumible</Label>
              <Input {...register('name')} placeholder="Ej: Papel higiénico" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unidad</Label>
                <Input {...register('unit')} placeholder="Ej: rollo, paquete, botella" />
              </div>
              <div>
                <Label>Costo por unidad ($)</Label>
                <Input type="number" {...register('unitCost', { valueAsNumber: true })} min="0" />
                {errors.unitCost && <p className="text-red-500 text-sm mt-1">{errors.unitCost.message}</p>}
              </div>
            </div>

            <div>
              <Label>Se aplica por:</Label>
              <Select onValueChange={(v) => setValue('appliesPer', v as any)} defaultValue={initialData?.appliesPer || 'night'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stay">Estancia completa</SelectItem>
                  <SelectItem value="night">Noche</SelectItem>
                  <SelectItem value="guest">Huésped total</SelectItem>
                  <SelectItem value="person-night">Persona x Noche</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Consumible')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}