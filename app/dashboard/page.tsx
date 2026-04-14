import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TokenOverviewCard } from "@/components/dashboard/token-overview-card"
import { RecentUsageTable } from "@/components/dashboard/recent-usage-table"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [profileRes, usageRes, alertsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("token_usage")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("token_alerts").select("*").eq("user_id", user.id),
  ])

  const profile = profileRes.data
  const recentUsage = usageRes.data ?? []
  const alerts = alertsRes.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good {getGreeting()},{" "}
          <span className="gradient-text">{profile?.display_name ?? "there"}</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Here's your token usage at a glance.</p>
      </div>

      {/* Token overview */}
      <TokenOverviewCard profile={profile} />

      {/* Quick actions */}
      <QuickActions hasApiKey={!!profile?.anthropic_api_key} alerts={alerts} />

      {/* Recent usage */}
      <RecentUsageTable usage={recentUsage} />
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 18) return "afternoon"
  return "evening"
}
