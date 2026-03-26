import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Courses' }

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import CoursesClient from './CoursesClient'

export default async function InstituteCourses() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as import('@/types').SessionUser
  if (!user.instituteId) redirect('/login')

  const courses = await prisma.course.findMany({
    where: { instituteId: user.instituteId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { enrollments: true } } }
  })

  const data = courses.map(c => ({
    id: c.id,
    title: c.title,
    subject: c.subject,
    totalChapters: c.totalChapters,
    isActive: c.isActive,
    enrollmentCount: c._count.enrollments,
    createdAt: c.createdAt.toISOString(),
  }))

  return <CoursesClient initialCourses={data} />
}
