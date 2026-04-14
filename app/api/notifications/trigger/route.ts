import { NextResponse } from "next/server"

/**
 * Internal notification trigger endpoint.
 * Called by the Claude proxy when an alert threshold is crossed.
 * Sends email (Resend), SMS (Twilio), and/or push notifications.
 */
export async function POST(req: Request) {
  const { userId, alertId, percent, email, phone, pushSub } = await req.json()

  const message = `TokenWatch Alert: Your Claude API usage has reached ${percent}% of your token budget.`
  const errors: string[] = []

  // --- EMAIL via Resend ---
  if (email && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "YOUR_RESEND_API_KEY_HERE") {
    try {
      const { Resend } = await import("resend")
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: "TokenWatch <alerts@tokenwatch.app>",
        to: email,
        subject: `⚠️ Token Alert: ${percent}% usage reached`,
        html: `
          <div style="font-family: system-ui; max-width: 480px; margin: 0 auto; padding: 32px; background: #08080f; color: #f0f0f8; border-radius: 16px;">
            <h1 style="color: #a78bfa; margin-bottom: 8px;">⚡ TokenWatch Alert</h1>
            <p style="color: #6b6b8a; margin-bottom: 24px;">Your Claude API usage has reached a threshold</p>
            <div style="background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="font-size: 32px; font-weight: bold; color: white; margin: 0;">${percent}%</p>
              <p style="color: #6b6b8a; margin: 4px 0 0;">of your token budget consumed</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600;">
              View Dashboard →
            </a>
            <p style="color: #6b6b8a; font-size: 12px; margin-top: 24px;">
              Sent by <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #a78bfa;">TokenWatch</a> ·
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/alerts" style="color: #a78bfa;">Manage alerts</a>
            </p>
          </div>
        `,
      })
    } catch (err: any) {
      errors.push(`Email: ${err.message}`)
    }
  }

// --- Web Push ---
  if (
    pushSub &&
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY !== "YOUR_VAPID_PUBLIC_KEY_HERE"
  ) {
    try {
      const webpush = await import("web-push")
      webpush.default.setVapidDetails(
        process.env.VAPID_EMAIL!,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!
      )
      await webpush.default.sendNotification(
        pushSub,
        JSON.stringify({
          title: "TokenWatch — Token Alert",
          body: message,
          icon: "/icon-192.png",
          badge: "/badge-96.png",
          data: { url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` },
        })
      )
    } catch (err: any) {
      errors.push(`Push: ${err.message}`)
    }
  }

  return NextResponse.json({
    sent: true,
    errors: errors.length ? errors : undefined,
  })
}
