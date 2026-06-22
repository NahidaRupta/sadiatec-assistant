// ─────────────────────────────────────────────────────────────────────────────
// Flow registry.
//
// One graph, one shared opening, two audiences. The route choice sets the
// capture target up front (study/work/advisor -> lead, business -> inquiry) so
// the host knows where to save the moment a phone number arrives.
//
// Later (Phase B) this `mainFlow` object is exactly the shape you persist in a
// Payload `flows` collection — the engine reads it identically whether it comes
// from this file or the database.
// ─────────────────────────────────────────────────────────────────────────────

import type { FlowGraph, FlowNode, NodeId } from '../chat-engine/types'
import { candidateNodes } from './candidate'
import { b2bNodes } from './b2b'

const rootNodes: Record<NodeId, FlowNode> = {
  welcome: { id: 'welcome', type: 'message', textKey: 'welcome', next: 'route' },
  route: {
    id: 'route',
    type: 'choice',
    promptKey: 'route.prompt',
    options: [
      { labelKey: 'route.study', value: 'study', set: { inquiryType: 'study' }, setTarget: 'lead', next: 'cand.study' },
      { labelKey: 'route.work', value: 'work', set: { inquiryType: 'work' }, setTarget: 'lead', next: 'cand.work' },
      { labelKey: 'route.advisor', value: 'advisor', set: { inquiryType: 'advisor' }, setTarget: 'lead', next: 'cand.capture.intro' },
      { labelKey: 'route.b2b', value: 'b2b', setTarget: 'inquiry', next: 'b2b.start' },
      { labelKey: 'route.unsure', value: 'unsure', set: { inquiryType: 'unsure' }, setTarget: 'lead', next: 'cand.triage' },
    ],
  },
}

export const mainFlow: FlowGraph = {
  id: 'sadiatec.main',
  target: 'lead',
  start: 'welcome',
  nodes: { ...rootNodes, ...candidateNodes, ...b2bNodes },
}

export const flows = { main: mainFlow }
