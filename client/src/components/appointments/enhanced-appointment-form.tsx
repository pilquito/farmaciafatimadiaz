import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CalendarCheck, User, Phone, Mail, FileText, Shield } from "lucide-react";
import EnhancedAppointmentSelector from "./enhanced-appointment-selector";

const appointmentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(9, "Teléfono debe tener al menos 9 dígitos"),
  reason: z.string().min(10, "Describe el motivo de la consulta (mínimo 10 caracteres)"),
  insurance: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface SelectedAppointment {
  specialtyId: number;
  doctorId: number;
  date: string;
  time: string;
  specialty: string;
  doctor: string;
}

export default function EnhancedAppointmentForm() {
  const [selectedAppointment, setSelectedAppointment] = useState<SelectedAppointment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener datos del usuario autenticado
  const { data: user } = useQuery({
    queryKey: ["/api/auth/profile"],
  });

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      reason: "",
      insurance: "",
      notes: "",
    },
  });

  // Rellenar formulario automáticamente cuando se muestren los datos del usuario
  useEffect(() => {
    if (user && showForm && !isFormInitialized) {
      const userData = user as any;
      console.log("Datos del usuario completos:", userData);
      const fullName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
      
      // Usar requestAnimationFrame para asegurar que el DOM esté completamente renderizado
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Usar setValue con trigger para forzar la actualización visual
          form.setValue("name", fullName || userData.username || "", { shouldValidate: true, shouldDirty: true });
          form.setValue("email", userData.email || "", { shouldValidate: true, shouldDirty: true });
          form.setValue("phone", userData.phone || "", { shouldValidate: true, shouldDirty: true });
          form.setValue("reason", "", { shouldDirty: true });
          form.setValue("insurance", "", { shouldDirty: true });
          form.setValue("notes", "", { shouldDirty: true });
          
          // Forzar re-render del formulario
          form.trigger();
          
          console.log("Campos actualizados con valores:", {
            name: fullName || userData.username || "",
            email: userData.email || "",
            phone: userData.phone || "",
          });
          
          setIsFormInitialized(true);
        }, 300);
      });
    }
  }, [user, showForm, isFormInitialized, form]);

  // Reset cuando se oculta el formulario
  useEffect(() => {
    if (!showForm) {
      setIsFormInitialized(false);
    }
  }, [showForm]);

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormData & SelectedAppointment) => {
      return await apiRequest("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          status: "pendiente",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "¡Cita solicitada exitosamente!",
        description: "Recibirás una confirmación por email pronto.",
      });
      form.reset();
      setSelectedAppointment(null);
      setShowForm(false);
    },
    onError: (error) => {
      console.error("Error creating appointment:", error);
      toast({
        title: "Error al solicitar la cita",
        description: "Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    },
  });

  const handleAppointmentSelect = (appointmentData: SelectedAppointment) => {
    setSelectedAppointment(appointmentData);
    setShowForm(true);
  };

  const onSubmit = (data: AppointmentFormData) => {
    if (!selectedAppointment) {
      toast({
        title: "Error",
        description: "Por favor selecciona fecha y hora primero.",
        variant: "destructive",
      });
      return;
    }

    createAppointmentMutation.mutate({
      ...data,
      ...selectedAppointment,
    });
  };

  const resetSelection = () => {
    setSelectedAppointment(null);
    setShowForm(false);
    form.reset();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <CalendarCheck className="h-8 w-8" />
          Solicitar Cita Médica
        </h1>
        <p className="text-muted-foreground mt-2">
          Agenda tu consulta de forma fácil y rápida
        </p>
      </div>

      {!showForm && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paso 1: Selecciona tu cita</CardTitle>
              <CardDescription>
                Elige la especialidad, doctor, fecha y hora que mejor se adapte a tus necesidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedAppointmentSelector onAppointmentSelect={handleAppointmentSelect} />
            </CardContent>
          </Card>
        </div>
      )}

      {showForm && selectedAppointment && (
        <div className="space-y-6">
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-primary">Cita Seleccionada</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Especialidad:</span>
                <p className="text-muted-foreground">{selectedAppointment.specialty}</p>
              </div>
              <div>
                <span className="font-medium">Doctor:</span>
                <p className="text-muted-foreground">{selectedAppointment.doctor}</p>
              </div>
              <div>
                <span className="font-medium">Fecha:</span>
                <p className="text-muted-foreground">{selectedAppointment.date}</p>
              </div>
              <div>
                <span className="font-medium">Hora:</span>
                <p className="text-muted-foreground">{selectedAppointment.time}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paso 2: Confirma tus datos</CardTitle>
              <CardDescription>
                Tus datos se han completado automáticamente. Verifica que todo esté correcto y completa el motivo de consulta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Nombre completo
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Juan Pérez García" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Correo electrónico
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="juan@ejemplo.com" {...field} />
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
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Teléfono
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="666 123 456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="insurance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Seguro médico (opcional)
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona tu seguro" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ninguno">Sin seguro médico</SelectItem>
                                <SelectItem value="sanitas">Sanitas</SelectItem>
                                <SelectItem value="mapfre">Mapfre</SelectItem>
                                <SelectItem value="axa">AXA</SelectItem>
                                <SelectItem value="dkv">DKV</SelectItem>
                                <SelectItem value="asisa">Asisa</SelectItem>
                                <SelectItem value="otro">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Motivo de la consulta
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe brevemente el motivo de tu consulta..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Esta información ayudará al doctor a prepararse para tu consulta
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas adicionales (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Cualquier información adicional que consideres relevante..."
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetSelection}
                      className="flex-1"
                    >
                      Cambiar Horario
                    </Button>
                    <Button
                      type="submit"
                      disabled={createAppointmentMutation.isPending}
                      className="flex-1"
                    >
                      {createAppointmentMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Solicitando...
                        </div>
                      ) : (
                        "Solicitar Cita"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Al solicitar esta cita, aceptas nuestros términos y condiciones.
              Recibirás una confirmación por email con los detalles de tu cita.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}