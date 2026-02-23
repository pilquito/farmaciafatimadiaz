import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ContactMessage } from "@shared/schema";
import { 
  MessageSquareIcon, 
  MailIcon, 
  AlertCircleIcon, 
  CheckCircleIcon, 
  EyeIcon, 
  ReplyIcon, 
  TrashIcon,
  ArchiveIcon,
  SearchIcon,
  CalendarIcon,
  PhoneIcon,
  UserIcon,
  MessageCircleIcon,
  SendIcon,
  FilterIcon,
  RefreshCwIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function ContactManagerEnhanced() {
  const queryClient = useQueryClient();
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasNewMessages, setHasNewMessages] = useState(false);
  
  // Consultar la lista de mensajes de contacto
  const { data: contactMessages = [], isLoading, refetch } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact'],
  });

  // Filtrar mensajes de contacto
  const filteredMessages = contactMessages.filter(message => {
    if (statusFilter === "read" && !message.processed) return false;
    if (statusFilter === "unread" && message.processed) return false;
    if (statusFilter === "replied" && !message.reply) return false;
    if (searchQuery && 
      !message.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !message.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !message.subject.toLowerCase().includes(searchQuery.toLowerCase())
    ) return false;
    return true;
  });
  
  // Estadísticas de mensajes
  const stats = {
    total: contactMessages.length,
    unread: contactMessages.filter(m => !m.processed).length,
    replied: contactMessages.filter(m => m.reply).length,
    today: contactMessages.filter(m => {
      const today = new Date();
      const messageDate = new Date(m.date);
      return messageDate.toDateString() === today.toDateString();
    }).length
  };
  
  // Verificar si hay mensajes nuevos sin leer
  useEffect(() => {
    setHasNewMessages(stats.unread > 0);
  }, [stats.unread]);
  
  // Mutación para marcar un mensaje como leído
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/contact/${id}/read`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
      toast({
        title: "Mensaje marcado como leído",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutación para responder a un mensaje
  const replyMessageMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: number; reply: string }) => {
      return await apiRequest(`/api/contact/${id}/reply`, {
        method: "PATCH",
        body: JSON.stringify({ reply }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Respuesta enviada",
        description: data.emailPreviewUrl ? 
          "La respuesta ha sido enviada por email al cliente." :
          "La respuesta ha sido guardada.",
      });
      setIsReplyDialogOpen(false);
      setReplyText("");
      setSelectedMessage(null);
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar respuesta",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutación para eliminar un mensaje
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/contact/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Mensaje eliminado",
        description: "El mensaje ha sido eliminado permanentemente.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedMessage(null);
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
    
    // Marcar como leído automáticamente al abrir
    if (!message.processed) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleReplyMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyText("");
    setIsReplyDialogOpen(true);
  };

  const handleDeleteMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es });
  };

  const getStatusBadge = (message: ContactMessage) => {
    if (message.reply) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Respondido</Badge>;
    }
    if (message.processed) {
      return <Badge variant="secondary">Leído</Badge>;
    }
    return <Badge variant="destructive">Nuevo</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCwIcon className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header con estadísticas */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestión de Mensajes</h2>
          <p className="text-gray-600">Administra los mensajes de contacto recibidos</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCwIcon className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquareIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sin leer</p>
                <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
              </div>
              <AlertCircleIcon className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Respondidos</p>
                <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoy</p>
                <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar mensajes</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, email o asunto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="filter">Filtrar por estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los mensajes</SelectItem>
                  <SelectItem value="unread">Sin leer</SelectItem>
                  <SelectItem value="read">Leídos</SelectItem>
                  <SelectItem value="replied">Respondidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de mensajes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircleIcon className="w-5 h-5" />
            Mensajes de Contacto ({filteredMessages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquareIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay mensajes</p>
              <p>No se encontraron mensajes con los filtros aplicados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Remitente</TableHead>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow 
                      key={message.id}
                      className={!message.processed ? "bg-blue-50 border-blue-200" : ""}
                    >
                      <TableCell>
                        {getStatusBadge(message)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(message.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{message.name}</p>
                            <p className="text-sm text-gray-500">{message.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium truncate max-w-xs" title={message.subject}>
                          {message.subject}
                        </p>
                      </TableCell>
                      <TableCell>
                        {message.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <PhoneIcon className="w-3 h-3" />
                            {message.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewMessage(message)}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReplyMessage(message)}
                          >
                            <ReplyIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMessage(message)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para ver mensaje completo */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MailIcon className="w-5 h-5" />
              Detalles del Mensaje
            </DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-6">
              {/* Información del remitente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Nombre</Label>
                  <p className="text-lg">{selectedMessage.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-lg">{selectedMessage.email}</p>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                    <p className="text-lg">{selectedMessage.phone}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fecha</Label>
                  <p className="text-lg">{formatDate(selectedMessage.date)}</p>
                </div>
              </div>
              
              <Separator />
              
              {/* Asunto */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Asunto</Label>
                <p className="text-lg font-semibold">{selectedMessage.subject}</p>
              </div>
              
              <Separator />
              
              {/* Mensaje */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Mensaje</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
              
              {/* Respuesta previa */}
              {selectedMessage.reply && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Respuesta Enviada</Label>
                    <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedMessage.reply}</p>
                    </div>
                  </div>
                </>
              )}
              
              {/* Notas */}
              {selectedMessage.notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Notas Internas</Label>
                    <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedMessage.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Cerrar
            </Button>
            {selectedMessage && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                handleReplyMessage(selectedMessage);
              }}>
                <ReplyIcon className="w-4 h-4 mr-2" />
                Responder
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para responder mensaje */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SendIcon className="w-5 h-5" />
              Responder Mensaje
            </DialogTitle>
            <DialogDescription>
              {selectedMessage && (
                <>Respondiendo a: <strong>{selectedMessage.name}</strong> ({selectedMessage.email})</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              {/* Mensaje original resumido */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Mensaje original:</p>
                <p className="text-sm italic">"{selectedMessage.message.substring(0, 200)}..."</p>
              </div>
              
              {/* Campo de respuesta */}
              <div>
                <Label htmlFor="reply">Tu respuesta</Label>
                <Textarea
                  id="reply"
                  placeholder="Escribe tu respuesta aquí..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={8}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsReplyDialogOpen(false);
                setReplyText("");
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (selectedMessage && replyText.trim()) {
                  replyMessageMutation.mutate({
                    id: selectedMessage.id,
                    reply: replyText.trim()
                  });
                }
              }}
              disabled={!replyText.trim() || replyMessageMutation.isPending}
            >
              {replyMessageMutation.isPending ? (
                <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <SendIcon className="w-4 h-4 mr-2" />
              )}
              Enviar Respuesta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrashIcon className="w-5 h-5 text-red-500" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm"><strong>De:</strong> {selectedMessage.name} ({selectedMessage.email})</p>
              <p className="text-sm"><strong>Asunto:</strong> {selectedMessage.subject}</p>
              <p className="text-sm"><strong>Fecha:</strong> {formatDate(selectedMessage.date)}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedMessage(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (selectedMessage) {
                  deleteMessageMutation.mutate(selectedMessage.id);
                }
              }}
              disabled={deleteMessageMutation.isPending}
            >
              {deleteMessageMutation.isPending ? (
                <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TrashIcon className="w-4 h-4 mr-2" />
              )}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}