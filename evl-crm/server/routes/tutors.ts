import { Router, Request, Response } from 'express'
import prisma from '../db.js'
import { hashPassword } from '../auth.js'
import { authenticate, requireAdmin } from '../middleware.js'

const router = Router()
router.use(authenticate, requireAdmin)

router.get('/', async (_req: Request, res: Response) => {
  const tutors = await prisma.tutor.findMany({
    include: {
      user: { select: { username: true } },
      _count: { select: { students: true, classes: true } },
    },
    orderBy: { fullName: 'asc' },
  })
  res.json(tutors)
})

router.get('/:id', async (req: Request, res: Response) => {
  const tutor = await prisma.tutor.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      user: { select: { username: true } },
      availability: { orderBy: { dayOfWeek: 'asc' } },
      students: true,
      classes: { include: { student: true } },
    },
  })
  if (!tutor) {
    res.status(404).json({ error: 'Tutor not found' })
    return
  }
  res.json(tutor)
})

router.post('/', async (req: Request, res: Response) => {
  const { fullName, email, phone, tutorId, username, password, status } = req.body

  if (!fullName || !email || !tutorId || !username || !password) {
    res.status(400).json({ error: 'Full name, email, tutor ID, username, and password are required' })
    return
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    res.status(409).json({ error: 'Username already taken' })
    return
  }

  const existingEmail = await prisma.tutor.findUnique({ where: { email } })
  if (existingEmail) {
    res.status(409).json({ error: 'Email already in use' })
    return
  }

  const existingTutorId = await prisma.tutor.findUnique({ where: { tutorId } })
  if (existingTutorId) {
    res.status(409).json({ error: 'Tutor ID already in use' })
    return
  }

  const hashed = await hashPassword(password)

  const tutor = await prisma.tutor.create({
    data: {
      fullName,
      email,
      phone: phone || null,
      tutorId,
      status: status || 'ACTIVE',
      user: {
        create: {
          username,
          password: hashed,
          role: 'TUTOR',
        },
      },
    },
    include: { user: { select: { username: true } } },
  })

  res.status(201).json(tutor)
})

router.put('/:id', async (req: Request, res: Response) => {
  const { fullName, email, phone, tutorId, status, password } = req.body
  const id = Number(req.params.id)

  const existing = await prisma.tutor.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Tutor not found' })
    return
  }

  if (email && email !== existing.email) {
    const dup = await prisma.tutor.findUnique({ where: { email } })
    if (dup) {
      res.status(409).json({ error: 'Email already in use' })
      return
    }
  }

  if (tutorId && tutorId !== existing.tutorId) {
    const dup = await prisma.tutor.findUnique({ where: { tutorId } })
    if (dup) {
      res.status(409).json({ error: 'Tutor ID already in use' })
      return
    }
  }

  const tutor = await prisma.tutor.update({
    where: { id },
    data: {
      fullName: fullName || undefined,
      email: email || undefined,
      phone: phone !== undefined ? phone : undefined,
      tutorId: tutorId || undefined,
      status: status || undefined,
    },
    include: { user: { select: { username: true } } },
  })

  if (password) {
    const hashed = await hashPassword(password)
    await prisma.user.update({
      where: { id: existing.userId },
      data: { password: hashed },
    })
  }

  res.json(tutor)
})

router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const tutor = await prisma.tutor.findUnique({ where: { id } })
  if (!tutor) {
    res.status(404).json({ error: 'Tutor not found' })
    return
  }

  await prisma.user.delete({ where: { id: tutor.userId } })
  res.json({ message: 'Tutor deleted' })
})

export default router
