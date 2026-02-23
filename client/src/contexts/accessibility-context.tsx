import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AccessibilitySettings {
  voiceNavigation: boolean;
  screenReaderOptimization: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  voiceCommandsLanguage: string;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  voiceNavigation: false,
  screenReaderOptimization: true, // Habilitado por defecto
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  keyboardNavigation: true, // Habilitado por defecto
  voiceCommandsLanguage: 'es-MX',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility debe ser usado dentro de un AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Intentar cargar la configuración guardada
    const savedSettings = localStorage.getItem('accessibilitySettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Aplicar las configuraciones cuando cambien
  useEffect(() => {
    // Guardar configuración en localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));

    // Aplicar configuraciones al DOM
    const htmlElement = document.documentElement;
    
    // Alto contraste
    if (settings.highContrast) {
      htmlElement.classList.add('high-contrast');
    } else {
      htmlElement.classList.remove('high-contrast');
    }
    
    // Texto grande
    if (settings.largeText) {
      htmlElement.classList.add('large-text');
    } else {
      htmlElement.classList.remove('large-text');
    }
    
    // Movimiento reducido
    if (settings.reducedMotion) {
      htmlElement.classList.add('reduced-motion');
    } else {
      htmlElement.classList.remove('reduced-motion');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;