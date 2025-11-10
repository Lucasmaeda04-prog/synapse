import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'TEACHER' | 'STUDENT') => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users para desenvolvimento - em produção isso viria do backend
const mockUsers: Record<string, User> = {
  'professor@synapse.com': { 
    id: '1', 
    name: 'Prof. Maria Silva', 
    email: 'professor@synapse.com', 
    role: 'TEACHER' 
  },
  'aluno@synapse.com': { 
    id: '2', 
    name: 'João Santos', 
    email: 'aluno@synapse.com', 
    role: 'STUDENT' 
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Tentar buscar dados do backend primeiro
          const { getCurrentUser } = await import('@/lib/api');
          const backendUser = await getCurrentUser();
          setUser({
            id: backendUser.id,
            name: backendUser.name,
            email: backendUser.email,
            role: backendUser.role as 'ADMIN' | 'TEACHER' | 'STUDENT',
          });
        } catch (error) {
          // Se falhar, usar mock ou dados do Firebase
          console.warn('Erro ao buscar usuário do backend, usando dados locais:', error);
          const userData = mockUsers[firebaseUser.email || ''];
          if (userData) {
            setUser(userData);
          } else {
            // Se não encontrar no mock, criar usuário padrão
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
              email: firebaseUser.email || '',
              role: 'STUDENT', // Default role
            });
          }
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'TEACHER' | 'STUDENT') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Aguardar um pouco para garantir que o Firebase processou
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sincronizar com backend - criar usuário no MongoDB
      try {
        const { createUser } = await import('@/lib/api');
        const result = await createUser({
          uid: userCredential.user.uid,
          email,
          name,
          role,
        });
        console.log('✅ Usuário criado no MongoDB:', result);
      } catch (backendError: any) {
        console.error('❌ Erro ao sincronizar com backend:', backendError);
        // Se o erro for 409 (já existe), não é problema
        if (backendError.message?.includes('409') || backendError.message?.includes('já existe')) {
          console.log('ℹ️ Usuário já existe no MongoDB, continuando...');
        } else {
          // Para outros erros, ainda continuamos mas logamos
          console.warn('⚠️ Falha ao criar usuário no MongoDB, mas registro no Firebase foi bem-sucedido');
        }
      }
      
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
