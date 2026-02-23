import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS, PRODUCT_CATEGORIES } from "@/data/constants";

export default function ProductCategoryPage() {
  const { category } = useParams();
  
  // Obtener información de la categoría
  const categoryInfo = PRODUCT_CATEGORIES.find(cat => cat.id === category);
  
  // Filtrar productos por categoría
  const categoryProducts = PRODUCTS.filter(product => product.category === category);
  
  // Función para calcular el precio con descuento
  const calculateDiscountedPrice = (price: string, discount: number | null): string => {
    if (!discount) return parseFloat(price).toFixed(2);
    const numPrice = parseFloat(price);
    return (numPrice * (1 - discount / 100)).toFixed(2);
  };
  
  // Si la categoría no existe
  if (!categoryInfo) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Categoría no encontrada</h1>
          <p className="mt-4">La categoría que estás buscando no existe o ha sido eliminada.</p>
          <Link href="/productos">
            <Button className="mt-6">Ver todas las categorías</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{categoryInfo.name} | Farmacia Fátima Díaz Guillén</title>
        <meta name="description" content={categoryInfo.description} />
      </Helmet>
      
      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
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
                <span className="text-neutral-800 font-medium">{categoryInfo.name}</span>
              </li>
            </ul>
          </div>
          
          {/* Cabecera de la categoría */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
              <i className={`${categoryInfo.icon} text-3xl text-primary`}></i>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-800 font-serif">{categoryInfo.name}</h1>
            <p className="text-neutral-600 max-w-2xl mx-auto">{categoryInfo.description}</p>
          </div>
          
          {/* Lista de productos */}
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categoryProducts.map((product, index) => (
                <motion.div 
                  key={product.id}
                  className="product-card bg-white rounded-lg shadow-md overflow-hidden group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/producto/${product.id}`}>
                    <div className="h-52 overflow-hidden relative cursor-pointer">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-2">
                        {product.discount && product.discount > 0 && (
                          <Badge className="bg-red-500 hover:bg-red-600">
                            -{product.discount}%
                          </Badge>
                        )}
                        
                        {!product.inStock && (
                          <Badge variant="outline" className="bg-neutral-100 border-neutral-300 text-neutral-600">
                            Agotado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <div className="mb-1">
                      <Link href={`/productos/${product.category}`}>
                        <span className="text-xs text-neutral-500 hover:text-primary cursor-pointer">
                          {categoryInfo.name}
                        </span>
                      </Link>
                    </div>
                    
                    <Link href={`/producto/${product.id}`}>
                      <h3 className="font-medium text-neutral-800 mb-2 line-clamp-2 hover:text-primary cursor-pointer">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-neutral-600 text-sm line-clamp-2 mb-3">
                      {product.description.split('.')[0]}
                    </p>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        {product.discount && product.discount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">
                              {calculateDiscountedPrice(product.price, product.discount)}€
                            </span>
                            <span className="text-neutral-500 text-sm line-through">
                              {parseFloat(product.price).toFixed(2)}€
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-primary">
                            {parseFloat(product.price).toFixed(2)}€
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        disabled={!product.inStock}
                        title={product.inStock ? "Añadir al carrito" : "Producto agotado"}
                      >
                        <i className="fas fa-shopping-cart"></i>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-block p-6 rounded-full bg-neutral-100 mb-4">
                <i className="fas fa-box-open text-4xl text-neutral-400"></i>
              </div>
              <h2 className="text-xl font-medium mb-2">No hay productos en esta categoría</h2>
              <p className="text-neutral-500 mb-6">Actualmente no tenemos productos disponibles en esta categoría.</p>
              <Link href="/productos">
                <Button>Ver todas las categorías</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}