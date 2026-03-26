export type UserRole = 'STUDENT' | 'INSTITUTE_ADMIN' | 'SUPER_ADMIN'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  instituteId?: string | null
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  total?: number
}

export interface StudentListItem {
  id: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
  enrollmentCount: number
  avgScore: number | null
}

export interface CourseListItem {
  id: string
  title: string
  subject: string
  totalChapters: number
  isActive: boolean
  enrollmentCount: number
  createdAt: string
}

export interface TestListItem {
  id: string
  title: string
  subject: string
  duration: number
  totalMarks: number
  passingMarks: number
  scheduledAt: string
  isActive: boolean
  resultCount: number
}

export interface PaymentListItem {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  method: string | null
  description: string | null
  createdAt: string
  user: { name: string; email: string }
}

export interface AnalyticsData {
  totalStudents: number
  activeStudents: number
  totalCourses: number
  totalRevenue: number
  avgPassRate: number
  monthlyRevenue: { month: string; revenue: number }[]
  topStudents: { name: string; avgScore: number }[]
}

export interface EnrollmentWithCourse {
  id: string
  progress: number
  lastStudied: string
  course: {
    id: string
    title: string
    subject: string
    totalChapters: number
  }
}

export interface TestResultWithTest {
  id: string
  score: number
  timeTaken: number
  submittedAt: string
  test: {
    id: string
    title: string
    subject: string
    totalMarks: number
    passingMarks: number
    scheduledAt: string
  }
}
