export type NotifyKind = 'new_lead' | 'new_inquiry' | 'callback'

export interface NotifyInput {
  kind: NotifyKind
  title: string
  lines: string[]
  whatsapp?: { name?: string; phone?: string; type?: string; extras?: string } | false
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

  if (input.whatsapp !== false) {
    await sendStaffWhatsApp(input)
  }

  if (!webhook || process.env.NODE_ENV !== 'production') {
    console.log('[notify]', input.title, '—', input.lines.filter(Boolean).join(' | '))
  }
}

async function sendStaffWhatsApp(input: NotifyInput): Promise<void> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const staffNumber = process.env.STAFF_WHATSAPP_NUMBER
  if (!token || !phoneNumberId || !staffNumber) return

  const wa = input.whatsapp || undefined // narrow false→undefined just in case

  try {
    const res = await fetch(`https://graph.facebook.com/v25.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: staffNumber,
        type: 'template',
        template: {
          name: 'new_lead_alert_full',
          language: { code: 'en' }, // confirm this matches what worked in your curl test
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: wa?.name ?? '—' },
                { type: 'text', text: wa?.phone ?? '—' },
                { type: 'text', text: wa?.type ?? input.kind },
                { type: 'text', text: wa?.extras ?? 'No additional details provided.' },
              ],
            },
          ],
        },
      }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error('[notify] whatsapp API error', res.status, JSON.stringify(json))
    }
  } catch (err) {
    console.error('[notify] whatsapp failed', err)
  }
}