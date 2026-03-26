import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import prisma from '@/lib/prisma'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { courseId, amount } = await req.json()

    // 1. Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { institute: true }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // 2. Create Razorpay Order
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: session.user.id,
        courseId: courseId,
        instituteId: course.instituteId
      }
    }

    const order = await razorpay.orders.create(options)

    // 3. Log pending payment in DB
    await prisma.payment.create({
      data: {
        amount: amount,
        currency: 'INR',
        status: 'PENDING',
        transactionId: order.id,
        userId: session.user.id,
        instituteId: course.instituteId,
        description: `Enrollment for ${course.title}`
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Razorpay Order Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
