import type { Metadata } from 'next'
import './globals.css'
import Popup from '@/components/Popup.component'

const metadata: Metadata = {
  title: 'Orderly Ghana',
  description: 'Orderly - The premier Ghanaian digital storefront solution.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.cdnfonts.com/css/mona-sans" rel="stylesheet" /> 
      </head>
      <body>
        <Popup />
        {children}
      </body>
    </html>
  )
}
