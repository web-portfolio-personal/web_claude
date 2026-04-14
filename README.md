# TokenWatch — Claude API Token Tracker

**Real-time token usage monitoring for Anthropic Claude API users.**

TokenWatch connects to your Anthropic API key, tracks every token you consume, and alerts you via email, SMS, or desktop push before your budget runs out. When tokens are depleted, users get access to a global community chat with a fair 3-turn daily limit.

---

## Features

- **Real-time Dashboard** — Live token usage, budget progress bar, and consumption charts broken down by day/week/month
- **Multi-channel Alerts** — Configurable thresholds trigger notifications via email (Resend), SMS (Twilio), or Web Push (VAPID)
- **Claude API Proxy** — Route your Claude calls through `/api/claude` to automatically track usage without any manual instrumentation
- **Secure Key Storage** — Anthropic API key is stored server-side and never exposed to the client after saving
- **Global Community Chat** — Supabase Realtime channel shared by all users; depleted users get 3 posts/day (resets at midnight)
- **Instant Registration** — No email confirmation required; accounts are active immediately

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, `proxy.ts`) |
| Database & Auth | Supabase (PostgreSQL + RLS + Realtime) |
| Styling | Tailwind CSS v4 + glassmorphism design system |
| Email alerts | Resend |
| SMS alerts | Twilio |
| Push notifications | Web Push API + VAPID |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/web-portfolio-personal/web_claude.git
cd web_claude
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend (email alerts)
RESEND_API_KEY=your_resend_api_key

# Twilio (SMS alerts) — optional
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX

# Web Push VAPID — generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:you@example.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Supabase

Apply the included migrations from the Supabase dashboard or CLI. The schema creates:

- `profiles` — linked to `auth.users`, stores API key, budget, and notification contacts
- `token_usage` — per-call token log with model and endpoint metadata
- `token_alerts` — threshold configurations per user
- `global_messages` — public chat with Realtime enabled
- `chat_daily_turns` — daily 3-turn limit tracker for depleted users

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register an account, and enter your Anthropic API key in **Settings**.

---

## Using the API Proxy

Instead of calling `https://api.anthropic.com/v1/messages` directly, route your requests through TokenWatch:

```
POST http://localhost:3000/api/claude
```

The proxy forwards your request to Anthropic, logs the token usage, and triggers any configured alerts — all transparently.

---

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy — no additional configuration required

> **Note:** `.env.local` is gitignored and never committed. Add your variables directly in the Vercel Environment Variables panel.

---

## Project Structure

```
app/
├── api/
│   ├── claude/          # Anthropic API proxy with token tracking
│   ├── chat/send/       # Global chat with 3-turn limit enforcement
│   └── notifications/   # Email, SMS, and push dispatch
├── auth/                # Login and registration pages
├── chat/                # Global community chat
└── dashboard/           # Token dashboard, settings, alerts, charts
components/
├── chat/                # Realtime chat client
├── dashboard/           # Charts, sidebar, settings form
└── ui/                  # Button, Input, Badge, Card primitives
lib/
├── actions/             # Server Actions (auth, profile)
├── supabase/            # Client, server, and middleware helpers
└── types.ts             # Shared TypeScript types
proxy.ts                 # Next.js 16 session middleware
public/sw.js             # Service Worker for Web Push
```

---

## License

MIT
