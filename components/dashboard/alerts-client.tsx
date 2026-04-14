"use client"

import { useState, useTransition } from "react"
import { Bell, Mail, MessageSquare, Monitor, Plus, Trash2, Loader2, Smartphone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { TokenAlert } from "@/lib/types"

interface AlertsClientProps {
  alerts: TokenAlert[]
  profile: { notification_email: string | null; notification_phone: string | null } | null
  userId: string
}

export function AlertsClient({ alerts: initialAlerts, profile, userId }: AlertsClientProps) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [isPending, startTransition] = useTransition()
  const [newThreshold, setNewThreshold] = useState("80")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function addAlert() {
    const pct = parseInt(newThreshold, 10)
    if (isNaN(pct) || pct < 1 || pct > 100) {
      setError("Threshold must be between 1 and 100")
      return
    }
    setAdding(true)
    setError(null)
    const { data, error: err } = await supabase
      .from("token_alerts")
      .insert({
        user_id: userId,
        threshold_percent: pct,
        alert_email: !!profile?.notification_email,
        alert_push: true,
        alert_desktop: true,
        enabled: true,
      })
      .select()
      .single()

    if (err) { setError(err.message); setAdding(false); return }
    setAlerts((prev) => [...prev, data].sort((a, b) => a.threshold_percent - b.threshold_percent))
    setNewThreshold("80")
    setAdding(false)
  }

  async function deleteAlert(id: string) {
    await supabase.from("token_alerts").delete().eq("id", id)
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  async function toggleAlert(id: string, enabled: boolean) {
    await supabase.from("token_alerts").update({ enabled }).eq("id", id)
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, enabled } : a))
  }

  async function requestPushPermission() {
    if (!("Notification" in window)) return alert("Push not supported in this browser")
    const perm = await Notification.requestPermission()
    if (perm !== "granted") return alert("Permission denied")

    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })

    await supabase
      .from("profiles")
      .update({ push_subscription: sub.toJSON() })
      .eq("id", userId)

    alert("Push notifications enabled!")
  }

  return (
    <div className="space-y-4">
      {/* Channel info */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>Configure where alerts are sent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/4 border border-white/8">
            <div className="h-9 w-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Mail className="h-4 w-4 text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Email</p>
              <p className="text-xs text-white/40">
                {profile?.notification_email ?? "No email set — update in Settings"}
              </p>
            </div>
            <Badge variant={profile?.notification_email ? "success" : "secondary"}>
              {profile?.notification_email ? "Ready" : "Not set"}
            </Badge>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/4 border border-white/8">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">SMS</p>
              <p className="text-xs text-white/40">
                {profile?.notification_phone ?? "No phone set — update in Settings"}
              </p>
            </div>
            <Badge variant={profile?.notification_phone ? "success" : "secondary"}>
              {profile?.notification_phone ? "Ready" : "Not set"}
            </Badge>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/4 border border-white/8">
            <div className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Monitor className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Desktop Push</p>
              <p className="text-xs text-white/40">Browser push notifications</p>
            </div>
            <Button variant="outline" size="sm" onClick={requestPushPermission}>
              <Smartphone className="h-3.5 w-3.5" />
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add alert */}
      <Card>
        <CardHeader>
          <CardTitle>Add Alert Threshold</CardTitle>
          <CardDescription>Get notified when token usage reaches a percentage of your budget</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label>Threshold (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                placeholder="e.g. 80"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addAlert} disabled={adding}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add
              </Button>
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-400 mt-2">{error}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {[50, 75, 80, 90, 95].map((v) => (
              <button
                key={v}
                onClick={() => setNewThreshold(String(v))}
                className="text-xs px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                {v}%
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert list */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-white/30 text-sm">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No alerts configured. Add one above.
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/4 border border-white/8"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-violet-300">{alert.threshold_percent}%</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Alert at {alert.threshold_percent}% usage</p>
                    <div className="flex gap-1.5 mt-1">
                      {alert.alert_email && <Badge variant="default" className="text-xs">Email</Badge>}
                      {alert.alert_sms && <Badge variant="cyan" className="text-xs">SMS</Badge>}
                      {alert.alert_push && <Badge variant="secondary" className="text-xs">Push</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.enabled ? "success" : "secondary"}>
                      {alert.enabled ? "Active" : "Paused"}
                    </Badge>
                    <button
                      onClick={() => toggleAlert(alert.id, !alert.enabled)}
                      className="text-xs text-white/40 hover:text-white/70 transition-colors"
                    >
                      {alert.enabled ? "Pause" : "Enable"}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMS setup note */}
      <div className="rounded-2xl border border-amber-500/15 bg-amber-500/8 p-4 text-sm text-amber-300/80">
        <p className="font-medium mb-1">SMS requires Twilio setup</p>
        <p className="text-amber-300/60 text-xs">
          Add your Twilio credentials to <code className="bg-white/8 px-1 rounded">.env.local</code> to enable SMS alerts.
          See the setup guide for instructions.
        </p>
      </div>
    </div>
  )
}
