'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, differenceInDays } from 'date-fns';
import { useState, useEffect } from 'react';
import { createStay, updateStay } from '../actions/stays';
import { staySchema, type StayFormData } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Calculator } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
// import { Consumable } from '@/lib/mongodb';

// En StayForm.tsx → añade este prop
export default function StayForm({ initialData, isEdit }: { initialData?: any; isEdit?: boolean }) {
  // ...

  const onSubmit = async (data: StayFormData) => {
    setIsSubmitting(true);
    try {
      const result = isEdit 
        ? await updateStay(initialData._id, data)
        : await createStay(data);

      if (result.success) {
        alert(isEdit ? '¡Estancia actualizada!' : '¡Estancia guardada!');
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
  const [isSubmitting, setIsSubmitting] = useState(false);

const {
  register,
  handleSubmit,
  watch,
  setValue,
  formState: { errors },
} = useForm<StayFormData>({
  resolver: zodResolver<StayFormData>(staySchema),
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

  const [openDialog, setOpenDialog] = useState(false);
const [consumablesMaster, setConsumablesMaster] = useState<any[]>([]);
// Añadir TODOS los consumibles activos de golpe
const handleAddAllConsumables = () => {
  const nights = watch('nights') || 1;
  const guests = watch('guests') || 1;

  const newConsumables = consumablesMaster.map((cons) => {
    let qty = 1;

    switch (cons.appliesPer) {
      case 'stay':
        qty = 1;
        break;
      case 'night':
        qty = nights;
        break;
      case 'guest':
        qty = guests;
        break;
      case 'person-night':
        qty = nights * guests;
        break;
    }

    const total = qty * cons.unitCost;

    return {
      consumableId: cons._id,
      name: cons.name,
      qty,
      unitCost: cons.unitCost,
      total,
    };
  });

  // Añadimos solo los que aún no están en la lista (evitamos duplicados)
  const currentNames = consumables.map(c => c.name);
  const filteredNew = newConsumables.filter(item => !currentNames.includes(item.name));

  setValue('consumables', [...consumables, ...filteredNew]);

  // Opcional: mensaje bonito
  if (filteredNew.length > 0) {
    alert(`¡Se añadieron ${filteredNew.length} consumibles automáticamente!`);
  } else {
    alert('Todos los consumibles ya estaban añadidos 😉');
  }
};

// Cargar consumibles maestros al montar
useEffect(() => {
  async function loadMaster() {
    const res = await fetch('/api/consumables');
    const data = await res.json();
    setConsumablesMaster(data);
  }
  loadMaster();
}, []);

// Función para calcular cantidad sugerida
const calculateSuggestedQty = (cons: any) => {
  const nights = watch('nights') || 1;
  const guests = watch('guests') || 1;

  switch (cons.appliesPer) {
    case 'stay': return 1;
    case 'night': return nights;
    case 'guest': return guests;
    case 'person-night': return nights * guests;
    default: return 1;
  }
};

const calculateSuggestedTotal = (cons: any) => {
  return calculateSuggestedQty(cons) * cons.unitCost;
};

const getAppliesText = (type: string) => {
  const texts: Record<string, string> = {
    stay: 'por estancia',
    night: 'por noche',
    guest: 'por huésped',
    'person-night': 'por persona-noche',
  };
  return texts[type] || type;
};

// Añadir consumible con cálculo automático
const handleAddConsumable = (cons: any) => {
  const qty = calculateSuggestedQty(cons);
  const total = qty * cons.unitCost;

  const newItem = {
    consumableId: cons._id,
    name: cons.name,
    qty,
    unitCost: cons.unitCost,
    total,
  };

  setValue('consumables', [...consumables, newItem]);
  setOpenDialog(false);
};

// Actualizar cantidad manual (y recalcular total)
const updateConsumableQty = (index: number, newQty: number) => {
  const item = consumables[index];
  const newTotal = newQty * item.unitCost;
  setValue(`consumables.${index}.qty`, newQty);
  setValue(`consumables.${index}.total`, newTotal);
};

  // Cálculo automático de noches
  useEffect(() => {
    if (startDate && endDate) {
      const nights = differenceInDays(new Date(endDate), new Date(startDate));
      setValue('nights', nights > 0 ? nights : 0);
    }
  }, [startDate, endDate, setValue]);

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
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleAddAllConsumables}
      className="border-green-600 text-green-600 hover:bg-green-50"
    >
      <Plus className="w-4 h-4 mr-1" />
      Añadir Todos
    </Button>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Añadir Consumible
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecciona un consumible maestro</DialogTitle>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Buscar consumible..." />
          <CommandList>
            <CommandEmpty>No se encontraron consumibles.</CommandEmpty>
            <CommandGroup heading="Consumibles activos">
              {consumablesMaster.map((cons) => (
                <CommandItem
                  key={cons._id}
                  onSelect={() => handleAddConsumable(cons)}
                  className="cursor-pointer"
                >
                  <div className="flex justify-between w-full">
                    <div>
                      <p className="font-medium">{cons.name}</p>
                      <p className="text-sm text-gray-500">
                        {cons.unit} • ${cons.unitCost.toLocaleString()} c/u • {getAppliesText(cons.appliesPer)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        + ${calculateSuggestedTotal(cons).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  </CardHeader>
  <CardContent className="space-y-3">
    {consumables.length === 0 && (
      <p className="text-center text-gray-500 py-8">
        No has añadido consumibles aún. Usa el botón de arriba para agregar desde el catálogo.
      </p>
    )}
    {consumables.map((item, index) => (
      <div key={index} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-4 rounded-lg">
        <div className="col-span-5 font-medium">{item.name}</div>
        <div className="col-span-2 text-center">
          <Input
            type="number"
            value={item.qty}
            onChange={(e) => updateConsumableQty(index, Number(e.target.value))}
            className="text-center"
          />
        </div>
        <div className="col-span-3 text-right">
          ${item.unitCost.toLocaleString()}
        </div>
        <div className="col-span-1 text-right font-bold text-green-600">
          ${item.total.toLocaleString()}
        </div>
        <div className="col-span-1 text-right">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => removeConsumable(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    ))}
    {consumables.length > 0 && (
      <div className="text-right font-bold text-lg pt-4 border-t">
        Total consumibles: ${consumables.reduce((s, c) => s + c.total, 0).toLocaleString()}
      </div>
    )}
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
              <div className="flex justify-between"><span>Ingreso Neto:</span> <strong>${(grossRevenue - platformFee).toLocaleString()}</strong></div>
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