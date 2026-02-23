import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  UserIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  HeartIcon, 
  LogOutIcon, 
  BellIcon, 
  CoinsIcon, 
  SettingsIcon, 
  CreditCardIcon 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  lastLogin: string | null;
  loyaltyPoints: number;
  emailNotifications: boolean;
  profileImageUrl?: string;
}

interface Order {
  id: number;
  orderDate: string;
  status: string;
  total: number;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  speciality: string;
  doctor: string | null;
  status: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

interface LoyaltyPointsHistoryItem {
  id: number;
  points: number;
  reason: string;
  createdAt: string;
  orderId?: number;
}

export default function MiCuentaPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("perfil");
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showLoyaltyPointsDialog, setShowLoyaltyPointsDialog] = useState(false);

  // Fetch user profile
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/auth/profile"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/auth/profile") as UserProfile;
      } catch (error) {
        // If unauthorized, redirect to login
        setLocation("/login");
        return null;
      }
    }
  });

  // Fetch user orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["/api/orders/my-orders"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/orders/my-orders") as Order[];
      } catch (error) {
        return [];
      }
    },
    enabled: activeTab === "pedidos"
  });

  // Fetch user appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["/api/appointments/my-appointments"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/appointments/my-appointments") as Appointment[];
      } catch (error) {
        return [];
      }
    },
    enabled: activeTab === "citas"
  });

  // Fetch user favorites
  const { data: favorites, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/favorites") as any[];
      } catch (error) {
        return [];
      }
    },
    enabled: activeTab === "favoritos"
  });

  // Fetch user notifications
  const { data: notifications, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/notifications") as Notification[];
      } catch (error) {
        return [];
      }
    }
  });

  // Fetch loyalty points history
  const { data: loyaltyPointsHistory, isLoading: isLoadingLoyaltyPointsHistory } = useQuery({
    queryKey: ["/api/loyalty-points/history"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/loyalty-points/history") as LoyaltyPointsHistoryItem[];
      } catch (error) {
        return [];
      }
    },
    enabled: showLoyaltyPointsDialog
  });
  
  // Toggle email notifications preference
  const toggleEmailNotifications = async () => {
    try {
      await apiRequest("/api/profile/email-notifications", {
        method: "POST",
        body: JSON.stringify({ emailNotifications: !user?.emailNotifications })
      });
      
      toast({
        title: "Preferencias actualizadas",
        description: `Las notificaciones por email han sido ${!user?.emailNotifications ? 'activadas' : 'desactivadas'}.`
      });
      
      // Refetch user profile to update the UI
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar tus preferencias de notificaciones.",
        variant: "destructive"
      });
    }
  };
  
  // Mark notification as read
  const markNotificationAsRead = async (id: number) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      toast({
        title: "Cierre de sesión exitoso",
        description: "Has cerrado sesión correctamente."
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al cerrar sesión.",
        variant: "destructive"
      });
    }
  };

  if (isLoadingUser) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-40">
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Mi Cuenta</h1>
      
      <Tabs defaultValue="perfil" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <UserIcon size={16} />
            <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="pedidos" className="flex items-center gap-2">
            <ShoppingBagIcon size={16} />
            <span>Pedidos</span>
          </TabsTrigger>
          <TabsTrigger value="citas" className="flex items-center gap-2">
            <CalendarIcon size={16} />
            <span>Citas</span>
          </TabsTrigger>
          <TabsTrigger value="favoritos" className="flex items-center gap-2">
            <HeartIcon size={16} />
            <span>Favoritos</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Información personal</CardTitle>
              <CardDescription>
                Visualiza y actualiza tu información personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.username} 
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon size={32} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}
                    </h2>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Dialog open={showNotificationsDialog} onOpenChange={setShowNotificationsDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="relative">
                        <BellIcon size={18} />
                        {notifications && notifications.filter(n => !n.isRead).length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {notifications.filter(n => !n.isRead).length}
                          </span>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Notificaciones</DialogTitle>
                        <DialogDescription>
                          Recibe actualizaciones importantes sobre tus pedidos, citas y ofertas especiales.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="max-h-[60vh] overflow-y-auto mt-4">
                        {isLoadingNotifications ? (
                          <div className="py-10 text-center">
                            <p>Cargando notificaciones...</p>
                          </div>
                        ) : notifications && notifications.length > 0 ? (
                          <div className="space-y-3">
                            {notifications.map((notification) => (
                              <div 
                                key={notification.id} 
                                className={`p-3 rounded-lg border ${
                                  !notification.isRead ? 'bg-primary/5 border-primary/20' : ''
                                }`}
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-medium">{notification.title}</h4>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    notification.type === 'success' ? 'bg-green-100 text-green-800' :
                                    notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                    notification.type === 'error' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {notification.type === 'success' ? 'Éxito' :
                                     notification.type === 'warning' ? 'Aviso' :
                                     notification.type === 'error' ? 'Error' : 'Info'}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-10 text-center">
                            <p className="text-muted-foreground">No tienes notificaciones</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="email-notifications" 
                            checked={user.emailNotifications} 
                            onCheckedChange={toggleEmailNotifications}
                          />
                          <label htmlFor="email-notifications" className="text-sm">
                            Recibir notificaciones por email
                          </label>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={showLoyaltyPointsDialog} onOpenChange={setShowLoyaltyPointsDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <CoinsIcon size={18} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Programa de fidelización</DialogTitle>
                        <DialogDescription>
                          Acumula puntos con tus compras y canjéalos por descuentos en futuros pedidos.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="mt-4 p-4 bg-primary/10 rounded-lg text-center">
                        <h3 className="text-lg font-semibold mb-1">Tus puntos disponibles</h3>
                        <p className="text-3xl font-bold text-primary">{user.loyaltyPoints}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Cada 100 puntos equivalen a 5€ de descuento
                        </p>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Historial de puntos</h4>
                        <div className="max-h-[30vh] overflow-y-auto border rounded-md">
                          {isLoadingLoyaltyPointsHistory ? (
                            <div className="py-10 text-center">
                              <p>Cargando historial...</p>
                            </div>
                          ) : loyaltyPointsHistory && loyaltyPointsHistory.length > 0 ? (
                            <div className="divide-y">
                              {loyaltyPointsHistory.map((item) => (
                                <div key={item.id} className="p-3 flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{item.reason}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(item.createdAt).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                  <span className={`font-semibold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.points > 0 ? '+' : ''}{item.points}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-10 text-center">
                              <p className="text-muted-foreground">No hay historial disponible</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium">Datos de contacto</h3>
                  <Separator className="my-2" />
                  <div className="space-y-2 mt-4">
                    <p><span className="font-medium">Nombre:</span> {user.firstName || "No especificado"} {user.lastName || ""}</p>
                    <p><span className="font-medium">Usuario:</span> {user.username}</p>
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                    <p><span className="font-medium">Teléfono:</span> {user.phone || "No especificado"}</p>
                    <div className="flex items-center space-x-2 mt-4">
                      <Badge className="bg-primary">
                        <CoinsIcon size={14} className="mr-1" /> {user.loyaltyPoints} puntos
                      </Badge>
                      <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setShowLoyaltyPointsDialog(true)}>
                        Ver programa de fidelización
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Dirección</h3>
                  <Separator className="my-2" />
                  <div className="space-y-2 mt-4">
                    <p><span className="font-medium">Dirección:</span> {user.address || "No especificada"}</p>
                    <p><span className="font-medium">Ciudad:</span> {user.city || "No especificada"}</p>
                    <p><span className="font-medium">Código postal:</span> {user.postalCode || "No especificado"}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setLocation("/editar-perfil")}>
                  Editar perfil
                </Button>
                <Button variant="outline" onClick={() => setLocation("/cambiar-contrasena")}>
                  Cambiar contraseña
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pedidos">
          <Card>
            <CardHeader>
              <CardTitle>Mis pedidos</CardTitle>
              <CardDescription>
                Historial de tus pedidos en Farmacia Fátima Díaz Guillén
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <p>Cargando pedidos...</p>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Pedido #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.orderDate).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{order.total.toFixed(2)} €</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'completado' 
                              ? 'bg-green-100 text-green-800' 
                              : order.status === 'pendiente' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Button variant="link" size="sm" onClick={() => setLocation(`/pedido/${order.id}`)}>
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">No tienes pedidos realizados</p>
                  <Button onClick={() => setLocation("/productos")}>Explorar productos</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="citas">
          <Card>
            <CardHeader>
              <CardTitle>Mis citas</CardTitle>
              <CardDescription>
                Historial de tus citas en Centro Médico Clodina
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <p>Cargando citas...</p>
              ) : appointments && appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{appointment.speciality}</p>
                          <p className="text-sm">Dr. {appointment.doctor || "Asignado"}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.date} - {appointment.time}
                          </p>
                        </div>
                        <div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            appointment.status === 'completada' 
                              ? 'bg-green-100 text-green-800' 
                              : appointment.status === 'pendiente' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {appointment.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Button variant="link" size="sm" onClick={() => setLocation(`/cita/${appointment.id}`)}>
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">No tienes citas programadas</p>
                  <Button onClick={() => setLocation("/citas")}>Solicitar cita</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="favoritos">
          <Card>
            <CardHeader>
              <CardTitle>Mis favoritos</CardTitle>
              <CardDescription>
                Productos guardados como favoritos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFavorites ? (
                <p>Cargando favoritos...</p>
              ) : favorites && favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((favorite) => (
                    <div key={favorite.id} className="border rounded-lg p-4 flex">
                      <div className="flex-shrink-0 mr-4">
                        <img 
                          src={favorite.product.imageUrl} 
                          alt={favorite.product.name} 
                          className="w-20 h-20 object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{favorite.product.name}</p>
                        <p className="text-sm text-muted-foreground">{favorite.product.price}</p>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 h-auto" 
                          onClick={() => setLocation(`/producto/${favorite.product.id}`)}
                        >
                          Ver producto
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">No tienes productos favoritos</p>
                  <Button onClick={() => setLocation("/productos")}>Explorar productos</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-end">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOutIcon size={16} />
          <span>Cerrar sesión</span>
        </Button>
      </div>
    </div>
  );
}