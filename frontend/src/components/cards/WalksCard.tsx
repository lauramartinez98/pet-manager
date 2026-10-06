import { Droplet, Footprints, type LucideIcon } from 'lucide-react'
import { useState, type ComponentType, type SVGProps } from 'react'
import { createPetWalk, getPetWalks } from '../../api/api-client'
import { useApi } from '../../hooks/useApi'
import type { WalkRequest } from '../../types/api-types'
import { browserTimeZone, formatTime, todayIsoDate } from '../../utils/format'
import { ErrorState, LoadingState } from '../Feedback'
import { AddButton } from '../forms/FormControls'
import WalkForm from '../forms/WalkForm'
import PoopIcon from '../icons/PoopIcon'
import Card, { EmptyState } from './Card'

interface WalksCardProps {
  petId: string
}

/** Tarjeta de paseos: resumen del día, historial y formulario para añadir. */
export default function WalksCard({ petId }: WalksCardProps) {
  const [showForm, setShowForm] = useState(false)
  const { data: walks, loading, error, reload } = useApi(
    (signal) => getPetWalks(petId, { date: todayIsoDate(), tz: browserTimeZone() }, signal),
    [petId],
  )

  const totalKm = walks?.reduce((sum, w) => sum + (w.distanceKm ?? 0), 0) ?? 0
  const totalMinutes = walks?.reduce((sum, w) => sum + (w.durationMinutes ?? 0), 0) ?? 0

  /** Guarda el paseo, cierra el formulario y recarga la lista. */
  async function handleCreate(data: WalkRequest) {
    await createPetWalk(petId, data)
    setShowForm(false)
    reload()
  }

  return (
    <Card
      title="Paseos de hoy"
      icon={Footprints}
      action={!showForm && <AddButton label="Añadir paseo" onClick={() => setShowForm(true)} />}
    >
      {showForm && <WalkForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      {loading && !walks ? (
        <LoadingState />
      ) : error != null || !walks ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <Stat value={walks.length} label="paseos" />
            <Stat value={totalKm.toFixed(1)} label="km" />
            <Stat value={totalMinutes} label="min" />
          </div>

          {walks.length === 0 ? (
            <EmptyState>Todavía no ha salido a pasear hoy.</EmptyState>
          ) : (
            <ul className="space-y-2">
              {walks.map((walk) => (
                <li
                  key={walk.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/60 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-semibold text-brown">{formatTime(walk.walkDatetime)}</p>
                    <p className="text-brown/75">
                      {walk.distanceKm ?? '–'} km · {walk.durationMinutes ?? '–'} min
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge active={walk.didPee} icon={Droplet} label="Pipí" />
                    <Badge active={walk.didPoop} icon={PoopIcon} label="Caca" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  )
}

/** Cifra destacada con su etiqueta (resumen de paseos). */
function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/60 py-3">
      <p className="font-display text-2xl font-extrabold text-brown">{value}</p>
      <p className="text-xs text-brown/75">{label}</p>
    </div>
  )
}

/** Etiqueta de pipí/caca: resaltada si ocurrió, tachada si no. */
function Badge({
  active,
  icon: Icon,
  label,
}: {
  active: boolean
  icon: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>
  label: string
}) {
  return (
    <span
      title={`${label}: ${active ? 'sí' : 'no'}`}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        active ? 'bg-soft-blue text-brown' : 'bg-white/60 text-brown/75 line-through'
      }`}
    >
      <Icon className="size-3.5" aria-hidden="true" /> {label}
    </span>
  )
}
