import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Lista de comandos disponibles
const COMMANDS = {
  home: ['inicio', 'home', 'principal', 'página principal'],
  products: ['productos', 'farmacia', 'medicamentos', 'artículos'],
  services: ['servicios', 'médicos', 'especialidades', 'consultas'],
  blog: ['blog', 'noticias', 'artículos', 'publicaciones'],
  contact: ['contacto', 'contáctanos', 'contactar', 'ubicación'],
  appointments: ['citas', 'agendar cita', 'consulta', 'reservar'],
  search: ['buscar', 'búsqueda', 'encontrar'],
  back: ['atrás', 'regresar', 'volver'],
  help: ['ayuda', 'asistencia', 'comandos']
};

interface VoiceNavigationProps {
  language?: string;
}

const VoiceNavigation: React.FC<VoiceNavigationProps> = ({ 
  language = 'es-MX'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const [, setLocation] = useLocation();
  
  // Iniciar el reconocimiento de voz
  const startListening = useCallback(() => {
    try {
      // @ts-ignore - SpeechRecognition no está en los tipos estándar
      if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        toast({
          title: "Navegación por voz no soportada",
          description: "Tu navegador no soporta el reconocimiento de voz",
          variant: "destructive"
        });
        return;
      }
      
      // @ts-ignore - SpeechRecognition no está en los tipos estándar
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setTranscript(transcript);
        processCommand(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Error de reconocimiento de voz:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } catch (error) {
      console.error('Error al iniciar el reconocimiento de voz:', error);
      toast({
        title: "Error de navegación por voz",
        description: "No se pudo iniciar el reconocimiento de voz",
        variant: "destructive"
      });
      setIsListening(false);
    }
  }, [language]);
  
  // Detener el reconocimiento de voz
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);
  
  // Procesar comandos de voz
  const processCommand = useCallback((command: string) => {
    // Navegación básica
    if (COMMANDS.home.some(keyword => command.includes(keyword))) {
      setLocation('/');
      announceNavigation('Navegando a la página principal');
    } 
    else if (COMMANDS.products.some(keyword => command.includes(keyword))) {
      setLocation('/productos');
      announceNavigation('Navegando a productos');
    }
    else if (COMMANDS.services.some(keyword => command.includes(keyword))) {
      setLocation('/servicios');
      announceNavigation('Navegando a servicios');
    }
    else if (COMMANDS.blog.some(keyword => command.includes(keyword))) {
      setLocation('/blog');
      announceNavigation('Navegando al blog');
    }
    else if (COMMANDS.contact.some(keyword => command.includes(keyword))) {
      setLocation('/contacto');
      announceNavigation('Navegando a contacto');
    }
    else if (COMMANDS.appointments.some(keyword => command.includes(keyword))) {
      setLocation('/citas');
      announceNavigation('Navegando a citas');
    }
    else if (COMMANDS.search.some(keyword => command.includes(keyword))) {
      // Extraer el término de búsqueda
      const searchTerms = command.replace(/buscar|búsqueda|encontrar/gi, '').trim();
      if (searchTerms) {
        setLocation(`/search?q=${encodeURIComponent(searchTerms)}`);
        announceNavigation(`Buscando ${searchTerms}`);
      } else {
        setLocation('/search');
        announceNavigation('Navegando a búsqueda');
      }
    }
    else if (COMMANDS.back.some(keyword => command.includes(keyword))) {
      window.history.back();
      announceNavigation('Regresando a la página anterior');
    }
    else if (COMMANDS.help.some(keyword => command.includes(keyword))) {
      setShowHelp(true);
      announceNavigation('Mostrando ayuda de comandos de voz');
    }
    else {
      announceNavigation('Comando no reconocido, intente nuevamente');
    }
  }, [setLocation]);
  
  // Anunciar para lectores de pantalla
  const announceNavigation = (message: string) => {
    // Crear un elemento para anunciar (ARIA live region)
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Eliminarlo después de anunciarlo
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
    
    // También mostrar un toast para usuarios sin lector de pantalla
    toast({
      title: "Navegación por voz",
      description: message
    });
  };
  
  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end space-y-2">
        <Button
          variant="default"
          size="icon"
          className="rounded-full bg-primary text-primary-foreground shadow-lg"
          onClick={isListening ? stopListening : startListening}
          aria-label={isListening ? "Detener navegación por voz" : "Iniciar navegación por voz"}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        {isListening && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs">
            <p className="text-sm font-medium">{transcript || "Escuchando..."}</p>
          </div>
        )}
        
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white dark:bg-gray-800 shadow-lg"
          onClick={() => setShowHelp(!showHelp)}
          aria-label="Ayuda de comandos de voz"
        >
          <Volume2 className="h-5 w-5" />
        </Button>
      </div>
      
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHelp(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Comandos de voz disponibles</h3>
            <ul className="space-y-2">
              <li><strong>Inicio:</strong> "inicio", "home", "principal"</li>
              <li><strong>Productos:</strong> "productos", "farmacia", "medicamentos"</li>
              <li><strong>Servicios:</strong> "servicios", "médicos", "especialidades"</li>
              <li><strong>Blog:</strong> "blog", "noticias", "artículos"</li>
              <li><strong>Contacto:</strong> "contacto", "contáctanos", "ubicación"</li>
              <li><strong>Citas:</strong> "citas", "agendar cita", "consulta"</li>
              <li><strong>Búsqueda:</strong> "buscar [término]", "búsqueda"</li>
              <li><strong>Regresar:</strong> "atrás", "regresar", "volver"</li>
              <li><strong>Ayuda:</strong> "ayuda", "asistencia", "comandos"</li>
            </ul>
            <Button className="mt-4 w-full" onClick={() => setShowHelp(false)}>Cerrar</Button>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceNavigation;