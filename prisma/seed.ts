import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Institute
  const institute = await prisma.institute.upsert({
    where: { email: 'admin@studyone.com' },
    update: {},
    create: {
      name: 'Quantum Academy',
      email: 'admin@studyone.com',
      plan: 'PRO',
      users: {
        create: {
          name: 'Admin User',
          email: 'admin@studyone.com',
          password: hashedPassword,
          role: 'INSTITUTE_ADMIN',
        }
      }
    }
  })

  // Create Student
  const student = await prisma.user.upsert({
    where: { email: 'student@studyone.com' },
    update: {},
    create: {
      name: 'Jane Student',
      email: 'student@studyone.com',
      password: hashedPassword,
      role: 'STUDENT',
      instituteId: institute.id
    }
  })

  console.log('Seed data created successfully!')
  console.log('Institute Admin: admin@studyone.com / password123')
  console.log('Student: student@studyone.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
