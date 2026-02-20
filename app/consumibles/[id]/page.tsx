import ConsumibleForm from '@/components/ConsumibleForm';
import { getConsumableById } from '@/actions/consumables';


export default async function NuevoConsumiblePage({ params }: { params: Promise<{ id?: string }> }) {
  const {id} = await params

  let initialData = null;

  if (id) {
    initialData = await getConsumableById(id);
    // console.log(initialData,"initialData")
  }

  return <ConsumibleForm initialData={initialData} />;
}