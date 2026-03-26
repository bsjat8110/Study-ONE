'use client'

import RazorpayButton from '@/components/payments/RazorpayButton'
import { CreditCard } from 'lucide-react'
import { useState } from 'react'

interface Props {
  name: string
  email: string
}

export default function PayFeeCard({ name, email }: Props) {
  const [paid, setPaid] = useState(false)

  return (
    <div className="glass-card p-6 rounded-2xl border-indigo-500/30 relative overflow-hidden">
      <div className="absolute right-0 bottom-0 w-28 h-28 bg-indigo-500/10 blur-[50px] pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-space-grotesk font-bold text-white">Pay Institute Fee</h3>
        </div>
        <p className="text-xs text-outline mb-4">Securely pay your monthly/quarterly fee via Razorpay.</p>

        {paid ? (
          <div className="text-emerald-400 font-bold text-sm">Payment recorded!</div>
        ) : (
          <button
            onClick={() => {
              // Simulate payment for now
              setTimeout(() => setPaid(true), 1000)
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:shadow-glow-md transition-all flex items-center justify-center gap-2"
          >
            Pay ₹999
          </button>
        )}
      </div>
    </div>
  )
}
