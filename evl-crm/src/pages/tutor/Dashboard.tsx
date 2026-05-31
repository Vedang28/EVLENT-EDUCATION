import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, ClipboardList, Clock } from 'lucide-react'
import { formatTime, DAY_LABELS } from '@/lib/utils'
import type { DashboardStats, TodayClass, ClassItem, Student } from '@/lib/types'

export default function TutorDashboard() {
  const { user } = useAuth()
  if (user?.role !== 'TUTOR') return <Navigate to="/admin" replace />

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<DashboardStats>('/dashboard/stats'),
  })

  const { data: todayClasses = [] } = useQuery({
    queryKey: ['dashboard-today'],
    queryFn: () => api.get<TodayClass[]>('/dashboard/today'),
  })

  const { data: upcoming = [] } = useQuery({
    queryKey: ['dashboard-upcoming'],
    queryFn: () => api.get<(ClassItem & { daysUntil: number })[]>('/dashboard/upcoming'),
  })

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.get<Student[]>('/students'),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.fullName}</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.studentCount ?? 0}</p>
              <p className="text-sm text-muted-foreground">My Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.classCount ?? 0}</p>
              <p className="text-sm text-muted-foreground">Weekly Classes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.attendanceCount ?? 0}</p>
              <p className="text-sm text-muted-foreground">Attendance Logged</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {!todayClasses.length ? (
              <p className="text-sm text-muted-foreground">No classes today</p>
            ) : (
              <div className="space-y-3">
                {todayClasses.map(cls => (
                  <div key={cls.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cls.student.color }} />
                      <div>
                        <p className="text-sm font-medium">{cls.student.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                        </p>
                      </div>
                    </div>
                    {cls.attendance ? (
                      <Badge variant={cls.attendance.status === 'PRESENT' ? 'default' : 'secondary'}>
                        {cls.attendance.status}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Students */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Students</CardTitle>
          </CardHeader>
          <CardContent>
            {!students.length ? (
              <p className="text-sm text-muted-foreground">No students assigned</p>
            ) : (
              <div className="space-y-3">
                {students.map(s => (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <div>
                      <p className="text-sm font-medium">{s.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {s._count?.classes ?? 0} classes/week
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {!upcoming.length ? (
              <p className="text-sm text-muted-foreground">No upcoming classes</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {upcoming.map(cls => (
                  <div key={cls.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cls.student.color }} />
                      <div>
                        <p className="text-sm font-medium">{cls.student.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{DAY_LABELS[cls.dayOfWeek]}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
