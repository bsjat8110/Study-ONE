import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Study-ONE account to access your dashboard, courses, and AI tutor.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
