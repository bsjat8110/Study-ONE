import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import TestAttemptClient from './TestAttemptClient'

type TestAttemptPageProps = {
  params: Promise<{ id: string }>
}

export default async function TestAttemptPage({ params }: TestAttemptPageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const { id } = await params

  const test = await prisma.test.findFirst({
    where: { id, isActive: true },
    select: { id: true, title: true, subject: true, duration: true, totalMarks: true, passingMarks: true }
  })
  if (!test) notFound()

  return <TestAttemptClient test={test} />
}
