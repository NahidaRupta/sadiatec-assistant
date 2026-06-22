# Sadiatec Assistant

A conversion-focused conversational receptionist + lead-intake widget for a
Japan admissions & B2B consultancy. Not a generic chatbot — a guided, one-question-
at-a-time intake that turns visitors into contactable leads.

Stack: **Next.js 15 (App Router) · React · TypeScript · Tailwind · Payload CMS v3 ·
Neon Postgres · Cloudflare R2 · Vercel.**

---

## 1. The architecture decision (locked)

**Hard-coded content, generic engine.** The conversation flow is *typed data* (a
`FlowGraph`), interpreted by a small, industry-agnostic, pure state machine.

| Option | Verdict |
| --- | --- |
| Naive imperative hardcoding (`if/else`, component-per-step) | ❌ Rots fast; every change is a code change. |
| **FlowGraph data + generic engine** | ✅ **Chosen.** Launchable now, serializable, CMS-/multi-tenant-ready later. |
| Config/flow-builder UI first | ❌ Premature. Build it when a non-engineer needs to edit flows. |
| Multi-tenant SaaS platform first | ❌ Founder trap. Earn it with one product that works. |

- **Build first:** the engine, two flows (BD candidate + JP B2B), the polished
  widget, the Payload collections, and the intake API. Lead capture *is* the value.
- **Postpone:** AI/LLM, a CMS flow-builder, multi-tenancy, and **live agent chat**
  (replaced by async callback + instant staff notification + WhatsApp/LINE deep links).
- **Evolution path:** the engine never changes. Phase B: lift `mainFlow` into a
  Payload `flows` collection (same shape). Phase C: add a `tenant` field + config.
  Phase D: ship a standalone embeddable bundle for clinic/ecommerce templates.
  Phase E: add an LLM FAQ fallback behind a flag.

**Conversion tactic that matters most:** capture **name + phone first**, create the
lead/inquiry record the moment the phone arrives, then PATCH every later field. An
abandoned chat still leaves a contactable lead. Everything after phone is optional.

---

## 2. File map

```
src/
├── lib/
│   ├── chat-engine/
│   │   ├── types.ts        # the seam: FlowGraph, nodes, CollectedData, EngineState
│   │   └── engine.ts       # pure, deterministic state machine (no I/O)
│   ├── chat-flows/
│   │   ├── candidate.ts    # BD candidate graph (study/work/advisor/FAQ/capture)
│   │   ├── b2b.ts          # JP B2B graph (intent → service → capture)
│   │   └── index.ts        # shared root + assembled `mainFlow`
│   ├── chat-i18n.ts        # en (complete) + bn/ja (high-traffic) + t() fallback
│   ├── intake/
│   │   ├── schema.ts       # zod create/patch + honeypot
│   │   └── notify.ts       # staff webhook (Slack/LINE-compatible); email = TODO
│   └── utils.ts            # cn(), uuid(), track()
├── collections/
│   ├── Leads.ts            # candidate leads + status workflow + internal notes
│   ├── BusinessInquiries.ts
│   ├── ChatSessions.ts     # path/outcome telemetry → "chat history"
│   ├── FAQs.ts             # localized, optional CMS source for FAQ answers
│   └── Users.ts            # auth + admin/staff role
├── globals/
│   └── WidgetSettings.ts   # greeting, delay, languages, WhatsApp/LINE, etc.
├── app/api/
│   ├── intake/route.ts          # POST: create lead/inquiry (the conversion event)
│   ├── intake/[id]/route.ts     # PATCH: progressive field updates
│   ├── faqs/route.ts            # GET: published localized FAQs
│   └── chat-event/route.ts      # POST: upsert ChatSession
├── hooks/
│   ├── useChatSession.ts   # stable session id + telemetry reporter
│   └── useFlowEngine.ts    # engine ↔ side effects (save/handoff/analytics)
└── components/chat/
    ├── ChatWidget.tsx      # launcher, open/close, unread teaser
    └── ChatPanel.tsx       # header, messages, typing, quick replies, composer, handoff
```

### How the pieces talk
`ChatWidget` mounts `ChatPanel` → `useFlowEngine(locale)` holds engine state and
performs side effects → the pure `engine` walks `mainFlow` and emits messages +
`SideEffect`s → the hook turns those into `fetch` calls to `/api/intake*` →
Payload writes to Neon and `notify.ts` pings staff.

---

## 3. Wire it into your app (≈15 min)

**Env (`.env`):**
```bash
DATABASE_URL=postgres://...   # Neon POOLED connection string (see note below)
PAYLOAD_SECRET=...
STAFF_WEBHOOK_URL=...         # Slack/LINE-compatible incoming webhook (optional)
```

> **Neon:** use the **pooled** connection string and keep the Payload Postgres
> adapter pool small (e.g. `pool: { max: 5 }`). Serverless functions open many
> short-lived connections — this avoids Neon connection-limit errors.

**1. Register collections + global + localization** in `payload.config.ts`:
```ts
import { Leads } from './src/collections/Leads'
import { BusinessInquiries } from './src/collections/BusinessInquiries'
import { ChatSessions } from './src/collections/ChatSessions'
import { FAQs } from './src/collections/FAQs'
import { Users } from './src/collections/Users'
import { WidgetSettings } from './src/globals/WidgetSettings'

export default buildConfig({
  collections: [Users, Leads, BusinessInquiries, ChatSessions, FAQs],
  globals: [WidgetSettings],
  localization: {
    locales: ['en', 'bn', 'ja'],
    defaultLocale: 'en',
    fallback: true,
  },
  // db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL, max: 5 } }),
})
```

**2. Render the widget** in your root layout (read tunables from the global if you like):
```tsx
import { ChatWidget } from '@/components/chat/ChatWidget'

// e.g. const s = await payload.findGlobal({ slug: 'widget-settings' })
<ChatWidget
  whatsappNumber="8801XXXXXXXXX"
  lineUrl="https://line.me/..."
  primaryColor="#4f46e5"
  openDelayMs={8000}
/>
```

**3. `@payload-config` alias** — the API routes import `config from '@payload-config'`
(Payload's default). If yours differs, update the three route files.

**4. Run migrations / let Payload sync, create the first admin user, done.** Optionally
seed a few `FAQs` so staff can edit answers in the CMS.

---

## 4. Admin (no custom UI needed for v1)

Use the **Payload admin** as the staff dashboard. Each collection ships with
`defaultColumns` and indexed `status` / `source`. Staff workflows:
- **Filter** by status / source / inquiry type / date in the list "Filters" panel.
- **Search** name / phone / email with the `contains` operator.
- **Update status** through the documented lead/inquiry lifecycle.
- **Assign** via `assignedTo`, set `followUpAt`, add `internalNotes`.
- **See chat history** via the linked `relatedSession` (entry route + visited nodes).
- **Export** with Payload's REST/Local API or a CSV plugin later.

---

## 5. What's intentionally stubbed

- **bn / ja translations:** `chat-i18n.ts` has complete English and the high-traffic
  Bangla/Japanese strings. The long tail (FAQ answers, path explainers) falls back to
  English — fill those keys in to finish localization.
- **Email notifications:** `notify.ts` posts to a webhook and logs. Add Resend/SES
  fan-out to `WidgetSettings.notificationEmails` where marked `TODO`.
- **CMS-driven FAQ answers:** the `FAQs` collection + `/api/faqs` exist; the in-chat
  answers currently come from `chat-i18n.ts`. Point the `faq.*` nodes at the API when
  staff want to edit answers without a deploy.
- **Rate limiting:** honeypot + zod validation are in place. Add IP rate limiting at
  the edge/middleware before heavy traffic.

---

## 6. Extending it (the seam)

- **New question / branch:** edit a flow file in `chat-flows/` and add the i18n keys.
  No engine changes.
- **New audience or vertical (clinic, ecommerce):** write a new `FlowGraph`. The
  engine, widget, and API are reused as-is.
- **Editable flows in the CMS:** persist `mainFlow` in a `flows` collection — it's the
  same JSON shape the engine already reads.

Validators are **named** (`required` / `phone` / `email`) and copy lives behind
**i18n keys**, so the entire graph stays serializable — that's what makes every
"later" above a config change instead of a rewrite.
