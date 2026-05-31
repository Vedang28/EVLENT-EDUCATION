import { Router, Request, Response } from 'express'
import prisma from '../db.js'
import { authenticate, requireAdmin } from '../middleware.js'

const router = Router()
router.use(authenticate)

router.get('/:tutorId', async (req: Request, res: Response) => {
  const tutorId = Number(req.params.tutorId)

  if (req.user!.role === 'TUTOR' && req.user!.tutorId !== tutorId) {
    res.status(403).json({ error: 'Access denied' })
    return
  }

  const availability = await prisma.tutorAvailability.findMany({
    where: { tutorId },
    orderBy: { dayOfWeek: 'asc' },
  })
  res.json(availability)
})

router.put('/:tutorId', requireAdmin, async (req: Request, res: Response) => {
  const tutorId = Number(req.params.tutorId)
  const { slots } = req.body as {
    slots: Array<{ dayOfWeek: string; startTime: string; endTime: string }>
  }

  const tutor = await prisma.tutor.findUnique({ where: { id: tutorId } })
  if (!tutor) {
    res.status(404).json({ error: 'Tutor not found' })
    return
  }

  for (const slot of slots) {
    if (slot.startTime >= slot.endTime) {
      res.status(400).json({ error: `Invalid time range for ${slot.dayOfWeek}: start must be before end` })
      return
    }
  }

  await prisma.$transaction([
    prisma.tutorAvailability.deleteMany({ where: { tutorId } }),
    ...slots.map(slot =>
      prisma.tutorAvailability.create({
        data: {
          tutorId,
          dayOfWeek: slot.dayOfWeek as any,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      })
    ),
  ])

  const availability = await prisma.tutorAvailability.findMany({
    where: { tutorId },
    orderBy: { dayOfWeek: 'asc' },
  })
  res.json(availability)
})

export default router
