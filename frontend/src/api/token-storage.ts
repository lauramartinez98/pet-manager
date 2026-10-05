// Persistencia del JWT entre recargas. localStorage puede no estar disponible (modo privado, bloqueos),
// así que todos los accesos van protegidos y la app sigue funcionando (solo se pierde la sesión al recargar).
const TOKEN_KEY = 'pet-manager.token'

let memoryToken: string | null = null

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? memoryToken
  } catch {
    return memoryToken
  }
}

export function setToken(token: string): void {
  memoryToken = token
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Sin almacenamiento: el token vive solo en memoria
  }
}

export function clearToken(): void {
  memoryToken = null
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Nada que limpiar
  }
}

// Aviso global cuando el backend rechaza el token (caducado o inválido) para que la app cierre sesión
type Listener = () => void
const unauthorizedListeners = new Set<Listener>()

export function onUnauthorized(listener: Listener): () => void {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

export function notifyUnauthorized(): void {
  unauthorizedListeners.forEach((listener) => listener())
}
