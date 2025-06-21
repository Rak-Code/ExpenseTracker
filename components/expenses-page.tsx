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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Expense } from "@/types"
import { 
  Loader2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart,
  ArrowUpDown,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"
import { CATEGORIES } from "@/lib/constants"
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export function ExpensesPage() {
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  
  // Paginated expenses
  const [paginatedExpenses, setPaginatedExpenses] = useState<Expense[]>([])
  const [totalPages, setTotalPages] = useState(0)

  // Enhanced Statistics
  const calculateStats = () => {
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const average = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0
    const highest = Math.max(...filteredExpenses.map(e => e.amount), 0)
    const lowest = Math.min(...filteredExpenses.map(e => e.amount), 0)
    
    // Category breakdown
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0]

    return {
      total,
      average,
      highest,
      lowest,
      count: filteredExpenses.length,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      categoryTotals
    }
  }

  // Enhanced CSV Export with date range
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      toast({ 
        title: "No expenses", 
        description: "No expenses to export with current filters.",
        variant: "destructive"
      });
      return;
    }

    const header = ["Date", "Description", "Category", "Amount", "Notes", "Created At"];
    const rows = filteredExpenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      exp.description,
      exp.category,
      exp.amount.toString(),
      exp.notes ? exp.notes.replace(/\r?\n|\r/g, ' ') : '',
      exp.createdAt ? new Date(exp.createdAt).toLocaleString() : ''
    ]);

    const csvContent = [header, ...rows]
      .map(row => row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const dateStr = dateRange.from && dateRange.to 
      ? `${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}`
      : format(new Date(), 'yyyy-MM-dd');
    
    a.download = `expenses_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Exported ${filteredExpenses.length} expenses to CSV.`
    });
  }

  // Quick date filters
  const setQuickDateFilter = (type: 'thisMonth' | 'lastMonth' | 'thisYear' | 'last30Days' | 'clear') => {
    const now = new Date()
    
    switch (type) {
      case 'thisMonth':
        setDateRange({
          from: startOfMonth(now),
          to: endOfMonth(now)
        })
        break
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        setDateRange({
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth)
        })
        break
      case 'thisYear':
        setDateRange({
          from: new Date(now.getFullYear(), 0, 1),
          to: new Date(now.getFullYear(), 11, 31)
        })
        break
      case 'last30Days':
        setDateRange({
          from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          to: now
        })
        break
      case 'clear':
        setDateRange({ from: undefined, to: undefined })
        break
    }
  }

  // Pagination functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1))
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1))

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2)
      let start = Math.max(1, currentPage - halfVisible)
      let end = Math.min(totalPages, currentPage + halfVisible)
      
      if (end - start + 1 < maxVisiblePages) {
        if (start === 1) {
          end = Math.min(totalPages, start + maxVisiblePages - 1)
        } else {
          start = Math.max(1, end - maxVisiblePages + 1)
        }
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) return

      setLoading(true)
      try {
        const q = query(
          collection(db, "expenses"), 
          where("userId", "==", user.uid), 
          orderBy("date", "desc")
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
    let result = [...expenses]

    // Search filter
    if (searchTerm) {
      result = result.filter((expense) => 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((expense) => expense.category === categoryFilter)
    }

    // Date range filter
    if (dateRange.from && dateRange.to) {
      result = result.filter((expense) => {
        const expenseDate = new Date(expense.date)
        return isWithinInterval(expenseDate, { start: dateRange.from!, end: dateRange.to! })
      })
    }

    // Sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "amount":
          aValue = a.amount
          bValue = b.amount
          break
        case "category":
          aValue = a.category
          bValue = b.category
          break
        case "date":
        default:
          aValue = new Date(a.date)
          bValue = new Date(b.date)
          break
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredExpenses(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [expenses, searchTerm, categoryFilter, dateRange, sortBy, sortOrder])

  // Update pagination when filtered expenses or page settings change
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginated = filteredExpenses.slice(startIndex, endIndex)
    
    setPaginatedExpenses(paginated)
    setTotalPages(Math.ceil(filteredExpenses.length / itemsPerPage))
  }, [filteredExpenses, currentPage, itemsPerPage])

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

  const stats = calculateStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight ml-12 md:ml-0">Expenses</h1>
          <p className="text-muted-foreground ml-12 md:ml-0">
            Manage and track your expenses
          </p>
        </div>
        <div className="flex gap-2 ml-2 md:ml-0">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5"
          >
            {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <Button onClick={() => router.push("/dashboard/add")} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.count} expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.average.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Expense</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.highest.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Single transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.topCategory ? stats.topCategory.name : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.topCategory ? `₹${stats.topCategory.amount.toLocaleString()}` : 'No expenses'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
            <CardDescription>
              Refine your expense view with advanced filtering options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Category Row */}
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search expenses, notes, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
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

            {/* Date Range and Quick Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuickDateFilter('thisMonth')}
                >
                  This Month
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuickDateFilter('lastMonth')}
                >
                  Last Month
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuickDateFilter('last30Days')}
                >
                  Last 30 Days
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuickDateFilter('thisYear')}
                >
                  This Year
                </Button>
                {(dateRange.from || dateRange.to) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuickDateFilter('clear')}
                  >
                    Clear Dates
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sort by:</span>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="gap-1"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {sortOrder === "asc" ? "Ascending" : "Descending"}
                </Button>
              </div>
              
              <Button 
                onClick={handleExportCSV}
                disabled={filteredExpenses.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV ({filteredExpenses.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {(searchTerm || categoryFilter !== "all" || dateRange.from || dateRange.to) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </span>
          {searchTerm && <Badge variant="secondary">Search: {searchTerm}</Badge>}
          {categoryFilter !== "all" && <Badge variant="secondary">{categoryFilter}</Badge>}
          {dateRange.from && dateRange.to && (
            <Badge variant="secondary">
              {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
            </Badge>
          )}
        </div>
      )}

      {/* Pagination Controls - Top */}
      {filteredExpenses.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} expenses
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Items per page:</span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense List */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40">
            <div className="text-center">
              <h3 className="text-lg font-semibold">No expenses found</h3>
              <p className="text-muted-foreground">
                {expenses.length === 0 
                  ? "Start by adding your first expense"
                  : "Try adjusting your filters or search terms"
                }
              </p>
              {expenses.length === 0 && (
                <Button 
                  onClick={() => router.push("/dashboard/add")} 
                  className="mt-4 gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Expense
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <ExpenseList
          expenses={paginatedExpenses}
          showActions
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectedExpenseId={selectedExpenseId}
          onSelect={setSelectedExpenseId}
        />
      )}

      {/* Pagination Controls - Bottom */}
      {filteredExpenses.length > 0 && totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="h-9 w-9 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="h-9 w-9 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {getPageNumbers().map((pageNum, index, array) => (
                  <div key={pageNum} className="flex items-center">
                    {index > 0 && array[index - 1] !== pageNum - 1 && (
                      <span className="px-2 text-sm text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="h-9 w-9 p-0"
                    >
                      {pageNum}
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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