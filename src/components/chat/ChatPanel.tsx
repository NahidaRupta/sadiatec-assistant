'use client'

import { useEffect, useRef, useState } from 'react'
import type { Locale } from '@/lib/chat-engine/types'
import { SUPPORTED_LOCALES, t } from '@/lib/chat-i18n'
import { cn } from '@/lib/utils'
import { useFlowEngine } from '@/hooks/useFlowEngine'

interface ChatPanelProps {
  initialLocale: Locale
  whatsappUrl?: string
  lineUrl?: string
  onClose: () => void
}

export function ChatPanel({ initialLocale, whatsappUrl, lineUrl, onClose }: ChatPanelProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [text, setText] = useState('')
  const { messages, interaction, typing, done, error, send, restart } = useFlowEngine(locale)

  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, interaction])

  const isTextInput =
    interaction.kind === 'input' &&
    ['text', 'email', 'phone', 'textarea'].includes(interaction.inputType)
  const optional = interaction.kind === 'input' && interaction.optional

  function submitText() {
    if (!text.trim() && !optional) return
    const v = text
    setText('')
    void send(v)
  }

  return (
    <div className="flex h-[min(80vh,600px)] w-[calc(100vw-2.5rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:w-[400px]">
      <style>{`
        @keyframes sadFadeUp { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform:none; } }
        .sad-msg { animation: sadFadeUp .28s ease-out both; }
        @media (prefers-reduced-motion: reduce){ .sad-msg { animation: none; } }
      `}</style>

      {/* Header */}
      <header className="flex items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="relative">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--sad-accent)] text-sm font-semibold text-white">
            S
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-950" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {t('ui.title', locale)}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{t('ui.online', locale)}</p>
        </div>

        {/* Language segmented control */}
        <div className="flex overflow-hidden rounded-full border border-zinc-200 text-[11px] dark:border-zinc-700">
          {SUPPORTED_LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLocale(l.code)}
              className={cn(
                'px-2 py-1 transition',
                l.code === locale
                  ? 'bg-[var(--sad-accent)] text-white'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        <button
          onClick={restart}
          aria-label={t('ui.restart', locale)}
          title={t('ui.restart', locale)}
          className="rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto bg-zinc-50 px-4 py-4 dark:bg-zinc-900/40"
      >
        {messages.map((m) => (
          <div key={m.id} className={cn('sad-msg flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'rounded-br-sm bg-[var(--sad-accent)] text-white'
                  : 'rounded-bl-sm border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100',
              )}
            >
              {m.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="sad-msg flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-3.5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interaction footer */}
      <div className="border-t border-zinc-100 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        {error && <p className="mb-2 px-1 text-xs text-rose-500">{error}</p>}

        {/* Quick replies (choices + select inputs) */}
        {!typing &&
          (interaction.kind === 'choice' ||
            (interaction.kind === 'input' && interaction.inputType === 'select')) && (
            <div className="flex flex-wrap gap-2">
            {interaction.options?.map((o) => (
              <button
                key={o.value}
                onClick={() => void send(o.value)}
                className="rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-[var(--sad-accent)] transition hover:border-[var(--sad-accent)] hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sad-accent)] dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-[var(--sad-accent)] dark:hover:bg-zinc-800"
              >
                {o.label}
              </button>
            ))}
            {optional && (
              <button
                onClick={() => void send('')}
                className="rounded-full px-3 py-2 text-sm text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {t('ui.skip', locale)}
              </button>
            )}
          </div>
        )}

        {/* Text composer */}
        {isTextInput && !typing && interaction.kind === 'input' && (
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submitText()
                }
              }}
              rows={interaction.inputType === 'textarea' ? 2 : 1}
              inputMode={
                interaction.inputType === 'phone'
                  ? 'tel'
                  : interaction.inputType === 'email'
                    ? 'email'
                    : 'text'
              }
              placeholder={
                interaction.inputType === 'textarea'
                  ? t('ui.placeholderNotes', locale)
                  : t('ui.placeholder', locale)
              }
              className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--sad-accent)] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              autoFocus
            />
            {optional && !text.trim() ? (
              <button
                onClick={() => void send('')}
                className="shrink-0 rounded-xl px-3 py-2 text-sm text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {t('ui.skip', locale)}
              </button>
            ) : (
              <button
                onClick={submitText}
                aria-label={t('ui.send', locale)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--sad-accent)] text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sad-accent)] disabled:opacity-40"
                disabled={!text.trim() && !optional}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Handoff / completion */}
        {done && (
          <div className="flex flex-col gap-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.9 5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.3 5.3 5.3 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c2.3 1 2.3.7 2.7.6a2.5 2.5 0 0 0 1.6-1.1 2 2 0 0 0 .1-1.1c0-.1-.2-.2-.4-.3z" /></svg>
                {t('ui.contactWhatsApp', locale)}
              </a>
            )}
            {lineUrl && (
              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#06c755] px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-95"
              >
                {t('ui.contactLine', locale)}
              </a>
            )}
            <button
              onClick={restart}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              {t('ui.restart', locale)}
            </button>
          </div>
        )}

        <p className="mt-2 text-center text-[10px] text-zinc-300 dark:text-zinc-600">
          {t('ui.poweredBy', locale)}
        </p>
      </div>
    </div>
  )
}
