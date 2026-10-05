/**
 * Tipos de la API a partir de api-docs/openapi.yaml (components/schemas).
 * Fuente de verdad: el YAML. Si cambia el contrato, actualizar aquí y no al revés.
 *
 * - Propiedades no `required` en el schema -> opcionales (`?`)
 * - `nullable: true` -> `| null`
 * - format uuid / date / date-time -> string (ISO 8601)
 */

/** #/components/schemas/Species */
export type Species = 'PERRO' | 'GATO' | 'OTRO'

/** #/components/schemas/ExpenseCategory */
export type ExpenseCategory =
  | 'FOOD'
  | 'VET'
  | 'MEDICATION'
  | 'GROOMING'
  | 'TOYS'
  | 'ACCESSORIES'
  | 'INSURANCE'
  | 'OTHER'

/** #/components/schemas/PetResponse */
export interface PetResponse {
  /** format: uuid */
  id: string
  name: string
  species: Species
  breed: string | null
  /** format: double */
  weightKg: number | null
  personality: string | null
  /** Lista separada por comas */
  pathologies: string | null
  photoUrl: string | null
}

/** #/components/schemas/PetRequest */
export interface PetRequest {
  /** minLength 1, maxLength 100 */
  name: string
  species: Species
  /** maxLength 100 */
  breed?: string
  /** > 0, <= 999.99 */
  weightKg?: number
  personality?: string
  /** Lista separada por comas */
  pathologies?: string
}

/** #/components/schemas/WalkResponse */
export interface WalkResponse {
  /** format: uuid */
  id: string
  distanceKm: number | null
  /** type: integer */
  durationMinutes: number | null
  didPee: boolean
  didPoop: boolean
  /** format: date-time */
  walkDatetime: string
}

/** #/components/schemas/WalkRequest */
export interface WalkRequest {
  /** > 0, <= 9999.99 */
  distanceKm?: number
  /** integer, 1..1440 */
  durationMinutes?: number
  didPee: boolean
  didPoop: boolean
  /** format: date-time. No puede ser futura */
  walkDatetime: string
}

/** #/components/schemas/VetAppointmentResponse */
export interface VetAppointmentResponse {
  /** format: uuid */
  id: string
  description: string | null
  cost: number | null
  /** format: date-time */
  appointmentDate: string
}

/** #/components/schemas/VetAppointmentRequest */
export interface VetAppointmentRequest {
  /** maxLength 2000 */
  description?: string
  /** >= 0 */
  cost?: number
  /** format: date-time. Puede ser futura */
  appointmentDate: string
}

/** #/components/schemas/ExpenseResponse */
export interface ExpenseResponse {
  /** format: uuid */
  id: string
  category: ExpenseCategory
  description: string | null
  amount: number
  /** format: date (YYYY-MM-DD) */
  expenseDate: string
}

/** #/components/schemas/ExpenseRequest */
export interface ExpenseRequest {
  category: ExpenseCategory
  /** maxLength 2000 */
  description?: string
  /** > 0 */
  amount: number
  /** format: date (YYYY-MM-DD). No puede ser futura */
  expenseDate: string
}

/** #/components/schemas/Error (formato por defecto de Spring Boot) */
export interface ApiErrorBody {
  timestamp?: string
  status?: number
  error?: string
  path?: string
}

/** Parámetros query de GET /pets/{petId}/walks */
export interface WalksQuery {
  /** format: date (YYYY-MM-DD) */
  date?: string
  /** Zona horaria IANA. Por defecto en el servidor: Europe/Madrid */
  tz?: string
}

// --- Auth ---

/** #/components/schemas/RegisterRequest */
export interface RegisterRequest {
  /** minLength 1, maxLength 150 */
  fullName: string
  /** format: email, maxLength 255 */
  email: string
  /** minLength 8, maxLength 72 */
  password: string
  /** format: date (YYYY-MM-DD). Debe ser pasada */
  birthDate?: string
}

/** #/components/schemas/LoginRequest */
export interface LoginRequest {
  email: string
  password: string
}

/** #/components/schemas/UserResponse */
export interface UserResponse {
  /** format: uuid */
  id: string
  fullName: string
  email: string
  /** format: date */
  birthDate: string | null
}

/** #/components/schemas/AuthResponse */
export interface AuthResponse {
  /** JWT firmado (HS256) */
  token: string
  /** format: date-time */
  expiresAt: string
  user: UserResponse
}
