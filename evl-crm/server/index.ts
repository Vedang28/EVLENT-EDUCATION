import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import tutorRoutes from './routes/tutors.js'
import studentRoutes from './routes/students.js'
import availabilityRoutes from './routes/availability.js'
import classRoutes from './routes/classes.js'
import attendanceRoutes from './routes/attendance.js'
import dashboardRoutes from './routes/dashboard.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/tutors', tutorRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/availability', availabilityRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Serve static frontend in production
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`EVL CRM API running on http://localhost:${PORT}`)
})
