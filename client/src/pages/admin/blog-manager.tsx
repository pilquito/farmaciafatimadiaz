import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileTextIcon, Plus, Edit2Icon, Trash2Icon } from 'lucide-react';

// Definición del esquema de formulario para blog posts
const blogPostFormSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(100),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres').max(100),
  category: z.string().min(2, 'La categoría debe tener al menos 2 caracteres'),
  excerpt: z.string().min(10, 'El resumen debe tener al menos 10 caracteres'),
  imageUrl: z.string().url('Debe ser una URL válida').optional(),
});

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

// Interfaz para el tipo de blog post
interface BlogPost {
  id: number;
  title: string;
  content: string;
  slug: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlogManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: '',
      content: '',
      slug: '',
      category: '',
      excerpt: '',
      imageUrl: '',
    },
  });

  const { data: blogPosts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: BlogPostFormValues) => {
      const response = await apiRequest('POST', '/api/blog', data);
      if (!response.ok) {
        throw new Error('Error al crear el post');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Post creado',
        description: 'El post ha sido creado exitosamente',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Error al crear el post: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async (data: BlogPostFormValues & { id: number }) => {
      const { id, ...postData } = data;
      const response = await apiRequest('PATCH', `/api/blog/${id}`, postData);
      if (!response.ok) {
        throw new Error('Error al actualizar el post');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Post actualizado',
        description: 'El post ha sido actualizado exitosamente',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      setIsEditDialogOpen(false);
      setSelectedPost(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Error al actualizar el post: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/blog/${id}`);
      if (!response.ok) {
        throw new Error('Error al eliminar el post');
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Post eliminado',
        description: 'El post ha sido eliminado exitosamente',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      setIsDeleteDialogOpen(false);
      setSelectedPost(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Error al eliminar el post: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    form.reset({
      title: post.title,
      content: post.content,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      imageUrl: post.imageUrl || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDeletePost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsDeleteDialogOpen(true);
  };

  const onSubmitCreate = (data: BlogPostFormValues) => {
    createPostMutation.mutate(data);
  };

  const onSubmitEdit = (data: BlogPostFormValues) => {
    if (!selectedPost) return;
    updatePostMutation.mutate({ ...data, id: selectedPost.id });
  };

  const confirmDelete = () => {
    if (!selectedPost) return;
    deletePostMutation.mutate(selectedPost.id);
  };

  return (
    <PrivateLayout>
      <Helmet>
        <title>Gestión de Blog | Administración</title>
      </Helmet>
      <div className="w-full p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Gestión del Blog</h2>
            <p className="text-neutral-500">Administra las publicaciones del blog</p>
          </div>
          
          <Button 
            className="bg-primary hover:bg-primary-dark text-white"
            onClick={() => {
              form.reset();
              setIsCreateDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Post
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">Cargando posts...</TableCell>
                  </TableRow>
                ) : blogPosts.length > 0 ? (
                  blogPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>{post.category}</TableCell>
                      <TableCell>{post.slug}</TableCell>
                      <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditPost(post)}
                          >
                            <Edit2Icon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline" 
                            size="sm"
                            className="text-red-500 border-red-500 hover:bg-red-50"
                            onClick={() => handleDeletePost(post)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">No hay posts disponibles</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog para crear nuevo post */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Post</DialogTitle>
              <DialogDescription>
                Completa el formulario para crear una nueva publicación en el blog.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título del post" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="mi-articulo-de-blog" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <FormControl>
                          <Input placeholder="Salud, Medicamentos, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumen</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Breve resumen del artículo" 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Imagen</FormLabel>
                      <FormControl>
                        <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenido</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Contenido del post" 
                          className="min-h-[200px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPostMutation.isPending}
                  >
                    {createPostMutation.isPending ? 'Creando...' : 'Crear Post'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog para editar post */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Editar Post</DialogTitle>
              <DialogDescription>
                Modifica los detalles del post seleccionado.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título del post" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="mi-articulo-de-blog" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <FormControl>
                          <Input placeholder="Salud, Medicamentos, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumen</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Breve resumen del artículo" 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Imagen</FormLabel>
                      <FormControl>
                        <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenido</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Contenido del post" 
                          className="min-h-[200px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updatePostMutation.isPending}
                  >
                    {updatePostMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog para confirmar eliminación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este post? Esta acción no se puede deshacer.
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
                disabled={deletePostMutation.isPending}
              >
                {deletePostMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PrivateLayout>
  );
}