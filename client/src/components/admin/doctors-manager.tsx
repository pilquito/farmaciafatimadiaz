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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Trash2, Stethoscope, Archive, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const doctorSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  specialtyId: z.number().min(1, 'Selecciona una especialidad'),
  licenseNumber: z.string().optional(),
  experience: z.string().optional(),
  bio: z.string().optional(),
  schedule: z.string().optional(),
  active: z.boolean().default(true),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  specialtyId: number | null;
  licenseNumber: string | null;
  experience: string | null;
  bio: string | null;
  schedule: string | null;
  active: boolean;
  createdAt: string;
}

interface Specialty {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
}

export function DoctorsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ['/api/doctors'],
  });

  const { data: specialties = [], isLoading: specialtiesLoading } = useQuery({
    queryKey: ['/api/specialties'],
  });

  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      specialtyId: 0,
      licenseNumber: '',
      experience: '',
      bio: '',
      schedule: '',
      active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: DoctorFormData) => {
      return apiRequest('/api/doctors', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
      toast({ title: 'Doctor creado', description: 'El doctor se ha creado correctamente.' });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo crear el doctor.', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DoctorFormData }) => {
      return apiRequest(`/api/doctors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
      toast({ title: 'Doctor actualizado', description: 'El doctor se ha actualizado correctamente.' });
      setIsDialogOpen(false);
      setEditingDoctor(null);
      form.reset();
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo actualizar el doctor.', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/doctors/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
      toast({ title: 'Doctor archivado', description: 'El doctor se ha archivado correctamente.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo archivar el doctor.', variant: 'destructive' });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/doctors/${id}/archive`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
      toast({ title: 'Doctor archivado', description: 'El doctor se ha archivado correctamente.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo archivar el doctor.', variant: 'destructive' });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/doctors/${id}/activate`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
      toast({ title: 'Doctor activado', description: 'El doctor se ha activado correctamente.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo activar el doctor.', variant: 'destructive' });
    },
  });

  const onSubmit = (data: DoctorFormData) => {
    if (editingDoctor) {
      updateMutation.mutate({ id: editingDoctor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    form.reset({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone || '',
      specialtyId: doctor.specialtyId || 0,
      licenseNumber: doctor.licenseNumber || '',
      experience: doctor.experience || '',
      bio: doctor.bio || '',
      schedule: doctor.schedule || '',
      active: doctor.active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres archivar este doctor? (No se eliminará permanentemente)')) {
      deleteMutation.mutate(id);
    }
  };

  const handleArchive = (id: number) => {
    if (confirm('¿Estás seguro de que quieres archivar este doctor?')) {
      archiveMutation.mutate(id);
    }
  };

  const handleActivate = (id: number) => {
    if (confirm('¿Estás seguro de que quieres activar este doctor?')) {
      activateMutation.mutate(id);
    }
  };

  const handleNewDoctor = () => {
    setEditingDoctor(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const getSpecialtyName = (specialtyId: number | null) => {
    if (!specialtyId) return 'Sin especialidad';
    const specialty = specialties.find((s: Specialty) => s.id === specialtyId);
    return specialty?.name || 'Especialidad desconocida';
  };

  if (doctorsLoading || specialtiesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Doctores</CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Doctores</CardTitle>
        <CardDescription>
          Administra los doctores y profesionales del centro médico.
        </CardDescription>
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewDoctor}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingDoctor ? 'Editar Doctor' : 'Nuevo Doctor'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Juan Pérez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="doctor@farmacia.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="+34 912 345 678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialtyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidad</FormLabel>
                          <Select 
                            value={field.value.toString()} 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una especialidad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {specialties.map((specialty: Specialty) => (
                                <SelectItem key={specialty.id} value={specialty.id.toString()}>
                                  {specialty.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de colegiado</FormLabel>
                          <FormControl>
                            <Input placeholder="MD12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experiencia</FormLabel>
                          <FormControl>
                            <Input placeholder="10 años de experiencia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biografía</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descripción profesional del doctor..."
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
                    name="schedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horario</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder='{"lunes": "09:00-17:00", "martes": "09:00-17:00"}'
                            rows={2}
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
                          <FormLabel>Activo</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            El doctor estará disponible para citas
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
                      {editingDoctor ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {doctors.length === 0 ? (
          <div className="text-center py-6">
            <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay doctores registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {doctors.map((doctor: Doctor) => (
              <div 
                key={doctor.id} 
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium">{doctor.name}</h3>
                    <Badge variant={doctor.active ? 'default' : 'secondary'}>
                      {doctor.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Badge variant="outline">
                      {getSpecialtyName(doctor.specialtyId)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>📧 {doctor.email}</p>
                    {doctor.phone && <p>📞 {doctor.phone}</p>}
                    {doctor.licenseNumber && <p>🏥 Colegiado: {doctor.licenseNumber}</p>}
                    {doctor.experience && <p>⏱️ {doctor.experience}</p>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(doctor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {doctor.active ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(doctor.id)}
                      className="text-yellow-600 hover:text-yellow-700"
                      title="Archivar doctor"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleActivate(doctor.id)}
                      className="text-green-600 hover:text-green-700"
                      title="Activar doctor"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doctor.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Archivar permanentemente"
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