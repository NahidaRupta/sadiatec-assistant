import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { intakePatchSchema } from '@/lib/intake/schema'
import { notifyStaff } from '@/lib/intake/notify'
import { corsHeaders, withCors } from '@/lib/cors'

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) })
}

// Next.js 15: route params are async.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const origin = req.headers.get('origin')
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = intakePatchSchema.safeParse(body)
  if (!parsed.success) {
    return withCors(NextResponse.json({ error: 'invalid' }, { status: 400 }), origin)
  }

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
    return withCors(NextResponse.json({ error: 'update_failed' }, { status: 500 }), origin)
  }

  if (data.wantsCallback === true) {
    const d = doc as unknown as Record<string, unknown>

    const extras =
      [
        d.email && `Email: ${d.email}`,
        d.education && `Education: ${d.education}`,
        d.japaneseLevel && `JP level: ${d.japaneseLevel}`,
        d.preferredContactTime && `Best time: ${d.preferredContactTime}`,
        d.notes && `Notes: ${d.notes}`,
      ]
        .filter(Boolean)
        .join(' | ') || 'No additional details provided.'

    await notifyStaff({
      kind: 'callback',
      title: '📞 New lead — details saved',
      lines: [`Record: ${id}`, `Phone: ${d.phone ?? '—'}`],
      whatsapp: {
        name: (d.name as string) ?? (d.contactName as string),
        phone: d.phone as string,
        type: (d.inquiryType as string) ?? target,
        extras,
      },
    })
  }

  return withCors(NextResponse.json({ ok: true, id: doc.id }), origin)
}