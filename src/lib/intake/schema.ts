import { z } from 'zod'

// Server-side validation for the intake API. zod strips unknown keys by default,
// so sending the whole CollectedData object is safe: the lead schema keeps lead
// fields, the inquiry schema keeps inquiry fields.

const locale = z.enum(['en', 'bn', 'ja'])
const contactTime = z.enum(['morning', 'afternoon', 'evening', 'anytime'])

const shared = {
  phone: z.string().min(6).max(40),
  email: z.string().email().optional(),
  preferredContactTime: contactTime.optional(),
  languagePreference: locale.optional(),
  notes: z.string().max(2000).optional(),
  wantsCallback: z.boolean().optional(),
  source: z.string().max(120).optional(),
  sessionId: z.string().max(120).optional(),
  // Honeypot: must be empty. Bots that fill every field get silently dropped.
  honeypot: z.string().max(0).optional(),
}

export const leadCreateSchema = z.object({
  name: z.string().min(1).max(200),
  country: z.string().max(120).optional(),
  inquiryType: z.enum(['study', 'work', 'advisor', 'unsure']).optional(),
  programInterest: z
    .enum(['language_school', 'bekka_undergrad', 'scholarship', 'ssw', 'titp', 'undecided'])
    .optional(),
  education: z.enum(['below_hsc', 'hsc', 'diploma', 'bachelor', 'master', 'other']).optional(),
  japaneseLevel: z.enum(['none', 'n5', 'n4', 'n3', 'n2', 'n1']).optional(),
  ...shared,
})

export const inquiryCreateSchema = z.object({
  companyName: z.string().min(1).max(200),
  contactName: z.string().min(1).max(200),
  serviceInterest: z
    .enum(['website', 'chatbot_ai', 'lead_gen', 'multilingual', 'automation', 'consultation', 'other'])
    .optional(),
  ...shared,
})

export const intakeCreateSchema = z.discriminatedUnion('target', [
  z.object({ target: z.literal('lead'), data: leadCreateSchema }),
  z.object({ target: z.literal('inquiry'), data: inquiryCreateSchema }),
])

// Patches are partial by nature (progressive capture). Validate the shape
// loosely here and let Payload enforce field-level rules.
export const intakePatchSchema = z.object({
  target: z.enum(['lead', 'inquiry']),
  data: z.record(z.string(), z.unknown()),
})

export type IntakeCreate = z.infer<typeof intakeCreateSchema>
export type IntakePatch = z.infer<typeof intakePatchSchema>
