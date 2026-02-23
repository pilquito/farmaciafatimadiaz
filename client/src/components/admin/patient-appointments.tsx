import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, ClockIcon, UserIcon, PhoneIcon, MailIcon, FileTextIcon, AlertCircleIcon, EditIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import AppointmentEditor from './appointment-editor';
import type { Patient, Appointment, Doctor, Specialty } from '@shared/schema';

interface PatientAppointmentsProps {
  patient: Patient;
}

export function PatientAppointments({ patient }: PatientAppointmentsProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Obtener todas las citas
  const { data: allAppointments = [], isLoading: loadingAppointments } = useQuery({
    queryKey: ['/api/appointments'],
    queryFn: () => apiRequest('/api/appointments') as Promise<Appointment[]>
  });

  // Obtener doctores para mostrar nombres
  const { data: doctors = [] } = useQuery({
    queryKey: ['/api/doctors'],
    queryFn: () => apiRequest('/api/doctors') as Promise<Doctor[]>
  });

  // Obtener especialidades
  const { data: specialties = [] } = useQuery({
    queryKey: ['/api/specialties'],
    queryFn: () => apiRequest('/api/specialties') as Promise<Specialty[]>
  });

  // Filtrar citas del paciente (por userId o patientId)
  const patientAppointments = allAppointments.filter(apt => 
    apt.patientId === patient.id || apt.userId === patient.userId
  );

  // Filtrar por estado si se selecciona uno específico
  const filteredAppointments = selectedStatus === 'all' 
    ? patientAppointments 
    : patientAppointments.filter(apt => apt.status === selectedStatus);

  // Ordenar citas por fecha (más recientes primero)
  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const getDoctorName = (doctorId: number | null) => {
    if (!doctorId) return 'Sin asignar';
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Doctor no encontrado';
  };

  const getSpecialtyName = (specialtyId: number | null) => {
    if (!specialtyId) return 'Sin especialidad';
    const specialty = specialties.find(s => s.id === specialtyId);
    return specialty ? specialty.name : 'Especialidad no encontrada';
  };

  const formatDateTime = (appointment: Appointment) => {
    if (!appointment.date || !appointment.time) {
      return 'Fecha no disponible';
    }
    
    try {
      const dateTimeString = `${appointment.date}T${appointment.time}:00`;
      const dateTime = new Date(dateTimeString);
      
      if (isNaN(dateTime.getTime())) {
        return 'Fecha inválida';
      }
      
      return dateTime.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Error en fecha';
    }
  };

  const getAppointmentStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { label: 'Pendiente', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      confirmada: { label: 'Confirmada', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      completada: { label: 'Completada', variant: 'outline' as const, color: 'bg-green-100 text-green-800' },
      cancelada: { label: 'Cancelada', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente;
    return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
  };

  // Estadísticas rápidas
  const appointmentStats = {
    total: patientAppointments.length,
    pendiente: patientAppointments.filter(apt => apt.status === 'pendiente').length,
    confirmada: patientAppointments.filter(apt => apt.status === 'confirmada').length,
    completada: patientAppointments.filter(apt => apt.status === 'completada').length,
    cancelada: patientAppointments.filter(apt => apt.status === 'cancelada').length
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingAppointment(null);
  };

  if (loadingAppointments) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información del paciente */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Historial de Citas Médicas
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{appointmentStats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{appointmentStats.pendiente}</div>
            <div className="text-sm text-muted-foreground">Pendientes</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{appointmentStats.confirmada}</div>
            <div className="text-sm text-muted-foreground">Confirmadas</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{appointmentStats.completada}</div>
            <div className="text-sm text-muted-foreground">Completadas</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{appointmentStats.cancelada}</div>
            <div className="text-sm text-muted-foreground">Canceladas</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={selectedStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('all')}
        >
          Todas ({appointmentStats.total})
        </Button>
        <Button 
          variant={selectedStatus === 'pendiente' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('pendiente')}
        >
          Pendientes ({appointmentStats.pendiente})
        </Button>
        <Button 
          variant={selectedStatus === 'confirmada' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('confirmada')}
        >
          Confirmadas ({appointmentStats.confirmada})
        </Button>
        <Button 
          variant={selectedStatus === 'completada' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('completada')}
        >
          Completadas ({appointmentStats.completada})
        </Button>
        <Button 
          variant={selectedStatus === 'cancelada' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('cancelada')}
        >
          Canceladas ({appointmentStats.cancelada})
        </Button>
      </div>

      {/* Lista de citas */}
      <div className="space-y-4">
        {sortedAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircleIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {selectedStatus === 'all' 
                  ? 'No hay citas registradas' 
                  : `No hay citas ${selectedStatus === 'pendiente' ? 'pendientes' : selectedStatus === 'confirmada' ? 'confirmadas' : selectedStatus === 'completada' ? 'completadas' : 'canceladas'}`
                }
              </h3>
              <p className="text-muted-foreground">
                {selectedStatus === 'all' 
                  ? 'Este paciente no tiene citas médicas registradas en el sistema.'
                  : 'Cambia el filtro para ver citas en otros estados.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-blue-500" />
                      Cita #{appointment.id}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {formatDateTime(appointment)}
                      </span>
                      {getAppointmentStatusBadge(appointment.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Información principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Doctor:</span>
                      <span>{getDoctorName(appointment.doctorId)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileTextIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Especialidad:</span>
                      <span>{getSpecialtyName(appointment.specialtyId)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Teléfono:</span>
                      <span>{appointment.phone}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MailIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span>{appointment.email}</span>
                    </div>
                    {appointment.insurance && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">🏥 Seguro:</span>
                        <span>{appointment.insurance}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <span className="font-medium">📋 Motivo:</span>
                      <span className="text-sm">{appointment.reason}</span>
                    </div>
                  </div>
                </div>

                {/* Notas si existen */}
                {appointment.notes && (
                  <>
                    <Separator />
                    <div>
                      <span className="font-medium text-sm">💬 Notas:</span>
                      <p className="text-sm text-muted-foreground mt-1">{appointment.notes}</p>
                    </div>
                  </>
                )}

                {/* Botón de edición */}
                <Separator />
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>
                        Vinculada: {appointment.patientId ? 'Como Paciente' : 'Como Usuario'}
                      </span>
                      <span>
                        Creada: {new Date(appointment.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAppointment(appointment)}
                    className="ml-4"
                  >
                    <EditIcon className="w-4 h-4 mr-1" />
                    Editar Cita
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Editor de citas */}
      <AppointmentEditor
        appointment={editingAppointment}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        onSave={handleCloseEditor}
      />
    </div>
  );
}

export default PatientAppointments;