import type { GlobalConfig } from 'payload'

/**
 * One editable place for the things staff tune without a deploy: greeting,
 * open delay, languages, handoff channels (WhatsApp/LINE), notification targets,
 * business hours. Read this in your layout/server component and pass the relevant
 * values to <ChatWidget /> as props.
 */
export const WidgetSettings: GlobalConfig = {
  slug: 'widget-settings',
  label: 'Widget settings',
  admin: { group: 'Content' },
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: true },
    { name: 'welcomeMessage', type: 'text', localized: true, admin: { description: 'Overrides the default opening line if set.' } },
    {
      name: 'openDelaySeconds',
      type: 'number',
      defaultValue: 8,
      admin: { description: 'Auto-nudge after N seconds (0 = never).' },
    },
    {
      name: 'defaultLanguage',
      type: 'select',
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Bangla', value: 'bn' },
        { label: 'Japanese', value: 'ja' },
      ],
    },
    {
      name: 'enabledLanguages',
      type: 'select',
      hasMany: true,
      defaultValue: ['en', 'bn', 'ja'],
      options: [
        { label: 'English', value: 'en' },
        { label: 'Bangla', value: 'bn' },
        { label: 'Japanese', value: 'ja' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'whatsappNumber', type: 'text', admin: { description: 'E.g. 8801XXXXXXXXX (no +).' } },
        { name: 'lineUrl', type: 'text', admin: { description: 'Full https://line.me/… URL.' } },
      ],
    },
    {
      name: 'notificationEmails',
      type: 'array',
      labels: { singular: 'Email', plural: 'Emails' },
      fields: [{ name: 'email', type: 'email', required: true }],
      admin: { description: 'Who gets notified on a new lead/inquiry (email wiring is a TODO).' },
    },
    { name: 'primaryColor', type: 'text', defaultValue: '#4f46e5', admin: { description: 'Accent color (hex).' } },
    { name: 'businessHours', type: 'text', localized: true, admin: { description: 'Shown near handoff, e.g. "Sun–Thu, 10:00–18:00 (BST)".' } },
  ],
}
