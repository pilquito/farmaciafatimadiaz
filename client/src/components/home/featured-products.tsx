import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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

export function FeaturedProducts() {
  // Estado para las categorías
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  // Obtener productos desde la API
  const { data: products = [], isLoading, isError } = useQuery({ 
    queryKey: ['/api/products/featured'],
    staleTime: 60000 // 1 minuto
  });
  
  // Extraer categorías únicas de los productos
  useEffect(() => {
    if (products && products.length > 0) {
      const uniqueCategories = Array.from(new Set(products.map((product: Product) => product.category)));
      setCategories(uniqueCategories);
    }
  }, [products]);
  
  // Filtrar productos por categoría
  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter((product: Product) => product.category === activeCategory);
  
  // Animaciones para los productos
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
      transition: { duration: 0.5 }
    }
  };
  
  // Calcular precio con descuento
  const calculateDiscountedPrice = (price: string, discount?: number) => {
    if (!discount) return parseFloat(price).toFixed(2);
    const originalPrice = parseFloat(price);
    const discountAmount = originalPrice * (discount / 100);
    return (originalPrice - discountAmount).toFixed(2);
  };
  
  if (isLoading) {
    return (
      <section id="productos" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">Productos Destacados</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-neutral-700 max-w-2xl mx-auto">
              Cargando productos...
            </p>
          </div>
        </div>
      </section>
    );
  }
  
  if (isError) {
    return (
      <section id="productos" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">Productos Destacados</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-neutral-700 max-w-2xl mx-auto text-red-500">
              Error al cargar los productos. Por favor, intente nuevamente más tarde.
            </p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section id="productos" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">Productos Destacados</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-neutral-700 max-w-2xl mx-auto">
            Descubra nuestra selección de productos de alta calidad, elegidos cuidadosamente para satisfacer sus necesidades de salud y bienestar.
          </p>
        </motion.div>
        
        <div className="mb-8">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="bg-neutral-100">
                <TabsTrigger 
                  value="all" 
                  onClick={() => setActiveCategory("all")}
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Todos
                </TabsTrigger>
                
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category} 
                    value={category} 
                    onClick={() => setActiveCategory(category)}
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <TabsContent value={activeCategory} className="mt-0">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {filteredProducts.map((product: Product) => (
                  <motion.div key={product.id} variants={item} className="h-full">
                    <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                        
                        <Button 
                          className="bg-primary text-white hover:bg-primary-dark"
                          disabled={!product.inStock}
                        >
                          {product.inStock ? "Añadir" : "Agotado"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="text-center">
          <Button variant="secondary" className="px-6 py-3 bg-neutral-800 text-white hover:bg-neutral-700 inline-flex items-center">
            <span>Ver todos los productos</span>
            <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </div>
      </div>
    </section>
  );
}