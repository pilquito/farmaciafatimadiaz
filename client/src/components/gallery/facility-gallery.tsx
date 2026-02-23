import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Tipos para nuestras imágenes de galería
interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: string;
  description?: string;
}

// Categorías para filtrar las imágenes
const GALLERY_CATEGORIES = [
  "Todas",
  "Farmacia",
  "Centro Médico",
  "Consultas",
  "Equipamiento"
];

// Imágenes disponibles para nuestra galería
// En un ambiente de producción, estas serían imágenes reales de las instalaciones
const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 1,
    src: "/assets/gallery/logo_farmacia_horizontal.png",
    alt: "Farmacia Fátima Díaz Guillén",
    category: "Farmacia",
    description: "Nuestra farmacia cuenta con instalaciones modernas y un equipo profesional dedicado a ofrecer el mejor servicio."
  },
  {
    id: 2,
    src: "/assets/gallery/logo_farmacia_vertical.png",
    alt: "Área de atención farmacéutica",
    category: "Farmacia",
    description: "Área especializada en atención farmacéutica personalizada con un amplio catálogo de productos y medicamentos."
  },
  {
    id: 3,
    src: "/assets/gallery/logo_clodina_horizontal.png",
    alt: "Centro Médico Clodina",
    category: "Centro Médico",
    description: "El Centro Médico Clodina ofrece atención médica de calidad en un entorno confortable y con la última tecnología."
  },
  {
    id: 4,
    src: "/assets/gallery/logo_clodina_vertical.png",
    alt: "Recepción del Centro Médico",
    category: "Centro Médico",
    description: "Nuestra recepción está diseñada para proporcionar un ambiente acogedor a todos nuestros pacientes."
  },
  {
    id: 5,
    src: "/assets/gallery/logo_clodina_horizontal.png",
    alt: "Consulta de Medicina General",
    category: "Consultas",
    description: "Consultorios equipados con todo lo necesario para ofrecer diagnósticos precisos y tratamientos efectivos."
  },
  {
    id: 6,
    src: "/assets/gallery/logo_clodina_vertical.png",
    alt: "Consulta de Pediatría",
    category: "Consultas",
    description: "Espacio especializado para la atención de nuestros pacientes más pequeños en un ambiente amigable y seguro."
  },
  {
    id: 7,
    src: "/assets/gallery/logo_farmacia_horizontal.png",
    alt: "Zona de Parafarmacia",
    category: "Farmacia",
    description: "Amplia selección de productos de parafarmacia, dermocosméticos y cuidado personal de las mejores marcas."
  },
  {
    id: 8,
    src: "/assets/gallery/logo_clodina_horizontal.png",
    alt: "Equipamiento Médico",
    category: "Equipamiento",
    description: "Contamos con equipamiento de última generación para diagnósticos precisos y tratamientos efectivos."
  }
];

export function FacilityGallery() {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  
  // Filtrar las imágenes según la categoría seleccionada
  const filteredImages = selectedCategory === "Todas"
    ? GALLERY_IMAGES
    : GALLERY_IMAGES.filter(image => image.category === selectedCategory);
  
  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <section className="py-16 bg-gradient-to-b from-white to-neutral-50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">
            Nuestras <span className="text-primary">Instalaciones</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-neutral-700 max-w-2xl mx-auto">
            Conoce nuestras modernas instalaciones diseñadas para ofrecerte la mejor atención 
            farmacéutica y médica. Contamos con espacios confortables y equipamiento de 
            última generación.
          </p>
        </motion.div>
        
        {/* Filtros de categoría */}
        <div className="flex justify-center flex-wrap gap-2 mb-8">
          {GALLERY_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={cn(
                "rounded-full",
                selectedCategory === category
                  ? "bg-primary hover:bg-primary-dark text-white"
                  : "border-primary text-primary hover:bg-primary/10"
              )}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        {/* Galería de imágenes */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {filteredImages.map((image) => (
            <motion.div 
              key={image.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Dialog>
                <DialogTrigger asChild>
                  <div 
                    className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={image.src} 
                        alt={image.alt}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <span className="text-white font-medium">{image.alt}</span>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative h-64 md:h-full overflow-hidden rounded-lg">
                      <img 
                        src={image.src} 
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-neutral-800 mb-2">{image.alt}</h3>
                        <div className="inline-block bg-primary/10 text-primary text-sm px-3 py-1 rounded-full mb-4">
                          {image.category}
                        </div>
                        <p className="text-neutral-600">{image.description}</p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          ))}
        </motion.div>
        
        {filteredImages.length === 0 && (
          <div className="text-center py-10">
            <div className="text-5xl text-neutral-300 mb-4">
              <i className="fas fa-camera-retro"></i>
            </div>
            <h3 className="text-xl font-semibold text-neutral-700 mb-2">
              No hay imágenes en esta categoría
            </h3>
            <p className="text-neutral-500">
              Por favor, selecciona otra categoría para ver más imágenes.
            </p>
          </div>
        )}
        
        {/* Mensaje informativo */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <p className="text-neutral-600">
            Te invitamos a visitar nuestras instalaciones en persona para conocer de primera mano
            la calidad de nuestros servicios. Nuestro equipo estará encantado de mostrarte 
            nuestras instalaciones y resolver cualquier duda que puedas tener.
          </p>
          <div className="mt-6">
            <Button className="bg-primary hover:bg-primary-dark text-white">
              <i className="fas fa-map-marker-alt mr-2"></i>
              Cómo llegar
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}