import { Router, Request, Response } from 'express'
import prisma from '../db.js'
import { authenticate, requireAdmin } from '../middleware.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req: Request, res: Response) => {
  const where = req.user!.role === 'TUTOR'
    ? { tutorId: req.user!.tutorId }
    : {}

  const students = await prisma.student.findMany({
    where,
    include: {
      tutor: { select: { fullName: true, tutorId: true } },
      _count: { select: { classes: true } },
    },
    orderBy: { studentName: 'asc' },
  })
  res.json(students)
})

router.get('/:id', async (req: Request, res: Response) => {
  const student = await prisma.student.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      tutor: { select: { fullName: true, tutorId: true } },
      classes: { include: { tutor: { select: { fullName: true } } } },
    },
  })

  if (!student) {
    res.status(404).json({ error: 'Student not found' })
    return
  }

  if (req.user!.role === 'TUTOR' && student.tutorId !== req.user!.tutorId) {
    res.status(403).json({ error: 'Access denied' })
    return
  }

  res.json(student)
})

router.post('/', requireAdmin, async (req: Request, res: Response) => {
  const { studentName, parentName, parentContact, parentEmail, tutorId, notes, color } = req.body

  if (!studentName) {
    res.status(400).json({ error: 'Student name is required' })
    return
  }

  if (tutorId) {
    const tutor = await prisma.tutor.findUnique({ where: { id: tutorId } })
    if (!tutor) {
      res.status(400).json({ error: 'Tutor not found' })
      return
    }
  }

  const student = await prisma.student.create({
    data: {
      studentName,
      parentName: parentName || null,
      parentContact: parentContact || null,
      parentEmail: parentEmail || null,
      tutorId: tutorId || null,
      notes: notes || null,
      color: color || '#3b82f6',
    },
    include: { tutor: { select: { fullName: true, tutorId: true } } },
  })
  res.status(201).json(student)
})

router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  const { studentName, parentName, parentContact, parentEmail, tutorId, notes, color } = req.body
  const id = Number(req.params.id)

  const existing = await prisma.student.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Student not found' })
    return
  }

  if (tutorId !== undefined && tutorId !== null) {
    const tutor = await prisma.tutor.findUnique({ where: { id: tutorId } })
    if (!tutor) {
      res.status(400).json({ error: 'Tutor not found' })
      return
    }
  }

  const student = await prisma.student.update({
    where: { id },
    data: {
      studentName: studentName || undefined,
      parentName: parentName !== undefined ? parentName : undefined,
      parentContact: parentContact !== undefined ? parentContact : undefined,
      parentEmail: parentEmail !== undefined ? parentEmail : undefined,
      tutorId: tutorId !== undefined ? tutorId : undefined,
      notes: notes !== undefined ? notes : undefined,
      color: color || undefined,
    },
    include: { tutor: { select: { fullName: true, tutorId: true } } },
  })
  res.json(student)
})

router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const existing = await prisma.student.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Student not found' })
    return
  }
  await prisma.student.delete({ where: { id } })
  res.json({ message: 'Student deleted' })
})

export default router
