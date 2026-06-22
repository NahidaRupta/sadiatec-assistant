'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { advance, getInteraction, start } from '@/lib/chat-engine/engine'
import type { EngineState, Interaction, Locale } from '@/lib/chat-engine/types'
import { mainFlow } from '@/lib/chat-flows'
import { track } from '@/lib/utils'
import { useChatSession } from './useChatSession'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function clean(o: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ''))
}

/** Map accumulated answers to the fields the target collection expects. */
function toPayload(s: EngineState, locale: Locale): Record<string, unknown> {
  const d = s.data
  const base = {
    phone: d.phone,
    email: d.email,
    notes: d.notes,
    preferredContactTime: d.preferredContactTime,
    languagePreference: locale,
    source: 'website_widget',
  }
  const obj =
    s.target === 'lead'
      ? {
          ...base,
          name: d.name,
          country: d.country ?? 'Bangladesh',
          education: d.education,
          japaneseLevel: d.japaneseLevel,
          programInterest: d.programInterest,
          inquiryType: d.inquiryType,
        }
      : {
          ...base,
          companyName: d.companyName,
          contactName: d.contactName,
          serviceInterest: d.serviceInterest,
        }
  return clean(obj)
}

/**
 * The bridge between the pure engine and the world. Holds engine state, drives a
 * natural typing delay, and performs the side effects the engine only *describes*:
 *   • create the record the instant a phone arrives, then PATCH each later field
 *   • on handoff, flag wantsCallback (staff get pinged)
 *   • emit analytics + session telemetry
 * Changing locale restarts the conversation in the new language.
 */
export function useFlowEngine(locale: Locale) {
  const flow = mainFlow
  const { sessionId, report } = useChatSession()

  const initial = useMemo(() => start(flow, locale), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [state, setState] = useState<EngineState>(initial.state)
  const [messages, setMessages] = useState(initial.messages)
  const [typing, setTyping] = useState(false)

  const createdRef = useRef(false)
  const recordIdRef = useRef<string | null>(null)
  const busyRef = useRef(false)
  const firstRun = useRef(true)

  const interaction: Interaction = useMemo(
    () => getInteraction(state, flow, locale),
    [state, flow, locale],
  )
  const done = state.status === 'done'

  const reset = useCallback(
    (loc: Locale) => {
      createdRef.current = false
      recordIdRef.current = null
      busyRef.current = false
      const fresh = start(flow, loc)
      setState(fresh.state)
      setMessages(fresh.messages)
      track('widget_restarted', { locale: loc })
    },
    [flow],
  )

  // Restart on locale change (skip the very first mount).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      track('widget_started', { locale })
      report({ language: locale, outcome: 'in_progress', visitedNodes: initial.state.history })
      return
    }
    reset(locale)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  const persist = useCallback(
    async (s: EngineState) => {
      const data = toPayload(s, locale)
      if (!createdRef.current && s.data.phone) {
        createdRef.current = true // optimistic, prevents a double-create race
        try {
          const res = await fetch('/api/intake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: s.target, data: { ...data, sessionId } }),
          })
          const json = await res.json().catch(() => ({}))
          if (res.ok && json.id) {
            recordIdRef.current = json.id
            track(s.target === 'lead' ? 'lead_created' : 'inquiry_created', { id: json.id })
          } else {
            createdRef.current = false
          }
        } catch {
          createdRef.current = false
        }
      } else if (createdRef.current && recordIdRef.current) {
        try {
          await fetch(`/api/intake/${recordIdRef.current}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: s.target, data }),
          })
        } catch {
          /* best-effort patch */
        }
      }
    },
    [locale, sessionId],
  )

  const flagCallback = useCallback(async (s: EngineState) => {
    if (!recordIdRef.current) return
    try {
      await fetch(`/api/intake/${recordIdRef.current}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: s.target, data: { wantsCallback: true } }),
      })
      track('callback_requested', {})
    } catch {
      /* best-effort */
    }
  }, [])

  const send = useCallback(
    async (value: string) => {
      if (busyRef.current || done) return
      busyRef.current = true

      const answeredNode = state.currentNodeId
      const hadPhone = !!state.data.phone

      setTyping(true)
      await delay(340 + Math.random() * 260)
      const result = advance(flow, state, value, locale)
      setTyping(false)

      setState(result.state)
      setMessages((m) => [...m, ...result.messages])

      if (result.state.error) {
        busyRef.current = false
        return
      }

      // analytics signals
      if (answeredNode === 'route') {
        track('route_selected', { route: value })
        report({ entryRoute: value, language: locale, visitedNodes: result.state.history })
      }
      if (!hadPhone && result.state.data.phone) track('phone_captured', { target: result.state.target })

      await persist(result.state)

      for (const effect of result.state.effects) {
        if (effect.type === 'handoff') await flagCallback(result.state)
      }

      if (result.state.status === 'done') {
        track('conversation_completed', { target: result.state.target })
        report({ outcome: result.state.target, visitedNodes: result.state.history })
      }

      busyRef.current = false
    },
    [flow, state, locale, done, persist, flagCallback, report],
  )

  return {
    messages,
    interaction,
    typing,
    done,
    error: state.error,
    send,
    restart: () => reset(locale),
  }
}
