import { Router, Request, Response } from 'express'
import prisma from '../db.js'
import { authenticate, requireAdmin } from '../middleware.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req: Request, res: Response) => {
  const where = req.user!.role === 'TUTOR'
    ? { tutorId: req.user!.tutorId }
    : {}

  const classes = await prisma.class.findMany({
    where,
    include: {
      student: { select: { studentName: true, color: true } },
      tutor: { select: { fullName: true } },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  })
  res.json(classes)
})

router.get('/:id', async (req: Request, res: Response) => {
  const cls = await prisma.class.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      student: true,
      tutor: { select: { fullName: true } },
    },
  })

  if (!cls) {
    res.status(404).json({ error: 'Class not found' })
    return
  }

  if (req.user!.role === 'TUTOR' && cls.tutorId !== req.user!.tutorId) {
    res.status(403).json({ error: 'Access denied' })
    return
  }

  res.json(cls)
})

router.post('/', requireAdmin, async (req: Request, res: Response) => {
  const { studentId, tutorId, dayOfWeek, startTime, endTime, notes } = req.body

  if (!studentId || !tutorId || !dayOfWeek || !startTime || !endTime) {
    res.status(400).json({ error: 'Student, tutor, day, start time, and end time are required' })
    return
  }

  if (startTime >= endTime) {
    res.status(400).json({ error: 'Start time must be before end time' })
    return
  }

  const tutor = await prisma.tutor.findUnique({ where: { id: tutorId } })
  if (!tutor) {
    res.status(400).json({ error: 'Tutor not found' })
    return
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) {
    res.status(400).json({ error: 'Student not found' })
    return
  }

  // Check tutor availability
  const availability = await prisma.tutorAvailability.findUnique({
    where: { tutorId_dayOfWeek: { tutorId, dayOfWeek } },
  })

  if (!availability) {
    res.status(400).json({ error: `Tutor is not available on ${dayOfWeek}` })
    return
  }

  if (startTime < availability.startTime || endTime > availability.endTime) {
    res.status(400).json({
      error: `Class time is outside tutor's availability (${availability.startTime} - ${availability.endTime})`,
    })
    return
  }

  // Check for overlapping classes
  const overlapping = await prisma.class.findFirst({
    where: {
      tutorId,
      dayOfWeek: dayOfWeek as any,
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  })

  if (overlapping) {
    res.status(409).json({ error: 'This time slot overlaps with another class for this tutor' })
    return
  }

  const cls = await prisma.class.create({
    data: {
      studentId,
      tutorId,
      dayOfWeek: dayOfWeek as any,
      startTime,
      endTime,
      notes: notes || null,
    },
    include: {
      student: { select: { studentName: true, color: true } },
      tutor: { select: { fullName: true } },
    },
  })
  res.status(201).json(cls)
})

router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { studentId, tutorId, dayOfWeek, startTime, endTime, notes } = req.body

  const existing = await prisma.class.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Class not found' })
    return
  }

  const finalTutorId = tutorId || existing.tutorId
  const finalDay = dayOfWeek || existing.dayOfWeek
  const finalStart = startTime || existing.startTime
  const finalEnd = endTime || existing.endTime

  if (finalStart >= finalEnd) {
    res.status(400).json({ error: 'Start time must be before end time' })
    return
  }

  // Check availability if tutor or day changed
  const availability = await prisma.tutorAvailability.findUnique({
    where: { tutorId_dayOfWeek: { tutorId: finalTutorId, dayOfWeek: finalDay } },
  })

  if (!availability) {
    res.status(400).json({ error: `Tutor is not available on ${finalDay}` })
    return
  }

  if (finalStart < availability.startTime || finalEnd > availability.endTime) {
    res.status(400).json({
      error: `Class time is outside tutor's availability (${availability.startTime} - ${availability.endTime})`,
    })
    return
  }

  // Check overlaps excluding this class
  const overlapping = await prisma.class.findFirst({
    where: {
      tutorId: finalTutorId,
      dayOfWeek: finalDay as any,
      id: { not: id },
      AND: [
        { startTime: { lt: finalEnd } },
        { endTime: { gt: finalStart } },
      ],
    },
  })

  if (overlapping) {
    res.status(409).json({ error: 'This time slot overlaps with another class for this tutor' })
    return
  }

  const cls = await prisma.class.update({
    where: { id },
    data: {
      studentId: studentId || undefined,
      tutorId: tutorId || undefined,
      dayOfWeek: dayOfWeek || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      notes: notes !== undefined ? notes : undefined,
    },
    include: {
      student: { select: { studentName: true, color: true } },
      tutor: { select: { fullName: true } },
    },
  })
  res.json(cls)
})

router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const existing = await prisma.class.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Class not found' })
    return
  }
  await prisma.class.delete({ where: { id } })
  res.json({ message: 'Class deleted' })
})

export default router
