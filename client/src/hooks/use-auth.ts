import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  loyaltyPoints: number;
  emailNotifications: boolean;
  profileImageUrl?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Consulta para obtener el perfil del usuario si está autenticado
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/profile'],
    queryFn: async () => {
      try {
        // La función apiRequest ahora maneja automáticamente la conversión JSON
        return await apiRequest('/api/auth/profile') as User;
      } catch (error) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: false,
  });

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      
      // Invalidar consulta y limpiar caché
      queryClient.invalidateQueries({ queryKey: ['/api/auth/profile'] });
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      
      setLocation('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
    logout,
  };
}