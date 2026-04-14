"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"
import type { TokenUsage } from "@/lib/types"
import { format, parseISO, startOfDay } from "date-fns"

interface TokenChartsClientProps {
  usage: TokenUsage[]
  profile: { token_budget: number; tokens_used: number } | null
}

export function TokenChartsClient({ usage, profile }: TokenChartsClientProps) {
  // Aggregate by day
  const byDay = usage.reduce<Record<string, { input: number; output: number }>>(
    (acc, row) => {
      const day = format(startOfDay(parseISO(row.created_at)), "MMM dd")
      if (!acc[day]) acc[day] = { input: 0, output: 0 }
      acc[day].input += row.tokens_input
      acc[day].output += row.tokens_output
      return acc
    },
    {}
  )

  const chartData = Object.entries(byDay).map(([date, { input, output }]) => ({
    date,
    input,
    output,
    total: input + output,
  }))

  const totalInput = usage.reduce((s, r) => s + r.tokens_input, 0)
  const totalOutput = usage.reduce((s, r) => s + r.tokens_output, 0)
  const totalAll = totalInput + totalOutput

  const pieData = [
    { name: "Input", value: totalInput, color: "#7c3aed" },
    { name: "Output", value: totalOutput, color: "#06b6d4" },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="glass rounded-xl px-4 py-3 text-xs border border-white/10">
        <p className="text-white/60 mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: {formatNumber(p.value)}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Tokens (30d)", value: formatNumber(totalAll) },
          { label: "Input Tokens", value: formatNumber(totalInput) },
          { label: "Output Tokens", value: formatNumber(totalOutput) },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <p className="text-xs text-white/40 mb-1">{label}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Area chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Token Consumption</CardTitle>
          <CardDescription>Input vs output tokens per day</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-white/30 text-sm">
              No usage data yet. Start making API calls to see your chart.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradInput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="input"
                  name="Input"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fill="url(#gradInput)"
                />
                <Area
                  type="monotone"
                  dataKey="output"
                  name="Output"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#gradOutput)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Pie chart */}
      {totalAll > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Input vs Output Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-8">
            <PieChart width={160} height={160}>
              <Pie
                data={pieData}
                cx={75}
                cy={75}
                innerRadius={45}
                outerRadius={70}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="space-y-3">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <div>
                    <p className="text-sm text-white">{d.name} tokens</p>
                    <p className="text-xs text-white/40">
                      {formatNumber(d.value)} ({totalAll > 0 ? Math.round((d.value / totalAll) * 100) : 0}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
