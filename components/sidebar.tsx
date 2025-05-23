"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { BarChart3, Home, LogOut, Plus, Wallet } from "lucide-react"

import { useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/expenses", label: "Expenses", icon: BarChart3 },
    { href: "/dashboard/add", label: "Add Expense", icon: Plus },
  ]

  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-md bg-background border md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Sidebar overlay for mobile */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity md:hidden ${open ? 'block' : 'hidden'}`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-background border-r flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} md:flex`}
        style={{ willChange: 'transform' }}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <span className="font-bold">ExpenseTracker</span>
          </Link>
          {/* Close button for mobile */}
          <button
            className="ml-auto md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link key={item.href} href={item.href}>
                  <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              {user?.displayName?.[0] || user?.email?.[0] || "U"}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium">{user?.displayName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  )
}
