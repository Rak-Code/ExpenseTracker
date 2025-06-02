import { Metadata } from 'next';
import { Dashboard } from "@/components/dashboard"
import { DashboardLayout } from "@/components/dashboard-layout"

export const metadata: Metadata = {
  title: 'Dashboard - Your Financial Overview',
  description: 'View your expense summary, recent transactions, and financial analytics in one place.',
  openGraph: {
    title: 'Dashboard - Your Financial Overview',
    description: 'View your expense summary, recent transactions, and financial analytics in one place.',
    images: ['/placeholder-logo.png'],
  }
};

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  )
}
