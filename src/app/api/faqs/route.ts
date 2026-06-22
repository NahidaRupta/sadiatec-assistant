import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
// 1. Import the Where type
import type { Where } from 'payload' 

type Locale = 'en' | 'bn' | 'ja'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const locale = (url.searchParams.get('locale') ?? 'en') as Locale
  const audience = url.searchParams.get('audience')

  const payload = await getPayload({ config })
  
  // 2. Explicitly type the variable as Where
  const where: Where = { 
    published: { equals: true } 
  }
  
  if (audience) {
    where.audience = { in: [audience, 'both'] }
  }

  const res = await payload.find({
    collection: 'faqs',
    where, // This will now satisfy the TypeScript compiler
    sort: 'order',
    locale: locale as any, // Cast to any if your locale config is strictly typed
    limit: 50,
    depth: 0,
  })

  const items = res.docs.map((d: Record<string, unknown>) => ({
    id: d.id,
    question: d.question,
    answer: d.answer,
    category: d.category,
  }))

  return NextResponse.json(items, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
  })
}
