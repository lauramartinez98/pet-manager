import { Droplet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { inputClass } from '../../constants/styles'
import type { WalkRequest } from '../../types/api-types'
import { errorMessage } from '../../utils/errors'
import { nowIso } from '../../utils/format'
import { numberRules } from '../../utils/validation'
import PoopIcon from '../icons/PoopIcon'
import { ChoiceButton, Field, FormActions } from './FormControls'

interface WalkFormValues {
  distanceKm: string
  durationMinutes: string
  didPee: boolean
  didPoop: boolean
}

interface WalkFormProps {
  onSubmit: (data: WalkRequest) => Promise<void>
  onCancel: () => void
}

/** Formulario de paseo validado con las reglas de WalkRequest del contrato. */
export default function WalkForm({ onSubmit, onCancel }: WalkFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WalkFormValues>({
    defaultValues: { distanceKm: '', durationMinutes: '', didPee: false, didPoop: false },
  })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit({
        distanceKm: Number(values.distanceKm),
        durationMinutes: Number(values.durationMinutes),
        didPee: values.didPee,
        didPoop: values.didPoop,
        walkDatetime: nowIso(),
      })
    } catch (error) {
      setError('root.server', { message: errorMessage(error) })
    }
  })

  return (
    // noValidate: los mensajes los da React Hook Form (en español y con el mismo estilo en todos los navegadores)
    <form onSubmit={submit} noValidate className="mb-4 space-y-3 rounded-xl bg-white/70 p-4">
      {/* Reglas alineadas con WalkRequest en openapi.yaml */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Distancia (km)" error={errors.distanceKm?.message}>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="p. ej. 2.5"
            autoFocus
            className={inputClass}
            {...register('distanceKm', numberRules({ required: true, min: 0, exclusiveMin: true, max: 9999.99, decimals: 2, unit: 'km' }))}
          />
        </Field>
        <Field label="Tiempo (min)" error={errors.durationMinutes?.message}>
          <input
            type="number"
            inputMode="numeric"
            step="1"
            placeholder="p. ej. 30"
            className={inputClass}
            {...register('durationMinutes', numberRules({ required: true, min: 1, max: 1440, integer: true, unit: 'min' }))}
          />
        </Field>
      </div>

      <div className="flex gap-2">
        <ChoiceButton input={<input type="checkbox" {...register('didPee')} />}>
          <Droplet className="size-4" aria-hidden="true" /> Pipí
        </ChoiceButton>
        <ChoiceButton input={<input type="checkbox" {...register('didPoop')} />}>
          <PoopIcon className="size-4" /> Caca
        </ChoiceButton>
      </div>

      <FormActions submitting={isSubmitting} serverError={errors.root?.server?.message} onCancel={onCancel} />
    </form>
  )
}
