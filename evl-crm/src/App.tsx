import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { Layout } from '@/components/Layout'
import { Toaster } from 'sonner'

import Login from '@/pages/Login'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminTutors from '@/pages/admin/Tutors'
import AdminStudents from '@/pages/admin/Students'
import AdminClasses from '@/pages/admin/Classes'
import AdminCalendar from '@/pages/admin/Calendar'
import AdminAttendance from '@/pages/admin/Attendance'
import TutorDashboard from '@/pages/tutor/Dashboard'
import TutorStudents from '@/pages/tutor/MyStudents'
import TutorCalendar from '@/pages/tutor/MyCalendar'
import TutorAttendance from '@/pages/tutor/LogAttendance'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/tutors" element={<AdminTutors />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/classes" element={<AdminClasses />} />
              <Route path="/admin/calendar" element={<AdminCalendar />} />
              <Route path="/admin/attendance" element={<AdminAttendance />} />

              {/* Tutor routes */}
              <Route path="/tutor" element={<TutorDashboard />} />
              <Route path="/tutor/students" element={<TutorStudents />} />
              <Route path="/tutor/calendar" element={<TutorCalendar />} />
              <Route path="/tutor/attendance" element={<TutorAttendance />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  )
}
