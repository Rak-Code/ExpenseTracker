"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { ArrowRight, BarChart3, DollarSign, PieChart, Wallet } from "lucide-react"

export function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <span className="text-xl font-bold">ExpenseTracker</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
              Track, Analyze & Optimize Your Expenses
            </h1>
            <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
              Take control of your finances with our intuitive expense tracker. Monitor your spending habits, visualize
              your expenses, and make informed financial decisions.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="gap-1.5">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center gap-2 rounded-lg border p-6 text-center shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Expense Tracking</h3>
              <p className="text-muted-foreground">
                Easily log and categorize your daily expenses to keep track of where your money goes.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border p-6 text-center shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Visual Analytics</h3>
              <p className="text-muted-foreground">
                Visualize your spending patterns with interactive charts and graphs for better insights.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border p-6 text-center shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <PieChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Budget Management</h3>
              <p className="text-muted-foreground">
                Set budgets for different categories and track your progress to stay within your financial goals.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ExpenseTracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
