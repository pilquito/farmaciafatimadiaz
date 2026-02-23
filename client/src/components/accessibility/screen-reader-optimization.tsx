import { useEffect } from 'react';

interface ScreenReaderOptimizationProps {
  enabled?: boolean;
}

/**
 * Componente para optimizar la experiencia con lectores de pantalla
 * - Mejora la navegación por teclado
 * - Añade atributos ARIA donde sean necesarios
 * - Asegura que los elementos interactivos sean accesibles
 */
const ScreenReaderOptimization: React.FC<ScreenReaderOptimizationProps> = ({ 
  enabled = true 
}) => {
  useEffect(() => {
    if (!enabled) return;

    // Añadir un skiplink para saltar al contenido principal
    const addSkipLink = () => {
      if (document.getElementById('skip-link')) return;
      
      const skipLink = document.createElement('a');
      skipLink.id = 'skip-link';
      skipLink.href = '#main-content';
      skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:outline focus:outline-2 focus:outline-primary';
      skipLink.textContent = 'Saltar al contenido principal';
      
      document.body.insertBefore(skipLink, document.body.firstChild);
      
      // Añadir el id al contenido principal si no existe
      const main = document.querySelector('main');
      if (main && !main.id) {
        main.id = 'main-content';
      }
    };
    
    // Mejorar la accesibilidad de imágenes
    const improveImagesAccessibility = () => {
      const images = document.querySelectorAll('img:not([alt])');
      images.forEach((img: Element) => {
        if (!(img instanceof HTMLImageElement)) return;
        
        // Intentar deducir un texto alternativo a partir del contexto
        const parent = img.parentElement;
        let altText = '';
        
        if (parent?.tagName === 'FIGURE' && parent.querySelector('figcaption')) {
          // Si está en una figura con figcaption, usar el texto del figcaption
          altText = parent.querySelector('figcaption')?.textContent || '';
        } else if (img.src) {
          // Extraer nombre de archivo como último recurso
          const filename = img.src.split('/').pop()?.split('.')[0] || '';
          altText = filename.replace(/[-_]/g, ' ');
        }
        
        img.setAttribute('alt', altText || 'Imagen');
      });
    };
    
    // Mejorar la accesibilidad de formularios
    const improveFormsAccessibility = () => {
      // Asociar inputs con sus labels
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (!input.id || document.querySelector(`label[for="${input.id}"]`)) return;
        
        const nearestLabel = input.closest('div')?.querySelector('label:not([for])');
        if (nearestLabel) {
          nearestLabel.setAttribute('for', input.id);
        }
      });
      
      // Añadir roles y atributos ARIA a elementos de formulario
      document.querySelectorAll('form').forEach(form => {
        if (!form.getAttribute('aria-label') && !form.getAttribute('aria-labelledby')) {
          const heading = form.querySelector('h1, h2, h3, h4, h5, h6');
          if (heading && heading.id) {
            form.setAttribute('aria-labelledby', heading.id);
          } else if (heading) {
            const id = `form-heading-${Math.random().toString(36).substring(2, 9)}`;
            heading.id = id;
            form.setAttribute('aria-labelledby', id);
          } else {
            form.setAttribute('aria-label', 'Formulario');
          }
        }
      });
    };
    
    // Añadir regiones ARIA
    const addAriaLandmarks = () => {
      // Header
      const header = document.querySelector('header:not([role])');
      if (header) {
        header.setAttribute('role', 'banner');
      }
      
      // Nav
      const navs = document.querySelectorAll('nav:not([role])');
      navs.forEach(nav => {
        nav.setAttribute('role', 'navigation');
        if (!nav.getAttribute('aria-label')) {
          nav.setAttribute('aria-label', 'Navegación principal');
        }
      });
      
      // Main
      const main = document.querySelector('main:not([role])');
      if (main) {
        main.setAttribute('role', 'main');
      }
      
      // Footer
      const footer = document.querySelector('footer:not([role])');
      if (footer) {
        footer.setAttribute('role', 'contentinfo');
      }
    };
    
    // Añadir region de anuncios en tiempo real para lectores de pantalla
    const addLiveRegion = () => {
      if (document.getElementById('sr-announcer')) return;
      
      const liveRegion = document.createElement('div');
      liveRegion.id = 'sr-announcer';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      
      document.body.appendChild(liveRegion);
    };
    
    // Función para anunciar mensajes a lectores de pantalla
    window.announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const liveRegion = document.getElementById('sr-announcer');
      if (!liveRegion) return;
      
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = '';
      
      // Pequeño retraso para asegurar que el lector de pantalla lo detecte
      setTimeout(() => {
        liveRegion.textContent = message;
      }, 50);
    };
    
    // Ejecutar todas las optimizaciones
    addSkipLink();
    improveImagesAccessibility();
    improveFormsAccessibility();
    addAriaLandmarks();
    addLiveRegion();
    
    // Hacer un MutationObserver para aplicar estas mejoras cuando cambie el DOM
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Solo volver a ejecutar si se añaden elementos al DOM
          improveImagesAccessibility();
          improveFormsAccessibility();
        }
      }
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return () => {
      observer.disconnect();
      
      // Eliminar el skiplink y la región live al desmontar
      const skipLink = document.getElementById('skip-link');
      if (skipLink) skipLink.remove();
      
      const liveRegion = document.getElementById('sr-announcer');
      if (liveRegion) liveRegion.remove();
      
      // Eliminar la función global
      // @ts-ignore - window.announce puede no estar definido en Window
      delete window.announce;
    };
  }, [enabled]);
  
  // Este componente no renderiza nada visualmente
  return null;
};

export default ScreenReaderOptimization;

// Ampliar la interfaz Window para incluir la función announce
declare global {
  interface Window {
    announce: (message: string, priority?: 'polite' | 'assertive') => void;
  }
}