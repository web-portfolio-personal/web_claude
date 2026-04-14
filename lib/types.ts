export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  anthropic_api_key: string | null
  token_budget: number
  tokens_used: number
  period_start: string
  notification_email: string | null
  notification_phone: string | null
  push_subscription: PushSubscriptionJSON | null
  created_at: string
  updated_at: string
}

export interface TokenUsage {
  id: string
  user_id: string
  model: string
  tokens_input: number
  tokens_output: number
  tokens_total: number
  description: string | null
  created_at: string
}

export interface TokenAlert {
  id: string
  user_id: string
  threshold_percent: number
  alert_email: boolean
  alert_sms: boolean
  alert_push: boolean
  alert_desktop: boolean
  enabled: boolean
  last_triggered_at: string | null
  created_at: string
}

export interface GlobalMessage {
  id: string
  user_id: string
  content: string
  is_depleted_post: boolean
  created_at: string
  profiles?: {
    display_name: string | null
    avatar_url: string | null
  }
}

export interface ChatDailyTurns {
  id: string
  user_id: string
  turn_date: string
  turns_used: number
}

export type PushSubscriptionJSON = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}
