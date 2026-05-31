export interface User {
  id: number
  username: string
  role: 'ADMIN' | 'TUTOR'
  tutorId?: number
  fullName?: string
}

export interface Tutor {
  id: number
  userId: number
  fullName: string
  email: string
  phone: string | null
  tutorId: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  user: { username: string }
  _count?: { students: number; classes: number }
  availability?: TutorAvailability[]
  students?: Student[]
  classes?: ClassItem[]
}

export interface Student {
  id: number
  studentName: string
  parentName: string | null
  parentContact: string | null
  parentEmail: string | null
  tutorId: number | null
  notes: string | null
  color: string
  createdAt: string
  tutor?: { fullName: string; tutorId: string } | null
  _count?: { classes: number }
}

export interface TutorAvailability {
  id: number
  tutorId: number
  dayOfWeek: string
  startTime: string
  endTime: string
}

export interface ClassItem {
  id: number
  studentId: number
  tutorId: number
  dayOfWeek: string
  startTime: string
  endTime: string
  notes: string | null
  student: { studentName: string; color: string }
  tutor: { fullName: string }
}

export interface AttendanceRecord {
  id: number
  classId: number
  studentId: number
  tutorId: number
  date: string
  scheduledStart: string
  scheduledEnd: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'CANCELLED' | 'RESCHEDULED'
  notes: string | null
  student: { studentName: string }
  tutor: { fullName: string }
  class?: { dayOfWeek: string; startTime: string; endTime: string }
}

export interface DashboardStats {
  tutorCount?: number
  studentCount: number
  classCount: number
  attendanceCount: number
}

export interface TodayClass extends ClassItem {
  attendance: AttendanceRecord | null
}
