"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import type { Expense } from "@/types"
import { Badge } from "@/components/ui/badge"
import { getCategoryIcon } from "@/lib/category-icons"

interface ExpenseListProps {
  expenses: Expense[]
  showActions?: boolean
  onEdit?: (expense: Expense) => void
  onDelete?: (expenseId: string) => void
}

export function ExpenseList({ expenses, showActions = false, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">No expenses found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => {
        const Icon = getCategoryIcon(expense.category)

        return (
          <div key={expense.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{expense.description}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                  <Badge variant="outline">{expense.category}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-medium">{formatCurrency(expense.amount)}</p>
              {showActions && (
                <div className="flex gap-2">
                  <button onClick={() => onEdit?.(expense)} className="text-sm text-primary hover:underline">
                    Edit
                  </button>
                  <button onClick={() => onDelete?.(expense.id)} className="text-sm text-destructive hover:underline">
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
