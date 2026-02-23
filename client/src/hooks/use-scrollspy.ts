import { useState, useEffect } from "react";

export function useScrollspy(ids: string[], offset: number = 0): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  useEffect(() => {
    const listener = () => {
      const scroll = window.scrollY;
      
      const elements = ids
        .map((id) => {
          const element = document.getElementById(id);
          if (!element) return { id, top: -1, bottom: -1 };
          
          const rect = element.getBoundingClientRect();
          const top = rect.top + scroll;
          const bottom = rect.bottom + scroll;
          
          return { id, top, bottom };
        })
        .filter(({ top }) => top >= 0);
      
      // Find first element that is on screen or just above
      for (const { id, top, bottom } of elements) {
        if (scroll >= top - offset && scroll <= bottom - offset) {
          setActiveId(id);
          return;
        }
      }
      
      if (elements.length > 0) {
        if (scroll <= elements[0].top) {
          setActiveId(elements[0].id);
        } else {
          setActiveId(elements[elements.length - 1].id);
        }
      }
    };
    
    listener();
    window.addEventListener("scroll", listener);
    
    return () => {
      window.removeEventListener("scroll", listener);
    };
  }, [ids, offset]);
  
  return activeId;
}
