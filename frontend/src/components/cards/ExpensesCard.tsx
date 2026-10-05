import { lazy, Suspense, useState } from 'react'
import { createPetExpense, getPetExpenses } from '../../api/api-client'
import { EXPENSE_CATEGORY_LABELS } from '../../constants/labels'
import { useApi } from '../../hooks/useApi'
import type { ExpenseRequest } from '../../types/api-types'
import { formatCurrency, formatShortDate } from '../../utils/format'
import { ErrorState, LoadingState } from '../Feedback'
import { AddButton } from '../forms/FormControls'
import ExpenseForm from '../forms/ExpenseForm'
import Card, { EmptyState } from './Card'

// Recharts pesa ~400 kB: se descarga solo cuando hay gráfico que pintar
const ExpensesByCategoryChart = lazy(() => import('./ExpensesByCategoryChart'))

interface ExpensesCardProps {
  petId: string
}

export default function ExpensesCard({ petId }: ExpensesCardProps) {
  const [showForm, setShowForm] = useState(false)
  const { data: expenses, loading, error, reload } = useApi(
    (signal) => getPetExpenses(petId, signal),
    [petId],
  )

  const total = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0
  const categoryCount = new Set(expenses?.map((e) => e.category)).size

  async function handleCreate(data: ExpenseRequest) {
    await createPetExpense(petId, data)
    setShowForm(false)
    reload()
  }

  return (
    <Card
      title="Gastos"
      icon="💶"
      action={!showForm && <AddButton label="Añadir gasto" onClick={() => setShowForm(true)} />}
    >
      {showForm && <ExpenseForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      {loading && !expenses ? (
        <LoadingState />
      ) : error != null || !expenses ? (
        <ErrorState error={error} onRetry={reload} />
      ) : expenses.length === 0 ? (
        <EmptyState>No hay gastos registrados.</EmptyState>
      ) : (
        <>
          <div className="mb-4 flex items-baseline justify-between rounded-xl bg-white/60 px-4 py-3">
            <span className="text-sm text-brown/70">Total</span>
            <span className="text-2xl font-bold text-brown">{formatCurrency(total)}</span>
          </div>

          {categoryCount >= 2 && (
            <Suspense fallback={null}>
              <ExpensesByCategoryChart expenses={expenses} />
            </Suspense>
          )}

          {/* El backend ya los devuelve del más reciente al más antiguo */}
          <ul className="divide-y divide-brown/10">
            {expenses.map((expense) => {
              const category = EXPENSE_CATEGORY_LABELS[expense.category]
              return (
                <li key={expense.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-soft-blue"
                    aria-hidden="true"
                  >
                    {category.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-brown">
                      {expense.description || category.label}
                    </p>
                    <p className="text-brown/60">
                      {category.label} · {formatShortDate(expense.expenseDate)}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-brown">
                    {formatCurrency(expense.amount)}
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </Card>
  )
}
