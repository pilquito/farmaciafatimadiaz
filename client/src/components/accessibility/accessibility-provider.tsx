import { useAccessibility } from '@/contexts/accessibility-context';
import VoiceNavigation from './voice-navigation';
import ScreenReaderOptimization from './screen-reader-optimization';
import { ReactNode, useEffect } from 'react';

// Estilos CSS para las diferentes opciones de accesibilidad
import './accessibility-styles.css';

interface AccessibilityWrapperProps {
  children: ReactNode;
}

/**
 * Componente que integra todas las funcionalidades de accesibilidad
 */
const AccessibilityWrapper: React.FC<AccessibilityWrapperProps> = ({ children }) => {
  const { settings } = useAccessibility();
  
  // Gestionar el enfoque y navegación por teclado
  useEffect(() => {
    if (!settings.keyboardNavigation) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Navegación con Tab
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
      
      // Saltarse al contenido principal con Alt+1
      if (e.key === '1' && e.altKey) {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth' });
        }
      }
      
      // Ir al menú principal con Alt+2
      if (e.key === '2' && e.altKey) {
        e.preventDefault();
        const mainNav = document.querySelector('nav');
        if (mainNav) {
          const firstLink = mainNav.querySelector('a');
          if (firstLink) {
            firstLink.focus();
          }
        }
      }
    };
    
    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [settings.keyboardNavigation]);
  
  return (
    <>
      {/* Optimización para lectores de pantalla */}
      <ScreenReaderOptimization enabled={settings.screenReaderOptimization} />
      
      {/* Navegación por voz */}
      {settings.voiceNavigation && (
        <VoiceNavigation language={settings.voiceCommandsLanguage} />
      )}
      
      {/* Contenido principal */}
      {children}
    </>
  );
};

export default AccessibilityWrapper;