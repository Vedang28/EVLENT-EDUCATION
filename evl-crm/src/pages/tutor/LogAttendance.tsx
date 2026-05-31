import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { formatTime, DAY_LABELS } from '@/lib/utils'
import type { ClassItem, TodayClass, AttendanceRecord } from '@/lib/types'

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'CANCELLED', 'RESCHEDULED'] as const

const statusColors: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-800',
  ABSENT: 'bg-red-100 text-red-800',
  LATE: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  RESCHEDULED: 'bg-blue-100 text-blue-800',
}

export default function LogAttendance() {
  const { user } = useAuth()
  if (user?.role !== 'TUTOR') return <Navigate to="/admin" replace />

  const qc = useQueryClient()
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState<string>('PRESENT')
  const [notes, setNotes] = useState('')

  const { data: todayClasses = [] } = useQuery({
    queryKey: ['dashboard-today'],
    queryFn: () => api.get<TodayClass[]>('/dashboard/today'),
  })

  const { data: allClasses = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get<ClassItem[]>('/classes'),
  })

  const { data: recentAttendance = [] } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => api.get<AttendanceRecord[]>('/attendance'),
  })

  const logMutation = useMutation({
    mutationFn: (data: any) => api.post('/attendance', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] })
      qc.invalidateQueries({ queryKey: ['dashboard-today'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setSelectedClass(null)
      setNotes('')
      toast.success('Attendance logged')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function handleLog(classId: number) {
    logMutation.mutate({ classId, date, status, notes: notes || null })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Log Attendance</h1>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today's Classes</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Today's Classes - Quick Log */}
        <TabsContent value="today">
          {!todayClasses.length ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No classes scheduled for today
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayClasses.map(cls => (
                <Card key={cls.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cls.student.color }} />
                        <div>
                          <p className="font-medium">{cls.student.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                          </p>
                        </div>
                      </div>

                      {cls.attendance ? (
                        <div className="text-right">
                          <span className={`rounded px-2 py-1 text-xs font-medium ${statusColors[cls.attendance.status]}`}>
                            {cls.attendance.status}
                          </span>
                          {cls.attendance.notes && (
                            <p className="mt-1 text-xs text-muted-foreground">{cls.attendance.notes}</p>
                          )}
                        </div>
                      ) : selectedClass === cls.id ? (
                        <div className="flex items-center gap-2">
                          <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {STATUSES.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Notes..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-40"
                          />
                          <Button size="sm" onClick={() => handleLog(cls.id)} disabled={logMutation.isPending}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedClass(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => { setSelectedClass(cls.id); setStatus('PRESENT'); setNotes('') }}>
                          Log Attendance
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Manual Entry */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Log Attendance Manually</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select
                    value={selectedClass?.toString() || ''}
                    onValueChange={v => setSelectedClass(Number(v))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {allClasses.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.student.studentName} - {DAY_LABELS[c.dayOfWeek]} {formatTime(c.startTime)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input placeholder="Optional notes" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
              </div>
              <Button
                onClick={() => selectedClass && handleLog(selectedClass)}
                disabled={!selectedClass || logMutation.isPending}
              >
                Log Attendance
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          {!recentAttendance.length ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No attendance records yet
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map(r => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="px-4 py-3 text-sm">
                        {new Date(r.date).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{r.student.studentName}</td>
                      <td className="px-4 py-3 text-sm">
                        {formatTime(r.scheduledStart)} - {formatTime(r.scheduledEnd)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColors[r.status]}`}>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
