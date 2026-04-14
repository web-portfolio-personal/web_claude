import Link from "next/link"
import { Key, Bell, Globe, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { TokenAlert } from "@/lib/types"

interface QuickActionsProps {
  hasApiKey: boolean
  alerts: TokenAlert[]
}

export function QuickActions({ hasApiKey, alerts }: QuickActionsProps) {
  const activeAlerts = alerts.filter((a) => a.enabled)

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <ActionCard
        icon={<Key className="h-5 w-5 text-violet-400" />}
        title={hasApiKey ? "API Key Connected" : "Connect API Key"}
        desc={hasApiKey ? "Your Anthropic key is linked" : "Add your key to enable tracking"}
        cta={hasApiKey ? "Update key" : "Connect now"}
        href="/dashboard/settings"
        done={hasApiKey}
      />
      <ActionCard
        icon={<Bell className="h-5 w-5 text-amber-400" />}
        title={activeAlerts.length > 0 ? `${activeAlerts.length} Alert${activeAlerts.length > 1 ? "s" : ""} Active` : "Set Up Alerts"}
        desc={activeAlerts.length > 0 ? "You'll be notified before tokens run out" : "Get notified before you run out"}
        cta="Manage alerts"
        href="/dashboard/alerts"
        done={activeAlerts.length > 0}
      />
      <ActionCard
        icon={<Globe className="h-5 w-5 text-cyan-400" />}
        title="Global Chat"
        desc="Join the community when tokens run out"
        cta="Open chat"
        href="/chat"
        done={false}
        alwaysShow
      />
    </div>
  )
}

function ActionCard({
  icon,
  title,
  desc,
  cta,
  href,
  done,
  alwaysShow,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  cta: string
  href: string
  done: boolean
  alwaysShow?: boolean
}) {
  return (
    <Card className={done && !alwaysShow ? "border-emerald-500/15" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-9 w-9 rounded-xl bg-white/6 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="text-xs text-white/40 mt-0.5">{desc}</p>
          </div>
        </div>
        <Link href={href}>
          <Button variant="outline" size="sm" className="w-full">
            {cta} <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
