import type { CollectionConfig } from 'payload'

// Staff-only access. The widget never writes through REST — it goes through
// /api/intake, which uses the Payload Local API (overrideAccess) server-side.
const staffOnly = ({ req }: { req: { user?: unknown } }) => !!req.user

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    group: 'Intake',
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'status', 'programInterest', 'createdAt'],
    // Filter by status / source / inquiryType / date via the list "Filters" panel;
    // search name/phone/email with the "contains" operator there.
  },
  access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: staffOnly },
  timestamps: true,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true, index: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', index: true },
        { name: 'country', type: 'text', defaultValue: 'Bangladesh' },
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
        { label: 'Registered', value: 'registered' },
        { label: 'Closed', value: 'closed' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'inquiryType',
      type: 'select',
      options: [
        { label: 'Study', value: 'study' },
        { label: 'Work', value: 'work' },
        { label: 'Advisor', value: 'advisor' },
        { label: 'Unsure', value: 'unsure' },
      ],
    },
    {
      name: 'programInterest',
      type: 'select',
      options: [
        { label: 'Japanese language school', value: 'language_school' },
        { label: 'Bekka / undergraduate', value: 'bekka_undergrad' },
        { label: 'Scholarship', value: 'scholarship' },
        { label: 'SSW', value: 'ssw' },
        { label: 'TITP', value: 'titp' },
        { label: 'Undecided', value: 'undecided' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'education',
          type: 'select',
          options: ['below_hsc', 'hsc', 'diploma', 'bachelor', 'master', 'other'].map((v) => ({
            label: v,
            value: v,
          })),
        },
        {
          name: 'japaneseLevel',
          type: 'select',
          options: ['none', 'n5', 'n4', 'n3', 'n2', 'n1'].map((v) => ({ label: v.toUpperCase(), value: v })),
        },
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
          defaultValue: 'en',
          options: [
            { label: 'English', value: 'en' },
            { label: 'Bangla', value: 'bn' },
            { label: 'Japanese', value: 'ja' },
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
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
    },
    { name: 'followUpAt', type: 'date', admin: { position: 'sidebar' } },
    {
      name: 'relatedSession',
      type: 'relationship',
      relationTo: 'chat-sessions',
      admin: { position: 'sidebar', description: 'Chat transcript / path for this lead.' },
    },
    {
      name: 'internalNotes',
      type: 'array',
      labels: { singular: 'Internal note', plural: 'Internal notes' },
      admin: { description: 'Staff-only follow-up notes.' },
      fields: [
        { name: 'note', type: 'textarea', required: true },
        { name: 'author', type: 'relationship', relationTo: 'users' },
        { name: 'at', type: 'date', defaultValue: () => new Date().toISOString() },
      ],
    },
  ],
}
