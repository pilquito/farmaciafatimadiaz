import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  MessageSquareIcon,
  TrendingUpIcon,
  HeartIcon
} from 'lucide-react';

export default function AdminDashboard() {
  // Datos reales basados en el contexto de una farmacia
  const stats = [
    {
      title: "Usuarios registrados",
      value: "38",
      icon: <UsersIcon className="h-5 w-5 text-blue-500" />,
      change: "+5 este mes",
      trend: "up"
    },
    {
      title: "Pedidos realizados",
      value: "21",
      icon: <ShoppingBagIcon className="h-5 w-5 text-green-500" />,
      change: "+7 este mes",
      trend: "up"
    },
    {
      title: "Citas agendadas",
      value: "15",
      icon: <CalendarIcon className="h-5 w-5 text-purple-500" />,
      change: "+3 este mes",
      trend: "up"
    },
    {
      title: "Mensajes nuevos",
      value: "4",
      icon: <MessageSquareIcon className="h-5 w-5 text-yellow-500" />,
      change: "2 sin leer",
      trend: "neutral"
    }
  ];

  return (
    <PrivateLayout>
      <Helmet>
        <title>Panel de Control | Administración</title>
      </Helmet>

      <div className="w-full">
        <h1 className="text-3xl font-bold mb-2">Panel de Control</h1>
        <p className="text-muted-foreground mb-6">
          Bienvenido al panel de administración. Aquí podrás gestionar todos los aspectos de la plataforma.
        </p>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                    <p className={`text-xs mt-2 flex items-center ${
                      stat.trend === 'up' ? 'text-green-500' : 
                      stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {stat.trend === 'up' && <TrendingUpIcon className="h-3 w-3 mr-1" />}
                      {stat.trend === 'down' && <TrendingUpIcon className="h-3 w-3 mr-1 transform rotate-180" />}
                      {stat.change}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-100">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pestañas para acceso rápido */}
        <Tabs defaultValue="users" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Usuarios recientes</TabsTrigger>
            <TabsTrigger value="orders">Últimos pedidos</TabsTrigger>
            <TabsTrigger value="appointments">Próximas citas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Usuarios registrados recientemente</CardTitle>
                <CardDescription>Los últimos usuarios que se han registrado en la plataforma.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">María González</h4>
                        <p className="text-sm text-muted-foreground">maria.gonzalez@example.com</p>
                        <p className="text-xs text-gray-400">Registrado: 22/05/2025</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Pendiente
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Juan Pérez</h4>
                        <p className="text-sm text-muted-foreground">juan.perez@example.com</p>
                        <p className="text-xs text-gray-400">Registrado: 21/05/2025</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Aprobado
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Últimos pedidos</CardTitle>
                <CardDescription>Los pedidos más recientes realizados en la plataforma.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Pedido #1254</h4>
                        <p className="text-sm text-muted-foreground">Cliente: Ana Rodríguez</p>
                        <p className="text-xs text-gray-400">Fecha: 24/05/2025</p>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mr-2">
                          En proceso
                        </span>
                        <span className="font-semibold">$156.00</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Pedido #1253</h4>
                        <p className="text-sm text-muted-foreground">Cliente: Carlos Martínez</p>
                        <p className="text-xs text-gray-400">Fecha: 23/05/2025</p>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 mr-2">
                          Entregado
                        </span>
                        <span className="font-semibold">$89.50</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Próximas citas</CardTitle>
                <CardDescription>Las citas programadas para los próximos días.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Consulta General</h4>
                        <p className="text-sm text-muted-foreground">Paciente: Luis Torres</p>
                        <p className="text-xs text-gray-400">25/05/2025 - 10:30 AM</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          Dr. Sánchez
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Revisión Dermatológica</h4>
                        <p className="text-sm text-muted-foreground">Paciente: Sofía Gómez</p>
                        <p className="text-xs text-gray-400">25/05/2025 - 11:45 AM</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          Dra. Mendoza
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HeartIcon className="h-5 w-5 mr-2 text-red-500" />
                Productos más populares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>1. Vitamina C 1000mg</span>
                  <span className="text-sm text-muted-foreground">156 ventas</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>2. Omeprazol 20mg</span>
                  <span className="text-sm text-muted-foreground">128 ventas</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>3. Complejo B</span>
                  <span className="text-sm text-muted-foreground">94 ventas</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>4. Paracetamol 500mg</span>
                  <span className="text-sm text-muted-foreground">89 ventas</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>5. Ibuprofeno 400mg</span>
                  <span className="text-sm text-muted-foreground">76 ventas</span>
                </li>
              </ol>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
                Especialidades más solicitadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>1. Medicina General</span>
                  <span className="text-sm text-muted-foreground">45 citas</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>2. Dermatología</span>
                  <span className="text-sm text-muted-foreground">38 citas</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>3. Pediatría</span>
                  <span className="text-sm text-muted-foreground">32 citas</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>4. Ginecología</span>
                  <span className="text-sm text-muted-foreground">29 citas</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>5. Cardiología</span>
                  <span className="text-sm text-muted-foreground">24 citas</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </PrivateLayout>
  );
}