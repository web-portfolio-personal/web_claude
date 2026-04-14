import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TokenChartsClient } from "@/components/dashboard/token-charts-client"

export default async function TokensPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get last 30 days of usage
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: usage } = await supabase
    .from("token_usage")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true })

  const { data: profile } = await supabase
    .from("profiles")
    .select("token_budget, tokens_used")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Token Usage</h1>
        <p className="text-white/40 text-sm mt-1">Your Claude API consumption over the last 30 days.</p>
      </div>
      <TokenChartsClient usage={usage ?? []} profile={profile} />
    </div>
  )
}
