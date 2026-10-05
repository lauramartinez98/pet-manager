import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { createPet, uploadPetPhoto } from '../api/api-client'
import { SPECIES_LABELS } from '../constants/labels'
import { inputClass } from '../constants/styles'
import type { Species } from '../types/api-types'
import { errorMessage } from '../utils/errors'
import { numberRules, optional, optionalNumber, photoRules, textRules } from '../utils/validation'
import { ChoiceButton, Field, FormActions } from './forms/FormControls'
import PhotoPicker from './forms/PhotoPicker'

const SPECIES_ICONS: Record<Species, string> = { PERRO: '🐶', GATO: '🐱', OTRO: '🐾' }

interface NewPetFormValues {
  name: string
  species: Species
  breed: string
  weightKg: string
  personality: string
  pathologies: string
  photo: FileList | null
}

interface NewPetModalProps {
  onClose: () => void
  /** Recibe el id de la mascota creada (extraído de la cabecera Location) y si falló la subida de la foto */
  onCreated: (petId: string, photoUploadFailed: boolean) => void
}

/** Modal para crear una mascota (con foto opcional) validado con PetRequest del contrato. */
export default function NewPetModal({ onClose, onCreated }: NewPetModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NewPetFormValues>({
    defaultValues: {
      name: '',
      species: 'PERRO',
      breed: '',
      weightKg: '',
      personality: '',
      pathologies: '',
      photo: null,
    },
  })
  const photo = useWatch({ control, name: 'photo' })?.[0]

  // showModal() da foco atrapado, cierre con Esc y fondo inerte
  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const submit = handleSubmit(async (values) => {
    try {
      const petId = await createPet({
        name: values.name.trim(),
        species: values.species,
        breed: optional(values.breed),
        weightKg: optionalNumber(values.weightKg),
        personality: optional(values.personality),
        pathologies: optional(values.pathologies),
      })
      // La foto necesita el id, así que se sube después de crear la mascota
      let photoUploadFailed = false
      if (values.photo?.[0]) {
        photoUploadFailed = await uploadPetPhoto(petId, values.photo[0]).then(
          () => false,
          () => true,
        )
      }
      onCreated(petId, photoUploadFailed)
    } catch (error) {
      setError('root.server', { message: errorMessage(error) })
    }
  })

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      // Clic en el fondo (fuera del contenido) cierra el modal
      onClick={(e) => e.target === dialogRef.current && onClose()}
      aria-labelledby="new-pet-title"
      className="m-auto w-full max-w-lg rounded-3xl bg-butter-yellow p-0 text-brown shadow-xl backdrop:bg-brown/30 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} noValidate className="space-y-4 p-8">
        <header>
          <h2 id="new-pet-title" className="text-2xl">
            🐾 Nuevo miembro
          </h2>
          <p className="text-sm text-brown/75">Cuéntanos sobre tu mascota.</p>
        </header>

        <PhotoPicker file={photo} error={errors.photo?.message} inputProps={register('photo', photoRules)} />

        {/* Reglas alineadas con PetRequest en openapi.yaml */}
        <Field label="Nombre *" error={errors.name?.message}>
          <input
            autoFocus
            placeholder="p. ej. Toby"
            className={inputClass}
            {...register('name', textRules({ required: true, maxLength: 100 }))}
          />
        </Field>

        <fieldset>
          <legend className="text-sm font-medium">Tipo de animal *</legend>
          <div className="mt-1 flex gap-2">
            {(Object.keys(SPECIES_LABELS) as Species[]).map((s) => (
              <ChoiceButton key={s} input={<input type="radio" value={s} {...register('species')} />}>
                <span aria-hidden="true">{SPECIES_ICONS[s]}</span> {SPECIES_LABELS[s]}
              </ChoiceButton>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Raza" error={errors.breed?.message}>
            <input
              placeholder="p. ej. Golden Retriever"
              className={inputClass}
              {...register('breed', textRules({ maxLength: 100 }))}
            />
          </Field>
          <Field label="Peso (kg)" error={errors.weightKg?.message}>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="p. ej. 12.5"
              className={inputClass}
              {...register('weightKg', numberRules({ min: 0, exclusiveMin: true, max: 999.99, decimals: 2, unit: 'kg' }))}
            />
          </Field>
        </div>

        <Field label="Personalidad">
          <textarea
            rows={2}
            placeholder="p. ej. Juguetón, cariñoso…"
            className={`${inputClass} resize-none`}
            {...register('personality')}
          />
        </Field>

        <Field label="Patologías" hint="Sepáralas con comas.">
          <input
            placeholder="p. ej. Alergia al pollo, Displasia leve"
            className={inputClass}
            {...register('pathologies')}
          />
        </Field>

        <FormActions
          submitting={isSubmitting}
          serverError={errors.root?.server?.message}
          onCancel={onClose}
          submitLabel="Añadir mascota"
        />
      </form>
    </dialog>
  )
}
