import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { LoadingState } from '../components/Feedback'

/** Lee y retira el token del fragmento (#token=...) para que no quede en el historial ni en la barra de direcciones */
function takeTokenFromHash(): string | null {
  const token = new URLSearchParams(window.location.hash.slice(1)).get('token')
  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname)
  }
  return token
}

/** Destino de la vuelta del login con Google: /auth/callback#token=<jwt> */
export default function AuthCallbackPage() {
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()
  // Inicializador perezoso: se lee una sola vez aunque StrictMode ejecute el efecto dos veces
  const [token] = useState(takeTokenFromHash)

  useEffect(() => {
    if (!token) {
      navigate('/login?error=google', { replace: true })
      return
    }
    loginWithToken(token).then(
      () => navigate('/', { replace: true }),
      () => navigate('/login?error=google', { replace: true }),
    )
  }, [token, loginWithToken, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingState label="Entrando con Google…" />
    </div>
  )
}
