// ─────────────────────────────────────────────────────────────────────────────
// The engine.
//
// Pure, deterministic, framework-agnostic. No fetch, no React, no Payload.
// It walks a FlowGraph, accumulates answers, validates input, and emits the bot
// messages to render. Anything with a side effect (saving a lead, notifying
// staff) is surfaced as a `SideEffect` for the host (the hook) to perform.
//
// This is the reusable core. To support a new audience or a clinic/ecommerce
// tenant later, you write a new FlowGraph — you never edit this file.
// ─────────────────────────────────────────────────────────────────────────────

import { t } from '../chat-i18n'
import type {
  ChatMessage,
  EngineState,
  FlowGraph,
  Interaction,
  Locale,
  ValidatorName,
} from './types'

let counter = 0
const mid = () => `m_${Date.now().toString(36)}_${(counter++).toString(36)}`

const validators: Record<ValidatorName, (v: string) => boolean> = {
  required: (v) => v.trim().length > 0,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  phone: (v) => /^[+]?[\d\s()-]{6,}$/.test(v.trim()),
}

export function createInitialState(flow: FlowGraph): EngineState {
  return {
    flowId: flow.id,
    target: flow.target,
    currentNodeId: flow.start,
    history: [],
    data: {},
    status: 'active',
    error: null,
    effects: [],
  }
}

/**
 * Walk forward through auto-advancing nodes (message / faq / handoff / capture),
 * collecting bot messages, until we reach a node that needs the user
 * (choice / input) or the end of the flow.
 */
function runForward(
  flow: FlowGraph,
  state: EngineState,
  locale: Locale,
): { state: EngineState; messages: ChatMessage[] } {
  const messages: ChatMessage[] = []
  let guard = 0

  while (state.currentNodeId && guard++ < 100) {
    const node = flow.nodes[state.currentNodeId]
    if (!node) break
    state.history.push(node.id)

    const suppressPrompt = state.suppressNextPrompt
    state.suppressNextPrompt = false   // NEW — consume it immediately

    switch (node.type) {
      case 'message':
        messages.push({ id: mid(), role: 'bot', text: t(node.textKey, locale), nodeId: node.id })
        state.currentNodeId = node.next
        break

      case 'faq':
        messages.push({ id: mid(), role: 'bot', text: t(node.answerKey, locale), nodeId: node.id })
        state.currentNodeId = node.backTo
        state.suppressNextPrompt = true   // NEW — don't replay the menu prompt next loop
        break

      case 'handoff':
        messages.push({ id: mid(), role: 'bot', text: t(node.textKey, locale), nodeId: node.id })
        state.effects.push({ type: 'handoff' })
        state.currentNodeId = node.next
        break

      case 'capture':
        state.target = node.target
        state.effects.push({ type: 'capture', target: node.target })
        state.currentNodeId = node.next
        break

      case 'choice':
        if (!suppressPrompt) {                              // NEW — guard the push
          messages.push({ id: mid(), role: 'bot', text: t(node.promptKey, locale), nodeId: node.id })
        }
        return { state, messages }

      case 'input':
        messages.push({ id: mid(), role: 'bot', text: t(node.promptKey, locale), nodeId: node.id })
        return { state, messages } // wait for the user

      case 'end':
        messages.push({ id: mid(), role: 'bot', text: t(node.textKey, locale), nodeId: node.id })
        state.currentNodeId = null
        state.status = 'done'
        return { state, messages }
    }
  }

  return { state, messages }
}

/** Start a flow: returns initial state + the opening bot messages. */
export function start(flow: FlowGraph, locale: Locale): { state: EngineState; messages: ChatMessage[] } {
  return runForward(flow, createInitialState(flow), locale)
}

/** Derive what the UI must render now from the current node. */
export function getInteraction(state: EngineState, flow: FlowGraph, locale: Locale): Interaction {
  if (!state.currentNodeId) return { kind: 'none' }
  const node = flow.nodes[state.currentNodeId]
  if (!node) return { kind: 'none' }

  if (node.type === 'choice') {
    return {
      kind: 'choice',
      options: node.options.map((o) => ({ label: t(o.labelKey, locale), value: o.value })),
    }
  }

  if (node.type === 'input') {
    return {
      kind: 'input',
      field: node.field,
      inputType: node.inputType,
      optional: !!node.optional,
      placeholderKey: node.promptKey,
      options: node.options?.map((o) => ({ label: t(o.labelKey, locale), value: o.value })),
    }
  }

  return { kind: 'none' }
}

/**
 * Apply the user's answer to the current node and advance.
 * Pure relative to `prev` (clones state). On a validation failure it returns the
 * same position with `error` set, so the UI can re-prompt without losing context.
 */
export function advance(
  flow: FlowGraph,
  prev: EngineState,
  rawValue: string,
  locale: Locale,
): { state: EngineState; messages: ChatMessage[] } {
  const state: EngineState = {
    ...prev,
    data: { ...prev.data },
    history: [...prev.history],
    effects: [],
    error: null,
  }

  const node = state.currentNodeId ? flow.nodes[state.currentNodeId] : null
  if (!node) return { state, messages: [] }

  const value = rawValue.trim()
  const messages: ChatMessage[] = []

  if (node.type === 'choice') {
    const chosen = node.options.find((o) => o.value === value)
    if (!chosen) {
      state.error = t('system.invalidChoice', locale)
      return { state, messages }
    }
    if (chosen.set) Object.assign(state.data, chosen.set)
    if (chosen.setTarget) state.target = chosen.setTarget
    messages.push({ id: mid(), role: 'user', text: t(chosen.labelKey, locale) })
    state.currentNodeId = chosen.next
    const fwd = runForward(flow, state, locale)
    return { state: fwd.state, messages: [...messages, ...fwd.messages] }
  }

  if (node.type === 'input') {
    // optional + empty -> skip without recording
    if (node.optional && value === '') {
      state.currentNodeId = node.next
      const fwd = runForward(flow, state, locale)
      return { state: fwd.state, messages: fwd.messages }
    }
    if (node.validate && !validators[node.validate](value)) {
      state.error = t(`system.invalid.${node.validate}`, locale)
      return { state, messages }
    }
    if (node.inputType === 'select' && node.options && !node.options.some((o) => o.value === value)) {
      state.error = t('system.invalidChoice', locale)
      return { state, messages }
    }
    state.data[node.field] = value
    const picked = node.options?.find((o) => o.value === value)
    messages.push({ id: mid(), role: 'user', text: picked ? t(picked.labelKey, locale) : value })
    state.currentNodeId = node.next
    const fwd = runForward(flow, state, locale)
    return { state: fwd.state, messages: [...messages, ...fwd.messages] }
  }

  return { state, messages }
}
