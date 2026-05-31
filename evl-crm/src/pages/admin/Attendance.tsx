import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { formatTime, DAY_LABELS } from '@/lib/utils'
import type { AttendanceRecord, Tutor } from '@/lib/types'

const statusColors: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-800',
  ABSENT: 'bg-red-100 text-red-800',
  LATE: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  RESCHEDULED: 'bg-blue-100 text-blue-800',
}

export default function AdminAttendance() {
  const { user } = useAuth()
  if (user?.role !== 'ADMIN') return <Navigate to="/tutor" replace />

  const [tutorFilter, setTutorFilter] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const params = new URLSearchParams()
  if (tutorFilter) params.set('tutorId', tutorFilter)
  if (from) params.set('from', from)
  if (to) params.set('to', to)

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['attendance', tutorFilter, from, to],
    queryFn: () => api.get<AttendanceRecord[]>(`/attendance?${params}`),
  })

  const { data: tutors = [] } = useQuery({
    queryKey: ['tutors'],
    queryFn: () => api.get<Tutor[]>('/tutors'),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance Records</h1>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Tutor</Label>
          <Select value={tutorFilter} onValueChange={setTutorFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All tutors" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tutors</SelectItem>
              {tutors.map(t => (
                <SelectItem key={t.id} value={t.id.toString()}>{t.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">From</Label>
          <Input type="date" className="w-40" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">To</Label>
          <Input type="date" className="w-40" value={to} onChange={e => setTo(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !records.length ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No attendance records found
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Student</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Tutor</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-sm">
                    {new Date(r.date).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{r.student.studentName}</td>
                  <td className="px-4 py-3 text-sm">{r.tutor.fullName}</td>
                  <td className="px-4 py-3 text-sm">
                    {formatTime(r.scheduledStart)} - {formatTime(r.scheduledEnd)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusColors[r.status] || ''}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
