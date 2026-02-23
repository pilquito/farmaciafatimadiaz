import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { Testimonial } from "@shared/schema";

export function Testimonials() {
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
    <section id="testimonios" className="py-16 bg-neutral-200">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">Lo que dicen nuestros clientes</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-neutral-700 max-w-2xl mx-auto">
            Opiniones de nuestros pacientes y clientes que han confiado en nuestros servicios.
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <div key={index} className="animate-pulse bg-white rounded-lg h-64"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-neutral-700">No se pudieron cargar los testimonios. Por favor, inténtelo más tarde.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials?.map((testimonial, index) => (
              <motion.div 
                key={testimonial.id}
                className="testimonial-card bg-white rounded-lg shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
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
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-10">
          <a href="/testimonios" className="inline-flex items-center font-medium text-primary hover:underline">
            <span>Ver más testimonios</span>
            <i className="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
