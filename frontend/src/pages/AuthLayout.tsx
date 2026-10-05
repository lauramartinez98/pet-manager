import type { ReactNode } from 'react'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

/** Marco común de login y registro: tarjeta Butter Yellow centrada sobre fondo cálido */
export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span
            className="flex size-16 items-center justify-center rounded-full bg-soft-blue text-3xl shadow-lg shadow-brown/10"
            aria-hidden="true"
          >
            🐾
          </span>
          <p className="mt-3 font-display text-lg font-extrabold tracking-tight text-brown">Pet Manager</p>
        </div>

        <section className="rounded-3xl bg-butter-yellow p-8 shadow-lg shadow-brown/5">
          <h1 className="text-2xl text-brown">{title}</h1>
          <p className="mt-1 text-sm font-light text-brown/75">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </section>

        <p className="mt-6 text-center text-sm text-brown/80">{footer}</p>
      </div>
    </main>
  )
}
