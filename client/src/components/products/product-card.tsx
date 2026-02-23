import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  // Función para calcular el precio con descuento
  const calculateDiscountedPrice = (price: string, discount: number | null): string => {
    if (!discount) return price;
    const numPrice = parseFloat(price);
    return (numPrice * (1 - discount / 100)).toFixed(2);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full overflow-hidden group">
        <Link href={`/producto/${product.id}`}>
          <div className="aspect-square relative overflow-hidden bg-neutral-100 cursor-pointer">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <i className="fas fa-image text-4xl"></i>
              </div>
            )}
            
            {/* Etiquetas de descuento, novedad, o sin stock */}
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
        
        <CardContent className="p-4">
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
          
          <div className="flex items-center justify-between mt-2">
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
        </CardContent>
      </Card>
    </motion.div>
  );
}