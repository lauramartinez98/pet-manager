/**
 * Persistencia del JWT entre recargas. localStorage puede no estar disponible (modo privado, bloqueos),
 * así que todos los accesos van protegidos y la app sigue funcionando (solo se pierde la sesión al recargar).
 */
const TOKEN_KEY = 'pet-manager.token'

let memoryToken: string | null = null

/** Devuelve el JWT guardado (localStorage o, si no está disponible, memoria). */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? memoryToken
  } catch {
    return memoryToken
  }
}

/** Guarda el JWT en localStorage y en memoria. */
export function setToken(token: string): void {
  memoryToken = token
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Sin almacenamiento: el token vive solo en memoria
  }
}

/** Borra el JWT guardado (cierre de sesión). */
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

/** Suscribe una función al aviso de token rechazado; devuelve la función para darse de baja. */
export function onUnauthorized(listener: Listener): () => void {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

/** Avisa a los suscriptores de que el backend ha rechazado el token. */
export function notifyUnauthorized(): void {
  unauthorizedListeners.forEach((listener) => listener())
}
