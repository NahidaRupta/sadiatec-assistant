// ─────────────────────────────────────────────────────────────────────────────
// The seam.
//
// A flow is *data*: a graph of nodes that the generic engine walks. Nodes
// reference i18n KEYS (never inline copy) and NAMED validators (never inline
// functions) so the whole graph stays serializable. That means the exact same
// structure can later be lifted into a Payload collection or translated without
// touching the engine, the widget, or the API. Hard-coded today, CMS-driven
// tomorrow — same engine.
// ─────────────────────────────────────────────────────────────────────────────

export type Locale = 'en' | 'bn' | 'ja'

export type NodeId = string

/** Serializable validators (resolved to functions inside the engine). */
export type ValidatorName = 'required' | 'phone' | 'email'

/** Every field the assistant can collect across both audiences. */
export interface CollectedData {
  // candidate
  name?: string
  phone?: string
  email?: string
  country?: string
  education?: string
  japaneseLevel?: string
  programInterest?: string
  inquiryType?: string
  preferredContactTime?: string
  notes?: string
  // b2b
  companyName?: string
  contactName?: string
  serviceInterest?: string
}

export type Field = keyof CollectedData

export interface BaseNode {
  id: NodeId
}

/** Bot says something, then auto-advances. */
export interface MessageNode extends BaseNode {
  type: 'message'
  textKey: string
  next: NodeId
}

/** Bot asks; renders quick-reply buttons. Options may also record data. */
export interface ChoiceOption {
  labelKey: string
  value: string
  next: NodeId
  /** Optionally record collected fields when this option is chosen. */
  set?: Partial<CollectedData>
  /** Optionally fix which collection captures target from here on. */
  setTarget?: 'lead' | 'inquiry'
}

export interface ChoiceNode extends BaseNode {
  type: 'choice'
  promptKey: string
  options: ChoiceOption[]
}

/** Collects exactly one field. `select` renders as quick-reply buttons too. */
export interface InputNode extends BaseNode {
  type: 'input'
  promptKey: string
  field: Field
  inputType: 'text' | 'email' | 'phone' | 'select' | 'textarea'
  options?: Array<{ labelKey: string; value: string }>
  validate?: ValidatorName
  optional?: boolean
  next: NodeId
}

/** Answers a common question, then returns to a menu node. */
export interface FaqNode extends BaseNode {
  type: 'faq'
  answerKey: string
  backTo: NodeId
}

/** The point where the assembled record is finalized. */
export interface CaptureNode extends BaseNode {
  type: 'capture'
  target: 'lead' | 'inquiry'
  next: NodeId
}

/** Requests a human callback (host sets wantsCallback + notifies staff). */
export interface HandoffNode extends BaseNode {
  type: 'handoff'
  textKey: string
  next: NodeId
}

export interface EndNode extends BaseNode {
  type: 'end'
  textKey: string
}

export type FlowNode =
  | MessageNode
  | ChoiceNode
  | InputNode
  | FaqNode
  | CaptureNode
  | HandoffNode
  | EndNode

export interface FlowGraph {
  id: string
  /** Default capture target (a node or choice option may override per branch). */
  target: 'lead' | 'inquiry'
  start: NodeId
  nodes: Record<NodeId, FlowNode>
}

/** A rendered chat bubble. */
export interface ChatMessage {
  id: string
  role: 'bot' | 'user'
  text: string
  nodeId?: NodeId
}

/** What the UI must render *now* to move the conversation forward. */
export type Interaction =
  | { kind: 'choice'; options: Array<{ label: string; value: string }> }
  | {
      kind: 'input'
      field: Field
      inputType: InputNode['inputType']
      options?: Array<{ label: string; value: string }>
      optional: boolean
      placeholderKey: string
    }
  | { kind: 'none' } // conversation finished

/** Side effects the host performs — keeps the engine pure (no I/O). */
export type SideEffect =
  | { type: 'capture'; target: 'lead' | 'inquiry' }
  | { type: 'handoff' }

export interface EngineState {
  flowId: string
  target: 'lead' | 'inquiry'
  currentNodeId: NodeId | null
  history: NodeId[]
  data: CollectedData
  status: 'active' | 'done'
  error: string | null
  effects: SideEffect[]
}
