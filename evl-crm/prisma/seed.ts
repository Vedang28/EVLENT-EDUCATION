import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('Admin created: admin / admin123')

  // Create tutors
  const tutorPassword = await bcrypt.hash('tutor123', 10)

  const john = await prisma.tutor.upsert({
    where: { email: 'john@evleducation.com' },
    update: {},
    create: {
      fullName: 'John Smith',
      email: 'john@evleducation.com',
      phone: '+44 7700 900001',
      tutorId: 'TUT-001',
      status: 'ACTIVE',
      user: {
        create: { username: 'john', password: tutorPassword, role: 'TUTOR' },
      },
    },
  })

  const sarah = await prisma.tutor.upsert({
    where: { email: 'sarah@evleducation.com' },
    update: {},
    create: {
      fullName: 'Sarah Johnson',
      email: 'sarah@evleducation.com',
      phone: '+44 7700 900002',
      tutorId: 'TUT-002',
      status: 'ACTIVE',
      user: {
        create: { username: 'sarah', password: tutorPassword, role: 'TUTOR' },
      },
    },
  })
  console.log('Tutors created: john / tutor123, sarah / tutor123')

  // Set availability
  const johnAvailability = [
    { dayOfWeek: 'MONDAY' as const, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'TUESDAY' as const, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'WEDNESDAY' as const, startTime: '10:00', endTime: '18:00' },
    { dayOfWeek: 'THURSDAY' as const, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'FRIDAY' as const, startTime: '09:00', endTime: '15:00' },
  ]

  for (const slot of johnAvailability) {
    await prisma.tutorAvailability.upsert({
      where: { tutorId_dayOfWeek: { tutorId: john.id, dayOfWeek: slot.dayOfWeek } },
      update: slot,
      create: { tutorId: john.id, ...slot },
    })
  }

  const sarahAvailability = [
    { dayOfWeek: 'MONDAY' as const, startTime: '13:00', endTime: '20:00' },
    { dayOfWeek: 'TUESDAY' as const, startTime: '13:00', endTime: '20:00' },
    { dayOfWeek: 'WEDNESDAY' as const, startTime: '13:00', endTime: '20:00' },
    { dayOfWeek: 'THURSDAY' as const, startTime: '13:00', endTime: '20:00' },
    { dayOfWeek: 'SATURDAY' as const, startTime: '09:00', endTime: '14:00' },
  ]

  for (const slot of sarahAvailability) {
    await prisma.tutorAvailability.upsert({
      where: { tutorId_dayOfWeek: { tutorId: sarah.id, dayOfWeek: slot.dayOfWeek } },
      update: slot,
      create: { tutorId: sarah.id, ...slot },
    })
  }
  console.log('Availability set')

  // Create students
  const studentData = [
    { studentName: 'Emma Wilson', parentName: 'David Wilson', parentContact: '+44 7700 100001', color: '#3b82f6', tutorId: john.id },
    { studentName: 'Oliver Brown', parentName: 'Rachel Brown', parentContact: '+44 7700 100002', color: '#ef4444', tutorId: john.id },
    { studentName: 'Amelia Davis', parentName: 'Mark Davis', parentContact: '+44 7700 100003', color: '#10b981', tutorId: sarah.id },
    { studentName: 'Harry Taylor', parentName: 'Susan Taylor', parentContact: '+44 7700 100004', color: '#f59e0b', tutorId: sarah.id },
    { studentName: 'Isla Thompson', parentName: 'James Thompson', parentContact: '+44 7700 100005', color: '#8b5cf6', tutorId: john.id },
  ]

  const students: Array<{ id: number; tutorId: number | null }> = []
  for (const s of studentData) {
    const student = await prisma.student.create({ data: s })
    students.push(student)
  }
  console.log('Students created')

  // Schedule classes
  const classData = [
    { studentId: students[0].id, tutorId: john.id, dayOfWeek: 'MONDAY' as const, startTime: '10:00', endTime: '11:00' },
    { studentId: students[0].id, tutorId: john.id, dayOfWeek: 'WEDNESDAY' as const, startTime: '10:00', endTime: '11:00' },
    { studentId: students[1].id, tutorId: john.id, dayOfWeek: 'MONDAY' as const, startTime: '14:00', endTime: '15:00' },
    { studentId: students[1].id, tutorId: john.id, dayOfWeek: 'THURSDAY' as const, startTime: '10:00', endTime: '11:00' },
    { studentId: students[4].id, tutorId: john.id, dayOfWeek: 'TUESDAY' as const, startTime: '11:00', endTime: '12:00' },
    { studentId: students[2].id, tutorId: sarah.id, dayOfWeek: 'MONDAY' as const, startTime: '15:00', endTime: '16:00' },
    { studentId: students[2].id, tutorId: sarah.id, dayOfWeek: 'WEDNESDAY' as const, startTime: '14:00', endTime: '15:00' },
    { studentId: students[3].id, tutorId: sarah.id, dayOfWeek: 'TUESDAY' as const, startTime: '16:00', endTime: '17:00' },
    { studentId: students[3].id, tutorId: sarah.id, dayOfWeek: 'THURSDAY' as const, startTime: '15:00', endTime: '16:00' },
    { studentId: students[3].id, tutorId: sarah.id, dayOfWeek: 'SATURDAY' as const, startTime: '10:00', endTime: '11:00' },
  ]

  for (const c of classData) {
    await prisma.class.create({ data: c })
  }
  console.log('Classes scheduled')

  console.log('\nSeed complete!')
  console.log('Login credentials:')
  console.log('  Admin:  admin / admin123')
  console.log('  Tutor:  john / tutor123')
  console.log('  Tutor:  sarah / tutor123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
