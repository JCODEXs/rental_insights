// app/consumibles/nuevo/page.tsx
import ConsumibleForm from '@/components/ConsumibleForm';
import { getConsumableById } from '@/actions/consumables';

export default async function NuevoConsumiblePage({ searchParams }: { searchParams: { id?: string } }) {
  const id = await searchParams.id;
  let initialData = null;

  if (id) {
    initialData = await getConsumableById(id);
  }

  return <ConsumibleForm initialData={initialData} />;
}