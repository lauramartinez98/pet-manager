import { useCallback, useEffect, useState, type DependencyList } from 'react'

interface ApiState<T> {
  data: T | undefined
  error: unknown
  loading: boolean
}

/**
 * Ejecuta una llamada de api-client al montar y cada vez que cambian `deps`.
 * Cancela la petición anterior (AbortSignal) si el componente se desmonta o cambian las deps,
 * para que una respuesta lenta de otra mascota no sobrescriba la actual.
 */
export function useApi<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<ApiState<T>>({ data: undefined, error: null, loading: true })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState((prev) => ({ data: reloadKey > 0 ? prev.data : undefined, error: null, loading: true }))

    fetcher(controller.signal)
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ data: undefined, error, loading: false })
      })

    return () => controller.abort()
    // fetcher se recrea en cada render; las dependencias reales las indica quien llama
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  return { ...state, reload }
}
