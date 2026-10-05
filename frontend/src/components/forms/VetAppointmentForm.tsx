import { useForm } from 'react-hook-form'
import { inputClass } from '../../constants/styles'
import type { VetAppointmentRequest } from '../../types/api-types'
import { errorMessage } from '../../utils/errors'
import { dateTimeRules, numberRules, optional, optionalNumber, textRules } from '../../utils/validation'
import { Field, FormActions } from './FormControls'

interface VetAppointmentFormValues {
  description: string
  cost: string
  /** datetime-local: "YYYY-MM-DDTHH:mm" en la hora local del navegador */
  appointmentDate: string
}

interface VetAppointmentFormProps {
  onSubmit: (data: VetAppointmentRequest) => Promise<void>
  onCancel: () => void
}

/** Formulario de cita veterinaria validado con las reglas de VetAppointmentRequest del contrato. */
export default function VetAppointmentForm({ onSubmit, onCancel }: VetAppointmentFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VetAppointmentFormValues>({
    defaultValues: { description: '', cost: '', appointmentDate: '' },
  })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit({
        description: optional(values.description),
        cost: optionalNumber(values.cost),
        // new Date() interpreta el valor como hora local y toISOString lo pasa a UTC
        appointmentDate: new Date(values.appointmentDate).toISOString(),
      })
    } catch (error) {
      setError('root.server', { message: errorMessage(error) })
    }
  })

  return (
    <form onSubmit={submit} noValidate className="mb-4 space-y-3 rounded-xl bg-white/70 p-4">
      {/* Reglas alineadas con VetAppointmentRequest en openapi.yaml */}
      <Field label="Motivo" error={errors.description?.message}>
        <input
          placeholder="p. ej. Vacuna anual"
          autoFocus
          className={inputClass}
          {...register('description', textRules({ maxLength: 2000 }))}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha y hora *" error={errors.appointmentDate?.message}>
          <input type="datetime-local" className={inputClass} {...register('appointmentDate', dateTimeRules)} />
        </Field>
        <Field label="Coste (€)" error={errors.cost?.message}>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="p. ej. 45"
            className={inputClass}
            {...register('cost', numberRules({ min: 0, max: 99999999.99, decimals: 2, unit: '€' }))}
          />
        </Field>
      </div>
      <FormActions submitting={isSubmitting} serverError={errors.root?.server?.message} onCancel={onCancel} />
    </form>
  )
}
