import { useState } from 'react'
import type { PetResponse } from '../types/api-types'

interface PetAvatarProps {
  pet: Pick<PetResponse, 'name' | 'photoUrl'>
  className?: string
}

/** Foto circular de la mascota; si no hay foto o falla la carga, muestra la inicial */
export default function PetAvatar({ pet, className = 'size-10' }: PetAvatarProps) {
  const [failed, setFailed] = useState(false)

  if (!pet.photoUrl || failed) {
    return (
      <div
        className={`${className} flex shrink-0 items-center justify-center rounded-full bg-butter-yellow font-bold text-brown`}
        aria-label={pet.name}
      >
        {pet.name.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={pet.photoUrl}
      alt={pet.name}
      onError={() => setFailed(true)}
      className={`${className} shrink-0 rounded-full object-cover`}
    />
  )
}
