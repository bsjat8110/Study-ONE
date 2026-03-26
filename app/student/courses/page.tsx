import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'My Courses' }

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import StudentCoursesClient from './StudentCoursesClient'

export default async function StudentCourses() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as import('@/types').SessionUser
  if (!user.id) redirect('/login')
  const instituteId = user.instituteId ?? null

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    orderBy: { lastStudied: 'desc' },
    include: {
      course: { select: { id: true, title: true, subject: true, totalChapters: true } }
    }
  })

  const enrolledIds = enrollments.map(e => e.courseId)

  const availableCourses = instituteId ? await prisma.course.findMany({
    where: {
      instituteId,
      isActive: true,
      id: { notIn: enrolledIds },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, subject: true, totalChapters: true }
  }) : []

  const enrolled = enrollments.map(e => ({
    enrollmentId: e.id,
    progress: e.progress,
    courseId: e.courseId,
    title: e.course.title,
    subject: e.course.subject,
    totalChapters: e.course.totalChapters,
  }))

  return (
    <StudentCoursesClient
      initialEnrolled={enrolled}
      initialAvailable={availableCourses}
    />
  )
}
