"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  PieChart,
  Wallet,
  IndianRupee,
  TrendingUp,
  Shield,
  Smartphone,
  Check,
  Star,
} from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";
import { useAuth } from "@/lib/auth";

export function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpenLogin, setIsOpenLogin] = useState(false);
  const [isOpenSignup, setIsOpenSignup] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "₹50L+", label: "Expenses Tracked" },
    { value: "95%", label: "User Satisfaction" },
    { value: "24/7", label: "Support" },
  ];

  const testimonials = [
    {
      name: "Adarsh Pandey",
      role: "Software Engineer",
      content:
        "ExpenseTracker helped me save ₹30,000 in just 3 months by showing me exactly where my money was going.",
      rating: 5,
    },
    {
      name: "Anubhav Tripathi",
      role: "Python Developer",
      content:
        "The visual analytics are incredible. I can now make data-driven decisions about my business expenses.",
      rating: 5,
    },
    {
      name: "Abhishek Yadav",
      role: "Freelancer",
      content:
        "Perfect for tracking project expenses and client billing. The categorization feature is a game-changer.",
      rating: 5,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="rounded-lg bg-gradient-to-r from-gray-800 to-black p-2 group-hover:scale-110 transition-transform duration-200">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
              ExpenseTracker
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isOpenLogin} onOpenChange={setIsOpenLogin}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  onClick={() => setIsOpenLogin(true)}
                >
                  Login
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full">
                <LoginForm />
              </DialogContent>
            </Dialog>
            <Dialog open={isOpenSignup} onOpenChange={setIsOpenSignup}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => setIsOpenSignup(true)}
                >
                  Sign Up
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full">
                <SignupForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-16 md:py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-3xl"></div>
          <div
            className={`mx-auto flex max-w-[980px] flex-col items-center gap-8 text-center relative z-10 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >              <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 mb-4">
              <Star className="h-4 w-4" />
              Trusted by 10,000+ users in India
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl lg:leading-[1.1] bg-gradient-to-r from-gray-900 via-gray-800 to-black bg-clip-text text-transparent">
              Track, Analyze & Optimize Your Expenses
            </h1>
            <p className="max-w-[750px] text-lg text-slate-600 sm:text-xl leading-relaxed">
              Take control of your finances with our intuitive expense tracker.
              Monitor your spending habits, visualize your expenses, and make
              informed financial decisions with AI-powered insights.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row mt-4">
              <Dialog open={isOpenSignup} onOpenChange={setIsOpenSignup}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg"
                  >
                    Get Started Free <ArrowRight className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-full">
                  <SignupForm />
                </DialogContent>
              </Dialog>
              <Dialog open={isOpenLogin} onOpenChange={setIsOpenLogin}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 px-8 py-3 text-lg"
                  >
                    Watch Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-full">
                  <LoginForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container py-12 md:py-16">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-4 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="text-3xl md:text-4xl font-bold text-gray-800 group-hover:scale-110 transition-transform duration-200">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="container py-16 md:py-24 lg:py-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to manage your finances
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to give you complete control over your
              financial life
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="group flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 p-4 group-hover:scale-110 transition-transform duration-200">
                <IndianRupee className="h-8 w-8 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Smart Expense Tracking
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Automatically categorize expenses with AI, track recurring
                payments, and get instant notifications for unusual spending.
              </p>
            </div>
            <div className="group flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 p-4 group-hover:scale-110 transition-transform duration-200">
                <BarChart3 className="h-8 w-8 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Advanced Analytics
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Interactive dashboards, spending trends, and predictive
                analytics to help you make smarter financial decisions.
              </p>
            </div>
            <div className="group flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 p-4 group-hover:scale-110 transition-transform duration-200">
                <PieChart className="h-8 w-8 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Smart Budgeting
              </h3>
              <p className="text-slate-600 leading-relaxed">
                AI-powered budget recommendations, goal tracking, and automated
                savings suggestions based on your spending patterns.
              </p>
            </div>
            <div className="group flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="rounded-2xl bg-gradient-to-r from-orange-100 to-red-100 p-4 group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Investment Tracking
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Monitor your investments, track portfolio performance, and get
                insights on your overall financial health.
              </p>
            </div>
            <div className="group flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="rounded-2xl bg-gradient-to-r from-teal-100 to-green-100 p-4 group-hover:scale-110 transition-transform duration-200">
                <Shield className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Bank-Level Security
              </h3>
              <p className="text-slate-600 leading-relaxed">
                256-bit encryption, secure data storage, and privacy-first
                approach to keep your financial data safe.
              </p>
            </div>
            <div className="group flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="rounded-2xl bg-gradient-to-r from-indigo-100 to-blue-100 p-4 group-hover:scale-110 transition-transform duration-200">
                <Smartphone className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Mobile First</h3>
              <p className="text-slate-600 leading-relaxed">
                Native mobile apps for iOS and Android with offline support,
                photo receipts, and real-time sync across devices.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container py-16 md:py-24 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl my-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Loved by thousands of users
            </h2>
            <p className="text-lg text-slate-600">
              See what our users have to say about their experience
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-slate-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-slate-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-16 md:py-24 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Ready to join the community?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Join thousands of developers and users contributing to the future
              of expense tracking
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://github.com/yourorg/expense-tracker"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>
              <a
                href="/docs"
                className="inline-flex items-center gap-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Documentation
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                MIT Licensed
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Self-hosted
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Community driven
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
