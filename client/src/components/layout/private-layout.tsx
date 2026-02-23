import { ReactNode, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  HomeIcon, 
  UserIcon, 
  UsersIcon, 
  ShoppingCartIcon, 
  MessageSquareIcon,
  CalendarIcon,
  HeartIcon,
  BellIcon,
  FileTextIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  SettingsIcon,
  ShoppingBagIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  StethoscopeIcon,
  ClipboardIcon,
  BuildingIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface PrivateLayoutProps {
  children: ReactNode;
}

type MenuItem = {
  label: string;
  href: string;
  icon: ReactNode;
  adminOnly?: boolean;
};

const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = true; // Simulamos usuario admin

  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['CLÍNICA']));

  const toggleMenu = (menuLabel: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuLabel)) {
        newSet.delete(menuLabel);
      } else {
        newSet.add(menuLabel);
      }
      return newSet;
    });
  };

  const adminMenuItems: (MenuItem & { children?: MenuItem[] })[] = [
    { label: 'Panel', href: '/admin/dashboard', icon: <HomeIcon size={18} /> },
    {
      label: 'CLÍNICA',
      href: '#',
      icon: <StethoscopeIcon size={18} />,
      children: [
        { label: 'Dashboard Doctor', href: '/admin/doctor-panel', icon: <StethoscopeIcon size={18} /> },
        { label: 'Citas Médicas', href: '/admin/citas', icon: <CalendarIcon size={18} /> },
        { label: 'Pacientes', href: '/admin/pacientes', icon: <ClipboardIcon size={18} /> },
        { label: 'Aseguradoras', href: '/admin/aseguradoras', icon: <BuildingIcon size={18} /> },
        { label: 'Doctores', href: '/admin/doctores', icon: <UserIcon size={18} /> },
        { label: 'Especialidades', href: '/admin/especialidades', icon: <StethoscopeIcon size={18} /> },
        { label: 'Mensajes', href: '/admin/contacto', icon: <MessageSquareIcon size={18} /> },
      ]
    },
    { label: 'Usuarios', href: '/admin/usuarios', icon: <UsersIcon size={18} /> },
    { label: 'Productos', href: '/admin/productos', icon: <ShoppingBagIcon size={18} /> },
    { label: 'Ventas', href: '/admin/ventas', icon: <ShoppingCartIcon size={18} /> },
    { label: 'Testimonios', href: '/admin/testimonios', icon: <HeartIcon size={18} /> },
    { label: 'Personal', href: '/admin/personal', icon: <UsersIcon size={18} /> },
    { label: 'Sincronización iCal', href: '/admin/ical', icon: <CalendarDaysIcon size={18} /> },
    { label: 'Blog', href: '/admin/blog', icon: <FileTextIcon size={18} /> },
    { label: 'Asistente Virtual', href: '/admin/asistente', icon: <MessageSquareIcon size={18} /> },
    { label: 'Configuración', href: '/admin/configuracion', icon: <SettingsIcon size={18} /> },
  ];

  const userMenuItems: MenuItem[] = [
    { label: 'Mi Perfil', href: '/mi-cuenta', icon: <UserIcon size={18} /> },
    { label: 'Mis Citas', href: '/mi-cuenta/citas', icon: <CalendarIcon size={18} /> },
    { label: 'Mis Pedidos', href: '/productos', icon: <ShoppingCartIcon size={18} /> },
    { label: 'Favoritos', href: '/productos', icon: <HeartIcon size={18} /> },
    { label: 'Notificaciones', href: '/contacto', icon: <BellIcon size={18} /> },
    { label: 'Configuración', href: '/configuracion', icon: <SettingsIcon size={18} /> },
  ];

  // Determinar qué conjunto de menú usar
  const isAdminArea = location.startsWith('/admin');
  const menuItems = isAdminArea ? adminMenuItems : userMenuItems;

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar - Escritorio */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-white dark:bg-gray-800 z-30">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">
            {isAdminArea ? "Panel de Administración" : "Mi Cuenta"}
          </h2>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <div key={index}>
                  {'children' in item && item.children ? (
                    <div>
                      <Button
                        variant="ghost"
                        className="w-full justify-between text-left my-1 hover:bg-muted text-neutral-700 font-medium"
                        onClick={() => toggleMenu(item.label)}
                      >
                        <div className="flex items-center">
                          <span className="mr-3 flex-shrink-0">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {expandedMenus.has(item.label) ? (
                          <ChevronDownIcon size={16} />
                        ) : (
                          <ChevronRightIcon size={16} />
                        )}
                      </Button>
                      {expandedMenus.has(item.label) && (
                        <div className="ml-6 space-y-1">
                          {item.children.map((child, childIndex) => (
                            <Button
                              key={childIndex}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-left text-sm",
                                location === child.href 
                                  ? "bg-primary/10 text-primary font-medium" 
                                  : "hover:bg-muted text-neutral-600"
                              )}
                              onClick={() => window.location.href = child.href}
                            >
                              <span className="mr-3 flex-shrink-0">{child.icon}</span>
                              <span className="truncate">{child.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left my-1",
                        location === item.href 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "hover:bg-muted text-neutral-700"
                      )}
                      onClick={() => window.location.href = item.href}
                    >
                      <span className="mr-3 flex-shrink-0">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="pt-6 mt-6 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-left mb-2 text-neutral-700"
                onClick={() => window.location.href = isAdminArea ? "/admin/configuracion" : "/configuracion"}
              >
                <SettingsIcon className="mr-3" size={18} />
                <span>Configuración</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => window.location.href = "/login"}
              >
                <LogOutIcon className="mr-3" size={18} />
                <span>Cerrar sesión</span>
              </Button>
            </div>
          </nav>
        </div>
      </div>
      
      {/* Sidebar móvil */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 overflow-y-auto md:hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">
                {isAdminArea ? "Panel de Administración" : "Mi Cuenta"}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <XIcon />
              </Button>
            </div>
            
            <div className="p-4">
              <nav>
                <div className="space-y-2">
                  {menuItems.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left my-1",
                        location === item.href 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "hover:bg-muted text-neutral-700"
                      )}
                      onClick={() => {
                        window.location.href = item.href;
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <span className="mr-3 flex-shrink-0">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </Button>
                  ))}
                </div>
                
                <div className="pt-6 mt-6 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left mb-2 text-neutral-700"
                    onClick={() => {
                      window.location.href = isAdminArea ? "/admin/configuracion" : "/configuracion";
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <SettingsIcon className="mr-3" size={18} />
                    <span>Configuración</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => window.location.href = "/login"}
                  >
                    <LogOutIcon className="mr-3" size={18} />
                    <span>Cerrar sesión</span>
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Header móvil */}
        <header className="sticky top-0 z-30 flex items-center h-14 px-4 md:hidden bg-white dark:bg-gray-800 border-b">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <MenuIcon />
          </Button>
          <h1 className="ml-4 font-medium">
            {isAdminArea ? "Administración" : "Mi Cuenta"}
          </h1>
          <div className="ml-auto">
            <Avatar className="h-8 w-8">
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>
        
        {/* Contenido */}
        <main className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;