// ─────────────────────────────────────────────────────────────────────────────
// Japan B2B client flow (data only).
//
// Professional, concise register. Intent → optional services overview →
// progressive inquiry capture (company, contact, phone, …). Captures into the
// business-inquiries collection. Copy lives in src/lib/chat-i18n.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { FlowNode, NodeId } from '../chat-engine/types'

const SERVICE_OPTIONS = [
  { labelKey: 'opt.svc.website', value: 'website' },
  { labelKey: 'opt.svc.chatbot_ai', value: 'chatbot_ai' },
  { labelKey: 'opt.svc.lead_gen', value: 'lead_gen' },
  { labelKey: 'opt.svc.multilingual', value: 'multilingual' },
  { labelKey: 'opt.svc.automation', value: 'automation' },
  { labelKey: 'opt.svc.consultation', value: 'consultation' },
  { labelKey: 'opt.svc.other', value: 'other' },
]

const TIME_OPTIONS = [
  { labelKey: 'opt.time.morning', value: 'morning' },
  { labelKey: 'opt.time.afternoon', value: 'afternoon' },
  { labelKey: 'opt.time.evening', value: 'evening' },
  { labelKey: 'opt.time.anytime', value: 'anytime' },
]

export const b2bNodes: Record<NodeId, FlowNode> = {
  'b2b.start': {
    id: 'b2b.start',
    type: 'choice',
    promptKey: 'b2b.start.prompt',
    options: [
      { labelKey: 'b2b.opt.consultation', value: 'consultation', next: 'b2b.capture.intro' },
      { labelKey: 'b2b.opt.services', value: 'services', next: 'b2b.services' },
      { labelKey: 'b2b.opt.contact', value: 'contact', next: 'b2b.capture.intro' },
      { labelKey: 'b2b.opt.human', value: 'human', next: 'b2b.capture.intro' },
    ],
  },

  'b2b.services': { id: 'b2b.services', type: 'message', textKey: 'b2b.services', next: 'b2b.capture.intro' },

  // ── progressive capture (record created at phone, patched onward) ───────────
  'b2b.capture.intro': { id: 'b2b.capture.intro', type: 'message', textKey: 'b2b.capture.intro', next: 'b2b.q.service' },
  'b2b.q.service': { id: 'b2b.q.service', type: 'input', promptKey: 'q.service', field: 'serviceInterest', inputType: 'select', options: SERVICE_OPTIONS, optional: true, next: 'b2b.q.company' },
  'b2b.q.company': { id: 'b2b.q.company', type: 'input', promptKey: 'q.company', field: 'companyName', inputType: 'text', validate: 'required', next: 'b2b.q.name' },
  'b2b.q.name': { id: 'b2b.q.name', type: 'input', promptKey: 'q.contactName', field: 'contactName', inputType: 'text', validate: 'required', next: 'b2b.q.phone' },
  'b2b.q.phone': { id: 'b2b.q.phone', type: 'input', promptKey: 'q.phone', field: 'phone', inputType: 'phone', validate: 'phone', next: 'b2b.q.email' },
  'b2b.q.email': { id: 'b2b.q.email', type: 'input', promptKey: 'q.email', field: 'email', inputType: 'email', validate: 'email', optional: true, next: 'b2b.q.time' },
  'b2b.q.time': { id: 'b2b.q.time', type: 'input', promptKey: 'q.time', field: 'preferredContactTime', inputType: 'select', options: TIME_OPTIONS, optional: true, next: 'b2b.q.notes' },
  'b2b.q.notes': { id: 'b2b.q.notes', type: 'input', promptKey: 'q.notes', field: 'notes', inputType: 'textarea', optional: true, next: 'b2b.capture.do' },

  'b2b.capture.do': { id: 'b2b.capture.do', type: 'capture', target: 'inquiry', next: 'b2b.end' },
  'b2b.end': { id: 'b2b.end', type: 'end', textKey: 'b2b.end' },
}
