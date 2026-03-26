import { z } from 'zod'

export const emailSchema = z.string().trim().email().transform((value) => value.toLowerCase())
export const passwordSchema = z.string().min(6).max(72)
export const nameSchema = z.string().trim().min(2).max(100)
export const instituteNameSchema = z.string().trim().min(2).max(120)
export const phoneSchema = z.string().trim().max(32)

export const registerStudentSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const registerInstituteSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  instituteName: instituteNameSchema,
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
})

export const createPaymentOrderSchema = z.object({
  amount: z.number().finite().min(100).max(100000000),
  description: z.string().trim().max(200).optional(),
})

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

export const studentProfileUpdateSchema = z.object({
  name: nameSchema.optional(),
  phone: z.union([phoneSchema, z.literal(''), z.null()]).optional(),
}).refine((data) => data.name !== undefined || data.phone !== undefined, {
  message: 'No fields to update',
})

export const instituteSettingsSchema = z.object({
  name: nameSchema,
  phone: z.union([phoneSchema, z.literal(''), z.null()]).optional(),
})

export const createCourseSchema = z.object({
  title: z.string().trim().min(2).max(160),
  subject: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  totalChapters: z.coerce.number().int().min(0).max(10000).optional(),
  isActive: z.boolean().optional(),
})

export const updateCourseSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  subject: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  totalChapters: z.coerce.number().int().min(0).max(10000).optional(),
  isActive: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'No fields to update',
})

export const createTestSchema = z.object({
  title: z.string().trim().min(2).max(160),
  subject: z.string().trim().min(2).max(120),
  duration: z.coerce.number().int().min(1).max(1440).optional(),
  totalMarks: z.coerce.number().int().min(1).max(10000).optional(),
  passingMarks: z.coerce.number().int().min(0).max(10000).optional(),
  scheduledAt: z.string().datetime(),
}).refine((data) => {
  if (data.totalMarks === undefined || data.passingMarks === undefined) return true
  return data.passingMarks <= data.totalMarks
}, {
  message: 'passingMarks cannot exceed totalMarks',
  path: ['passingMarks'],
})

export const updateTestSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  subject: z.string().trim().min(2).max(120).optional(),
  duration: z.coerce.number().int().min(1).max(1440).optional(),
  totalMarks: z.coerce.number().int().min(1).max(10000).optional(),
  passingMarks: z.coerce.number().int().min(0).max(10000).optional(),
  isActive: z.boolean().optional(),
  scheduledAt: z.string().datetime().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'No fields to update',
}).refine((data) => {
  if (data.totalMarks === undefined || data.passingMarks === undefined) return true
  return data.passingMarks <= data.totalMarks
}, {
  message: 'passingMarks cannot exceed totalMarks',
  path: ['passingMarks'],
})

export const updateStudentSchema = z.object({
  isActive: z.boolean().optional(),
  name: nameSchema.optional(),
  phone: z.union([phoneSchema, z.literal(''), z.null()]).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'No fields to update',
})

export const enrollmentRequestSchema = z.object({
  courseId: z.string().min(1),
})

export const testResultSubmissionSchema = z.object({
  testId: z.string().min(1),
  score: z.coerce.number().finite().min(0),
  timeTaken: z.coerce.number().finite().min(0),
})

export function normalizeOptionalPhone(value: string | null | undefined) {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  return value.trim()
}
