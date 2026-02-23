import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { EditIcon, HeartIcon, AlertTriangleIcon, PillIcon, ScissorsIcon, UsersIcon, UserIcon, PhoneIcon } from 'lucide-react';
import type { MedicalHistory, InsertMedicalHistory, Patient } from '@shared/schema';

interface MedicalHistoryManagerProps {
  patient: Patient;
}

export function MedicalHistoryManager({ patient }: MedicalHistoryManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertMedicalHistory>>({
    patientId: patient.id,
    allergies: [],
    chronicConditions: [],
    currentMedications: [],
    surgicalHistory: [],
    familyHistory: '',
    socialHistory: '',
    bloodType: '',
    emergencyContact: '',
    notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener historial médico del paciente
  const { data: medicalHistory, isLoading } = useQuery({
    queryKey: [`/api/patients/${patient.id}/medical-history`],
    queryFn: () => apiRequest(`/api/patients/${patient.id}/medical-history`) as Promise<MedicalHistory>,
    retry: false
  });

  // Crear/actualizar historial médico
  const saveHistoryMutation = useMutation({
    mutationFn: (data: Partial<InsertMedicalHistory>) => {
      if (medicalHistory) {
        return apiRequest(`/api/patients/${patient.id}/medical-history`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      }
      return apiRequest(`/api/patients/${patient.id}/medical-history`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patient.id}/medical-history`] });
      setIsDialogOpen(false);
      toast({
        title: "Historial actualizado",
        description: "El historial médico se ha guardado correctamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al guardar el historial médico",
        variant: "destructive"
      });
    }
  });

  const handleEdit = () => {
    if (medicalHistory) {
      setFormData({
        patientId: medicalHistory.patientId,
        allergies: medicalHistory.allergies || [],
        chronicConditions: medicalHistory.chronicConditions || [],
        currentMedications: medicalHistory.currentMedications || [],
        surgicalHistory: medicalHistory.surgicalHistory || [],
        familyHistory: medicalHistory.familyHistory || '',
        socialHistory: medicalHistory.socialHistory || '',
        bloodType: medicalHistory.bloodType || '',
        emergencyContact: medicalHistory.emergencyContact || '',
        notes: medicalHistory.notes || ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    saveHistoryMutation.mutate(formData);
  };

  const handleArrayFieldChange = (field: keyof Pick<InsertMedicalHistory, 'allergies' | 'chronicConditions' | 'currentMedications' | 'surgicalHistory'>, value: string) => {
    if (value.trim()) {
      const items = value.split(',').map(item => item.trim()).filter(item => item);
      setFormData(prev => ({ ...prev, [field]: items }));
    } else {
      setFormData(prev => ({ ...prev, [field]: [] }));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Historial Médico</h2>
          <p className="text-muted-foreground">
            Paciente: {patient.firstName} {patient.lastName}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleEdit}>
              <EditIcon className="w-4 h-4 mr-2" />
              {medicalHistory ? 'Editar Historial' : 'Crear Historial'}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {medicalHistory ? 'Editar Historial Médico' : 'Crear Historial Médico'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bloodType">Tipo de Sangre</Label>
                  <Input
                    id="bloodType"
                    value={formData.bloodType || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bloodType: e.target.value }))}
                    placeholder="A+, B-, O+, AB-, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="Nombre y teléfono de contacto"
                  />
                </div>
              </div>

              {/* Alergias */}
              <div>
                <Label htmlFor="allergies">Alergias Conocidas</Label>
                <Input
                  id="allergies"
                  value={formData.allergies?.join(', ') || ''}
                  onChange={(e) => handleArrayFieldChange('allergies', e.target.value)}
                  placeholder="Penicilina, Nueces, Polen (separar con comas)"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Separar múltiples alergias con comas
                </p>
              </div>

              {/* Condiciones crónicas */}
              <div>
                <Label htmlFor="chronicConditions">Condiciones Crónicas</Label>
                <Input
                  id="chronicConditions"
                  value={formData.chronicConditions?.join(', ') || ''}
                  onChange={(e) => handleArrayFieldChange('chronicConditions', e.target.value)}
                  placeholder="Diabetes, Hipertensión, Asma (separar con comas)"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Separar múltiples condiciones con comas
                </p>
              </div>

              {/* Medicamentos actuales */}
              <div>
                <Label htmlFor="currentMedications">Medicamentos Actuales</Label>
                <Input
                  id="currentMedications"
                  value={formData.currentMedications?.join(', ') || ''}
                  onChange={(e) => handleArrayFieldChange('currentMedications', e.target.value)}
                  placeholder="Metformina 500mg, Losartán 25mg (separar con comas)"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Separar múltiples medicamentos con comas
                </p>
              </div>

              {/* Historial quirúrgico */}
              <div>
                <Label htmlFor="surgicalHistory">Historial Quirúrgico</Label>
                <Input
                  id="surgicalHistory"
                  value={formData.surgicalHistory?.join(', ') || ''}
                  onChange={(e) => handleArrayFieldChange('surgicalHistory', e.target.value)}
                  placeholder="Apendicectomía 2020, Cesárea 2018 (separar con comas)"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Separar múltiples cirugías con comas
                </p>
              </div>

              {/* Antecedentes familiares */}
              <div>
                <Label htmlFor="familyHistory">Antecedentes Familiares</Label>
                <Textarea
                  id="familyHistory"
                  value={formData.familyHistory || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, familyHistory: e.target.value }))}
                  placeholder="Historial médico familiar relevante..."
                  rows={3}
                />
              </div>

              {/* Historia social */}
              <div>
                <Label htmlFor="socialHistory">Historia Social</Label>
                <Textarea
                  id="socialHistory"
                  value={formData.socialHistory || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, socialHistory: e.target.value }))}
                  placeholder="Hábitos, trabajo, estilo de vida..."
                  rows={3}
                />
              </div>

              {/* Notas adicionales */}
              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Información adicional relevante..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={saveHistoryMutation.isPending}
              >
                {saveHistoryMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contenido del historial */}
      {!medicalHistory ? (
        <Card>
          <CardContent className="p-8 text-center">
            <HeartIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay historial médico</h3>
            <p className="text-muted-foreground mb-4">
              Aún no se ha creado el historial médico para este paciente.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <EditIcon className="w-4 h-4 mr-2" />
              Crear Historial Médico
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {medicalHistory.bloodType && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Tipo de Sangre</h4>
                    <Badge variant="outline" className="text-lg font-bold">
                      {medicalHistory.bloodType}
                    </Badge>
                  </div>
                )}
                
                {medicalHistory.emergencyContact && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Contacto de Emergencia</h4>
                    <p className="text-sm flex items-center gap-1">
                      <PhoneIcon className="w-3 h-3" />
                      {medicalHistory.emergencyContact}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alergias */}
          {medicalHistory.allergies && medicalHistory.allergies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangleIcon className="w-5 h-5 text-red-500" />
                  Alergias Conocidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="text-sm">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Condiciones crónicas */}
          {medicalHistory.chronicConditions && medicalHistory.chronicConditions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartIcon className="w-5 h-5 text-orange-500" />
                  Condiciones Crónicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.chronicConditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medicamentos actuales */}
          {medicalHistory.currentMedications && medicalHistory.currentMedications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PillIcon className="w-5 h-5 text-blue-500" />
                  Medicamentos Actuales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.currentMedications.map((medication, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {medication}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historial quirúrgico */}
          {medicalHistory.surgicalHistory && medicalHistory.surgicalHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScissorsIcon className="w-5 h-5 text-purple-500" />
                  Historial Quirúrgico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.surgicalHistory.map((surgery, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {surgery}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Antecedentes familiares */}
          {medicalHistory.familyHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-green-500" />
                  Antecedentes Familiares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{medicalHistory.familyHistory}</p>
              </CardContent>
            </Card>
          )}

          {/* Historia social */}
          {medicalHistory.socialHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-indigo-500" />
                  Historia Social
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{medicalHistory.socialHistory}</p>
              </CardContent>
            </Card>
          )}

          {/* Notas adicionales */}
          {medicalHistory.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas Adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{medicalHistory.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default MedicalHistoryManager;