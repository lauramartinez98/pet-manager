import { errorMessage } from '../utils/errors'
import { secondaryButton } from '../constants/styles'

/** Indicador de carga accesible (role="status"). */
export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <p role="status" className="animate-pulse py-6 text-center text-sm text-brown/75">
      {label}
    </p>
  )
}

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
}

/** Mensaje de error de una petición con botón para reintentar. */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-2xl bg-white/70 px-4 py-5 text-center text-sm text-brown">
      <p>{errorMessage(error)}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`mt-3 text-sm ${secondaryButton} px-3 py-1.5`}
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
