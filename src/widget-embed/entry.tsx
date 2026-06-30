import { createRoot } from 'react-dom/client'
import { ChatWidget, type ChatWidgetProps } from '@/components/chat/ChatWidget'
import './widget.css'

const ROOT_ID = 'sadiatec-assistant-root'

function readConfigFromScriptTag(): ChatWidgetProps {
  const script = document.currentScript as HTMLScriptElement | null
  return {
    locale: (script?.dataset.locale as ChatWidgetProps['locale']) || undefined,
    primaryColor: script?.dataset.color || undefined,
    openDelayMs: script?.dataset.openDelay ? Number(script.dataset.openDelay) : undefined,
  }
}

function mount() {
  if (document.getElementById(ROOT_ID)) return

  // Set the API base BEFORE the component tree renders, so every fetch call resolves correctly.
  const script = document.currentScript as HTMLScriptElement | null
  const scriptSrc = script?.src || ''
  const apiBase = scriptSrc ? new URL(scriptSrc).origin : ''
  ;(window as unknown as { __SADIATEC_API_BASE__?: string }).__SADIATEC_API_BASE__ = apiBase

  const container = document.createElement('div')
  container.id = ROOT_ID
  document.body.appendChild(container)

  const props = readConfigFromScriptTag()
  const root = createRoot(container)
  root.render(<ChatWidget {...props} />)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}