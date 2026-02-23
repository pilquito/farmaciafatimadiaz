import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const specialtySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

type SpecialtyFormData = z.infer<typeof specialtySchema>;

interface Specialty {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
}

export function SpecialtiesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: specialties = [], isLoading } = useQuery({
    queryKey: ['/api/specialties'],
  });

  const form = useForm<SpecialtyFormData>({
    resolver: zodResolver(specialtySchema),
    defaultValues: {
      name: '',
      description: '',
      active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SpecialtyFormData) => {
      return apiRequest('/api/specialties', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/specialties'] });
      toast({ title: 'Especialidad creada', description: 'La especialidad se ha creado correctamente.' });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo crear la especialidad.', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SpecialtyFormData }) => {
      return apiRequest(`/api/specialties/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/specialties'] });
      toast({ title: 'Especialidad actualizada', description: 'La especialidad se ha actualizado correctamente.' });
      setIsDialogOpen(false);
      setEditingSpecialty(null);
      form.reset();
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo actualizar la especialidad.', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/specialties/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/specialties'] });
      toast({ title: 'Especialidad eliminada', description: 'La especialidad se ha eliminado correctamente.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo eliminar la especialidad.', variant: 'destructive' });
    },
  });

  const onSubmit = (data: SpecialtyFormData) => {
    if (editingSpecialty) {
      updateMutation.mutate({ id: editingSpecialty.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    form.reset({
      name: specialty.name,
      description: specialty.description || '',
      active: specialty.active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta especialidad?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewSpecialty = () => {
    setEditingSpecialty(null);
    form.reset();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Especialidades Médicas</CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Especialidades Médicas</CardTitle>
        <CardDescription>
          Gestiona las especialidades médicas disponibles en el centro.
        </CardDescription>
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewSpecialty}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Especialidad
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSpecialty ? 'Editar Especialidad' : 'Nueva Especialidad'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Cardiología" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descripción de la especialidad..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Activa</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            La especialidad estará disponible para citas
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingSpecialty ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {specialties.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No hay especialidades registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {specialties.map((specialty: Specialty) => (
              <div 
                key={specialty.id} 
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium">{specialty.name}</h3>
                    <Badge variant={specialty.active ? 'default' : 'secondary'}>
                      {specialty.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  {specialty.description && (
                    <p className="text-sm text-muted-foreground">{specialty.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(specialty)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(specialty.id)}
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