/*
 * Clases compartidas (.skills/color.palette/SKILL.md): bordes amplios, sombras grandes y difuminadas
 * y micro-interacciones. El desplazamiento al pasar el ratón solo se aplica si el usuario no ha pedido
 * reducir el movimiento (motion-safe) y nunca en botones deshabilitados.
 */

/** Elevación al pasar el ratón para botones grandes y tarjetas clicables */
export const lift =
  'transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-xl hover:shadow-brown/10 disabled:pointer-events-none disabled:opacity-50'

/** Versión discreta para botones pequeños dentro de tarjetas */
export const liftSm =
  'transition-all duration-300 motion-safe:hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brown/10 disabled:pointer-events-none disabled:opacity-50'

/** Acción primaria (Brown, tipografía de títulos) */
export const primaryButton = `rounded-2xl bg-brown px-4 py-2.5 font-display font-bold text-butter-yellow-light shadow-lg shadow-brown/10 ${lift}`

/** Acción primaria compacta ("+ Añadir…", "Guardar") */
export const primaryButtonSm = `rounded-xl bg-brown px-3.5 py-1.5 text-sm font-display font-bold text-butter-yellow-light shadow-md shadow-brown/10 ${liftSm}`

/** Acción secundaria con borde ("Cerrar sesión", "Reintentar") */
export const secondaryButton = `rounded-2xl border border-brown/30 bg-white/40 px-4 py-2.5 font-medium text-brown ${lift} hover:bg-white/70`

/** Acción terciaria sin borde ("Cancelar") */
export const ghostButton =
  'rounded-xl px-3 py-1.5 text-sm font-medium text-brown transition-colors duration-300 hover:bg-brown/5'

/** Controles de formulario (Brown para texto, Soft Blue para el foco) */
export const inputClass =
  'mt-1 w-full rounded-xl border border-brown/20 bg-white px-3 py-2 font-light text-brown outline-none transition-shadow duration-300 placeholder:text-brown/70 focus:border-brown/50 focus:ring-2 focus:ring-soft-blue'
