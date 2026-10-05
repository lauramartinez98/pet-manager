import type { ExpenseCategory, Species } from '../types/api-types'

// Textos en pantalla para los enums del contrato (api-docs/openapi.yaml)

export const SPECIES_LABELS: Record<Species, string> = {
  PERRO: 'Perro',
  GATO: 'Gato',
  OTRO: 'Otro',
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, { label: string; icon: string }> = {
  FOOD: { label: 'Comida', icon: '🦴' },
  VET: { label: 'Veterinario', icon: '🩺' },
  MEDICATION: { label: 'Medicación', icon: '💊' },
  GROOMING: { label: 'Peluquería', icon: '✂️' },
  TOYS: { label: 'Juguetes', icon: '🧸' },
  ACCESSORIES: { label: 'Accesorios', icon: '🎀' },
  INSURANCE: { label: 'Seguro', icon: '🛡️' },
  OTHER: { label: 'Otros', icon: '📦' },
}
