import { Router, Request, Response } from 'express'
import prisma from '../db.js'
import { authenticate } from '../middleware.js'

const router = Router()
router.use(authenticate)

const DAY_ORDER = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const

function getTodayDay(): string {
  return DAY_ORDER[new Date().getDay()]
}

router.get('/stats', async (req: Request, res: Response) => {
  if (req.user!.role === 'ADMIN') {
    const [tutorCount, studentCount, classCount, attendanceCount] = await Promise.all([
      prisma.tutor.count(),
      prisma.student.count(),
      prisma.class.count(),
      prisma.attendance.count(),
    ])
    res.json({ tutorCount, studentCount, classCount, attendanceCount })
  } else {
    const tutorId = req.user!.tutorId!
    const [studentCount, classCount, attendanceCount] = await Promise.all([
      prisma.student.count({ where: { tutorId } }),
      prisma.class.count({ where: { tutorId } }),
      prisma.attendance.count({ where: { tutorId } }),
    ])
    res.json({ studentCount, classCount, attendanceCount })
  }
})

router.get('/today', async (req: Request, res: Response) => {
  const today = getTodayDay()
  const where: any = { dayOfWeek: today }

  if (req.user!.role === 'TUTOR') {
    where.tutorId = req.user!.tutorId
  }

  const classes = await prisma.class.findMany({
    where,
    include: {
      student: { select: { studentName: true, color: true } },
      tutor: { select: { fullName: true } },
    },
    orderBy: { startTime: 'asc' },
  })

  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      date: todayDate,
      ...(req.user!.role === 'TUTOR' ? { tutorId: req.user!.tutorId } : {}),
    },
  })

  const attendanceMap = new Map(attendanceRecords.map(a => [a.classId, a]))

  const result = classes.map(cls => ({
    ...cls,
    attendance: attendanceMap.get(cls.id) || null,
  }))

  res.json(result)
})

router.get('/upcoming', async (req: Request, res: Response) => {
  const today = getTodayDay()
  const todayIndex = DAY_ORDER.indexOf(today as any)

  const where: any = {}
  if (req.user!.role === 'TUTOR') {
    where.tutorId = req.user!.tutorId
  }

  const allClasses = await prisma.class.findMany({
    where,
    include: {
      student: { select: { studentName: true, color: true } },
      tutor: { select: { fullName: true } },
    },
  })

  const upcoming = allClasses
    .map(cls => {
      const dayIndex = DAY_ORDER.indexOf(cls.dayOfWeek as any)
      let daysUntil = dayIndex - todayIndex
      if (daysUntil <= 0) daysUntil += 7
      return { ...cls, daysUntil }
    })
    .sort((a, b) => a.daysUntil - b.daysUntil || a.startTime.localeCompare(b.startTime))
    .slice(0, 10)

  res.json(upcoming)
})

export default router
