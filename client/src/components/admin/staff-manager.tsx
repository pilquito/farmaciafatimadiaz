import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Archive, Search, Filter, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Staff, insertStaffSchema } from "@shared/schema";
import { z } from "zod";

// Esquema para el formulario
const staffFormSchema = insertStaffSchema.extend({
  languages: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  socialLinks: z.object({
    linkedin: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
  availability: z.object({
    lunes: z.string().optional(),
    martes: z.string().optional(),
    miercoles: z.string().optional(),
    jueves: z.string().optional(),
    viernes: z.string().optional(),
    sabado: z.string().optional(),
    domingo: z.string().optional(),
  }).optional(),
});

type StaffFormData = z.infer<typeof staffFormSchema>;

interface StaffFormProps {
  staff?: Staff;
  onSuccess: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function StaffForm({ staff, onSuccess, open, onOpenChange }: StaffFormProps) {
  const { toast } = useToast();
  const isEditing = !!staff;

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      role: "",
      department: "centro_medico",
      specialty: "",
      description: "",
      imageUrl: "",
      email: "",
      phone: "",
      languages: [],
      experience: "",
      education: "",
      certifications: [],
      socialLinks: {},
      status: "active",
      displayOrder: 0,
    },
  });

  // Actualizar el formulario cuando cambie el staff
  React.useEffect(() => {
    if (staff) {
      form.reset({
        name: staff.name || "",
        role: staff.role || "",
        department: staff.department || "centro_medico",
        specialty: staff.specialty || "",
        description: staff.description || "",
        imageUrl: staff.imageUrl || "",
        email: staff.email || "",
        phone: staff.phone || "",
        languages: staff.languages || [],
        experience: staff.experience || "",
        education: staff.education || "",
        certifications: staff.certifications || [],
        socialLinks: staff.socialLinks ? (typeof staff.socialLinks === 'string' ? JSON.parse(staff.socialLinks) : staff.socialLinks) : {},
        status: staff.status || "active",
        displayOrder: staff.displayOrder || 0,
      });
    } else {
      form.reset({
        name: "",
        role: "",
        department: "centro_medico",
        specialty: "",
        description: "",
        imageUrl: "",
        email: "",
        phone: "",
        languages: [],
        experience: "",
        education: "",
        certifications: [],
        socialLinks: {},
        status: "active",
        displayOrder: 0,
      });
    }
  }, [staff, form]);

  const createMutation = useMutation({
    mutationFn: (data: StaffFormData) => {
      console.log("Creando personal con datos:", data);
      return apiRequest(`/api/staff`, {
        method: "POST",
        body: {
          ...data,
          socialLinks: JSON.stringify(data.socialLinks || {}),
        },
      });
    },
    onSuccess: () => {
      toast({ title: "Personal creado exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/active"] });
      onSuccess();
      form.reset();
    },
    onError: () => {
      toast({ title: "Error al crear personal", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: StaffFormData) => {
      console.log("Actualizando personal con datos:", data);
      return apiRequest(`/api/staff/${staff?.id}`, {
        method: "PUT",
        body: {
          ...data,
          socialLinks: JSON.stringify(data.socialLinks || {}),
        },
      });
    },
    onSuccess: () => {
      toast({ title: "Personal actualizado exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/active"] });
      onSuccess();
    },
    onError: (error) => {
      console.error("Error completo en actualización:", error);
      toast({ title: "Error al actualizar personal", variant: "destructive" });
    },
  });

  const onSubmit = (data: StaffFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const [languageInput, setLanguageInput] = useState("");
  const [certificationInput, setCertificationInput] = useState("");

  const addLanguage = () => {
    if (languageInput.trim()) {
      const currentLanguages = form.getValues("languages") || [];
      form.setValue("languages", [...currentLanguages, languageInput.trim()]);
      setLanguageInput("");
    }
  };

  const removeLanguage = (index: number) => {
    const currentLanguages = form.getValues("languages") || [];
    form.setValue("languages", currentLanguages.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    if (certificationInput.trim()) {
      const currentCertifications = form.getValues("certifications") || [];
      form.setValue("certifications", [...currentCertifications, certificationInput.trim()]);
      setCertificationInput("");
    }
  };

  const removeCertification = (index: number) => {
    const currentCertifications = form.getValues("certifications") || [];
    form.setValue("certifications", currentCertifications.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Personal" : "Nuevo Personal"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basico" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basico">Básico</TabsTrigger>
                <TabsTrigger value="profesional">Profesional</TabsTrigger>
                <TabsTrigger value="contacto">Contacto</TabsTrigger>
                <TabsTrigger value="disponibilidad">Disponibilidad</TabsTrigger>
              </TabsList>

              <TabsContent value="basico" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Dr. Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <FormControl>
                          <Input placeholder="Médico General" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar departamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="centro_medico">Centro Médico</SelectItem>
                            <SelectItem value="farmacia">Farmacia</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidad</FormLabel>
                        <FormControl>
                          <Input placeholder="Cardiología" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descripción del profesional..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagen del profesional</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="profesional" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experiencia</FormLabel>
                        <FormControl>
                          <Input placeholder="Más de 10 años de experiencia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Educación</FormLabel>
                        <FormControl>
                          <Input placeholder="Universidad de Barcelona" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label>Idiomas</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Agregar idioma"
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                    />
                    <Button type="button" onClick={addLanguage}>Agregar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(form.watch("languages") || []).map((lang, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeLanguage(index)}>
                        {lang} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Certificaciones</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Agregar certificación"
                      value={certificationInput}
                      onChange={(e) => setCertificationInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                    />
                    <Button type="button" onClick={addCertification}>Agregar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(form.watch("certifications") || []).map((cert, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeCertification(index)}>
                        {cert} ×
                      </Badge>
                    ))}
                  </div>
                </div>


              </TabsContent>

              <TabsContent value="contacto" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="doctor@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+34 123 456 789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Redes Sociales</Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="socialLinks.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/usuario" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialLinks.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input placeholder="https://facebook.com/usuario" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="socialLinks.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <Input placeholder="https://twitter.com/usuario" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialLinks.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/usuario" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="disponibilidad" className="space-y-4">
                <div className="space-y-4">
                  <Label>Horarios de disponibilidad</Label>
                  
                  {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((day) => (
                    <FormField
                      key={day}
                      control={form.control}
                      name={`availability.${day}` as keyof StaffFormData}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize">{day}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="9:00-14:00,16:00-20:00 (dejar vacío si no trabaja)"
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="inactive">Inactivo</SelectItem>
                            <SelectItem value="archived">Archivado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />



                  <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Orden de visualización</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Guardando..." : (isEditing ? "Actualizar" : "Crear")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function StaffManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const { data: staff = [], isLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      console.log("Eliminando personal ID:", id);
      return apiRequest(`/api/staff/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({ title: "Personal eliminado exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/active"] });
    },
    onError: () => {
      toast({ title: "Error al eliminar personal", variant: "destructive" });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (staff: Staff) => {
      const newStatus = staff.status === "archived" ? "active" : "archived";
      console.log(`Cambiando estado del personal ${staff.name} de ${staff.status} a ${newStatus}`);
      return apiRequest(`/api/staff/${staff.id}`, {
        method: "PATCH",
        body: { status: newStatus }, // Solo enviar el campo que necesita cambiar
      });
    },
    onSuccess: () => {
      toast({ title: "Personal archivado/desarchivado exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/active"] });
    },
    onError: () => {
      toast({ title: "Error al archivar personal", variant: "destructive" });
    },
  });

  const filteredStaff = staff.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.specialty && member.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const openForm = (staff?: Staff) => {
    setSelectedStaff(staff || null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedStaff(null);
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div>Cargando personal...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Personal</h1>
          <p className="text-muted-foreground">
            Administra el equipo de la farmacia y centro médico
          </p>
        </div>
        <Button onClick={() => openForm()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Personal
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, cargo o especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los departamentos</SelectItem>
                <SelectItem value="centro_medico">Centro Médico</SelectItem>
                <SelectItem value="farmacia">Farmacia</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de personal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={member.imageUrl || ""} alt={member.name} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    {member.specialty && (
                      <p className="text-sm text-green-600">{member.specialty}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={member.department === 'centro_medico' ? 'default' : 'secondary'}>
                      {member.department === 'centro_medico' ? 'Centro Médico' : 'Farmacia'}
                    </Badge>
                    
                    <Badge variant={
                      member.status === 'active' ? 'default' : 
                      member.status === 'inactive' ? 'destructive' : 'outline'
                    }>
                      {member.status === 'active' ? 'Activo' : 
                       member.status === 'inactive' ? 'Inactivo' : 'Archivado'}
                    </Badge>
                    

                  </div>
                  

                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openForm(member)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => archiveMutation.mutate(member)}
                  disabled={archiveMutation.isPending}
                >
                  <Archive className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(member.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No se encontró personal que coincida con los filtros seleccionados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Formulario */}
      <StaffForm
        staff={selectedStaff}
        onSuccess={closeForm}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
    </div>
  );
}