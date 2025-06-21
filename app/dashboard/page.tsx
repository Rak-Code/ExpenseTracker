import { Metadata } from 'next'
import { Dashboard } from "@/components/dashboard"

export const metadata: Metadata = {
  title: 'Expense Tracker Dashboard | Personal Finance & Budget Management',
  description: 'Track your expenses, manage your monthly budget, and get detailed financial insights — all in one place. Start taking control of your money today.',
  keywords: [
    'expense tracker',
    'budget management',
    'personal finance dashboard',
    'track spending',
    'monthly budget planner',
    'financial analytics'
  ],
  openGraph: {
    title: 'Track Expenses & Budget Smarter | Expense Tracker Dashboard',
    description: 'Your all-in-one dashboard to view expenses, analyze financial data, and stay in control of your money. Ideal for personal and family budgeting.',
    images: ['/placeholder-logo.png'],
    type: 'website',
    url: 'https://expense-tracker-iota-three.vercel.app/', // update with actual domain
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expense Tracker Dashboard',
    description: 'Track spending, view insights, and manage your budget effectively. Get started for smarter personal finance.',
    images: ['/placeholder-logo.png'],
  }
}

export default function DashboardPage() {
  return (
    <Dashboard />
  )
}
