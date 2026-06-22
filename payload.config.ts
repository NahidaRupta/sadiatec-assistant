import path from 'path'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { fileURLToPath } from 'url'

// Import collections
import { Users } from './src/collections/Users'
import { Leads } from './src/collections/Leads'
import { BusinessInquiries } from './src/collections/BusinessInquiries'
import { ChatSessions } from './src/collections/ChatSessions'
import { FAQs } from './src/collections/FAQs'

// Import globals
import { WidgetSettings } from './src/globals/WidgetSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Leads, BusinessInquiries, ChatSessions, FAQs],
  globals: [WidgetSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: 5, // Keep small for serverless; adjust upward for long-running servers
    },
  }),
  localization: {
    locales: ['en', 'bn', 'ja'],
    defaultLocale: 'en',
    fallback: true,
  },
  async onInit(payload) {
    const adminUser = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (adminUser.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: process.env.PAYLOAD_SEED_EMAIL || 'admin@sadiatec.dev',
          password: process.env.PAYLOAD_SEED_PASSWORD || 'changeme',
          role: 'admin',
        },
      })
    }
  },
})
