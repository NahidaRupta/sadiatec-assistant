import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { intakeCreateSchema } from '@/lib/intake/schema'
import { notifyStaff } from '@/lib/intake/notify'
import { corsHeaders, withCors } from '@/lib/cors'

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) })
}

// Called the moment a phone number is captured. Creating the record here — not
// at the end — is the whole conversion strategy: an abandoned chat still leaves
// a contactable lead.
export async function POST(req: Request) {
  const origin = req.headers.get('origin')

  const body = await req.json().catch(() => null)
  const parsed = intakeCreateSchema.safeParse(body)
  if (!parsed.success) {
    return withCors(
      NextResponse.json({ error: 'invalid', issues: parsed.error.flatten() }, { status: 400 }),
      origin,
    )
  }
  const { target, data } = parsed.data

  // Silently accept-and-drop obvious bots (honeypot filled).
  if ((data as Record<string, unknown>).honeypot) {
    return withCors(NextResponse.json({ ok: true }), origin)
  }
  delete (data as Record<string, unknown>).honeypot

  const { sessionId, ...record } = data as Record<string, unknown>
  const payload = await getPayload({ config })

  let doc
  try {
    if (target === 'lead') {
      doc = await payload.create({
        collection: 'leads',
        data: { ...record, source: (record.source as string) ?? 'website_widget' } as never,
        draft: false,
      })
    } else {
      doc = await payload.create({
        collection: 'business-inquiries',
        data: { ...record, source: (record.source as string) ?? 'website_widget' } as never,
        draft: false,
      })
    }
  } catch (err) {
    console.error('[intake] create failed', err)
    return withCors(NextResponse.json({ error: 'create_failed' }, { status: 500 }), origin)
  }

  // Link (or create) the chat session and record the outcome.
  if (sessionId) {
    try {
      const existing = await payload.find({
        collection: 'chat-sessions',
        where: { sessionId: { equals: sessionId } },
        limit: 1,
      })
      const link = target === 'lead' ? { relatedLead: doc.id } : { relatedInquiry: doc.id }
      if (existing.docs[0]) {
        await payload.update({
          collection: 'chat-sessions',
          id: existing.docs[0].id,
          data: { ...link, outcome: target },
        })
      } else {
        await payload.create({
          collection: 'chat-sessions',
          data: { sessionId: sessionId as string, outcome: target, ...link },
        })
      }
    } catch (err) {
      console.error('[intake] session link failed', err)
    }
  }

  await notifyStaff({
    kind: target === 'lead' ? 'new_lead' : 'new_inquiry',
    title: target === 'lead' ? '🟢 New candidate lead' : '🔵 New business inquiry',
    lines: [
      `Name: ${(record.name as string) ?? (record.contactName as string) ?? '—'}`,
      record.companyName ? `Company: ${record.companyName}` : '',
      `Phone: ${record.phone}`,
      record.programInterest ? `Program: ${record.programInterest}` : '',
      record.serviceInterest ? `Service: ${record.serviceInterest}` : '',
    ],
    whatsapp: false,
  })

  return withCors(NextResponse.json({ ok: true, id: doc.id }), origin)
}