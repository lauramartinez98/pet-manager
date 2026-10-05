import { Navigate, Outlet, useLocation, type Location } from 'react-router-dom'
import { LoadingState } from '../components/Feedback'
import { useAuth } from './auth-context'

/** Pantalla de carga mientras se comprueba la sesión guardada. */
function FullScreenLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingState label="Comprobando tu sesión…" />
    </div>
  )
}

/** Rutas privadas: sin sesión redirige a /login recordando a dónde quería ir el usuario */
export function RequireAuth() {
  const { status, loggedOut } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullScreenLoading />
  if (status === 'anonymous') {
    // Tras "Cerrar sesión" no se recuerda la página: la siguiente persona empieza en el inicio
    return <Navigate to="/login" replace state={loggedOut ? undefined : { from: location }} />
  }
  return <Outlet />
}

/** Login y registro: si ya hay sesión, vuelve a la página de origen (o al inicio) */
export function PublicOnly() {
  const { status } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from

  if (status === 'loading') return <FullScreenLoading />
  if (status === 'authenticated') return <Navigate to={from?.pathname ?? '/'} replace />
  return <Outlet />
}
