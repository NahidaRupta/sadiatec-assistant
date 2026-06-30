const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://sadiatec-saidatech-qffo.vercel.app',
  'https://www.sadiatec.com',
]

export function corsHeaders(origin?: string | null): HeadersInit {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export function withCors(res: Response, origin?: string | null): Response {
  const headers = new Headers(res.headers)
  Object.entries(corsHeaders(origin)).forEach(([k, v]) => headers.set(k, v))
  return new Response(res.body, { status: res.status, headers })
}