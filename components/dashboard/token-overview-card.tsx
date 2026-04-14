"use client"

import { AlertTriangle, TrendingUp, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatNumber, formatPercent, getProgressColor, getStatusColor } from "@/lib/utils"
import type { Profile } from "@/lib/types"

interface TokenOverviewCardProps {
  profile: Profile | null
}

export function TokenOverviewCard({ profile }: TokenOverviewCardProps) {
  const budget = profile?.token_budget ?? 0
  const used = profile?.tokens_used ?? 0
  const remaining = Math.max(0, budget - used)
  const percent = formatPercent(used, budget)
  const isDepleted = budget > 0 && used >= budget
  const progressColor = getProgressColor(percent)
  const statusColor = getStatusColor(percent)

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {/* Main token card */}
      <div className="sm:col-span-2">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-white/50 mb-1">Token Budget</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{formatNumber(used)}</span>
                  <span className="text-white/30 text-sm">/ {budget > 0 ? formatNumber(budget) : "∞"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isDepleted ? (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Depleted
                  </Badge>
                ) : (
                  <Badge variant={percent >= 70 ? "warning" : "success"}>
                    {percent}% used
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {budget > 0 ? (
              <div className="space-y-2">
                <div className="h-2.5 w-full rounded-full bg-white/8 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/35">
                  <span>{formatNumber(remaining)} remaining</span>
                  <span className={statusColor}>{percent}% consumed</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-300">
                Set a token budget in Settings to enable tracking.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats column */}
      <div className="space-y-4">
        <StatCard
          label="Tokens Used"
          value={formatNumber(used)}
          icon={<Zap className="h-4 w-4 text-violet-400" />}
          sub="all time"
        />
        <StatCard
          label="Remaining"
          value={budget > 0 ? formatNumber(remaining) : "∞"}
          icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
          sub={budget > 0 ? `of ${formatNumber(budget)}` : "no budget set"}
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string
  value: string
  icon: React.ReactNode
  sub: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/40">{label}</span>
          {icon}
        </div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/30 mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}
