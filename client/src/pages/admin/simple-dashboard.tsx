import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import {
  ShoppingBagIcon,
  MessageSquareIcon,
  CalendarIcon,
  FileTextIcon,
  UsersIcon,
  Stethoscope,
  Clock
} from 'lucide-react';

export default function SimpleDashboard() {
  // Definir módulos de administración
  const adminModules = [
    {
      title: "Gestión de Productos",
      icon: <ShoppingBagIcon className="h-10 w-10 text-primary" />,
      description: "Administra el catálogo de productos, precios y categorías",
      link: "/productos",
    },
    {
      title: "Gestión de Blog",
      icon: <FileTextIcon className="h-10 w-10 text-orange-500" />,
      description: "Administra artículos y publicaciones del blog",
      link: "/blog",
    },
    {
      title: "Calendario General",
      icon: <CalendarIcon className="h-10 w-10 text-purple-500" />,
      description: "Vista mensual de todas las citas médicas programadas",
      link: "/admin/citas",
    },
    {
      title: "Mensajes de Contacto",
      icon: <MessageSquareIcon className="h-10 w-10 text-blue-500" />,
      description: "Revisa y responde mensajes de usuarios",
      link: "/contacto",
    },
    {
      title: "Gestión de Usuarios",
      icon: <UsersIcon className="h-10 w-10 text-green-500" />,
      description: "Administra cuentas de usuarios y permisos",
      link: "/admin/usuarios",
    },
    {
      title: "Panel de Doctores",
      icon: <Stethoscope className="h-10 w-10 text-teal-500" />,
      description: "Panel específico para doctores: gestión de citas y horarios",
      link: "/doctor",
    },
    {
      title: "Configuración de Horarios",
      icon: <Clock className="h-10 w-10 text-indigo-500" />,
      description: "Configura horarios de consulta, excepciones y disponibilidad",
      link: "/admin/citas",
    },
  ];

  return (
    <PrivateLayout>
      <Helmet>
        <title>Panel de Administración | Farmacia & Centro Médico</title>
      </Helmet>
      <div className="w-full p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-neutral-600">
            Bienvenido al panel de control. Accede a las diferentes secciones para administrar el sitio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module, index) => (
            <Card key={index} className="border border-neutral-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl">
                  {module.icon}
                  <span className="ml-3">{module.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">{module.description}</p>
                <Button asChild className="w-full bg-primary hover:bg-primary-dark text-white">
                  <Link href={module.link}>Acceder</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PrivateLayout>
  );
}