const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
const dateTime = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})
const shortDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
const time = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' })

export const formatCurrency = (value: number) => currency.format(value)
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))
export const formatTime = (iso: string) => time.format(new Date(iso))
// Las fechas sin hora (YYYY-MM-DD) se parsean como locales para evitar desfases por zona horaria
export const formatShortDate = (isoDate: string) => shortDate.format(new Date(`${isoDate}T00:00`))

/** Instante actual en ISO 8601 (UTC) */
export const nowIso = () => new Date().toISOString()

/** Fecha local de hoy en formato YYYY-MM-DD (el locale sueco usa ese formato) */
export const todayIsoDate = () => new Date().toLocaleDateString('sv-SE')

/** Zona horaria IANA del navegador, p. ej. "Europe/Madrid" */
export const browserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone
