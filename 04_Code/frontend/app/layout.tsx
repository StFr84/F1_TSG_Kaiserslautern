import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'TSG Connect',
  description: 'Vereinsapp TSG 1861 Kaiserslautern',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <meta name="theme-color" content="#9B1C2E" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </head>
      <body className="bg-white max-w-md mx-auto">
        <main className="pb-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
