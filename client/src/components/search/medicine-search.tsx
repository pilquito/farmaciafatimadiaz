import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Tipo para representar un producto
interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  imageUrl: string;
  discount?: number;
  inStock: boolean;
  featured: boolean;
}

export function MedicineSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Obtener todos los productos desde la API
  const { data, isLoading } = useQuery<Product[]>({ 
    queryKey: ['/api/products'],
    staleTime: 60000 // 1 minuto
  });
  
  // Asegurarse de que allProducts siempre es un array
  const allProducts = data || [];
  
  // Filtrar productos según el término de búsqueda
  const filteredProducts = allProducts.filter((product) => 
    searchTerm.trim() !== "" && 
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Calcular precio con descuento
  const calculateDiscountedPrice = (price: string, discount?: number) => {
    if (!discount) return parseFloat(price).toFixed(2);
    const originalPrice = parseFloat(price);
    const discountAmount = originalPrice * (discount / 100);
    return (originalPrice - discountAmount).toFixed(2);
  };

  // Animaciones
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <section className="py-16 bg-gradient-to-b from-white to-neutral-100">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">
            <span className="text-primary">Buscador</span> de Medicamentos
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-neutral-700 max-w-2xl mx-auto">
            Encuentra fácilmente los medicamentos y productos que necesitas. Busca por nombre, categoría o descripción.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">Medicamentos</span>
            <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">Suplementos</span>
            <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">Equipos médicos</span>
            <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">Dermocosméticos</span>
          </div>
        </motion.div>
        
        <div className="max-w-xl mx-auto mb-10">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Buscar medicamentos, suplementos, equipos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-2 border-primary/30 focus:border-primary focus:ring-primary h-12"
            />
            <Button 
              className="bg-primary hover:bg-primary-dark text-white h-12 px-6"
              onClick={() => setSearchTerm(searchTerm)}
            >
              <i className="fas fa-search mr-2"></i>
              Buscar
            </Button>
          </div>
          
          {searchTerm.trim() !== "" && !isLoading && (
            <div className="text-neutral-500 text-sm mt-2">
              Se encontraron {filteredProducts.length} productos para "{searchTerm}"
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-neutral-700">Cargando productos...</p>
          </div>
        ) : (
          <AnimatePresence>
            {searchTerm.trim() !== "" && (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={container}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product: Product) => (
                    <motion.div key={product.id} variants={item} className="h-full">
                      <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 border-primary/10">
                        <div className="relative">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          {product.discount && product.discount > 0 && (
                            <Badge className="absolute top-2 right-2 bg-red-500">
                              -{product.discount}%
                            </Badge>
                          )}
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                              <span className="text-white font-bold text-lg">Agotado</span>
                            </div>
                          )}
                        </div>
                        
                        <CardHeader className="pb-2">
                          <Badge variant="outline" className="mb-2 text-xs">
                            {product.category}
                          </Badge>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                        </CardHeader>
                        
                        <CardContent className="flex-grow">
                          <p className="text-neutral-600 text-sm line-clamp-3">
                            {product.description}
                          </p>
                        </CardContent>
                        
                        <CardFooter className="flex justify-between items-center pt-2">
                          <div className="flex flex-col">
                            {product.discount && product.discount > 0 ? (
                              <>
                                <span className="text-neutral-400 line-through text-sm">
                                  {parseFloat(product.price).toFixed(2)}€
                                </span>
                                <span className="text-primary font-bold">
                                  {calculateDiscountedPrice(product.price, product.discount)}€
                                </span>
                              </>
                            ) : (
                              <span className="text-primary font-bold">{parseFloat(product.price).toFixed(2)}€</span>
                            )}
                          </div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline"
                                className="text-primary border-primary hover:bg-primary hover:text-white"
                                onClick={() => setSelectedProduct(product)}
                              >
                                Ver detalles
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>{product.name}</DialogTitle>
                                <DialogDescription>Detalles completos del producto</DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                  <img 
                                    src={product.imageUrl} 
                                    alt={product.name}
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                </div>
                                <div>
                                  <Badge className="mb-3">{product.category}</Badge>
                                  <p className="text-neutral-700 mb-4">{product.description}</p>
                                  <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                      {product.discount && product.discount > 0 ? (
                                        <>
                                          <span className="text-neutral-400 line-through text-sm">
                                            {parseFloat(product.price).toFixed(2)}€
                                          </span>
                                          <span className="text-primary font-bold text-xl">
                                            {calculateDiscountedPrice(product.price, product.discount)}€
                                          </span>
                                        </>
                                      ) : (
                                        <span className="text-primary font-bold text-xl">{parseFloat(product.price).toFixed(2)}€</span>
                                      )}
                                    </div>
                                    <Badge variant="outline" className={product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                      {product.inStock ? "En stock" : "Agotado"}
                                    </Badge>
                                  </div>
                                  <Button 
                                    className="w-full mt-4 bg-primary text-white hover:bg-primary-dark"
                                    disabled={!product.inStock}
                                  >
                                    {product.inStock ? "Añadir al carrito" : "Agotado"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    className="col-span-full text-center py-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-5xl text-neutral-300 mb-4">
                      <i className="fas fa-search"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                      No se encontraron resultados
                    </h3>
                    <p className="text-neutral-500">
                      No hay productos que coincidan con tu búsqueda. Prueba con otros términos.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        {searchTerm.trim() === "" && (
          <div className="text-center py-10 max-w-md mx-auto">
            <div className="text-5xl text-primary/30 mb-4">
              <i className="fas fa-pills"></i>
            </div>
            <h3 className="text-xl font-semibold text-neutral-700 mb-2">
              Busca productos para tu salud
            </h3>
            <p className="text-neutral-500">
              Introduce un término de búsqueda para encontrar medicamentos, suplementos, equipos médicos y más.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}