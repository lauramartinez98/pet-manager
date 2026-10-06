import { PartyPopper, TriangleAlert, Weight } from 'lucide-react'
import { useLocation, useParams } from 'react-router-dom'
import { getPet } from '../api/api-client'
import { SPECIES_LABELS } from '../constants/labels'
import { useApi } from '../hooks/useApi'
import { useLayoutContext } from '../hooks/useLayoutContext'
import ExpensesCard from './cards/ExpensesCard'
import VetsCard from './cards/VetsCard'
import WalksCard from './cards/WalksCard'
import { ErrorState, LoadingState } from './Feedback'
import ChangePhotoButton from './ChangePhotoButton'

/** Ficha de una mascota: cabecera con foto y datos, y las tarjetas de paseos, citas y gastos. */
export default function PetDashboard() {
  /** La ruta pets/:petId garantiza que existe */
  const petId = useParams().petId!
  const { data: pet, loading, error, reload } = useApi((signal) => getPet(petId, signal), [petId])
  const { reloadPets } = useLayoutContext()
  const photoUploadFailed = (useLocation().state as { photoUploadFailed?: boolean } | null)?.photoUploadFailed

  if (loading && !pet) return <LoadingState label="Cargando mascota…" />
  if (error != null || !pet) return <ErrorState error={error} onRetry={reload} />

  const pathologies = pet.pathologies
    ?.split(',')
    .map((p) => p.trim())
    .filter(Boolean) ?? []

  return (
    <div className="space-y-8">
      {photoUploadFailed && !pet.photoUrl && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-white/70 px-4 py-3 text-sm text-brown">
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          {pet.name} se ha creado, pero no se pudo subir la foto. Pulsa sobre el círculo para intentarlo de nuevo.
        </p>
      )}

      <section className="rounded-3xl bg-butter-yellow p-8 shadow-lg shadow-brown/5">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <ChangePhotoButton
            pet={pet}
            onUploaded={() => {
              reload()
              reloadPets()
            }}
          />

          <div className="min-w-0 flex-1">
            <h2 className="text-4xl text-brown">{pet.name}</h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-soft-blue px-3 py-1 text-sm font-semibold text-brown">
                {SPECIES_LABELS[pet.species]}
              </span>
              {pet.breed && (
                <span className="rounded-full bg-soft-blue px-3 py-1 text-sm font-semibold text-brown">
                  {pet.breed}
                </span>
              )}
              {pet.weightKg != null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-brown">
                  <Weight className="size-4" aria-hidden="true" />
                  {pet.weightKg} kg
                </span>
              )}
            </div>

            <dl className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-brown/75 uppercase">
                  Personalidad
                </dt>
                <dd className="mt-1 font-light text-brown">{pet.personality || 'Sin descripción todavía.'}</dd>
              </div>

              <div>
                <dt className="text-xs font-semibold tracking-wide text-brown/75 uppercase">
                  Patologías
                </dt>
                <dd className="mt-2">
                  {pathologies.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {pathologies.map((p) => (
                        <li
                          key={p}
                          className="rounded-full border border-brown/20 bg-white/70 px-3 py-1 text-sm text-brown"
                        >
                          {p}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-brown">
                      Ninguna conocida
                      <PartyPopper className="size-4" aria-hidden="true" />
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 2xl:grid-cols-3">
        {/* key: reinicia el estado interno de cada tarjeta al cambiar de mascota */}
        <WalksCard key={`walks-${pet.id}`} petId={pet.id} />
        <VetsCard key={`vets-${pet.id}`} petId={pet.id} />
        <ExpensesCard key={`expenses-${pet.id}`} petId={pet.id} />
      </div>
    </div>
  )
}
