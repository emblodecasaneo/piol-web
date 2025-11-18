import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService } from '../api/api';
import type { User } from '../api/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Restaurer immédiatement l'utilisateur depuis localStorage (comme Facebook)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUser(user);
          setIsLoading(false);
        } catch (parseError) {
          console.error('Erreur lors du parsing de l\'utilisateur stocké:', parseError);
        }
      }

      // Vérifier la validité du token avec le serveur en arrière-plan
      const token = localStorage.getItem('authToken');
      if (token && storedUser) {
        try {
          const response = await apiService.verifyToken();
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        } catch (verifyError: any) {
          // Vérifier si c'est une erreur d'authentification explicite
          const errorMessage = verifyError?.message || '';
          const isAuthError = 
            errorMessage.includes('HTTP 401') ||
            errorMessage.includes('HTTP 403') ||
            errorMessage.includes('401') ||
            errorMessage.includes('403') ||
            errorMessage.includes('Invalid token') ||
            errorMessage.includes('Token expired') ||
            errorMessage.includes('Unauthorized') ||
            errorMessage.includes('Forbidden');

          if (isAuthError) {
            // Seulement nettoyer si c'est une erreur d'authentification explicite
            console.warn('Token invalide, déconnexion...');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
      
    } catch (error: any) {
      console.error('Auth check failed:', error);
      if (!localStorage.getItem('user')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ email, password });
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      try {
        await apiService.logout();
      } catch (error) {
        console.warn('Erreur lors de la déconnexion du serveur:', error);
      }
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.verifyToken();
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error: any) {
      console.error('User refresh failed:', error);
      if (error?.message?.includes('Network request failed') || 
          error?.message?.includes('fetch failed')) {
        console.warn('Backend non accessible, impossible de rafraîchir');
        return;
      }
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

