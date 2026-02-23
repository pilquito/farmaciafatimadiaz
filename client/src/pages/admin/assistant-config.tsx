import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const assistantConfigSchema = z.object({
  enabled: z.boolean(),
  useAI: z.boolean(),
  perplexityApiKey: z.string().optional(),
  welcomeMessage: z.string().min(1, "El mensaje de bienvenida es requerido"),
  fallbackMessage: z.string().min(1, "El mensaje de respaldo es requerido"),
  suggestions: z.string(),
});

type AssistantConfigValues = z.infer<typeof assistantConfigSchema>;

export default function AssistantConfig() {
  const queryClient = useQueryClient();
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [isTestingAI, setIsTestingAI] = useState(false);

  // Obtener configuración actual
  const { data: config, isLoading } = useQuery({
    queryKey: ["/api/admin/assistant-config"],
  });

  const form = useForm<AssistantConfigValues>({
    resolver: zodResolver(assistantConfigSchema),
    defaultValues: {
      enabled: config?.enabled || true,
      useAI: config?.useAI || false,
      perplexityApiKey: config?.perplexityApiKey || "",
      welcomeMessage: config?.welcomeMessage || "¡Hola! Bienvenido/a al asistente virtual de Farmacia Fátima Díaz Guillén y Centro Médico Clodina.",
      fallbackMessage: config?.fallbackMessage || "Lo siento, no estoy seguro de cómo responder a eso. ¿Podrías ser más específico?",
      suggestions: config?.suggestions || "Pedir cita médica,Ver servicios,Contactar,Horarios de atención",
    },
  });

  // Mutación para guardar configuración
  const saveConfigMutation = useMutation({
    mutationFn: async (data: AssistantConfigValues) => {
      return apiRequest("/api/admin/assistant-config", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assistant-config"] });
      toast({
        title: "Configuración guardada",
        description: "La configuración del asistente virtual ha sido actualizada.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Mutación para probar la conexión con IA
  const testAIMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest("/api/admin/test-ai", {
        method: "POST",
        body: JSON.stringify({ message }),
      });
    },
    onSuccess: (data) => {
      setTestResponse(data.response);
      toast({
        title: "Prueba exitosa",
        description: "La conexión con Perplexity está funcionando correctamente.",
      });
    },
    onError: (error) => {
      setTestResponse("Error al conectar con Perplexity AI");
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con Perplexity. Verifica la clave API.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AssistantConfigValues) => {
    saveConfigMutation.mutate(data);
  };

  const handleTestAI = () => {
    if (!testMessage.trim()) {
      toast({
        title: "Mensaje requerido",
        description: "Escribe un mensaje de prueba.",
        variant: "destructive",
      });
      return;
    }
    
    setIsTestingAI(true);
    testAIMutation.mutate(testMessage);
    setIsTestingAI(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Configuración del Asistente Virtual</h1>
        <p className="text-neutral-600 mt-2">
          Configura el comportamiento y las respuestas del asistente virtual de tu sitio web.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">Inteligencia Artificial</TabsTrigger>
          <TabsTrigger value="test">Pruebas</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración General</CardTitle>
                  <CardDescription>
                    Ajusta la configuración básica del asistente virtual.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Activar Asistente Virtual
                          </FormLabel>
                          <FormDescription>
                            Habilita o deshabilita el asistente virtual en tu sitio web.
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
                    control={form.control}
                    name="welcomeMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje de Bienvenida</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Mensaje que aparece cuando el usuario abre el chat"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Este mensaje se mostrará cuando los usuarios abran el asistente virtual.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fallbackMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje de Respaldo</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Mensaje cuando el asistente no entiende la consulta"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Se muestra cuando el asistente no puede procesar una consulta.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="suggestions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sugerencias Rápidas</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Separadas por comas: Pedir cita,Ver servicios,Contactar"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Botones de sugerencias que aparecen en el chat. Separa con comas.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Inteligencia Artificial</CardTitle>
                  <CardDescription>
                    Conecta con Perplexity AI para respuestas más inteligentes y actualizadas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="useAI"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Usar Inteligencia Artificial
                          </FormLabel>
                          <FormDescription>
                            Habilita respuestas inteligentes con Perplexity AI.
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

                  {form.watch("useAI") && (
                    <FormField
                      control={form.control}
                      name="perplexityApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clave API de Perplexity</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="pplx-xxxxxxxxxxxxxxxxxxxxxxxx"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Obtén tu clave API en {" "}
                            <a
                              href="https://www.perplexity.ai/settings/api"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              perplexity.ai/settings/api
                            </a>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Beneficios de la IA
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Respuestas más naturales y contextuales</li>
                      <li>• Información actualizada en tiempo real</li>
                      <li>• Mejor comprensión de consultas complejas</li>
                      <li>• Respuestas sobre salud y medicina actualizadas</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="test" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Probar Asistente Virtual</CardTitle>
                  <CardDescription>
                    Prueba el funcionamiento del asistente y la conexión con IA.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <FormLabel>Mensaje de Prueba</FormLabel>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Escribe un mensaje para probar..."
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleTestAI();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleTestAI}
                        disabled={isTestingAI || !testMessage.trim()}
                      >
                        {isTestingAI ? "Probando..." : "Probar"}
                      </Button>
                    </div>
                  </div>

                  {testResponse && (
                    <div className="space-y-2">
                      <FormLabel>Respuesta del Asistente</FormLabel>
                      <div className="p-3 bg-neutral-50 rounded-lg border">
                        <p className="text-sm">{testResponse}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h4 className="font-semibold mb-2">Estado del Sistema</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={form.watch("enabled") ? "default" : "secondary"}>
                            {form.watch("enabled") ? "Activado" : "Desactivado"}
                          </Badge>
                          <span className="text-sm">Asistente Virtual</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={form.watch("useAI") && form.watch("perplexityApiKey") ? "default" : "secondary"}>
                            {form.watch("useAI") && form.watch("perplexityApiKey") ? "Conectado" : "Desconectado"}
                          </Badge>
                          <span className="text-sm">Inteligencia Artificial</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Restablecer
              </Button>
              <Button
                type="submit"
                disabled={saveConfigMutation.isPending}
              >
                {saveConfigMutation.isPending ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}