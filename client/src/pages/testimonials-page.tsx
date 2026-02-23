import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import type { Testimonial } from "@shared/schema";

export default function TestimonialsPage() {
  const { data: testimonials, isLoading, error } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });
  
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="fas fa-star"></i>);
      } else if (i - 0.5 <= rating) {
        stars.push(<i key={i} className="fas fa-star-half-alt"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star"></i>);
      }
    }
    return stars;
  };
  
  return (
    <>
      <Helmet>
        <title>Testimonios de clientes | Farmacia Fátima Díaz Guillén y Centro Médico Clodina</title>
        <meta name="description" content="Conoce las experiencias y opiniones de nuestros clientes y pacientes que han confiado en nuestros servicios farmacéuticos y médicos." />
      </Helmet>
      
      <PageHeader 
        title="Testimonios de nuestros clientes" 
        description="Opiniones y experiencias compartidas por quienes han confiado en nuestros servicios"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Testimonios", href: "/testimonios", active: true }
        ]}
      />
      
      <section className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="animate-pulse bg-white rounded-lg h-64"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-neutral-700">No se pudieron cargar los testimonios. Por favor, inténtelo más tarde.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials?.map((testimonial, index) => (
              <motion.div 
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <i className="fas fa-user text-xl"></i>
                        </div>
                        <div className="ml-3">
                          <h4 className="font-medium text-neutral-800">{testimonial.name}</h4>
                          <p className="text-sm text-neutral-600">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="text-primary">
                        <i className="fas fa-quote-right text-2xl opacity-50"></i>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex text-yellow-400 mb-2">
                        {renderStars(testimonial.rating)}
                      </div>
                      <p className="text-neutral-700">{testimonial.content}</p>
                    </div>
                    <div className="text-sm text-neutral-500">
                      {new Date(testimonial.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        
        {testimonials && testimonials.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-neutral-700 mb-4">
              ¿Te gustaría compartir tu experiencia con nosotros?
            </p>
            <button 
              className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-md transition duration-300"
              onClick={() => {
                const contactSection = document.getElementById('contacto');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Añadir mi testimonio
            </button>
          </div>
        )}
      </section>
    </>
  );
}