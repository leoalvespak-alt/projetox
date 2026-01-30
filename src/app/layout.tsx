import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#002B49',
}

export const metadata: Metadata = {
  title: 'Portal Veritas - Uninassau',
  description: 'Sistema Oficial de Validação de Diplomas Digitais da Uninassau.',
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json', // Placeholder for PWA manifest
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Veritas Portal',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-[#002B49] text-white min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  )
}
