import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'

type Locale = 'en' | 'bn' | 'ja'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const locale = (url.searchParams.get('locale') ?? 'en') as Locale
  const audience = url.searchParams.get('audience')
  const payload = await getPayload({ config })

  const where: Where = {
    published: { equals: true },
  }

  if (audience) {
    where.audience = { in: [audience, 'both'] }
  }

  const res = await payload.find({
    collection: 'faqs',
    where,
    sort: 'order',
    locale: locale as any,
    limit: 50,
    depth: 0,
  })

  const items = res.docs.map((d) => ({
    id: d.id,
    question: d.question,
    answer: d.answer,
    category: d.category,
  }))

  return NextResponse.json(items, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
  })
}