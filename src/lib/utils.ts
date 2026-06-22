/** Tiny classnames joiner (no dependency). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/** RFC4122-ish id; uses crypto.randomUUID when available. */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** Vendor-agnostic event tracking. Wires to PostHog or GA4 if present. */
export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as {
    posthog?: { capture: (e: string, p?: Record<string, unknown>) => void }
    gtag?: (...args: unknown[]) => void
  }
  if (w.posthog?.capture) w.posthog.capture(event, props)
  else if (typeof w.gtag === 'function') w.gtag('event', event, props)
  if (process.env.NODE_ENV !== 'production') console.debug('[track]', event, props ?? {})
}

/**
 * Resolves an API path to an absolute URL when running as the embedded
 * widget on a foreign origin (e.g. the HR site), and to a relative path
 * otherwise (normal in-app usage on this Next.js app itself).
 */
export function apiUrl(path: string): string {
  if (typeof window === 'undefined') return path // SSR — never actually used client-side
  const base = (window as unknown as { __SADIATEC_API_BASE__?: string }).__SADIATEC_API_BASE__
  return base ? `${base}${path}` : path
}
