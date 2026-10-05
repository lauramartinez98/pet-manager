import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import type { PetResponse } from '../types/api-types'
import { ErrorState, LoadingState } from './Feedback'
import PetAvatar from './PetAvatar'

interface NavbarProps {
  pets: PetResponse[] | undefined
  loading: boolean
  error: unknown
  onRetry: () => void
  onNewPet: () => void
}

export default function Navbar({ pets, loading, error, onRetry, onNewPet }: NavbarProps) {
  const { user, logout } = useAuth()
  const firstName = user?.fullName.split(' ')[0]

  return (
    <aside className="fixed inset-y-0 left-0 flex h-screen w-64 flex-col bg-soft-blue px-4 py-6">
      <div className="px-2">
        <p className="text-sm text-brown/70">🐾 Pet Manager</p>
        <h1 className="mt-1 truncate text-xl font-bold text-brown" title={user?.fullName}>
          Bienvenido{firstName ? `, ${firstName}` : ' Dueño'}
        </h1>
      </div>

      <nav className="mt-8 flex-1 overflow-y-auto" aria-label="Mis mascotas">
        <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-brown/60 uppercase">
          Mis mascotas
        </p>

        {loading && !pets && <LoadingState />}
        {error != null && <ErrorState error={error} onRetry={onRetry} />}
        {pets?.length === 0 && (
          <p className="px-2 text-sm text-brown/70">Todavía no tienes mascotas.</p>
        )}

        <ul className="space-y-1.5">
          {pets?.map((pet) => (
            <li key={pet.id}>
              <NavLink
                to={`/pets/${pet.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm font-medium text-brown transition-colors ${
                    isActive ? 'bg-butter-yellow-light shadow-sm' : 'hover:bg-white/40'
                  }`
                }
              >
                <PetAvatar pet={pet} className="size-8" />
                <span className="truncate">{pet.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={onNewPet}
          className="w-full rounded-xl bg-brown px-4 py-2.5 text-sm font-semibold text-butter-yellow-light shadow-sm transition-opacity hover:opacity-90"
        >
          + Nuevo miembro
        </button>
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-xl border border-brown/30 px-4 py-2.5 text-sm font-medium text-brown transition-colors hover:bg-white/40"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
