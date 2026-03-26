import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createCourseSchema,
  createPaymentOrderSchema,
  createTestSchema,
  registerStudentSchema,
  updateStudentSchema,
} from '../lib/validation'

test('registerStudentSchema normalizes email', () => {
  const parsed = registerStudentSchema.parse({
    name: 'Jane Student',
    email: '  Jane@Example.COM ',
    password: 'password123',
  })

  assert.equal(parsed.email, 'jane@example.com')
})

test('createPaymentOrderSchema rejects out-of-range amounts', () => {
  const parsed = createPaymentOrderSchema.safeParse({
    amount: 99,
    description: 'Fee',
  })

  assert.equal(parsed.success, false)
})

test('createCourseSchema accepts valid numeric chapter count', () => {
  const parsed = createCourseSchema.parse({
    title: 'Physics Mastery',
    subject: 'Physics',
    totalChapters: '12',
    isActive: true,
  })

  assert.equal(parsed.totalChapters, 12)
})

test('createTestSchema rejects passing marks above total marks', () => {
  const parsed = createTestSchema.safeParse({
    title: 'Weekly Test',
    subject: 'Math',
    totalMarks: 50,
    passingMarks: 60,
    scheduledAt: '2026-03-30T10:00:00.000Z',
  })

  assert.equal(parsed.success, false)
})

test('updateStudentSchema accepts phone reset', () => {
  const parsed = updateStudentSchema.parse({
    phone: '',
  })

  assert.equal(parsed.phone, '')
})
