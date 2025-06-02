import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { AppFooter } from "@/components/app-footer"
import { Analytics } from "@vercel/analytics/next"
import { OrganizationJsonLd } from "@/components/json-ld"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://expense-tracker-iota-three.vercel.app/'),
  title: {
    default: "Expense Tracker - Manage Your Finances Smartly",
    template: "%s | Expense Tracker"
  },
  alternates: {
    canonical: 'https://expense-tracker-iota-three.vercel.app',
  },
  description: "Track, analyze, and manage your expenses effortlessly. Get insights into your spending patterns, create budgets, and make smarter financial decisions.",
  generator: 'Next.js',
  applicationName: 'Expense Tracker',
  keywords: ['expense tracker', 'finance management', 'budget planner', 'personal finance', 'money management', 'financial analytics'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  publisher: 'Your Name',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Expense Tracker - Manage Your Finances Smartly',
    description: 'Track, analyze, and manage your expenses effortlessly. Get insights into your spending patterns, create budgets, and make smarter financial decisions.',
    url: 'https://expense-tracker-iota-three.vercel.app/',
    siteName: 'Expense Tracker',
    images: [
      {
        url: '/placeholder-logo.png',
        width: 1200,
        height: 630,
        alt: 'Expense Tracker - Your Personal Finance Manager',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expense Tracker - Manage Your Finances Smartly',
    description: 'Track, analyze, and manage your expenses effortlessly. Get insights into your spending patterns.',
    images: ['/placeholder-logo.png'],
    creator: '@yourtwitterhandle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'SpdLeJauv8YY-ZBKeQaufQSnLDh7Nz4b8eCc9hAUDnU',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <AppFooter />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
