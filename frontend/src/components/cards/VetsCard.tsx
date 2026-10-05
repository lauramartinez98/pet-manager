import { useState } from 'react'
import { createPetVetAppointment, getPetVetAppointments } from '../../api/api-client'
import { useApi } from '../../hooks/useApi'
import type { VetAppointmentRequest, VetAppointmentResponse } from '../../types/api-types'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { ErrorState, LoadingState } from '../Feedback'
import { AddButton } from '../forms/FormControls'
import VetAppointmentForm from '../forms/VetAppointmentForm'
import Card, { EmptyState } from './Card'

interface VetsCardProps {
  petId: string
}

export default function VetsCard({ petId }: VetsCardProps) {
  const [showForm, setShowForm] = useState(false)
  const { data: appointments, loading, error, reload } = useApi(
    (signal) => getPetVetAppointments(petId, signal),
    [petId],
  )
  // Se fija al montar para que el render sea puro (no cambia entre re-renders)
  const [now] = useState(() => Date.now())

  // El backend ya las devuelve en orden ascendente
  const upcoming = appointments?.filter((a) => Date.parse(a.appointmentDate) >= now) ?? []
  const past = appointments?.filter((a) => Date.parse(a.appointmentDate) < now).reverse() ?? []

  async function handleCreate(data: VetAppointmentRequest) {
    await createPetVetAppointment(petId, data)
    setShowForm(false)
    reload()
  }

  return (
    <Card
      title="Citas veterinarias"
      icon="🩺"
      action={!showForm && <AddButton label="Añadir cita" onClick={() => setShowForm(true)} />}
    >
      {showForm && <VetAppointmentForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      {loading && !appointments ? (
        <LoadingState />
      ) : error != null || !appointments ? (
        <ErrorState error={error} onRetry={reload} />
      ) : appointments.length === 0 ? (
        <EmptyState>No hay citas registradas.</EmptyState>
      ) : (
        <div className="space-y-4">
          <AppointmentList title="Próximas" items={upcoming} highlight />
          <AppointmentList title="Anteriores" items={past} />
        </div>
      )}
    </Card>
  )
}

interface AppointmentListProps {
  title: string
  items: VetAppointmentResponse[]
  highlight?: boolean
}

function AppointmentList({ title, items, highlight = false }: AppointmentListProps) {
  if (items.length === 0) return null

  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wide text-brown/60 uppercase">{title}</p>
      <ul className="space-y-2">
        {items.map((appt) => (
          <li
            key={appt.id}
            className={`rounded-xl px-3 py-2 text-sm ${
              highlight ? 'border-l-4 border-brown bg-white/80' : 'bg-white/50 text-brown/70'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-brown">{appt.description || 'Consulta'}</p>
              {appt.cost != null && (
                <span className="shrink-0 font-medium text-brown">{formatCurrency(appt.cost)}</span>
              )}
            </div>
            <p className="mt-0.5 text-brown/70 capitalize">{formatDateTime(appt.appointmentDate)}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
