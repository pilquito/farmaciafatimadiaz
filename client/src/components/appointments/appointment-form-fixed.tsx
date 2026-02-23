import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, User, Mail, Phone, Clock, FileText, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AvailabilityCalendar } from "./availability-calendar";
import { AppointmentHistory } from "./appointment-history";

// Esquema de validación para el formulario
const appointmentFormSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, introduce un correo electrónico válido.",
  }),
  phone: z.string().min(9, {
    message: "El número de teléfono debe tener al menos 9 dígitos.",
  }),
  date: z.date({
    required_error: "Por favor, selecciona una fecha para tu cita.",
  }),
  time: z.string({
    required_error: "Por favor, selecciona una hora para tu cita.",
  }),
  speciality: z.string({
    required_error: "Por favor, selecciona una especialidad médica.",
  }),
  doctor: z.string().optional(),
  reason: z.string().min(10, {
    message: "Por favor, describe brevemente el motivo de tu consulta (mínimo 10 caracteres).",
  }),
  insurance: z.string().optional(),
  notes: z.string().optional(),
});

// Tipo para los valores del formulario
type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

// Especialidades médicas
const specialities = [
  "Medicina General",
  "Pediatría",
  "Ginecología",
  "Dermatología",
  "Cardiología",
  "Oftalmología",
  "Traumatología",
  "Nutrición",
  "Psicología",
  "Odontología"
];

// Doctores por especialidad
const doctorsBySpeciality: Record<string, string[]> = {
  "Medicina General": ["Dra. María Rodríguez", "Dr. Juan Pérez"],
  "Pediatría": ["Dra. Laura González", "Dr. Carlos Martínez"],
  "Ginecología": ["Dra. Ana Sánchez", "Dra. Patricia Torres"],
  "Dermatología": ["Dr. Miguel Fernández", "Dra. Sofía López"],
  "Cardiología": ["Dr. Roberto Díaz", "Dra. Elena Morales"],
  "Oftalmología": ["Dra. Carmen Vega", "Dr. Javier Ruiz"],
  "Traumatología": ["Dr. Francisco Jiménez", "Dra. Marta Herrera"],
  "Nutrición": ["Dra. Lucía Castro", "Dr. Daniel Ortega"],
  "Psicología": ["Dra. Beatriz Navarro", "Dr. Alejandro Soto"],
  "Odontología": ["Dr. Raúl Molina", "Dra. Isabel Flores"]
};

// Compañías de seguros
const insuranceCompanies = [
  "Adeslas",
  "Sanitas",
  "DKV",
  "Asisa",
  "Mapfre",
  "Caser",
  "Mutua Madrileña",
  "AXA",
  "Sin seguro médico"
];

export function AppointmentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // En una implementación real, esto vendría de un contexto de autenticación
  
  // Estado para la selección de fecha y hora en el calendario
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(null);
  const [calendarSelectedTime, setCalendarSelectedTime] = useState<string | null>(null);
  
  // Configurar el formulario con validación
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      speciality: "",
      reason: "",
      insurance: "Sin seguro médico",
      notes: "",
    },
  });
  
  // Actualizar el formulario cuando se selecciona una fecha y hora en el calendario
  useEffect(() => {
    if (calendarSelectedDate) {
      form.setValue('date', calendarSelectedDate);
    }
    
    if (calendarSelectedTime) {
      form.setValue('time', calendarSelectedTime);
    }
  }, [calendarSelectedDate, calendarSelectedTime, form]);
  
  // Manejar el envío del formulario
  async function onSubmit(data: AppointmentFormValues) {
    setIsSubmitting(true);
    
    try {
      // Formatear la fecha para enviarla al servidor
      const formattedData = {
        ...data,
        date: format(data.date, "yyyy-MM-dd"),
        formattedDate: format(data.date, "dd 'de' MMMM 'de' yyyy", { locale: es }),
      };
      
      // Enviar los datos al servidor
      await apiRequest("POST", "/api/appointments", formattedData);
      
      // Invalidar cualquier consulta de citas que pueda existir
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      
      // Mostrar mensaje de éxito
      toast({
        title: "Cita agendada con éxito",
        description: `Tu cita ha sido programada para el ${formattedData.formattedDate} a las ${data.time}. Recibirás un correo electrónico de confirmación.`,
      });
      
      // Marcar como enviado
      setSubmitted(true);
      
      // Reiniciar el formulario
      form.reset();
    } catch (error) {
      console.error("Error al agendar la cita:", error);
      
      // Mostrar mensaje de error
      toast({
        title: "Error al agendar la cita",
        description: "Ha ocurrido un error al intentar agendar tu cita. Por favor, inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Manejar el cambio de especialidad
  const handleSpecialityChange = (value: string) => {
    form.setValue("speciality", value);
    form.setValue("doctor", ""); // Reiniciar el doctor seleccionado
  };
  
  // Efecto de entrada
  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  // Si el formulario ha sido enviado con éxito, mostrar mensaje de confirmación
  if (submitted) {
    return (
      <motion.div 
        className="bg-white rounded-lg p-8 shadow-lg text-center max-w-2xl mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">¡Cita Agendada con Éxito!</h2>
          <p className="text-neutral-600 mb-6">
            Hemos recibido tu solicitud de cita. En breve recibirás un correo electrónico de confirmación con los detalles.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => setSubmitted(false)}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              Agendar otra cita
            </Button>
            {isAuthenticated && (
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/mi-cuenta/citas"}
              >
                Ver mis citas
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Renderizar el formulario
  return (
    <Tabs defaultValue="new" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="new" className="text-base py-3">
          <Clock className="mr-2 h-4 w-4" />
          Nueva Cita
        </TabsTrigger>
        <TabsTrigger value="history" className="text-base py-3">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Mis Citas
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="new">
        <motion.div 
          className="bg-white rounded-lg p-6 shadow-lg"
          variants={formAnimation}
          initial="hidden"
          animate="visible"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información personal */}
                <motion.div variants={itemAnimation} className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">
                    Información personal
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. María García López" {...field} />
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
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. maria@ejemplo.com" type="email" {...field} />
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
                          <Input placeholder="Ej. 600 123 456" {...field} />
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
                        <FormLabel>Compañía de seguro médico (opcional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tu compañía de seguro" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {insuranceCompanies.map((company) => (
                              <SelectItem key={company} value={company}>
                                {company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                {/* Detalles de la cita */}
                <motion.div variants={itemAnimation} className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">
                    Detalles de la cita
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="speciality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidad médica</FormLabel>
                        <Select onValueChange={handleSpecialityChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una especialidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {specialities.map((speciality) => (
                              <SelectItem key={speciality} value={speciality}>
                                {speciality}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("speciality") && (
                    <FormField
                      control={form.control}
                      name="doctor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor/a (opcional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un doctor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sin_preferencia">Sin preferencia</SelectItem>
                              {doctorsBySpeciality[form.watch("speciality")]?.map((doctor) => (
                                <SelectItem key={doctor} value={doctor}>
                                  {doctor}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Selecciona fecha y hora</FormLabel>
                        <FormDescription>
                          Usa el calendario para elegir día y hora de tu cita
                        </FormDescription>
                        
                        <AvailabilityCalendar
                          speciality={form.watch("speciality") || ""}
                          doctor={form.watch("doctor") || ""}
                          onSelectDateAndTime={(date, time) => {
                            setCalendarSelectedDate(date);
                            setCalendarSelectedTime(time);
                            field.onChange(date);
                          }}
                          selectedDate={calendarSelectedDate}
                          selectedTime={calendarSelectedTime}
                        />
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Campo oculto para hora */}
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input {...field} type="hidden" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </motion.div>
              </div>
              
              {/* Motivo de la consulta */}
              <motion.div variants={itemAnimation}>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo de la consulta</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe brevemente el motivo de tu consulta" 
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              {/* Notas adicionales */}
              <motion.div variants={itemAnimation}>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas adicionales (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="¿Alguna información adicional que quieras compartir?" 
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              {/* Botón de envío */}
              <motion.div 
                variants={itemAnimation}
                className="flex justify-end"
              >
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Agendar Cita"}
                </Button>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </TabsContent>
      
      <TabsContent value="history">
        <AppointmentHistory />
      </TabsContent>
    </Tabs>
  );
}