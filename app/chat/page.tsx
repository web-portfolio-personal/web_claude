import { createClient } from "@/lib/supabase/server"
import { GlobalChatClient } from "@/components/chat/global-chat-client"

export default async function ChatPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Load initial messages (last 50) — no join to avoid schema cache dependency
  const { data: rawMessages } = await supabase
    .from("global_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  // Fetch profile display names for unique user_ids
  const userIds = [...new Set((rawMessages ?? []).map((m) => m.user_id))]
  const { data: msgProfiles } = userIds.length
    ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds)
    : { data: [] }

  const profileMap = Object.fromEntries((msgProfiles ?? []).map((p) => [p.id, p]))
  const messages = (rawMessages ?? []).map((m) => ({
    ...m,
    profiles: profileMap[m.user_id] ?? null,
  }))

  // If authenticated, load user context
  let profile = null
  let dailyTurns = 0

  if (user) {
    const [profileRes] = await Promise.all([
      supabase.from("profiles").select("display_name, token_budget, tokens_used").eq("id", user.id).single(),
    ])
    profile = profileRes.data

    // Get today's turn count
    const { data: turnsData } = await supabase
      .from("chat_daily_turns")
      .select("turns_used")
      .eq("user_id", user.id)
      .eq("turn_date", new Date().toISOString().split("T")[0])
      .single()

    dailyTurns = turnsData?.turns_used ?? 0
  }

  const isTokensDepleted =
    !!profile && profile.token_budget > 0 && profile.tokens_used >= profile.token_budget

  const turnsRemaining = Math.max(0, 3 - dailyTurns)

  return (
    <GlobalChatClient
      initialMessages={(messages ?? []).reverse()}
      user={user}
      profile={profile}
      isTokensDepleted={isTokensDepleted}
      turnsRemaining={turnsRemaining}
    />
  )
}
