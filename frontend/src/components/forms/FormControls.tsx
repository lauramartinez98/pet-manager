import { cloneElement, useId, type ReactElement, type ReactNode } from 'react'
import { ghostButton, primaryButtonSm } from '../../constants/styles'

type ControlProps = { 'aria-describedby'?: string; 'aria-invalid'?: boolean }

interface FieldProps {
  label: string
  hint?: string
  /** Mensaje de validación (React Hook Form) */
  error?: string
  className?: string
  /** Un único control (input, select, textarea) */
  children: ReactElement<ControlProps>
}

/**
 * La ayuda y el error quedan fuera del <label> para no formar parte del nombre accesible del campo;
 * se asocian con aria-describedby y el control se marca con aria-invalid
 */
export function Field({ label, hint, error, className = '', children }: FieldProps) {
  const hintId = useId()
  const errorId = useId()
  const describedBy = [children.props['aria-describedby'], error && errorId, hint && hintId]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-brown">
        {label}
        {cloneElement(children, {
          'aria-describedby': describedBy || undefined,
          'aria-invalid': error ? true : undefined,
        })}
      </label>
      {error && <FieldError id={errorId}>{error}</FieldError>}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-brown/75">
          {hint}
        </p>
      )}
    </div>
  )
}

/** Mensaje de error de validación de un campo. */
export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1 flex items-center gap-1 text-xs font-medium text-brown">
      <span aria-hidden="true">⚠️</span>
      {children}
    </p>
  )
}

interface FormActionsProps {
  submitting: boolean
  /** Error devuelto por el servidor al enviar */
  serverError?: string
  onCancel: () => void
  submitLabel?: string
}

/** Mensaje de error + botones Cancelar / Guardar (Brown = acción primaria) */
export function FormActions({ submitting, serverError, onCancel, submitLabel = 'Guardar' }: FormActionsProps) {
  return (
    <>
      {serverError && (
        <p role="alert" className="text-sm text-brown">
          No se pudo guardar: {serverError}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className={ghostButton}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className={primaryButtonSm}
        >
          {submitting ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </>
  )
}

interface ChoiceProps {
  children: ReactNode
  /** Input radio o checkbox (normalmente con el register de React Hook Form) */
  input: ReactElement
}

/** Radio/checkbox con aspecto de botón: inactivo en Soft Blue (ui-guidelines: estados inactivos), activo en Brown */
export function ChoiceButton({ children, input }: ChoiceProps) {
  return (
    <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-soft-blue/60 px-3 py-2 text-sm font-semibold text-brown transition-all duration-300 hover:bg-soft-blue motion-safe:hover:-translate-y-0.5 has-checked:bg-brown has-checked:text-butter-yellow-light has-focus-visible:ring-2 has-focus-visible:ring-soft-blue">
      {cloneElement(input as ReactElement<{ className?: string }>, { className: 'sr-only' })}
      {children}
    </label>
  )
}

interface AddButtonProps {
  label: string
  onClick: () => void
}

/** Botón "+ Añadir…" de la cabecera de las tarjetas */
export function AddButton({ label, onClick }: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={primaryButtonSm}
    >
      + {label}
    </button>
  )
}
