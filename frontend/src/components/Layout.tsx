import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { getPets } from '../api/api-client'
import { useApi } from '../hooks/useApi'
import type { LayoutContext } from '../hooks/useLayoutContext'
import Navbar from './Navbar'
import NewPetModal from './NewPetModal'

/** Estructura fija de la app: Navbar con las mascotas a la izquierda y la página activa a la derecha. */
export default function Layout() {
  const navigate = useNavigate()
  const [showNewPet, setShowNewPet] = useState(false)
  const { data: pets, loading, error, reload } = useApi((signal) => getPets(signal), [])

  /** Tras crear una mascota: cierra el modal, recarga el Navbar y abre su ficha. */
  function handlePetCreated(petId: string, photoUploadFailed: boolean) {
    setShowNewPet(false)
    reload()
    // Si la foto falló, la ficha lo avisa y permite reintentarlo desde ahí
    navigate(`/pets/${petId}`, { state: { photoUploadFailed } })
  }

  return (
    <div className="min-h-screen">
      <Navbar
        pets={pets}
        loading={loading}
        error={error}
        onRetry={reload}
        onNewPet={() => setShowNewPet(true)}
      />
      <main className="ml-64 min-h-screen p-8">
        <Outlet
          context={{ pets, petsLoading: loading, petsError: error, reloadPets: reload } satisfies LayoutContext}
        />
      </main>

      {showNewPet && (
        <NewPetModal onClose={() => setShowNewPet(false)} onCreated={handlePetCreated} />
      )}
    </div>
  )
}
