import Image from "next/image";
import Link from "next/link";

function SectionCard({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          {title}
        </h2>

        <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            {primaryLabel}
          </Link>

          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 px-6 py-20 dark:from-black dark:to-zinc-950">
      <main className="mx-auto max-w-5xl">
        {/* Hero */}
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <Image
              src="/next.svg"
              alt="Next.js logo"
              width={100}
              height={20}
              priority
              className="opacity-70"
            />
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Rental Insights
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Gestiona tus propiedades, controla tus costos y obtén métricas claras
            sobre ingresos, gastos y margen operativo.
          </p>
        </div>

        {/* Sections */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          <SectionCard
            title="Estancias"
            description="Administra reservas, ingresos y desempeño de cada propiedad en un solo lugar."
            primaryHref="/estancias/nueva"
            primaryLabel="Nueva Estancia"
            secondaryHref="/estancias"
            secondaryLabel="Ver Estancias"
          />

          <SectionCard
            title="Consumibles"
            description="Controla inventario, costos y consumo para optimizar tu margen."
            primaryHref="/consumibles/nuevo"
            primaryLabel="Nuevo Consumible"
            secondaryHref="/consumibles"
            secondaryLabel="Ver Consumibles"
          />

          <SectionCard
            title="Reportes"
            description="Visualiza métricas mensuales, ingresos, gastos y utilidad con claridad ejecutiva."
            primaryHref="/dashboard/mensual"
            primaryLabel="Ver Reportes"
          />
        </div>
      </main>
    </div>
  );
}
