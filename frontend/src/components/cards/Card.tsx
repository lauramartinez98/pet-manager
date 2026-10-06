import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface CardProps {
  title: string
  icon: LucideIcon
  action?: ReactNode
  children: ReactNode
}

/** Contenedor común de las tarjetas del dashboard (ui-guidelines: Butter Yellow, bordes suaves y sombra ligera) */
export default function Card({ title, icon: Icon, action, children }: CardProps) {
  return (
    <section className="flex flex-col rounded-3xl bg-butter-yellow p-6 shadow-lg shadow-brown/5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg text-brown">
          <Icon className="size-5" aria-hidden="true" />
          {title}
        </h3>
        {action}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  )
}

/** Mensaje para cuando una tarjeta todavía no tiene datos. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-brown/20 px-4 py-6 text-center text-sm font-light text-brown/75">
      {children}
    </p>
  )
}
