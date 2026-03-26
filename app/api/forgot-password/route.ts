import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { SignJWT } from 'jose'
import { rateLimit, getIP } from '@/lib/rate-limit'
import { forgotPasswordSchema } from '@/lib/validation'
import { jsonNoStore } from '@/lib/http'
import { resolveAppBaseUrl } from '@/lib/runtime-config'

function getResetSecret() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured')
  }
  return new TextEncoder().encode(secret)
}

export async function POST(req: NextRequest) {
  // Rate limit: 5 password reset requests per IP per 15 minutes
  const ip = getIP(req)
  const rl = rateLimit(`forgot-pw:${ip}`, { limit: 5, windowSec: 900 })
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  try {
    const parsedBody = forgotPasswordSchema.safeParse(await req.json())
    if (!parsedBody.success) {
      return jsonNoStore({ error: 'Email is required' }, { status: 400 })
    }
    const { email } = parsedBody.data

    // Always return 200 — never reveal if email exists (security best practice)
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    })

    if (user) {
      const secret = getResetSecret()

      // Generate a signed JWT that expires in 1 hour
      const token = await new SignJWT({ sub: user.id, email: user.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret)

      const resetUrl = new URL(`/reset-password?token=${encodeURIComponent(token)}`, resolveAppBaseUrl()).toString()

      // If Resend API key is configured — send real email
      if (process.env.RESEND_API_KEY) {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Study-ONE <noreply@studyone.live>',
            to: [user.email],
            subject: 'Reset your Study-ONE password',
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#030712;color:#fff;border-radius:16px;">
                <h2 style="color:#22d3ee;">Study-ONE Password Reset</h2>
                <p>Hi ${user.name},</p>
                <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
                <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:linear-gradient(90deg,#22d3ee,#818cf8);color:#030712;font-weight:bold;text-decoration:none;border-radius:12px;">
                  Reset Password
                </a>
                <p style="color:#6b7280;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
              </div>
            `,
          }),
        })

        if (!resendResponse.ok) {
          console.error('Forgot password email delivery failed:', await resendResponse.text())
        }
      } else if (process.env.NODE_ENV !== 'production') {
        // Development only: log the reset link locally when email delivery is not configured.
        console.log(`\n[FORGOT PASSWORD] Reset link for ${user.email}:\n${resetUrl}\n`)
      }
    }

    return jsonNoStore({
      message: 'If an account exists for that email, a reset link has been sent.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return jsonNoStore({ error: 'Internal server error' }, { status: 500 })
  }
}
