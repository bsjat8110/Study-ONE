import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Settings' }

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'
import prisma from '@/lib/prisma'

export default async function InstituteSettings() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as import('@/types').SessionUser
  if (!user.instituteId) redirect('/login')

  const instituteAdmin = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, phone: true }
  })

  if (!instituteAdmin) redirect('/login')

  return <SettingsClient user={instituteAdmin} />
}
