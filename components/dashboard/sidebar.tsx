"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap, LayoutDashboard, BarChart3, Bell, Settings, Globe, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/actions/auth"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

interface SidebarProps {
  user: SupabaseUser
  profile: Profile | null
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tokens", label: "Token Usage", icon: BarChart3 },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Sidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-white/6 bg-black/40 backdrop-blur-xl flex flex-col z-20 lg:flex hidden lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/6">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-white font-semibold">TokenWatch</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/6"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}

        <div className="pt-2 mt-2 border-t border-white/6">
          <Link
            href="/chat"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              "text-white/50 hover:text-white hover:bg-white/6"
            )}
          >
            <Globe className="h-4 w-4" />
            Global Chat
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
          </Link>
        </div>
      </nav>

      {/* User / Sign out */}
      <div className="p-3 border-t border-white/6">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 mb-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <User className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {profile?.display_name ?? "User"}
            </p>
            <p className="text-xs text-white/35 truncate">{user.email}</p>
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/8 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
