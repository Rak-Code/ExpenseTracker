"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, query, where, orderBy, deleteDoc, doc, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Slider } from "@/components/ui/slider"
import { ExpenseList } from "@/components/expense-list"
import { EditExpenseDialog } from "@/components/edit-expense-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Expense } from "@/types"
import { 
  Loader2, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Download,
  Upload,
  BarChart3,
  Calendar as CalendarIcon,
  DollarSign,
  Trash2,
  Edit3,
  Copy,
  Eye,
  Settings,
  TrendingUp,
  PieChart,
  X,
  CheckSquare,
  Square
} from "lucide-react"
import { CATEGORIES } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"

// Quick filter presets
const QUICK_FILTERS = [
  { label: "Today", days: 0 },
  { label: "This Week", days: 7 },
  { label: "This Month", days: 30 },
  { label: "Last 3 Months", days: 90 },
  { label: "This Year", days: 365 }
]

export function ExpensesPage() {
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("list")
  
  // Enhanced filtering state
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 10000])
  const [quickFilter, setQuickFilter] = useState<string | null>(null)
  
  // Bulk operations state
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)
  
  // Pagination state (preserved from original)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  
  // Advanced UI state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [sortField, setSortField] = useState<"date" | "amount" | "description">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const average = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0
    const highest = filteredExpenses.reduce((max, expense) => 
      expense.amount > max ? expense.amount : max, 0)
    
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)
    
    const topCategory = Object.entries(categoryTotals).reduce(
      (max, [category, amount]) => amount > max.amount ? { category, amount } : max,
      { category: "", amount: 0 }
    )

    return {
      total,
      average,
      highest,
      topCategory,
      count: filteredExpenses.length
    }
  }, [filteredExpenses])

  // Enhanced filtering logic
  const applyFilters = useCallback(() => {
    let result = [...expenses]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((expense) => 
        expense.description.toLowerCase().includes(term) ||
        expense.category.toLowerCase().includes(term) ||
        (expense.notes && expense.notes.toLowerCase().includes(term))
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((expense) => expense.category === categoryFilter)
    }

    // Date range filter
    if (dateRange.from) {
      result = result.filter((expense) => new Date(expense.date) >= dateRange.from!)
    }
    if (dateRange.to) {
      result = result.filter((expense) => new Date(expense.date) <= dateRange.to!)
    }

    // Quick filter
    if (quickFilter) {
      const filterData = QUICK_FILTERS.find(f => f.label === quickFilter)
      if (filterData) {
        const cutoffDate = new Date()
        if (filterData.days === 0) {
          cutoffDate.setHours(0, 0, 0, 0)
        } else {
          cutoffDate.setDate(cutoffDate.getDate() - filterData.days)
        }
        result = result.filter((expense) => new Date(expense.date) >= cutoffDate)
      }
    }

    // Amount range filter
    result = result.filter((expense) => 
      expense.amount >= amountRange[0] && expense.amount <= amountRange[1]
    )

    // Sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortField) {
        case "amount":
          aValue = a.amount
          bValue = b.amount
          break
        case "description":
          aValue = a.description.toLowerCase()
          bValue = b.description.toLowerCase()
          break
        default:
          aValue = new Date(a.date)
          bValue = new Date(b.date)
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredExpenses(result)
  }, [expenses, searchTerm, categoryFilter, dateRange, quickFilter, amountRange, sortField, sortDirection])

  // Calculate pagination values
  const totalItems = filteredExpenses.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentExpenses = filteredExpenses.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, dateRange, quickFilter])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  // Enhanced CSV Export
  const handleExportCSV = useCallback(() => {
    const dataToExport = selectedExpenses.size > 0 
      ? expenses.filter(exp => selectedExpenses.has(exp.id))
      : filteredExpenses

    if (dataToExport.length === 0) {
      toast({ title: "No expenses", description: "No expenses to export." })
      return
    }

    const header = ["Date", "Description", "Category", "Amount", "Notes"]
    const rows = dataToExport.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      exp.description,
      exp.category,
      exp.amount,
      exp.notes ? exp.notes.replace(/\r?\n|\r/g, ' ') : ''
    ])
    
    const csvContent = [header, ...rows]
      .map(row => row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','))
      .join('\r\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses_${new Date().toISOString().slice(0,7)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export successful",
      description: `Exported ${dataToExport.length} expenses to CSV.`
    })
  }, [filteredExpenses, selectedExpenses, expenses, toast])

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedExpenses.size === currentExpenses.length) {
      setSelectedExpenses(new Set())
    } else {
      setSelectedExpenses(new Set(currentExpenses.map(exp => exp.id)))
    }
  }

  const handleSelectExpense = (expenseId: string) => {
    const newSelected = new Set(selectedExpenses)
    if (newSelected.has(expenseId)) {
      newSelected.delete(expenseId)
    } else {
      newSelected.add(expenseId)
    }
    setSelectedExpenses(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedExpenses.size === 0) return

    try {
      const batch = writeBatch(db)
      selectedExpenses.forEach(expenseId => {
        batch.delete(doc(db, "expenses", expenseId))
      })
      
      await batch.commit()
      
      setExpenses(expenses.filter(exp => !selectedExpenses.has(exp.id)))
      setSelectedExpenses(new Set())
      setBulkMode(false)
      
      toast({
        title: "Bulk delete successful",
        description: `Deleted ${selectedExpenses.size} expenses.`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expenses. Please try again.",
        variant: "destructive",
      })
    }
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setDateRange({})
    setQuickFilter(null)
    setAmountRange([0, 10000])
  }

  // Original functions preserved
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
        
        // Set initial amount range based on actual data
        if (expensesData.length > 0) {
          const maxAmount = Math.max(...expensesData.map(exp => exp.amount))
          setAmountRange([0, Math.ceil(maxAmount * 1.1)])
        }
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

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handlePageSizeChange = (newSize: string) => {
    setItemsPerPage(Number(newSize))
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight ml-12 md:ml-0">Expenses</h1>
          {filteredExpenses.length !== expenses.length && (
            <Badge variant="secondary" className="text-xs">
              {filteredExpenses.length} of {expenses.length} shown
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2 md:ml-0">
          <Button
            variant="outline"
            onClick={() => setBulkMode(!bulkMode)}
            className={bulkMode ? "bg-primary text-primary-foreground" : ""}
          >
            {bulkMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            Bulk Select
          </Button>
          <Button onClick={() => router.push("/dashboard/add")} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{formatCurrency(statistics.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Average</p>
                <p className="text-xl font-bold">{formatCurrency(statistics.average)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Highest</p>
                <p className="text-xl font-bold">{formatCurrency(statistics.highest)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-purple-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Top Category</p>
                <p className="text-sm font-bold truncate">{statistics.topCategory.category || "None"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Count</p>
                <p className="text-xl font-bold">{statistics.count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {QUICK_FILTERS.map((filter) => (
              <Button
                key={filter.label}
                variant={quickFilter === filter.label ? "default" : "outline"}
                size="sm"
                onClick={() => setQuickFilter(quickFilter === filter.label ? null : filter.label)}
                className="text-xs"
              >
                {filter.label}
              </Button>
            ))}
            {(quickFilter || searchTerm || categoryFilter !== "all" || dateRange.from || dateRange.to) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Main Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by description, category, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
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

              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Advanced
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedExpenses.size > 0 && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedExpenses.size})
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                <Download className="h-4 w-4" />
                {selectedExpenses.size > 0 ? `Export Selected (${selectedExpenses.size})` : 'Export CSV'}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? dateRange.from.toLocaleDateString() : "From date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? dateRange.to.toLocaleDateString() : "To date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Amount Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Amount Range: {formatCurrency(amountRange[0])} - {formatCurrency(amountRange[1])}
                  </label>
                  <Slider
                    value={amountRange}
                    onValueChange={(value) => setAmountRange(value as [number, number])}
                    max={Math.max(10000, ...expenses.map(e => e.amount))}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Sort by:</label>
                  <Select value={sortField} onValueChange={(value: any) => setSortField(value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="description">Description</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Order:</label>
                  <Select value={sortDirection} onValueChange={(value: any) => setSortDirection(value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Expense List */}
      <Card>
        <CardContent className="p-0">
          {/* Bulk Actions Header */}
          {bulkMode && (
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedExpenses.size === currentExpenses.length && currentExpenses.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedExpenses.size > 0 
                    ? `${selectedExpenses.size} selected`
                    : "Select all"
                  }
                </span>
              </div>
              
              {selectedExpenses.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-1" />
                    Bulk Edit
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="p-4">
            <ExpenseList
              expenses={currentExpenses}
              showActions
              onEdit={handleEdit}
              onDelete={handleDelete}
              selectedExpenseId={selectedExpenseId}
              onSelect={setSelectedExpenseId}
              // Enhanced props for bulk selection
              bulkMode={bulkMode}
              selectedExpenses={selectedExpenses}
              onSelectExpense={handleSelectExpense}
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Pagination (preserved from original) */}
      {totalItems > 0 && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} expenses
            </span>
            <Select value={itemsPerPage.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber: number;
                
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Original Edit Dialog (preserved) */}
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