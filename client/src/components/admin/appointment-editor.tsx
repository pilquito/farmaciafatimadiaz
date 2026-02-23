import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CalendarIcon, ClockIcon, EditIcon, SaveIcon, XIcon, UserIcon, PhoneIcon, MailIcon } from 'lucide-react';
import type { Appointment, Doctor, Specialty, Patient } from '@shared/schema';

interface AppointmentEditorProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function AppointmentEditor({ appointment, isOpen, onClose, onSave }: AppointmentEditorProps) {
  const [formData, setFormData] = useState<Partial<Appointment>>({});
  const [isEditing, setIsEditing] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener doctores
  const { data: doctors = [] } = useQuery({
    queryKey: ['/api/doctors'],
    queryFn: () => apiRequest('/api/doctors') as Promise<Doctor[]>
  });

  // Obtener especialidades
  const { data: specialties = [] } = useQuery({
    queryKey: ['/api/specialties'],
    queryFn: () => apiRequest('/api/specialties') as Promise<Specialty[]>
  });

  // Obtener pacientes
  const { data: patients = [] } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: () => apiRequest('/api/patients') as Promise<Patient[]>
  });

  // Inicializar formulario cuando se abre el diálogo
  useEffect(() => {
    if (appointment && isOpen) {
      setFormData({
        name: appointment.name,
        email: appointment.email,
        phone: appointment.phone,
        date: appointment.date,
        time: appointment.time,
        specialtyId: appointment.specialtyId,
        doctorId: appointment.doctorId,
        reason: appointment.reason,
        insurance: appointment.insurance,
        notes: appointment.notes,
        status: appointment.status,
        patientId: appointment.patientId
      });
      setIsEditing(false);
    }
  }, [appointment, isOpen]);

  // Mutation para actualizar cita
  const updateAppointmentMutation = useMutation({
    mutationFn: (data: Partial<Appointment>) => {
      return apiRequest(`/api/appointments/${appointment?.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setIsEditing(false);
      toast({
        title: "Cita actualizada",
        description: "Los cambios se han guardado correctamente"
      });
      onSave?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la cita",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (!appointment) return;
    
    // Validaciones básicas
    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time || !formData.reason) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    updateAppointmentMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (appointment) {
      setFormData({
        name: appointment.name,
        email: appointment.email,
        phone: appointment.phone,
        date: appointment.date,
        time: appointment.time,
        specialtyId: appointment.specialtyId,
        doctorId: appointment.doctorId,
        reason: appointment.reason,
        insurance: appointment.insurance,
        notes: appointment.notes,
        status: appointment.status,
        patientId: appointment.patientId
      });
    }
    setIsEditing(false);
  };

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

  const getPatientName = (patientId: number | null) => {
    if (!patientId) return null;
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente no encontrado';
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

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Cita #{appointment.id}
            {getAppointmentStatusBadge(formData.status || appointment.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del paciente vinculado */}
          {formData.patientId && (
            <Card className="bg-blue-50 dark:bg-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Paciente Vinculado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{getPatientName(formData.patientId)}</p>
                <p className="text-sm text-muted-foreground">ID: #{formData.patientId}</p>
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex justify-between items-center">
            <div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                  <EditIcon className="w-4 h-4" />
                  Editar Cita
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={updateAppointmentMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <SaveIcon className="w-4 h-4" />
                    {updateAppointmentMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                  >
                    <XIcon className="w-4 h-4" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Formulario de edición / Vista */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información personal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre Completo *</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre completo del paciente"
                    />
                  ) : (
                    <p className="text-sm bg-muted p-2 rounded">{formData.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="correo@ejemplo.com"
                    />
                  ) : (
                    <p className="text-sm bg-muted p-2 rounded flex items-center gap-2">
                      <MailIcon className="w-4 h-4" />
                      {formData.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="600000000"
                    />
                  ) : (
                    <p className="text-sm bg-muted p-2 rounded flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4" />
                      {formData.phone}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="insurance">Seguro Médico</Label>
                  {isEditing ? (
                    <Input
                      id="insurance"
                      value={formData.insurance || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, insurance: e.target.value }))}
                      placeholder="Nombre del seguro médico"
                    />
                  ) : (
                    <p className="text-sm bg-muted p-2 rounded">
                      {formData.insurance || 'Sin seguro especificado'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Información de la cita */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Detalles de la Cita
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Fecha *</Label>
                    {isEditing ? (
                      <Input
                        id="date"
                        type="date"
                        value={formData.date || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm bg-muted p-2 rounded">{formData.date}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="time">Hora *</Label>
                    {isEditing ? (
                      <Input
                        id="time"
                        type="time"
                        value={formData.time || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm bg-muted p-2 rounded flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        {formData.time}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialty">Especialidad</Label>
                  {isEditing ? (
                    <Select
                      value={formData.specialtyId?.toString() || ''}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        specialtyId: value ? parseInt(value) : null 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty.id} value={specialty.id.toString()}>
                            {specialty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm bg-muted p-2 rounded">
                      {getSpecialtyName(formData.specialtyId || null)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="doctor">Doctor</Label>
                  {isEditing ? (
                    <Select
                      value={formData.doctorId?.toString() || ''}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        doctorId: value ? parseInt(value) : null 
                      }))}
                    >
                      <SelectTrigger>
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
                  ) : (
                    <p className="text-sm bg-muted p-2 rounded">
                      {getDoctorName(formData.doctorId || null)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Estado</Label>
                  {isEditing ? (
                    <Select
                      value={formData.status || ''}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
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
                  ) : (
                    <div className="bg-muted p-2 rounded">
                      {getAppointmentStatusBadge(formData.status || appointment.status)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Motivo y notas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Motivo y Notas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reason">Motivo de la Consulta *</Label>
                {isEditing ? (
                  <Textarea
                    id="reason"
                    value={formData.reason || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Describir el motivo de la consulta"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded min-h-[60px]">
                    {formData.reason}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notas adicionales sobre la cita"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded min-h-[60px]">
                    {formData.notes || 'Sin notas adicionales'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información del sistema */}
          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Creada:</span> {new Date(appointment.createdAt).toLocaleString('es-ES')}
                </div>
                <div>
                  <span className="font-medium">ID de Cita:</span> #{appointment.id}
                </div>
                {appointment.userId && (
                  <div>
                    <span className="font-medium">ID de Usuario:</span> #{appointment.userId}
                  </div>
                )}
                {formData.patientId && (
                  <div>
                    <span className="font-medium">ID de Paciente:</span> #{formData.patientId}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AppointmentEditor;