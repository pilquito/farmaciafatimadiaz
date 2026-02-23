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

export function ContactManager() {
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
  const { data: contactMessages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact'],
  });

  // Filtrar mensajes de contacto
  const filteredMessages = contactMessages.filter(message => {
    if (statusFilter === "read" && !message.processed) return false;
    if (statusFilter === "unread" && message.processed) return false;
    if (searchQuery && 
      !message.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !message.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !message.subject.toLowerCase().includes(searchQuery.toLowerCase())
    ) return false;
    return true;
  });
  
  // Verificar si hay mensajes nuevos sin leer
  useEffect(() => {
    const unreadMessages = contactMessages.filter(message => !message.processed);
    setHasNewMessages(unreadMessages.length > 0);
  }, [contactMessages]);
  
  // Mutación para marcar un mensaje como leído
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/contact/${id}/read`, {
        method: "PATCH",
        body: JSON.stringify({ processed: true }),
      });
      
      if (!response.ok) {
        throw new Error("Error al marcar el mensaje como leído");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
    },
    onError: (error) => {
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
      const response = await apiRequest(`/api/contact/${id}/reply`, {
        method: "PATCH",
        body: JSON.stringify({ reply, processed: true }),
      });
      
      if (!response.ok) {
        throw new Error("Error al responder el mensaje");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mensaje respondido",
        description: "La respuesta ha sido enviada correctamente.",
      });
      setIsReplyDialogOpen(false);
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutación para eliminar un mensaje
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/contact/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar el mensaje");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mensaje eliminado",
        description: "El mensaje ha sido eliminado correctamente.",
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Para abrir un mensaje y marcarlo como leído si no lo está
  const handleOpenMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
    
    // Si el mensaje no ha sido procesado, marcarlo como leído
    if (!message.processed) {
      markAsReadMutation.mutate(message.id);
    }
  };
  
  // Para responder a un mensaje
  const handleReplyMessage = () => {
    if (selectedMessage && replyText.trim()) {
      replyMessageMutation.mutate({
        id: selectedMessage.id,
        reply: replyText.trim()
      });
    }
  };
  
  // Para eliminar un mensaje
  const handleDeleteMessage = () => {
    if (selectedMessage) {
      deleteMessageMutation.mutate(selectedMessage.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800 flex items-center">
            <MessageSquareIcon className="mr-2 text-primary" size={24} />
            Mensajes de Contacto
            {hasNewMessages && (
              <Badge className="ml-2 bg-red-500 text-white">Nuevos</Badge>
            )}
          </h2>
          <p className="text-neutral-500">Gestiona los mensajes recibidos desde el formulario de contacto</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="bg-white border-neutral-200"
            onClick={() => {
              setStatusFilter("all");
              setSearchQuery("");
            }}
          >
            <CheckCircleIcon className="mr-2" size={16} />
            Restablecer filtros
          </Button>
          
          {hasNewMessages && (
            <Button 
              variant="outline" 
              className="bg-blue-50 border-blue-200 text-blue-700"
              onClick={() => {
                setStatusFilter("unread");
              }}
            >
              <AlertCircleIcon className="mr-2" size={16} />
              Ver mensajes nuevos
            </Button>
          )}
        </div>
      </div>
      
      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <MessageSquareIcon className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total mensajes</p>
              <p className="text-2xl font-bold">{contactMessages.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-red-100 p-3 mr-4">
              <AlertCircleIcon className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Sin leer</p>
              <p className="text-2xl font-bold">
                {contactMessages.filter(m => !m.processed).length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <CheckCircleIcon className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Procesados</p>
              <p className="text-2xl font-bold">
                {contactMessages.filter(m => m.processed).length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-amber-100 p-3 mr-4">
              <MailIcon className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Últimos 7 días</p>
              <p className="text-2xl font-bold">
                {contactMessages.filter(m => {
                  const date = new Date(m.date);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - date.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7;
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Buscar</label>
          <Input
            placeholder="Buscar por nombre, email o asunto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-neutral-300"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Estado</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-neutral-300">
              <SelectValue placeholder="Todos los mensajes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los mensajes</SelectItem>
              <SelectItem value="read">Leídos</SelectItem>
              <SelectItem value="unread">No leídos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-700">Cargando mensajes...</p>
        </div>
      ) : (
        <>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-10 bg-neutral-50 rounded-lg border">
              <div className="text-5xl text-neutral-300 mb-4">
                <i className="fas fa-inbox"></i>
              </div>
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                No hay mensajes
              </h3>
              <p className="text-neutral-500 mb-6">
                {searchQuery || statusFilter !== "all" 
                  ? "No se encontraron mensajes con los filtros aplicados." 
                  : "No hay mensajes en la bandeja de entrada."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Remitente</TableHead>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow 
                      key={message.id}
                      className={message.processed ? "" : "bg-blue-50"}
                    >
                      <TableCell>
                        {message.processed ? (
                          <Badge variant="outline" className="bg-neutral-100 text-neutral-800">
                            Leído
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            Nuevo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{message.name}</div>
                          <div className="text-sm text-neutral-500">{message.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium truncate max-w-[250px]">
                          {message.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        {message.date ? (
                          format(new Date(message.date), "dd MMM yyyy HH:mm", { locale: es })
                        ) : (
                          "Fecha no disponible"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleOpenMessage(message)}
                          >
                            <i className="fas fa-eye text-blue-500"></i>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => {
                              setSelectedMessage(message);
                              setReplyText("");
                              setIsReplyDialogOpen(true);
                            }}
                          >
                            <i className="fas fa-reply text-green-500"></i>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => {
                              setSelectedMessage(message);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <i className="fas fa-trash text-red-500"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
      
      {/* Dialog para ver mensaje */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedMessage?.subject}
            </DialogTitle>
            <DialogDescription>
              <div className="flex justify-between items-center">
                <div>
                  De: <span className="font-medium">{selectedMessage?.name}</span> ({selectedMessage?.email})
                </div>
                <div>
                  {selectedMessage?.date ? (
                    format(new Date(selectedMessage.date), "dd MMMM yyyy HH:mm", { locale: es })
                  ) : (
                    "Fecha no disponible"
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-neutral-50 p-4 rounded-md whitespace-pre-wrap">
            {selectedMessage?.message}
          </div>
          
          {selectedMessage?.reply && (
            <div>
              <div className="text-sm font-medium text-neutral-500 mb-2">
                Tu respuesta:
              </div>
              <div className="bg-primary-light p-4 rounded-md whitespace-pre-wrap text-neutral-800">
                {selectedMessage.reply}
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Cerrar
            </Button>
            
            <Button 
              type="button"
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedMessage) {
                  setReplyText("");
                  setIsReplyDialogOpen(true);
                }
              }}
            >
              <i className="fas fa-reply mr-2"></i>
              Responder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para responder mensaje */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Responder: {selectedMessage?.subject}
            </DialogTitle>
            <DialogDescription>
              Enviar respuesta a {selectedMessage?.name} ({selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-neutral-50 p-4 rounded-md mb-4 max-h-32 overflow-y-auto whitespace-pre-wrap">
            <div className="text-sm font-medium text-neutral-500 mb-1">Mensaje original:</div>
            {selectedMessage?.message}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tu respuesta</label>
              <Textarea 
                placeholder="Escribe tu respuesta aquí..." 
                className="min-h-[150px] border-neutral-300"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsReplyDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={handleReplyMessage}
              disabled={!replyText.trim() || replyMessageMutation.isPending}
            >
              {replyMessageMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Enviar Respuesta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar Mensaje</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-neutral-50 p-3 rounded-md">
            <p className="font-medium text-neutral-800">{selectedMessage?.subject}</p>
            <p className="text-sm text-neutral-600">De: {selectedMessage?.name} ({selectedMessage?.email})</p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDeleteMessage}
              disabled={deleteMessageMutation.isPending}
            >
              {deleteMessageMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Eliminando...
                </>
              ) : (
                <>
                  <i className="fas fa-trash mr-2"></i>
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}