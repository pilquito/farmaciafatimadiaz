import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  isApproved: boolean;
  role: string;
  createdAt: string;
}

export default function UserManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  
  // Consulta para obtener usuarios
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    retry: false,
  });
  
  // Mutación para aprobar/desaprobar usuarios
  const approvalMutation = useMutation({
    mutationFn: async ({ userId, isApproved }: { userId: string; isApproved: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isApproved }),
      });
      
      if (!response.ok) {
        throw new Error('Error al cambiar el estado de aprobación del usuario');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'Estado actualizado',
        description: 'El estado del usuario ha sido actualizado correctamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });
  
  // Mutación para cambiar el rol del usuario
  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });
      
      if (!response.ok) {
        throw new Error('Error al cambiar el rol del usuario');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'Rol actualizado',
        description: 'El rol del usuario ha sido actualizado correctamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });
  
  // Filtrar usuarios según el término de búsqueda
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Paginación
  const usersPerPage = 10;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  
  // Manejar la aprobación/desaprobación de usuarios
  const handleApprovalToggle = (user: User) => {
    approvalMutation.mutate({
      userId: user.id,
      isApproved: !user.isApproved,
    });
  };
  
  // Manejar el cambio de rol
  const handleRoleChange = (userId: string, newRole: string) => {
    roleMutation.mutate({
      userId,
      role: newRole,
    });
  };
  
  // Mostrar detalles del usuario
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };
  
  return (
    <>
      <Helmet>
        <title>Gestión de Usuarios | Panel de Administración</title>
      </Helmet>
      
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>
        
        {/* Filtro y búsqueda */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar usuarios</CardTitle>
            <CardDescription>
              Busca usuarios por nombre, nombre de usuario o correo electrónico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabla de usuarios */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableCaption>Lista de usuarios registrados en el sistema</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fecha de registro</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Cargando usuarios...
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={user.isApproved}
                            onCheckedChange={() => handleApprovalToggle(user)}
                          />
                          <Badge variant={user.isApproved ? 'default' : 'secondary'}>
                            {user.isApproved ? 'Aprobado' : 'Pendiente'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="p-1 rounded-md border"
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Administrador</option>
                          <option value="doctor">Médico</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(user)}
                        >
                          Ver detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={pageNumber === currentPage}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
        
        {/* Diálogo de detalles del usuario */}
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles del usuario</DialogTitle>
              <DialogDescription>
                Información detallada del usuario seleccionado.
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">ID</Label>
                    <p className="text-sm">{selectedUser.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Nombre de usuario</Label>
                    <p className="text-sm">{selectedUser.username}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Correo electrónico</Label>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Nombre completo</Label>
                    <p className="text-sm">{selectedUser.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fecha de registro</Label>
                    <p className="text-sm">
                      {new Date(selectedUser.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Switch
                        checked={selectedUser.isApproved}
                        onCheckedChange={() => handleApprovalToggle(selectedUser)}
                      />
                      <span className="text-sm">
                        {selectedUser.isApproved ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Rol del usuario</Label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                    className="w-full p-2 mt-1 rounded-md border"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                    <option value="doctor">Médico</option>
                  </select>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDetails(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}