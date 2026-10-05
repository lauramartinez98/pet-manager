import type {
  ApiErrorBody,
  AuthResponse,
  ExpenseRequest,
  ExpenseResponse,
  LoginRequest,
  PetRequest,
  PetResponse,
  RegisterRequest,
  UserResponse,
  VetAppointmentRequest,
  VetAppointmentResponse,
  WalkRequest,
  WalkResponse,
  WalksQuery,
} from '../types/api-types'
import { getToken, notifyUnauthorized } from './token-storage'

// servers[0].url de api-docs/openapi.yaml; se puede sobrescribir con VITE_API_BASE_URL
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'

/**
 * Inicio del login con Google. No es un endpoint REST sino una navegación completa del navegador:
 * el backend redirige a Google y, al volver, a /auth/callback#token=... del frontend.
 */
export const GOOGLE_LOGIN_URL = `${new URL(API_BASE_URL).origin}/oauth2/authorization/google`

export class ApiError extends Error {
  readonly status: number
  readonly body: ApiErrorBody | null

  constructor(status: number, body: ApiErrorBody | null) {
    super(`Error ${status} en la llamada a la API`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

/** Hace la petición a la API con el JWT y lanza ApiError si la respuesta no es 2xx (un 401 con token cierra la sesión). */
async function send(path: string, init: RequestInit = {}): Promise<Response> {
  /** securitySchemes.bearerAuth del contrato: el JWT va en cada petición que lo requiere */
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      // Con FormData el navegador pone el Content-Type multipart con su boundary: no hay que fijarlo
      ...(typeof init.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (!response.ok) {
    // Token caducado o inválido: la app cierra la sesión y vuelve al login
    if (response.status === 401 && token) notifyUnauthorized()
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null
    throw new ApiError(response.status, body)
  }
  return response
}

/** Como send(), pero devuelve el cuerpo JSON ya tipado. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await send(path, init)
  return response.json() as Promise<T>
}

/** Ruta base de una mascota con el id escapado. */
const petPath = (petId: string) => `/pets/${encodeURIComponent(petId)}`

// --- Auth ---

/** POST /auth/register — Crear una cuenta (devuelve ya un token de sesión) */
export function register(data: RegisterRequest): Promise<AuthResponse> {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(data) })
}

/** POST /auth/login — Iniciar sesión con email y contraseña */
export function login(data: LoginRequest): Promise<AuthResponse> {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(data) })
}

/** GET /auth/me — Usuario de la sesión actual */
export function getMe(signal?: AbortSignal): Promise<UserResponse> {
  return request('/auth/me', { signal })
}

// --- Pets ---

/** GET /pets — Obtener todas las mascotas del usuario autenticado */
export function getPets(signal?: AbortSignal): Promise<PetResponse[]> {
  return request('/pets', { signal })
}

/**
 * POST /pets — Añadir una nueva mascota.
 * El 201 no tiene cuerpo; devuelve el id extraído de la cabecera Location.
 */
export async function createPet(data: PetRequest): Promise<string> {
  const response = await send('/pets', { method: 'POST', body: JSON.stringify(data) })
  const location = response.headers.get('Location') ?? ''
  return location.substring(location.lastIndexOf('/') + 1)
}

/** GET /pets/{petId} — Obtener el detalle de una mascota */
export function getPet(petId: string, signal?: AbortSignal): Promise<PetResponse> {
  return request(petPath(petId), { signal })
}

/** PUT /pets/{petId}/photo — Sustituir la foto (JPG, PNG o WebP, máx. 5 MB) */
export function uploadPetPhoto(petId: string, file: File): Promise<PetResponse> {
  const body = new FormData()
  body.append('file', file)
  return request(`${petPath(petId)}/photo`, { method: 'PUT', body })
}

// --- Walks ---

/** GET /pets/{petId}/walks — Historial completo, o solo un día con `query.date` */
export function getPetWalks(
  petId: string,
  query: WalksQuery = {},
  signal?: AbortSignal,
): Promise<WalkResponse[]> {
  const params = new URLSearchParams()
  if (query.date) params.set('date', query.date)
  if (query.tz) params.set('tz', query.tz)
  const qs = params.size > 0 ? `?${params}` : ''
  return request(`${petPath(petId)}/walks${qs}`, { signal })
}

/** POST /pets/{petId}/walks — Registrar un paseo */
export function createPetWalk(petId: string, data: WalkRequest): Promise<WalkResponse> {
  return request(`${petPath(petId)}/walks`, { method: 'POST', body: JSON.stringify(data) })
}

// --- Vet appointments ---

/** GET /pets/{petId}/vet-appointments — Citas ordenadas por fecha ascendente */
export function getPetVetAppointments(
  petId: string,
  signal?: AbortSignal,
): Promise<VetAppointmentResponse[]> {
  return request(`${petPath(petId)}/vet-appointments`, { signal })
}

/** POST /pets/{petId}/vet-appointments — Registrar una cita veterinaria */
export function createPetVetAppointment(
  petId: string,
  data: VetAppointmentRequest,
): Promise<VetAppointmentResponse> {
  return request(`${petPath(petId)}/vet-appointments`, { method: 'POST', body: JSON.stringify(data) })
}

// --- Expenses ---

/** GET /pets/{petId}/expenses — Gastos del más reciente al más antiguo */
export function getPetExpenses(petId: string, signal?: AbortSignal): Promise<ExpenseResponse[]> {
  return request(`${petPath(petId)}/expenses`, { signal })
}

/** POST /pets/{petId}/expenses — Registrar un gasto */
export function createPetExpense(petId: string, data: ExpenseRequest): Promise<ExpenseResponse> {
  return request(`${petPath(petId)}/expenses`, { method: 'POST', body: JSON.stringify(data) })
}
