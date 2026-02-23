import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatDate, truncateText } from "@/lib/utils";
import type { BlogPost } from "@shared/schema";

export function BlogSection() {
  const { data: blogPosts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });
  
  return (
    <section id="blog" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">Blog de Salud</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-neutral-700 max-w-2xl mx-auto">
            Artículos escritos por nuestros profesionales para ayudarle a mantenerse informado sobre temas de salud.
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="animate-pulse bg-neutral-200 rounded-lg h-96"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-neutral-700">No se pudieron cargar los artículos. Por favor, inténtelo más tarde.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts?.slice(0, 3).map((post, index) => (
              <motion.article 
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-xl border border-neutral-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="text-sm text-primary font-medium">{post.category}</span>
                    <span className="mx-2 text-neutral-400">•</span>
                    <span className="text-sm text-neutral-600">{formatDate(post.publishDate)}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3 text-neutral-800">{post.title}</h3>
                  <p className="text-neutral-700 mb-4">{truncateText(post.excerpt, 120)}</p>
                  <Link to={`/blog/${post.slug}`} className="text-primary font-medium hover:underline inline-flex items-center">
                    <span>Leer más</span>
                    <i className="fas fa-long-arrow-alt-right ml-2"></i>
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
        
        <div className="text-center mt-10">
          <Link to="/blog">
            <Button variant="secondary" className="px-6 py-3 bg-neutral-800 text-white hover:bg-neutral-700 inline-flex items-center">
              <span>Ver todos los artículos</span>
              <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
