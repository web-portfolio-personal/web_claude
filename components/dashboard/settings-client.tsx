"use client"

import { useState, useTransition } from "react"
import { Key, User, Save, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { updateProfile } from "@/lib/actions/profile"
import type { Profile } from "@/lib/types"

interface SettingsClientProps {
  profile: Profile | null
  userId: string
  userEmail: string
}

export function SettingsClient({ profile, userId, userEmail }: SettingsClientProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSuccess(false)
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result?.error) setError(result.error)
      else setSuccess(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4 text-white/50" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display_name">Display name</Label>
            <Input
              id="display_name"
              name="display_name"
              defaultValue={profile?.display_name ?? ""}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email (account)</Label>
            <Input value={userEmail} disabled className="opacity-50" />
            <p className="text-xs text-white/30">Account email cannot be changed here.</p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Contacts</CardTitle>
          <CardDescription>Where we send your token alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="notification_email">Alert email</Label>
            <Input
              id="notification_email"
              name="notification_email"
              type="email"
              defaultValue={profile?.notification_email ?? ""}
              placeholder="alerts@example.com"
            />
            <p className="text-xs text-white/30">Leave blank to use your account email.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notification_phone">SMS phone number</Label>
            <Input
              id="notification_phone"
              name="notification_phone"
              type="tel"
              defaultValue={profile?.notification_phone ?? ""}
              placeholder="+1234567890"
            />
            <p className="text-xs text-white/30">Include country code. Requires Twilio configured.</p>
          </div>
        </CardContent>
      </Card>

      {/* Claude API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-4 w-4 text-white/50" />
            Anthropic API Key
          </CardTitle>
          <CardDescription>
            Used to track your token usage via the proxy endpoint.
            Stored server-side — never exposed to the browser after saving.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.anthropic_api_key && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
              <Badge variant="success">Key stored</Badge>
              <span className="text-sm text-emerald-300/80">Your API key is connected</span>
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400 ml-auto" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="anthropic_api_key">
              {profile?.anthropic_api_key ? "Replace API key" : "API key"}
            </Label>
            <div className="relative">
              <Input
                id="anthropic_api_key"
                name="anthropic_api_key"
                type={showApiKey ? "text" : "password"}
                placeholder="sk-ant-api03-..."
                className="pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-white/30">
              Get your key at <span className="text-violet-400">console.anthropic.com → API Keys</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Token Budget */}
      <Card>
        <CardHeader>
          <CardTitle>Token Budget</CardTitle>
          <CardDescription>
            Set your monthly token allowance. Alerts fire when you approach this limit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="token_budget">Budget (tokens)</Label>
            <Input
              id="token_budget"
              name="token_budget"
              type="number"
              min={0}
              defaultValue={profile?.token_budget ?? 0}
              placeholder="e.g. 1000000"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[100_000, 500_000, 1_000_000, 5_000_000].map((v) => (
              <div
                key={v}
                className="text-xs px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-white/50"
              >
                {v >= 1_000_000 ? `${v / 1_000_000}M` : `${v / 1_000}K`}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30">
            Set 0 for unlimited (alerts and depletion logic won't activate).
          </p>
        </CardContent>
      </Card>

      {/* Save */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          Settings saved successfully.
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          <><Save className="h-4 w-4" /> Save settings</>
        )}
      </Button>
    </form>
  )
}
