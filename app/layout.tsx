import type { Metadata } from 'next'
import './globals.css'
import Popup from '@/components/Popup.component'
import { Analytics } from '@vercel/analytics/react'
import { PHProvider } from './providers'
import dynamic from 'next/dynamic'

const metadata: Metadata = {
  title: 'Orderly Ghana',
  description: 'Orderly - The premier Ghanaian digital storefront solution.',
}

const PostHogPageView = dynamic(() => import('./utils/frontend/PostHogPageView'), {
  ssr: false,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <PHProvider>
        <body>
          <Popup />
          <PostHogPageView />
          {children}
          <Analytics />
        </body>
      </PHProvider>
    </html>
  )
}
