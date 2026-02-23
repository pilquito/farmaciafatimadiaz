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
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { PlusIcon, EditIcon, TrashIcon, BuildingIcon, SearchIcon, PhoneIcon, MailIcon, GlobeIcon } from 'lucide-react';
import type { InsuranceCompany, InsertInsuranceCompany } from '@shared/schema';

export function InsuranceCompaniesManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<InsuranceCompany | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Partial<InsertInsuranceCompany>>({
    name: '',
    code: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    postalCode: '',
    coverageTypes: [],
    notes: '',
    active: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener todas las aseguradoras
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['/api/insurance-companies'],
    queryFn: () => apiRequest('/api/insurance-companies') as Promise<InsuranceCompany[]>
  });

  // Crear/actualizar aseguradora
  const createOrUpdateMutation = useMutation({
    mutationFn: (data: { company: Partial<InsertInsuranceCompany>; isEdit: boolean; id?: number }) => {
      if (data.isEdit && data.id) {
        return apiRequest(`/api/insurance-companies/${data.id}`, {
          method: 'PUT',
          body: JSON.stringify(data.company)
        });
      }
      return apiRequest('/api/insurance-companies', {
        method: 'POST',
        body: JSON.stringify(data.company)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/insurance-companies'] });
      setIsDialogOpen(false);
      setEditingCompany(null);
      resetForm();
      toast({
        title: editingCompany ? "Aseguradora actualizada" : "Aseguradora creada",
        description: editingCompany 
          ? "Los datos de la aseguradora se han actualizado correctamente" 
          : "La nueva aseguradora se ha añadido correctamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al guardar la aseguradora",
        variant: "destructive"
      });
    }
  });

  // Eliminar aseguradora
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/insurance-companies/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/insurance-companies'] });
      toast({
        title: "Aseguradora eliminada",
        description: "La aseguradora se ha eliminado correctamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la aseguradora",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      city: '',
      postalCode: '',
      coverageTypes: [],
      notes: '',
      active: true
    });
  };

  const handleEdit = (company: InsuranceCompany) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      code: company.code,
      phone: company.phone || '',
      email: company.email || '',
      website: company.website || '',
      address: company.address || '',
      city: company.city || '',
      postalCode: company.postalCode || '',
      coverageTypes: company.coverageTypes || [],
      notes: company.notes || '',
      active: company.active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      toast({
        title: "Error",
        description: "Por favor completa el nombre y código de la aseguradora",
        variant: "destructive"
      });
      return;
    }

    createOrUpdateMutation.mutate({
      company: formData,
      isEdit: !!editingCompany,
      id: editingCompany?.id
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleCoverageTypesChange = (value: string) => {
    if (value.trim()) {
      const types = value.split(',').map(t => t.trim()).filter(t => t);
      setFormData(prev => ({ ...prev, coverageTypes: types }));
    }
  };

  // Filtrar aseguradoras
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.city && company.city.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <h1 className="text-3xl font-bold">Gestión de Aseguradoras</h1>
          <p className="text-muted-foreground">
            Administra las compañías de seguros médicos disponibles
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingCompany(null); }}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Nueva Aseguradora
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? 'Editar Aseguradora' : 'Nueva Aseguradora'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre de la Aseguradora *</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Sanitas Seguros"
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">Código *</Label>
                    <Input
                      id="code"
                      value={formData.code || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="Ej: SANITAS"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="900 123 456"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="info@aseguradora.es"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={formData.website || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.aseguradora.es"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dirección</h3>
                
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Calle, número, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Santa Cruz de Tenerife"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Código Postal</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="38001"
                    />
                  </div>
                </div>
              </div>

              {/* Tipos de Cobertura */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tipos de Cobertura</h3>
                
                <div>
                  <Label htmlFor="coverageTypes">Tipos de Cobertura (separados por comas)</Label>
                  <Input
                    id="coverageTypes"
                    value={formData.coverageTypes?.join(', ') || ''}
                    onChange={(e) => handleCoverageTypesChange(e.target.value)}
                    placeholder="Consultas, Urgencias, Hospitalización, Análisis"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Ejemplo: Consultas, Urgencias, Hospitalización, Análisis
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Información adicional sobre la aseguradora..."
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
                {createOrUpdateMutation.isPending ? 'Guardando...' : (editingCompany ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nombre, código o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary">
          {filteredCompanies.length} aseguradora{filteredCompanies.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Lista de Aseguradoras */}
      <div className="grid gap-4">
        {filteredCompanies.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BuildingIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay aseguradoras</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No se encontraron aseguradoras que coincidan con tu búsqueda." : "Aún no has añadido ninguna aseguradora."}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Añadir Primera Aseguradora
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCompanies.map((company) => (
            <Card key={company.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{company.name}</CardTitle>
                      <Badge variant="outline">{company.code}</Badge>
                      {!company.active && (
                        <Badge variant="destructive">Inactiva</Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {company.phone && (
                        <span className="flex items-center gap-1">
                          <PhoneIcon className="w-3 h-3" />
                          {company.phone}
                        </span>
                      )}
                      {company.email && (
                        <span className="flex items-center gap-1">
                          <MailIcon className="w-3 h-3" />
                          {company.email}
                        </span>
                      )}
                      {company.website && (
                        <span className="flex items-center gap-1">
                          <GlobeIcon className="w-3 h-3" />
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Sitio web
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(company)}
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
                          <AlertDialogTitle>¿Eliminar aseguradora?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente la aseguradora {company.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(company.id)}
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
                  {/* Dirección */}
                  {(company.address || company.city) && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Dirección</h4>
                      <div className="space-y-1 text-sm">
                        {company.address && <p>{company.address}</p>}
                        {company.city && (
                          <p>{company.city} {company.postalCode}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tipos de Cobertura */}
                  {company.coverageTypes && company.coverageTypes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Tipos de Cobertura</h4>
                      <div className="flex flex-wrap gap-1">
                        {company.coverageTypes.map((type, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notas */}
                {company.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-2">Notas</h4>
                    <p className="text-sm text-muted-foreground">{company.notes}</p>
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

export default InsuranceCompaniesManager;