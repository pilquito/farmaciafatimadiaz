import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Stethoscope,
  Phone,
  Mail
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";

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

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);

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

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: { [key: string]: Appointment[] } = {};
    appointments.forEach(appointment => {
      const dateKey = appointment.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment);
    });
    return grouped;
  }, [appointments]);

  const getDoctorName = (doctorId?: number) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : "Sin asignar";
  };

  const getSpecialtyName = (specialtyId?: number) => {
    const specialty = specialties.find(s => s.id === specialtyId);
    return specialty ? specialty.name : "Sin asignar";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmada: "bg-blue-100 text-blue-800 border-blue-200",
      completada: "bg-green-100 text-green-800 border-green-200",
      cancelada: "bg-red-100 text-red-800 border-red-200",
      "no-asistio": "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status as keyof typeof colors] || colors.pendiente;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateKey = format(date, "yyyy-MM-dd");
    const dayAppointments = appointmentsByDate[dateKey] || [];
    if (dayAppointments.length === 1) {
      setSelectedAppointment(dayAppointments[0]);
      setShowAppointmentDialog(true);
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDialog(true);
  };

  const getDayAppointments = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return appointmentsByDate[dateKey] || [];
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendario de Citas
              </CardTitle>
              <CardDescription>
                Vista general de todas las citas médicas programadas
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[200px] text-center">
                <h3 className="text-lg font-semibold">
                  {format(currentDate, "MMMM yyyy", { locale: es })}
                </h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week days header */}
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map(day => {
              const dayAppointments = getDayAppointments(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[120px] p-1 border border-border cursor-pointer transition-colors
                    ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                    ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}
                    ${isToday(day) ? 'ring-2 ring-primary ring-opacity-50' : ''}
                  `}
                  onClick={() => handleDateClick(day)}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                    ${isToday(day) ? 'text-primary font-bold' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Appointments for this day */}
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map(appointment => (
                      <div
                        key={appointment.id}
                        className={`
                          text-xs p-1 rounded border cursor-pointer hover:shadow-sm transition-shadow
                          ${getStatusColor(appointment.status)}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(appointment);
                        }}
                      >
                        <div className="font-medium truncate">
                          {appointment.time} - {appointment.name}
                        </div>
                        <div className="truncate text-xs opacity-75">
                          {getDoctorName(appointment.doctorId)}
                        </div>
                      </div>
                    ))}
                    
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayAppointments.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Estados de las Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></div>
              <span className="text-sm">Pendiente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
              <span className="text-sm">Confirmada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
              <span className="text-sm">Completada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
              <span className="text-sm">Cancelada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
              <span className="text-sm">No asistió</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
            <DialogDescription>
              Información completa de la cita médica
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(selectedAppointment.status)}>
                  {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  #{selectedAppointment.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <CalendarIcon className="h-4 w-4" />
                    Fecha y Hora
                  </div>
                  <p className="text-muted-foreground">
                    {selectedAppointment.date} a las {selectedAppointment.time}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <User className="h-4 w-4" />
                    Paciente
                  </div>
                  <p className="text-muted-foreground">
                    {selectedAppointment.name}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <Phone className="h-4 w-4" />
                    Teléfono
                  </div>
                  <p className="text-muted-foreground">
                    {selectedAppointment.phone}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="text-muted-foreground">
                    {selectedAppointment.email}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <Stethoscope className="h-4 w-4" />
                    Doctor
                  </div>
                  <p className="text-muted-foreground">
                    {getDoctorName(selectedAppointment.doctorId)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="h-4 w-4" />
                    Especialidad
                  </div>
                  <p className="text-muted-foreground">
                    {getSpecialtyName(selectedAppointment.specialtyId)}
                  </p>
                </div>
              </div>

              {selectedAppointment.reason && (
                <div>
                  <div className="font-medium mb-1">Motivo de la consulta</div>
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    {selectedAppointment.reason}
                  </p>
                </div>
              )}

              {selectedAppointment.insurance && (
                <div>
                  <div className="font-medium mb-1">Seguro médico</div>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.insurance}
                  </p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div>
                  <div className="font-medium mb-1">Notas adicionales</div>
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-2 border-t">
                Creada el {format(new Date(selectedAppointment.createdAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}