import { useState, useEffect } from "react";
import { useInstagramFeed } from "@/hooks/use-instagram-feed";
import { cn } from "@/lib/utils";

interface InstagramFeedProps {
  className?: string;
}

export function InstagramFeed({ className }: InstagramFeedProps) {
  const { posts, loading, error } = useInstagramFeed();
  
  if (loading) {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="animate-pulse bg-neutral-300 rounded-lg h-64" />
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-700">
          No se pudieron cargar las publicaciones de Instagram. Por favor, inténtelo más tarde.
        </p>
      </div>
    );
  }
  
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {posts.map((post) => (
        <div key={post.id} className="instagram-feed-item overflow-hidden rounded-lg shadow-md relative group">
          <img 
            src={post.imageUrl} 
            alt={post.caption} 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-primary/75 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-center items-center p-4">
            <p className="text-white text-center font-medium mb-3">{post.caption}</p>
            <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-white hover:underline inline-flex items-center">
              <i className="fab fa-instagram mr-2"></i>
              <span>Ver en Instagram</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
