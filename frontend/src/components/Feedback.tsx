import { errorMessage } from '../utils/errors'

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <p role="status" className="animate-pulse py-6 text-center text-sm text-brown/60">
      {label}
    </p>
  )
}

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-xl bg-white/70 px-4 py-4 text-center text-sm text-brown">
      <p>{errorMessage(error)}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-lg border border-brown/30 px-3 py-1 font-medium hover:bg-brown/5"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
