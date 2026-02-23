import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BellIcon, LockIcon, UserIcon, MailIcon, SettingsIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PrivateLayout from '@/components/layout/private-layout';

export default function ConfigurationPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Configuración de notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    productUpdates: true,
    promotions: true,
    newsAndBlog: true
  });
  
  // Configuración de privacidad
  const [privacySettings, setPrivacySettings] = useState({
    showProfilePublicly: true,
    allowDataAnalytics: true,
    showPurchaseHistory: false,
  });
  
  // Configuración de accesibilidad
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    largeText: false,
    screenReader: false,
    reduceAnimations: false,
  });
  
  const handleNotificationChange = (key: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key]
    });
  };
  
  const handlePrivacyChange = (key: keyof typeof privacySettings) => {
    setPrivacySettings({
      ...privacySettings,
      [key]: !privacySettings[key]
    });
  };
  
  const handleAccessibilityChange = (key: keyof typeof accessibilitySettings) => {
    setAccessibilitySettings({
      ...accessibilitySettings,
      [key]: !accessibilitySettings[key]
    });
  };
  
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuración guardada",
        description: "Tus preferencias han sido actualizadas correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PrivateLayout>
      <Helmet>
        <title>Configuración de Cuenta | Farmacia Fátima Díaz Guillén</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Configuración de Cuenta</h1>
            <p className="text-muted-foreground">
              Administra tus preferencias y configuración personal
            </p>
          </div>
          <Button onClick={saveSettings} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
        
        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <BellIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-1">
              <LockIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Privacidad</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Cuenta</span>
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-1">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Accesibilidad</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Pestaña de Notificaciones */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de Notificaciones</CardTitle>
                <CardDescription>
                  Configura cómo y cuándo deseas recibir notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Canales de comunicación</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe notificaciones y actualizaciones en tu correo electrónico
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={() => handleNotificationChange('emailNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notifications">Notificaciones por SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe notificaciones vía mensaje de texto en tu teléfono
                      </p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={() => handleNotificationChange('smsNotifications')}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Tipos de notificaciones</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="appointment-reminders">Recordatorios de citas</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificaciones sobre tus próximas citas médicas
                      </p>
                    </div>
                    <Switch
                      id="appointment-reminders"
                      checked={notificationSettings.appointmentReminders}
                      onCheckedChange={() => handleNotificationChange('appointmentReminders')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="product-updates">Actualizaciones de productos</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificaciones sobre nuevos productos disponibles
                      </p>
                    </div>
                    <Switch
                      id="product-updates"
                      checked={notificationSettings.productUpdates}
                      onCheckedChange={() => handleNotificationChange('productUpdates')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="promotions">Promociones y descuentos</Label>
                      <p className="text-sm text-muted-foreground">
                        Información sobre ofertas especiales y descuentos
                      </p>
                    </div>
                    <Switch
                      id="promotions"
                      checked={notificationSettings.promotions}
                      onCheckedChange={() => handleNotificationChange('promotions')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="news-blog">Noticias y blog</Label>
                      <p className="text-sm text-muted-foreground">
                        Actualizaciones sobre nuevos artículos y contenido del blog
                      </p>
                    </div>
                    <Switch
                      id="news-blog"
                      checked={notificationSettings.newsAndBlog}
                      onCheckedChange={() => handleNotificationChange('newsAndBlog')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pestaña de Privacidad */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Privacidad</CardTitle>
                <CardDescription>
                  Administra cómo se utiliza y muestra tu información
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-profile">Perfil público</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite que otros usuarios vean tu perfil público
                      </p>
                    </div>
                    <Switch
                      id="show-profile"
                      checked={privacySettings.showProfilePublicly}
                      onCheckedChange={() => handlePrivacyChange('showProfilePublicly')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-analytics">Análisis de datos</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite que utilicemos tus datos para mejorar nuestros servicios
                      </p>
                    </div>
                    <Switch
                      id="data-analytics"
                      checked={privacySettings.allowDataAnalytics}
                      onCheckedChange={() => handlePrivacyChange('allowDataAnalytics')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="purchase-history">Historial de compras</Label>
                      <p className="text-sm text-muted-foreground">
                        Mostrar tu historial de compras en tu perfil público
                      </p>
                    </div>
                    <Switch
                      id="purchase-history"
                      checked={privacySettings.showPurchaseHistory}
                      onCheckedChange={() => handlePrivacyChange('showPurchaseHistory')}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Eliminar cuenta</h3>
                  <p className="text-sm text-muted-foreground">
                    Al eliminar tu cuenta, se borrarán permanentemente todos tus datos personales, historial de compras y puntos de fidelidad. Esta acción no se puede deshacer.
                  </p>
                  <Button variant="destructive">Eliminar mi cuenta</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pestaña de Cuenta */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Información de Cuenta</CardTitle>
                <CardDescription>
                  Actualiza tu información personal y de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" defaultValue="María González" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="maria@ejemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" defaultValue="+52 123 456 7890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input id="address" defaultValue="Av. Principal 123, Col. Centro" />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Cambiar contraseña</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Contraseña actual</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nueva contraseña</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  <Button variant="outline">Cambiar contraseña</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pestaña de Accesibilidad */}
          <TabsContent value="accessibility">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Accesibilidad</CardTitle>
                <CardDescription>
                  Personaliza tu experiencia para mejorar la accesibilidad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="high-contrast">Alto contraste</Label>
                      <p className="text-sm text-muted-foreground">
                        Mejora el contraste de colores para facilitar la lectura
                      </p>
                    </div>
                    <Switch
                      id="high-contrast"
                      checked={accessibilitySettings.highContrast}
                      onCheckedChange={() => handleAccessibilityChange('highContrast')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="large-text">Texto grande</Label>
                      <p className="text-sm text-muted-foreground">
                        Aumenta el tamaño del texto en toda la plataforma
                      </p>
                    </div>
                    <Switch
                      id="large-text"
                      checked={accessibilitySettings.largeText}
                      onCheckedChange={() => handleAccessibilityChange('largeText')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="screen-reader">Compatibilidad con lector de pantalla</Label>
                      <p className="text-sm text-muted-foreground">
                        Optimiza la interfaz para lectores de pantalla
                      </p>
                    </div>
                    <Switch
                      id="screen-reader"
                      checked={accessibilitySettings.screenReader}
                      onCheckedChange={() => handleAccessibilityChange('screenReader')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reduce-animations">Reducir animaciones</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimiza los efectos animados de la interfaz
                      </p>
                    </div>
                    <Switch
                      id="reduce-animations"
                      checked={accessibilitySettings.reduceAnimations}
                      onCheckedChange={() => handleAccessibilityChange('reduceAnimations')}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Navegación por voz</h3>
                  <p className="text-sm text-muted-foreground">
                    Activa la navegación por voz para controlar la plataforma utilizando comandos de voz
                  </p>
                  <Button variant="outline">Configurar navegación por voz</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PrivateLayout>
  );
}