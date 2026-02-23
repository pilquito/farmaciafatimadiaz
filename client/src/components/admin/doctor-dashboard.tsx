import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CalendarIcon, ClockIcon, UserIcon, PlusIcon, CheckIcon, XIcon, FileTextIcon, ActivityIcon } from 'lucide-react';
import type { Appointment, Doctor, Patient, InsertMedicalVisit } from '@shared/schema';

const visitTypes = [
  { value: 'consulta', label: 'Consulta General' },
  { value: 'revision', label: 'Revisión' },
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'seguimiento', label: 'Seguimiento' }
];

export function DoctorDashboard() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [visitFormData, setVisitFormData] = useState<Partial<InsertMedicalVisit>>({
    visitType: 'consulta',
    chiefComplaint: '',
    symptoms: '',
    examination: '',
    diagnosis: '',
    treatment: '',
    medications: [],
    notes: '',
    status: 'completed'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener todos los doctores
  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ['/api/doctors'],
    queryFn: () => apiRequest('/api/doctors') as Promise<Doctor[]>
  });

  // Obtener citas del doctor seleccionado
  const { data: appointments = [], isLoading: loadingAppointments } = useQuery({
    queryKey: ['/api/appointments', selectedDoctor?.id],
    queryFn: () => apiRequest('/api/appointments') as Promise<Appointment[]>,
    enabled: !!selectedDoctor
  });

  // Obtener todos los pacientes para referencia
  const { data: patients = [] } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: () => apiRequest('/api/patients') as Promise<Patient[]>
  });

  // Crear visita médica
  const createVisitMutation = useMutation({
    mutationFn: (visitData: Partial<InsertMedicalVisit>) => {
      return apiRequest('/api/medical-visits', {
        method: 'POST',
        body: JSON.stringify(visitData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setIsVisitDialogOpen(false);
      setSelectedAppointment(null);
      resetVisitForm();
      toast({
        title: "Visita registrada",
        description: "La visita médica se ha registrado correctamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al registrar la visita médica",
        variant: "destructive"
      });
    }
  });

  // Confirmar cita
  const confirmAppointmentMutation = useMutation({
    mutationFn: (appointmentId: number) => {
      return apiRequest(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'confirmada' })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Cita confirmada",
        description: "La cita se ha confirmado correctamente"
      });
    }
  });

  // Cancelar cita
  const cancelAppointmentMutation = useMutation({
    mutationFn: (appointmentId: number) => {
      return apiRequest(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelada' })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Cita cancelada",
        description: "La cita se ha cancelado correctamente"
      });
    }
  });

  const resetVisitForm = () => {
    setVisitFormData({
      visitType: 'consulta',
      chiefComplaint: '',
      symptoms: '',
      examination: '',
      diagnosis: '',
      treatment: '',
      medications: [],
      notes: '',
      status: 'completed'
    });
  };

  const handleCreateVisit = (appointment: Appointment) => {
    if (!selectedDoctor || !appointment.patientId) {
      toast({
        title: "Error",
        description: "Faltan datos necesarios para crear la visita",
        variant: "destructive"
      });
      return;
    }

    setSelectedAppointment(appointment);
    setVisitFormData({
      patientId: appointment.patientId,
      doctorId: selectedDoctor.id,
      appointmentId: appointment.id,
      visitType: 'consulta',
      chiefComplaint: '',
      symptoms: '',
      examination: '',
      diagnosis: '',
      treatment: '',
      medications: [],
      notes: '',
      status: 'completed'
    });
    setIsVisitDialogOpen(true);
  };

  const handleSubmitVisit = () => {
    if (!visitFormData.patientId || !visitFormData.doctorId) {
      toast({
        title: "Error",
        description: "Faltan datos obligatorios",
        variant: "destructive"
      });
      return;
    }

    createVisitMutation.mutate(visitFormData);
  };

  const handleMedicationsChange = (value: string) => {
    if (value.trim()) {
      const medications = value.split(',').map(m => m.trim()).filter(m => m);
      setVisitFormData(prev => ({ ...prev, medications }));
    } else {
      setVisitFormData(prev => ({ ...prev, medications: [] }));
    }
  };

  const getPatientById = (patientId: number) => {
    return patients.find(p => p.id === patientId);
  };

  const getAppointmentStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { label: 'Pendiente', variant: 'secondary' as const },
      confirmada: { label: 'Confirmada', variant: 'default' as const },
      completada: { label: 'Completada', variant: 'outline' as const },
      cancelada: { label: 'Cancelada', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDateTime = (appointment: Appointment) => {
    if (!appointment.date || !appointment.time) {
      return 'Fecha no disponible';
    }
    
    try {
      // Combinar date y time en una fecha válida
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

  // Filtrar citas del doctor seleccionado
  const doctorAppointments = selectedDoctor 
    ? appointments.filter(apt => apt.doctorId === selectedDoctor.id)
    : [];

  // Separar citas por estado
  const todayAppointments = doctorAppointments.filter(apt => {
    if (!apt.date) return false;
    try {
      const aptDate = new Date(apt.date);
      const today = new Date();
      return aptDate.toDateString() === today.toDateString() && 
             (apt.status === 'confirmada' || apt.status === 'pendiente');
    } catch {
      return false;
    }
  });

  const upcomingAppointments = doctorAppointments.filter(apt => {
    if (!apt.date) return false;
    try {
      const aptDate = new Date(apt.date);
      const today = new Date();
      return aptDate > today && (apt.status === 'confirmada' || apt.status === 'pendiente');
    } catch {
      return false;
    }
  });

  if (loadingDoctors) {
    return (
      <div className="space-y-6">
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard del Doctor</h1>
          <p className="text-muted-foreground">
            {selectedDoctor 
              ? `Gestionar citas de ${selectedDoctor.name}`
              : "Selecciona un doctor para ver sus citas"
            }
          </p>
        </div>

        {/* Selector de Doctor */}
        <Select
          value={selectedDoctor?.id.toString() || ''}
          onValueChange={(value) => {
            const doctor = doctors.find(d => d.id === parseInt(value));
            setSelectedDoctor(doctor || null);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Seleccionar doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id.toString()}>
                {doctor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDoctor && (
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Hoy ({todayAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Próximas ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <ActivityIcon className="w-4 h-4" />
              Todas ({doctorAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <div className="space-y-4">
              {todayAppointments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay citas para hoy</h3>
                    <p className="text-muted-foreground">
                      No tienes citas programadas para el día de hoy.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                todayAppointments.map((appointment) => {
                  const patient = getPatientById(appointment.patientId!);
                  return (
                    <Card key={appointment.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente no especificado'}
                            </CardTitle>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {formatDateTime(appointment.dateTime)}
                              </span>
                              <span>Duración: {appointment.duration} min</span>
                              {appointment.specialty && <span>Especialidad: {appointment.specialty}</span>}
                            </div>
                            {appointment.notes && (
                              <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getAppointmentStatusBadge(appointment.status)}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          {appointment.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => confirmAppointmentMutation.mutate(appointment.id)}
                              disabled={confirmAppointmentMutation.isPending}
                            >
                              <CheckIcon className="w-4 h-4 mr-1" />
                              Confirmar
                            </Button>
                          )}
                          
                          {appointment.patientId && (
                            <Button
                              size="sm"
                              onClick={() => handleCreateVisit(appointment)}
                            >
                              <FileTextIcon className="w-4 h-4 mr-1" />
                              Crear Visita
                            </Button>
                          )}
                          
                          {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                              disabled={cancelAppointmentMutation.isPending}
                            >
                              <XIcon className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <ClockIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay citas próximas</h3>
                    <p className="text-muted-foreground">
                      No tienes citas programadas para los próximos días.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                upcomingAppointments.map((appointment) => {
                  const patient = getPatientById(appointment.patientId!);
                  return (
                    <Card key={appointment.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente no especificado'}
                            </CardTitle>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {formatDateTime(appointment.dateTime)}
                              </span>
                              <span>Duración: {appointment.duration} min</span>
                              {appointment.specialty && <span>Especialidad: {appointment.specialty}</span>}
                            </div>
                            {appointment.notes && (
                              <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getAppointmentStatusBadge(appointment.status)}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          {appointment.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => confirmAppointmentMutation.mutate(appointment.id)}
                              disabled={confirmAppointmentMutation.isPending}
                            >
                              <CheckIcon className="w-4 h-4 mr-1" />
                              Confirmar
                            </Button>
                          )}
                          
                          {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                              disabled={cancelAppointmentMutation.isPending}
                            >
                              <XIcon className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="space-y-4">
              {doctorAppointments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <ActivityIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay citas</h3>
                    <p className="text-muted-foreground">
                      Este doctor no tiene citas programadas.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                doctorAppointments.map((appointment) => {
                  const patient = getPatientById(appointment.patientId!);
                  return (
                    <Card key={appointment.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente no especificado'}
                            </CardTitle>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {formatDateTime(appointment.dateTime)}
                              </span>
                              <span>Duración: {appointment.duration} min</span>
                              {appointment.specialty && <span>Especialidad: {appointment.specialty}</span>}
                            </div>
                            {appointment.notes && (
                              <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getAppointmentStatusBadge(appointment.status)}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          {appointment.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => confirmAppointmentMutation.mutate(appointment.id)}
                              disabled={confirmAppointmentMutation.isPending}
                            >
                              <CheckIcon className="w-4 h-4 mr-1" />
                              Confirmar
                            </Button>
                          )}
                          
                          {appointment.patientId && appointment.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              onClick={() => handleCreateVisit(appointment)}
                            >
                              <FileTextIcon className="w-4 h-4 mr-1" />
                              Crear Visita
                            </Button>
                          )}
                          
                          {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                              disabled={cancelAppointmentMutation.isPending}
                            >
                              <XIcon className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Diálogo para crear visita médica */}
      <Dialog open={isVisitDialogOpen} onOpenChange={setIsVisitDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Nueva Visita Médica
              {selectedAppointment && (
                <span className="text-sm text-muted-foreground block mt-1">
                  Cita del {formatDateTime(selectedAppointment.dateTime)}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información de la cita */}
            {selectedAppointment && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Información de la Cita</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Paciente:</strong> {(() => {
                      const patient = getPatientById(selectedAppointment.patientId!);
                      return patient ? `${patient.firstName} ${patient.lastName}` : 'No especificado';
                    })()}
                  </div>
                  <div>
                    <strong>Fecha/Hora:</strong> {formatDateTime(selectedAppointment.dateTime)}
                  </div>
                  <div>
                    <strong>Duración:</strong> {selectedAppointment.duration} minutos
                  </div>
                  <div>
                    <strong>Especialidad:</strong> {selectedAppointment.specialty || 'General'}
                  </div>
                </div>
                {selectedAppointment.notes && (
                  <div className="mt-2">
                    <strong>Notas de la cita:</strong> {selectedAppointment.notes}
                  </div>
                )}
              </div>
            )}

            {/* Tipo de visita */}
            <div>
              <Label htmlFor="visitType">Tipo de Visita *</Label>
              <Select
                value={visitFormData.visitType || ''}
                onValueChange={(value) => setVisitFormData(prev => ({ ...prev, visitType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {visitTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Motivo de consulta */}
            <div>
              <Label htmlFor="chiefComplaint">Motivo de Consulta</Label>
              <Textarea
                id="chiefComplaint"
                value={visitFormData.chiefComplaint || ''}
                onChange={(e) => setVisitFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                placeholder="Describir el motivo principal de la visita..."
                rows={2}
              />
            </div>

            {/* Síntomas y exploración */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="symptoms">Síntomas</Label>
                <Textarea
                  id="symptoms"
                  value={visitFormData.symptoms || ''}
                  onChange={(e) => setVisitFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="Describir síntomas observados..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="examination">Exploración Física</Label>
                <Textarea
                  id="examination"
                  value={visitFormData.examination || ''}
                  onChange={(e) => setVisitFormData(prev => ({ ...prev, examination: e.target.value }))}
                  placeholder="Resultados de la exploración física..."
                  rows={3}
                />
              </div>
            </div>

            {/* Diagnóstico y tratamiento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="diagnosis">Diagnóstico</Label>
                <Textarea
                  id="diagnosis"
                  value={visitFormData.diagnosis || ''}
                  onChange={(e) => setVisitFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Diagnóstico establecido..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="treatment">Tratamiento</Label>
                <Textarea
                  id="treatment"
                  value={visitFormData.treatment || ''}
                  onChange={(e) => setVisitFormData(prev => ({ ...prev, treatment: e.target.value }))}
                  placeholder="Plan de tratamiento recomendado..."
                  rows={3}
                />
              </div>
            </div>

            {/* Medicamentos */}
            <div>
              <Label htmlFor="medications">Medicamentos Prescritos</Label>
              <Input
                id="medications"
                value={visitFormData.medications?.join(', ') || ''}
                onChange={(e) => handleMedicationsChange(e.target.value)}
                placeholder="Paracetamol 500mg, Ibuprofeno 400mg (separar con comas)"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Separar múltiples medicamentos con comas
              </p>
            </div>

            {/* Notas adicionales */}
            <div>
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                value={visitFormData.notes || ''}
                onChange={(e) => setVisitFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observaciones adicionales, instrucciones especiales..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsVisitDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitVisit}
              disabled={createVisitMutation.isPending}
            >
              {createVisitMutation.isPending ? 'Registrando...' : 'Registrar Visita'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DoctorDashboard;