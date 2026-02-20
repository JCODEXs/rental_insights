// app/estancias/[id]/editar/page.tsx
import { notFound } from 'next/navigation';
import StayForm from '@/components/StayForm';
import { getStayById } from '@/actions/stays';

export default async function EditStayPage({ params }: { params: { id: string } }) {
    const {id}=  await params
  const stay = await getStayById(id);
// console.log(stay)
  if (!stay) notFound();

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Editar Estancia</h1>
      <StayForm initialData={stay} isEdit />
    </div>
  );
}