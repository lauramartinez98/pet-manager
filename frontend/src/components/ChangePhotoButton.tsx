import { useState, type ChangeEvent } from 'react'
import { uploadPetPhoto } from '../api/api-client'
import type { PetResponse } from '../types/api-types'
import { errorMessage } from '../utils/errors'
import { PHOTO_ACCEPT, validatePhotoFile } from '../utils/validation'
import { FieldError } from './forms/FormControls'
import PetAvatar from './PetAvatar'

interface ChangePhotoButtonProps {
  pet: PetResponse
  onUploaded: (pet: PetResponse) => void
}

// Foto grande de la cabecera: al pulsarla se elige una imagen nueva y se sube a Supabase Storage
export default function ChangePhotoButton({ pet, onUploaded }: ChangePhotoButtonProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // permite volver a elegir el mismo archivo tras un error
    if (!file) return

    const valid = validatePhotoFile(file)
    if (valid !== true) {
      setError(valid)
      return
    }
    setUploading(true)
    setError(null)
    try {
      onUploaded(await uploadPetPhoto(pet.id, file))
    } catch (err) {
      setError(`No se pudo subir la foto: ${errorMessage(err)}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-center">
      <label
        className="group relative cursor-pointer rounded-full has-focus-visible:ring-4 has-focus-visible:ring-soft-blue"
        title="Cambiar foto"
      >
        <PetAvatar key={pet.photoUrl} pet={pet} className="size-40 text-5xl ring-4 ring-white shadow-md" />
        <span
          className={`absolute inset-0 flex flex-col items-center justify-center rounded-full bg-brown/55 text-sm font-semibold text-butter-yellow-light transition-opacity ${
            uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-has-focus-visible:opacity-100'
          }`}
        >
          <span aria-hidden="true" className="text-2xl">
            {uploading ? '⏳' : '📷'}
          </span>
          {uploading ? 'Subiendo…' : 'Cambiar foto'}
        </span>
        <input
          type="file"
          accept={PHOTO_ACCEPT}
          onChange={handleChange}
          disabled={uploading}
          aria-label={`Cambiar la foto de ${pet.name}`}
          className="sr-only"
        />
      </label>
      {error && (
        <div role="alert" className="mt-2 max-w-40 text-center">
          <FieldError>{error}</FieldError>
        </div>
      )}
    </div>
  )
}
