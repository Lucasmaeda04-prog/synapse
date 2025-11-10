import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
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
  resetPassword: (email: string) => Promise<void>;
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
          const { api } = await import('@/lib/api');
          console.log('📥 Buscando dados do usuário no backend...');
          const backendUser = await api.getCurrentUser();
          console.log('✅ Dados do usuário recebidos do backend:', {
            id: backendUser.id || (backendUser as any)._id?.toString(),
            email: backendUser.email,
            name: backendUser.name,
            role: backendUser.role,
          });
          setUser({
            id: backendUser.id || (backendUser as any)._id?.toString() || '',
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
      // O onAuthStateChanged vai atualizar o estado automaticamente
      // Não precisamos aguardar aqui, pois o ProtectedRoute verifica firebaseUser
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'TEACHER' | 'STUDENT') => {
    try {
      console.log('🔥 Criando usuário no Firebase...', { email, name, role });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      console.log('✅ Usuário criado no Firebase:', userCredential.user.uid);
      
      // Aguardar um pouco para garantir que o Firebase processou
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sincronizar com backend - criar usuário no MongoDB
      console.log('📦 Sincronizando com MongoDB...');
      try {
        const { api } = await import('@/lib/api');
        const result = await api.createUser({
          uid: userCredential.user.uid,
          email,
          name,
          role,
        });
        console.log('✅ Usuário criado no MongoDB:', result);
      } catch (backendError: any) {
        console.error('❌ Erro ao sincronizar com backend:', backendError);
        console.error('Detalhes do erro:', {
          message: backendError.message,
          stack: backendError.stack,
        });
        
        // Se o erro for 409 (já existe), não é problema
        if (backendError.message?.includes('409') || backendError.message?.includes('já existe')) {
          console.log('ℹ️ Usuário já existe no MongoDB, continuando...');
        } else {
          // Para outros erros, ainda continuamos mas logamos
          console.warn('⚠️ Falha ao criar usuário no MongoDB, mas registro no Firebase foi bem-sucedido');
          // Re-throw para que a UI possa mostrar o erro
          throw new Error(`Falha ao criar usuário no sistema: ${backendError.message}`);
        }
      }
      
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
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

  const resetPassword = async (email: string) => {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };
      
      console.log('📧 Enviando email de reset de senha para:', email);
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      console.log('✅ Email de reset enviado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao enviar email de reset:', error);
      // Melhorar mensagens de erro
      let errorMessage = 'Não foi possível enviar o email de recuperação';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Nenhuma conta encontrada com este email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      login, 
      register, 
      logout,
      resetPassword,
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
