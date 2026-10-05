import { useEffect, useMemo, type InputHTMLAttributes } from 'react'
import { PHOTO_ACCEPT } from '../../utils/validation'
import { FieldError } from './FormControls'
import { liftSm } from '../../constants/styles'

interface PhotoPickerProps {
  /** Archivo elegido (para la vista previa) */
  file: File | undefined
  error?: string
  /** Props del register de React Hook Form */
  inputProps: InputHTMLAttributes<HTMLInputElement>
}

/** Vista previa circular (ui-guidelines: fotos de mascotas rounded-full) + botón para elegir la imagen */
export default function PhotoPicker({ file, error, inputProps }: PhotoPickerProps) {
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  // La URL temporal se libera al cambiar de archivo o desmontar para no dejar memoria ocupada
  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-soft-blue/60 text-3xl ring-4 ring-white">
          {preview ? (
            <img src={preview} alt="Vista previa de la foto" className="size-full object-cover" />
          ) : (
            <span aria-hidden="true">📷</span>
          )}
        </div>
        <label className={`cursor-pointer rounded-xl border border-brown/30 bg-white/70 px-3 py-2 text-sm font-medium text-brown ${liftSm} hover:bg-white has-focus-visible:ring-2 has-focus-visible:ring-soft-blue`}>
          {preview ? 'Cambiar foto' : 'Elegir foto'}
          <input type="file" accept={PHOTO_ACCEPT} className="sr-only" {...inputProps} />
        </label>
        <span className="text-xs text-brown/75">JPG, PNG o WebP · máx. 5 MB</span>
      </div>
      {error && <FieldError>{error}</FieldError>}
    </div>
  )
}
