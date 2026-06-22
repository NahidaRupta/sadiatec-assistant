# Sadiatec Assistant — Complete Setup Guide

## Step 1: Extract and Install

```bash
unzip sadiatec-assistant.zip
cd sadiatec-assistant
npm install
```

## Step 2: Environment Setup

Copy the `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```bash
# REQUIRED
DATABASE_URL=postgresql://user:pass@region.neon.tech/sadiatec?sslmode=require
PAYLOAD_SECRET=$(openssl rand -hex 32)  # Generate a random secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# OPTIONAL but recommended
STAFF_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# For initial seed (optional)
PAYLOAD_SEED_EMAIL=admin@sadiatec.dev
PAYLOAD_SEED_PASSWORD=changeme
```

### Get a Neon PostgreSQL Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the **POOLED** connection string (not the direct one)
4. Paste into `DATABASE_URL`

> **Important:** Use the **pooled** connection string. Neon free tier has connection limits; pooling prevents exhaustion on serverless.

### Get a Slack Webhook (Optional but Recommended)

1. Go to your Slack workspace
2. Create a new Incoming Webhook in the channel where you want notifications
3. Copy the webhook URL
4. Paste into `STAFF_WEBHOOK_URL`

The widget will notify staff every time a new lead arrives.

## Step 3: Add Config Files to Your Project Root

Copy these files from the outputs folder to your project root:

- `package.json` — dependencies
- `payload.config.ts` — Payload CMS configuration with all collections + localization
- `next.config.mjs` — Next.js configuration
- `tsconfig.json` — TypeScript strict mode configuration
- `tailwind.config.ts` — Tailwind CSS with dark mode
- `postcss.config.js` — PostCSS for Tailwind
- `.env.example` — environment variables template
- `globals.css` — global styles with Tailwind + dark mode + accessibility
- `app-layout.tsx` — rename to `src/app/layout.tsx` and add to your app directory

## Step 4: Directory Structure

Your project should look like this:

```
sadiatec-assistant/
├── src/
│   ├── app/
│   │   ├── layout.tsx          (from app-layout.tsx)
│   │   ├── globals.css         (from globals.css)
│   │   └── api/
│   │       ├── intake/
│   │       │   ├── route.ts    (already in scaffold)
│   │       │   └── [id]/route.ts
│   │       ├── faqs/route.ts
│   │       └── chat-event/route.ts
│   ├── collections/
│   │   ├── Leads.ts
│   │   ├── BusinessInquiries.ts
│   │   ├── ChatSessions.ts
│   │   ├── FAQs.ts
│   │   └── Users.ts
│   ├── globals/
│   │   └── WidgetSettings.ts
│   ├── lib/
│   │   ├── chat-engine/
│   │   ├── chat-flows/
│   │   ├── chat-i18n.ts
│   │   ├── intake/
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useChatSession.ts
│   │   └── useFlowEngine.ts
│   └── components/
│       └── chat/
│           ├── ChatWidget.tsx
│           └── ChatPanel.tsx
├── payload.config.ts           (root level)
├── next.config.mjs             (root level)
├── tsconfig.json               (root level)
├── tailwind.config.ts          (root level)
├── postcss.config.js           (root level)
├── package.json                (root level)
├── .env.local                  (root level, NOT committed)
└── .env.example                (root level, committed)
```

## Step 5: Run Migrations & Seed Initial Data

```bash
npm run build
npm run start
```

On first run, Payload will:
1. Create the database schema (all collections)
2. Create the initial admin user (from `PAYLOAD_SEED_EMAIL` and `PAYLOAD_SEED_PASSWORD`)
3. Initialize the WidgetSettings global

### Access Payload Admin

- **URL:** http://localhost:3000/admin
- **Email:** admin@sadiatec.dev
- **Password:** changeme

Change the password immediately in the admin dashboard.

## Step 6: Configure Widget Settings

In the Payload admin:

1. Go to **Content** → **Widget settings**
2. Fill in:
   - **WhatsApp Number:** e.g., `8801XXXXXXXXX` (without +)
   - **LINE URL:** e.g., `https://line.me/R/ti/p/%40xxx`
   - **Notification Emails:** staff emails for the email-notify TODO
   - **Default Language:** `en` (or `bn` / `ja`)
   - **Enabled Languages:** check the ones you want
   - **Business Hours:** e.g., "Sun–Thu, 10:00–18:00 (BST)"
   - **Primary Color:** hex, e.g., `#4f46e5`

## Step 7: (Optional) Seed FAQ Entries

Create a few FAQs in the Payload admin:

1. Go to **Content** → **FAQs**
2. Add entries like:
   - **Question:** "How much money is required?" (in each locale)
   - **Answer:** "It depends on your path..." (in each locale)
   - **Category:** `money`
   - **Audience:** `candidate` or `b2b` or `both`
   - **Published:** ✓
   - **Order:** 1, 2, 3, ...

These will be available in the `/api/faqs` endpoint and can be edited by staff without a redeploy.

## Step 8: Deploy to Vercel

1. Push your code to GitHub / GitLab / Bitbucket
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your repo
4. Add environment variables (from `.env.local`):
   - `DATABASE_URL` (Neon pooled)
   - `PAYLOAD_SECRET`
   - `NEXT_PUBLIC_SERVER_URL` (your Vercel domain)
   - `STAFF_WEBHOOK_URL` (your Slack webhook)

5. Deploy

Vercel will run `npm run build` which triggers:
- `payload build` (compiles the admin UI)
- `next build` (compiles the Next.js app)

On first deploy, Payload will initialize the database automatically.

## Step 9: Test the Widget

1. Go to http://localhost:3000 (or your Vercel URL)
2. After 8 seconds, a chat button should appear in the bottom-right corner
3. Click it, answer the questions
4. When you enter a phone number, check:
   - **Payload admin** → **Leads** / **Business Inquiries** → a new record appears
   - **Slack** → a notification appears with the lead details

## Step 10: Customize

### Change the Opening Greeting

Edit `src/lib/chat-i18n.ts`:

```ts
welcome: 'Assalamu Alaikum / Hello, welcome 👋'
```

### Change the Widget Colors

In `src/app/layout.tsx`:

```tsx
<ChatWidget
  primaryColor="#ff6b6b"  // red instead of indigo
  ...
/>
```

Or in Payload admin → **Widget settings** → **Primary Color**.

### Add a New Branch to the Flow

1. Edit `src/lib/chat-flows/candidate.ts` or `b2b.ts`
2. Add new nodes and questions
3. Add i18n keys to `src/lib/chat-i18n.ts`
4. Restart the dev server

No recompile needed if you're just editing i18n keys.

### Translate to a New Language

1. Add the locale to `src/lib/chat-i18n.ts` as a new `Dict`
2. Add it to `payload.config.ts` locales array
3. Register it in `SUPPORTED_LOCALES` in `chat-i18n.ts`
4. Translate all the keys
5. Restart

## Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` is correct and pooled (contains `?sslmode=require`)
- Verify Neon project is active
- Try: `psql $DATABASE_URL -c "SELECT 1"` to test the connection

### "Cannot find @payload-config"
- Make sure `payload.config.ts` is in the project root
- Check `tsconfig.json` has `"@payload-config": ["./payload.config.ts"]` in paths

### "Widget not appearing"
- Check browser console for errors
- Verify `<ChatWidget />` is in `src/app/layout.tsx`
- Check that the component is using `'use client'` directive
- Verify Tailwind CSS is working (check for `.dark` class in HTML)

### "Slack notification not received"
- Check `STAFF_WEBHOOK_URL` is correct
- Verify the webhook is for the right Slack channel
- Check Slack app permissions
- Look at server logs for `[notify]` messages

## Next Steps

1. **Edit collection fields** in Payload admin to match your exact needs (add country, region, etc.)
2. **Translate remaining strings** to Bangla / Japanese
3. **Connect email notifications** (Resend or SES) — see `src/lib/intake/notify.ts`
4. **Add CMS-sourced FAQ answers** — point the `faq.*` nodes at the `/api/faqs` endpoint instead of `chat-i18n.ts`
5. **Add rate limiting** at the edge (Vercel Middleware or Cloudflare Workers)
6. **Track conversion funnel** in PostHog or Google Analytics (hooks + `track()` utility ready to go)

---

**Questions?** Check the README.md, the code comments, or the Payload docs at [payloadcms.com](https://payloadcms.com).
