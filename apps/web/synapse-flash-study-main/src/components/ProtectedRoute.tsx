import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, firebaseUser, isAuthenticated, loading } = useAuth();

  // Se ainda está carregando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // Se não tem firebaseUser, não está autenticado
  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  // Se tem firebaseUser mas ainda não carregou os dados do usuário, aguardar um pouco
  if (firebaseUser && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (requiredRole) {
    const roleHierarchy: Record<string, string[]> = {
      'STUDENT': ['STUDENT'],
      'TEACHER': ['TEACHER', 'ADMIN'],
      'ADMIN': ['ADMIN'],
    };
    
    const allowedRoles = roleHierarchy[requiredRole] || [];
    if (!user?.role || !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

