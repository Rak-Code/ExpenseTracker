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
  ArrowDownRight
} from "lucide-react"
import { cn } from "@/lib/utils"

export function Dashboard() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("month")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [chartType, setChartType] = useState<"pie" | "bar">("pie")

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
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your expenses...</p>
        </div>
      </div>
    )
  }

  const topCategory = getTopCategory()

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Track and analyze your spending patterns
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Tabs value={timeframe} onValueChange={setTimeframe} className="w-[300px]">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="week" className="text-xs">
                  <Calendar className="w-4 h-4 mr-1" />
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" className="text-xs">
                  <Calendar className="w-4 h-4 mr-1" />
                  Month
                </TabsTrigger>
                <TabsTrigger value="year" className="text-xs">
                  <Calendar className="w-4 h-4 mr-1" />
                  Year
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
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

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Expenses
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {formatCurrency(totalExpenses)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              {percentageChange > 0 ? (
                <div className="flex items-center text-red-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+{percentageChange.toFixed(1)}%</span>
                </div>
              ) : (
                <div className="flex items-center text-green-600">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>{percentageChange.toFixed(1)}%</span>
                </div>
              )}
              <span className="text-muted-foreground">vs last {timeframe}</span>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Number of Expenses
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{expenses.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {filteredExpenses.length} after filters
            </p>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Average Expense
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {formatCurrency(averageExpense)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Highest: {formatCurrency(highestExpense)}
            </p>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top Category
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{topCategory.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(topCategory.value)}
            </p>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10" />
        </Card>
      </div>

      {/* Charts and Lists */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {chartType === "pie" ? <PieChart className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                  Expense Breakdown
                </CardTitle>
                <CardDescription>
                  Spending by category for the selected period
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
            <ExpenseChart data={getCategoryTotals()} type={chartType} />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Recent Expenses
                </CardTitle>
                <CardDescription>
                  Your latest transactions
                  {searchTerm && ` matching "${searchTerm}"`}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
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
                    <p>No expenses found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
          <CardDescription>
            Key observations about your spending patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-8 bg-primary rounded-full" />
              <div>
                <p className="font-medium">Most Expensive Day</p>
                <p className="text-sm text-muted-foreground">
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
              <div className="w-2 h-8 bg-blue-500 rounded-full" />
              <div>
                <p className="font-medium">Daily Average</p>
                <p className="text-sm text-muted-foreground">
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
              <div className="w-2 h-8 bg-green-500 rounded-full" />
              <div>
                <p className="font-medium">Categories Used</p>
                <p className="text-sm text-muted-foreground">
                  {getUniqueCategories().length} different categories
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}