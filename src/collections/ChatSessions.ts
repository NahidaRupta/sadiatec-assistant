import type { CollectionConfig } from 'payload'

const staffOnly = ({ req }: { req: { user?: unknown } }) => !!req.user

/**
 * Lightweight analytics record per conversation. Lets staff see the path a
 * visitor took ("chat history") and lets you measure the funnel even when a
 * conversation does not convert. Written by /api/chat-event and /api/intake.
 */
export const ChatSessions: CollectionConfig = {
  slug: 'chat-sessions',
  labels: { singular: 'Chat session', plural: 'Chat sessions' },
  admin: {
    group: 'Insights',
    useAsTitle: 'sessionId',
    defaultColumns: ['sessionId', 'outcome', 'entryRoute', 'language', 'updatedAt'],
  },
  access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: staffOnly },
  timestamps: true,
  fields: [
    { name: 'sessionId', type: 'text', required: true, unique: true, index: true },
    {
      name: 'outcome',
      type: 'select',
      defaultValue: 'in_progress',
      options: [
        { label: 'In progress', value: 'in_progress' },
        { label: 'Lead', value: 'lead' },
        { label: 'Inquiry', value: 'inquiry' },
        { label: 'FAQ only', value: 'faq_only' },
        { label: 'Abandoned', value: 'abandoned' },
      ],
    },
    {
      name: 'entryRoute',
      type: 'select',
      options: ['study', 'work', 'advisor', 'b2b', 'unsure'].map((v) => ({ label: v, value: v })),
    },
    {
      name: 'language',
      type: 'select',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Bangla', value: 'bn' },
        { label: 'Japanese', value: 'ja' },
      ],
    },
    {
      name: 'visitedNodes',
      type: 'json',
      admin: { description: 'Ordered node ids the visitor passed through.' },
    },
    { name: 'relatedLead', type: 'relationship', relationTo: 'leads', admin: { position: 'sidebar' } },
    {
      name: 'relatedInquiry',
      type: 'relationship',
      relationTo: 'business-inquiries',
      admin: { position: 'sidebar' },
    },
    { name: 'referrer', type: 'text', admin: { position: 'sidebar' } },
    { name: 'userAgent', type: 'text', admin: { position: 'sidebar' } },
    { name: 'startedAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'lastActivityAt', type: 'date', admin: { position: 'sidebar' } },
  ],
}
