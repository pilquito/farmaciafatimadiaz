import { useState } from 'react';
import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useConfig } from '@/contexts/config-context';

export default function ConfiguracionAdmin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Usar configuraciones del contexto global
  const { 
    emailSettings, 
    updateEmailSettings,
    seoSettings, 
    updateSeoSettings,
    cookiesSettings, 
    updateCookiesSettings,
    securitySettings, 
    updateSecuritySettings
  } = useConfig();
  
  // Configuración de contacto - usar el contexto global
  const { contactSettings, updateContactSettings } = useConfig();
  
  // Configuración de accesibilidad
  const { accessibilitySettings, updateAccessibilitySettings } = useConfig();
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateEmailSettings({
      [name]: value
    });
  };
  
  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSeoSettings({
      [name]: value
    });
  };
  
  const handleCookiesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateCookiesSettings({
      [name]: value
    });
  };
  
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSecuritySettings({
      [name]: value
    });
  };
  
  const handleSecurityToggle = (setting: string) => {
    updateSecuritySettings({
      [setting]: !securitySettings[setting as keyof typeof securitySettings]
    });
  };
  
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateContactSettings({
      [name]: value
    });
  };
  
  const handleAccessibilityToggle = (setting: string) => {
    updateAccessibilitySettings({
      [setting]: !accessibilitySettings[setting as keyof typeof accessibilitySettings]
    });
  };
  
  const handleAccessibilityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateAccessibilitySettings({
      [name]: value
    });
  };
  
  const { saveSettings: saveConfigSettings } = useConfig();
  
  const saveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Guardar configuraciones en el contexto global
      await saveConfigSettings();
      
      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido aplicados correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "Ha ocurrido un error al intentar guardar la configuración.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <PrivateLayout>
      <Helmet>
        <title>Configuración del Sistema | Administración</title>
      </Helmet>
      
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Configuración del Sistema</h1>
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="email">Correo Electrónico</TabsTrigger>
            <TabsTrigger value="contact">Datos de Contacto</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="cookies">Políticas</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="accessibility">Accesibilidad</TabsTrigger>
          </TabsList>
          
          {/* Configuración de Correo Electrónico */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Correo Electrónico</CardTitle>
                <CardDescription>
                  Configure el servidor SMTP para el envío de correos electrónicos desde la aplicación.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpServer">Servidor SMTP</Label>
                    <Input 
                      id="smtpServer" 
                      name="smtpServer" 
                      value={emailSettings.smtpServer} 
                      onChange={handleEmailChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">Puerto SMTP</Label>
                    <Input 
                      id="smtpPort" 
                      name="smtpPort" 
                      value={emailSettings.smtpPort} 
                      onChange={handleEmailChange} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">Usuario SMTP</Label>
                    <Input 
                      id="smtpUser" 
                      name="smtpUser" 
                      value={emailSettings.smtpUser} 
                      onChange={handleEmailChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">Contraseña SMTP</Label>
                    <Input 
                      id="smtpPassword" 
                      name="smtpPassword" 
                      type="password" 
                      value={emailSettings.smtpPassword} 
                      onChange={handleEmailChange} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromName">Nombre del remitente</Label>
                    <Input 
                      id="fromName" 
                      name="fromName" 
                      value={emailSettings.fromName} 
                      onChange={handleEmailChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">Email del remitente</Label>
                    <Input 
                      id="fromEmail" 
                      name="fromEmail" 
                      type="email" 
                      value={emailSettings.fromEmail} 
                      onChange={handleEmailChange} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="replyToEmail">Email de respuesta</Label>
                  <Input 
                    id="replyToEmail" 
                    name="replyToEmail" 
                    type="email" 
                    value={emailSettings.replyToEmail} 
                    onChange={handleEmailChange} 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar configuración
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Configuración SEO */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>Configuración SEO</CardTitle>
                <CardDescription>
                  Configure los metadatos y opciones para optimización en motores de búsqueda.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nombre del sitio</Label>
                  <Input 
                    id="siteName" 
                    name="siteName" 
                    value={seoSettings.siteName} 
                    onChange={handleSeoChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Descripción del sitio</Label>
                  <Input 
                    id="siteDescription" 
                    name="siteDescription" 
                    value={seoSettings.siteDescription} 
                    onChange={handleSeoChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteKeywords">Palabras clave</Label>
                  <Input 
                    id="siteKeywords" 
                    name="siteKeywords" 
                    value={seoSettings.siteKeywords} 
                    onChange={handleSeoChange} 
                  />
                  <p className="text-sm text-muted-foreground">Separe las palabras clave con comas</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">ID de Google Analytics</Label>
                  <Input 
                    id="googleAnalyticsId" 
                    name="googleAnalyticsId" 
                    value={seoSettings.googleAnalyticsId} 
                    onChange={handleSeoChange} 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar configuración
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Configuración de Cookies y Privacidad */}
          <TabsContent value="cookies">
            <Card>
              <CardHeader>
                <CardTitle>Políticas del Sitio</CardTitle>
                <CardDescription>
                  Configure los textos legales y políticas que se mostrarán en el sitio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cookiesPolicyText">Política de Cookies</Label>
                  <Textarea 
                    id="cookiesPolicyText" 
                    name="cookiesPolicyText" 
                    rows={5}
                    value={cookiesSettings.cookiesPolicyText} 
                    onChange={handleCookiesChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="privacyPolicyText">Política de Privacidad</Label>
                  <Textarea 
                    id="privacyPolicyText" 
                    name="privacyPolicyText" 
                    rows={5}
                    value={cookiesSettings.privacyPolicyText} 
                    onChange={handleCookiesChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="termsConditionsText">Términos y Condiciones</Label>
                  <Textarea 
                    id="termsConditionsText" 
                    name="termsConditionsText" 
                    rows={5}
                    value={cookiesSettings.termsConditionsText} 
                    onChange={handleCookiesChange} 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar configuración
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Configuración de Datos de Contacto */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Datos de Contacto</CardTitle>
                <CardDescription>
                  Configure los datos de contacto que se mostrarán en el sitio web y en el footer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre del Negocio</Label>
                  <Input 
                    id="businessName" 
                    name="businessName" 
                    value={contactSettings.businessName} 
                    onChange={handleContactChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={contactSettings.address} 
                    onChange={handleContactChange} 
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      value={contactSettings.city} 
                      onChange={handleContactChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input 
                      id="state" 
                      name="state" 
                      value={contactSettings.state} 
                      onChange={handleContactChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Código Postal</Label>
                    <Input 
                      id="postalCode" 
                      name="postalCode" 
                      value={contactSettings.postalCode} 
                      onChange={handleContactChange} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone1">Teléfono Principal</Label>
                    <Input 
                      id="phone1" 
                      name="phone1" 
                      value={contactSettings.phone1} 
                      onChange={handleContactChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone2">Teléfono Secundario</Label>
                    <Input 
                      id="phone2" 
                      name="phone2" 
                      value={contactSettings.phone2} 
                      onChange={handleContactChange} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input 
                      id="whatsapp" 
                      name="whatsapp" 
                      value={contactSettings.whatsapp} 
                      onChange={handleContactChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email de Contacto</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email"
                      value={contactSettings.email} 
                      onChange={handleContactChange} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="schedule">Horario de Atención</Label>
                  <Textarea 
                    id="schedule" 
                    name="schedule" 
                    value={contactSettings.schedule} 
                    onChange={handleContactChange} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitud (para mapa)</Label>
                    <Input 
                      id="latitude" 
                      name="latitude" 
                      value={contactSettings.latitude} 
                      onChange={handleContactChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitud (para mapa)</Label>
                    <Input 
                      id="longitude" 
                      name="longitude" 
                      value={contactSettings.longitude} 
                      onChange={handleContactChange} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Redes Sociales</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input 
                        id="facebook" 
                        name="facebook" 
                        value={contactSettings.facebook} 
                        onChange={handleContactChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input 
                        id="instagram" 
                        name="instagram" 
                        value={contactSettings.instagram} 
                        onChange={handleContactChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input 
                        id="twitter" 
                        name="twitter" 
                        value={contactSettings.twitter} 
                        onChange={handleContactChange} 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar configuración
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Configuración de Seguridad */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Seguridad</CardTitle>
                <CardDescription>
                  Configure las opciones de seguridad y protección del sitio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableCaptcha">Activar CAPTCHA en formularios</Label>
                  <Switch 
                    id="enableCaptcha" 
                    checked={securitySettings.enableCaptcha} 
                    onCheckedChange={() => handleSecurityToggle('enableCaptcha')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireStrongPasswords">Requerir contraseñas fuertes</Label>
                  <Switch 
                    id="requireStrongPasswords" 
                    checked={securitySettings.requireStrongPasswords} 
                    onCheckedChange={() => handleSecurityToggle('requireStrongPasswords')} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Intentos máximos de inicio de sesión</Label>
                    <Input 
                      id="maxLoginAttempts" 
                      name="maxLoginAttempts" 
                      type="number"
                      min="1"
                      max="10"
                      value={securitySettings.maxLoginAttempts} 
                      onChange={handleSecurityChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Tiempo de expiración de sesión (minutos)</Label>
                    <Input 
                      id="sessionTimeout" 
                      name="sessionTimeout" 
                      type="number"
                      min="15"
                      max="240"
                      value={securitySettings.sessionTimeout} 
                      onChange={handleSecurityChange} 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar configuración
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Configuración de Accesibilidad */}
          <TabsContent value="accessibility">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Accesibilidad</CardTitle>
                <CardDescription>
                  Configure las opciones de accesibilidad para mejorar la experiencia de todos los usuarios.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableVoiceNavigation">Activar navegación por voz</Label>
                    <p className="text-sm text-muted-foreground">Permite a los usuarios navegar por el sitio usando comandos de voz</p>
                  </div>
                  <Switch 
                    id="enableVoiceNavigation" 
                    checked={accessibilitySettings.enableVoiceNavigation} 
                    onCheckedChange={() => handleAccessibilityToggle('enableVoiceNavigation')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableScreenReaderOptimization">Optimización para lectores de pantalla</Label>
                    <p className="text-sm text-muted-foreground">Mejora la compatibilidad con lectores de pantalla JAWS, NVDA y VoiceOver</p>
                  </div>
                  <Switch 
                    id="enableScreenReaderOptimization" 
                    checked={accessibilitySettings.enableScreenReaderOptimization} 
                    onCheckedChange={() => handleAccessibilityToggle('enableScreenReaderOptimization')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableHighContrast">Modo de alto contraste</Label>
                  <Switch 
                    id="enableHighContrast" 
                    checked={accessibilitySettings.enableHighContrast} 
                    onCheckedChange={() => handleAccessibilityToggle('enableHighContrast')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableLargeText">Texto grande</Label>
                  <Switch 
                    id="enableLargeText" 
                    checked={accessibilitySettings.enableLargeText} 
                    onCheckedChange={() => handleAccessibilityToggle('enableLargeText')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableReducedMotion">Reducir movimiento</Label>
                  <Switch 
                    id="enableReducedMotion" 
                    checked={accessibilitySettings.enableReducedMotion} 
                    onCheckedChange={() => handleAccessibilityToggle('enableReducedMotion')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableKeyboardNavigation">Navegación por teclado mejorada</Label>
                  <Switch 
                    id="enableKeyboardNavigation" 
                    checked={accessibilitySettings.enableKeyboardNavigation} 
                    onCheckedChange={() => handleAccessibilityToggle('enableKeyboardNavigation')} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="voiceCommandsLanguage">Idioma para comandos de voz</Label>
                  <select
                    id="voiceCommandsLanguage"
                    name="voiceCommandsLanguage"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={accessibilitySettings.voiceCommandsLanguage}
                    onChange={handleAccessibilityChange}
                  >
                    <option value="es-MX">Español (México)</option>
                    <option value="es-ES">Español (España)</option>
                    <option value="en-US">Inglés (Estados Unidos)</option>
                    <option value="en-GB">Inglés (Reino Unido)</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar configuración
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PrivateLayout>
  );
}