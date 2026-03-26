import type { NextAuthConfig, Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import type { SessionUser, UserRole } from './types'

type AuthUser = User & {
  role?: UserRole
  instituteId?: string | null
}

type AuthToken = JWT & {
  role?: UserRole
  instituteId?: string | null
}

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isStudentPage = nextUrl.pathname.startsWith('/student')
      const isInstitutePage = nextUrl.pathname.startsWith('/institute')
      const role = (auth?.user as import('./types').SessionUser)?.role

      if (isStudentPage) {
        if (!isLoggedIn) return false // Redirect to login
        if (role !== 'STUDENT') return Response.redirect(new URL('/login', nextUrl))
        return true
      }

      if (isInstitutePage) {
        if (!isLoggedIn) return false // Redirect to login
        if (role !== 'INSTITUTE_ADMIN' && role !== 'SUPER_ADMIN') {
          return Response.redirect(new URL('/student/dashboard', nextUrl))
        }
        return true
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        const u = user as AuthUser
        token.role = u.role
        token.instituteId = u.instituteId
      }
      return token
    },
    async session({ session, token }: { session: Session, token: AuthToken }) {
      if (token && session.user) {
        const sessionUser = session.user as Session['user'] & Partial<SessionUser>

        if (token.sub) {
          sessionUser.id = token.sub
        }

        if (token.role) {
          sessionUser.role = token.role
        }

        sessionUser.instituteId = (token.instituteId as string) || undefined
      }
      return session
    }
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
