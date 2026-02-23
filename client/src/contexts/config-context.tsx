import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos para la configuración
export interface ContactSettings {
  businessName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  email: string;
  latitude: string;
  longitude: string;
  schedule: string;
  facebook: string;
  instagram: string;
  twitter: string;
}

export interface EmailSettings {
  smtpServer: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
}

export interface SeoSettings {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  googleAnalyticsId: string;
}

export interface CookiesSettings {
  cookiesPolicyText: string;
  privacyPolicyText: string;
  termsConditionsText: string;
}

export interface SecuritySettings {
  enableCaptcha: boolean;
  requireStrongPasswords: boolean;
  maxLoginAttempts: string;
  sessionTimeout: string;
}

export interface AccessibilitySettings {
  enableVoiceNavigation: boolean;
  enableScreenReaderOptimization: boolean;
  enableHighContrast: boolean;
  enableLargeText: boolean;
  enableReducedMotion: boolean;
  enableKeyboardNavigation: boolean;
  voiceCommandsLanguage: string;
}

export interface ConfigContextType {
  contactSettings: ContactSettings;
  emailSettings: EmailSettings;
  seoSettings: SeoSettings;
  cookiesSettings: CookiesSettings;
  securitySettings: SecuritySettings;
  accessibilitySettings: AccessibilitySettings;
  updateContactSettings: (settings: Partial<ContactSettings>) => void;
  updateEmailSettings: (settings: Partial<EmailSettings>) => void;
  updateSeoSettings: (settings: Partial<SeoSettings>) => void;
  updateCookiesSettings: (settings: Partial<CookiesSettings>) => void;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  saveSettings: () => Promise<void>;
}

// Valores por defecto
const defaultContactSettings: ContactSettings = {
  businessName: 'Farmacia Fátima Díaz Guillén',
  address: 'CALLE NICARAGUA 2',
  city: 'Guimar',
  state: 'Tenerife',
  postalCode: '38500',
  phone1: '922 51 21 51',
  phone2: '',
  whatsapp: '922 51 21 51',
  email: 'info@farmaciafatimadiaz.com',
  latitude: '28.3136',
  longitude: '-16.4298',
  schedule: 'Lunes a Viernes: 9:00 - 21:00, Sábados: 9:00 - 14:00',
  facebook: 'https://facebook.com/farmaciadiaz',
  instagram: 'https://instagram.com/farmaciadiaz',
  twitter: 'https://twitter.com/farmaciadiaz'
};

const defaultEmailSettings: EmailSettings = {
  smtpServer: 'smtp.gmail.com',
  smtpPort: '587',
  smtpUser: 'info@farmaciafatimadiaz.com',
  smtpPassword: '••••••••••••',
  fromName: 'Farmacia Fátima Díaz Guillén',
  fromEmail: 'info@farmaciafatimadiaz.com',
  replyToEmail: 'noreply@farmaciafatimadiaz.com'
};

const defaultSeoSettings: SeoSettings = {
  siteName: 'Farmacia Fátima Díaz Guillén & Centro Médico Clodina',
  siteDescription: 'Farmacia y Centro Médico especializado en atención integral de salud en Guadalajara',
  siteKeywords: 'farmacia, medicina, centro médico, consultas, Guadalajara, salud',
  googleAnalyticsId: 'UA-XXXXXXXXX-X'
};

const defaultCookiesSettings: CookiesSettings = {
  cookiesPolicyText: 'Utilizamos cookies propias y de terceros para mejorar su experiencia y nuestros servicios, analizando la navegación en nuestro sitio web. Si continúa navegando, consideramos que acepta su uso.',
  privacyPolicyText: 'En Farmacia Fátima Díaz Guillén y Centro Médico Clodina nos comprometemos a proteger y respetar su privacidad y cumplir con la legislación vigente en materia de protección de datos personales.',
  termsConditionsText: 'Al utilizar nuestro sitio web y servicios, usted acepta cumplir con estos términos y condiciones. Por favor, léalos cuidadosamente antes de utilizar nuestro sitio.'
};

const defaultSecuritySettings: SecuritySettings = {
  enableCaptcha: true,
  requireStrongPasswords: true,
  maxLoginAttempts: '5',
  sessionTimeout: '60'
};

const defaultAccessibilitySettings: AccessibilitySettings = {
  enableVoiceNavigation: true,
  enableScreenReaderOptimization: true,
  enableHighContrast: false,
  enableLargeText: false,
  enableReducedMotion: false,
  enableKeyboardNavigation: true,
  voiceCommandsLanguage: 'es-MX'
};

// Crear el contexto
export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Proveedor del contexto
export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  // Estados para cada grupo de configuración
  const [contactSettings, setContactSettings] = useState<ContactSettings>(
    () => {
      const saved = localStorage.getItem('contactSettings');
      return saved ? JSON.parse(saved) : defaultContactSettings;
    }
  );
  
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(
    () => {
      const saved = localStorage.getItem('emailSettings');
      return saved ? JSON.parse(saved) : defaultEmailSettings;
    }
  );
  
  const [seoSettings, setSeoSettings] = useState<SeoSettings>(
    () => {
      const saved = localStorage.getItem('seoSettings');
      return saved ? JSON.parse(saved) : defaultSeoSettings;
    }
  );
  
  const [cookiesSettings, setCookiesSettings] = useState<CookiesSettings>(
    () => {
      const saved = localStorage.getItem('cookiesSettings');
      return saved ? JSON.parse(saved) : defaultCookiesSettings;
    }
  );
  
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
    () => {
      const saved = localStorage.getItem('securitySettings');
      return saved ? JSON.parse(saved) : defaultSecuritySettings;
    }
  );
  
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(
    () => {
      const saved = localStorage.getItem('accessibilitySettings');
      return saved ? JSON.parse(saved) : defaultAccessibilitySettings;
    }
  );
  
  // Cargar las configuraciones guardadas al inicio
  useEffect(() => {
    // La carga inicial ya se hace en los estados iniciales
  }, []);
  
  // Funciones para actualizar las configuraciones
  const updateContactSettings = (settings: Partial<ContactSettings>) => {
    setContactSettings(prev => ({ ...prev, ...settings }));
  };
  
  const updateEmailSettings = (settings: Partial<EmailSettings>) => {
    setEmailSettings(prev => ({ ...prev, ...settings }));
  };
  
  const updateSeoSettings = (settings: Partial<SeoSettings>) => {
    setSeoSettings(prev => ({ ...prev, ...settings }));
  };
  
  const updateCookiesSettings = (settings: Partial<CookiesSettings>) => {
    setCookiesSettings(prev => ({ ...prev, ...settings }));
  };
  
  const updateSecuritySettings = (settings: Partial<SecuritySettings>) => {
    setSecuritySettings(prev => ({ ...prev, ...settings }));
  };
  
  const updateAccessibilitySettings = (settings: Partial<AccessibilitySettings>) => {
    setAccessibilitySettings(prev => ({ ...prev, ...settings }));
  };
  
  // Función para guardar todas las configuraciones
  const saveSettings = async () => {
    // En un caso real, aquí se enviarían los datos al servidor
    // Por ahora, solo guardamos en localStorage
    localStorage.setItem('contactSettings', JSON.stringify(contactSettings));
    localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
    localStorage.setItem('seoSettings', JSON.stringify(seoSettings));
    localStorage.setItem('cookiesSettings', JSON.stringify(cookiesSettings));
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    localStorage.setItem('accessibilitySettings', JSON.stringify(accessibilitySettings));
    
    // Simular una espera para dar feedback al usuario
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };
  
  const value = {
    contactSettings,
    emailSettings,
    seoSettings,
    cookiesSettings,
    securitySettings,
    accessibilitySettings,
    updateContactSettings,
    updateEmailSettings,
    updateSeoSettings,
    updateCookiesSettings,
    updateSecuritySettings,
    updateAccessibilitySettings,
    saveSettings
  };
  
  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig debe ser usado dentro de un ConfigProvider');
  }
  return context;
};