import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { CalendarGrid } from '@/components/CalendarGrid'
import type { ClassItem } from '@/lib/types'

export default function TutorCalendar() {
  const { user } = useAuth()
  if (user?.role !== 'TUTOR') return <Navigate to="/admin" replace />

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get<ClassItem[]>('/classes'),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Calendar</h1>

      {classes.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Array.from(new Map(classes.map(c => [c.studentId, c])).values()).map(c => (
            <div key={c.studentId} className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.student.color }} />
              <span className="text-xs">{c.student.studentName}</span>
            </div>
          ))}
        </div>
      )}

      <CalendarGrid classes={classes} />
    </div>
  )
}
