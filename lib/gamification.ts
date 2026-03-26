import prisma from './prisma';
import { Achievement } from '@prisma/client';

export const ACTIVITIES = {
  TEST_COMPLETE: { points: 50, type: 'TEST_ACE' },
  CHAPTER_COMPLETE: { points: 10, type: 'CHAPTER_FINISH' },
  COURSE_COMPLETE: { points: 100, type: 'COURSE_MASTER' },
  STUDY_STREAK: { points: 20, type: 'STREAK' },
  AI_CHAT_ASK: { points: 2, type: 'AI_ENGAGEMENT' },
};

export async function awardPoints(userId: string, activity: keyof typeof ACTIVITIES) {
  const { points } = ACTIVITIES[activity];
  
  await prisma.user.update({
    where: { id: userId },
    data: { points: { increment: points } },
  });

  return points;
}

export async function checkAndAwardBadge(userId: string, title: string, description: string, icon: string, type: string, rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' = 'COMMON') {
  // Check if already has this badge
  const existing = await prisma.achievement.findFirst({
    where: { userId, title },
  });

  if (existing) return null;

  const achievement = await prisma.achievement.create({
    data: {
      userId,
      title,
      description,
      icon,
      type,
      rarity,
    },
  });

  return achievement;
}
