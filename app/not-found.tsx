'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4">
      <h2 className="text-4xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="text-neutral-400 mb-8 max-w-md text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full font-medium transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}
