import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { PRODUCTS, PRODUCT_CATEGORIES } from "@/data/constants";

export function ProductsShelf() {
  const [activeCategory, setActiveCategory] = useState("all");
  
  const filteredProducts = activeCategory === "all" 
    ? PRODUCTS.filter(product => product.featured)
    : PRODUCTS.filter(product => product.category === activeCategory && product.featured);
  
  // Función para calcular el precio con descuento
  const calculateDiscountedPrice = (price: string, discount: number | null): string => {
    if (!discount) return parseFloat(price).toFixed(2);
    const numPrice = parseFloat(price);
    return (numPrice * (1 - discount / 100)).toFixed(2);
  };
  
  return (
    <section id="farmacia" className="py-16 bg-white interactive-shelf">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">Nuestros Productos</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-neutral-700 max-w-2xl mx-auto">
            Explore nuestra amplia selección de productos farmacéuticos y parafarmacéuticos para el cuidado de su salud.
          </p>
        </motion.div>
        
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <button 
            className={`px-4 py-2 rounded-full text-sm transition ${activeCategory === 'all' ? 'bg-primary text-white' : 'bg-neutral-300 text-neutral-800 hover:bg-primary hover:text-white'}`}
            onClick={() => setActiveCategory('all')}
          >
            Destacados
          </button>
          
          {PRODUCT_CATEGORIES.map((category) => (
            <button 
              key={category.id}
              className={`px-4 py-2 rounded-full text-sm transition ${activeCategory === category.id ? 'bg-primary text-white' : 'bg-neutral-300 text-neutral-800 hover:bg-primary hover:text-white'}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div 
              key={product.id}
              className="product-card bg-white rounded-lg shadow-md overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
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
                      {product.category}
                    </span>
                  </Link>
                </div>
                
                <Link href={`/producto/${product.id}`}>
                  <h3 className="font-medium text-neutral-800 mb-2 line-clamp-2 hover:text-primary cursor-pointer">
                    {product.name}
                  </h3>
                </Link>
                
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
        
        <div className="text-center mt-10">
          <Link href="/productos">
            <Button className="px-6 py-3 bg-primary text-white hover:bg-primary-dark inline-flex items-center">
              <span>Ver todos los productos</span>
              <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
