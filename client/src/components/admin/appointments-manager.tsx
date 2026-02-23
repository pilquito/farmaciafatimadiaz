import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Tipo para representar una cita
interface Appointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  specialtyId: number | null;
  doctorId: number | null;
  reason: string;
  insurance: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  userId: number | null;
}

// Interfaces para especialidades y doctores
interface Specialty {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
}

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
}

// Esquema para el formulario de actualización de citas
const appointmentUpdateSchema = z.object({
  name: z.string().min(3, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(9, "Teléfono requerido"),
  date: z.string().min(1, "Fecha requerida"),
  time: z.string().min(1, "Hora requerida"),
  specialtyId: z.number().optional(),
  doctorId: z.number().optional(),
  reason: z.string().min(3, "Motivo requerido"),
  insurance: z.string().optional(),
  notes: z.string().optional(),
  status: z.string(),
});

type AppointmentUpdateValues = z.infer<typeof appointmentUpdateSchema>;

export function AppointmentsManager() {
  const queryClient = useQueryClient();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Estado para filtros
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specialityFilter, setSpecialityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Obtener todas las citas
  const { data: appointments = [], isLoading, refetch } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
    refetchInterval: 5000, // Refrescar cada 5 segundos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Obtener especialidades y doctores
  const { data: specialties = [] } = useQuery<Specialty[]>({
    queryKey: ['/api/specialties'],
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });
  
  // Formulario para actualizar el estado de la cita
  const form = useForm<AppointmentUpdateValues>({
    resolver: zodResolver(appointmentUpdateSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      specialtyId: undefined,
      doctorId: undefined,
      reason: "",
      insurance: "",
      notes: "",
      status: "pendiente",
    },
  });
  
  // Funciones auxiliares para obtener nombres
  const getSpecialtyName = (specialtyId: number | null) => {
    if (!specialtyId) return 'Sin especialidad';
    const specialty = specialties.find(s => s.id === specialtyId);
    return specialty?.name || 'Especialidad desconocida';
  };

  const getDoctorName = (doctorId: number | null) => {
    if (!doctorId) return 'Sin asignar';
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.name || 'Doctor desconocido';
  };

  // Filtrar citas según los criterios seleccionados
  const filteredAppointments = appointments.filter(appointment => {
    // Filtro por estado
    if (statusFilter !== "all" && appointment.status !== statusFilter) {
      return false;
    }
    
    // Filtro por especialidad
    if (specialityFilter !== "all") {
      const specialtyName = getSpecialtyName(appointment.specialtyId);
      if (specialtyName !== specialityFilter) {
        return false;
      }
    }
    
    // Filtro por búsqueda (nombre, email, teléfono)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        appointment.name.toLowerCase().includes(query) ||
        appointment.email.toLowerCase().includes(query) ||
        appointment.phone.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Calcular especialidades únicas para el filtro
  const uniqueSpecialties = Array.from(new Set(
    appointments
      .map(a => getSpecialtyName(a.specialtyId))
      .filter(name => name !== 'Sin especialidad')
  ));
  
  // Mutación para actualizar una cita completa
  const updateAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentUpdateValues & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest(`/api/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData)
      });
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      await refetch(); // Forzar refetch inmediato
      setIsUpdateDialogOpen(false);
      setSelectedAppointment(null);
      form.reset();
      toast({
        title: "Cita actualizada",
        description: "La cita ha sido actualizada exitosamente.",
      });
    },
    onError: (error) => {
      console.error("Error al actualizar la cita:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cita. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });
  
  // Mutación para eliminar una cita
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/appointments/${id}`, {
        method: "DELETE"
      });
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      await refetch(); // Forzar refetch inmediato
      setIsDetailsDialogOpen(false);
      setSelectedAppointment(null);
      toast({
        title: "Cita eliminada",
        description: "La cita ha sido eliminada exitosamente.",
      });
    },
    onError: (error) => {
      console.error("Error al eliminar la cita:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la cita. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });
  
  // Esquema para creación de citas
  const appointmentCreateSchema = z.object({
    name: z.string().min(3, "Nombre requerido"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(9, "Teléfono requerido"),
    date: z.string().min(1, "Fecha requerida"),
    time: z.string().min(1, "Hora requerida"),
    speciality: z.string().min(1, "Especialidad requerida"),
    doctor: z.string().optional(),
    reason: z.string().min(3, "Motivo requerido"),
    insurance: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().default("pendiente"),
  });
  
  type AppointmentCreateValues = z.infer<typeof appointmentCreateSchema>;
  
  // Formulario para crear citas
  const createForm = useForm<AppointmentCreateValues>({
    resolver: zodResolver(appointmentCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      date: format(new Date(), 'yyyy-MM-dd'),
      time: "09:00",
      speciality: "",
      doctor: "",
      reason: "",
      insurance: "",
      notes: "",
      status: "pendiente",
    },
  });
  
  // Mutación para crear una cita
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentCreateValues) => {
      const response = await apiRequest("/api/appointments", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Cita creada",
        description: "La cita ha sido creada exitosamente.",
      });
    },
    onError: (error) => {
      console.error("Error al crear la cita:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la cita. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });
  
  // Manejar la visualización de detalles de una cita
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };
  
  // Manejar la actualización de estado de una cita
  const handleUpdateStatus = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    form.reset({
      name: appointment.name,
      email: appointment.email,
      phone: appointment.phone,
      date: appointment.date,
      time: appointment.time,
      specialtyId: appointment.specialtyId || undefined,
      doctorId: appointment.doctorId || undefined,
      reason: appointment.reason,
      insurance: appointment.insurance || "",
      notes: appointment.notes || "",
      status: appointment.status,
    });
    setIsUpdateDialogOpen(true);
  };
  
  // Función para formatear la fecha
  const formatAppointmentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return dateStr;
    }
  };
  
  // Manejar el envío del formulario de actualización
  function onSubmitUpdate(data: AppointmentUpdateValues) {
    if (selectedAppointment) {
      updateAppointmentMutation.mutate({
        ...data,
        id: selectedAppointment.id,
      });
    }
  }
  
  // Obtener el color de la insignia según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "confirmada":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "completada":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "cancelada":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Gestión de Citas</h2>
          <p className="text-neutral-500">Administra las citas del centro médico</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={isLoading}
            className="bg-white border-neutral-200"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Actualizar
          </Button>
          <Button 
            variant="outline" 
            className="bg-white border-neutral-200"
            onClick={() => {
              setStatusFilter("all");
              setSpecialityFilter("all");
              setSearchQuery("");
            }}
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Restablecer
          </Button>
          
          <Button 
            className="bg-primary hover:bg-primary-dark text-white"
            onClick={() => {
              setSelectedAppointment(null);
              setIsCreateDialogOpen(true);
            }}
          >
            <i className="fas fa-calendar-plus mr-2"></i>
            Nueva Cita
          </Button>
        </div>
      </div>
      
      {/* Filtros */}
      <Card className="bg-white border-neutral-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Especialidad</label>
              <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas las especialidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las especialidades</SelectItem>
                  {uniqueSpecialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Buscar</label>
              <Input
                placeholder="Buscar por nombre, email, teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-700">Cargando citas...</p>
        </div>
      ) : (
        <>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-10 bg-neutral-50 rounded-lg border">
              <div className="text-5xl text-neutral-300 mb-4">
                <i className="fas fa-calendar-times"></i>
              </div>
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                No hay citas
              </h3>
              <p className="text-neutral-500 mb-6">
                {searchQuery || statusFilter !== "all" || specialityFilter !== "all"
                  ? "No hay citas que coincidan con los filtros seleccionados."
                  : "Todavía no hay citas programadas en el sistema."}
              </p>
              {searchQuery || statusFilter !== "all" || specialityFilter !== "all" ? (
                <Button 
                  variant="outline" 
                  className="border-neutral-200"
                  onClick={() => {
                    setStatusFilter("all");
                    setSpecialityFilter("all");
                    setSearchQuery("");
                  }}
                >
                  <i className="fas fa-filter-circle-xmark mr-2"></i>
                  Quitar filtros
                </Button>
              ) : (
                <Button className="bg-primary hover:bg-primary-dark text-white">
                  <i className="fas fa-calendar-plus mr-2"></i>
                  Añadir Cita
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-50">
                    <TableHead>Paciente</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="font-medium">{appointment.name}</div>
                        <div className="text-sm text-neutral-500">{appointment.email}</div>
                      </TableCell>
                      <TableCell>
                        <div>{formatAppointmentDate(appointment.date)}</div>
                        <div className="text-sm text-neutral-500">{appointment.time}</div>
                      </TableCell>
                      <TableCell>
                        <div>{getSpecialtyName(appointment.specialtyId)}</div>
                        {appointment.doctorId && (
                          <div className="text-sm text-neutral-500">
                            <span className="font-medium">Dr.</span> {getDoctorName(appointment.doctorId)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("px-2 py-1 capitalize", getStatusColor(appointment.status))}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(appointment)}
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUpdateStatus(appointment)}
                          >
                            <i className="fas fa-pen"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
      
      {/* Diálogo de detalles de la cita */}
      {selectedAppointment && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalles de la Cita</DialogTitle>
              <DialogDescription>
                Información completa de la cita seleccionada
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Paciente</h4>
                  <p className="font-medium">{selectedAppointment.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Estado</h4>
                  <Badge className={cn("mt-1 capitalize", getStatusColor(selectedAppointment.status))}>
                    {selectedAppointment.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Email</h4>
                  <p>{selectedAppointment.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Teléfono</h4>
                  <p>{selectedAppointment.phone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Fecha</h4>
                  <p>{formatAppointmentDate(selectedAppointment.date)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Hora</h4>
                  <p>{selectedAppointment.time}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Especialidad</h4>
                  <p>{getSpecialtyName(selectedAppointment.specialtyId)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Doctor</h4>
                  <p>{getDoctorName(selectedAppointment.doctorId)}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-neutral-500">Motivo de la consulta</h4>
                <p className="mt-1">{selectedAppointment.reason}</p>
              </div>
              
              {selectedAppointment.insurance && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Seguro médico</h4>
                  <p className="mt-1">{selectedAppointment.insurance}</p>
                </div>
              )}
              
              {selectedAppointment.notes && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Notas</h4>
                  <p className="mt-1">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-neutral-500">Creada el</h4>
                <p className="mt-1">{format(new Date(selectedAppointment.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setIsDetailsDialogOpen(false)}
              >
                Cerrar
              </Button>
              <Button 
                className="bg-primary hover:bg-primary-dark text-white"
                onClick={() => {
                  setIsDetailsDialogOpen(false);
                  handleUpdateStatus(selectedAppointment);
                }}
              >
                <i className="fas fa-pen mr-2"></i>
                Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Diálogo de creación de cita */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nueva Cita</DialogTitle>
            <DialogDescription>
              Completa el formulario para agendar una nueva cita
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-neutral-700 mb-4">
              Para crear una cita, utiliza el formulario completo de citas en la sección pública:
            </p>
            <Button 
              onClick={() => {
                setIsCreateDialogOpen(false);
                window.open('/citas', '_blank');
              }}
              className="w-full bg-primary hover:bg-primary-dark text-white"
            >
              Ir al formulario de citas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de actualización de cita */}
      {selectedAppointment && (
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Cita</DialogTitle>
              <DialogDescription>
                Modifica los datos de la cita médica
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitUpdate)} className="space-y-4">
                {/* Datos del paciente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nombre del paciente" />
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
                          <Input {...field} type="email" placeholder="correo@ejemplo.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Número de teléfono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="insurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seguro Médico</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Compañía de seguros" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Fecha y hora */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Especialidad y doctor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="specialtyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidad</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} value={field.value ? String(field.value) : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una especialidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Sin especialidad</SelectItem>
                            {specialties.map((specialty) => (
                              <SelectItem key={specialty.id} value={String(specialty.id)}>
                                {specialty.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor Asignado</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} value={field.value ? String(field.value) : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Sin asignar</SelectItem>
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={String(doctor.id)}>
                                {doctor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Motivo de la cita */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo de la Cita</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Describe el motivo de la consulta" className="min-h-[80px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="confirmada">Confirmada</SelectItem>
                            <SelectItem value="completada">Completada</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor asignado</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Sin asignar</SelectItem>
                            {doctors.filter(doctor => doctor.active).map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                {doctor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Añadir notas sobre la cita"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsUpdateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white"
                    disabled={updateAppointmentMutation.isPending}
                  >
                    {updateAppointmentMutation.isPending ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        Actualizando...
                      </>
                    ) : (
                      "Guardar Cambios"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}