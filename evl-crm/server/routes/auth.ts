import { Router, Request, Response } from 'express'
import prisma from '../db.js'
import { comparePassword, signToken } from '../auth.js'
import { authenticate } from '../middleware.js'

const router = Router()

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: { tutor: true },
  })

  if (!user || !(await comparePassword(password, user.password))) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  if (user.role === 'TUTOR' && user.tutor?.status === 'INACTIVE') {
    res.status(403).json({ error: 'Account is inactive. Contact admin.' })
    return
  }

  const token = signToken({
    userId: user.id,
    role: user.role,
    tutorId: user.tutor?.id,
  })

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      tutorId: user.tutor?.id,
      fullName: user.role === 'ADMIN' ? 'Admin' : user.tutor?.fullName,
    },
  })
})

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { tutor: true },
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    tutorId: user.tutor?.id,
    fullName: user.role === 'ADMIN' ? 'Admin' : user.tutor?.fullName,
  })
})

export default router
