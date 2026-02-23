import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useScrollspy } from "@/hooks/use-scrollspy";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const activeSection = useScrollspy([
    'inicio', 
    'quienes-somos', 
    'servicios', 
    'servicios-farmacia', 
    'servicios-medicos',
    'centro-medico', 
    'blog', 
    'testimonios', 
    'instagram', 
    'contacto'
  ], 100);
  
  // Definir qué secciones corresponden a cada entidad
  const farmaciaSections = ['inicio', 'quienes-somos', 'servicios-farmacia', 'productos', 'testimonios', 'contacto'];
  const centroMedicoSections = ['servicios-medicos', 'centro-medico', 'blog', 'instagram'];
  
  // Si estamos en páginas específicas, mostrar un logo u otro, no ambos
  const currentPath = window.location.pathname;
  const isInSpecificPage = currentPath !== '/';
  
  // En páginas específicas, determinamos qué logo mostrar
  let forceFarmaciaLogo = false;
  let forceCentroMedicoLogo = false;
  
  if (isInSpecificPage) {
    if (currentPath === '/buscar') {
      forceFarmaciaLogo = true;
    } else if (currentPath === '/citas') {
      forceCentroMedicoLogo = true;
    }
  }
  
  // Si estamos en la sección general de servicios en la página principal,
  // mostrar ambos logos
  const isInGeneralServices = activeSection === 'servicios';
  
  // Determinar qué logo mostrar basado en la sección activa o la página actual
  const showFarmaciaLogo = forceFarmaciaLogo || (!forceCentroMedicoLogo && (!activeSection || isInGeneralServices || farmaciaSections.includes(activeSection)));
  const showCentroMedicoLogo = forceCentroMedicoLogo || (!forceFarmaciaLogo && (!activeSection || isInGeneralServices || centroMedicoSections.includes(activeSection)));
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  const renderMenuItems = () => (
    <>
      <li>
        <Link 
          href="/" 
          className="text-neutral-700 font-medium hover:text-primary pb-2 border-b-2 border-transparent hover:border-primary transition flex items-center"
        >
          <i className="fas fa-home mr-1 text-sm"></i>
          Inicio
        </Link>
      </li>
      <li>
        <Link 
          href="/equipo" 
          className="text-neutral-700 font-medium hover:text-primary pb-2 border-b-2 border-transparent hover:border-primary transition flex items-center"
        >
          <i className="fas fa-info-circle mr-1 text-sm"></i>
          Quiénes Somos
        </Link>
      </li>
      <li>
        <Link 
          href="/servicios" 
          className="text-neutral-700 font-medium hover:text-primary pb-2 border-b-2 border-transparent hover:border-primary transition flex items-center"
        >
          <i className="fas fa-concierge-bell mr-1 text-sm"></i>
          Servicios
        </Link>
      </li>
      <li>
        <Link 
          href="/productos" 
          className="text-neutral-700 font-medium hover:text-primary pb-2 border-b-2 border-transparent hover:border-primary transition flex items-center"
        >
          <i className="fas fa-box mr-1 text-sm"></i>
          Productos
        </Link>
      </li>

      <li>
        <Link 
          href="/citas" 
          className="text-neutral-700 font-medium hover:text-primary pb-2 border-b-2 border-transparent hover:border-primary transition flex items-center"
        >
          <i className="fas fa-calendar-alt mr-1 text-sm"></i>
          Citas
        </Link>
      </li>

      <li>
        <Link 
          href="/blog" 
          className="text-neutral-700 font-medium hover:text-primary pb-2 border-b-2 border-transparent hover:border-primary transition flex items-center"
        >
          <i className="fas fa-newspaper mr-1 text-sm"></i>
          Blog
        </Link>
      </li>

      <li>
        <Link 
          href="/equipo" 
          className="text-neutral-700 font-medium hover:text-primary pb-2 border-b-2 border-transparent hover:border-primary transition flex items-center"
        >
          <i className="fas fa-users mr-1 text-sm"></i>
          Equipo
        </Link>
      </li>
      <li>
        <Link 
          href="/contacto" 
          className="text-neutral-700 font-medium hover:text-primary pb-2 border-b-2 border-transparent hover:border-primary transition flex items-center"
        >
          <i className="fas fa-envelope mr-1 text-sm"></i>
          Contacto
        </Link>
      </li>

    </>
  );
  
  return (
    <header className="sticky top-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-2 sm:px-4 py-3">
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-center overflow-hidden">
            <div className="flex flex-row items-center space-x-1 sm:space-x-3 md:space-x-6 h-10 sm:h-12 md:h-16 max-w-[180px] sm:max-w-none">
              {/* Logo de Farmacia */}
              <AnimatePresence mode="wait">
                {showFarmaciaLogo && (
                  <motion.div
                    key="farmacia-logo"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-full"
                  >
                    <Link href="/" className="block h-full">
                      <img 
                        src="/assets/logo_farmacia_horizontal.png" 
                        alt="Farmacia Fátima Díaz Guillén" 
                        className="h-full object-contain scale-135 pl-[23px] pr-[23px]"
                        style={{ transform: 'scale(1.35)' }}
                      />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Separador vertical solo cuando ambos logos están visibles */}
              {showFarmaciaLogo && showCentroMedicoLogo && (
                <div className="h-8 w-px bg-gray-300 mx-1 hidden sm:block"></div>
              )}
              
              {/* Logo de Centro Médico */}
              <AnimatePresence mode="wait">
                {showCentroMedicoLogo && (
                  <motion.div
                    key="clodina-logo"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-full"
                  >
                    <Link href="/" className="block h-full">
                      <img 
                        src="/assets/logo_clodina_horizontal.png" 
                        alt="Centro Médico Clodina" 
                        className="h-full object-contain scale-135 pl-[22px] pr-[22px]"
                        style={{ transform: 'scale(1.35)' }}
                      />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="tel:+34922512151" className="flex items-center text-primary hover:text-primary-dark transition">
              <i className="fas fa-phone-alt mr-2"></i>
              <span className="font-medium">922 51 21 51</span>
            </a>
            
            {isLoading ? (
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full h-10 w-10 p-0">
                    <Avatar>
                      <AvatarImage src={user?.profileImageUrl} alt={user?.username} />
                      <AvatarFallback>
                        {user?.firstName ? user.firstName.charAt(0) : user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/mi-cuenta">
                      <span className="w-full">Mi Cuenta</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Link href="/login">
                  <Button variant="outline" className="border-primary text-primary">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button variant="outline" className="border-primary text-primary">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
            
            <Link href="/citas">
              <Button className="bg-primary hover:bg-primary-dark text-white">
                Pedir cita
              </Button>
            </Link>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden text-primary p-1">
                <i className="fas fa-bars text-xl"></i>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="py-6">
                <h2 className="text-lg font-bold text-primary mb-6">Menú</h2>
                <ul className="space-y-4">
                  {renderMenuItems()}
                </ul>
                
                <div className="mt-8 space-y-4">
                  <a href="tel:+34922512151" className="flex items-center text-primary">
                    <i className="fas fa-phone-alt mr-2"></i>
                    <span className="font-medium">922 51 21 51</span>
                  </a>
                  
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-2 border rounded-md">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.profileImageUrl} alt={user?.username} />
                          <AvatarFallback>
                            {user?.firstName ? user.firstName.charAt(0) : user?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user?.firstName || user?.username}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      
                      <Link href="/mi-cuenta">
                        <Button variant="outline" className="w-full">
                          Mi Cuenta
                        </Button>
                      </Link>
                      
                      <Button variant="outline" className="w-full" onClick={() => logout()}>
                        Cerrar sesión
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/login">
                        <Button variant="outline" className="w-full border-primary text-primary">
                          Iniciar sesión
                        </Button>
                      </Link>
                      <Link href="/registro">
                        <Button variant="outline" className="w-full border-primary text-primary">
                          Registrarse
                        </Button>
                      </Link>
                    </div>
                  )}
                  
                  <Link href="/citas">
                    <Button className="w-full bg-primary hover:bg-primary-dark text-white">
                      Pedir cita
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <nav className="hidden md:block py-4 pt-[0px] pb-[0px]">
          <ul className="flex justify-center space-x-8">
            {renderMenuItems()}
          </ul>
        </nav>
      </div>
    </header>
  );
}
