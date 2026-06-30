'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Locale } from '@/lib/chat-engine/types'
import { detectLocale, t } from '@/lib/chat-i18n'
import { cn, track } from '@/lib/utils'
import { ChatPanel } from './ChatPanel'

export interface ChatWidgetProps {
  /** Initial language. Falls back to the browser locale, then Japanese. */
  locale?: Locale
  /** Auto-nudge after this many ms (0 disables). */
  openDelayMs?: number
  /** Accent color (hex). */
  primaryColor?: string
}

export function ChatWidget({
  locale,
  openDelayMs = 8000,
  primaryColor = '#4f46e5',
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [render, setRender] = useState(false)
  const [shown, setShown] = useState(false)
  const [teaser, setTeaser] = useState(false)
  const [unread, setUnread] = useState(false)
  const everOpened = useRef(false)

  const initialLocale: Locale = locale ?? (typeof window !== 'undefined' ? detectLocale() : 'ja')

  // Mount/animate the panel.
  useEffect(() => {
    if (open) {
      setRender(true)
      const id = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(id)
    }
    setShown(false)
    const id = setTimeout(() => setRender(false), 200)
    return () => clearTimeout(id)
  }, [open])

  // Gentle nudge if the visitor hasn't engaged.
  useEffect(() => {
    if (!openDelayMs || everOpened.current) return
    const id = setTimeout(() => {
      if (!everOpened.current) {
        setTeaser(true)
        setUnread(true)
      }
    }, openDelayMs)
    return () => clearTimeout(id)
  }, [openDelayMs])

  function toggle() {
    setOpen((v) => {
      const next = !v
      if (next) {
        everOpened.current = true
        setTeaser(false)
        setUnread(false)
        track('widget_opened', {})
      }
      return next
    })
  }

  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3"
      style={{ ['--sad-accent']: primaryColor } as CSSProperties}
    >
      {render && (
        <div
          className={cn(
            'origin-bottom-right transition-all duration-200 ease-out',
            shown ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0',
          )}
        >
          <ChatPanel
            initialLocale={initialLocale}
            onClose={() => setOpen(false)}
          />
        </div>
      )}

      {/* Teaser bubble */}
      {teaser && !open && (
        <button
          onClick={toggle}
          className="max-w-[15rem] rounded-2xl rounded-br-sm border border-zinc-200 bg-white px-4 py-3 text-left text-sm text-zinc-700 shadow-lg transition hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          {t('ui.greetingTeaser', initialLocale)}
        </button>
      )}

      {/* Launcher */}
      <button
        onClick={toggle}
        aria-label={t('ui.launcher', initialLocale)}
        aria-expanded={open}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-[var(--sad-accent)] text-white shadow-lg outline-none ring-offset-2 transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--sad-accent)] dark:ring-offset-zinc-900"
      >
        {unread && !open && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-rose-500 dark:border-zinc-900" />
        )}
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.4a8.38 8.38 0 0 1-.9-3.6A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
          </svg>
        )}
      </button>
    </div>
  )
}
