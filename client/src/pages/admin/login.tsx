import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Esquema de validación para el formulario de inicio de sesión
const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Inicializar el formulario con react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Manejar el envío del formulario
  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", data);
      
      if (response.ok) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido al panel de administración.",
        });
        
        // Redirigir al panel de administración
        setLocation("/admin/dashboard");
      } else {
        const errorData = await response.json();
        toast({
          title: "Error de inicio de sesión",
          description: errorData.message || "Credenciales incorrectas. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <motion.div 
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <img 
              src="/assets/logo_farmacia_horizontal.png" 
              alt="Farmacia Fátima Díaz Guillén" 
              className="h-10 object-contain"
            />
            <div className="h-8 w-px bg-gray-300"></div>
            <img 
              src="/assets/logo_clodina_horizontal.png" 
              alt="Centro Médico Clodina" 
              className="h-10 object-contain"
            />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-neutral-800 mb-8">
          Acceso al Área de Administración
        </h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingresa tu nombre de usuario" {...field} />
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
                    <Input type="password" placeholder="Ingresa tu contraseña" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark text-white"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center text-sm text-neutral-500">
          <p>¿Olvidaste tu contraseña? Contacta al administrador del sistema.</p>
        </div>
      </motion.div>
    </div>
  );
}