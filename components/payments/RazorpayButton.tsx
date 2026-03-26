'use client'

import { useState } from 'react'
import { CreditCard, Loader2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  courseId: string
  amount: number
  courseName: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function RazorpayButton({ courseId, amount, courseName }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePayment = async () => {
    setLoading(true)
    try {
      // 1. Create order on server
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, amount }),
      })
      const order = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'Study-ONE',
        description: `Enrollment for ${courseName}`,
        order_id: order.id,
        handler: async function (response: any) {
          // 2. Verify payment on server
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              courseId
            }),
          })

          if (verifyRes.ok) {
            router.push('/student/dashboard?success=true')
            router.refresh()
          } else {
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#22d3ee',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full relative group overflow-hidden bg-primary text-surface-dim font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          Enroll Now (₹{amount})
          <Sparkles className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </>
      )}
    </button>
  )
}
