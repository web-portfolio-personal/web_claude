"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import {
  Globe,
  Send,
  Zap,
  AlertTriangle,
  ArrowLeft,
  User,
  Lock,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { GlobalMessage } from "@/lib/types"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { formatDistanceToNow } from "date-fns"

interface GlobalChatClientProps {
  initialMessages: GlobalMessage[]
  user: SupabaseUser | null
  profile: { display_name: string | null; token_budget: number; tokens_used: number } | null
  isTokensDepleted: boolean
  turnsRemaining: number
}

export function GlobalChatClient({
  initialMessages,
  user,
  profile,
  isTokensDepleted,
  turnsRemaining: initialTurnsRemaining,
}: GlobalChatClientProps) {
  const [messages, setMessages] = useState<GlobalMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [turnsRemaining, setTurnsRemaining] = useState(initialTurnsRemaining)
  const [onlineCount, setOnlineCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("global-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "global_messages" },
        async (payload) => {
          const msg = payload.new as GlobalMessage
          // Fetch display name separately (avoids PostgREST join cache dependency)
          const { data: prof } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", msg.user_id)
            .single()

          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev
            return [...prev, { ...msg, profiles: prof ?? undefined }]
          })
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && user) {
          await channel.track({ user_id: user.id })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const canPost = useCallback(() => {
    if (!user) return false
    if (!isTokensDepleted) return true
    return turnsRemaining > 0
  }, [user, isTokensDepleted, turnsRemaining])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !user || sending) return
    if (!canPost()) return

    setSending(true)
    setError(null)

    // Enforce turn limit server-side via API route
    const res = await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? "Failed to send message")
    } else {
      setInput("")
      if (isTokensDepleted) {
        setTurnsRemaining((prev) => Math.max(0, prev - 1))
      }
    }

    setSending(false)
  }

  const canSend = canPost() && input.trim().length > 0 && !sending

  return (
    <div className="min-h-dvh flex flex-col bg-[#08080f]">
      {/* Background */}
      <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center gap-4 px-4 py-3 border-b border-white/6 bg-black/40 backdrop-blur-xl">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Global Chat</p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-xs text-white/40">
                {onlineCount > 0 ? `${onlineCount} online` : "Live"}
              </span>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isTokensDepleted && (
            <Badge variant="warning">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {turnsRemaining} turns left today
            </Badge>
          )}
          {user ? (
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <Zap className="h-3.5 w-3.5" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button size="sm">Sign in to post</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Depleted banner */}
      {isTokensDepleted && (
        <div className="relative z-10 border-b border-amber-500/20 bg-amber-500/8 px-4 py-3">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-300">Your token budget is depleted</p>
              <p className="text-xs text-amber-300/60 mt-0.5">
                You have <strong>{turnsRemaining} of 3 posts</strong> remaining today in the global chat.
                Resets at midnight.{" "}
                <Link href="/dashboard/settings" className="underline hover:text-amber-300">
                  Update your budget →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-1">
          {messages.length === 0 && (
            <div className="text-center py-16 text-white/25 text-sm">
              <Globe className="h-10 w-10 mx-auto mb-3 opacity-30" />
              No messages yet. Be the first to post!
            </div>
          )}

          {messages.map((msg, i) => {
            const isMe = msg.user_id === user?.id
            const showAvatar =
              i === 0 || messages[i - 1].user_id !== msg.user_id

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${showAvatar ? "mt-4" : "mt-1"}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 w-8">
                  {showAvatar && (
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isMe
                          ? "bg-gradient-to-br from-violet-600 to-indigo-600"
                          : "bg-gradient-to-br from-slate-600 to-slate-700"
                      }`}
                    >
                      {(msg.profiles?.display_name?.[0] ?? "?").toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {showAvatar && (
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-xs font-semibold ${isMe ? "text-violet-300" : "text-white/70"}`}>
                        {msg.profiles?.display_name ?? "Anonymous"}
                        {isMe && " (you)"}
                      </span>
                      {msg.is_depleted_post && (
                        <Badge variant="warning" className="text-xs py-0">depleted</Badge>
                      )}
                      <span className="text-xs text-white/25">
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                  <p
                    className={`text-sm leading-relaxed break-words rounded-xl px-3 py-2 inline-block max-w-full ${
                      isMe
                        ? "bg-violet-600/20 text-white border border-violet-500/15"
                        : "bg-white/5 text-white/80 border border-white/6"
                    }`}
                  >
                    {msg.content}
                  </p>
                </div>
              </div>
            )
          })}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 border-t border-white/6 bg-black/40 backdrop-blur-xl p-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <p className="text-xs text-red-400 mb-2">{error}</p>
          )}

          {!user ? (
            <div className="flex items-center justify-center gap-3 py-3 rounded-xl bg-white/4 border border-white/8">
              <Lock className="h-4 w-4 text-white/30" />
              <p className="text-sm text-white/40">
                <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">Sign in</Link>
                {" "}to post in the global chat
              </p>
            </div>
          ) : isTokensDepleted && turnsRemaining === 0 ? (
            <div className="flex items-center justify-center gap-3 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <p className="text-sm text-amber-300/70">
                You've used your 3 daily turns. Come back tomorrow.
              </p>
            </div>
          ) : (
            <form onSubmit={sendMessage} className="flex gap-3">
              <div className="relative flex-1">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage(e as any)
                    }
                  }}
                  placeholder={
                    isTokensDepleted
                      ? `${turnsRemaining} turns left today — say something`
                      : "Message the world..."
                  }
                  maxLength={1000}
                  className="w-full h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-colors"
                />
                {input.length > 900 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                    {1000 - input.length}
                  </span>
                )}
              </div>
              <Button type="submit" disabled={!canSend} size="icon" className="h-11 w-11 flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}

          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-xs text-white/20">
              {user ? `Posting as ${profile?.display_name ?? "you"}` : "Global chat — read by everyone"}
            </p>
            <p className="text-xs text-white/20">1000 char max</p>
          </div>
        </div>
      </div>
    </div>
  )
}
