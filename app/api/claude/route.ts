import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"

/**
 * Claude API Proxy
 * POST /api/claude
 * Body: { model, messages, max_tokens, system? }
 *
 * Forwards the request to Anthropic using the user's stored API key,
 * tracks token usage in Supabase, and triggers alerts if needed.
 */
export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Load user's API key
  const { data: profile } = await supabase
    .from("profiles")
    .select("anthropic_api_key, token_budget, tokens_used, notification_email, notification_phone, push_subscription")
    .eq("id", user.id)
    .single()

  if (!profile?.anthropic_api_key) {
    return NextResponse.json(
      { error: "No Anthropic API key configured. Add it in Settings." },
      { status: 400 }
    )
  }

  const body = await req.json()

  // Forward to Anthropic
  const anthropicRes = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": profile.anthropic_api_key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: body.model ?? "claude-sonnet-4-6",
      messages: body.messages,
      max_tokens: body.max_tokens ?? 4096,
      ...(body.system ? { system: body.system } : {}),
    }),
  })

  const data = await anthropicRes.json()

  if (!anthropicRes.ok) {
    return NextResponse.json({ error: data.error?.message ?? "Anthropic API error" }, { status: anthropicRes.status })
  }

  // Track token usage
  const inputTokens = data.usage?.input_tokens ?? 0
  const outputTokens = data.usage?.output_tokens ?? 0
  const total = inputTokens + outputTokens

  if (total > 0) {
    await supabase.from("token_usage").insert({
      user_id: user.id,
      model: data.model ?? body.model ?? "claude-sonnet-4-6",
      tokens_input: inputTokens,
      tokens_output: outputTokens,
      description: body.description ?? `${body.messages?.length ?? 1} message(s)`,
    })

    // Update cumulative usage
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .update({
        tokens_used: (profile.tokens_used ?? 0) + total,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("tokens_used, token_budget")
      .single()

    // Trigger alerts if thresholds crossed
    if (updatedProfile && updatedProfile.token_budget > 0) {
      const newPercent = Math.floor((updatedProfile.tokens_used / updatedProfile.token_budget) * 100)
      const oldPercent = Math.floor((profile.tokens_used / updatedProfile.token_budget) * 100)

      // Fire alerts notification in background (non-blocking)
      const { data: alerts } = await supabase
        .from("token_alerts")
        .select("*")
        .eq("user_id", user.id)
        .eq("enabled", true)

      for (const alert of alerts ?? []) {
        if (oldPercent < alert.threshold_percent && newPercent >= alert.threshold_percent) {
          // Trigger notification
          fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/trigger`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              alertId: alert.id,
              percent: newPercent,
              email: alert.alert_email ? profile.notification_email : null,
              phone: alert.alert_sms ? profile.notification_phone : null,
              pushSub: alert.alert_push ? profile.push_subscription : null,
            }),
          }).catch(() => {})
        }
      }
    }
  }

  return NextResponse.json(data)
}
