import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RichTextEditor } from "./rich-text-editor";

// Esquema para el formulario de configuración de correo
const emailSettingsSchema = z.object({
  emailProvider: z.string(),
  emailHost: z.string().optional(),
  emailPort: z.string().optional(),
  emailUser: z.string().optional(),
  emailPassword: z.string().optional(),
  emailFrom: z.string().email("Debe ser una dirección de correo válida"),
  emailReplyTo: z.string().email("Debe ser una dirección de correo válida").optional(),
  useSendgrid: z.boolean().default(false),
  sendgridApiKey: z.string().optional(),
});

// Esquema para el formulario de textos legales
const legalTextsSchema = z.object({
  privacyPolicy: z.string().min(10, "La política de privacidad debe tener al menos 10 caracteres"),
  cookiesPolicy: z.string().min(10, "La política de cookies debe tener al menos 10 caracteres"),
  termsAndConditions: z.string().min(10, "Los términos y condiciones deben tener al menos 10 caracteres"),
});

// Esquema para configuración general
const generalSettingsSchema = z.object({
  useCaptcha: z.boolean().default(true),
  captchaType: z.string(),
  captchaSiteKey: z.string().optional(),
  captchaSecretKey: z.string().optional(),
  enableAppointments: z.boolean().default(true),
  enableContactForm: z.boolean().default(true),
  enableTestimonials: z.boolean().default(true),
  enableSocialSharing: z.boolean().default(true),
});

type EmailSettingsValues = z.infer<typeof emailSettingsSchema>;
type LegalTextsValues = z.infer<typeof legalTextsSchema>;
type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

export function SystemSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // Formulario para configuraciones generales
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      useCaptcha: true,
      captchaType: "google",
      enableAppointments: true,
      enableContactForm: true,
      enableTestimonials: true,
      enableSocialSharing: true,
    },
  });

  // Formulario para configuración de correo
  const emailForm = useForm<EmailSettingsValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      emailProvider: "smtp",
      emailHost: "",
      emailPort: "587",
      emailUser: "",
      emailPassword: "",
      emailFrom: "info@farmaciafatimadiaz.com",
      emailReplyTo: "",
      useSendgrid: false,
      sendgridApiKey: "",
    },
  });

  // Formulario para textos legales
  const legalForm = useForm<LegalTextsValues>({
    resolver: zodResolver(legalTextsSchema),
    defaultValues: {
      privacyPolicy: `<h2>Política de Privacidad de Farmacia Fátima Díaz Guillén</h2>
<p>En Farmacia Fátima Díaz Guillén, con domicilio en Avenida Principal 123, valoramos y respetamos su privacidad. Esta política de privacidad describe cómo recopilamos, utilizamos y protegemos la información personal que usted nos proporciona.</p>
<h3>Información que recopilamos</h3>
<p>Recopilamos información personal como nombre, dirección, correo electrónico, número de teléfono y, en algunos casos, información médica relevante para brindarle nuestros servicios farmacéuticos y médicos.</p>
<h3>Uso de la información</h3>
<p>Utilizamos su información personal para:</p>
<ul>
<li>Procesar y gestionar sus pedidos de medicamentos</li>
<li>Programar y administrar sus citas médicas</li>
<li>Brindarle información sobre productos y servicios que puedan ser de su interés</li>
<li>Mejorar continuamente nuestros servicios</li>
</ul>
<h3>Protección de datos</h3>
<p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, alteración o divulgación.</p>
<h3>Contacto</h3>
<p>Si tiene preguntas sobre esta política de privacidad, puede contactarnos en: <a href="mailto:info@farmaciafatimadiaz.com">info@farmaciafatimadiaz.com</a></p>`,
      cookiesPolicy: `<h2>Política de Cookies de Farmacia Fátima Díaz Guillén</h2>
<p>Esta política de cookies explica qué son las cookies, cómo las utilizamos en nuestro sitio web y qué opciones tiene respecto a ellas.</p>
<h3>¿Qué son las cookies?</h3>
<p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web. Estas cookies nos permiten reconocer su dispositivo y recordar información sobre su visita.</p>
<h3>Tipos de cookies que utilizamos</h3>
<ul>
<li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio web.</li>
<li><strong>Cookies de funcionalidad:</strong> Mejoran su experiencia de navegación recordando sus preferencias.</li>
<li><strong>Cookies analíticas:</strong> Nos ayudan a entender cómo utiliza nuestro sitio web para mejorar su funcionamiento.</li>
<li><strong>Cookies de marketing:</strong> Utilizadas para mostrarle anuncios relevantes basados en sus intereses.</li>
</ul>
<h3>Control de cookies</h3>
<p>Puede controlar y gestionar las cookies en la configuración de su navegador. Sin embargo, deshabilitar ciertas cookies puede afectar la funcionalidad de nuestro sitio web.</p>
<h3>Contacto</h3>
<p>Si tiene preguntas sobre nuestra política de cookies, puede contactarnos en: <a href="mailto:info@farmaciafatimadiaz.com">info@farmaciafatimadiaz.com</a></p>`,
      termsAndConditions: `<h2>Términos y Condiciones de Farmacia Fátima Díaz Guillén</h2>
<p>Al utilizar nuestro sitio web y servicios, usted acepta estos términos y condiciones. Por favor, léalos cuidadosamente.</p>
<h3>Servicios ofrecidos</h3>
<p>Farmacia Fátima Díaz Guillén ofrece servicios farmacéuticos y de atención médica básica, incluyendo venta de medicamentos, programación de citas médicas, y asesoramiento farmacéutico.</p>
<h3>Responsabilidad médica y farmacéutica</h3>
<p>La información proporcionada en nuestro sitio web tiene fines informativos y no sustituye el consejo médico profesional. Siempre consulte a un profesional de la salud para diagnósticos y tratamientos médicos.</p>
<h3>Uso del sitio web</h3>
<p>Al utilizar nuestro sitio web, usted se compromete a:</p>
<ul>
<li>No utilizar el sitio para fines ilegales o no autorizados</li>
<li>No intentar dañar, deshabilitar o sobrecargar nuestros servidores</li>
<li>Proporcionar información veraz y precisa en los formularios que complete</li>
</ul>
<h3>Propiedad intelectual</h3>
<p>Todo el contenido del sitio web, incluyendo textos, gráficos, logotipos, imágenes y software, está protegido por derechos de autor y otras leyes de propiedad intelectual.</p>
<h3>Modificaciones</h3>
<p>Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.</p>
<h3>Contacto</h3>
<p>Si tiene preguntas sobre estos términos y condiciones, puede contactarnos en: <a href="mailto:info@farmaciafatimadiaz.com">info@farmaciafatimadiaz.com</a></p>`,
    },
  });

  // Cargar configuraciones actuales
  const { isLoading } = useQuery({
    queryKey: ['/api/settings'],
    onSuccess: (data) => {
      // Cargar datos en los formularios
      if (data.general) {
        generalForm.reset(data.general);
      }
      if (data.email) {
        emailForm.reset(data.email);
      }
      if (data.legal) {
        legalForm.reset(data.legal);
      }
    },
    onError: (error) => {
      console.error("Error al cargar configuraciones:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones. Valores por defecto cargados.",
        variant: "destructive",
      });
    },
  });

  // Mutación para guardar configuraciones generales
  const saveGeneralSettingsMutation = useMutation({
    mutationFn: async (data: GeneralSettingsValues) => {
      const response = await apiRequest("PUT", "/api/settings/general", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Configuraciones guardadas",
        description: "Las configuraciones generales se han guardado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error al guardar configuraciones generales:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones generales.",
        variant: "destructive",
      });
    },
  });

  // Mutación para guardar configuraciones de correo
  const saveEmailSettingsMutation = useMutation({
    mutationFn: async (data: EmailSettingsValues) => {
      const response = await apiRequest("PUT", "/api/settings/email", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Configuraciones guardadas",
        description: "Las configuraciones de correo se han guardado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error al guardar configuraciones de correo:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones de correo.",
        variant: "destructive",
      });
    },
  });

  // Mutación para guardar textos legales
  const saveLegalTextsMutation = useMutation({
    mutationFn: async (data: LegalTextsValues) => {
      const response = await apiRequest("PUT", "/api/settings/legal", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Textos legales guardados",
        description: "Los textos legales se han guardado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error al guardar textos legales:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los textos legales.",
        variant: "destructive",
      });
    },
  });

  // Función para enviar correo de prueba
  const sendTestEmail = async () => {
    if (!testEmailAddress) {
      toast({
        title: "Error",
        description: "Por favor, introduce una dirección de correo electrónico válida.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTestEmail(true);
    try {
      const emailSettings = emailForm.getValues();
      const response = await apiRequest("POST", "/api/settings/test-email", {
        ...emailSettings,
        testEmail: testEmailAddress
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Correo enviado",
          description: "El correo de prueba se ha enviado correctamente.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudo enviar el correo de prueba.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al enviar correo de prueba:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el correo de prueba. Verifica la configuración.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Manejo de envío de formularios
  function onSubmitGeneralSettings(data: GeneralSettingsValues) {
    saveGeneralSettingsMutation.mutate(data);
  }

  function onSubmitEmailSettings(data: EmailSettingsValues) {
    saveEmailSettingsMutation.mutate(data);
  }

  function onSubmitLegalTexts(data: LegalTextsValues) {
    saveLegalTextsMutation.mutate(data);
  }

  // Mostrar/ocultar campos según selección de proveedor de email
  const watchEmailProvider = emailForm.watch("emailProvider");
  const watchUseSendgrid = emailForm.watch("useSendgrid");
  const watchUseCaptcha = generalForm.watch("useCaptcha");
  const watchCaptchaType = generalForm.watch("captchaType");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-800">Configuración del Sistema</h2>
        <p className="text-neutral-500">Gestiona todas las configuraciones de la plataforma</p>
      </div>

      <Tabs
        defaultValue="general"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Correo Electrónico</TabsTrigger>
          <TabsTrigger value="legal">Textos Legales</TabsTrigger>
        </TabsList>
        
        {/* Configuración General */}
        <TabsContent value="general" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-neutral-700">Cargando configuraciones...</p>
            </div>
          ) : (
            <Form {...generalForm}>
              <form onSubmit={generalForm.handleSubmit(onSubmitGeneralSettings)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Funcionalidades</CardTitle>
                    <CardDescription>
                      Activa o desactiva las principales funcionalidades del sitio
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={generalForm.control}
                      name="enableContactForm"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Formulario de Contacto
                            </FormLabel>
                            <FormDescription>
                              Permite que los usuarios envíen mensajes a través del formulario de contacto
                            </FormDescription>
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
                      control={generalForm.control}
                      name="enableAppointments"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Sistema de Citas
                            </FormLabel>
                            <FormDescription>
                              Permite que los usuarios soliciten citas médicas a través del sitio web
                            </FormDescription>
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
                      control={generalForm.control}
                      name="enableTestimonials"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Testimonios
                            </FormLabel>
                            <FormDescription>
                              Permite que los usuarios envíen testimonios y opiniones
                            </FormDescription>
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
                      control={generalForm.control}
                      name="enableSocialSharing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Compartir en Redes Sociales
                            </FormLabel>
                            <FormDescription>
                              Muestra botones para compartir contenido en redes sociales
                            </FormDescription>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Protección contra Spam</CardTitle>
                    <CardDescription>
                      Configura CAPTCHA para proteger tus formularios contra spam
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={generalForm.control}
                      name="useCaptcha"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Usar CAPTCHA
                            </FormLabel>
                            <FormDescription>
                              Protege los formularios contra bots y spam automatizado
                            </FormDescription>
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
                    
                    {watchUseCaptcha && (
                      <>
                        <FormField
                          control={generalForm.control}
                          name="captchaType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de CAPTCHA</FormLabel>
                              <div className="flex gap-4">
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <input
                                      type="radio"
                                      className="form-radio h-4 w-4 text-primary"
                                      checked={field.value === "google"}
                                      onChange={() => field.onChange("google")}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer">Google reCAPTCHA</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <input
                                      type="radio"
                                      className="form-radio h-4 w-4 text-primary"
                                      checked={field.value === "hcaptcha"}
                                      onChange={() => field.onChange("hcaptcha")}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer">hCaptcha</FormLabel>
                                </FormItem>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="captchaSiteKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Clave del sitio ({watchCaptchaType})</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Introduce la clave del sitio"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                La clave pública que se usará en el frontend
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="captchaSecretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Clave secreta ({watchCaptchaType})</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Introduce la clave secreta"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                La clave secreta que se usará en el backend para verificar
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white"
                    disabled={saveGeneralSettingsMutation.isPending}
                  >
                    {saveGeneralSettingsMutation.isPending ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        Guardando...
                      </>
                    ) : (
                      "Guardar Configuración"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </TabsContent>
        
        {/* Configuración de Correo Electrónico */}
        <TabsContent value="email" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-neutral-700">Cargando configuraciones...</p>
            </div>
          ) : (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onSubmitEmailSettings)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Correo Electrónico</CardTitle>
                    <CardDescription>
                      Configura el servicio de correo para el envío de notificaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="emailProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proveedor de Correo</FormLabel>
                          <div className="flex gap-4">
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  className="form-radio h-4 w-4 text-primary"
                                  checked={field.value === "smtp"}
                                  onChange={() => field.onChange("smtp")}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer">SMTP</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  className="form-radio h-4 w-4 text-primary"
                                  checked={field.value === "mailgun"}
                                  onChange={() => field.onChange("mailgun")}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer">Mailgun</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  className="form-radio h-4 w-4 text-primary"
                                  checked={field.value === "api"}
                                  onChange={() => field.onChange("api")}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer">API (SendGrid)</FormLabel>
                            </FormItem>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {watchEmailProvider === "smtp" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={emailForm.control}
                            name="emailHost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Servidor SMTP</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="smtp.example.com"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={emailForm.control}
                            name="emailPort"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Puerto SMTP</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="587"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={emailForm.control}
                            name="emailUser"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Usuario SMTP</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="usuario@example.com"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={emailForm.control}
                            name="emailPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contraseña SMTP</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}
                    
                    {watchEmailProvider === "api" && (
                      <FormField
                        control={emailForm.control}
                        name="useSendgrid"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Usar SendGrid
                              </FormLabel>
                              <FormDescription>
                                Configura SendGrid para el envío de correos a través de su API
                              </FormDescription>
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
                    )}
                    
                    {watchEmailProvider === "api" && watchUseSendgrid && (
                      <FormField
                        control={emailForm.control}
                        name="sendgridApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key de SendGrid</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="SG.xxxxxx..."
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              La clave API proporcionada por SendGrid
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={emailForm.control}
                        name="emailFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo Remitente</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="info@farmaciadiaz.com"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Dirección de correo que aparecerá como remitente
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="emailReplyTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo de Respuesta (Opcional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="respuestas@farmaciadiaz.com"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Dirección a la que llegarán las respuestas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-4">Probar Configuración</h3>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Correo para prueba"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={sendTestEmail}
                          disabled={isSendingTestEmail}
                          className="whitespace-nowrap"
                        >
                          {isSendingTestEmail ? (
                            <>
                              <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary rounded-full"></div>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane mr-2"></i>
                              Enviar prueba
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-neutral-500 mt-2">
                        Envía un correo de prueba para verificar la configuración
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white"
                    disabled={saveEmailSettingsMutation.isPending}
                  >
                    {saveEmailSettingsMutation.isPending ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        Guardando...
                      </>
                    ) : (
                      "Guardar Configuración"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </TabsContent>
        
        {/* Textos Legales */}
        <TabsContent value="legal" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-neutral-700">Cargando configuraciones...</p>
            </div>
          ) : (
            <Form {...legalForm}>
              <form onSubmit={legalForm.handleSubmit(onSubmitLegalTexts)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Textos Legales</CardTitle>
                    <CardDescription>
                      Configura los textos legales que se mostrarán en el sitio web
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="privacy">
                        <AccordionTrigger className="text-lg font-medium">
                          Política de Privacidad
                        </AccordionTrigger>
                        <AccordionContent>
                          <FormField
                            control={legalForm.control}
                            name="privacyPolicy"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <RichTextEditor
                                    content={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Detalla cómo se recopilan, utilizan y protegen los datos personales
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="cookies">
                        <AccordionTrigger className="text-lg font-medium">
                          Política de Cookies
                        </AccordionTrigger>
                        <AccordionContent>
                          <FormField
                            control={legalForm.control}
                            name="cookiesPolicy"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <RichTextEditor
                                    content={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Informa sobre las cookies utilizadas en el sitio web
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="terms">
                        <AccordionTrigger className="text-lg font-medium">
                          Términos y Condiciones
                        </AccordionTrigger>
                        <AccordionContent>
                          <FormField
                            control={legalForm.control}
                            name="termsAndConditions"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <RichTextEditor
                                    content={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Establece las condiciones de uso del sitio web y sus servicios
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white"
                    disabled={saveLegalTextsMutation.isPending}
                  >
                    {saveLegalTextsMutation.isPending ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        Guardando...
                      </>
                    ) : (
                      "Guardar Textos Legales"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}