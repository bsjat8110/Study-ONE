import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Settings' }

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export default async function StudentSettings() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as import('@/types').SessionUser
  if (!user.id) redirect('/login')

  return (
    <SettingsClient
      initialName={user.name || ''}
      initialEmail={user.email || ''}
    />
  )
}
