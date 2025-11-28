'use client';
import StayForm from '@/components/StayForm';

export default function NuevaEstanciaPage() {
  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Nueva Estancia</h1>
      <StayForm />
    </div>
  );
}