import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PRODUCTS, PRODUCT_CATEGORIES } from "@/data/constants";

export default function ProductSearchPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  
  // Estado para productos filtrados
  const [filteredProducts, setFilteredProducts] = useState(PRODUCTS);
  
  // Rangos de precios para el slider
  const minPrice = 0;
  const maxPrice = 100;
  
  // Función para calcular el precio con descuento
  const calculateDiscountedPrice = (price: string, discount: number | null): string => {
    if (!discount) return parseFloat(price).toFixed(2);
    const numPrice = parseFloat(price);
    return (numPrice * (1 - discount / 100)).toFixed(2);
  };
  
  // Función para aplicar filtros
  useEffect(() => {
    let filtered = [...PRODUCTS];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Filtrar por rango de precio
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      const finalPrice = product.discount 
        ? price * (1 - product.discount / 100) 
        : price;
      return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    });
    
    // Filtrar por disponibilidad
    if (inStockOnly) {
      filtered = filtered.filter(product => product.inStock);
    }
    
    // Filtrar por descuentos
    if (discountOnly) {
      filtered = filtered.filter(product => product.discount && product.discount > 0);
    }
    
    // Ordenar resultados
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = a.discount 
            ? parseFloat(a.price) * (1 - a.discount / 100) 
            : parseFloat(a.price);
          const priceB = b.discount 
            ? parseFloat(b.price) * (1 - b.discount / 100) 
            : parseFloat(b.price);
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = a.discount 
            ? parseFloat(a.price) * (1 - a.discount / 100) 
            : parseFloat(a.price);
          const priceB = b.discount 
            ? parseFloat(b.price) * (1 - b.discount / 100) 
            : parseFloat(b.price);
          return priceB - priceA;
        });
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
      case 'discount':
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      default:
        // Por defecto ordenar por relevancia (basado en coincidencia con el término de búsqueda)
        if (searchTerm) {
          filtered.sort((a, b) => {
            const aNameMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
            const bNameMatch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            return 0;
          });
        }
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, priceRange, inStockOnly, discountOnly, sortBy]);
  
  return (
    <>
      <Helmet>
        <title>Búsqueda de Productos | Farmacia Fátima Díaz Guillén</title>
        <meta name="description" content="Busca entre nuestra amplia gama de productos farmacéuticos y parafarmacéuticos para el cuidado de tu salud." />
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
                <span className="text-neutral-800 font-medium">Búsqueda</span>
              </li>
            </ul>
          </div>
          
          {/* Cabecera */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-800 font-serif">Búsqueda de Productos</h1>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Encuentra entre nuestra amplia gama de productos farmacéuticos y parafarmacéuticos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filtros (columna izquierda) */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="font-bold text-lg mb-4 pb-2 border-b border-neutral-100">Filtros</h2>
                
                {/* Búsqueda por texto */}
                <div className="mb-6">
                  <label className="block text-neutral-700 font-medium mb-2">Buscar</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <i className="fas fa-search text-neutral-400"></i>
                    </div>
                  </div>
                </div>
                
                {/* Filtro por categoría */}
                <div className="mb-6">
                  <label className="block text-neutral-700 font-medium mb-2">Categoría</label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Filtro por rango de precio */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <label className="block text-neutral-700 font-medium">Precio</label>
                    <span className="text-sm text-neutral-500">
                      {priceRange[0]}€ - {priceRange[1]}€
                    </span>
                  </div>
                  <Slider
                    defaultValue={[minPrice, maxPrice]}
                    min={minPrice}
                    max={maxPrice}
                    step={1}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="my-4"
                  />
                </div>
                
                {/* Checkboxes adicionales */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="inStock" 
                      checked={inStockOnly}
                      onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                    />
                    <label
                      htmlFor="inStock"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Solo productos en stock
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="discounted" 
                      checked={discountOnly}
                      onCheckedChange={(checked) => setDiscountOnly(checked as boolean)}
                    />
                    <label
                      htmlFor="discounted"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Solo productos en oferta
                    </label>
                  </div>
                </div>
                
                {/* Ordenación */}
                <div className="mb-4">
                  <label className="block text-neutral-700 font-medium mb-2">Ordenar por</label>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Relevancia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevancia</SelectItem>
                      <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                      <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                      <SelectItem value="newest">Los más nuevos</SelectItem>
                      <SelectItem value="discount">Mayor descuento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Botón de limpiar filtros */}
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setPriceRange([minPrice, maxPrice]);
                    setInStockOnly(false);
                    setDiscountOnly(false);
                    setSortBy('relevance');
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
            
            {/* Resultados (columna derecha) */}
            <div className="lg:col-span-3">
              {/* Resumen de resultados */}
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex justify-between items-center">
                <p className="text-neutral-600">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                </p>
              </div>
              
              {/* Lista de productos */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => (
                    <motion.div 
                      key={product.id}
                      className="product-card bg-white rounded-lg shadow-md overflow-hidden group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
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
                              {PRODUCT_CATEGORIES.find(cat => cat.id === product.category)?.name || product.category}
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
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                  <div className="inline-block p-6 rounded-full bg-neutral-100 mb-4">
                    <i className="fas fa-search text-4xl text-neutral-400"></i>
                  </div>
                  <h2 className="text-xl font-medium mb-2">No se encontraron productos</h2>
                  <p className="text-neutral-500 mb-6">Prueba con otros términos de búsqueda o ajusta los filtros.</p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setPriceRange([minPrice, maxPrice]);
                      setInStockOnly(false);
                      setDiscountOnly(false);
                    }}
                  >
                    Limpiar búsqueda
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}