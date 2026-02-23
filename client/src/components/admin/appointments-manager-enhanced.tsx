import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
  userId?: number | null;
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

// Tipo para representar un recurso médico
interface MedicalResource {
  id: number;
  name: string;
  type: string;
  available: boolean;
}

// Lista de especialidades médicas
const SPECIALITIES = [
  "Medicina General",
  "Pediatría",
  "Cardiología",
  "Dermatología",
  "Neurología",
  "Oftalmología",
  "Ginecología",
  "Traumatología",
  "Odontología",
  "Psiquiatría",
  "Psicología",
  "Nutrición",
  "Fisioterapia",
  "Radiología",
  "Geriatría"
];

// Los doctores y especialidades se obtienen de la base de datos

// Lista de recursos médicos (simulada)
const MOCK_MEDICAL_RESOURCES: MedicalResource[] = [
  { id: 1, name: "Sala de consulta 1", type: "Sala", available: true },
  { id: 2, name: "Sala de consulta 2", type: "Sala", available: true },
  { id: 3, name: "Sala de procedimientos", type: "Sala", available: true },
  { id: 4, name: "Equipo de rayos X", type: "Equipo", available: true },
  { id: 5, name: "Ecógrafo", type: "Equipo", available: true }
];

// Esquema para el formulario de actualización de citas
const appointmentUpdateSchema = z.object({
  status: z.string(),
  specialty: z.string().optional(),
  doctor: z.string().optional(),
  notes: z.string().optional(),
  resources: z.array(z.number()).optional(),
});

type AppointmentUpdateValues = z.infer<typeof appointmentUpdateSchema>;

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
  resources: z.array(z.number()).optional(),
});

type AppointmentCreateValues = z.infer<typeof appointmentCreateSchema>;

export function AppointmentsManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("todas");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedResources, setSelectedResources] = useState<number[]>([]);
  
  // Estado para filtros
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specialityFilter, setSpecialityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  
  // Estado para vista del día
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Obtener todas las citas
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });

  // Obtener especialidades
  const { data: specialties = [] } = useQuery<Specialty[]>({
    queryKey: ['/api/specialties'],
  });

  // Obtener doctores
  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });

  // Funciones helper para convertir IDs a nombres
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
  
  // Formulario para actualizar el estado de la cita
  const form = useForm<AppointmentUpdateValues>({
    resolver: zodResolver(appointmentUpdateSchema),
    defaultValues: {
      status: "pendiente",
      doctor: "0",
      notes: "0",
      resources: [],
    },
  });
  
  // Formulario para crear citas
  const createForm = useForm<AppointmentCreateValues>({
    resolver: zodResolver(appointmentCreateSchema),
    defaultValues: {
      name: "0",
      email: "0",
      phone: "0",
      date: format(new Date(), 'yyyy-MM-dd'),
      time: "09:00",
      speciality: "0",
      doctor: "0",
      reason: "0",
      insurance: "0",
      notes: "0",
      status: "pendiente",
      resources: [],
    },
  });
  
  // Filtrar citas según los criterios seleccionados
  const filteredAppointments = appointments.filter(appointment => {
    // Filtro por tab
    if (activeTab === "pendientes" && appointment.status !== "pendiente") {
      return false;
    }
    if (activeTab === "confirmadas" && appointment.status !== "confirmada") {
      return false;
    }
    if (activeTab === "completadas" && appointment.status !== "completada") {
      return false;
    }
    if (activeTab === "canceladas" && appointment.status !== "cancelada") {
      return false;
    }
    if (activeTab === "sinasignar" && appointment.doctorId) {
      return false;
    }
    
    // Filtro por estado
    if (statusFilter !== "all" && appointment.status !== statusFilter) {
      return false;
    }
    
    // Filtro por especialidad
    if (specialityFilter !== "all" && appointment.specialtyId?.toString() !== specialityFilter) {
      return false;
    }
    
    // Filtro por fecha
    if (dateFilter) {
      const appointmentDate = format(new Date(appointment.date), 'yyyy-MM-dd');
      if (appointmentDate !== dateFilter) {
        return false;
      }
    }
    
    // Filtro por búsqueda (nombre, email, teléfono)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        appointment.name.toLowerCase().includes(query) ||
        appointment.email.toLowerCase().includes(query) ||
        appointment.phone.toLowerCase().includes(query) ||
        (appointment.doctorId && getDoctorName(appointment.doctorId).toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Calcular especialidades únicas para el filtro
  const specialities = Array.from(new Set(appointments.map(a => getSpecialtyName(a.specialtyId))));
  
  // Mutación para actualizar el estado de una cita
  const updateAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentUpdateValues & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest(`/api/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ 
          status: updateData.status,
          doctor: updateData.doctor,
          notes: updateData.notes,
          resources: updateData.resources
        })
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setIsUpdateDialogOpen(false);
      setIsAssignDialogOpen(false);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
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
  
  // Función para formatear la fecha
  const formatAppointmentDate = (dateStr: string) => {
    try {
      if (!dateStr) return "";
      const date = parseISO(dateStr);
      if (!isValid(date)) return dateStr;
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return dateStr;
    }
  };
  
  // Manejar la visualización de detalles de una cita
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };
  
  // Manejar la actualización de estado de una cita
  const handleUpdateStatus = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    form.reset({
      status: appointment.status,
      specialty: appointment.specialtyId ? String(appointment.specialtyId) : "0",
      doctor: appointment.doctorId ? String(appointment.doctorId) : "0",
      notes: appointment.notes || "",
      resources: [],
    });
    setIsUpdateDialogOpen(true);
  };
  
  // Manejar la asignación de médico y recursos a una cita
  const handleAssignResources = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    form.reset({
      status: appointment.status,
      specialty: appointment.specialtyId ? String(appointment.specialtyId) : "0",
      doctor: appointment.doctorId ? String(appointment.doctorId) : "0",
      notes: appointment.notes || "",
      resources: [],
    });
    setIsAssignDialogOpen(true);
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

  // Manejar el envío del formulario de asignación
  function onSubmitAssign(data: AppointmentUpdateValues) {
    if (selectedAppointment) {
      updateAppointmentMutation.mutate({
        ...data,
        resources: selectedResources,
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

  // Función para filtrar doctores por especialidad
  const filterDoctorsBySpecialty = (specialtyId: number | null) => {
    if (!specialtyId) return doctors;
    return doctors.filter(doctor => 
      doctor.specialtyId === specialtyId
    );
  };

  // Calcular estadísticas de citas
  const appointmentStats = {
    total: appointments.length,
    pendientes: appointments.filter(a => a.status === "pendiente").length,
    confirmadas: appointments.filter(a => a.status === "confirmada").length,
    completadas: appointments.filter(a => a.status === "completada").length,
    canceladas: appointments.filter(a => a.status === "cancelada").length,
    sinAsignar: appointments.filter(a => !a.doctorId).length
  };

  // Filtrar citas por fecha seleccionada para vista del día
  const appointmentsForSelectedDate = appointments.filter(appointment => {
    const appointmentDate = format(parseISO(appointment.date), 'yyyy-MM-dd');
    return appointmentDate === selectedDate;
  }).sort((a, b) => a.time.localeCompare(b.time));

  // Función para renderizar la vista del día
  const renderDayView = () => {
    const timeSlots = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 8; // 8 AM a 7 PM
      return `${hour.toString().padStart(2, '0')}:00`;
    });

    return (
      <Card className="bg-white border-neutral-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Vista del Día</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
              <span className="text-sm text-neutral-500">
                {appointmentsForSelectedDate.length} citas
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeSlots.map(timeSlot => {
              const appointmentsAtTime = appointmentsForSelectedDate.filter(
                appointment => appointment.time.startsWith(timeSlot.split(':')[0])
              );
              
              return (
                <div key={timeSlot} className="flex border-b border-neutral-100 pb-2">
                  <div className="w-20 text-sm font-medium text-neutral-600 py-2">
                    {timeSlot}
                  </div>
                  <div className="flex-1 min-h-[2.5rem]">
                    {appointmentsAtTime.length > 0 ? (
                      <div className="space-y-1">
                        {appointmentsAtTime.map(appointment => (
                          <div
                            key={appointment.id}
                            className="bg-blue-50 border border-blue-200 rounded-lg p-2 cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => handleViewDetails(appointment)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm text-blue-900">
                                  {appointment.time} - {appointment.name}
                                </p>
                                <p className="text-xs text-blue-700">
                                  {getSpecialtyName(appointment.specialtyId)} | {getDoctorName(appointment.doctorId)}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  {appointment.reason}
                                </p>
                              </div>
                              <Badge className={cn("text-xs", getStatusColor(appointment.status))}>
                                {appointment.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-2 text-sm text-neutral-400 italic">
                        Sin citas programadas
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
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
            className="bg-white border-neutral-200"
            onClick={() => {
              setStatusFilter("all");
              setSpecialityFilter("all");
              setSearchQuery("");
              setDateFilter("");
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
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-neutral-800">{appointmentStats.total}</span>
              <span className="text-sm text-neutral-500">Total</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-yellow-600">{appointmentStats.pendientes}</span>
              <span className="text-sm text-neutral-500">Pendientes</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-green-600">{appointmentStats.confirmadas}</span>
              <span className="text-sm text-neutral-500">Confirmadas</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-blue-600">{appointmentStats.completadas}</span>
              <span className="text-sm text-neutral-500">Completadas</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-red-600">{appointmentStats.canceladas}</span>
              <span className="text-sm text-neutral-500">Canceladas</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-purple-600">{appointmentStats.sinAsignar}</span>
              <span className="text-sm text-neutral-500">Sin asignar</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Botón para crear nueva cita */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-neutral-800">Gestión de Citas</h2>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <i className="fas fa-plus mr-2"></i>
          Crear Nueva Cita
        </Button>
      </div>

      {/* Tabs y Filtros */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-neutral-100 p-1 rounded-lg mb-4">
          <TabsTrigger 
            value="todas" 
            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Todas
          </TabsTrigger>
          <TabsTrigger 
            value="calendario" 
            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Vista del Día
          </TabsTrigger>
          <TabsTrigger 
            value="pendientes" 
            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Pendientes
          </TabsTrigger>
          <TabsTrigger 
            value="confirmadas" 
            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Confirmadas
          </TabsTrigger>
          <TabsTrigger 
            value="completadas" 
            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Completadas
          </TabsTrigger>
          <TabsTrigger 
            value="canceladas" 
            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Canceladas
          </TabsTrigger>
          <TabsTrigger 
            value="sinasignar" 
            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Sin asignar
          </TabsTrigger>
        </TabsList>
        
        <Card className="bg-white border-neutral-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    {specialities.map((speciality) => (
                      <SelectItem key={speciality} value={speciality}>
                        {speciality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha</label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
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

        <TabsContent value="todas" className="mt-6 p-0">
          {renderAppointmentsTable(filteredAppointments)}
        </TabsContent>
        
        <TabsContent value="calendario" className="mt-6 p-0">
          {renderDayView()}
        </TabsContent>
        
        <TabsContent value="pendientes" className="mt-6 p-0">
          {renderAppointmentsTable(filteredAppointments)}
        </TabsContent>
        
        <TabsContent value="confirmadas" className="mt-6 p-0">
          {renderAppointmentsTable(filteredAppointments)}
        </TabsContent>
        
        <TabsContent value="completadas" className="mt-6 p-0">
          {renderAppointmentsTable(filteredAppointments)}
        </TabsContent>
        
        <TabsContent value="canceladas" className="mt-6 p-0">
          {renderAppointmentsTable(filteredAppointments)}
        </TabsContent>
        
        <TabsContent value="sinasignar" className="mt-6 p-0">
          {renderAppointmentsTable(filteredAppointments)}
        </TabsContent>
      </Tabs>
      
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
                <p className="mt-1">{
                  selectedAppointment.createdAt
                    ? format(new Date(selectedAppointment.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })
                    : "No disponible"
                }</p>
              </div>
            </div>
            
            <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="order-1 sm:order-none"
                onClick={() => setIsDetailsDialogOpen(false)}
              >
                Cerrar
              </Button>
              <div className="flex flex-1 gap-2 order-2 sm:order-none">
                <Button 
                  variant="destructive"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de eliminar la cita de ${selectedAppointment.name}?`)) {
                      deleteAppointmentMutation.mutate(selectedAppointment.id);
                    }
                  }}
                >
                  <i className="fas fa-trash-alt mr-2"></i>
                  Eliminar
                </Button>
                <Button 
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setIsDetailsDialogOpen(false);
                    handleUpdateStatus(selectedAppointment);
                  }}
                >
                  <i className="fas fa-edit mr-2"></i>
                  Actualizar
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Diálogo de actualización de cita */}
      {selectedAppointment && (
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Actualizar Cita</DialogTitle>
              <DialogDescription>
                Modifica el estado y los detalles de la cita
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitUpdate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="confirmada">Confirmada</SelectItem>
                          <SelectItem value="completada">Completada</SelectItem>
                          <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidad</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una especialidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Sin especialidad</SelectItem>
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
                  name="doctor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor asignado</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Sin asignar</SelectItem>
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
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Notas internas" rows={3} {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUpdateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateAppointmentMutation.isPending}
                  >
                    {updateAppointmentMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Actualizando...
                      </>
                    ) : "Guardar cambios"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Diálogo de asignación de recursos */}
      {selectedAppointment && (
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Asignar Recursos</DialogTitle>
              <DialogDescription>
                Asigna médicos y recursos para esta cita
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitAssign)} className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Detalles de la Cita</h3>
                  <div className="bg-neutral-50 p-3 rounded-md">
                    <p><span className="font-medium">Paciente:</span> {selectedAppointment.name}</p>
                    <p><span className="font-medium">Fecha:</span> {formatAppointmentDate(selectedAppointment.date)}</p>
                    <p><span className="font-medium">Hora:</span> {selectedAppointment.time}</p>
                    <p><span className="font-medium">Especialidad:</span> {selectedAppointment.specialtyId}</p>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidad</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una especialidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Sin especialidad</SelectItem>
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
                  name="doctor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor asignado</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Sin asignar</SelectItem>
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
                
                <div>
                  <FormLabel className="block mb-2">Recursos necesarios</FormLabel>
                  <div className="grid grid-cols-1 gap-2 mt-1">
                    {MOCK_MEDICAL_RESOURCES.map((resource) => (
                      <div key={resource.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`resource-${resource.id}`}
                          className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                          checked={selectedResources.includes(resource.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedResources([...selectedResources, resource.id]);
                            } else {
                              setSelectedResources(selectedResources.filter(id => id !== resource.id));
                            }
                          }}
                          disabled={!resource.available}
                        />
                        <label 
                          htmlFor={`resource-${resource.id}`}
                          className={cn(
                            "text-sm font-medium",
                            !resource.available && "text-neutral-400"
                          )}
                        >
                          {resource.name} ({resource.type})
                          {!resource.available && " - No disponible"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas adicionales</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Instrucciones o requerimientos especiales" rows={2} {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAssignDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateAppointmentMutation.isPending}
                  >
                    {updateAppointmentMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Asignando...
                      </>
                    ) : "Confirmar asignación"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Diálogo de creación de cita */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Cita</DialogTitle>
            <DialogDescription>
              Añade una nueva cita al sistema
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit((data) => createAppointmentMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del paciente</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Número de teléfono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="speciality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona especialidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SPECIALITIES.map((speciality) => (
                            <SelectItem key={speciality} value={speciality}>
                              {speciality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="doctor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor (opcional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Sin asignar</SelectItem>
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
                
                <FormField
                  control={createForm.control}
                  name="insurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seguro médico (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del seguro" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={createForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo de la consulta</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe brevemente el motivo de la consulta" rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas adicionales (opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notas internas" rows={2} {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="confirmada">Confirmada</SelectItem>
                        <SelectItem value="completada">Completada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createAppointmentMutation.isPending}
                >
                  {createAppointmentMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Creando...
                    </>
                  ) : "Crear Cita"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Función para renderizar la tabla de citas
  function renderAppointmentsTable(appointments: Appointment[]) {
    if (isLoading) {
      return (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-700">Cargando citas...</p>
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <div className="text-center py-10 bg-neutral-50 rounded-lg border">
          <div className="text-5xl text-neutral-300 mb-4">
            <i className="fas fa-calendar-times"></i>
          </div>
          <h3 className="text-xl font-semibold text-neutral-700 mb-2">
            No hay citas
          </h3>
          <p className="text-neutral-500 mb-6">
            {searchQuery || statusFilter !== "all" || specialityFilter !== "all" || dateFilter
              ? "No hay citas que coincidan con los filtros seleccionados."
              : "Todavía no hay citas programadas en el sistema."}
          </p>
          {searchQuery || statusFilter !== "all" || specialityFilter !== "all" || dateFilter ? (
            <Button 
              variant="outline" 
              className="border-neutral-200"
              onClick={() => {
                setStatusFilter("all");
                setSpecialityFilter("all");
                setSearchQuery("");
                setDateFilter("");
              }}
            >
              <i className="fas fa-filter-circle-xmark mr-2"></i>
              Quitar filtros
            </Button>
          ) : (
            <Button 
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={() => {
                setSelectedAppointment(null);
                setIsCreateDialogOpen(true);
              }}
            >
              <i className="fas fa-calendar-plus mr-2"></i>
              Añadir Cita
            </Button>
          )}
        </div>
      );
    }

    return (
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
            {appointments.map((appointment) => (
              <TableRow key={appointment.id} className="hover:bg-neutral-50">
                <TableCell>
                  <div className="font-medium">{appointment.name}</div>
                  <div className="text-sm text-neutral-500">{appointment.email}</div>
                </TableCell>
                <TableCell>
                  <div>{formatAppointmentDate(appointment.date)}</div>
                  <div className="text-sm text-neutral-500">{appointment.time}</div>
                </TableCell>
                <TableCell>
                  <div>{appointment.specialtyId}</div>
                  {appointment.doctorId ? (
                    <div className="text-sm text-neutral-500">
                      <span className="font-medium">Dr.</span> {appointment.doctorId}
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 font-medium">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      Sin asignar
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
                      title="Ver detalles"
                      onClick={() => handleViewDetails(appointment)}
                    >
                      <i className="fas fa-eye"></i>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Actualizar cita"
                      onClick={() => handleUpdateStatus(appointment)}
                    >
                      <i className="fas fa-pen"></i>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Asignar recursos"
                      onClick={() => handleAssignResources(appointment)}
                    >
                      <i className="fas fa-user-md"></i>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}