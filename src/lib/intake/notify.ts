export type NotifyKind = 'new_lead' | 'new_inquiry' | 'callback'

export interface NotifyInput {
  kind: NotifyKind
  title: string
  lines: string[]
  whatsapp?: { name?: string; phone?: string; type?: string } // NEW
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

  await sendStaffWhatsApp(input) // NEW

  if (!webhook || process.env.NODE_ENV !== 'production') {
    console.log('[notify]', input.title, '—', input.lines.filter(Boolean).join(' | '))
  }
}

// NEW
async function sendStaffWhatsApp(input: NotifyInput): Promise<void> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const staffNumber = process.env.STAFF_WHATSAPP_NUMBER
  if (!token || !phoneNumberId || !staffNumber) return // not configured — skip silently

  try {
    await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: staffNumber,
        type: 'template',
        template: {
          name: 'new_lead_alert',
          language: { code: 'en_US' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: input.whatsapp?.name ?? '—' },
                { type: 'text', text: input.whatsapp?.phone ?? '—' },
                { type: 'text', text: input.whatsapp?.type ?? input.kind },
              ],
            },
          ],
        },
      }),
    })
  } catch (err) {
    console.error('[notify] whatsapp failed', err)
  }
}