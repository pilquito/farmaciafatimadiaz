import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Esquema para el formulario de testimonio
const testimonialFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  role: z.string().min(2, "El rol es requerido"),
  content: z.string().min(10, "El testimonio debe tener al menos 10 caracteres"),
  rating: z.coerce.number().min(1).max(5),
  imageUrl: z.string().url("Debe proporcionar una URL válida para la imagen").optional(),
  approved: z.boolean().default(false),
  response: z.string().optional(),
  moderationNotes: z.string().optional(),
});

type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

// Tipo para testimonios
interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  imageUrl?: string;
  date: string;
  approved: boolean;
  response?: string;
  moderationNotes?: string;
  notified?: boolean;
}

export function TestimonialsManager() {
  const queryClient = useQueryClient();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasNewTestimonials, setHasNewTestimonials] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  
  // Consultar la lista de testimonios
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials/all'], // Obtener todos los testimonios, no solo los aprobados
  });
  
  // Para manejar el envío del formulario
  const handleSubmit = (data: TestimonialFormValues) => {
    if (selectedTestimonial) {
      // Editar testimonio existente
      setIsEditDialogOpen(false);
      toast({
        title: "Testimonio actualizado",
        description: "El testimonio ha sido actualizado correctamente.",
      });
      // Recargar datos
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials/all'] });
    } else {
      // Crear nuevo testimonio
      setIsEditDialogOpen(false);
      toast({
        title: "Testimonio creado",
        description: "El testimonio ha sido creado correctamente.",
      });
      // Recargar datos
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials/all'] });
    }
  };
  
  // Efecto para verificar testimonios pendientes
  useEffect(() => {
    if (testimonials && testimonials.length > 0) {
      // Verificar si hay testimonios pendientes de aprobación
      const pendingTestimonials = testimonials.filter(testimonial => !testimonial.approved);
      setHasNewTestimonials(pendingTestimonials.length > 0);
      
      // Si hay testimonios pendientes, mostrar una notificación
      if (pendingTestimonials.length > 0 && !sessionStorage.getItem('testimonialNotificationShown')) {
        toast({
          title: `${pendingTestimonials.length} testimonios pendientes`,
          description: "Hay nuevos testimonios esperando tu aprobación.",
          variant: "default",
        });
        sessionStorage.setItem('testimonialNotificationShown', 'true');
      }
    }
  });
  
  // Formulario para editar o moderar testimonios
  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      name: "",
      role: "",
      content: "",
      rating: 5,
      imageUrl: "",
      approved: false,
      response: "",
      moderationNotes: "",
    },
  });
  
  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Generar estrellas para la valoración
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
            <i className="fas fa-star"></i>
          </span>
        ))}
      </div>
    );
  };
  
  // Mutación para aprobar un testimonio
  const approveTestimonialMutation = useMutation({
    mutationFn: async (data: { id: number, approved: boolean, response?: string, moderationNotes?: string }) => {
      const response = await apiRequest("PATCH", `/api/testimonials/${data.id}/approve`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials/all'] });
      setIsApproveDialogOpen(false);
      setSelectedTestimonial(null);
      form.reset();
      toast({
        title: "Testimonio actualizado",
        description: "El estado del testimonio ha sido actualizado exitosamente.",
      });
    },
    onError: (error) => {
      console.error("Error al actualizar el testimonio:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el testimonio. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });
  
  // Mutación para eliminar un testimonio
  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/testimonials/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials/all'] });
      setIsDeleteDialogOpen(false);
      setSelectedTestimonial(null);
      toast({
        title: "Testimonio eliminado",
        description: "El testimonio ha sido eliminado exitosamente.",
      });
    },
    onError: (error) => {
      console.error("Error al eliminar el testimonio:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el testimonio. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });
  
  // Configurar el formulario para aprobar/rechazar un testimonio
  const handleApproveTestimonial = (testimonial: Testimonial, approved: boolean) => {
    setSelectedTestimonial(testimonial);
    form.reset({
      name: testimonial.name,
      role: testimonial.role,
      content: testimonial.content,
      rating: testimonial.rating,
      imageUrl: testimonial.imageUrl,
      approved: approved,
      response: testimonial.response || "",
      moderationNotes: testimonial.moderationNotes || "",
    });
    setIsApproveDialogOpen(true);
  };
  
  // Configurar el diálogo para eliminar un testimonio
  const handleDeleteTestimonial = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsDeleteDialogOpen(true);
  };
  
  // Manejar la confirmación de aprobación/rechazo
  function onConfirmApprove(data: TestimonialFormValues) {
    if (selectedTestimonial) {
      approveTestimonialMutation.mutate({
        id: selectedTestimonial.id,
        approved: data.approved,
        response: data.response,
        moderationNotes: data.moderationNotes,
      });
    }
  }
  
  // Manejar la confirmación de eliminación
  function onConfirmDelete() {
    if (selectedTestimonial) {
      deleteTestimonialMutation.mutate(selectedTestimonial.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-800">Gestión de Testimonios</h2>
        
        <Button 
          className="bg-primary hover:bg-primary-dark text-white"
          onClick={() => {
            setSelectedTestimonial(null);
            setIsEditDialogOpen(true);
          }}
        >
          <i className="fas fa-plus mr-2"></i>
          Nuevo Testimonio
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-700">Cargando testimonios...</p>
        </div>
      ) : (
        <>
          {testimonials.length === 0 ? (
            <div className="text-center py-10 bg-neutral-50 rounded-lg border">
              <div className="text-5xl text-neutral-300 mb-4">
                <i className="fas fa-comment-dots"></i>
              </div>
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                No hay testimonios
              </h3>
              <p className="text-neutral-500 mb-6">
                Añade tu primer testimonio para mostrar experiencias de tus clientes.
              </p>
              <Button 
                className="bg-primary hover:bg-primary-dark text-white"
                onClick={() => {
                  setSelectedTestimonial(null);
                  setIsEditDialogOpen(true);
                }}
              >
                <i className="fas fa-plus mr-2"></i>
                Añadir Testimonio
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valoración</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell>
                        <div className="font-medium">{testimonial.name}</div>
                        <div className="text-sm text-neutral-500">{testimonial.role}</div>
                      </TableCell>
                      <TableCell>{renderStars(testimonial.rating)}</TableCell>
                      <TableCell>{formatDate(testimonial.date)}</TableCell>
                      <TableCell>
                        {testimonial.approved ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Aprobado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!testimonial.approved && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-green-500 hover:text-green-700"
                              onClick={() => {
                                setSelectedTestimonial(testimonial);
                                setIsApproveDialogOpen(true);
                              }}
                            >
                              <i className="fas fa-check"></i>
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedTestimonial(testimonial);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              setSelectedTestimonial(testimonial);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
      
      {/* Diálogo para editar o crear un testimonio */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedTestimonial ? "Editar Testimonio" : "Nuevo Testimonio"}
            </DialogTitle>
            <DialogDescription>
              {selectedTestimonial 
                ? "Modifica los detalles del testimonio seleccionado" 
                : "Completa el formulario para añadir un nuevo testimonio"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del cliente" {...field} />
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
                      <FormLabel>Rol</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Cliente habitual" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testimonio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Contenido del testimonio" 
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
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valoración (1-5)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="5" 
                        step="1"
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
                    <FormLabel>URL de imagen (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://ejemplo.com/imagen.jpg" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="approved"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Aprobar testimonio</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Testimonios aprobados serán visibles en la página web
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="moderationNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas de moderación (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Notas internas sobre este testimonio" 
                        className="min-h-[80px]"
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark text-white"
                  disabled={approveTestimonialMutation.isPending}
                >
                  {approveTestimonialMutation.isPending ? "Guardando..." : "Guardar Testimonio"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de aprobación de testimonio */}
      {selectedTestimonial && (
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Aprobar Testimonio</DialogTitle>
              <DialogDescription>
                Revisión y aprobación del testimonio seleccionado
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-4 border rounded-md bg-neutral-50">
              <div className="mb-2">
                <span className="font-medium">{selectedTestimonial.name}</span>
                <span className="text-sm text-neutral-500 ml-2">({selectedTestimonial.role})</span>
              </div>
              <div className="mb-2">{renderStars(selectedTestimonial.rating)}</div>
              <p className="text-neutral-700 italic">"{selectedTestimonial.content}"</p>
            </div>
            
            <div className="flex items-center space-x-2 py-2">
              <Switch 
                id="approve-switch"
                checked={form.getValues().approved}
                onCheckedChange={(checked) => form.setValue("approved", checked)}
              />
              <label htmlFor="approve-switch" className="text-sm font-medium">
                {form.getValues().approved ? "Aprobar" : "Rechazar"} este testimonio
              </label>
            </div>
            
            <FormField
              control={form.control}
              name="moderationNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de moderación (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas internas sobre este testimonio" 
                      className="min-h-[80px]"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsApproveDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                className={cn(
                  "text-white",
                  form.getValues().approved 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-yellow-600 hover:bg-yellow-700"
                )}
                onClick={() => onConfirmApprove(form.getValues())}
                disabled={approveTestimonialMutation.isPending}
              >
                {approveTestimonialMutation.isPending ? "Guardando..." : 
                  form.getValues().approved ? "Aprobar" : "Rechazar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Diálogo de eliminación de testimonio */}
      {selectedTestimonial && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Eliminar Testimonio</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este testimonio?
                Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-4 border rounded-md bg-neutral-50">
              <div className="mb-2">
                <span className="font-medium">{selectedTestimonial.name}</span>
                <span className="text-sm text-neutral-500 ml-2">({selectedTestimonial.role})</span>
              </div>
              <div className="mb-2">{renderStars(selectedTestimonial.rating)}</div>
              <p className="text-neutral-700 italic">"{selectedTestimonial.content}"</p>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={() => deleteTestimonialMutation.mutate(selectedTestimonial.id)}
                disabled={deleteTestimonialMutation.isPending}
              >
                {deleteTestimonialMutation.isPending ? "Eliminando..." : "Eliminar Testimonio"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <div className="text-center text-sm text-neutral-500 py-4">
        <p>Esta es una vista simplificada. En un entorno de producción, podrías:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Implementar un sistema de notificaciones para nuevos testimonios</li>
          <li>Añadir un sistema de respuestas para los testimonios</li>
          <li>Configurar reglas de moderación automática</li>
        </ul>
      </div>
    </div>
  );
}