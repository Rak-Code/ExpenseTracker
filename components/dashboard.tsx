"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseChart } from "@/components/expense-chart"
import { formatCurrency } from "@/lib/utils"
import type { Expense } from "@/types"
import { Loader2 } from "lucide-react"

export function Dashboard() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("day")

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) return

      setLoading(true)
      try {
        const now = new Date()
        const startDate = new Date()

        if (timeframe === "day") {
          startDate.setHours(0, 0, 0, 0);
        } else if (timeframe === "week") {
          startDate.setDate(now.getDate() - 7)
        } else if (timeframe === "month") {
          startDate.setMonth(now.getMonth() - 1)
        } else if (timeframe === "year") {
          startDate.setFullYear(now.getFullYear() - 1)
        }

        const q = query(
          collection(db, "expenses"),
          where("userId", "==", user.uid),
          where("date", ">=", startDate.toISOString()),
          orderBy("date", "desc"),
        )

        const querySnapshot = await getDocs(q)
        const expensesData: Expense[] = []

        querySnapshot.forEach((doc) => {
          expensesData.push({
            id: doc.id,
            ...(doc.data() as Omit<Expense, "id">),
          })
        })

        setExpenses(expensesData)
      } catch (error) {
        console.error("Error fetching expenses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [user, timeframe])

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const getRecentExpenses = () => {
    return expenses.slice(0, 5)
  }

  const getCategoryTotals = () => {
    const categoryMap = new Map<string, number>()

    expenses.forEach((expense) => {
      const currentAmount = categoryMap.get(expense.category) || 0
      categoryMap.set(expense.category, currentAmount + expense.amount)
    })

    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight ml-12 md:ml-0">Dashboard</h1>
        <Tabs value={timeframe} onValueChange={setTimeframe} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totalExpenses)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {timeframe === "day"
                ? "For today"
                : timeframe === "week"
                  ? "For the past 7 days"
                  : timeframe === "month"
                    ? "For the past 30 days"
                    : "For the past year"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Number of Expenses</CardDescription>
            <CardTitle className="text-3xl">{expenses.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {timeframe === "day"
                ? "For today"
                : timeframe === "week"
                  ? "For the past 7 days"
                  : timeframe === "month"
                    ? "For the past 30 days"
                    : "For the past year"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Expense</CardDescription>
            <CardTitle className="text-3xl">
              {expenses.length > 0 ? formatCurrency(totalExpenses / expenses.length) : formatCurrency(0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {timeframe === "day"
                ? "For today"
                : timeframe === "week"
                  ? "For the past 7 days"
                  : timeframe === "month"
                    ? "For the past 30 days"
                    : "For the past year"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>Key observations about your spending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Most Expensive Day */}
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted/20">
              <span className="w-2 h-8 bg-black rounded" />
              <div>
                <div className="font-medium">Most Expensive Day</div>
                <div className="text-xs text-muted-foreground">
                  {(() => {
                    if (expenses.length === 0) return "-";
                    // Always show most expensive day from all yearly expenses
                    // Get all expenses from the past year
                    const now = new Date();
                    const yearAgo = new Date();
                    yearAgo.setFullYear(now.getFullYear() - 1);
                    const yearlyExpenses = expenses.filter(exp => new Date(exp.date) >= yearAgo);
                    if (yearlyExpenses.length === 0) return "-";
                    const dayTotals = yearlyExpenses.reduce((acc, exp) => {
                      const day = new Date(exp.date).toLocaleDateString();
                      acc[day] = (acc[day] || 0) + exp.amount;
                      return acc;
                    }, {} as Record<string, number>);
                    const maxDay = Object.entries(dayTotals).reduce((max, curr) => curr[1] > max[1] ? curr : max, ["", 0]);
                    return `${maxDay[0]} (${formatCurrency(maxDay[1])})`;
                  })()}
                </div>
              </div>
            </div>
            {/* Daily Average */}
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted/20">
              <span className="w-2 h-8 bg-blue-500 rounded" />
              <div>
                <div className="font-medium">Daily Average</div>
                <div className="text-xs text-muted-foreground">
                  {(() => {
                    if (expenses.length === 0) return "-";
                    const days = new Set(expenses.map(exp => new Date(exp.date).toLocaleDateString()));
                    return formatCurrency(totalExpenses / days.size);
                  })()}
                </div>
              </div>
            </div>
            {/* Categories Used */}
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted/20">
              <span className="w-2 h-8 bg-green-500 rounded" />
              <div>
                <div className="font-medium">Categories Used</div>
                <div className="text-xs text-muted-foreground">
                  {(() => {
                    if (expenses.length === 0) return "-";
                    const categories = new Set(expenses.map(exp => exp.category));
                    return `${categories.size} different categories`;
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Spending by category for the selected period</CardDescription>
          </CardHeader>
          <CardContent className="px-2 flex flex-col md:flex-row md:items-center md:gap-6">
            <div className="w-full md:w-1/2">
              <ExpenseChart data={getCategoryTotals()} />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseList expenses={getRecentExpenses()} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}