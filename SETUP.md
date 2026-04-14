# TokenWatch — Setup Guide

## What was built

**TokenWatch** is a full-stack web app with:
- Supabase Auth (register/login)
- Claude API key linking + token tracking dashboard
- Multi-channel notifications (email, SMS, desktop push)
- Global public chat with 3-turn depletion limit
- Recharts usage analytics

---

## Step 1 — Supabase Service Role Key

You need the **service role key** (not the anon key) for server-side operations.

1. Go to [supabase.com](https://supabase.com) → Your Project (Mokius's Project)
2. Settings → API
3. Copy the `service_role` key
4. Paste it in `.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your key here
```

---

## Step 2 — Anthropic API Key (your own)

When you register in the app, go to **Settings** and enter your Anthropic API key.

Get it at: [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

Format: `sk-ant-api03-...`

The key is stored server-side and never exposed to the browser after saving.

> ⚠️ **Important**: Anthropic does NOT offer "Login with Claude/Anthropic" OAuth.
> Authentication is via Supabase (email/password). Your API key is linked separately in Settings.

---

## Step 3 — Email Notifications (Resend)

1. Create account at [resend.com](https://resend.com) (free tier: 3,000 emails/month)
2. Create an API key
3. Add to `.env.local`:

```
RESEND_API_KEY=re_xxxxxxxxxxxx
```

> You also need to verify a sending domain or use `@resend.dev` for testing.

---

## Step 4 — SMS Notifications (Twilio) — MANUAL

1. Create account at [twilio.com](https://twilio.com)
2. Get a phone number (trial: $15 free credit)
3. From Console Dashboard, copy:
   - Account SID
   - Auth Token
   - Your Twilio phone number
4. Add to `.env.local`:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

---

## Step 5 — Desktop/Mobile Push Notifications (VAPID keys)

Generate VAPID keys once:

```bash
npx web-push generate-vapid-keys
```

Copy the output into `.env.local`:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BG...your public key
VAPID_PRIVATE_KEY=your_private_key
VAPID_EMAIL=mailto:you@yourdomain.com
```

The service worker (`/public/sw.js`) is already registered via the root layout.

---

## Step 6 — App URL

Update `.env.local` for production:

```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

For local dev: `http://localhost:3000` (already set)

---

## Step 7 — Supabase Email Confirmation (Optional)

By default Supabase requires email confirmation. To disable for dev:

1. Supabase Dashboard → Authentication → Providers → Email
2. Toggle off "Confirm email"

---

## Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Using the Claude Proxy

Instead of calling `https://api.anthropic.com/v1/messages` directly, call:

```
POST /api/claude
Content-Type: application/json

{
  "model": "claude-sonnet-4-6",
  "messages": [{ "role": "user", "content": "Hello!" }],
  "max_tokens": 1024,
  "description": "My app call"  // optional label
}
```

This:
1. Uses your stored API key
2. Tracks tokens in the database
3. Triggers alerts when thresholds are crossed
4. Returns the Anthropic response unchanged

---

## Global Chat — How it works

| State | Can post? | Limit |
|-------|-----------|-------|
| Not logged in | No | — |
| Logged in, tokens OK | Yes | Unlimited |
| Logged in, tokens DEPLETED | Yes | **3 posts/day** |

The 3-turn limit resets at midnight UTC.
Depleted posts are tagged visually in the chat.

---

## Architecture Overview

```
Next.js 16 App Router
├── Supabase Auth (email/password)
├── Supabase Postgres (profiles, token_usage, token_alerts, global_messages, chat_daily_turns)
├── Supabase Realtime (global_messages live updates + presence)
├── /api/claude → Anthropic proxy + token tracking
├── /api/chat/send → Message post with 3-turn enforcement
└── /api/notifications/trigger → Email (Resend) + SMS (Twilio) + Push (VAPID)
```

---

## What needs manual configuration

| Item | Required | Notes |
|------|----------|-------|
| Supabase service role key | YES | See Step 1 |
| Your Anthropic API key (in-app) | YES | Set in Settings after registering |
| Resend API key | Optional | For email alerts |
| Twilio credentials | Optional | For SMS alerts |
| VAPID keys | Optional | For desktop/mobile push |

Email and SMS are gracefully skipped if credentials are missing.
