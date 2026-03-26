import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { rateLimit, getIP } from '@/lib/rate-limit'
import { withDbRetry } from '@/lib/db-retry'

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials, request) {
        const parsedCredentials = z
          .object({
            email: z.string().trim().email().transform((value) => value.toLowerCase()),
            password: z.string().min(6).max(72),
          })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const ip = getIP(request)
          const loginRateLimit = rateLimit(`login:${ip}:${email}`, { limit: 10, windowSec: 900 })
          if (!loginRateLimit.success) return null

          const user = await withDbRetry(() => prisma.user.findUnique({ where: { email } }))
          if (!user || !user.isActive) return null
          
          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            instituteId: user.instituteId
          }
        }

        return null
      },
    }),
  ],
})
