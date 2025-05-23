"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExpenseList } from "@/components/expense-list"
import { EditExpenseDialog } from "@/components/edit-expense-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Expense } from "@/types"
import { Loader2, Plus, Search } from "lucide-react"
import { CATEGORIES } from "@/lib/constants"

export function ExpensesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) return

      setLoading(true)
      try {
        const q = query(collection(db, "expenses"), where("userId", "==", user.uid), orderBy("date", "desc"))

        const querySnapshot = await getDocs(q)
        const expensesData: Expense[] = []

        querySnapshot.forEach((doc) => {
          expensesData.push({
            id: doc.id,
            ...(doc.data() as Omit<Expense, "id">),
          })
        })

        setExpenses(expensesData)
        setFilteredExpenses(expensesData)
      } catch (error) {
        console.error("Error fetching expenses:", error)
        toast({
          title: "Error",
          description: "Failed to load expenses. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [user, toast])

  useEffect(() => {
    let result = expenses

    if (searchTerm) {
      result = result.filter((expense) => expense.description.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (categoryFilter !== "all") {
      result = result.filter((expense) => expense.category === categoryFilter)
    }

    setFilteredExpenses(result)
  }, [expenses, searchTerm, categoryFilter])

  const handleDelete = async (expenseId: string) => {
    if (!user) return

    try {
      await deleteDoc(doc(db, "expenses", expenseId))
      setExpenses(expenses.filter((expense) => expense.id !== expenseId))
      toast({
        title: "Expense deleted",
        description: "The expense has been successfully deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
  }

  const handleExpenseUpdated = (updatedExpense: Expense) => {
    setExpenses(expenses.map((expense) => (expense.id === updatedExpense.id ? updatedExpense : expense)))
    setEditingExpense(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight ml-12 md:ml-0">Expenses</h1>
        <Button onClick={() => router.push("/dashboard/add")} className="gap-1.5 ml-2 md:ml-0">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ExpenseList expenses={filteredExpenses} showActions onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {editingExpense && (
        <EditExpenseDialog
          expense={editingExpense}
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
          onSave={handleExpenseUpdated}
        />
      )}
    </div>
  )
}
