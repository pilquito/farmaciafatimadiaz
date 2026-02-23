import EnhancedAppointmentForm from "@/components/appointments/enhanced-appointment-form";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, User, MapPin } from "lucide-react";

export default function AppointmentsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [location, navigate] = useLocation();

  // Obtener las citas del usuario
  const { data: userAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/user/appointments'],
    enabled: isAuthenticated,
  });

  // Comprobar si el usuario está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("/api/auth/profile");
        if (response) {
          setIsAuthenticated(true);
          setUserInfo(response);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location]); // Agregar location como dependencia para re-ejecutar cuando cambie la URL

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="pt-28 pb-16 bg-neutral-50 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no está autenticado, mostrar mensaje de inicio de sesión
  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>Agendar Cita | Centro Médico Clodina</title>
          <meta 
            name="description" 
            content="Agenda tu cita médica en Centro Médico Clodina. Ofrecemos diversas especialidades con profesionales de primer nivel para cuidar de tu salud."
          />
        </Helmet>
        
        <div className="pt-28 pb-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">
                Agenda tu <span className="text-primary">Cita Médica</span>
              </h1>
              <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            </motion.div>
            
            <Card className="max-w-md mx-auto p-8 text-center">
              <div className="text-primary text-5xl mb-4">
                <i className="fas fa-user-lock"></i>
              </div>
              <h2 className="text-xl font-bold mb-4">Acceso requerido</h2>
              <p className="text-neutral-600 mb-6">
                Para agendar una cita médica, es necesario que inicies sesión o crees una cuenta. 
                Esto nos permite gestionar mejor tus citas y ofrecerte un servicio personalizado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/login?redirect=/citas")}
                  className="bg-primary hover:bg-primary-dark"
                >
                  Iniciar sesión
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/registro?redirect=/citas")}
                >
                  Crear cuenta
                </Button>
              </div>
            </Card>
            
            <motion.div 
              className="mt-16 text-center max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">
                Información importante
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-primary text-3xl mb-2">
                    <i className="fas fa-clock"></i>
                  </div>
                  <h3 className="font-medium text-lg mb-2">Horario de atención</h3>
                  <p className="text-neutral-600 text-sm">
                    Lunes a Viernes: 9:00 - 14:00 y 16:00 - 20:00<br />
                    Sábados: 9:00 - 14:00<br />
                    Domingos: Cerrado
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-primary text-3xl mb-2">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <h3 className="font-medium text-lg mb-2">Documentación</h3>
                  <p className="text-neutral-600 text-sm">
                    Recuerda traer tu DNI/NIE, tarjeta sanitaria, y cualquier informe médico previo
                    relacionado con tu consulta.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-primary text-3xl mb-2">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <h3 className="font-medium text-lg mb-2">Contacto directo</h3>
                  <p className="text-neutral-600 text-sm">
                    Para modificaciones o consultas sobre tu cita:<br />
                    <span className="text-primary font-medium">+34 922 51 21 51</span><br />
                    <span className="text-primary font-medium">info@farmaciafatimadiaz.com</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  // Si está autenticado, mostrar formulario de citas
  return (
    <>
      <Helmet>
        <title>Agendar Cita | Centro Médico Clodina</title>
        <meta 
          name="description" 
          content="Agenda tu cita médica en Centro Médico Clodina. Ofrecemos diversas especialidades con profesionales de primer nivel para cuidar de tu salud."
        />
      </Helmet>
      
      <div className="pt-28 pb-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">
              Agenda tu <span className="text-primary">Cita Médica</span>
            </h1>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-neutral-700 max-w-2xl mx-auto">
              Programa una consulta con nuestros especialistas de forma rápida y sencilla.
              Completa el siguiente formulario y nos pondremos en contacto contigo para confirmar tu cita.
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <EnhancedAppointmentForm />
          </div>

          {/* Historial de citas del usuario */}
          {userAppointments && Array.isArray(userAppointments) && userAppointments.length > 0 && (
            <motion.div 
              className="mt-16 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    Mis Citas Médicas
                  </CardTitle>
                  <CardDescription>
                    Historial y estado de tus citas programadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appointmentsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    userAppointments.map((appointment: any) => (
                      <div key={appointment.id} className="border rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                appointment.status === 'confirmed' ? 'default' :
                                appointment.status === 'pending' ? 'secondary' :
                                appointment.status === 'cancelled' ? 'destructive' : 'outline'
                              }
                            >
                              {appointment.status === 'confirmed' ? 'Confirmada' :
                               appointment.status === 'pending' ? 'Pendiente' :
                               appointment.status === 'cancelled' ? 'Cancelada' : 
                               appointment.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-neutral-500">
                            #{appointment.id}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <CalendarDays className="w-4 h-4 text-primary" />
                              <span className="font-medium">
                                {new Date(appointment.date).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-primary" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-primary" />
                              <span>Dr/a. {appointment.doctorName || appointment.doctor || `Doctor ID: ${appointment.doctorId}`}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium text-neutral-700">Motivo:</span>
                              <p className="text-neutral-600 mt-1">{appointment.reason}</p>
                            </div>
                            {appointment.notes && (
                              <div className="text-sm">
                                <span className="font-medium text-neutral-700">Notas:</span>
                                <p className="text-neutral-600 mt-1">{appointment.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          <motion.div 
            className="mt-16 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-neutral-800 mb-4">
              Información importante
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-primary text-3xl mb-2">
                  <i className="fas fa-clock"></i>
                </div>
                <h3 className="font-medium text-lg mb-2">Horario de atención</h3>
                <p className="text-neutral-600 text-sm">
                  Lunes a Viernes: 9:00 - 14:00 y 16:00 - 20:00<br />
                  Sábados: 9:00 - 14:00<br />
                  Domingos: Cerrado
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-primary text-3xl mb-2">
                  <i className="fas fa-info-circle"></i>
                </div>
                <h3 className="font-medium text-lg mb-2">Documentación</h3>
                <p className="text-neutral-600 text-sm">
                  Recuerda traer tu DNI/NIE, tarjeta sanitaria, y cualquier informe médico previo
                  relacionado con tu consulta.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-primary text-3xl mb-2">
                  <i className="fas fa-phone-alt"></i>
                </div>
                <h3 className="font-medium text-lg mb-2">Contacto directo</h3>
                <p className="text-neutral-600 text-sm">
                  Para modificaciones o consultas sobre tu cita:<br />
                  <span className="text-primary font-medium">+34 900 123 456</span><br />
                  <span className="text-primary font-medium">citas@centromedico.com</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}