import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { corsHeaders, withCors } from '@/lib/cors'

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) })
}

// Fire-and-forget session telemetry: entry route, language, visited nodes,
// outcome. Powers the funnel and the "chat history" staff see on a lead.
export async function POST(req: Request) {
  const origin = req.headers.get('origin')

  const body = await req.json().catch(() => null)
  if (!body?.sessionId) {
    return withCors(NextResponse.json({ error: 'sessionId required' }, { status: 400 }), origin)
  }

  const { sessionId, language, entryRoute, visitedNodes, outcome, referrer, userAgent } = body

  const data: Record<string, unknown> = {
    language,
    entryRoute,
    visitedNodes,
    outcome,
    referrer,
    userAgent,
    lastActivityAt: new Date().toISOString(),
  }
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k])

  try {
    const payload = await getPayload({ config })
    const existing = await payload.find({
      collection: 'chat-sessions',
      where: { sessionId: { equals: sessionId } },
      limit: 1,
    })
    if (existing.docs[0]) {
      await payload.update({ collection: 'chat-sessions', id: existing.docs[0].id, data })
    } else {
      await payload.create({
        collection: 'chat-sessions',
        data: { sessionId, startedAt: new Date().toISOString(), ...data },
      })
    }
  } catch (err) {
    console.error('[chat-event] upsert failed', err)
    // Telemetry must never break the chat — swallow and return ok.
  }

  return withCors(NextResponse.json({ ok: true }), origin)
}