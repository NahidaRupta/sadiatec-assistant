// Instant staff notification on new/updated intake. This is the async handoff:
// no live agent socket — staff get pinged and a contactable record already exists.
//
// STAFF_WEBHOOK_URL works with anything that accepts `{ text }` (Slack incoming
// webhooks, many LINE Notify bridges, Discord with a tiny shim). Email (Resend /
// SES) is intentionally left as a clearly-marked TODO.

export type NotifyKind = 'new_lead' | 'new_inquiry' | 'callback'

export interface NotifyInput {
  kind: NotifyKind
  title: string
  lines: string[]
}

export async function notifyStaff(input: NotifyInput): Promise<void> {
  const text = `*${input.title}*\n${input.lines.filter(Boolean).join('\n')}`

  const webhook = process.env.STAFF_WEBHOOK_URL
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
    } catch (err) {
      console.error('[notify] webhook failed', err)
    }
  }

  // TODO: email fan-out to WidgetSettings.notificationEmails via Resend/SES.
  if (!webhook || process.env.NODE_ENV !== 'production') {
    console.log('[notify]', input.title, '—', input.lines.filter(Boolean).join(' | '))
  }
}
