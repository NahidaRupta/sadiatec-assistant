import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { intakePatchSchema } from '@/lib/intake/schema'
import { notifyStaff } from '@/lib/intake/notify'

// Next.js 15: route params are async.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = intakePatchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const { target, data } = parsed.data
  delete (data as Record<string, unknown>).honeypot
  delete (data as Record<string, unknown>).sessionId

  const payload = await getPayload({ config })
  const collection = target === 'lead' ? 'leads' : 'business-inquiries'

  const updateData: Record<string, unknown> = { ...data }
  if (data.wantsCallback === true) updateData.status = 'callback_scheduled'

  let doc
  try {
    doc = await payload.update({ collection, id, data: updateData })
  } catch (err) {
    console.error('[intake] patch failed', err)
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }

 if (data.wantsCallback === true) {
  await notifyStaff({
    kind: 'callback',
    title: '📞 New lead — details saved',
    lines: [`Record: ${id}`, `Phone: ${(doc as { phone?: string }).phone ?? '—'}`],
    whatsapp: {
      name: (doc as { name?: string; contactName?: string }).name ?? (doc as { contactName?: string }).contactName,
      phone: (doc as { phone?: string }).phone,
      type: (doc as { inquiryType?: string }).inquiryType ?? target,
    },
  })
}

  return NextResponse.json({ ok: true, id: doc.id })
}
