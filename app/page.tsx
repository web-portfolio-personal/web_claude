import Link from "next/link"
import { ArrowRight, Zap, Bell, MessageSquare, BarChart3, Shield, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-cyan-950/10 pointer-events-none" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">TokenWatch</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/chat">
            <Button variant="ghost" size="sm">Global Chat</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="sm">Sign in</Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm">Get started <ArrowRight className="h-3.5 w-3.5" /></Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 pulse-dot" />
          Connect your Anthropic API key — track every token
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Never run out of
          <br />
          <span className="gradient-text">Claude tokens</span>
          <br />
          by surprise
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-white/50 mb-10 leading-relaxed">
          TokenWatch tracks your Anthropic API usage in real time. Get notified via
          email, SMS, or desktop push before your tokens are depleted.
          When they run out — join the global community chat.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/register">
            <Button size="xl" className="min-w-48">
              Start tracking free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline" size="xl" className="min-w-48">
              <Globe className="h-4 w-4" />
              Global Chat
            </Button>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-3 gap-4 max-w-xl mx-auto">
          {[
            { value: "Real-time", label: "Usage tracking" },
            { value: "3-channel", label: "Notifications" },
            { value: "Global", label: "Community chat" },
          ].map(({ value, label }) => (
            <div key={label} className="glass rounded-2xl p-4 text-center">
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-xs text-white/40 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need
          </h2>
          <p className="text-white/50 max-w-md mx-auto">
            A complete dashboard for monitoring and managing your Claude API token consumption.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-6 hover:border-violet-500/20 transition-colors group"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:from-violet-600/30 group-hover:to-indigo-600/30 transition-colors">
                <f.icon className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Global Chat Preview */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="glass rounded-3xl p-8 sm:p-12 border-violet-500/10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300 mb-4">
                <MessageSquare className="h-3 w-3" />
                Global Chat — Always Open
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Tokens empty?
                <br />
                <span className="gradient-text">You're not alone.</span>
              </h2>
              <p className="text-white/50 mb-6 leading-relaxed">
                When your token budget runs out, you get access to a public chat channel
                shared with everyone in the same situation. Read news, share updates,
                comment — up to <strong className="text-amber-300">3 turns per day</strong>.
              </p>
              <Link href="/chat">
                <Button variant="outline">
                  <Globe className="h-4 w-4" />
                  Open Global Chat
                </Button>
              </Link>
            </div>

            {/* Mock chat UI */}
            <div className="w-full lg:w-80 rounded-2xl border border-white/8 bg-black/30 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
                <div className="h-2 w-2 rounded-full bg-emerald-400 pulse-dot" />
                <span className="text-xs text-white/60 font-medium">global · 247 online</span>
              </div>
              <div className="p-4 space-y-3 min-h-40">
                {mockMessages.map((m, i) => (
                  <div key={i} className="flex gap-3">
                    <div
                      className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: m.color }}
                    >
                      {m.avatar}
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-0.5">{m.name}</p>
                      <p className="text-xs text-white/75 leading-relaxed">{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-white/8">
                <div className="h-8 rounded-lg bg-white/5 border border-white/8 flex items-center px-3">
                  <span className="text-xs text-white/20">Message the world...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="gradient-border p-px rounded-3xl">
          <div className="rounded-3xl bg-[#08080f] p-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to take control?
            </h2>
            <p className="text-white/50 mb-8">
              Connect your Claude API key and start watching your tokens today.
            </p>
            <Link href="/auth/register">
              <Button size="xl">
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-white/25">
        <p>TokenWatch · Built with Next.js + Supabase · Not affiliated with Anthropic</p>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: BarChart3,
    title: "Token Usage Dashboard",
    desc: "See exactly how many tokens you've used per day, week, or month. Visualized with real-time charts.",
  },
  {
    icon: Bell,
    title: "Multi-Channel Alerts",
    desc: "Get notified at custom thresholds via email (Resend), SMS (Twilio), or desktop push notifications.",
  },
  {
    icon: Shield,
    title: "Secure Key Storage",
    desc: "Your Anthropic API key is stored server-side and never exposed to the client after saving.",
  },
  {
    icon: Globe,
    title: "Global Community Chat",
    desc: "A shared real-time channel for all users. Public read access, authenticated posts.",
  },
  {
    icon: MessageSquare,
    title: "3-Turn Limit System",
    desc: "Depleted users can post up to 3 messages per day in the global chat — fair use for everyone.",
  },
  {
    icon: Zap,
    title: "Claude API Proxy",
    desc: "Route Claude calls through TokenWatch to automatically track usage without manual input.",
  },
]

const mockMessages = [
  { avatar: "A", name: "alex_dev", text: "Just burned 500K tokens on a refactor 😅", color: "linear-gradient(135deg,#7c3aed,#4f46e5)" },
  { avatar: "S", name: "sara_ml", text: "Same. The new claude-sonnet-4-6 is incredible for reasoning though", color: "linear-gradient(135deg,#06b6d4,#0891b2)" },
  { avatar: "M", name: "mokiu", text: "Anyone else set up alerts yet? 10% threshold saved me last week", color: "linear-gradient(135deg,#10b981,#059669)" },
]
