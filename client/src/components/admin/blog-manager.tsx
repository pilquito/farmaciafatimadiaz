import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pencil, Plus, Trash } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Tipos
type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  publishDate: string;
};

// Esquema de validación
const blogPostFormSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  slug: z.string().min(1, 'El slug es obligatorio'),
  category: z.string().min(1, 'La categoría es obligatoria'),
  excerpt: z.string().min(1, 'El extracto es obligatorio'),
  content: z.string().min(1, 'El contenido es obligatorio'),
  imageUrl: z.string().min(1, 'La URL de la imagen es obligatoria'),
});

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

export function BlogManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [editorContent, setEditorContent] = useState('');

  // Query para obtener los posts del blog
  const { data: blogPosts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  // Formulario para crear un post
  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      category: '',
      excerpt: '',
      content: '',
      imageUrl: '',
    },
  });

  // Formulario para editar un post
  const editForm = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      category: '',
      excerpt: '',
      content: '',
      imageUrl: '',
    },
  });

  // Mutación para crear un post
  const createBlogPostMutation = useMutation({
    mutationFn: async (data: BlogPostFormValues) => {
      return await apiRequest('/api/blog', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      setIsCreateDialogOpen(false);
      form.reset();
      setEditorContent('');
      toast({
        title: 'Post creado',
        description: 'El post ha sido creado exitosamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Error al crear el post. ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutación para actualizar un post
  const updateBlogPostMutation = useMutation({
    mutationFn: async (data: { id: number; formData: BlogPostFormValues }) => {
      return await apiRequest(`/api/blog/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedBlogPost(null);
      toast({
        title: 'Post actualizado',
        description: 'El post ha sido actualizado exitosamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Error al actualizar el post. ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutación para eliminar un post
  const deleteBlogPostMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/blog/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      toast({
        title: 'Post eliminado',
        description: 'El post ha sido eliminado exitosamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Error al eliminar el post. ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Handler para crear un post
  const handleSubmit = (data: BlogPostFormValues) => {
    createBlogPostMutation.mutate(data);
  };

  // Handler para editar un post
  const handleEdit = (post: BlogPost) => {
    setSelectedBlogPost(post);
    editForm.reset({
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      imageUrl: post.imageUrl,
    });
    setIsEditDialogOpen(true);
  };

  // Handler para actualizar un post
  const handleUpdate = (data: BlogPostFormValues) => {
    if (selectedBlogPost) {
      updateBlogPostMutation.mutate({
        id: selectedBlogPost.id,
        formData: data,
      });
    }
  };

  // Handler para eliminar un post
  const handleDelete = (id: number) => {
    deleteBlogPostMutation.mutate(id);
  };

  // Configuración del editor Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestión del Blog</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear nuevo post</DialogTitle>
              <DialogDescription>
                Completa el formulario para crear un nuevo post en el blog.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese el título del post" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (URL)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="titulo-del-post" 
                          {...field} 
                          onChange={(e) => {
                            // Convertir el valor a un formato de URL amigable
                            const value = e.target.value
                              .toLowerCase()
                              .replace(/[^\w\s-]/g, '')
                              .replace(/\s+/g, '-');
                            field.onChange(value);
                          }}
                        />
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
                        <Input placeholder="Ingrese la categoría" {...field} />
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
                      <FormLabel>URL de la imagen</FormLabel>
                      <FormControl>
                        <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extracto</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Breve descripción del post" 
                          className="h-20"
                          {...field} 
                        />
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
                        <ReactQuill 
                          theme="snow" 
                          modules={modules}
                          value={field.value}
                          onChange={(content) => {
                            field.onChange(content);
                            setEditorContent(content);
                          }}
                          className="h-64 mb-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="mt-6">
                  <Button type="submit" disabled={createBlogPostMutation.isPending}>
                    {createBlogPostMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Crear Post
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de posts */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : blogPosts.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {blogPosts.map((post: BlogPost) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {post.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {post.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {format(new Date(post.publishDate), 'dd MMM yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(post)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente este post del blog.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(post.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">No hay posts en el blog todavía</p>
          <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
            Crear el primer post
          </Button>
        </div>
      )}

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar post</DialogTitle>
            <DialogDescription>
              Actualiza la información del post seleccionado.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el título del post" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="titulo-del-post" 
                        {...field} 
                        onChange={(e) => {
                          // Convertir el valor a un formato de URL amigable
                          const value = e.target.value
                            .toLowerCase()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/\s+/g, '-');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese la categoría" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de la imagen</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extracto</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Breve descripción del post" 
                        className="h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido</FormLabel>
                    <FormControl>
                      <ReactQuill 
                        theme="snow" 
                        modules={modules}
                        value={field.value}
                        onChange={field.onChange}
                        className="h-64 mb-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6">
                <Button type="submit" disabled={updateBlogPostMutation.isPending}>
                  {updateBlogPostMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Actualizar Post
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}