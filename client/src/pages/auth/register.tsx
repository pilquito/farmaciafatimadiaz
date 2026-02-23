import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Captcha } from "@/components/captcha/captcha";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const registerSchema = z.object({
  email: z.string().email({ message: "Introduce un email válido" }),
  username: z.string().min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  confirmPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [captchaToken, setCaptchaToken] = useState<string>("");
  
  // Obtener configuración de seguridad para verificar si el captcha está habilitado
  const { data: securityConfig } = useQuery({
    queryKey: ['/api/settings/security'],
  });

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    // Verificar si el captcha está habilitado y si se requiere token
    if (securityConfig?.enableCaptcha && !captchaToken) {
      toast({
        title: "Verificación requerida",
        description: "Por favor, complete la verificación captcha.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Omit confirmPassword as it's not needed for the API
      const { confirmPassword, ...registerData } = data;
      
      // Incluir el token del captcha si está disponible
      const requestData: any = { ...registerData };
      if (captchaToken) {
        requestData.captcha = captchaToken;
      }
      
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(requestData),
      });
      
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente. Está pendiente de aprobación por un administrador.",
      });
      
      // Reset captcha
      setCaptchaToken("");
      
      // Redirect to login page
      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Error en el registro",
        description: error.message || "Ha ocurrido un error durante el registro. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      
      // Reset captcha on error
      setCaptchaToken("");
    } finally {
      setLoading(false);
    }
  }
  
  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };
  
  const handleCaptchaExpire = () => {
    setCaptchaToken("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Crear cuenta</CardTitle>
            <CardDescription>
              Completa el formulario para registrarte y comenzar a disfrutar de todos los beneficios de ser cliente habitual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingresa tu nombre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellidos</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingresa tus apellidos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@email.com" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa un nombre de usuario" {...field} required />
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
                        <Input type="tel" placeholder="Ingresa tu número de teléfono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Mostrar captcha solo si está habilitado en la configuración */}
                {securityConfig?.enableCaptcha && (
                  <div className="space-y-2">
                    <FormLabel>Verificación de seguridad</FormLabel>
                    <div className="flex justify-center">
                      <Captcha
                        onVerify={handleCaptchaVerify}
                        onExpire={handleCaptchaExpire}
                      />
                    </div>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || (securityConfig?.enableCaptcha && !captchaToken)}
                >
                  {loading ? "Registrando..." : "Registrarse"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}