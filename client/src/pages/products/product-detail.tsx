import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRODUCTS, PRODUCT_CATEGORIES } from "@/data/constants";

export default function ProductDetailPage() {
  const { id } = useParams();
  const productId = id ? parseInt(id) : 0;
  
  // Encontrar el producto actual basado en el ID
  const product = PRODUCTS.find(p => p.id === productId);
  
  // Estado para cantidad
  const [quantity, setQuantity] = useState(1);
  
  // Productos relacionados (misma categoría)
  const relatedProducts = product 
    ? PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)
    : [];
  
  // Función para calcular el precio con descuento
  const calculateDiscountedPrice = (price: string, discount: number | null): string => {
    if (!discount) return parseFloat(price).toFixed(2);
    const numPrice = parseFloat(price);
    return (numPrice * (1 - discount / 100)).toFixed(2);
  };
  
  // Obtener el nombre de la categoría
  const getCategoryName = (categoryId: string) => {
    const category = PRODUCT_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };
  
  // Si el producto no existe, mostrar página de error
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Producto no encontrado</h1>
          <p className="mt-4">El producto que estás buscando no existe o ha sido eliminado.</p>
          <Link href="/productos">
            <Button className="mt-6">Volver al catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{product.name} | Farmacia Fátima Díaz Guillén</title>
        <meta name="description" content={product.description.substring(0, 160)} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Migas de pan */}
        <div className="mb-6 text-sm breadcrumbs">
          <ul className="flex items-center space-x-2">
            <li>
              <Link href="/">
                <span className="text-neutral-500 hover:text-primary cursor-pointer">Inicio</span>
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-neutral-400">/</span>
              <Link href="/productos">
                <span className="text-neutral-500 hover:text-primary cursor-pointer">Productos</span>
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-neutral-400">/</span>
              <Link href={`/productos/${product.category}`}>
                <span className="text-neutral-500 hover:text-primary cursor-pointer">{getCategoryName(product.category)}</span>
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-neutral-400">/</span>
              <span className="text-neutral-800 font-medium">{product.name}</span>
            </li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Imagen del producto */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg overflow-hidden shadow-md"
          >
            <div className="relative">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-auto object-cover aspect-square"
              />
              {/* Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {product.discount && product.discount > 0 && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1">
                    -{product.discount}% DESCUENTO
                  </Badge>
                )}
                
                {!product.inStock && (
                  <Badge variant="outline" className="bg-neutral-100 border-neutral-300 text-neutral-600 px-3 py-1">
                    AGOTADO
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Información del producto */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl font-serif font-bold text-neutral-800 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <Link href={`/productos/${product.category}`}>
                <span className="text-sm text-primary hover:underline cursor-pointer">
                  {getCategoryName(product.category)}
                </span>
              </Link>
              <span className="text-neutral-400">•</span>
              <span className="text-sm text-neutral-500">
                {product.inStock ? "En stock" : "Agotado"}
              </span>
            </div>
            
            <div className="mb-6">
              {product.discount && product.discount > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-primary">
                    {calculateDiscountedPrice(product.price, product.discount)}€
                  </span>
                  <span className="text-lg text-neutral-500 line-through">
                    {parseFloat(product.price).toFixed(2)}€
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {parseFloat(product.price).toFixed(2)}€
                </span>
              )}
            </div>
            
            <div className="mb-8">
              <p className="text-neutral-700 leading-relaxed">
                {product.description}
              </p>
            </div>
            
            <div className="flex flex-col gap-6">
              {/* Selector de cantidad */}
              <div className="flex items-center gap-4">
                <span className="text-neutral-700 font-medium">Cantidad:</span>
                <div className="flex items-center border border-neutral-300 rounded-md">
                  <button 
                    className="px-3 py-1 text-neutral-700 hover:bg-neutral-100"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!product.inStock}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="px-4 py-1 border-x border-neutral-300 min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button 
                    className="px-3 py-1 text-neutral-700 hover:bg-neutral-100"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.inStock}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              
              {/* Botón de añadir al carrito */}
              <div className="flex items-center gap-4">
                <Button 
                  className="bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-md flex-1"
                  disabled={!product.inStock}
                >
                  <i className="fas fa-shopping-cart mr-2"></i>
                  {product.inStock ? "Añadir al carrito" : "Producto agotado"}
                </Button>
                
                <Button variant="outline" size="icon" className="rounded-full">
                  <i className="fas fa-heart"></i>
                </Button>
              </div>
              
              {/* Información adicional */}
              <div className="mt-4 border-t border-neutral-200 pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <i className="fas fa-truck text-primary"></i>
                  <span>Envío gratuito en pedidos superiores a 50€</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <i className="fas fa-undo text-primary"></i>
                  <span>Devolución gratuita en 14 días</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <i className="fas fa-lock text-primary"></i>
                  <span>Pago seguro garantizado</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Tabs con información adicional */}
        <Tabs defaultValue="descripcion" className="mb-12">
          <TabsList className="w-full bg-white border-b border-neutral-200">
            <TabsTrigger value="descripcion" className="flex-1">Descripción</TabsTrigger>
            <TabsTrigger value="uso" className="flex-1">Modo de uso</TabsTrigger>
            <TabsTrigger value="ingredientes" className="flex-1">Ingredientes</TabsTrigger>
          </TabsList>
          <TabsContent value="descripcion" className="py-6">
            <div className="prose max-w-none">
              <p>{product.description}</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id.</p>
            </div>
          </TabsContent>
          <TabsContent value="uso" className="py-6">
            <div className="prose max-w-none">
              <h4>Instrucciones de uso</h4>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id.</p>
              <ul>
                <li>Paso 1: Lorem ipsum dolor sit amet</li>
                <li>Paso 2: Consectetur adipiscing elit</li>
                <li>Paso 3: Nulla quam velit, vulputate eu pharetra nec</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="ingredientes" className="py-6">
            <div className="prose max-w-none">
              <h4>Composición</h4>
              <p>Ingredientes principales:</p>
              <ul>
                <li>Ingrediente 1</li>
                <li>Ingrediente 2</li>
                <li>Ingrediente 3</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-serif font-bold mb-6 text-neutral-800">Productos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <motion.div 
                  key={relProduct.id}
                  className="product-card bg-white rounded-lg shadow-md overflow-hidden group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Link href={`/producto/${relProduct.id}`}>
                    <div className="h-52 overflow-hidden relative cursor-pointer">
                      <img 
                        src={relProduct.imageUrl} 
                        alt={relProduct.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-2">
                        {relProduct.discount && relProduct.discount > 0 && (
                          <Badge className="bg-red-500 hover:bg-red-600">
                            -{relProduct.discount}%
                          </Badge>
                        )}
                        
                        {!relProduct.inStock && (
                          <Badge variant="outline" className="bg-neutral-100 border-neutral-300 text-neutral-600">
                            Agotado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <div className="mb-1">
                      <Link href={`/productos/${relProduct.category}`}>
                        <span className="text-xs text-neutral-500 hover:text-primary cursor-pointer">
                          {getCategoryName(relProduct.category)}
                        </span>
                      </Link>
                    </div>
                    
                    <Link href={`/producto/${relProduct.id}`}>
                      <h3 className="font-medium text-neutral-800 mb-2 line-clamp-2 hover:text-primary cursor-pointer">
                        {relProduct.name}
                      </h3>
                    </Link>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        {relProduct.discount && relProduct.discount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">
                              {calculateDiscountedPrice(relProduct.price, relProduct.discount)}€
                            </span>
                            <span className="text-neutral-500 text-sm line-through">
                              {parseFloat(relProduct.price).toFixed(2)}€
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-primary">
                            {parseFloat(relProduct.price).toFixed(2)}€
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        disabled={!relProduct.inStock}
                        title={relProduct.inStock ? "Añadir al carrito" : "Producto agotado"}
                      >
                        <i className="fas fa-shopping-cart"></i>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}