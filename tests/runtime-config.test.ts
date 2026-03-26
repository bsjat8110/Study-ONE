import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveAppBaseUrl, sanitizeCallbackPath } from '@/lib/runtime-config'

test('resolveAppBaseUrl prefers Vercel URL over localhost values in production', () => {
  const baseUrl = resolveAppBaseUrl({
    NODE_ENV: 'production',
    NEXTAUTH_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    VERCEL_URL: 'study-one.vercel.app',
  })

  assert.equal(baseUrl, 'https://study-one.vercel.app')
})

test('resolveAppBaseUrl keeps explicit public URL in production', () => {
  const baseUrl = resolveAppBaseUrl({
    NODE_ENV: 'production',
    NEXT_PUBLIC_APP_URL: 'https://studyone.live',
    NEXTAUTH_URL: 'https://studyone.live',
  })

  assert.equal(baseUrl, 'https://studyone.live')
})

test('sanitizeCallbackPath blocks external and protocol-relative callback URLs', () => {
  assert.equal(sanitizeCallbackPath('https://evil.example'), '/')
  assert.equal(sanitizeCallbackPath('//evil.example'), '/')
  assert.equal(sanitizeCallbackPath('/student/dashboard'), '/student/dashboard')
})
