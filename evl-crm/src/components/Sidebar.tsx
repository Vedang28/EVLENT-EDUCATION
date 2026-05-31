import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard, Users, GraduationCap, CalendarDays,
  ClipboardList, Clock, BookOpen, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    )

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <BookOpen className="mr-2 h-6 w-6 text-primary" />
        <span className="text-lg font-bold">EVL Education</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {isAdmin ? (
          <>
            <NavLink to="/admin" end className={linkClass}>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </NavLink>
            <NavLink to="/admin/tutors" className={linkClass}>
              <Users className="h-4 w-4" /> Tutors
            </NavLink>
            <NavLink to="/admin/students" className={linkClass}>
              <GraduationCap className="h-4 w-4" /> Students
            </NavLink>
            <NavLink to="/admin/classes" className={linkClass}>
              <ClipboardList className="h-4 w-4" /> Classes
            </NavLink>
            <NavLink to="/admin/calendar" className={linkClass}>
              <CalendarDays className="h-4 w-4" /> Calendar
            </NavLink>
            <NavLink to="/admin/attendance" className={linkClass}>
              <Clock className="h-4 w-4" /> Attendance
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/tutor" end className={linkClass}>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </NavLink>
            <NavLink to="/tutor/students" className={linkClass}>
              <GraduationCap className="h-4 w-4" /> My Students
            </NavLink>
            <NavLink to="/tutor/calendar" className={linkClass}>
              <CalendarDays className="h-4 w-4" /> My Calendar
            </NavLink>
            <NavLink to="/tutor/attendance" className={linkClass}>
              <Clock className="h-4 w-4" /> Log Attendance
            </NavLink>
          </>
        )}
      </nav>

      <div className="border-t p-3">
        <div className="mb-2 px-3 text-xs text-muted-foreground">
          {user?.fullName || user?.username}
          <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase">
            {user?.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  )
}
