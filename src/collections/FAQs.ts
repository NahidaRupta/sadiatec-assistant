import type { CollectionConfig } from 'payload'

const staffOnly = ({ req }: { req: { user?: unknown } }) => !!req.user

/**
 * Editable FAQ content. Read publicly (published only) via /api/faqs.
 * `question` and `answer` are localized — requires `localization` configured in
 * payload.config (locales: en, bn, ja). Today the in-chat FAQ answers come from
 * chat-i18n.ts; point the faq.* nodes at this collection when staff want to edit
 * answers without a deploy.
 */
export const FAQs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  admin: {
    group: 'Content',
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'audience', 'published', 'order'],
  },
  access: {
    read: () => true, // public read; the API additionally filters published=true
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    { name: 'question', type: 'text', required: true, localized: true },
    { name: 'answer', type: 'textarea', required: true, localized: true },
    {
      name: 'category',
      type: 'select',
      options: ['money', 'language', 'visa', 'work', 'accommodation', 'services', 'general'].map((v) => ({
        label: v,
        value: v,
      })),
    },
    {
      name: 'audience',
      type: 'select',
      defaultValue: 'candidate',
      options: [
        { label: 'Candidate', value: 'candidate' },
        { label: 'Business', value: 'b2b' },
        { label: 'Both', value: 'both' },
      ],
    },
    { name: 'published', type: 'checkbox', defaultValue: true, index: true },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
