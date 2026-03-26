import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      courseId 
    } = await req.json()

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      // 2. Update Payment Status & Enroll Student
      await prisma.$transaction([
        prisma.payment.updateMany({
          where: { transactionId: razorpay_order_id },
          data: { status: 'COMPLETED', method: 'razorpay' }
        }),
        prisma.enrollment.upsert({
          where: {
            userId_courseId: {
              userId: session.user.id!,
              courseId: courseId
            }
          },
          update: { lastStudied: new Date() },
          create: {
            userId: session.user.id!,
            courseId: courseId
          }
        })
      ])

      return NextResponse.json({ message: 'Enrollment successful' })
    } else {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } catch (error) {
    console.error('Payment Verification Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
