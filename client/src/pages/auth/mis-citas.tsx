import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentHistory } from "@/components/appointments/appointment-history";
import { apiRequest } from "@/lib/queryClient";

export default function MisCitasPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [location, navigate] = useLocation();

  // Comprobar si el usuario está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("/api/auth/profile");
        if (response) {
          setIsAuthenticated(true);
          setUserInfo(response);
        } else {
          navigate("/login?redirect=/mi-cuenta/citas");
        }
      } catch (error) {
        setIsAuthenticated(false);
        navigate("/login?redirect=/mi-cuenta/citas");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="pt-28 pb-16 bg-neutral-50 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si está autenticado, mostrar historial de citas
  return (
    <>
      <Helmet>
        <title>Mis Citas | Centro Médico Clodina</title>
        <meta 
          name="description" 
          content="Gestiona tus citas médicas en Centro Médico Clodina. Consulta, reprograma o cancela tus citas de forma sencilla."
        />
      </Helmet>
      
      <div className="pt-28 pb-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mis Citas</h1>
            <p className="text-neutral-600">
              Consulta y gestiona tus citas programadas y tu historial médico.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Menú lateral */}
            <Card className="lg:col-span-1">
              <CardHeader className="bg-neutral-50">
                <CardTitle className="text-lg">Mi cuenta</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/mi-cuenta")}
                    className="justify-start rounded-none h-12 px-4 text-left font-normal"
                  >
                    <i className="fas fa-user mr-3"></i>
                    Perfil
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/mi-cuenta/citas")}
                    className="justify-start rounded-none h-12 px-4 text-left font-normal bg-neutral-100"
                  >
                    <i className="fas fa-calendar-check mr-3"></i>
                    Mis Citas
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/mi-cuenta/consultas")}
                    className="justify-start rounded-none h-12 px-4 text-left font-normal"
                  >
                    <i className="fas fa-video mr-3"></i>
                    Consultas Virtuales
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/mi-cuenta/historial")}
                    className="justify-start rounded-none h-12 px-4 text-left font-normal"
                  >
                    <i className="fas fa-file-medical mr-3"></i>
                    Mi Historial Médico
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/mi-cuenta/pedidos")}
                    className="justify-start rounded-none h-12 px-4 text-left font-normal"
                  >
                    <i className="fas fa-shopping-bag mr-3"></i>
                    Mis Pedidos
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/configuracion")}
                    className="justify-start rounded-none h-12 px-4 text-left font-normal"
                  >
                    <i className="fas fa-cog mr-3"></i>
                    Configuración
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/api/auth/logout")}
                    className="justify-start rounded-none h-12 px-4 text-left font-normal text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <i className="fas fa-sign-out-alt mr-3"></i>
                    Cerrar sesión
                  </Button>
                </nav>
              </CardContent>
            </Card>
            
            {/* Contenido principal */}
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                  <div>
                    <CardTitle>Gestión de Citas</CardTitle>
                    <CardDescription>
                      Visualiza y administra tus citas médicas.
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => navigate("/citas")}
                    className="bg-primary hover:bg-primary-dark text-white"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Nueva Cita
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  <AppointmentHistory />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}