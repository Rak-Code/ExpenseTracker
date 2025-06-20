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
  selectedExpenseId?: string | null
  onSelect?: (expenseId: string) => void
}

export function ExpenseList({ expenses, showActions = false, onEdit, onDelete, selectedExpenseId, onSelect }: ExpenseListProps) {
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
        const isSelected = selectedExpenseId === expense.id;
        return (
          <div key={expense.id + (isSelected ? '-selected' : '')}>
            <div
              className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-lg border p-4 ${isSelected ? 'bg-muted/50 border-primary' : ''}`}
              style={{ cursor: onSelect ? 'pointer' : undefined }}
              onClick={() => onSelect?.(expense.id)}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 flex-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-2 sm:mb-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                    <Badge variant="outline">{expense.category}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center gap-4">
                <p className="font-medium">{formatCurrency(expense.amount)}</p>
                {showActions && (
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onEdit?.(expense); }} className="text-sm text-primary hover:underline">
                      Edit
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(expense.id); }} className="text-sm text-destructive hover:underline">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            {isSelected && expense.notes && (
              <div className="mt-2 p-2 rounded bg-muted text-sm text-muted-foreground">
                <strong>Notes:</strong> {expense.notes}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
