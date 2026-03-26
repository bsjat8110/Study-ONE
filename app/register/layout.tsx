import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join Study-ONE — create your student or institute account and start learning today.',
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
