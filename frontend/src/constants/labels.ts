import {
  Bone,
  Cat,
  Dog,
  Gift,
  Package,
  PawPrint,
  Pill,
  Scissors,
  ShieldCheck,
  Stethoscope,
  ToyBrick,
  type LucideIcon,
} from 'lucide-react'
import type { ExpenseCategory, Species } from '../types/api-types'

// Textos e iconos en pantalla para los enums del contrato (api-docs/openapi.yaml)

export const SPECIES_LABELS: Record<Species, string> = {
  PERRO: 'Perro',
  GATO: 'Gato',
  OTRO: 'Otro',
}

export const SPECIES_ICONS: Record<Species, LucideIcon> = {
  PERRO: Dog,
  GATO: Cat,
  OTRO: PawPrint,
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, { label: string; icon: LucideIcon }> = {
  FOOD: { label: 'Comida', icon: Bone },
  VET: { label: 'Veterinario', icon: Stethoscope },
  MEDICATION: { label: 'Medicación', icon: Pill },
  GROOMING: { label: 'Peluquería', icon: Scissors },
  TOYS: { label: 'Juguetes', icon: ToyBrick },
  ACCESSORIES: { label: 'Accesorios', icon: Gift },
  INSURANCE: { label: 'Seguro', icon: ShieldCheck },
  OTHER: { label: 'Otros', icon: Package },
}
