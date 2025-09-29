import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { HomePage } from './pages/HomePage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'
import { TeacherDashboardPage } from './pages/teacher/DashboardPage'
import { TeacherDecksPage } from './pages/teacher/DecksPage'
import { TeacherClassesPage } from './pages/teacher/ClassesPage'
import { StudentDecksPage } from './pages/student/DecksPage'
import { StudentProgressPage } from './pages/student/ProgressPage'
import { StudyPage } from './pages/student/StudyPage'
import { useAuthStore } from './store/auth'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppRoutes() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher/*" element={
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <Routes>
              <Route path="dashboard" element={<TeacherDashboardPage />} />
              <Route path="decks" element={<TeacherDecksPage />} />
              <Route path="classes" element={<TeacherClassesPage />} />
              <Route path="reports" element={<div>Teacher Reports (Coming Soon)</div>} />
            </Routes>
          </ProtectedRoute>
        } />
        
        {/* Student Routes */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <Routes>
              <Route path="decks" element={<StudentDecksPage />} />
              <Route path="progress" element={<StudentProgressPage />} />
              <Route path="study/:deckId" element={<StudyPage />} />
            </Routes>
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Routes>
              <Route path="users" element={<div>Admin Users (Coming Soon)</div>} />
              <Route path="reports" element={<div>Admin Reports (Coming Soon)</div>} />
            </Routes>
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Redirect based on user role */}
      <Route path="*" element={
        isAuthenticated && user ? (
          user.role === 'TEACHER' ? <Navigate to="/teacher/dashboard" replace /> :
          user.role === 'STUDENT' ? <Navigate to="/student/decks" replace /> :
          user.role === 'ADMIN' ? <Navigate to="/admin/users" replace /> :
          <Navigate to="/" replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  )
}