import { ExpensesPage } from "@/components/expenses-page"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function Expenses() {
  return (
    <DashboardLayout>
      <ExpensesPage />
    </DashboardLayout>
  )
}
