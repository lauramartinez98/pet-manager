import { ApiError } from '../api/api-client'

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) return 'No se ha encontrado.'
    if (error.status === 400) return 'Los datos enviados no son válidos.'
    if (error.status === 401 || error.status === 403) return 'No tienes permiso para ver esto.'
    if (error.status === 413) return 'La imagen supera los 5 MB.'
    if (error.status === 415) return 'Formato no admitido: usa JPG, PNG o WebP.'
    return `El servidor respondió con un error (${error.status}).`
  }
  // fetch lanza TypeError cuando no hay conexión o CORS bloquea la petición
  if (error instanceof TypeError) return 'No se puede conectar con el servidor. ¿Está arrancado el backend?'
  return 'Ha ocurrido un error inesperado.'
}
