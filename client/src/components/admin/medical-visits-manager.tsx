import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { PlusIcon, EditIcon, TrashIcon, FileTextIcon, CalendarIcon, UserIcon, ActivityIcon, LinkIcon } from 'lucide-react';
import type { MedicalVisit, InsertMedicalVisit, Patient, Doctor } from '@shared/schema';

interface MedicalVisitsManagerProps {
  patient: Patient;
}

const visitTypes = [
  { value: 'consulta', label: 'Consulta General' },
  { value: 'revision', label: 'Revisión' },
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'seguimiento', label: 'Seguimiento' }
];

export function MedicalVisitsManager({ patient }: MedicalVisitsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<MedicalVisit | null>(null);
  const [formData, setFormData] = useState<Partial<InsertMedicalVisit>>({
    patientId: patient.id,
    doctorId: undefined,
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

  // Obtener visitas del paciente
  const { data: visits = [], isLoading } = useQuery({
    queryKey: [`/api/patients/${patient.id}/medical-visits`],
    queryFn: () => apiRequest(`/api/patients/${patient.id}/medical-visits`) as Promise<MedicalVisit[]>
  });

  // Obtener doctores para el selector
  const { data: doctors = [] } = useQuery({
    queryKey: ['/api/doctors'],
    queryFn: () => apiRequest('/api/doctors') as Promise<Doctor[]>
  });

  // Crear/actualizar visita médica
  const createOrUpdateMutation = useMutation({
    mutationFn: (data: { visit: Partial<InsertMedicalVisit>; isEdit: boolean; id?: number }) => {
      if (data.isEdit && data.id) {
        return apiRequest(`/api/medical-visits/${data.id}`, {
          method: 'PUT',
          body: JSON.stringify(data.visit)
        });
      }
      return apiRequest('/api/medical-visits', {
        method: 'POST',
        body: JSON.stringify(data.visit)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patient.id}/medical-visits`] });
      setIsDialogOpen(false);
      setEditingVisit(null);
      resetForm();
      toast({
        title: editingVisit ? "Visita actualizada" : "Visita registrada",
        description: editingVisit 
          ? "Los datos de la visita se han actualizado correctamente" 
          : "La nueva visita médica se ha registrado correctamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al guardar la visita médica",
        variant: "destructive"
      });
    }
  });

  // Eliminar visita médica
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/medical-visits/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patient.id}/medical-visits`] });
      toast({
        title: "Visita eliminada",
        description: "La visita médica se ha eliminado correctamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la visita médica",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      patientId: patient.id,
      doctorId: undefined,
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

  const handleEdit = (visit: MedicalVisit) => {
    setEditingVisit(visit);
    setFormData({
      patientId: visit.patientId,
      doctorId: visit.doctorId,
      visitType: visit.visitType,
      chiefComplaint: visit.chiefComplaint || '',
      symptoms: visit.symptoms || '',
      examination: visit.examination || '',
      diagnosis: visit.diagnosis || '',
      treatment: visit.treatment || '',
      medications: visit.medications || [],
      notes: visit.notes || '',
      status: visit.status,
      previousVisitId: visit.previousVisitId || undefined
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.doctorId || !formData.visitType) {
      toast({
        title: "Error",
        description: "Por favor selecciona el doctor y tipo de visita",
        variant: "destructive"
      });
      return;
    }

    createOrUpdateMutation.mutate({
      visit: formData,
      isEdit: !!editingVisit,
      id: editingVisit?.id
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleMedicationsChange = (value: string) => {
    if (value.trim()) {
      const medications = value.split(',').map(m => m.trim()).filter(m => m);
      setFormData(prev => ({ ...prev, medications }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVisitTypeLabel = (type: string) => {
    return visitTypes.find(v => v.value === type)?.label || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Completada', variant: 'default' as const },
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Historial de Visitas</h2>
          <p className="text-muted-foreground">
            Paciente: {patient.firstName} {patient.lastName}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingVisit(null); }}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Nueva Visita
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVisit ? 'Editar Visita Médica' : 'Nueva Visita Médica'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doctorId">Doctor *</Label>
                  <Select
                    value={formData.doctorId?.toString() || ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, doctorId: parseInt(value) }))}
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
                </div>
                
                <div>
                  <Label htmlFor="visitType">Tipo de Visita *</Label>
                  <Select
                    value={formData.visitType || ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, visitType: value }))}
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
              </div>

              {/* Motivo de consulta */}
              <div>
                <Label htmlFor="chiefComplaint">Motivo de Consulta</Label>
                <Textarea
                  id="chiefComplaint"
                  value={formData.chiefComplaint || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
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
                    value={formData.symptoms || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                    placeholder="Describir síntomas observados..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="examination">Exploración Física</Label>
                  <Textarea
                    id="examination"
                    value={formData.examination || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, examination: e.target.value }))}
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
                    value={formData.diagnosis || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    placeholder="Diagnóstico establecido..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="treatment">Tratamiento</Label>
                  <Textarea
                    id="treatment"
                    value={formData.treatment || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
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
                  value={formData.medications?.join(', ') || ''}
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
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observaciones adicionales, instrucciones especiales..."
                  rows={3}
                />
              </div>

              {/* Vinculación con visita anterior */}
              {visits.length > 0 && (
                <div>
                  <Label htmlFor="previousVisitId">Visita Anterior Relacionada</Label>
                  <Select
                    value={formData.previousVisitId?.toString() || ''}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      previousVisitId: value ? parseInt(value) : undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar visita anterior (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin vinculación</SelectItem>
                      {visits
                        .filter(v => v.id !== editingVisit?.id)
                        .map((visit) => (
                          <SelectItem key={visit.id} value={visit.id.toString()}>
                            {formatDate(visit.visitDate)} - {getVisitTypeLabel(visit.visitType)}
                            {visit.diagnosis && ` - ${visit.diagnosis.substring(0, 50)}...`}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createOrUpdateMutation.isPending}
              >
                {createOrUpdateMutation.isPending ? 'Guardando...' : (editingVisit ? 'Actualizar' : 'Registrar')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de visitas */}
      <div className="space-y-4">
        {visits.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileTextIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay visitas registradas</h3>
              <p className="text-muted-foreground mb-4">
                Aún no se han registrado visitas médicas para este paciente.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Registrar Primera Visita
              </Button>
            </CardContent>
          </Card>
        ) : (
          visits.map((visit) => (
            <Card key={visit.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">
                        {getVisitTypeLabel(visit.visitType)}
                      </CardTitle>
                      {getStatusBadge(visit.status)}
                      {visit.previousVisitId && (
                        <Badge variant="outline" className="text-xs">
                          <LinkIcon className="w-3 h-3 mr-1" />
                          Vinculada
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {formatDate(visit.visitDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        {visit.doctorName || 'Doctor no especificado'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(visit)}
                    >
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar visita médica?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente esta visita médica del historial del paciente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(visit.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Motivo y síntomas */}
                  {visit.chiefComplaint && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Motivo de Consulta</h4>
                      <p className="text-sm">{visit.chiefComplaint}</p>
                    </div>
                  )}

                  {visit.symptoms && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Síntomas</h4>
                      <p className="text-sm">{visit.symptoms}</p>
                    </div>
                  )}

                  {visit.examination && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Exploración Física</h4>
                      <p className="text-sm">{visit.examination}</p>
                    </div>
                  )}

                  {visit.diagnosis && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Diagnóstico</h4>
                      <p className="text-sm">{visit.diagnosis}</p>
                    </div>
                  )}

                  {visit.treatment && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Tratamiento</h4>
                      <p className="text-sm">{visit.treatment}</p>
                    </div>
                  )}

                  {visit.medications && visit.medications.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Medicamentos</h4>
                      <div className="flex flex-wrap gap-1">
                        {visit.medications.map((medication, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {medication}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {visit.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-2">Notas Adicionales</h4>
                    <p className="text-sm text-muted-foreground">{visit.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default MedicalVisitsManager;