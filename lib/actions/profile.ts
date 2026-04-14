"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const updates: Record<string, unknown> = {
    display_name: formData.get("display_name"),
    notification_email: formData.get("notification_email"),
    notification_phone: formData.get("notification_phone"),
    updated_at: new Date().toISOString(),
  }

  const apiKey = formData.get("anthropic_api_key") as string
  if (apiKey && apiKey.trim()) {
    updates.anthropic_api_key = apiKey.trim()
  }

  const budget = formData.get("token_budget") as string
  if (budget) {
    updates.token_budget = parseInt(budget, 10)
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function logTokenUsage(data: {
  model: string
  tokens_input: number
  tokens_output: number
  description?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("token_usage").insert({
    user_id: user.id,
    ...data,
  })

  if (error) return { error: error.message }

  // Update cumulative tokens_used on profile
  await supabase.rpc("increment_tokens_used", {
    p_user_id: user.id,
    p_amount: data.tokens_input + data.tokens_output,
  })

  revalidatePath("/dashboard")
  return { success: true }
}
