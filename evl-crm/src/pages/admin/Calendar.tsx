import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { CalendarGrid } from '@/components/CalendarGrid'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { ClassItem, Tutor } from '@/lib/types'

export default function AdminCalendar() {
  const { user } = useAuth()
  if (user?.role !== 'ADMIN') return <Navigate to="/tutor" replace />

  const [tutorFilter, setTutorFilter] = useState('all')

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get<ClassItem[]>('/classes'),
  })

  const { data: tutors = [] } = useQuery({
    queryKey: ['tutors'],
    queryFn: () => api.get<Tutor[]>('/tutors'),
  })

  const filtered = tutorFilter === 'all'
    ? classes
    : classes.filter(c => c.tutorId === Number(tutorFilter))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Filter by tutor:</Label>
          <Select value={tutorFilter} onValueChange={setTutorFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tutors</SelectItem>
              {tutors.map(t => (
                <SelectItem key={t.id} value={t.id.toString()}>{t.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Legend */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Array.from(new Map(filtered.map(c => [c.studentId, c])).values()).map(c => (
            <div key={c.studentId} className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.student.color }} />
              <span className="text-xs">{c.student.studentName}</span>
            </div>
          ))}
        </div>
      )}

      <CalendarGrid classes={filtered} showTutor />
    </div>
  )
}
