import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";

// Auth pages (small, keep eager)
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages (code-split into separate chunks)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const LessonPage = lazy(() => import("./pages/LessonPage"));
const AssignmentPage = lazy(() => import("./pages/AssignmentPage"));
const Grades = lazy(() => import("./pages/Grades"));
const LiveClasses = lazy(() => import("./pages/LiveClasses"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Profile = lazy(() => import("./pages/Profile"));
const CalendarPage = lazy(() => import("./pages/Calendar"));
const TimetablePage = lazy(() => import("./pages/Timetable"));
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const TeacherCourses = lazy(() => import("./pages/teacher/TeacherCourses"));
const CreateCourse = lazy(() => import("./pages/teacher/CreateCourse"));
const TeacherCourseDetail = lazy(() => import("./pages/teacher/TeacherCourseDetail"));
const TeacherSubmissions = lazy(() => import("./pages/teacher/TeacherSubmissions"));
const AssignmentSubmissions = lazy(() => import("./pages/teacher/AssignmentSubmissions"));
const TeacherLiveClasses = lazy(() => import("./pages/teacher/TeacherLiveClasses"));
const TeacherStudents = lazy(() => import("./pages/teacher/TeacherStudents"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));

const queryClient = new QueryClient();

function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Student routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route
                  path="/courses/:courseId/lessons/:lessonId"
                  element={<LessonPage />}
                />
                <Route
                  path="/courses/:courseId/assignments/:assignmentId"
                  element={<AssignmentPage />}
                />
                <Route path="/grades" element={<Grades />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/timetable" element={<TimetablePage />} />
                <Route path="/live-classes" element={<LiveClasses />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />

                {/* Teacher routes */}
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/teacher/courses" element={<TeacherCourses />} />
                <Route path="/teacher/courses/new" element={<CreateCourse />} />
                <Route
                  path="/teacher/courses/:courseId"
                  element={<TeacherCourseDetail />}
                />
                <Route
                  path="/teacher/courses/:courseId/assignments/:assignmentId/submissions"
                  element={<AssignmentSubmissions />}
                />
                <Route
                  path="/teacher/submissions"
                  element={<TeacherSubmissions />}
                />
                <Route
                  path="/teacher/live-classes"
                  element={<TeacherLiveClasses />}
                />
                <Route path="/teacher/students" element={<TeacherStudents />} />

                {/* Admin routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/courses" element={<AdminCourses />} />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
