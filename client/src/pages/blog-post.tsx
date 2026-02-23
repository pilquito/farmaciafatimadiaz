import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@shared/schema";

export default function BlogPostPage() {
  const [, setLocation] = useLocation();
  const { slug } = useParams<{ slug: string }>();
  
  const { data: blogPost, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog/${slug}`],
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-64 bg-neutral-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !blogPost) {
    setTimeout(() => {
      setLocation("/blog");
    }, 3000);
    
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold mb-4">Artículo no encontrado</h1>
        <p className="mb-6">El artículo que está buscando no existe o ha sido eliminado.</p>
        <p className="mb-8">Será redirigido a la página del blog en unos segundos...</p>
        <Link to="/blog">
          <Button className="bg-primary text-white hover:bg-primary-dark">
            Volver al blog
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{blogPost.title} | Farmacia Fátima Díaz Guillén & Centro Médico Clodina</title>
        <meta name="description" content={blogPost.excerpt} />
      </Helmet>
      
      <article className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link to="/blog" className="inline-flex items-center text-primary hover:underline mb-6">
              <i className="fas fa-arrow-left mr-2"></i>
              <span>Volver al blog</span>
            </Link>
            
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">{blogPost.title}</h1>
            
            <div className="flex items-center mb-8">
              <span className="text-sm text-primary font-medium">{blogPost.category}</span>
              <span className="mx-2 text-neutral-400">•</span>
              <span className="text-sm text-neutral-600">{formatDate(blogPost.publishDate)}</span>
            </div>
            
            <div className="mb-8 rounded-lg overflow-hidden">
              <img 
                src={blogPost.imageUrl} 
                alt={blogPost.title} 
                className="w-full h-auto"
              />
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p>{blogPost.content}</p>
              
              {/* Additional sample content for a fuller article */}
              <h2>Introducción</h2>
              <p>
                En este artículo, exploraremos en profundidad el tema de {blogPost.title.toLowerCase()}, 
                proporcionando información valiosa y consejos prácticos para nuestros lectores.
              </p>
              
              <h2>Puntos principales</h2>
              <ul>
                <li>Comprender la importancia de este tema para su salud</li>
                <li>Conocer los factores que influyen y cómo abordarlos</li>
                <li>Recomendaciones profesionales basadas en evidencia científica</li>
                <li>Pasos prácticos que puede seguir en su día a día</li>
              </ul>
              
              <h2>Conclusión</h2>
              <p>
                Mantener una buena salud requiere información adecuada y hábitos consistentes. 
                Esperamos que este artículo le haya proporcionado las herramientas necesarias para mejorar su bienestar.
              </p>
              
              <p>
                Si tiene alguna pregunta adicional, no dude en contactar con nuestros profesionales 
                en la Farmacia Fátima Díaz Guillén o en el Centro Médico Clodina.
              </p>
            </div>
            
            <div className="border-t border-neutral-300 mt-8 pt-8">
              <h3 className="font-serif text-xl font-bold mb-4">Comparte este artículo</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition">
                  <i className="fab fa-whatsapp"></i>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition">
                  <i className="far fa-envelope"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
