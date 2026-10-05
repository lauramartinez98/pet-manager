import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EXPENSE_CATEGORY_LABELS } from '../../constants/labels'
import type { ExpenseCategory, ExpenseResponse } from '../../types/api-types'
import { formatCurrency } from '../../utils/format'

/** Una sola serie de magnitudes -> un solo color (Brown de la paleta, mismo valor que --color-brown en index.css) */
const BAR_COLOR = '#582f0e'
const ROW_HEIGHT = 34

interface CategoryTotal {
  category: ExpenseCategory
  label: string
  total: number
  share: number
}

/** Suma los gastos por categoría y calcula el porcentaje de cada una, de mayor a menor. */
function totalsByCategory(expenses: ExpenseResponse[]): CategoryTotal[] {
  const sums = new Map<ExpenseCategory, number>()
  for (const e of expenses) sums.set(e.category, (sums.get(e.category) ?? 0) + e.amount)
  const grand = [...sums.values()].reduce((a, b) => a + b, 0)

  return [...sums.entries()]
    .map(([category, total]) => ({
      category,
      label: `${EXPENSE_CATEGORY_LABELS[category].icon} ${EXPENSE_CATEGORY_LABELS[category].label}`,
      total,
      share: grand > 0 ? total / grand : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

interface TooltipPayload {
  payload: CategoryTotal
}

/** Tooltip de la barra: categoría, importe y porcentaje del total. */
function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-sm text-brown shadow-md">
      <p className="font-semibold">{d.label}</p>
      <p>
        {formatCurrency(d.total)} · {Math.round(d.share * 100)} %
      </p>
    </div>
  )
}

/**
 * Gasto total por categoría (barras horizontales ordenadas de mayor a menor).
 * Solo se muestra con 2+ categorías: con una sola, el total ya lo dice todo.
 */
export default function ExpensesByCategoryChart({ expenses }: { expenses: ExpenseResponse[] }) {
  const data = totalsByCategory(expenses)
  if (data.length < 2) return null

  return (
    <figure className="mb-4">
      <figcaption className="mb-1 text-xs font-semibold tracking-wide text-brown/75 uppercase">
        Por categoría
      </figcaption>
      <div style={{ height: data.length * ROW_HEIGHT + 8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 72, bottom: 4, left: 0 }} barCategoryGap={8}>
            <XAxis type="number" hide domain={[0, 'dataMax']} />
            <YAxis
              type="category"
              dataKey="label"
              width={118}
              axisLine={false}
              tickLine={false}
              tick={{ fill: BAR_COLOR, fontSize: 12 }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(88, 47, 14, 0.06)' }} />
            <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={16} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.category} fill={BAR_COLOR} />
              ))}
              {/* Etiqueta directa con el importe: el texto va en tinta, no en el color de la barra */}
              <LabelList
                dataKey="total"
                position="right"
                formatter={(value) => formatCurrency(Number(value))}
                style={{ fill: BAR_COLOR, fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Alternativa textual para lectores de pantalla (la lista de gastos de abajo es la vista de tabla) */}
      <p className="sr-only">
        {data.map((d) => `${EXPENSE_CATEGORY_LABELS[d.category].label}: ${formatCurrency(d.total)}`).join('; ')}
      </p>
    </figure>
  )
}
