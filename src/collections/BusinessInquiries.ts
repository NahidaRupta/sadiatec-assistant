import type { CollectionConfig } from 'payload'

const staffOnly = ({ req }: { req: { user?: unknown } }) => !!req.user

export const BusinessInquiries: CollectionConfig = {
  slug: 'business-inquiries',
  labels: { singular: 'Business inquiry', plural: 'Business inquiries' },
  admin: {
    group: 'Intake',
    useAsTitle: 'companyName',
    defaultColumns: ['companyName', 'contactName', 'serviceInterest', 'status', 'createdAt'],
  },
  access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: staffOnly },
  timestamps: true,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'companyName', type: 'text', required: true },
        { name: 'contactName', type: 'text', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', required: true, index: true },
        { name: 'email', type: 'email', index: true },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Callback scheduled', value: 'callback_scheduled' },
        { label: 'Closed', value: 'closed' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'serviceInterest',
      type: 'select',
      options: [
        { label: 'Website development', value: 'website' },
        { label: 'Chatbot / AI assistant', value: 'chatbot_ai' },
        { label: 'Lead generation', value: 'lead_gen' },
        { label: 'Multilingual website', value: 'multilingual' },
        { label: 'Business automation', value: 'automation' },
        { label: 'Consultation', value: 'consultation' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'preferredContactTime',
          type: 'select',
          options: ['morning', 'afternoon', 'evening', 'anytime'].map((v) => ({ label: v, value: v })),
        },
        {
          name: 'languagePreference',
          type: 'select',
          defaultValue: 'ja',
          options: [
            { label: 'Japanese', value: 'ja' },
            { label: 'English', value: 'en' },
            { label: 'Bangla', value: 'bn' },
          ],
        },
      ],
    },
    { name: 'notes', type: 'textarea', admin: { description: 'What the visitor typed in chat.' } },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'website_widget',
      index: true,
      admin: { position: 'sidebar' },
    },
    { name: 'wantsCallback', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    { name: 'followUpAt', type: 'date', admin: { position: 'sidebar' } },
    {
      name: 'relatedSession',
      type: 'relationship',
      relationTo: 'chat-sessions',
      admin: { position: 'sidebar' },
    },
    {
      name: 'internalNotes',
      type: 'array',
      labels: { singular: 'Internal note', plural: 'Internal notes' },
      fields: [
        { name: 'note', type: 'textarea', required: true },
        { name: 'author', type: 'relationship', relationTo: 'users' },
        { name: 'at', type: 'date', defaultValue: () => new Date().toISOString() },
      ],
    },
  ],
}
