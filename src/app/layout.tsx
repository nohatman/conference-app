import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'fwdLive! 2025 - Conference Management',
  description: 'Real-time conference management platform for fwdLive! GOING FOR GROWTH 2025',
  manifest: '/manifest.json',
  themeColor: '#e23f2c',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'fwdLive! 2025',
  },
  openGraph: {
    title: 'fwdLive! 2025',
    description: 'Real-time conference management platform',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'fwdLive! 2025',
    description: 'Real-time conference management platform',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#e23f2c" />
      </head>
      <body>{children}</body>
    </html>
  )
}
