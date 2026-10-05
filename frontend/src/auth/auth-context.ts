import { createContext, useContext } from 'react'
import type { LoginRequest, RegisterRequest, UserResponse } from '../types/api-types'

export type AuthStatus =
  /** Hay un token guardado y se está validando con GET /auth/me */
  | 'loading'
  | 'authenticated'
  | 'anonymous'

export interface AuthContextValue {
  status: AuthStatus
  user: UserResponse | null
  /**
   * true si la sesión se cerró con "Cerrar sesión". Entonces el login no debe volver a la página
   * anterior (podría entrar otra persona); sí lo hace si la sesión caducó.
   */
  loggedOut: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  /** Inicia sesión con un token ya emitido (vuelta del login con Google) */
  loginWithToken: (token: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
