import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as api from '../api/api-client'
import { clearToken, getToken, onUnauthorized, setToken } from '../api/token-storage'
import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../types/api-types'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'

interface AuthState {
  status: AuthStatus
  user: UserResponse | null
  loggedOut: boolean
}

/** Gestiona la sesión: valida el token guardado al arrancar y expone login, registro y logout al resto de la app. */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    status: getToken() ? 'loading' : 'anonymous',
    user: null,
    loggedOut: false,
  }))

  // Al arrancar, valida el token guardado (puede haber caducado)
  useEffect(() => {
    if (!getToken()) return
    const controller = new AbortController()
    api
      .getMe(controller.signal)
      .then((user) => setState({ status: 'authenticated', user, loggedOut: false }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        // Con 401 el token ya no sirve; con un error de red se conserva para reintentar más tarde
        if (error instanceof api.ApiError && error.status === 401) clearToken()
        setState({ status: 'anonymous', user: null, loggedOut: false })
      })
    return () => controller.abort()
  }, [])

  // Cualquier 401 de la API con token (caducado durante el uso) cierra la sesión
  useEffect(
    () =>
      onUnauthorized(() => {
        clearToken()
        setState({ status: 'anonymous', user: null, loggedOut: false })
      }),
    [],
  )

  const startSession = useCallback((response: AuthResponse) => {
    setToken(response.token)
    setState({ status: 'authenticated', user: response.user, loggedOut: false })
  }, [])

  const login = useCallback(
    async (data: LoginRequest) => startSession(await api.login(data)),
    [startSession],
  )

  const register = useCallback(
    async (data: RegisterRequest) => startSession(await api.register(data)),
    [startSession],
  )

  const loginWithToken = useCallback(async (token: string) => {
    setToken(token)
    try {
      const user = await api.getMe()
      setState({ status: 'authenticated', user, loggedOut: false })
    } catch (error) {
      clearToken()
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setState({ status: 'anonymous', user: null, loggedOut: true })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, loginWithToken, logout }),
    [state, login, register, loginWithToken, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
