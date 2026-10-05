import type { ReactNode } from 'react'

interface CardProps {
  title: string
  icon: string
  action?: ReactNode
  children: ReactNode
}

// Contenedor común de las tarjetas del dashboard (ui-guidelines: Butter Yellow, bordes suaves y sombra ligera)
export default function Card({ title, icon, action, children }: CardProps) {
  return (
    <section className="flex flex-col rounded-2xl bg-butter-yellow p-6 shadow-md shadow-brown/10">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-brown">
          <span aria-hidden="true">{icon}</span>
          {title}
        </h3>
        {action}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-brown/20 px-4 py-6 text-center text-sm text-brown/60">
      {children}
    </p>
  )
}
