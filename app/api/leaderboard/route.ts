import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const leaderboard = await prisma.user.findMany({
      where: { 
        role: 'STUDENT',
        isActive: true,
      },
      orderBy: { points: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        points: true,
      },
    });

    return NextResponse.json({ data: leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
