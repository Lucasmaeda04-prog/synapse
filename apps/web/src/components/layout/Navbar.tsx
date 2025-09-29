import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useAuthStore } from '../../store/auth'
import { BookOpen, LogOut, User, Users, GraduationCap, ChartBar as BarChart3, Settings } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  const getNavItems = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { to: '/admin/users', icon: Users, label: 'Usuários' },
          { to: '/admin/reports', icon: BarChart3, label: 'Relatórios' },
        ]
      case 'TEACHER':
        return [
          { to: '/teacher/dashboard', icon: BarChart3, label: 'Dashboard' },
          { to: '/teacher/decks', icon: BookOpen, label: 'Meus Decks' },
          { to: '/teacher/classes', icon: GraduationCap, label: 'Turmas' },
          { to: '/teacher/reports', icon: BarChart3, label: 'Relatórios' },
        ]
      case 'STUDENT':
        return [
          { to: '/student/decks', icon: BookOpen, label: 'Meus Decks' },
          { to: '/student/progress', icon: BarChart3, label: 'Progresso' },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Synapse</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
              <span className="text-xs text-muted-foreground">({user.role})</span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}