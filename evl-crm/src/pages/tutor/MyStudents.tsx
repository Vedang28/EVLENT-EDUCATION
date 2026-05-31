import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTime, DAY_LABELS } from '@/lib/utils'
import type { Student } from '@/lib/types'

export default function TutorStudents() {
  const { user } = useAuth()
  if (user?.role !== 'TUTOR') return <Navigate to="/admin" replace />

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.get<Student[]>('/students'),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Students</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !students.length ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No students assigned to you yet
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map(s => (
            <Card key={s.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: s.color }} />
                  <CardTitle className="text-base">{s.studentName}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {s.parentName && <p>Parent: {s.parentName}</p>}
                  {s.parentContact && <p>Contact: {s.parentContact}</p>}
                  {s.parentEmail && <p>Email: {s.parentEmail}</p>}
                  <p>{s._count?.classes ?? 0} classes/week</p>
                  {s.notes && (
                    <p className="mt-2 rounded bg-muted p-2 text-xs">{s.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
