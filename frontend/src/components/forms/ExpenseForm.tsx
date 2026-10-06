import { useForm } from 'react-hook-form'
import { EXPENSE_CATEGORY_LABELS } from '../../constants/labels'
import { inputClass } from '../../constants/styles'
import type { ExpenseCategory, ExpenseRequest } from '../../types/api-types'
import { errorMessage } from '../../utils/errors'
import { todayIsoDate } from '../../utils/format'
import { numberRules, optional, pastOrTodayDateRules, textRules } from '../../utils/validation'
import { Field, FormActions } from './FormControls'

interface ExpenseFormValues {
  category: ExpenseCategory
  description: string
  amount: string
  expenseDate: string
}

interface ExpenseFormProps {
  onSubmit: (data: ExpenseRequest) => Promise<void>
  onCancel: () => void
}

/** Formulario de gasto validado con las reglas de ExpenseRequest del contrato. */
export default function ExpenseForm({ onSubmit, onCancel }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    defaultValues: { category: 'FOOD', description: '', amount: '', expenseDate: todayIsoDate() },
  })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit({
        category: values.category,
        description: optional(values.description),
        amount: Number(values.amount),
        expenseDate: values.expenseDate,
      })
    } catch (error) {
      setError('root.server', { message: errorMessage(error) })
    }
  })

  return (
    <form onSubmit={submit} noValidate className="mb-4 space-y-3 rounded-xl bg-white/70 p-4">
      {/* Reglas alineadas con ExpenseRequest en openapi.yaml */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoría *">
          <select className={inputClass} {...register('category')}>
            {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((c) => (
              <option key={c} value={c}>
                {EXPENSE_CATEGORY_LABELS[c].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Importe (€) *" error={errors.amount?.message}>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="p. ej. 24.90"
            autoFocus
            className={inputClass}
            {...register('amount', numberRules({ required: true, min: 0, exclusiveMin: true, max: 99999999.99, decimals: 2, unit: '€' }))}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Descripción" error={errors.description?.message}>
          <input
            placeholder="p. ej. Pienso 12 kg"
            className={inputClass}
            {...register('description', textRules({ maxLength: 2000 }))}
          />
        </Field>
        <Field label="Fecha *" error={errors.expenseDate?.message}>
          <input
            type="date"
            max={todayIsoDate()}
            className={inputClass}
            {...register('expenseDate', pastOrTodayDateRules({ required: true }))}
          />
        </Field>
      </div>
      <FormActions submitting={isSubmitting} serverError={errors.root?.server?.message} onCancel={onCancel} />
    </form>
  )
}
