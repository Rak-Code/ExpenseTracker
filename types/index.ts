export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  notes?: string
  userId: string
  createdAt: string
  updatedAt?: string
}
