import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

// Definir el esquema del formulario de contacto
const contactFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Por favor introduce un email válido'),
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
  phone: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  // Inicializar el formulario
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      phone: '',
    },
  });
  
  // Mutación para enviar el formulario
  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      return await apiRequest('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: 'Mensaje enviado',
        description: 'Hemos recibido tu mensaje. Te contactaremos pronto.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `No se pudo enviar el mensaje: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Manejar el envío del formulario
  function onSubmit(data: ContactFormValues) {
    contactMutation.mutate(data);
  }
  
  return (
    <>
      <Helmet>
        <title>Contacto | Farmacia Fátima Díaz Guillén</title>
        <meta name="description" content="Ponte en contacto con nosotros para consultas, citas o información sobre nuestros productos y servicios" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Contacto</h1>
          <p className="text-neutral-600 max-w-xl mx-auto">
            Estamos aquí para ayudarte. Ponte en contacto con nosotros por cualquiera de estos medios o utiliza el formulario.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información de contacto */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Información de contacto</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Dirección</h3>
                      <p className="text-neutral-600 mt-1">
                        CALLE NICARAGUA 2<br />
                        38500, Guimar (Tenerife), España
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Teléfono</h3>
                      <p className="text-neutral-600 mt-1">
                        922 51 21 51
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-neutral-600 mt-1">
                        info@farmaciafatimadiaz.com
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Horario</h3>
                      <p className="text-neutral-600 mt-1">
                        Lunes a Viernes: 9:00 - 20:00<br />
                        Sábados: 10:00 - 14:00
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="font-medium mb-4">Síguenos en redes sociales</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="text-neutral-600 hover:text-primary transition-colors">
                      <i className="fab fa-facebook-f text-xl"></i>
                    </a>
                    <a href="#" className="text-neutral-600 hover:text-primary transition-colors">
                      <i className="fab fa-twitter text-xl"></i>
                    </a>
                    <a href="#" className="text-neutral-600 hover:text-primary transition-colors">
                      <i className="fab fa-instagram text-xl"></i>
                    </a>
                    <a href="#" className="text-neutral-600 hover:text-primary transition-colors">
                      <i className="fab fa-linkedin-in text-xl"></i>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Formulario de contacto */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {isSubmitted ? (
                  <div className="text-center py-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">¡Mensaje enviado con éxito!</h2>
                    <p className="text-neutral-600 mb-6">
                      Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos lo antes posible.
                    </p>
                    <Button 
                      onClick={() => setIsSubmitted(false)}
                      className="bg-primary hover:bg-primary-dark text-white"
                    >
                      Enviar otro mensaje
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-6">Envíanos un mensaje</h2>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre completo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Tu nombre" {...field} />
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
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="tu@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Teléfono (opcional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="+34 600 00 00 00" {...field} />
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
                                <FormLabel>Asunto</FormLabel>
                                <FormControl>
                                  <Input placeholder="Asunto de tu mensaje" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mensaje</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Escribe tu mensaje aquí" 
                                  className="min-h-[150px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-2">
                          <Button 
                            type="submit"
                            className="bg-primary hover:bg-primary-dark text-white px-6"
                            disabled={contactMutation.isPending}
                          >
                            {contactMutation.isPending ? (
                              <span className="flex items-center">
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Enviando...
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <Send className="mr-2 h-4 w-4" />
                                Enviar mensaje
                              </span>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Mapa */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-[16/9] md:aspect-[21/9] w-full bg-neutral-200 flex items-center justify-center">
                <p className="text-neutral-500 text-center p-4">
                  Aquí se mostraría un mapa interactivo con la ubicación de la farmacia y el centro médico.<br />
                  <span className="text-sm">(Mapa no disponible en esta versión de demostración)</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}