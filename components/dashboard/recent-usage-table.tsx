import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"
import type { TokenUsage } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface RecentUsageTableProps {
  usage: TokenUsage[]
}

export function RecentUsageTable({ usage }: RecentUsageTableProps) {
  if (usage.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-white/30 text-sm">
            No token usage logged yet. Connect your API key to start tracking.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Usage</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/5">
          {usage.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/3 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  {row.description ?? "API Call"}
                </p>
                <p className="text-xs text-white/35 mt-0.5">
                  {row.model} · {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-white">{formatNumber(row.tokens_total)} tokens</p>
                <p className="text-xs text-white/35">
                  {formatNumber(row.tokens_input)} in · {formatNumber(row.tokens_output)} out
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
