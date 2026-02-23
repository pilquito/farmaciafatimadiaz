import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import CalendarView from "./calendar-view";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  UserX
} from "lucide-react";

interface Appointment {
  id: number;
  userId?: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  specialtyId?: number;
  doctorId?: number;
  reason: string;
  insurance?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  schedule: string;
  active: boolean;
}

interface Specialty {
  id: number;
  name: string;
  description: string;
}

interface DoctorSchedule {
  id: number;
  doctorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
}

interface DoctorException {
  id: number;
  doctorId: number;
  date: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  isAvailable: boolean;
  createdAt: string;
}

interface AppointmentDuration {
  id: number;
  specialtyId: number;
  duration: number;
  description?: string;
}

const daysOfWeek = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export default function AppointmentsFormManager() {
  const [selectedTab, setSelectedTab] = useState("calendar");
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    isActive: true,
  });
  const [exceptionForm, setExceptionForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
    isAvailable: false,
  });
  const [durationForm, setDurationForm] = useState({
    specialtyId: "",
    duration: "30",
    description: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  const { data: specialties = [] } = useQuery<Specialty[]>({
    queryKey: ["/api/specialties"],
  });

  const { data: schedules = [] } = useQuery<DoctorSchedule[]>({
    queryKey: ["/api/doctors", selectedDoctor, "schedules"],
    enabled: !!selectedDoctor,
    queryFn: async () => {
      if (!selectedDoctor) return [];
      const response = await fetch(`/api/doctors/${selectedDoctor}/schedules`);
      if (!response.ok) throw new Error("Failed to fetch schedules");
      return response.json();
    },
  });

  const { data: exceptions = [] } = useQuery<DoctorException[]>({
    queryKey: ["/api/doctors", selectedDoctor, "exceptions"],
    enabled: !!selectedDoctor,
    queryFn: async () => {
      if (!selectedDoctor) return [];
      const response = await fetch(`/api/doctors/${selectedDoctor}/exceptions`);
      if (!response.ok) throw new Error("Failed to fetch exceptions");
      return response.json();
    },
  });

  const { data: durations = [] } = useQuery<AppointmentDuration[]>({
    queryKey: ["/api/appointment-durations"],
  });

  // Mutations
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId, data }: { appointmentId: number; data: any }) => {
      return await apiRequest(`/api/appointments/${appointmentId}/status`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({ title: "Estado de cita actualizado" });
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedDoctor) throw new Error("No doctor selected");
      return await apiRequest(`/api/doctors/${selectedDoctor}/schedules`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors", selectedDoctor, "schedules"] });
      toast({ title: "Horario agregado exitosamente" });
      setScheduleForm({ dayOfWeek: "", startTime: "", endTime: "", isActive: true });
    },
  });

  const createExceptionMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedDoctor) throw new Error("No doctor selected");
      return await apiRequest(`/api/doctors/${selectedDoctor}/exceptions`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors", selectedDoctor, "exceptions"] });
      toast({ title: "Excepción creada exitosamente" });
      setExceptionForm({ date: "", startTime: "", endTime: "", reason: "", isAvailable: false });
    },
  });

  const createDurationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/appointment-durations", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointment-durations"] });
      toast({ title: "Duración configurada exitosamente" });
      setDurationForm({ specialtyId: "", duration: "30", description: "" });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (scheduleId: number) => {
      return await apiRequest(`/api/schedules/${scheduleId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors", selectedDoctor, "schedules"] });
      toast({ title: "Horario eliminado" });
    },
  });

  const deleteExceptionMutation = useMutation({
    mutationFn: async (exceptionId: number) => {
      return await apiRequest(`/api/exceptions/${exceptionId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors", selectedDoctor, "exceptions"] });
      toast({ title: "Excepción eliminada" });
    },
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.dayOfWeek || !scheduleForm.startTime || !scheduleForm.endTime || !selectedDoctor) {
      toast({ title: "Completa todos los campos y selecciona un doctor", variant: "destructive" });
      return;
    }
    createScheduleMutation.mutate({
      dayOfWeek: parseInt(scheduleForm.dayOfWeek),
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      isActive: scheduleForm.isActive,
    });
  };

  const handleExceptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionForm.date || !exceptionForm.reason || !selectedDoctor) {
      toast({ title: "Completa todos los campos requeridos y selecciona un doctor", variant: "destructive" });
      return;
    }
    createExceptionMutation.mutate(exceptionForm);
  };

  const handleDurationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!durationForm.specialtyId || !durationForm.duration) {
      toast({ title: "Completa todos los campos requeridos", variant: "destructive" });
      return;
    }
    createDurationMutation.mutate({
      specialtyId: parseInt(durationForm.specialtyId),
      duration: parseInt(durationForm.duration),
      description: durationForm.description || null,
    });
  };

  const updateAppointmentStatus = (appointmentId: number, status: string) => {
    updateAppointmentMutation.mutate({ appointmentId, data: { status } });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { variant: "secondary" as const, icon: Clock },
      confirmada: { variant: "default" as const, icon: CheckCircle },
      completada: { variant: "outline" as const, icon: UserCheck },
      cancelada: { variant: "destructive" as const, icon: UserX },
      "no-asistio": { variant: "destructive" as const, icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getDoctorName = (doctorId?: number) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : "Sin asignar";
  };

  const getSpecialtyName = (specialtyId?: number) => {
    const specialty = specialties.find(s => s.id === specialtyId);
    return specialty ? specialty.name : "Sin asignar";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestor de Citas y Horarios</h1>
          <p className="text-muted-foreground">
            Administra las citas médicas y configura los horarios de los doctores
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="appointments">Citas</TabsTrigger>
          <TabsTrigger value="schedules">Horarios</TabsTrigger>
          <TabsTrigger value="exceptions">Excepciones</TabsTrigger>
          <TabsTrigger value="durations">Duraciones</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarView />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Citas Médicas ({appointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Especialidad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{appointment.name}</div>
                            <div className="text-sm text-muted-foreground">{appointment.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{appointment.date}</TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>{getDoctorName(appointment.doctorId)}</TableCell>
                        <TableCell>{getSpecialtyName(appointment.specialtyId)}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(status) => updateAppointmentStatus(appointment.id, status)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Cambiar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="confirmada">Confirmar</SelectItem>
                              <SelectItem value="completada">Completar</SelectItem>
                              <SelectItem value="cancelada">Cancelar</SelectItem>
                              <SelectItem value="no-asistio">No asistió</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Horario de Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleScheduleSubmit} className="space-y-4">
                  <div>
                    <Label>Doctor</Label>
                    <Select
                      value={selectedDoctor?.toString() || ""}
                      onValueChange={(value) => setSelectedDoctor(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={String(doctor.id)}>
                            {doctor.name} - {doctor.specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Día de la semana</Label>
                    <Select
                      value={scheduleForm.dayOfWeek}
                      onValueChange={(value) => setScheduleForm(prev => ({ ...prev, dayOfWeek: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar día" />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day.value} value={String(day.value)}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Hora inicio</Label>
                      <Input
                        type="time"
                        value={scheduleForm.startTime}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Hora fin</Label>
                      <Input
                        type="time"
                        value={scheduleForm.endTime}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={scheduleForm.isActive}
                      onCheckedChange={(checked) => setScheduleForm(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label>Activo</Label>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Horario
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horarios Actuales</CardTitle>
                <CardDescription>
                  {selectedDoctor ? `Horarios de ${doctors.find(d => d.id === selectedDoctor)?.name}` : "Selecciona un doctor"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDoctor ? (
                  <div className="space-y-2">
                    {schedules.map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">
                            {daysOfWeek.find(d => d.value === schedule.dayOfWeek)?.label}
                          </span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                          <Badge variant={schedule.isActive ? "default" : "secondary"} className="ml-2">
                            {schedule.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {schedules.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No hay horarios configurados
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Selecciona un doctor para ver sus horarios
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crear Excepción de Horario</CardTitle>
                <CardDescription>
                  Bloquea días específicos o agrega disponibilidad excepcional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleExceptionSubmit} className="space-y-4">
                  <div>
                    <Label>Doctor</Label>
                    <Select
                      value={selectedDoctor?.toString() || ""}
                      onValueChange={(value) => setSelectedDoctor(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={String(doctor.id)}>
                            {doctor.name} - {doctor.specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      value={exceptionForm.date}
                      onChange={(e) => setExceptionForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Hora inicio (opcional)</Label>
                      <Input
                        type="time"
                        value={exceptionForm.startTime}
                        onChange={(e) => setExceptionForm(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Hora fin (opcional)</Label>
                      <Input
                        type="time"
                        value={exceptionForm.endTime}
                        onChange={(e) => setExceptionForm(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Motivo</Label>
                    <Textarea
                      value={exceptionForm.reason}
                      onChange={(e) => setExceptionForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Vacaciones, conferencia, etc."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={exceptionForm.isAvailable}
                      onCheckedChange={(checked) => setExceptionForm(prev => ({ ...prev, isAvailable: checked }))}
                    />
                    <Label>Disponible excepcionalmente</Label>
                  </div>
                  <Button type="submit" className="w-full">
                    Crear Excepción
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Excepciones Actuales</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDoctor ? (
                  <div className="space-y-2">
                    {exceptions.map((exception) => (
                      <div key={exception.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{exception.date}</div>
                          <div className="text-sm text-muted-foreground">{exception.reason}</div>
                          {exception.startTime && exception.endTime && (
                            <div className="text-xs text-muted-foreground">
                              {exception.startTime} - {exception.endTime}
                            </div>
                          )}
                          <Badge variant={exception.isAvailable ? "default" : "destructive"} className="mt-1">
                            {exception.isAvailable ? "Disponible" : "No disponible"}
                          </Badge>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteExceptionMutation.mutate(exception.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {exceptions.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No hay excepciones configuradas
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Selecciona un doctor para ver sus excepciones
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="durations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurar Duración de Citas</CardTitle>
                <CardDescription>
                  Define el tiempo de consulta por especialidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDurationSubmit} className="space-y-4">
                  <div>
                    <Label>Especialidad</Label>
                    <Select
                      value={durationForm.specialtyId}
                      onValueChange={(value) => setDurationForm(prev => ({ ...prev, specialtyId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty.id} value={String(specialty.id)}>
                            {specialty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Duración (minutos)</Label>
                    <Select
                      value={durationForm.duration}
                      onValueChange={(value) => setDurationForm(prev => ({ ...prev, duration: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar duración" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="20">20 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                        <SelectItem value="90">90 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Descripción (opcional)</Label>
                    <Textarea
                      value={durationForm.description}
                      onChange={(e) => setDurationForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción del tipo de consulta..."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Configurar Duración
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Duraciones Configuradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {durations.map((duration) => (
                    <div key={duration.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">
                          {getSpecialtyName(duration.specialtyId)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {duration.duration} minutos
                        </div>
                        {duration.description && (
                          <div className="text-xs text-muted-foreground">
                            {duration.description}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline">
                        {duration.duration}min
                      </Badge>
                    </div>
                  ))}
                  {durations.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No hay duraciones configuradas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}