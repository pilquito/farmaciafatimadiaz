interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface AssistantResponse {
  response: string;
  suggestions?: string[];
}

// Patrones de respuesta para el asistente virtual
const RESPONSE_PATTERNS = {
  greeting: {
    keywords: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'saludos'],
    responses: [
      'Hola, ¿en qué puedo ayudarte hoy?',
      'Buenos días, ¿cómo puedo asistirte?',
      'Saludos, estoy aquí para ayudarte con cualquier consulta.'
    ],
    suggestions: ['Horarios de atención', 'Pedir cita médica', 'Ubicación']
  },
  
  appointments: {
    keywords: ['cita', 'agendar', 'reservar', 'turno', 'consulta médica'],
    responses: [
      'Puedo ayudarte a agendar una cita médica. Ofrecemos consultas en múltiples especialidades.',
      'Para reservar una cita, puedo dirigirte al formulario de reservas o consultar disponibilidad.',
      'Nuestro centro médico ofrece citas en medicina general, cardiología, pediatría y más especialidades.'
    ],
    suggestions: ['Agendar cita ahora', 'Ver especialidades', 'Horarios disponibles']
  },
  
  pharmacy: {
    keywords: ['medicina', 'medicamento', 'farmacia', 'receta', 'pastilla', 'jarabe'],
    responses: [
      'En nuestra farmacia contamos con una amplia variedad de medicamentos y productos de salud.',
      'Nuestros farmacéuticos están disponibles para asesorarte sobre medicamentos y su uso adecuado.',
      'Dispensamos medicamentos con y sin receta, y ofrecemos seguimiento farmacoterapéutico.'
    ],
    suggestions: ['Ver productos', 'Consulta farmacéutica', 'Horarios farmacia']
  },
  
  location: {
    keywords: ['ubicación', 'dirección', 'dónde están', 'encontrar', 'llegar'],
    responses: [
      'Nos encontramos en una ubicación céntrica y de fácil acceso.',
      'Estamos ubicados en el centro de la ciudad, con fácil acceso en transporte público.',
      'Nuestra dirección y mapa de ubicación están disponibles en la sección de contacto.'
    ],
    suggestions: ['Ver ubicación', 'Cómo llegar', 'Teléfono de contacto']
  },
  
  schedule: {
    keywords: ['horario', 'abierto', 'cerrado', 'hora', 'cuándo'],
    responses: [
      'Nuestros horarios de atención son amplios para tu comodidad.',
      'Estamos abiertos de lunes a sábado con horarios extendidos.',
      'Los horarios pueden variar entre el centro médico y la farmacia.'
    ],
    suggestions: ['Ver horarios completos', 'Horario farmacia', 'Horario consultas']
  },
  
  services: {
    keywords: ['servicio', 'especialidad', 'qué ofrecen', 'tratamiento'],
    responses: [
      'Ofrecemos servicios médicos integrales y farmacéuticos especializados.',
      'Nuestro centro cuenta con múltiples especialidades médicas y servicios complementarios.',
      'Brindamos atención médica de calidad en medicina general y especialidades.'
    ],
    suggestions: ['Ver servicios médicos', 'Servicios farmacia', 'Especialidades']
  },

  farewell: {
    keywords: ['adiós', 'gracias', 'hasta luego', 'chao', 'bye'],
    responses: [
      'Ha sido un placer ayudarte. ¡Que tengas un excelente día!',
      'Gracias por contactarnos. Estamos aquí cuando nos necesites.',
      '¡Hasta pronto! No dudes en volver si tienes más consultas.'
    ],
    suggestions: []
  }
};

// Función para detectar patrones en el mensaje del usuario
function detectPattern(message: string): keyof typeof RESPONSE_PATTERNS | null {
  const lowerMessage = message.toLowerCase();
  
  for (const [patternKey, pattern] of Object.entries(RESPONSE_PATTERNS)) {
    if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return patternKey as keyof typeof RESPONSE_PATTERNS;
    }
  }
  
  return null;
}

// Función para generar respuesta basada en patrones
function generatePatternResponse(pattern: keyof typeof RESPONSE_PATTERNS): AssistantResponse {
  const patternData = RESPONSE_PATTERNS[pattern];
  const randomResponse = patternData.responses[Math.floor(Math.random() * patternData.responses.length)];
  
  return {
    response: randomResponse,
    suggestions: patternData.suggestions
  };
}

// Función para consultar Perplexity AI
async function queryPerplexity(message: string, context: Message[]): Promise<AssistantResponse> {
  try {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY no está configurada');
    }

    // Construir contexto para Perplexity
    const contextMessages = context.slice(-5).map(msg => ({
      role: msg.isBot ? 'assistant' : 'user',
      content: msg.text
    }));

    // Agregar mensaje del sistema para definir el comportamiento
    const systemMessage = {
      role: 'system',
      content: `Eres un asistente virtual de Farmacia Fátima Díaz Guillén y Centro Médico Clodina. 
      Proporciona información útil sobre servicios médicos, farmacéuticos, citas, horarios y salud general.
      Mantén un tono amable y profesional. Si no tienes información específica sobre algo, 
      sugiere contactar directamente al centro.`
    };

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          systemMessage,
          ...contextMessages,
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.2,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Error de Perplexity: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Generar sugerencias basadas en el contexto
    const suggestions = generateContextualSuggestions(message);

    return {
      response: aiResponse,
      suggestions
    };

  } catch (error) {
    console.error('Error al consultar Perplexity:', error);
    throw error;
  }
}

// Función para generar sugerencias contextuales
function generateContextualSuggestions(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('cita') || lowerMessage.includes('consulta')) {
    return ['Agendar cita', 'Ver especialidades', 'Horarios disponibles'];
  }
  
  if (lowerMessage.includes('medicamento') || lowerMessage.includes('farmacia')) {
    return ['Ver productos', 'Consulta farmacéutica', 'Ubicación farmacia'];
  }
  
  if (lowerMessage.includes('horario') || lowerMessage.includes('abierto')) {
    return ['Horarios completos', 'Contacto', 'Ubicación'];
  }
  
  return ['Pedir cita', 'Ver servicios', 'Contactar'];
}

// Función principal del asistente
export async function processAssistantMessage(
  message: string, 
  context: Message[], 
  useAI: boolean = true
): Promise<AssistantResponse> {
  
  // Primero intentar detectar patrones locales
  const detectedPattern = detectPattern(message);
  
  if (detectedPattern) {
    return generatePatternResponse(detectedPattern);
  }
  
  // Si está habilitada la IA y no se encuentra un patrón, usar Perplexity
  if (useAI) {
    try {
      return await queryPerplexity(message, context);
    } catch (error) {
      console.error('Error con Perplexity, usando respuesta por defecto:', error);
      // Fallback a respuesta genérica
      return {
        response: 'Lo siento, no estoy seguro de cómo responder a eso. ¿Podrías ser más específico o elegir una de las opciones disponibles?',
        suggestions: ['Pedir cita médica', 'Ver servicios', 'Contactar', 'Horarios de atención']
      };
    }
  }
  
  // Respuesta por defecto sin IA
  return {
    response: 'Gracias por tu mensaje. Puedo ayudarte con información sobre nuestros servicios médicos, farmacéuticos, citas y horarios. ¿En qué te puedo asistir?',
    suggestions: ['Pedir cita médica', 'Ver servicios', 'Ubicación', 'Horarios']
  };
}