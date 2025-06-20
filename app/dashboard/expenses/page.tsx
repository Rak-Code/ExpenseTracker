import { Metadata } from 'next';
import { ExpensesPage } from "@/components/expenses-page"

export const metadata: Metadata = {
  title: 'Expense History - Track Your Spending',
  description: 'View and manage your expense history, filter by categories, and analyze your spending patterns.',
  openGraph: {
    title: 'Expense History - Track Your Spending',
    description: 'View and manage your expense history, filter by categories, and analyze your spending patterns.',
    images: ['/placeholder-logo.png'],
  }
};

export default function Expenses() {
  return (
    <ExpensesPage />
  )
}
