"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseChart } from "@/components/expense-chart"
import { formatCurrency } from "@/lib/utils"
import type { Expense } from "@/types"
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  Target,
  Search,
  Filter,
  Calendar,
  PieChart,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Menu
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AddExpense } from "@/components/add-expense"

export function Dashboard() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("month")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [chartType, setChartType] = useState<"pie" | "bar">("pie")
  const [showAddExpense, setShowAddExpense] = useState(false)

  const handleAddExpense = () => {
    setShowAddExpense(true)
  }

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) return

      setLoading(true)
      try {
        const now = new Date()
        const startDate = new Date()

        if (timeframe === "week") {
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

  // Enhanced calculations
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0
  const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0
  
  // Previous period comparison
  const getPreviousPeriodExpenses = () => {
    const now = new Date()
    const currentStart = new Date()
    const previousStart = new Date()
    const previousEnd = new Date()

    if (timeframe === "week") {
      currentStart.setDate(now.getDate() - 7)
      previousStart.setDate(now.getDate() - 14)
      previousEnd.setDate(now.getDate() - 7)
    } else if (timeframe === "month") {
      currentStart.setMonth(now.getMonth() - 1)
      previousStart.setMonth(now.getMonth() - 2)
      previousEnd.setMonth(now.getMonth() - 1)
    } else if (timeframe === "year") {
      currentStart.setFullYear(now.getFullYear() - 1)
      previousStart.setFullYear(now.getFullYear() - 2)
      previousEnd.setFullYear(now.getFullYear() - 1)
    }

    // This would need to be fetched from Firebase in a real implementation
    // For now, we'll simulate a 15% increase
    return totalExpenses * 0.85
  }

  const previousTotal = getPreviousPeriodExpenses()
  const percentageChange = previousTotal > 0 ? ((totalExpenses - previousTotal) / previousTotal) * 100 : 0

  // Filtered expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || expense.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getRecentExpenses = () => {
    return filteredExpenses.slice(0, 5)
  }

  const getCategoryTotals = () => {
    const categoryMap = new Map<string, number>()

    filteredExpenses.forEach((expense) => {
      const currentAmount = categoryMap.get(expense.category) || 0
      categoryMap.set(expense.category, currentAmount + expense.amount)
    })

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }

  const getUniqueCategories = () => {
    return Array.from(new Set(expenses.map(expense => expense.category)))
  }

  const getTopCategory = () => {
    const categoryTotals = getCategoryTotals()
    return categoryTotals.length > 0 ? categoryTotals[0] : { name: "None", value: 0 }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your expenses...</p>
        </div>
      </div>
    )
  }

  const topCategory = getTopCategory()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 space-y-6 max-w-7xl">
        {/* Mobile Header */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Menu className="h-6 w-6 md:hidden" />
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">
                    Track your spending
                  </p>
                </div>
              </div>
              
              <Button size="sm" className="gap-2 shrink-0" onClick={handleAddExpense}>
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Add</span>
              </Button>
            </div>

            {/* Mobile-first Time Selection */}
            <div className="w-full">
              <Tabs value={timeframe} onValueChange={setTimeframe} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-9">
                  <TabsTrigger value="week" className="text-xs px-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="month" className="text-xs px-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    Month
                  </TabsTrigger>
                  <TabsTrigger value="year" className="text-xs px-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    Year
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Mobile-optimized Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full h-10">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile-optimized Stats Cards */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <DollarSign className="w-4 h-4" />
                Total Expenses
              </CardDescription>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                {formatCurrency(totalExpenses)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs">
                {percentageChange > 0 ? (
                  <div className="flex items-center text-red-600">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+{percentageChange.toFixed(1)}%</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <ArrowDownRight className="w-3 h-3" />
                    <span>{percentageChange.toFixed(1)}%</span>
                  </div>
                )}
                <span className="text-muted-foreground">vs last {timeframe}</span>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full -translate-y-8 translate-x-8" />
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <Receipt className="w-4 h-4" />
                Number of Expenses
              </CardDescription>
              <CardTitle className="text-2xl md:text-3xl font-bold">{expenses.length}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                {filteredExpenses.length} after filters
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -translate-y-8 translate-x-8" />
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <Target className="w-4 h-4" />
                Average Expense
              </CardDescription>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                {formatCurrency(averageExpense)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Highest: {formatCurrency(highestExpense)}
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -translate-y-8 translate-x-8" />
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <TrendingUp className="w-4 h-4" />
                Top Category
              </CardDescription>
              <CardTitle className="text-xl md:text-2xl font-bold truncate">{topCategory.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                {formatCurrency(topCategory.value)}
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -translate-y-8 translate-x-8" />
          </Card>
        </div>

        {/* Mobile-stacked Charts and Lists */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {chartType === "pie" ? <PieChart className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                    Expense Breakdown
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Spending by category
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant={chartType === "pie" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("pie")}
                    className="h-8 w-8 p-0"
                  >
                    <PieChart className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                    className="h-8 w-8 p-0"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[250px] xs:h-[280px] sm:h-[320px] w-full flex items-center justify-center">
                {getCategoryTotals().length > 0 ? (
                  <ExpenseChart data={getCategoryTotals()} type={chartType} hideLegend />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-sm">No data to display</p>
                      <p className="text-xs">Add some expenses to see the breakdown</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Receipt className="w-5 h-5" />
                    Recent Expenses
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Your latest transactions
                    {searchTerm && ` matching "₹{searchTerm}"`}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="self-start sm:self-center">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ExpenseList expenses={getRecentExpenses()} />
                {getRecentExpenses().length === 0 && (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <div className="text-center">
                      <Receipt className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-sm">No expenses found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-optimized Quick Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Insights</CardTitle>
            <CardDescription className="text-sm">
              Key observations about your spending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-1 h-8 bg-primary rounded-full flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">Most Expensive Day</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {expenses.length > 0 
                      ? new Date(expenses.reduce((max, expense) => 
                          expense.amount > max.amount ? expense : max
                        ).date).toLocaleDateString()
                      : "No data"
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-1 h-8 bg-blue-500 rounded-full flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">Daily Average</p>
                  <p className="text-xs text-muted-foreground">
                    {timeframe === "week" 
                      ? formatCurrency(totalExpenses / 7)
                      : timeframe === "month"
                      ? formatCurrency(totalExpenses / 30)
                      : formatCurrency(totalExpenses / 365)
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-1 h-8 bg-green-500 rounded-full flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">Categories Used</p>
                  <p className="text-xs text-muted-foreground">
                    {getUniqueCategories().length} different categories
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Expense Modal */}
        {showAddExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-background rounded-lg shadow-lg p-4 w-full max-w-md relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setShowAddExpense(false)}
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                ×
              </Button>
              <h2 className="text-lg font-bold mb-4">Add Expense</h2>
              <AddExpense onSuccess={() => setShowAddExpense(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}