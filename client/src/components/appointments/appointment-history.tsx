import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, Check, X, AlertCircle, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// Tipos
interface Appointment {
  id: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  speciality: string;
  doctor: string;
  date: string;
  time: string;
  reason: string;
  insurance: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
}

// Horarios disponibles para reagendar
const availableTimes = [
  "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", 
  "12:00", "12:30", "16:00", "16:30", "17:00", "17:30", 
  "18:00", "18:30"
];

export function AppointmentHistory({ isAdmin = false }) {
  const queryClient = useQueryClient();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [showPastAppointments, setShowPastAppointments] = useState(false);
  
  // Consultar citas (usar ruta específica del usuario si no es admin)
  const apiEndpoint = isAdmin ? '/api/appointments' : '/api/user/appointments';
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: [apiEndpoint],
    select: (data: Appointment[]) => 
      data.sort((a, b) => 
        new Date(`${a.date}T${a.time}`).getTime() - 
        new Date(`${b.date}T${b.time}`).getTime()
      )
  });
  
  // Filtrar citas pasadas y futuras
  const now = new Date();
  const futureAppointments = appointments.filter(appointment => 
    new Date(`${appointment.date}T${appointment.time}`) > now &&
    appointment.status !== "cancelled"
  );
  
  const pastAppointments = appointments.filter(appointment => 
    new Date(`${appointment.date}T${appointment.time}`) <= now ||
    appointment.status === "cancelled"
  );
  
  // Mutación para cambiar el estado de una cita
  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la cita ha sido actualizado correctamente.",
      });
      setSelectedAppointment(null);
      setIsCancelDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error al actualizar el estado:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cita. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });
  
  // Mutación para reagendar una cita
  const rescheduleAppointmentMutation = useMutation({
    mutationFn: async ({ id, date, time }: { id: number; date: string; time: string }) => {
      return await apiRequest(`/api/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ date, time }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Cita reagendada",
        description: "Tu cita ha sido reagendada correctamente.",
      });
      setSelectedAppointment(null);
      setRescheduleDate(undefined);
      setRescheduleTime("");
      setIsRescheduleDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error al reagendar la cita:", error);
      toast({
        title: "Error",
        description: "No se pudo reagendar la cita. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });
  
  // Manejar cancelación de cita
  const handleCancelAppointment = () => {
    if (selectedAppointment) {
      updateAppointmentStatusMutation.mutate({
        id: selectedAppointment.id,
        status: "cancelled"
      });
    }
  };
  
  // Manejar reagendar cita
  const handleRescheduleAppointment = () => {
    if (selectedAppointment && rescheduleDate && rescheduleTime) {
      rescheduleAppointmentMutation.mutate({
        id: selectedAppointment.id,
        date: format(rescheduleDate, 'yyyy-MM-dd'),
        time: rescheduleTime
      });
    } else {
      toast({
        title: "Información incompleta",
        description: "Por favor, selecciona una fecha y hora para reagendar.",
        variant: "destructive",
      });
    }
  };
  
  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Función para traducir el estado
  const translateStatus = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmada";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelada";
      case "completed":
        return "Completada";
      default:
        return status;
    }
  };
  
  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Si no hay citas, mostrar mensaje
  if (appointments.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardTitle className="mb-2">No hay citas programadas</CardTitle>
        <CardDescription>
          Aún no tienes ninguna cita programada. Puedes agendar una nueva cita desde el formulario.
        </CardDescription>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="upcoming">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="upcoming">Próximas citas ({futureAppointments.length})</TabsTrigger>
            <TabsTrigger value="past">Historial ({pastAppointments.length})</TabsTrigger>
          </TabsList>
          
          {isAdmin && (
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          )}
        </div>
        
        <TabsContent value="upcoming">
          {futureAppointments.length === 0 ? (
            <Card className="text-center p-8">
              <CardDescription>
                No tienes citas próximas programadas.
              </CardDescription>
            </Card>
          ) : (
            <div className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {futureAppointments.map((appointment) => (
                  <AccordionItem key={appointment.id} value={`appointment-${appointment.id}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center">
                          <div className="bg-primary/10 p-2 rounded-full mr-4">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{appointment.speciality}</p>
                            <p className="text-sm text-gray-500">
                              {format(parseISO(appointment.date), "EEEE, d 'de' MMMM", { locale: es })} • {appointment.time}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {translateStatus(appointment.status)}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-sm text-gray-500 mb-1">Especialidad</h4>
                              <p>{appointment.speciality}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-gray-500 mb-1">Doctor(a)</h4>
                              <p>{appointment.doctor || "Sin asignar"}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-gray-500 mb-1">Fecha y hora</h4>
                              <p>
                                {format(parseISO(appointment.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })} a las {appointment.time}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-gray-500 mb-1">Motivo de la consulta</h4>
                              <p>{appointment.reason}</p>
                            </div>
                            {appointment.notes && (
                              <div className="col-span-2">
                                <h4 className="font-medium text-sm text-gray-500 mb-1">Notas adicionales</h4>
                                <p>{appointment.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setIsCancelDialogOpen(true);
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancelar
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setIsRescheduleDialogOpen(true);
                            }}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Reagendar
                          </Button>
                        </CardFooter>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastAppointments.length === 0 ? (
            <Card className="text-center p-8">
              <CardDescription>
                No tienes un historial de citas previas.
              </CardDescription>
            </Card>
          ) : (
            <div className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {pastAppointments.map((appointment) => (
                  <AccordionItem key={appointment.id} value={`past-appointment-${appointment.id}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-2 rounded-full mr-4">
                            <Calendar className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{appointment.speciality}</p>
                            <p className="text-sm text-gray-500">
                              {format(parseISO(appointment.date), "EEEE, d 'de' MMMM", { locale: es })} • {appointment.time}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {translateStatus(appointment.status)}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-sm text-gray-500 mb-1">Especialidad</h4>
                              <p>{appointment.speciality}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-gray-500 mb-1">Doctor(a)</h4>
                              <p>{appointment.doctor || "Sin asignar"}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-gray-500 mb-1">Fecha y hora</h4>
                              <p>
                                {format(parseISO(appointment.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })} a las {appointment.time}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-gray-500 mb-1">Motivo de la consulta</h4>
                              <p>{appointment.reason}</p>
                            </div>
                          </div>
                        </CardContent>
                        {appointment.status !== 'cancelled' && (
                          <CardFooter className="border-t px-6 py-4 bg-gray-50 flex justify-end">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                // Lógica para programar una nueva cita con información similar
                                // Por ahora solo mostramos un mensaje
                                toast({
                                  title: "Función en desarrollo",
                                  description: "Próximamente podrás programar una nueva cita similar a esta.",
                                });
                              }}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Agendar cita similar
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Diálogo para cancelar cita */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar cita</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Información importante</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Las cancelaciones con menos de 24 horas de antelación pueden estar sujetas a cargos según nuestra política.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Volver
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelAppointment}
              disabled={updateAppointmentStatusMutation.isPending}
            >
              {updateAppointmentStatusMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Cancelando...
                </>
              ) : (
                "Confirmar cancelación"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para reagendar cita */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar cita</DialogTitle>
            <DialogDescription>
              Selecciona una nueva fecha y hora para tu cita.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reschedule-date">Nueva fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !rescheduleDate && "text-muted-foreground"
                    )}
                  >
                    {rescheduleDate ? (
                      format(rescheduleDate, "PPP", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <UICalendar
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={setRescheduleDate}
                    disabled={(date) => 
                      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                      date.getDay() === 0 // Domingo
                    }
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="reschedule-time">Nueva hora</Label>
              <Select onValueChange={setRescheduleTime} value={rescheduleTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una hora" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleRescheduleAppointment}
              disabled={!rescheduleDate || !rescheduleTime || rescheduleAppointmentMutation.isPending}
            >
              {rescheduleAppointmentMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Reagendando...
                </>
              ) : (
                "Confirmar cambio"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}