import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, ClipboardList, Clock } from 'lucide-react'
import { formatTime, DAY_LABELS } from '@/lib/utils'
import type { DashboardStats, TodayClass, ClassItem } from '@/lib/types'

export default function AdminDashboard() {
  const { user } = useAuth()
  if (user?.role !== 'ADMIN') return <Navigate to="/tutor" replace />

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<DashboardStats>('/dashboard/stats'),
  })

  const { data: todayClasses } = useQuery({
    queryKey: ['dashboard-today'],
    queryFn: () => api.get<TodayClass[]>('/dashboard/today'),
  })

  const { data: upcoming } = useQuery({
    queryKey: ['dashboard-upcoming'],
    queryFn: () => api.get<(ClassItem & { daysUntil: number })[]>('/dashboard/upcoming'),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Users} label="Tutors" value={stats?.tutorCount ?? 0} />
        <StatCard icon={GraduationCap} label="Students" value={stats?.studentCount ?? 0} />
        <StatCard icon={ClipboardList} label="Classes" value={stats?.classCount ?? 0} />
        <StatCard icon={Clock} label="Attendance Records" value={stats?.attendanceCount ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {!todayClasses?.length ? (
              <p className="text-sm text-muted-foreground">No classes scheduled today</p>
            ) : (
              <div className="space-y-3">
                {todayClasses.map(cls => (
                  <div key={cls.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cls.student.color }} />
                      <div>
                        <p className="text-sm font-medium">{cls.student.studentName}</p>
                        <p className="text-xs text-muted-foreground">with {cls.tutor.fullName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{formatTime(cls.startTime)} - {formatTime(cls.endTime)}</p>
                      {cls.attendance ? (
                        <span className={`text-xs ${cls.attendance.status === 'PRESENT' ? 'text-green-600' : cls.attendance.status === 'ABSENT' ? 'text-red-600' : 'text-yellow-600'}`}>
                          {cls.attendance.status}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not logged</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {!upcoming?.length ? (
              <p className="text-sm text-muted-foreground">No upcoming classes</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map(cls => (
                  <div key={cls.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cls.student.color }} />
                      <div>
                        <p className="text-sm font-medium">{cls.student.studentName}</p>
                        <p className="text-xs text-muted-foreground">{cls.tutor.fullName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{DAY_LABELS[cls.dayOfWeek]}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                      </p>
                    </div>
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

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
