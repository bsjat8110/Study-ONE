import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from "@/components/providers/session-provider";
import { getMetadataBase } from '@/lib/runtime-config'
import ClientLayout from '@/components/ClientLayout'
import type { Metadata } from 'next'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Study-ONE | Intelligent Learning OS',
  description: 'Connected academic platform for institutes and students.',
  metadataBase: new URL(getMetadataBase()),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased min-h-screen bg-surface-dim text-white selection:bg-primary selection:text-surface-dim`}>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
