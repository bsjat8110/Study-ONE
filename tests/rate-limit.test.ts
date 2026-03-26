import test from 'node:test'
import assert from 'node:assert/strict'

import { getIP, rateLimit, resetRateLimitStore } from '../lib/rate-limit'

test('rateLimit blocks requests after limit is reached', () => {
  resetRateLimitStore()

  const first = rateLimit('login:test@example.com', { limit: 2, windowSec: 60 })
  const second = rateLimit('login:test@example.com', { limit: 2, windowSec: 60 })
  const third = rateLimit('login:test@example.com', { limit: 2, windowSec: 60 })

  assert.equal(first.success, true)
  assert.equal(second.success, true)
  assert.equal(third.success, false)
})

test('getIP prefers x-forwarded-for header', () => {
  const req = new Request('http://localhost/test', {
    headers: {
      'x-forwarded-for': '203.0.113.10, 10.0.0.1',
      'x-real-ip': '10.0.0.2',
    },
  })

  assert.equal(getIP(req), '203.0.113.10')
})
