import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@shared/schema";

export default function Blog() {
  const { data: blogPosts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });
  
  return (
    <>
      <Helmet>
        <title>Blog de Salud | Farmacia Fátima Díaz Guillén & Centro Médico Clodina</title>
        <meta name="description" content="Artículos escritos por nuestros profesionales para ayudarle a mantenerse informado sobre temas de salud y bienestar." />
      </Helmet>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-neutral-800">Blog de Salud</h1>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-neutral-700 max-w-2xl mx-auto">
              Artículos escritos por nuestros profesionales para ayudarle a mantenerse informado sobre temas de salud y bienestar.
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div key={index} className="animate-pulse bg-neutral-200 rounded-lg h-96"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-neutral-700">No se pudieron cargar los artículos. Por favor, inténtelo más tarde.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts?.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-xl border border-neutral-200">
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
                    <h2 className="font-serif text-xl font-bold mb-3 text-neutral-800">{post.title}</h2>
                    <p className="text-neutral-700 mb-4">{post.excerpt}</p>
                    <Link to={`/blog/${post.slug}`} className="text-primary font-medium hover:underline inline-flex items-center">
                      <span>Leer más</span>
                      <i className="fas fa-long-arrow-alt-right ml-2"></i>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/">
              <Button variant="outline" className="bg-white border-primary text-primary hover:bg-primary hover:text-white">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
