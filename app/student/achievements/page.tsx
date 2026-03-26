import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Achievements' }

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import AchievementsClient from './AchievementsClient'

export default async function StudentAchievements() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as import('@/types').SessionUser
  const userId = user.id
  if (!userId) redirect('/login')

  let achievements: { id: string; title: string; description: string | null; earnedAt: Date }[] = []
  try {
    achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' }
    })
  } catch { /* DB connectivity issue */ }

  return <AchievementsClient achievements={achievements} />
}
