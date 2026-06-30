import type { Metadata, Viewport } from 'next'
import '../globals.css'
import { ChatWidget } from '@/components/chat/ChatWidget'

export const metadata: Metadata = {
  title: 'Sadiatec',
  description: 'Study, work & business — Japan',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Meta tags */}
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        {children}

        {/* Chat Widget */}
        <ChatWidget
          openDelayMs={8000}
          primaryColor="#4f46e5"
        />
      </body>
    </html>
  )
}
