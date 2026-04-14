import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatPercent(used: number, budget: number): number {
  if (budget === 0) return 0
  return Math.min(Math.round((used / budget) * 100), 100)
}

export function getStatusColor(percent: number): string {
  if (percent >= 90) return "text-red-400"
  if (percent >= 70) return "text-amber-400"
  return "text-emerald-400"
}

export function getProgressColor(percent: number): string {
  if (percent >= 90) return "from-red-500 to-red-600"
  if (percent >= 70) return "from-amber-500 to-orange-500"
  return "from-violet-500 to-indigo-500"
}
