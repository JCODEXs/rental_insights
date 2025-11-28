import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-bold mb-8">Rental Insights</h1>
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <h2 className="text-2xl font-bold mb-8">Estancias</h2>
        <p className="text-lg mb-8">
          Gestiona tus estancias y obtén insights sobre tus ingresos y gastos.
        </p>
        <a
          href="/estancias/nueva"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Nueva Estancia
        </a>
        <a
          href="/estancias"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Ver Estancias
        </a>
        <h2 className="text-2xl font-bold mb-8">Consumibles</h2>
        <p className="text-lg mb-8">
          Gestiona tus consumibles y obtén insights sobre tus costos.
        </p>
        <a
          href="/consumibles/nuevo"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Nuevo Consumible
        </a>
        <a
          href="/consumibles"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Ver Consumibles
        </a>
        <h2 className="text-2xl font-bold mb-8">Reportes</h2>
        <p className="text-lg mb-8">
          Obtén reportes sobre tus ingresos, gastos y margen de utilidad.
        </p>
        <a
          href="/reportes"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Ver Reportes
        </a>    
        
      </main>
    </div>
  );
}
