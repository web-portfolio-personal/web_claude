import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AlertsClient } from "@/components/dashboard/alerts-client"

export default async function AlertsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [profileRes, alertsRes] = await Promise.all([
    supabase.from("profiles").select("notification_email, notification_phone, push_subscription").eq("id", user.id).single(),
    supabase.from("token_alerts").select("*").eq("user_id", user.id).order("threshold_percent"),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Alerts & Notifications</h1>
        <p className="text-white/40 text-sm mt-1">
          Get notified via email, SMS, or push before your tokens run out.
        </p>
      </div>
      <AlertsClient
        alerts={alertsRes.data ?? []}
        profile={profileRes.data}
        userId={user.id}
      />
    </div>
  )
}
