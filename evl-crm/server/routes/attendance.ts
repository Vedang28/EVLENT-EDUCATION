import { Router, Request, Response } from 'express'
import prisma from '../db.js'
import { authenticate, requireAdmin } from '../middleware.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req: Request, res: Response) => {
  const { classId, studentId, tutorId: filterTutorId, from, to } = req.query

  const where: any = {}

  if (req.user!.role === 'TUTOR') {
    where.tutorId = req.user!.tutorId
  } else if (filterTutorId) {
    where.tutorId = Number(filterTutorId)
  }

  if (classId) where.classId = Number(classId)
  if (studentId) where.studentId = Number(studentId)

  if (from || to) {
    where.date = {}
    if (from) where.date.gte = new Date(from as string)
    if (to) where.date.lte = new Date(to as string)
  }

  const records = await prisma.attendance.findMany({
    where,
    include: {
      student: { select: { studentName: true } },
      tutor: { select: { fullName: true } },
      class: { select: { dayOfWeek: true, startTime: true, endTime: true } },
    },
    orderBy: { date: 'desc' },
  })
  res.json(records)
})

router.post('/', async (req: Request, res: Response) => {
  const { classId, date, status, notes } = req.body

  if (!classId || !date || !status) {
    res.status(400).json({ error: 'Class, date, and status are required' })
    return
  }

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: { student: true },
  })

  if (!cls) {
    res.status(404).json({ error: 'Class not found' })
    return
  }

  if (req.user!.role === 'TUTOR' && cls.tutorId !== req.user!.tutorId) {
    res.status(403).json({ error: 'You can only log attendance for your own classes' })
    return
  }

  const record = await prisma.attendance.upsert({
    where: { classId_date: { classId, date: new Date(date) } },
    create: {
      classId,
      studentId: cls.studentId,
      tutorId: cls.tutorId,
      date: new Date(date),
      scheduledStart: cls.startTime,
      scheduledEnd: cls.endTime,
      status: status as any,
      notes: notes || null,
    },
    update: {
      status: status as any,
      notes: notes !== undefined ? notes : undefined,
    },
    include: {
      student: { select: { studentName: true } },
      tutor: { select: { fullName: true } },
      class: { select: { dayOfWeek: true } },
    },
  })
  res.json(record)
})

router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { status, notes } = req.body

  const existing = await prisma.attendance.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Attendance record not found' })
    return
  }

  if (req.user!.role === 'TUTOR' && existing.tutorId !== req.user!.tutorId) {
    res.status(403).json({ error: 'You can only update your own attendance records' })
    return
  }

  const record = await prisma.attendance.update({
    where: { id },
    data: {
      status: status || undefined,
      notes: notes !== undefined ? notes : undefined,
    },
    include: {
      student: { select: { studentName: true } },
      tutor: { select: { fullName: true } },
    },
  })
  res.json(record)
})

export default router
