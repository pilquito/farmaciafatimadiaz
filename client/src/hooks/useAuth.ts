import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  isApproved: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ['/api/auth/profile'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Estado para manejar el intento de inicio de sesión
  const [loginAttempt, setLoginAttempt] = useState(false);

  // Función para iniciar sesión
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      // Refrescar datos del usuario
      await refetch();
      setLoginAttempt(true);
      return true;
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Refrescar datos del usuario
      await refetch();
      return true;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return false;
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (userData: Omit<User, 'id' | 'role' | 'isApproved'> & { password: string }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al registrar el usuario');
      }

      return true;
    } catch (error) {
      console.error('Error de registro:', error);
      return false;
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isApproved: user?.isApproved,
    login,
    logout,
    register,
    loginAttempt,
  };
}