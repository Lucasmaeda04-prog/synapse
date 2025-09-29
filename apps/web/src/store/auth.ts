import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

// Mock users for development
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@synapse.com',
    name: 'Admin User',
    role: 'ADMIN',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'teacher@synapse.com',
    name: 'Professor Silva',
    role: 'TEACHER',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    email: 'student@synapse.com',
    name: 'João Santos',
    role: 'STUDENT',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Mock authentication
        const user = mockUsers.find(u => u.email === email)
        if (user && password === 'password') {
          set({ user, isAuthenticated: true })
        } else {
          throw new Error('Credenciais inválidas')
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },
    }),
    {
      name: 'synapse-auth',
    }
  )
)