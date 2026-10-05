import { todayIsoDate } from './format'

/**
 * Reglas de React Hook Form que reflejan las restricciones de api-docs/openapi.yaml.
 * Los valores de los formularios se manejan como string y se convierten al enviar.
 */

export const REQUIRED = 'Este campo es obligatorio.'

/**
 * Subconjunto de RegisterOptions de React Hook Form para campos de texto. Es estructural, así que
 * encaja en register('campo', reglas) de cualquier formulario cuyo campo sea string.
 */
export interface StringFieldRules {
  required?: string | false
  validate?: (value: string) => true | string
  maxLength?: { value: number; message: string }
  pattern?: { value: RegExp; message: string }
}

interface NumberRuleOptions {
  required?: boolean
  min?: number
  /** true: el valor debe ser estrictamente mayor que `min` (exclusiveMinimum del contrato) */
  exclusiveMin?: boolean
  max?: number
  integer?: boolean
  /** Unidad para los mensajes, p. ej. "km" */
  unit?: string
}

export function numberRules({
  required = false,
  min,
  exclusiveMin = false,
  max,
  integer = false,
  unit = '',
}: NumberRuleOptions): StringFieldRules {
  const u = unit ? ` ${unit}` : ''
  return {
    required: required ? REQUIRED : false,
    validate: (raw: string) => {
      if (raw.trim() === '') return true
      const value = Number(raw)
      if (Number.isNaN(value)) return 'Introduce un número válido.'
      if (integer && !Number.isInteger(value)) return 'Debe ser un número entero.'
      if (min != null && (exclusiveMin ? value <= min : value < min)) {
        return exclusiveMin ? `Debe ser mayor que ${min}${u}.` : `Debe ser al menos ${min}${u}.`
      }
      if (max != null && value > max) return `No puede superar ${max}${u}.`
      return true
    },
  }
}

export function textRules({ required = false, maxLength }: { required?: boolean; maxLength?: number }): StringFieldRules {
  return {
    required: required ? REQUIRED : false,
    validate: (raw: string) => (required && raw.trim() === '' ? REQUIRED : true),
    maxLength: maxLength ? { value: maxLength, message: `Máximo ${maxLength} caracteres.` } : undefined,
  }
}

/** Fecha YYYY-MM-DD que no puede ser futura (format: date + "No puede ser futura") */
export function pastOrTodayDateRules({ required = false }: { required?: boolean } = {}): StringFieldRules {
  return {
    required: required ? REQUIRED : false,
    validate: (raw: string) => raw === '' || raw <= todayIsoDate() || 'La fecha no puede ser futura.',
  }
}

/** Fecha YYYY-MM-DD estrictamente pasada (birthDate) */
export const strictlyPastDateRules: StringFieldRules = {
  validate: (raw: string) => raw === '' || raw < todayIsoDate() || 'Debe ser una fecha pasada.',
}

/** datetime-local ("YYYY-MM-DDTHH:mm") obligatorio y con fecha real */
export const dateTimeRules: StringFieldRules = {
  required: REQUIRED,
  validate: (raw: string) => !Number.isNaN(new Date(raw).getTime()) || 'Fecha no válida.',
}

// Mismo criterio que @Email de Jakarta Validation en el backend: algo@algo
export const emailRules: StringFieldRules = {
  required: REQUIRED,
  pattern: { value: /^[^\s@]+@[^\s@]+$/, message: 'Introduce un email válido.' },
  maxLength: { value: 255, message: 'Máximo 255 caracteres.' },
}

/** Convierte "" en undefined para no enviar campos opcionales vacíos a la API */
export const optional = (value: string) => (value.trim() === '' ? undefined : value.trim())
export const optionalNumber = (value: string) => (value.trim() === '' ? undefined : Number(value))

// --- Fotos (PUT /pets/{petId}/photo) ---

export const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp'
const PHOTO_TYPES = PHOTO_ACCEPT.split(',')
const PHOTO_MAX_BYTES = 5 * 1024 * 1024

/** Mismas reglas que el backend: JPG, PNG o WebP de hasta 5 MB */
export function validatePhotoFile(file: File): true | string {
  if (!PHOTO_TYPES.includes(file.type)) return 'Formato no admitido: usa JPG, PNG o WebP.'
  if (file.size > PHOTO_MAX_BYTES) return 'La imagen supera los 5 MB.'
  return true
}

/** Regla de React Hook Form para un <input type="file"> opcional */
export const photoRules = {
  validate: (files: FileList | null) => (!files || files.length === 0 ? true : validatePhotoFile(files[0])),
}
