import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Product } from "@shared/schema";

// Esquema para el formulario de producto
const productFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  price: z.string().min(1, "El precio es obligatorio"),
  category: z.string().min(1, "La categoría es obligatoria"),
  imageUrl: z.string().optional(),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true)
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export function ProductsManager() {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Consultar la lista de productos
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  // Categorías únicas para el filtro
  const categories = Array.from(new Set(products.map(product => product.category)));
  
  // Formulario para crear/editar productos
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      featured: false,
      inStock: true
    }
  });
  
  // Cargar datos del producto seleccionado en el formulario
  useEffect(() => {
    if (selectedProduct) {
      form.reset({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price.toString(),
        category: selectedProduct.category,
        imageUrl: selectedProduct.imageUrl || "",
        featured: selectedProduct.featured,
        inStock: selectedProduct.inStock
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: "",
        category: "",
        imageUrl: "",
        featured: false,
        inStock: true
      });
    }
  }, [selectedProduct, form]);
  
  // Mutación para crear un nuevo producto
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await apiRequest("/api/products", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price)
        }),
      });
      
      if (!response.ok) {
        throw new Error("Error al crear el producto");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Producto creado",
        description: "El producto ha sido creado correctamente.",
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutación para actualizar un producto existente
  const updateProductMutation = useMutation({
    mutationFn: async (data: { id: number; formData: ProductFormValues }) => {
      const response = await apiRequest(`/api/products/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...data.formData,
          price: parseFloat(data.formData.price)
        }),
      });
      
      if (!response.ok) {
        throw new Error("Error al actualizar el producto");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado correctamente.",
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutación para eliminar un producto
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/products/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar el producto");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente.",
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Para manejar el envío del formulario
  const handleSubmit = (data: ProductFormValues) => {
    if (selectedProduct) {
      // Actualizar producto existente
      updateProductMutation.mutate({ id: selectedProduct.id, formData: data });
    } else {
      // Crear nuevo producto
      createProductMutation.mutate(data);
    }
  };
  
  // Para manejar la eliminación de un producto
  const handleDelete = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Gestión de Productos</h2>
          <p className="text-neutral-500">Administra el catálogo de productos de la farmacia</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="bg-white border-neutral-200"
            onClick={() => {
              setCategoryFilter("all");
              setSearchQuery("");
            }}
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Restablecer
          </Button>
          
          <Button 
            className="bg-primary hover:bg-primary-dark text-white"
            onClick={() => {
              setSelectedProduct(null);
              setIsEditDialogOpen(true);
            }}
          >
            <i className="fas fa-plus mr-2"></i>
            Nuevo Producto
          </Button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Buscar</label>
          <Input
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-neutral-300"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría</label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="border-neutral-300">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-700">Cargando productos...</p>
        </div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-10 bg-neutral-50 rounded-lg border">
              <div className="text-5xl text-neutral-300 mb-4">
                <i className="fas fa-box-open"></i>
              </div>
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                No hay productos
              </h3>
              <p className="text-neutral-500 mb-6">
                {searchQuery || categoryFilter !== "all" 
                  ? "No se encontraron productos con los filtros aplicados." 
                  : "Añade tu primer producto para empezar a construir tu catálogo."}
              </p>
              <Button 
                className="bg-primary hover:bg-primary-dark text-white"
                onClick={() => {
                  setSelectedProduct(null);
                  setIsEditDialogOpen(true);
                }}
              >
                <i className="fas fa-plus mr-2"></i>
                Añadir Producto
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {product.imageUrl ? (
                            <div className="w-10 h-10 mr-3 rounded bg-neutral-100 overflow-hidden">
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 mr-3 rounded bg-neutral-100 flex items-center justify-center text-neutral-400">
                              <i className="fas fa-image"></i>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-neutral-900">{product.name}</div>
                            <div className="text-xs text-neutral-500 truncate max-w-[250px]">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-neutral-100 text-neutral-800">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                      <TableCell>
                        {product.inStock ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            En stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                            Agotado
                          </Badge>
                        )}
                        {product.featured && (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 ml-2">
                            Destacado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <i className="fas fa-edit text-blue-500"></i>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => {
                              setSelectedProduct(product);
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
      
      {/* Dialog para crear/editar productos */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct 
                ? "Actualiza los detalles del producto seleccionado."
                : "Añade un nuevo producto al catálogo."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del producto</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce el nombre del producto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Introduce la descripción del producto" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="0.00" 
                          {...field} 
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
                        <Input placeholder="Ej. Medicamentos, Cosmética..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de la imagen</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Destacado</FormLabel>
                        <FormDescription className="text-xs">
                          Mostrar este producto en la sección destacada
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="inStock"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>En stock</FormLabel>
                        <FormDescription className="text-xs">
                          Este producto está disponible para la venta
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
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
                  className="bg-primary hover:bg-primary-dark text-white"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                >
                  {(createProductMutation.isPending || updateProductMutation.isPending) ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Guardar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar Producto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-neutral-50 p-3 rounded-md">
            <p className="font-medium text-neutral-800">{selectedProduct?.name}</p>
            <p className="text-sm text-neutral-600">{selectedProduct?.description}</p>
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
              onClick={handleDelete}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? (
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