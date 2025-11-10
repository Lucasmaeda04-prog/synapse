import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export function useAuthenticatedFetch() {
  const { firebaseUser } = useAuth();

  const authenticatedFetch = useMemo(() => {
    return async (url: string, options: RequestInit = {}) => {
      if (!firebaseUser) {
        throw new Error('Usuário não autenticado');
      }

      const token = await firebaseUser.getIdToken();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    };
  }, [firebaseUser]);

  return authenticatedFetch;
}

