import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquareIcon, Mail, CheckIcon, Trash2Icon, ReplyIcon } from 'lucide-react';
import { ContactMessage } from '@shared/schema';

export default function AdminMensajes() {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const { toast } = useToast();

  const { data: contactMessages, isLoading } = useQuery({
    queryKey: ['/api/contact'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/contact/${id}/read`, { processed: true });
      if (!response.ok) {
        throw new Error('Error al marcar como leído');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Error al marcar como leído: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const replyMessageMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      const response = await apiRequest('PATCH', `/api/contact/${id}/reply`, { replyContent: content });
      if (!response.ok) {
        throw new Error('Error al responder el mensaje');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Mensaje enviado',
        description: 'La respuesta ha sido enviada exitosamente',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
      setIsReplyDialogOpen(false);
      setReplyContent('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Error al responder el mensaje: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/contact/${id}`);
      if (!response.ok) {
        throw new Error('Error al eliminar el mensaje');
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Mensaje eliminado',
        description: 'El mensaje ha sido eliminado exitosamente',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
      setIsDeleteDialogOpen(false);
      setSelectedMessage(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Error al eliminar el mensaje: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
    
    // Si el mensaje no está marcado como leído, marcarlo
    if (!message.processed) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleReplyMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsReplyDialogOpen(true);
    
    // Si el mensaje no está marcado como leído, marcarlo
    if (!message.processed) {
      markAsReadMutation.mutate(message.id);
    }
    
    // Establecer un texto de respuesta predeterminado
    setReplyContent(`Estimado/a ${message.name},\n\nGracias por contactarnos. En respuesta a tu mensaje:\n\n`);
  };

  const handleDeleteMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDeleteDialogOpen(true);
  };

  const submitReply = () => {
    if (!selectedMessage) return;
    replyMessageMutation.mutate({ id: selectedMessage.id, content: replyContent });
  };

  const confirmDelete = () => {
    if (!selectedMessage) return;
    deleteMessageMutation.mutate(selectedMessage.id);
  };

  return (
    <PrivateLayout>
      <Helmet>
        <title>Gestión de Mensajes | Administración</title>
      </Helmet>
      <div className="w-full p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Mensajes de Contacto</h2>
            <p className="text-neutral-500">Administra los mensajes recibidos a través del formulario de contacto</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Asunto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">Cargando mensajes...</TableCell>
                  </TableRow>
                ) : contactMessages && contactMessages.length > 0 ? (
                  contactMessages.map((message: ContactMessage) => (
                    <TableRow key={message.id} className={!message.processed ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Badge variant={message.processed ? 'outline' : 'default'}>
                          {message.processed ? 'Leído' : 'Nuevo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{message.name}</TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell>{message.subject}</TableCell>
                      <TableCell>{new Date(message.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewMessage(message)}
                          >
                            <MessageSquareIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReplyMessage(message)}
                          >
                            <ReplyIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline" 
                            size="sm"
                            className="text-red-500 border-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteMessage(message)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">No hay mensajes disponibles</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog para ver mensaje */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mensaje de {selectedMessage?.name}</DialogTitle>
              <DialogDescription>
                Recibido el {selectedMessage ? new Date(selectedMessage.createdAt).toLocaleDateString() : ''}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Nombre:</p>
                  <p>{selectedMessage?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email:</p>
                  <p>{selectedMessage?.email}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Asunto:</p>
                <p>{selectedMessage?.subject}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Mensaje:</p>
                <div className="p-3 border rounded-md bg-gray-50 mt-1">
                  <p className="whitespace-pre-wrap">{selectedMessage?.message}</p>
                </div>
              </div>

              {selectedMessage?.replyContent && (
                <div>
                  <p className="text-sm font-medium">Respuesta enviada:</p>
                  <div className="p-3 border rounded-md bg-blue-50 mt-1">
                    <p className="whitespace-pre-wrap">{selectedMessage.replyContent}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Cerrar
              </Button>
              <Button 
                type="button"
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setTimeout(() => {
                    handleReplyMessage(selectedMessage!);
                  }, 100);
                }}
                disabled={!selectedMessage}
              >
                <ReplyIcon className="h-4 w-4 mr-2" />
                Responder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para responder mensaje */}
        <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Responder a {selectedMessage?.name}</DialogTitle>
              <DialogDescription>
                La respuesta será enviada al email: {selectedMessage?.email}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium">Mensaje original:</p>
                <div className="p-3 border rounded-md bg-gray-50 mt-1 max-h-32 overflow-y-auto">
                  <p className="whitespace-pre-wrap">{selectedMessage?.message}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Tu respuesta:</p>
                <Textarea 
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  className="min-h-[200px] mt-1"
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
                onClick={submitReply}
                disabled={replyMessageMutation.isPending || !replyContent.trim()}
              >
                <Mail className="h-4 w-4 mr-2" />
                {replyMessageMutation.isPending ? 'Enviando...' : 'Enviar Respuesta'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para confirmar eliminación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
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
                onClick={confirmDelete}
                disabled={deleteMessageMutation.isPending}
              >
                {deleteMessageMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PrivateLayout>
  );
}