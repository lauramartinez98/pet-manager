import { Navigate } from 'react-router-dom'
import { useLayoutContext } from '../hooks/useLayoutContext'
import { LoadingState } from './Feedback'

// Ruta "/": abre la primera mascota del usuario, o invita a crear una si no tiene
export default function HomeRedirect() {
  const { pets, petsLoading, petsError } = useLayoutContext()

  if (petsLoading) return <LoadingState label="Cargando tus mascotas…" />
  // El error ya se muestra en el Navbar con su botón de reintentar
  if (petsError != null || !pets) return null

  if (pets.length > 0) {
    return <Navigate to={`/pets/${pets[0].id}`} replace />
  }

  return (
    <section className="mx-auto mt-16 max-w-md rounded-3xl bg-butter-yellow p-10 text-center shadow-sm">
      <p className="text-5xl" aria-hidden="true">🐾</p>
      <h2 className="mt-4 text-2xl font-bold text-brown">Aún no hay ningún miembro</h2>
      <p className="mt-2 text-brown/70">Usa «+ Nuevo miembro» para añadir tu primera mascota.</p>
    </section>
  )
}
