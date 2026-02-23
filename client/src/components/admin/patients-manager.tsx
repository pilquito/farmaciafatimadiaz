import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { PlusIcon, EditIcon, TrashIcon, UserIcon, SearchIcon, LinkIcon, FileTextIcon, ClipboardListIcon, HeartIcon, CalendarIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MedicalVisitsManager from './medical-visits-manager';
import MedicalHistoryManager from './medical-history-manager';
import PatientAppointments from './patient-appointments';
import type { Patient, InsertPatient } from '@shared/schema';

export function PatientsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState('patients');
  const [location] = useLocation();
  const [formData, setFormData] = useState<Partial<InsertPatient>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    postalCode: '',
    identificationNumber: '',
    insuranceCompany: '',
    insuranceNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
    notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Detectar parámetro de paciente en la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('patient');
    
    if (patientId && patients.length > 0) {
      const patient = patients.find(p => p.id === parseInt(patientId));
      if (patient) {
        setSelectedPatient(patient);
        setActiveTab('appointments');
      }
    }
  }, [location, patients]);

  // Obtener todos los pacientes
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: () => apiRequest('/api/patients') as Promise<Patient[]>
  });

  // Obtener usuarios para vincular
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiRequest('/api/admin/users') as Promise<any[]>
  });

  // Crear/actualizar paciente
  const createOrUpdateMutation = useMutation({
    mutationFn: (data: { patient: Partial<InsertPatient>; isEdit: boolean; id?: number }) => {
      if (data.isEdit && data.id) {
        return apiRequest(`/api/patients/${data.id}`, {
          method: 'PUT',
          body: JSON.stringify(data.patient)
        });
      }
      return apiRequest('/api/patients', {
        method: 'POST',
        body: JSON.stringify(data.patient)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      setIsDialogOpen(false);
      setEditingPatient(null);
      resetForm();
      toast({
        title: editingPatient ? "Paciente actualizado" : "Paciente creado",
        description: editingPatient 
          ? "Los datos del paciente se han actualizado correctamente" 
          : "El nuevo paciente se ha añadido correctamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al guardar el paciente",
        variant: "destructive"
      });
    }
  });

  // Eliminar paciente
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/patients/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      toast({
        title: "Paciente eliminado",
        description: "El paciente se ha eliminado correctamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el paciente",
        variant: "destructive"
      });
    }
  });

  // Vincular paciente con usuario
  const linkUserMutation = useMutation({
    mutationFn: ({ patientId, userId }: { patientId: number; userId: number }) => 
      apiRequest(`/api/patients/${patientId}/link-user`, {
        method: 'PATCH',
        body: JSON.stringify({ userId })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      toast({
        title: "Usuario vinculado",
        description: "El paciente se ha vinculado correctamente con el usuario"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al vincular el usuario",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      postalCode: '',
      identificationNumber: '',
      insuranceCompany: '',
      insuranceNumber: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      medicalHistory: '',
      allergies: '',
      currentMedications: '',
      notes: ''
    });
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || '',
      address: patient.address || '',
      city: patient.city || '',
      postalCode: patient.postalCode || '',
      identificationNumber: patient.identificationNumber || '',
      insuranceCompany: patient.insuranceCompany || '',
      insuranceNumber: patient.insuranceNumber || '',
      emergencyContactName: patient.emergencyContactName || '',
      emergencyContactPhone: patient.emergencyContactPhone || '',
      medicalHistory: patient.medicalHistory || '',
      allergies: patient.allergies || '',
      currentMedications: patient.currentMedications || '',
      notes: patient.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    createOrUpdateMutation.mutate({
      patient: formData,
      isEdit: !!editingPatient,
      id: editingPatient?.id
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleLinkUser = (patientId: number, userId: number) => {
    linkUserMutation.mutate({ patientId, userId });
  };

  // Filtrar pacientes
  const filteredPatients = patients.filter(patient =>
    patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (patient.identificationNumber && patient.identificationNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
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
          <h1 className="text-3xl font-bold">Gestión de Pacientes</h1>
          <p className="text-muted-foreground">
            {selectedPatient 
              ? `Atendiendo a: ${selectedPatient.firstName} ${selectedPatient.lastName}`
              : "Administra las fichas médicas y datos de los pacientes"
            }
          </p>
        </div>

        {selectedPatient && (
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedPatient(null);
              setActiveTab('patients');
            }}
          >
            Volver a Lista de Pacientes
          </Button>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingPatient(null); }}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Nuevo Paciente
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Datos Personales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Datos Personales</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Nombre del paciente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellidos *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Apellidos del paciente"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="123-456-789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">Género</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Femenino</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="identificationNumber">DNI/NIE</Label>
                    <Input
                      id="identificationNumber"
                      value={formData.identificationNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, identificationNumber: e.target.value }))}
                      placeholder="12345678A"
                    />
                  </div>
                </div>
              </div>

              {/* Datos de Contacto y Seguro */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contacto y Seguro</h3>
                
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Calle, número, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Ciudad"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Código Postal</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="38500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName">Contacto de Emergencia</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                      placeholder="Nombre del contacto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactPhone">Teléfono de Emergencia</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                      placeholder="123-456-789"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="insuranceCompany">Compañía de Seguros</Label>
                    <Input
                      id="insuranceCompany"
                      value={formData.insuranceCompany}
                      onChange={(e) => setFormData(prev => ({ ...prev, insuranceCompany: e.target.value }))}
                      placeholder="Nombre de la aseguradora"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insuranceNumber">Número de Póliza</Label>
                    <Input
                      id="insuranceNumber"
                      value={formData.insuranceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, insuranceNumber: e.target.value }))}
                      placeholder="Número de póliza"
                    />
                  </div>
                </div>
              </div>

              {/* Información Médica */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold">Información Médica</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="allergies">Alergias</Label>
                    <Textarea
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                      placeholder="Alergias conocidas..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentMedications">Medicación Actual</Label>
                    <Textarea
                      id="currentMedications"
                      value={formData.currentMedications}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentMedications: e.target.value }))}
                      placeholder="Medicamentos que toma actualmente..."
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="medicalHistory">Historial Médico</Label>
                  <Textarea
                    id="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
                    placeholder="Historial médico relevante..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notas adicionales sobre el paciente..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createOrUpdateMutation.isPending}
              >
                {createOrUpdateMutation.isPending ? 'Guardando...' : (editingPatient ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Navegación con pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Lista de Pacientes
          </TabsTrigger>
          <TabsTrigger 
            value="appointments" 
            disabled={!selectedPatient}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            Citas
            {selectedPatient && <span className="text-xs">({selectedPatient.firstName})</span>}
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            disabled={!selectedPatient}
            className="flex items-center gap-2"
          >
            <HeartIcon className="w-4 h-4" />
            Historial Médico
            {selectedPatient && <span className="text-xs">({selectedPatient.firstName})</span>}
          </TabsTrigger>
          <TabsTrigger 
            value="visits" 
            disabled={!selectedPatient}
            className="flex items-center gap-2"
          >
            <ClipboardListIcon className="w-4 h-4" />
            Visitas Médicas
            {selectedPatient && <span className="text-xs">({selectedPatient.firstName})</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients">
          {/* Buscador */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nombre, email o DNI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">
              {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''}
            </Badge>
          </div>

      {/* Lista de Pacientes */}
      <div className="grid gap-4">
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <UserIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay pacientes</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No se encontraron pacientes que coincidan con tu búsqueda." : "Aún no has añadido ningún paciente."}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Añadir Primer Paciente
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      {patient.firstName} {patient.lastName}
                    </CardTitle>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <span>📧 {patient.email}</span>
                      <span>📞 {patient.phone}</span>
                      {patient.identificationNumber && (
                        <span>🆔 {patient.identificationNumber}</span>
                      )}
                      {patient.dateOfBirth && (
                        <span>📅 {new Date(patient.dateOfBirth).toLocaleDateString('es-ES')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!patient.userId && users.length > 0 && (
                      <Select onValueChange={(value) => handleLinkUser(patient.id, parseInt(value))}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Vincular usuario" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setActiveTab('appointments');
                      }}
                      title="Ver citas del paciente"
                    >
                      <CalendarIcon className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setActiveTab('history');
                      }}
                      title="Ver historial médico"
                    >
                      <HeartIcon className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setActiveTab('visits');
                      }}
                      title="Ver visitas médicas"
                    >
                      <FileTextIcon className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(patient)}
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
                          <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente la ficha médica de {patient.firstName} {patient.lastName}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(patient.id)}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Información Personal */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Información Personal</h4>
                    <div className="space-y-1 text-sm">
                      {patient.gender && <p><strong>Género:</strong> {patient.gender}</p>}
                      {patient.address && <p><strong>Dirección:</strong> {patient.address}</p>}
                      {patient.city && <p><strong>Ciudad:</strong> {patient.city} {patient.postalCode}</p>}
                    </div>
                  </div>

                  {/* Contacto de Emergencia */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Contacto de Emergencia</h4>
                    <div className="space-y-1 text-sm">
                      {patient.emergencyContactName && <p><strong>Nombre:</strong> {patient.emergencyContactName}</p>}
                      {patient.emergencyContactPhone && <p><strong>Teléfono:</strong> {patient.emergencyContactPhone}</p>}
                    </div>
                  </div>

                  {/* Seguro Médico */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Seguro Médico</h4>
                    <div className="space-y-1 text-sm">
                      {patient.insuranceCompany && <p><strong>Aseguradora:</strong> {patient.insuranceCompany}</p>}
                      {patient.insuranceNumber && <p><strong>Póliza:</strong> {patient.insuranceNumber}</p>}
                    </div>
                  </div>
                </div>

                {/* Información Médica */}
                {(patient.allergies || patient.currentMedications || patient.medicalHistory) && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-2">Información Médica</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {patient.allergies && (
                        <div>
                          <strong>Alergias:</strong>
                          <p className="text-muted-foreground">{patient.allergies}</p>
                        </div>
                      )}
                      {patient.currentMedications && (
                        <div>
                          <strong>Medicación Actual:</strong>
                          <p className="text-muted-foreground">{patient.currentMedications}</p>
                        </div>
                      )}
                      {patient.medicalHistory && (
                        <div>
                          <strong>Historial Médico:</strong>
                          <p className="text-muted-foreground">{patient.medicalHistory}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Usuario Vinculado */}
                {patient.userId && (
                  <div className="mt-4 pt-4 border-t">
                    <Badge variant="outline" className="text-xs">
                      <LinkIcon className="w-3 h-3 mr-1" />
                      Usuario vinculado (ID: {patient.userId})
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          {selectedPatient ? (
            <PatientAppointments patient={selectedPatient} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecciona un paciente</h3>
                <p className="text-muted-foreground">
                  Para ver las citas médicas, primero selecciona un paciente de la lista.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          {selectedPatient ? (
            <MedicalHistoryManager patient={selectedPatient} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <HeartIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecciona un paciente</h3>
                <p className="text-muted-foreground">
                  Para ver el historial médico, primero selecciona un paciente de la lista.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="visits">
          {selectedPatient ? (
            <MedicalVisitsManager patient={selectedPatient} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <ClipboardListIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecciona un paciente</h3>
                <p className="text-muted-foreground">
                  Para ver las visitas médicas, primero selecciona un paciente de la lista.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PatientsManager;