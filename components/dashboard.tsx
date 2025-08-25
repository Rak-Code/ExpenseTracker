"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseChart } from "@/components/expense-chart"
import { formatCurrency } from "@/lib/utils"
import type { Expense } from "@/types"
import { 
  Loader2, 
  Plus, 
  Download, 
  Target, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Tag,
  Award,
  Zap
} from "lucide-react"

export function Dashboard() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("day")
  const [previousPeriodExpenses, setPreviousPeriodExpenses] = useState<Expense[]>([])

  // Fetch expenses for current and previous period for trend calculation
  const fetchExpenses = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const now = new Date()
      const startDate = new Date()
      const previousStartDate = new Date()
      const previousEndDate = new Date()

      // Set current period dates
      if (timeframe === "day") {
        startDate.setHours(0, 0, 0, 0)
        previousStartDate.setDate(now.getDate() - 1)
        previousStartDate.setHours(0, 0, 0, 0)
        previousEndDate.setDate(now.getDate() - 1)
        previousEndDate.setHours(23, 59, 59, 999)
      } else if (timeframe === "week") {
        startDate.setDate(now.getDate() - 7)
        previousStartDate.setDate(now.getDate() - 14)
        previousEndDate.setDate(now.getDate() - 7)
      } else if (timeframe === "month") {
        startDate.setMonth(now.getMonth() - 1)
        previousStartDate.setMonth(now.getMonth() - 2)
        previousEndDate.setMonth(now.getMonth() - 1)
      } else if (timeframe === "year") {
        startDate.setFullYear(now.getFullYear() - 1)
        previousStartDate.setFullYear(now.getFullYear() - 2)
        previousEndDate.setFullYear(now.getFullYear() - 1)
      }

      // Fetch current period expenses
      const currentQuery = query(
        collection(db, "expenses"),
        where("userId", "==", user.uid),
        where("date", ">=", startDate.toISOString()),
        orderBy("date", "desc"),
      )

      // Fetch previous period expenses for trend calculation
      const previousQuery = query(
        collection(db, "expenses"),
        where("userId", "==", user.uid),
        where("date", ">=", previousStartDate.toISOString()),
        where("date", "<=", previousEndDate.toISOString()),
        orderBy("date", "desc"),
      )

      const [currentSnapshot, previousSnapshot] = await Promise.all([
        getDocs(currentQuery),
        getDocs(previousQuery)
      ])

      const currentExpensesData: Expense[] = []
      const previousExpensesData: Expense[] = []

      currentSnapshot.forEach((doc) => {
        currentExpensesData.push({
          id: doc.id,
          ...(doc.data() as Omit<Expense, "id">),
        })
      })

      previousSnapshot.forEach((doc) => {
        previousExpensesData.push({
          id: doc.id,
          ...(doc.data() as Omit<Expense, "id">),
        })
      })

      setExpenses(currentExpensesData)
      setPreviousPeriodExpenses(previousExpensesData)
    } catch (error) {
      console.error("Error fetching expenses:", error)
    } finally {
      setLoading(false)
    }
  }, [user, timeframe])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Enhanced calculations with memoization
  const enhancedStats = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const previousTotal = previousPeriodExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    // Calculate trend percentage
    const trendPercentage = previousTotal > 0 
      ? ((totalExpenses - previousTotal) / previousTotal) * 100 
      : totalExpenses > 0 ? 100 : 0

    // Find highest single expense
    const highestExpense = expenses.reduce((max, expense) => 
      expense.amount > max.amount ? expense : max, 
      { amount: 0, description: "" } as Partial<Expense>
    )

    // Find most frequent category
    const categoryCount = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostFrequentCategory = Object.entries(categoryCount).reduce(
      (max, [category, count]) => count > max.count ? { category, count } : max,
      { category: "", count: 0 }
    )

    // Calculate spending streak (consecutive days with expenses)
    const expenseDates = [...new Set(expenses.map(exp => 
      new Date(exp.date).toDateString()
    ))].sort()

    let spendingStreak = 0
    const today = new Date().toDateString()
    let currentDate = new Date()

    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dateStr = currentDate.toDateString()
      if (expenseDates.includes(dateStr)) {
        spendingStreak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return {
      totalExpenses,
      trendPercentage,
      highestExpense,
      mostFrequentCategory,
      spendingStreak
    }
  }, [expenses, previousPeriodExpenses])

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

  // Enhanced insights calculations
  const getEnhancedInsights = () => {
    if (expenses.length === 0) return null

    const categoryTotals = getCategoryTotals()
    const topCategory = categoryTotals.reduce((max, curr) => 
      curr.value > max.value ? curr : max, 
      { name: "", value: 0 }
    )

    const biggestExpense = expenses.reduce((max, expense) => 
      expense.amount > max.amount ? expense : max
    )

    return {
      topCategory,
      biggestExpense,
      totalCategories: categoryTotals.length
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const insights = getEnhancedInsights()

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
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

     

      {/* Enhanced Statistics Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Existing Total Expenses Card */}
        <Card className="hover:shadow-lg transition-shadow xl:col-span-2">
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totalExpenses)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {timeframe === "day"
                  ? "For today"
                  : timeframe === "week"
                    ? "For the past 7 days"
                    : timeframe === "month"
                      ? "For the past 30 days"
                      : "For the past year"}
              </p>
              {enhancedStats.trendPercentage !== 0 && (
                <div className={`flex items-center gap-1 text-xs ${
                  enhancedStats.trendPercentage > 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {enhancedStats.trendPercentage > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(enhancedStats.trendPercentage).toFixed(1)}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Existing Number of Expenses Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Transactions</CardDescription>
            <CardTitle className="text-3xl">{expenses.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {timeframe === "day"
                ? "Today"
                : timeframe === "week"
                  ? "This week"
                  : timeframe === "month"
                    ? "This month"
                    : "This year"}
            </p>
          </CardContent>
        </Card>

        {/* Existing Average Expense Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Average Expense</CardDescription>
            <CardTitle className="text-3xl">
              {expenses.length > 0 ? formatCurrency(totalExpenses / expenses.length) : formatCurrency(0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        {/* New Highest Single Expense Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Highest Expense</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(enhancedStats.highestExpense.amount || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground truncate">
              {enhancedStats.highestExpense.description || "No expenses yet"}
            </p>
          </CardContent>
        </Card>

        {/* New Most Frequent Category Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Top Category</CardDescription>
            <CardTitle className="text-xl">
              {enhancedStats.mostFrequentCategory.category || "None"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {enhancedStats.mostFrequentCategory.count} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Insights Section */}
      <div className="mt-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Insights
            </CardTitle>
            <CardDescription>Key observations about your spending patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enhanced Most Expensive Day */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/40 hover:to-muted/20 transition-colors">
              <div className="w-1 h-12 bg-gradient-to-b from-red-500 to-red-700 rounded-full" />
              <Calendar className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <div className="font-semibold">Most Expensive Day</div>
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    if (expenses.length === 0) return "No expenses recorded yet";
                    const now = new Date();
                    const yearAgo = new Date();
                    yearAgo.setFullYear(now.getFullYear() - 1);
                    const yearlyExpenses = expenses.filter(exp => new Date(exp.date) >= yearAgo);
                    if (yearlyExpenses.length === 0) return "No expenses in the past year";
                    const dayTotals = yearlyExpenses.reduce((acc, exp) => {
                      const day = new Date(exp.date).toLocaleDateString();
                      acc[day] = (acc[day] || 0) + exp.amount;
                      return acc;
                    }, {} as Record<string, number>);
                    const maxDay = Object.entries(dayTotals).reduce((max, curr) => curr[1] > max[1] ? curr : max, ["", 0]);
                    return `${maxDay[0]} • ${formatCurrency(maxDay[1])}`;
                  })()}
                </div>
              </div>
            </div>

            {/* Enhanced Daily Average */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50/50 to-blue-100/30 hover:from-blue-100/60 hover:to-blue-200/40 transition-colors">
              <div className="w-1 h-12 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full" />
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <div className="font-semibold">Daily Average</div>
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    if (expenses.length === 0) return "No daily average available";
                    const days = new Set(expenses.map(exp => new Date(exp.date).toLocaleDateString()));
                    return `${formatCurrency(totalExpenses / days.size)} across ${days.size} days`;
                  })()}
                </div>
              </div>
            </div>

            {/* Enhanced Top Spending Category */}
            {insights && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-green-50/50 to-green-100/30 hover:from-green-100/60 hover:to-green-200/40 transition-colors">
                <div className="w-1 h-12 bg-gradient-to-b from-green-500 to-green-700 rounded-full" />
                <Tag className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <div className="font-semibold">Top Spending Category</div>
                  <div className="text-sm text-muted-foreground">
                    {insights.topCategory.name} • {formatCurrency(insights.topCategory.value)} 
                    ({((insights.topCategory.value / totalExpenses) * 100).toFixed(1)}%)
                  </div>
                </div>
              </div>
            )}

            {/* New Spending Streak */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50/50 to-purple-100/30 hover:from-purple-100/60 hover:to-purple-200/40 transition-colors">
              <div className="w-1 h-12 bg-gradient-to-b from-purple-500 to-purple-700 rounded-full" />
              <Award className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <div className="font-semibold">Spending Streak</div>
                <div className="text-sm text-muted-foreground">
                  {enhancedStats.spendingStreak > 0 
                    ? `${enhancedStats.spendingStreak} consecutive days with expenses`
                    : "No active spending streak"
                  }
                </div>
              </div>
            </div>

            {/* Enhanced Categories Used */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-orange-50/50 to-orange-100/30 hover:from-orange-100/60 hover:to-orange-200/40 transition-colors">
              <div className="w-1 h-12 bg-gradient-to-b from-orange-500 to-orange-700 rounded-full" />
              <Target className="h-5 w-5 text-orange-500" />
              <div className="flex-1">
                <div className="font-semibold">Categories Diversity</div>
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    if (expenses.length === 0) return "No categories used yet";
                    const categories = new Set(expenses.map(exp => exp.category));
                    return `${categories.size} different categories used`;
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts and Lists Section */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="col-span-1 hover:shadow-lg transition-shadow">
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

        <Card className="col-span-1 hover:shadow-lg transition-shadow">
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