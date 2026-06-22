'use client'

import { useRef } from 'react'
import { uuid, apiUrl } from '@/lib/utils'

const KEY = 'sadiatec_session_id'

/**
 * One stable session id per browser tab (sessionStorage), plus a `report` helper
 * that posts to /api/chat-event without ever throwing into the UI.
 */
export function useChatSession() {
  const ref = useRef<string>('')

  if (!ref.current) {
    if (typeof window !== 'undefined') {
      ref.current = window.sessionStorage.getItem(KEY) ?? uuid()
      window.sessionStorage.setItem(KEY, ref.current)
    } else {
      ref.current = 'ssr'
    }
  }

  const report = async (payload: Record<string, unknown>): Promise<void> => {
    try {
      await fetch(apiUrl('/api/chat-event'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: ref.current,
          referrer: typeof document !== 'undefined' ? document.referrer : undefined,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          ...payload,
        }),
        keepalive: true,
      })
    } catch {
      /* telemetry is best-effort */
    }
  }

  return { sessionId: ref.current, report }
}