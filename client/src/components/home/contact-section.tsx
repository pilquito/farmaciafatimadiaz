import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Captcha } from "@/components/captcha/captcha";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Por favor, introduce un email válido" }),
  phone: z.string().optional(),
  subject: z.string().min(1, { message: "Por favor, selecciona un asunto" }),
  message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres" }),
  privacy: z.boolean().refine(val => val === true, {
    message: "Debes aceptar la política de privacidad",
  }),
  captcha: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactSection() {
  const { toast } = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  
  // Obtener configuración de seguridad para verificar si el captcha está habilitado
  const { data: securityConfig } = useQuery({
    queryKey: ['/api/settings/security'],
  });
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      privacy: false,
      captcha: "",
    },
  });
  
  const contactMutation = useMutation({
    mutationFn: async (data: Omit<ContactFormValues, "privacy">) => {
      return await apiRequest("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "¡Mensaje enviado!",
        description: "Nos pondremos en contacto con usted pronto.",
      });
      form.reset();
      setFormSubmitted(true);
    },
    onError: (error) => {
      toast({
        title: "Error al enviar el mensaje",
        description: error.message || "Por favor, inténtelo de nuevo más tarde.",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: ContactFormValues) {
    // Verificar si el captcha está habilitado y si se requiere token
    if (securityConfig?.enableCaptcha && !captchaToken) {
      toast({
        title: "Verificación requerida",
        description: "Por favor, complete la verificación captcha.",
        variant: "destructive",
      });
      return;
    }
    
    const { privacy, ...contactData } = data;
    // Incluir el token del captcha si está disponible
    if (captchaToken) {
      contactData.captcha = captchaToken;
    }
    
    contactMutation.mutate(contactData);
  }
  
  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    form.setValue("captcha", token);
  };
  
  const handleCaptchaExpire = () => {
    setCaptchaToken("");
    form.setValue("captcha", "");
  };
  
  return (
    <section id="contacto" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">Contacto</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-neutral-700 max-w-2xl mx-auto">
            Estamos a su disposición para resolver cualquier duda o atender sus consultas.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6 mb-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="font-serif text-xl font-bold mb-4 text-primary">Farmacia Fátima Díaz Guillén</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <i className="fas fa-map-marker-alt text-primary mt-1 mr-3"></i>
                  <span>CALLE NICARAGUA 2<br />38500, Guimar (Tenerife)</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-phone-alt text-primary mt-1 mr-3"></i>
                  <span>922 51 21 51</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-envelope text-primary mt-1 mr-3"></i>
                  <span>info@farmaciafatimadiaz.com</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-clock text-primary mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium">Horario:</p>
                    <p>Lunes a Viernes: 9:00 - 20:00</p>
                    <p>Sábados: 10:00 - 14:00</p>
                  </div>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="font-serif text-xl font-bold mb-4 text-primary">Centro Médico Clodina</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <i className="fas fa-map-marker-alt text-primary mt-1 mr-3"></i>
                  <span>CALLE NICARAGUA 2<br />38500, Guimar (Tenerife)</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-phone-alt text-primary mt-1 mr-3"></i>
                  <span>922 51 21 51</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-envelope text-primary mt-1 mr-3"></i>
                  <span>info@farmaciafatimadiaz.com</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-clock text-primary mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium">Horario:</p>
                    <p>Lunes a Viernes: 9:00 - 20:00</p>
                    <p>Sábados: 10:00 - 14:00</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-md p-6" id="consulta">
              <h3 className="font-serif text-xl font-bold mb-4 text-neutral-800">Envíenos un mensaje</h3>
              
              {formSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-check text-primary text-2xl"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-2">¡Mensaje enviado!</h4>
                  <p className="text-neutral-700 mb-4">
                    Gracias por contactar con nosotros. Nos pondremos en contacto con usted lo antes posible.
                  </p>
                  <Button 
                    onClick={() => setFormSubmitted(false)}
                    className="bg-primary text-white hover:bg-primary-dark"
                  >
                    Enviar otro mensaje
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre completo *</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asunto *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione una opción" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="farmacia">Consulta Farmacia</SelectItem>
                              <SelectItem value="centro-medico">Consulta Centro Médico</SelectItem>
                              <SelectItem value="cita">Solicitar Cita</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensaje *</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="privacy"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Acepto la <a href="#" className="text-primary hover:underline">política de privacidad</a> y el tratamiento de mis datos personales.
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {/* Mostrar captcha solo si está habilitado en la configuración */}
                    {securityConfig?.enableCaptcha && (
                      <div className="space-y-2">
                        <FormLabel>Verificación de seguridad</FormLabel>
                        <Captcha
                          onVerify={handleCaptchaVerify}
                          onExpire={handleCaptchaExpire}
                        />
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-white hover:bg-primary-dark"
                      disabled={contactMutation.isPending}
                    >
                      {contactMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Enviando...
                        </>
                      ) : (
                        "Enviar mensaje"
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-12 rounded-lg overflow-hidden shadow-md h-96"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full h-full bg-neutral-300 flex items-center justify-center">
            <div className="text-center p-4">
              <i className="fas fa-map-marked-alt text-4xl text-primary mb-3"></i>
              <h3 className="text-xl font-medium mb-2">Mapa de ubicación</h3>
              <p className="text-neutral-700">
                Calle Ejemplo, 123, 28001 Madrid, España
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
