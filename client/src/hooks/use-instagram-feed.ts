import { useState, useEffect } from "react";

interface InstagramPost {
  id: string;
  permalink: string;
  caption: string;
  imageUrl: string;
  timestamp: string;
}

export function useInstagramFeed() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  
  useEffect(() => {
    // Since we can't actually connect to Instagram without proper API keys,
    // we'll use sample data that would be similar to what the Instagram API returns
    const timeout = setTimeout(() => {
      try {
        const mockPosts: InstagramPost[] = [
          {
            id: '1',
            permalink: 'https://www.instagram.com/',
            caption: 'Nuevos productos de dermocosmética disponibles en nuestra farmacia.',
            imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500',
            timestamp: '2023-05-10T10:00:00Z'
          },
          {
            id: '2',
            permalink: 'https://www.instagram.com/',
            caption: 'Consultas médicas con los mejores especialistas en nuestro centro médico.',
            imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500',
            timestamp: '2023-05-08T14:30:00Z'
          },
          {
            id: '3',
            permalink: 'https://www.instagram.com/',
            caption: 'Consejos para elegir los mejores suplementos vitamínicos según tus necesidades.',
            imageUrl: 'https://pixabay.com/get/gff2199a169f5f836a21d2123b1124ef862626d9103c79305591e70eec6be2d3b8d62ae06d8303232a477241fb1ecccc9397536452497e04c8cc1a4a2767ee619_1280.jpg',
            timestamp: '2023-05-05T09:15:00Z'
          },
          {
            id: '4',
            permalink: 'https://www.instagram.com/',
            caption: 'Nuestros servicios de análisis clínicos para un diagnóstico preciso y rápido.',
            imageUrl: 'https://pixabay.com/get/ge77bdc45a2c5a1f0a6ff6b65aae7a84b2737dc84c674c3af3c1377cdf043c055f4dfa9e3ae7d25e96dbea1cbc87b841ca56937c695b0d73a57f3624cef6aa9b2_1280.jpg',
            timestamp: '2023-05-03T16:45:00Z'
          }
        ];
        
        setPosts(mockPosts);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error fetching Instagram posts'));
        setLoading(false);
      }
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  return { posts, loading, error };
}
