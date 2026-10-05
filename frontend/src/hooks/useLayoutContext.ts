import { useOutletContext } from 'react-router-dom'
import type { PetResponse } from '../types/api-types'

// Datos que Layout comparte con las rutas hijas a través de <Outlet context>
export interface LayoutContext {
  pets: PetResponse[] | undefined
  petsLoading: boolean
  petsError: unknown
  /** Vuelve a pedir la lista (p. ej. tras cambiar una foto, para refrescar el Navbar) */
  reloadPets: () => void
}

/** Datos que Layout comparte con sus páginas hijas (p. ej. recargar las mascotas). */
export const useLayoutContext = () => useOutletContext<LayoutContext>()
