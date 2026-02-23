import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PRODUCT_CATEGORIES } from "@/data/constants";

interface ProductSearchProps {
  onSearch: (params: SearchParams) => void;
  initialParams?: Partial<SearchParams>;
}

export interface SearchParams {
  query: string;
  categories: string[];
  minPrice: number;
  maxPrice: number;
  onlyInStock: boolean;
  onlyDiscounted: boolean;
}

export function ProductSearch({ onSearch, initialParams }: ProductSearchProps) {
  const [, navigate] = useLocation();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: initialParams?.query || "",
    categories: initialParams?.categories || [],
    minPrice: initialParams?.minPrice || 0,
    maxPrice: initialParams?.maxPrice || 500,
    onlyInStock: initialParams?.onlyInStock || false,
    onlyDiscounted: initialParams?.onlyDiscounted || false,
  });

  // Aplica los cambios de búsqueda después de un timeout para evitar demasiadas llamadas
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchParams);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchParams, onSearch]);

  // Construye la URL de búsqueda
  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    if (searchParams.query) params.append("query", searchParams.query);
    if (searchParams.categories.length) params.append("categories", searchParams.categories.join(","));
    if (searchParams.minPrice > 0) params.append("minPrice", searchParams.minPrice.toString());
    if (searchParams.maxPrice < 500) params.append("maxPrice", searchParams.maxPrice.toString());
    if (searchParams.onlyInStock) params.append("inStock", "true");
    if (searchParams.onlyDiscounted) params.append("discounted", "true");
    
    return `/productos/buscar?${params.toString()}`;
  };
  
  // Maneja cambios en los campos de texto e inputs
  const handleInputChange = (field: keyof SearchParams, value: any) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };
  
  // Maneja cambios en las categorías seleccionadas
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSearchParams(prev => {
      const newCategories = checked 
        ? [...prev.categories, categoryId]
        : prev.categories.filter(id => id !== categoryId);
      
      return { ...prev, categories: newCategories };
    });
  };
  
  // Limpia todos los filtros
  const clearFilters = () => {
    setSearchParams({
      query: "",
      categories: [],
      minPrice: 0,
      maxPrice: 500,
      onlyInStock: false,
      onlyDiscounted: false,
    });
  };
  
  // Envía a página de resultados con los filtros aplicados
  const navigateToSearchResults = () => {
    navigate(buildSearchUrl());
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchParams.query}
            onChange={(e) => handleInputChange("query", e.target.value)}
            className="pr-10"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <i className="fas fa-search text-neutral-400"></i>
          </div>
        </div>
      </div>
      
      <Accordion type="single" collapsible defaultValue="categories">
        <AccordionItem value="categories">
          <AccordionTrigger className="py-2">
            <span className="text-sm font-medium">Categorías</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {PRODUCT_CATEGORIES.map(category => (
                <div key={category.id} className="flex items-center">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={searchParams.categories.includes(category.id)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category.id, checked === true)
                    }
                    className="mr-2"
                  />
                  <label 
                    htmlFor={`category-${category.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="price">
          <AccordionTrigger className="py-2">
            <span className="text-sm font-medium">Precio</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-2">
              <Slider
                defaultValue={[searchParams.minPrice, searchParams.maxPrice]}
                max={500}
                step={5}
                onValueChange={(values) => {
                  handleInputChange("minPrice", values[0]);
                  handleInputChange("maxPrice", values[1]);
                }}
                className="my-6"
              />
              <div className="flex justify-between text-sm text-neutral-600">
                <span>{searchParams.minPrice}€</span>
                <span>{searchParams.maxPrice}€</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="filters">
          <AccordionTrigger className="py-2">
            <span className="text-sm font-medium">Filtros adicionales</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <Checkbox
                  id="in-stock"
                  checked={searchParams.onlyInStock}
                  onCheckedChange={(checked) => 
                    handleInputChange("onlyInStock", checked === true)
                  }
                  className="mr-2"
                />
                <label 
                  htmlFor="in-stock"
                  className="text-sm cursor-pointer"
                >
                  Solo productos en stock
                </label>
              </div>
              
              <div className="flex items-center">
                <Checkbox
                  id="discounted"
                  checked={searchParams.onlyDiscounted}
                  onCheckedChange={(checked) => 
                    handleInputChange("onlyDiscounted", checked === true)
                  }
                  className="mr-2"
                />
                <label 
                  htmlFor="discounted"
                  className="text-sm cursor-pointer"
                >
                  Productos con descuento
                </label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="mt-4 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={clearFilters}
        >
          Limpiar filtros
        </Button>
        
        <Button 
          size="sm"
          className="bg-primary text-white"
          onClick={navigateToSearchResults}
        >
          Ver resultados
        </Button>
      </div>
    </div>
  );
}