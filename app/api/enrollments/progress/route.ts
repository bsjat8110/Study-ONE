import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { awardPoints, checkAndAwardBadge } from '@/lib/gamification';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { enrollmentId, progress, isCompleted } = await req.json();

    const enrollment = await prisma.enrollment.update({
      where: { id: enrollmentId, userId: session.user.id },
      data: {
        progress,
        ...(isCompleted ? { completedAt: new Date() } : {}),
        lastStudied: new Date(),
      },
      include: { course: true },
    });

    // 1. Award points for progress
    if (isCompleted) {
      await awardPoints(session.user.id, 'COURSE_COMPLETE');
      await checkAndAwardBadge(
        session.user.id,
        `Master of ${enrollment.course.subject}`,
        `Completed the entire course: ${enrollment.course.title}`,
        '🎓',
        'COURSE_MASTER',
        'RARE'
      );
    } else {
      await awardPoints(session.user.id, 'CHAPTER_COMPLETE');
    }

    // 2. Check for "First Steps" badge
    await checkAndAwardBadge(
      session.user.id,
      'First Steps',
      'Completed your first study session',
      '🚀',
      'STUDY_START',
      'COMMON'
    );

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
