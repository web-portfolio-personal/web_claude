import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await req.json()
  const content = (body.content ?? "").trim()

  if (!content || content.length > 1000) {
    return NextResponse.json({ error: "Invalid message content" }, { status: 400 })
  }

  // Check if tokens are depleted
  const { data: profile } = await supabase
    .from("profiles")
    .select("token_budget, tokens_used")
    .eq("id", user.id)
    .single()

  const isDepleted =
    profile && profile.token_budget > 0 && profile.tokens_used >= profile.token_budget

  if (isDepleted) {
    // Check and enforce 3-turn daily limit
    const today = new Date().toISOString().split("T")[0]

    const { data: turnData } = await supabase
      .from("chat_daily_turns")
      .select("turns_used")
      .eq("user_id", user.id)
      .eq("turn_date", today)
      .single()

    const turnsUsed = turnData?.turns_used ?? 0

    if (turnsUsed >= 3) {
      return NextResponse.json(
        { error: "Daily turn limit reached (3/3). Come back tomorrow." },
        { status: 429 }
      )
    }

    // Upsert turn count
    await supabase.from("chat_daily_turns").upsert(
      { user_id: user.id, turn_date: today, turns_used: turnsUsed + 1 },
      { onConflict: "user_id,turn_date" }
    )
  }

  // Insert message
  const { error } = await supabase.from("global_messages").insert({
    user_id: user.id,
    content,
    is_depleted_post: !!isDepleted,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
