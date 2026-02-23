import { useState } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ClockIcon, CalendarIcon, MessageCircleIcon, VideoIcon, FileTextIcon, PaperclipIcon, SendIcon } from "lucide-react";

// Simulación de consultas
const CONSULTATIONS = [
  {
    id: 1,
    doctorId: 1,
    doctorName: "Dra. María López",
    doctorSpecialty: "Medicina General",
    doctorPhoto: "https://randomuser.me/api/portraits/women/44.jpg",
    patientName: "Juan Pérez",
    date: "2025-05-25T10:00:00",
    endDate: "2025-05-25T10:30:00",
    type: "video",
    status: "scheduled",
    reason: "Dolor de cabeza persistente y mareos ocasionales",
    diagnosis: "",
    prescription: "",
    notes: "",
    messages: [],
    startTime: null,
    endTime: null
  },
  {
    id: 2,
    doctorId: 3,
    doctorName: "Dra. Ana Martínez",
    doctorSpecialty: "Pediatría",
    doctorPhoto: "https://randomuser.me/api/portraits/women/68.jpg",
    patientName: "María González",
    date: "2025-05-26T15:00:00",
    endDate: "2025-05-26T15:30:00",
    type: "chat",
    status: "scheduled",
    reason: "Control de rutina para mi hijo de 5 años",
    diagnosis: "",
    prescription: "",
    notes: "",
    messages: [],
    startTime: null,
    endTime: null
  },
  {
    id: 3,
    doctorId: 2,
    doctorName: "Dr. Javier Rodríguez",
    doctorSpecialty: "Cardiología",
    doctorPhoto: "https://randomuser.me/api/portraits/men/32.jpg",
    patientName: "Roberto López",
    date: "2025-05-24T11:00:00",
    endDate: "2025-05-24T11:30:00",
    type: "video",
    status: "in-progress",
    reason: "Seguimiento de hipertensión",
    diagnosis: "",
    prescription: "",
    notes: "",
    messages: [
      {
        id: 1,
        sender: "doctor",
        content: "Buenos días Roberto, ¿cómo se ha sentido desde nuestra última consulta?",
        timestamp: "2025-05-24T11:02:00"
      },
      {
        id: 2,
        sender: "patient",
        content: "Buenos días doctor. He estado tomando la medicación como me indicó, pero sigo teniendo algo de presión alta por las mañanas.",
        timestamp: "2025-05-24T11:03:00"
      },
      {
        id: 3,
        sender: "doctor",
        content: "Entiendo. ¿Ha estado monitoreando sus niveles de presión regularmente? ¿Me podría decir los valores que ha registrado?",
        timestamp: "2025-05-24T11:04:00"
      },
      {
        id: 4,
        sender: "patient",
        content: "Sí, he estado tomando medidas todos los días. Por la mañana suele estar alrededor de 145/90, y por la tarde baja a 135/85 aproximadamente.",
        timestamp: "2025-05-24T11:05:00"
      }
    ],
    startTime: "2025-05-24T11:00:00",
    endTime: null
  },
  {
    id: 4,
    doctorId: 4,
    doctorName: "Dr. Carlos Sánchez",
    doctorSpecialty: "Dermatología",
    doctorPhoto: "https://randomuser.me/api/portraits/men/75.jpg",
    patientName: "Laura Martínez",
    date: "2025-05-23T16:00:00",
    endDate: "2025-05-23T16:30:00",
    type: "chat",
    status: "completed",
    reason: "Erupción cutánea en brazos y cuello",
    diagnosis: "Dermatitis atópica leve",
    prescription: "- Crema hidrocortisona 1% aplicar 2 veces al día durante 7 días\n- Loción humectante sin fragancia\n- Evitar jabones con perfumes y detergentes fuertes",
    notes: "Paciente con historial de alergias estacionales. La erupción parece ser una reacción a cambios recientes en productos de higiene personal. Se recomienda cambiar a productos hipoalergénicos.",
    messages: [
      {
        id: 1,
        sender: "doctor",
        content: "Buenas tardes Laura, soy el Dr. Carlos Sánchez. ¿Podría describir la erupción que está experimentando y desde cuándo la tiene?",
        timestamp: "2025-05-23T16:01:00"
      },
      {
        id: 2,
        sender: "patient",
        content: "Buenas tardes doctor. Tengo una erupción roja con pequeños bultos que pica bastante en ambos brazos y en el cuello. Comenzó hace unos 4 días, justo después de usar un nuevo gel de ducha.",
        timestamp: "2025-05-23T16:02:00"
      },
      {
        id: 3,
        sender: "doctor",
        content: "Gracias por la información. ¿Podría enviar una foto de la erupción para que pueda evaluarla mejor?",
        timestamp: "2025-05-23T16:03:00"
      },
      {
        id: 4,
        sender: "patient",
        content: "[Imagen enviada]",
        timestamp: "2025-05-23T16:04:00"
      },
      {
        id: 5,
        sender: "doctor",
        content: "Gracias por la imagen. Basado en lo que veo y en su descripción, parece ser una dermatitis atópica leve, probablemente desencadenada por el nuevo producto que mencionó. Le recetaré una crema con hidrocortisona para aliviar la inflamación y picazón.",
        timestamp: "2025-05-23T16:06:00"
      }
    ],
    startTime: "2025-05-23T16:00:00",
    endTime: "2025-05-23T16:20:00"
  }
];

// Componente para la consulta activa
const ActiveConsultation = ({ consultation }: { consultation: typeof CONSULTATIONS[0] }) => {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  
  // Función para enviar mensaje
  const sendMessage = () => {
    if (!message.trim()) return;
    
    // Aquí iría la lógica para enviar el mensaje al backend
    console.log("Mensaje enviado:", message);
    setMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Información de la consulta */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={consultation.doctorPhoto} alt={consultation.doctorName} />
                <AvatarFallback>{consultation.doctorName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{consultation.doctorName}</CardTitle>
                <p className="text-sm text-muted-foreground">{consultation.doctorSpecialty}</p>
              </div>
            </div>
            <Badge variant={
              consultation.status === 'in-progress' ? 'default' :
              consultation.status === 'completed' ? 'secondary' :
              consultation.status === 'cancelled' ? 'destructive' : 'outline'
            }>
              {consultation.status === 'scheduled' ? 'Programada' :
               consultation.status === 'in-progress' ? 'En progreso' :
               consultation.status === 'completed' ? 'Completada' : 'Cancelada'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <CalendarIcon size={18} className="text-muted-foreground mr-2" />
              <span className="font-medium mr-2">Fecha:</span>
              {new Date(consultation.date).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <ClockIcon size={18} className="text-muted-foreground mr-2" />
              <span className="font-medium mr-2">Hora:</span>
              {new Date(consultation.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center">
              {consultation.type === 'chat' ? (
                <MessageCircleIcon size={18} className="text-muted-foreground mr-2" />
              ) : (
                <VideoIcon size={18} className="text-muted-foreground mr-2" />
              )}
              <span className="font-medium mr-2">Tipo:</span>
              {consultation.type === 'chat' ? 'Chat' : 'Videollamada'}
            </div>
            <div className="flex items-center">
              <ClockIcon size={18} className="text-muted-foreground mr-2" />
              <span className="font-medium mr-2">Inicio:</span>
              {consultation.startTime ? new Date(consultation.startTime).toLocaleString() : 'No iniciada'}
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="font-medium mr-2">Tipo de consulta:</span>
                {consultation.type === 'chat' ? 'Chat' : 'Videollamada'}
              </div>
              <div className="flex items-start">
                <span className="font-medium mr-2">Motivo:</span>
                <span>{consultation.reason}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Área de consulta */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="px-4 py-2 border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              {consultation.type === 'video' && (
                <TabsTrigger value="video">Video</TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent className="flex-grow p-0 overflow-hidden">
          <TabsContent value="chat" className="h-full flex flex-col m-0 p-0">
            {/* Historial de mensajes */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {consultation.messages.length > 0 ? (
                consultation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender === 'patient'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground text-center">
                    No hay mensajes en esta consulta todavía. Comienza la conversación con tu médico.
                  </p>
                </div>
              )}
            </div>
            
            {/* Área de envío de mensajes */}
            {consultation.status === 'in-progress' && (
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribe tu mensaje..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-grow"
                  />
                  <Button variant="outline" size="icon" className="flex-shrink-0">
                    <PaperclipIcon size={18} />
                  </Button>
                  <Button onClick={sendMessage} className="flex-shrink-0">
                    <SendIcon size={18} className="mr-2" />
                    Enviar
                  </Button>
                </div>
              </div>
            )}
            
            {consultation.status === 'completed' && (
              <div className="p-4 border-t bg-muted/50">
                <p className="text-center text-muted-foreground">
                  Esta consulta ha finalizado.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="video" className="h-full m-0 p-0">
            {consultation.type === 'video' && (
              <div className="h-full flex flex-col">
                <div className="flex-grow bg-black relative">
                  <div className="absolute top-0 right-0 m-4 w-1/4 h-1/4 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                    {/* Aquí iría la vista previa del usuario */}
                  </div>
                  <div className="h-full flex items-center justify-center text-white">
                    {consultation.status === 'in-progress' ? (
                      <p>Conectando videollamada...</p>
                    ) : (
                      <p>La videollamada no está disponible</p>
                    )}
                  </div>
                </div>
                
                {consultation.status === 'in-progress' && (
                  <div className="p-4 flex justify-center gap-4">
                    <Button variant="outline" className="rounded-full w-12 h-12 p-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0l-2.828 2.828-1.414-1.414L4.586 16.95m2.828-2.828l-2.828 2.828-1.414-1.414 2.828-2.828" />
                      </svg>
                    </Button>
                    <Button variant="outline" className="rounded-full w-12 h-12 p-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </Button>
                    <Button variant="outline" className="rounded-full w-12 h-12 p-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </Button>
                    <Button variant="destructive" className="rounded-full w-12 h-12 p-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                      </svg>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </CardContent>
        
        {consultation.status === 'completed' && (
          <CardFooter className="border-t p-4 bg-muted/30">
            <div className="w-full space-y-4">
              <div>
                <h3 className="text-lg font-bold flex items-center">
                  <FileTextIcon size={18} className="mr-2" />
                  Resumen de consulta
                </h3>
                <hr className="my-2 border-t border-gray-200" />
              </div>
              
              {consultation.diagnosis && (
                <div>
                  <h4 className="font-medium">Diagnóstico:</h4>
                  <p className="mt-1">{consultation.diagnosis}</p>
                </div>
              )}
              
              {consultation.prescription && (
                <div>
                  <h4 className="font-medium">Receta:</h4>
                  <pre className="mt-1 whitespace-pre-wrap bg-muted p-2 rounded-md text-sm">
                    {consultation.prescription}
                  </pre>
                </div>
              )}
              
              {consultation.notes && (
                <div>
                  <h4 className="font-medium">Notas del médico:</h4>
                  <p className="mt-1">{consultation.notes}</p>
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

// Componente para agendar consulta
const ScheduleConsultation = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Programa tu consulta virtual</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Selecciona el tipo de consulta que deseas realizar, fecha, hora y especialista.
          </p>
          <Button asChild>
            <a href="/consultas-virtuales">
              Ver médicos disponibles
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para historial de consultas
const ConsultationHistory = () => {
  return (
    <div className="space-y-4">
      {CONSULTATIONS.map((consultation) => (
        <motion.div
          key={consultation.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={consultation.doctorPhoto} alt={consultation.doctorName} />
                    <AvatarFallback>{consultation.doctorName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{consultation.doctorName}</CardTitle>
                    <p className="text-xs text-muted-foreground">{consultation.doctorSpecialty}</p>
                  </div>
                </div>
                <Badge variant={
                  consultation.status === 'in-progress' ? 'default' :
                  consultation.status === 'completed' ? 'secondary' :
                  consultation.status === 'cancelled' ? 'destructive' : 'outline'
                }>
                  {consultation.status === 'scheduled' ? 'Programada' :
                  consultation.status === 'in-progress' ? 'En progreso' :
                  consultation.status === 'completed' ? 'Completada' : 'Cancelada'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <CalendarIcon size={14} className="text-muted-foreground mr-2" />
                  {new Date(consultation.date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <ClockIcon size={14} className="text-muted-foreground mr-2" />
                  {new Date(consultation.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center">
                  {consultation.type === 'chat' ? (
                    <MessageCircleIcon size={14} className="text-muted-foreground mr-2" />
                  ) : (
                    <VideoIcon size={14} className="text-muted-foreground mr-2" />
                  )}
                  {consultation.type === 'chat' ? 'Chat' : 'Videollamada'}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a href={`/consulta-virtual/${consultation.doctorId}?consultation=${consultation.id}`}>
                  Ver detalles
                </a>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// Componente principal
export default function VirtualConsultation() {
  const { id } = useParams();
  const consultationId = new URLSearchParams(window.location.search).get('consultation');
  
  // Si hay un ID de consulta, mostrar la consulta activa
  const activeConsultation = consultationId ? 
    CONSULTATIONS.find(c => c.id === parseInt(consultationId)) : 
    CONSULTATIONS.find(c => c.status === 'in-progress');
  
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold mb-4">Consultas Virtuales</h1>
          <p className="text-muted-foreground">
            Accede a tus consultas médicas desde la comodidad de tu hogar. Chatea o realiza videollamadas con nuestros especialistas.
          </p>
        </div>
        
        <Tabs defaultValue={activeConsultation ? "active" : "history"} className="space-y-6">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="active">Consulta Activa</TabsTrigger>
            <TabsTrigger value="schedule">Agendar</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {activeConsultation ? (
              <ActiveConsultation consultation={activeConsultation} />
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <h3 className="text-xl font-bold mb-2">No tienes consultas activas</h3>
                  <p className="text-muted-foreground mb-4">
                    Actualmente no tienes ninguna consulta en progreso. Puedes agendar una nueva consulta o revisar tu historial.
                  </p>
                  <Button asChild>
                    <a href="/consultas-virtuales">Agendar consulta</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="schedule">
            <ScheduleConsultation />
          </TabsContent>
          
          <TabsContent value="history">
            <ConsultationHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}