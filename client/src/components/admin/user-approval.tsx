import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

export function UserApprovalPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Cargar usuarios desde la API
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    select: (data: User[]) => data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  });

  // Mutación para aprobar/desaprobar usuario
  const approveUserMutation = useMutation({
    mutationFn: async ({ userId, isApproved }: { userId: number; isApproved: boolean }) => {
      return apiRequest(`/api/admin/users/${userId}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ isApproved }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (_, { isApproved }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: isApproved ? 'Usuario aprobado' : 'Aprobación retirada',
        description: `El usuario ha sido ${isApproved ? 'aprobado' : 'desaprobado'} correctamente.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario.",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar usuario
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario.",
        variant: "destructive",
      });
    },
  });

  // Manejar la aprobación del usuario
  const handleApprove = (userId: number, approved: boolean) => {
    approveUserMutation.mutate({ userId, isApproved: approved });
  };

  // Manejar la eliminación del usuario
  const handleDelete = (userId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      deleteUserMutation.mutate(userId);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gestión de usuarios</CardTitle>
          <CardDescription>Cargando usuarios...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestión de usuarios</CardTitle>
        <CardDescription>
          Administra usuarios, aprueba nuevas cuentas y gestiona permisos de acceso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user.firstName && user.lastName 
                        ? `${user.firstName[0]}${user.lastName[0]}`
                        : user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.username}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Registrado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={user.isApproved ? 'default' : 'outline'}>
                    {user.isApproved ? 'Aprobado' : 'Pendiente'}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={user.isApproved}
                      onCheckedChange={(checked) => handleApprove(user.id, checked)}
                      disabled={approveUserMutation.isPending}
                    />
                    <span className="text-sm font-medium">
                      {user.isApproved ? 'Aprobado' : 'Pendiente'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                    disabled={deleteUserMutation.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}