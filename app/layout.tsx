import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
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
      <body>{children}</body>
    </html>
  )
}
