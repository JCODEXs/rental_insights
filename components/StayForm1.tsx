'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, differenceInDays } from 'date-fns';
import { useState, useEffect } from 'react';
import { createStay } from '../actions/stays';
import { staySchema, type StayFormData } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Calculator } from 'lucide-react';


export default function StayForm({ initialData }: { initialData?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StayFormData>({
    resolver: zodResolver(staySchema),
    defaultValues: initialData || {
      channel: 'airbnb',
      status: 'completed',
      grossRevenue: 0,
      platformFee: 0,
      cleaningFeeCharged: 0,
      cleaningCost: 0,
      consumables: [],
      otherExpenses: [],
      notes: '',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const guests = watch('guests') || 1;
  const grossRevenue = watch('grossRevenue') || 0;
  const platformFee = watch('platformFee') || 0;
  const cleaningFeeCharged = watch('cleaningFeeCharged') || 0;
  const consumables = watch('consumables') || [];
  const otherExpenses = watch('otherExpenses') || [];
  const cleaningCost = watch('cleaningCost') || 0;

 
  // Cálculo automático de netRevenue y totales
  useEffect(() => {
    const net = grossRevenue +cleaningFeeCharged- platformFee;
    setValue('netRevenue', net);

    const totalConsumables = consumables.reduce((sum, c) => sum + (c.total || 0), 0);
    const totalOther = otherExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCost = cleaningCost + totalConsumables + totalOther;
    const profit = net - totalCost;
    const margin = net > 0 ? (profit / net) * 100 : 0;

    setValue('totalCost', totalCost);
    setValue('profit', profit);
    setValue('profitMargin', Number(margin.toFixed(2)));
  }, [grossRevenue, platformFee, cleaningCost, consumables, otherExpenses, setValue,cleaningFeeCharged]);

  const onSubmit = async (data: StayFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createStay(data);
      if (result.success) {
        alert('¡Estancia guardada con éxito!');
        window.location.href = '/estancias';
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      alert('Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers para añadir filas
  const addConsumable = () => {
    setValue('consumables', [...consumables, { name: '', qty: 1, unitCost: 0, total: 0 }]);
  };

  const addOtherExpense = () => {
    setValue('otherExpenses', [...otherExpenses, { description: '', amount: 0 }]);
  };

  const removeConsumable = (index: number) => {
    setValue('consumables', consumables.filter((_, i) => i !== index));
  };

  const removeOtherExpense = (index: number) => {
    setValue('otherExpenses', otherExpenses.filter((_, i) => i !== index));
  };

  // Cálculo automático de total en consumibles
  const updateConsumableTotal = (index: number, qty: number, unitCost: number) => {
    const total = qty * unitCost;
    setValue(`consumables.${index}.total`, total);
    setValue(`consumables.${index}.qty`, qty);
    setValue(`consumables.${index}.unitCost`, unitCost);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label>Nombre del huésped</Label>
            <Input {...register('guestName')} placeholder="Juan Pérez" />
            {errors.guestName && <p className="text-red-500 text-sm">{errors.guestName.message}</p>}
          </div>

          <div>
            <Label>Canal de reserva</Label>
            <Select onValueChange={(v) => setValue('channel', v as any)} defaultValue={watch('channel')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="airbnb">Airbnb</SelectItem>
                <SelectItem value="booking">Booking</SelectItem>
                <SelectItem value="directo">Directo / WhatsApp</SelectItem>
                <SelectItem value="otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Check-in</Label>
            <Input type="date" {...register('startDate')} />
            {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
          </div>

          <div>
            <Label>Check-out</Label>
            <Input type="date" {...register('endDate')} />
            {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
          </div>

          <div>
            <Label>Huéspedes</Label>
            <Input type="number" {...register('guests', { valueAsNumber: true })} min="1" />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              Noches calculadas automáticamente
              <Calculator className="w-4 h-4 text-green-600" />
            </Label>
            <div className="text-2xl font-bold text-green-600">
              {watch('nights') || 0}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ingresos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="costos">Costos</TabsTrigger>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
        </TabsList>

        <TabsContent value="ingresos" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Ingresos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ingreso BRUTO (total cobrado al huésped)</Label>
                  <Input type="number" {...register('grossRevenue', { valueAsNumber: true })} />
                </div>
                <div>
                  <Label>Comisión plataforma (Airbnb ~15-20%)</Label>
                  <Input type="number" {...register('platformFee', { valueAsNumber: true })} placeholder="Ej: 75000" />
                </div>
              </div>
              <div>
                <Label>Cargo por limpieza al huésped (opcional)</Label>
                <Input type="number" {...register('cleaningFeeCharged', { valueAsNumber: true })} />
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-lg font-semibold">Ingreso Neto (te llega): ${(grossRevenue +cleaningFeeCharged- platformFee).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Limpieza real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Costo total de limpieza </Label>
                  <Input type="number" {...register('cleaningCost', { valueAsNumber: true })} placeholder="Ej: 80000" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Consumibles</CardTitle>
              <Button type="button" size="sm" onClick={addConsumable}><Plus className="w-4 h-4 mr-1" /> Añadir</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {consumables.length === 0 && <p className="text-gray-500">Aún no has añadido consumibles</p>}
              {consumables.map((_, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Input placeholder="Ej: Papel higiénico" {...register(`consumables.${index}.name`)} />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" placeholder="Cant." {...register(`consumables.${index}.qty`, { valueAsNumber: true })}
                      onChange={(e) => updateConsumableTotal(index, Number(e.target.value), watch(`consumables.${index}.unitCost`) || 0)} />
                  </div>
                  <div className="col-span-3">
                    <Input type="number" placeholder="Costo unit." {...register(`consumables.${index}.unitCost`, { valueAsNumber: true })}
                      onChange={(e) => updateConsumableTotal(index, watch(`consumables.${index}.qty`) || 0, Number(e.target.value))} />
                  </div>
                  <div className="col-span-1 text-right font-semibold">
                    ${(watch(`consumables.${index}.total`) || 0).toLocaleString()}
                  </div>
                  <div className="col-span-1">
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeConsumable(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Otros gastos</CardTitle>
              <Button type="button" size="sm" onClick={addOtherExpense}><Plus className="w-4 h-4 mr-1" /> Añadir</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {otherExpenses.map((_, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-8">
                    <Input placeholder="Descripción" {...register(`otherExpenses.${index}.description`)} />
                  </div>
                  <div className="col-span-3">
                    <Input type="number" placeholder="Monto" {...register(`otherExpenses.${index}.amount`, { valueAsNumber: true })} />
                  </div>
                  <div className="col-span-1">
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeOtherExpense(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumen">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Resumen Económico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg">
              <div className="flex justify-between"><span>Ingreso Neto:</span> <strong>${(grossRevenue +cleaningFeeCharged- platformFee).toLocaleString()}</strong></div>
              <div className="flex justify-between"><span>Total Gastos:</span> <strong>${watch('totalCost')?.toLocaleString()}</strong></div>
              <div className="flex justify-between text-xl font-bold text-green-600">
                <span>GANANCIA NETA:</span>
                <span>${watch('profit')?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl">
                <span>Margen:</span>
                <span className={watch('profitMargin') >= 50 ? 'text-green-600' : 'text-orange-600'}>
                  {watch('profitMargin')}% 
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center">
        <Textarea {...register('notes')} placeholder="Notas adicionales..." className="max-w-2xl" rows={3} />
        <Button type="submit" size="lg" disabled={isSubmitting} className="px-10">
          {isSubmitting ? 'Guardando...' : 'Guardar Estancia'}
        </Button>
      </div>
    </form>
  );
}