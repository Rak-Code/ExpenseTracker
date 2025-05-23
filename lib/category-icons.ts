import {
  ShoppingBag,
  Car,
  Home,
  Lightbulb,
  Film,
  ShoppingCart,
  Heart,
  GraduationCap,
  Plane,
  Scissors,
  Gift,
  TrendingUp,
  DollarSign,
  HelpCircle,
  type LucideIcon,
} from "lucide-react"

export function getCategoryIcon(category: string): LucideIcon {
  switch (category) {
    case "Food & Dining":
      return ShoppingBag
    case "Transportation":
      return Car
    case "Housing":
      return Home
    case "Utilities":
      return Lightbulb
    case "Entertainment":
      return Film
    case "Shopping":
      return ShoppingCart
    case "Healthcare":
      return Heart
    case "Education":
      return GraduationCap
    case "Travel":
      return Plane
    case "Personal Care":
      return Scissors
    case "Gifts & Donations":
      return Gift
    case "Investments":
      return TrendingUp
    case "Income":
      return DollarSign
    default:
      return HelpCircle
  }
}
