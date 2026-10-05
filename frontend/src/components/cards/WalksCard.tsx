import { useState } from 'react'
import { createPetWalk, getPetWalks } from '../../api/api-client'
import { useApi } from '../../hooks/useApi'
import type { WalkRequest } from '../../types/api-types'
import { browserTimeZone, formatTime, todayIsoDate } from '../../utils/format'
import { ErrorState, LoadingState } from '../Feedback'
import { AddButton } from '../forms/FormControls'
import WalkForm from '../forms/WalkForm'
import Card, { EmptyState } from './Card'

interface WalksCardProps {
  petId: string
}

export default function WalksCard({ petId }: WalksCardProps) {
  const [showForm, setShowForm] = useState(false)
  const { data: walks, loading, error, reload } = useApi(
    (signal) => getPetWalks(petId, { date: todayIsoDate(), tz: browserTimeZone() }, signal),
    [petId],
  )

  const totalKm = walks?.reduce((sum, w) => sum + (w.distanceKm ?? 0), 0) ?? 0
  const totalMinutes = walks?.reduce((sum, w) => sum + (w.durationMinutes ?? 0), 0) ?? 0

  async function handleCreate(data: WalkRequest) {
    await createPetWalk(petId, data)
    setShowForm(false)
    reload()
  }

  return (
    <Card
      title="Paseos de hoy"
      icon="🦮"
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
                    <p className="text-brown/70">
                      {walk.distanceKm ?? '–'} km · {walk.durationMinutes ?? '–'} min
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge active={walk.didPee} icon="💧" label="Pipí" />
                    <Badge active={walk.didPoop} icon="💩" label="Caca" />
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

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-xl bg-white/60 py-2">
      <p className="text-xl font-bold text-brown">{value}</p>
      <p className="text-xs text-brown/60">{label}</p>
    </div>
  )
}

function Badge({ active, icon, label }: { active: boolean; icon: string; label: string }) {
  return (
    <span
      title={`${label}: ${active ? 'sí' : 'no'}`}
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        active ? 'bg-soft-blue text-brown' : 'bg-white/60 text-brown/40 line-through'
      }`}
    >
      <span aria-hidden="true">{icon}</span> {label}
    </span>
  )
}
