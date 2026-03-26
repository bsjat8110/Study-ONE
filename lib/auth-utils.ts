import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { SessionUser } from '@/types'
import { jsonNoStore } from '@/lib/http'

export async function requireSession(): Promise<SessionUser | NextResponse> {
  const session = await auth()
  if (!session?.user) {
    return jsonNoStore({ error: 'Unauthorized' }, { status: 401 })
  }
  return session.user as SessionUser
}

export async function requireInstituteAdmin(): Promise<SessionUser | NextResponse> {
  const session = await auth()
  if (!session?.user) {
    return jsonNoStore({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = session.user as SessionUser
  if (user.role !== 'INSTITUTE_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return jsonNoStore({ error: 'Forbidden' }, { status: 403 })
  }
  if (!user.instituteId) {
    return jsonNoStore({ error: 'No institute associated' }, { status: 403 })
  }
  return user
}

export async function requireStudent(): Promise<SessionUser | NextResponse> {
  const session = await auth()
  if (!session?.user) {
    return jsonNoStore({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = session.user as SessionUser
  if (user.role !== 'STUDENT') {
    return jsonNoStore({ error: 'Forbidden' }, { status: 403 })
  }
  return user
}

export function isNextResponse(val: unknown): val is NextResponse {
  return val instanceof NextResponse
}
