// ─────────────────────────────────────────────────────────────────────────────
// Bangladesh candidate flow (data only).
//
// Branches: study (language school / Bekka / scholarship), work (SSW / TITP),
// a "not sure" triage, an FAQ layer, and the progressive contact capture that
// converges from every branch. Edit copy in src/lib/chat-i18n.ts, not here —
// these nodes only carry structure + i18n keys.
// ─────────────────────────────────────────────────────────────────────────────

import type { FlowNode, NodeId } from '../chat-engine/types'

const EDU_OPTIONS = [
  { labelKey: 'opt.edu.below_hsc', value: 'below_hsc' },
  { labelKey: 'opt.edu.hsc', value: 'hsc' },
  { labelKey: 'opt.edu.diploma', value: 'diploma' },
  { labelKey: 'opt.edu.bachelor', value: 'bachelor' },
  { labelKey: 'opt.edu.master', value: 'master' },
  { labelKey: 'opt.edu.other', value: 'other' },
]

const JP_OPTIONS = [
  { labelKey: 'opt.jp.none', value: 'none' },
  { labelKey: 'opt.jp.n5', value: 'n5' },
  { labelKey: 'opt.jp.n4', value: 'n4' },
  { labelKey: 'opt.jp.n3', value: 'n3' },
  { labelKey: 'opt.jp.n2', value: 'n2' },
  { labelKey: 'opt.jp.n1', value: 'n1' },
]

const TIME_OPTIONS = [
  { labelKey: 'opt.time.morning', value: 'morning' },
  { labelKey: 'opt.time.afternoon', value: 'afternoon' },
  { labelKey: 'opt.time.evening', value: 'evening' },
  { labelKey: 'opt.time.anytime', value: 'anytime' },
]

export const candidateNodes: Record<NodeId, FlowNode> = {
  // ── study branch ──────────────────────────────────────────────────────────
  'cand.study': {
    id: 'cand.study',
    type: 'choice',
    promptKey: 'cand.study.prompt',
    options: [
      { labelKey: 'opt.langschool', value: 'language_school', set: { programInterest: 'language_school' }, next: 'cand.path.lang' },
      { labelKey: 'opt.bekka', value: 'bekka_undergrad', set: { programInterest: 'bekka_undergrad' }, next: 'cand.path.bekka' },
      { labelKey: 'opt.scholarship', value: 'scholarship', set: { programInterest: 'scholarship' }, next: 'cand.path.scholarship' },
      { labelKey: 'opt.back', value: 'back', next: 'route' },
    ],
  },

  // ── work branch ───────────────────────────────────────────────────────────
  'cand.work': {
    id: 'cand.work',
    type: 'choice',
    promptKey: 'cand.work.prompt',
    options: [
      { labelKey: 'opt.ssw', value: 'ssw', set: { programInterest: 'ssw' }, next: 'cand.path.ssw' },
      { labelKey: 'opt.titp', value: 'titp', set: { programInterest: 'titp' }, next: 'cand.path.titp' },
      { labelKey: 'opt.back', value: 'back', next: 'route' },
    ],
  },

  // ── not-sure triage ───────────────────────────────────────────────────────
  'cand.triage': {
    id: 'cand.triage',
    type: 'choice',
    promptKey: 'cand.triage.prompt',
    options: [
      { labelKey: 'route.study', value: 'study', set: { inquiryType: 'study' }, next: 'cand.study' },
      { labelKey: 'route.work', value: 'work', set: { inquiryType: 'work' }, next: 'cand.work' },
      { labelKey: 'route.advisor', value: 'advisor', set: { inquiryType: 'advisor' }, next: 'cand.capture.intro' },
    ],
  },

  // ── path explainers (all converge on the advisor offer) ────────────────────
  'cand.path.lang': { id: 'cand.path.lang', type: 'message', textKey: 'cand.path.lang.intro', next: 'cand.offer' },
  'cand.path.bekka': { id: 'cand.path.bekka', type: 'message', textKey: 'cand.path.bekka.intro', next: 'cand.offer' },
  'cand.path.scholarship': { id: 'cand.path.scholarship', type: 'message', textKey: 'cand.path.scholarship.intro', next: 'cand.offer' },
  'cand.path.ssw': { id: 'cand.path.ssw', type: 'message', textKey: 'cand.path.ssw.intro', next: 'cand.offer' },
  'cand.path.titp': { id: 'cand.path.titp', type: 'message', textKey: 'cand.path.titp.intro', next: 'cand.offer' },

  'cand.offer': {
    id: 'cand.offer',
    type: 'choice',
    promptKey: 'cand.offer.prompt',
    options: [
      { labelKey: 'opt.yesAdvisor', value: 'yes', next: 'cand.capture.intro' },
      { labelKey: 'opt.haveQuestion', value: 'faq', next: 'cand.faq.menu' },
    ],
  },

  // ── FAQ layer (safe, general; always routes back to a human) ───────────────
  'cand.faq.menu': {
    id: 'cand.faq.menu',
    type: 'choice',
    promptKey: 'faq.menu.prompt',
    options: [
      { labelKey: 'faq.opt.money', value: 'money', next: 'cand.faq.money' },
      { labelKey: 'faq.opt.language', value: 'language', next: 'cand.faq.language' },
      { labelKey: 'faq.opt.visa', value: 'visa', next: 'cand.faq.visa' },
      { labelKey: 'faq.opt.work', value: 'work', next: 'cand.faq.work' },
      { labelKey: 'faq.opt.accom', value: 'accom', next: 'cand.faq.accom' },
      { labelKey: 'faq.opt.services', value: 'services', next: 'cand.faq.services' },
      { labelKey: 'opt.yesAdvisor', value: 'advisor', next: 'cand.capture.intro' },
    ],
  },
  'cand.faq.money': { id: 'cand.faq.money', type: 'faq', answerKey: 'faq.money', backTo: 'cand.faq.menu' },
  'cand.faq.language': { id: 'cand.faq.language', type: 'faq', answerKey: 'faq.language', backTo: 'cand.faq.menu' },
  'cand.faq.visa': { id: 'cand.faq.visa', type: 'faq', answerKey: 'faq.visa', backTo: 'cand.faq.menu' },
  'cand.faq.work': { id: 'cand.faq.work', type: 'faq', answerKey: 'faq.work', backTo: 'cand.faq.menu' },
  'cand.faq.accom': { id: 'cand.faq.accom', type: 'faq', answerKey: 'faq.accom', backTo: 'cand.faq.menu' },
  'cand.faq.services': { id: 'cand.faq.services', type: 'faq', answerKey: 'faq.services', backTo: 'cand.faq.menu' },

  // ── progressive capture ────────────────────────────────────────────────────
  // Name + phone come first; the host creates the lead the moment a phone is
  // captured and patches each later field, so an abandoned chat still leaves a
  // contactable lead. Everything after phone is optional.
  'cand.capture.intro': { id: 'cand.capture.intro', type: 'message', textKey: 'cand.capture.intro', next: 'cand.q.name' },
  'cand.q.name': { id: 'cand.q.name', type: 'input', promptKey: 'q.name', field: 'name', inputType: 'text', validate: 'required', next: 'cand.q.phone' },
  'cand.q.phone': { id: 'cand.q.phone', type: 'input', promptKey: 'q.phone', field: 'phone', inputType: 'phone', validate: 'phone', next: 'cand.q.email' },
  'cand.q.email': { id: 'cand.q.email', type: 'input', promptKey: 'q.email', field: 'email', inputType: 'email', validate: 'email', optional: true, next: 'cand.q.education' },
  'cand.q.education': { id: 'cand.q.education', type: 'input', promptKey: 'q.education', field: 'education', inputType: 'select', options: EDU_OPTIONS, optional: true, next: 'cand.q.jp' },
  'cand.q.jp': { id: 'cand.q.jp', type: 'input', promptKey: 'q.jp', field: 'japaneseLevel', inputType: 'select', options: JP_OPTIONS, optional: true, next: 'cand.q.time' },
  'cand.q.time': { id: 'cand.q.time', type: 'input', promptKey: 'q.time', field: 'preferredContactTime', inputType: 'select', options: TIME_OPTIONS, optional: true, next: 'cand.q.notes' },
  'cand.q.notes': { id: 'cand.q.notes', type: 'input', promptKey: 'q.notes', field: 'notes', inputType: 'textarea', optional: true, next: 'cand.capture.do' },

  'cand.capture.do': { id: 'cand.capture.do', type: 'capture', target: 'lead', next: 'cand.handoff' },
  'cand.handoff': { id: 'cand.handoff', type: 'handoff', textKey: 'cand.handoff', next: 'cand.end' },
  'cand.end': { id: 'cand.end', type: 'end', textKey: 'cand.end' },
}
