import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import VirtualConsultation from "@/components/consultations/virtual-consultation";

// Datos de ejemplo de doctores para consultas virtuales
const DOCTORS = [
  {
    id: 1,
    name: "Dra. María López",
    specialty: "Medicina General",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    stars: 4.8,
    reviews: 124,
    available: true,
    nextAvailable: "Hoy",
    consultationTypes: ["chat", "video"],
    biography: "La Dra. María López cuenta con más de 15 años de experiencia en medicina general. Se graduó de la Universidad Nacional con honores y ha trabajado en varios hospitales de prestigio. Su enfoque es la medicina preventiva y el cuidado integral del paciente.",
    education: [
      "Universidad Nacional, Doctorado en Medicina, 2006",
      "Hospital Central, Residencia en Medicina Interna, 2006-2009",
      "Certificación en Medicina Preventiva, 2010"
    ],
    languages: ["Español", "Inglés"],
    availability: {
      monday: ["09:00", "10:00", "11:00", "16:00", "17:00"],
      tuesday: ["09:00", "10:00", "11:00", "16:00", "17:00"],
      wednesday: ["09:00", "10:00", "11:00", "16:00", "17:00"],
      thursday: ["09:00", "10:00", "11:00", "16:00", "17:00"],
      friday: ["09:00", "10:00", "11:00"]
    }
  },
  {
    id: 2,
    name: "Dr. Javier Rodríguez",
    specialty: "Cardiología",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    stars: 4.9,
    reviews: 87,
    available: true,
    nextAvailable: "Mañana",
    consultationTypes: ["video"],
    biography: "El Dr. Javier Rodríguez es cardiólogo especializado en arritmias y enfermedades coronarias. Con 12 años de experiencia, ha realizado investigaciones importantes en el campo de la cardiología preventiva y ha publicado diversos artículos en revistas médicas reconocidas.",
    education: [
      "Universidad Central, Doctorado en Medicina, 2008",
      "Hospital Universitario, Especialidad en Cardiología, 2008-2012",
      "Centro Cardíaco Internacional, Fellowship en Electrofisiología, 2012-2014"
    ],
    languages: ["Español", "Inglés", "Francés"],
    availability: {
      monday: ["09:00", "10:00", "11:00"],
      tuesday: ["09:00", "10:00", "11:00"],
      wednesday: ["14:00", "15:00", "16:00", "17:00"],
      thursday: ["14:00", "15:00", "16:00", "17:00"],
      friday: ["09:00", "10:00", "11:00"]
    }
  },
  {
    id: 3,
    name: "Dra. Ana Martínez",
    specialty: "Pediatría",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    stars: 4.7,
    reviews: 156,
    available: true,
    nextAvailable: "Hoy",
    consultationTypes: ["chat", "video"],
    biography: "La Dra. Ana Martínez es pediatra con enfoque en desarrollo infantil y adolescente. Con 10 años de experiencia, se especializa en el manejo de problemas de crecimiento, trastornos del desarrollo y medicina preventiva pediátrica.",
    education: [
      "Universidad Metropolitana, Doctorado en Medicina, 2010",
      "Hospital Infantil, Especialidad en Pediatría, 2010-2013",
      "Centro de Desarrollo Infantil, Fellowship en Desarrollo Infantil, 2013-2014"
    ],
    languages: ["Español", "Inglés"],
    availability: {
      monday: ["09:00", "10:00", "11:00", "16:00", "17:00"],
      tuesday: ["09:00", "10:00", "11:00", "16:00", "17:00"],
      wednesday: ["09:00", "10:00", "11:00"],
      thursday: ["09:00", "10:00", "11:00"],
      friday: ["09:00", "10:00", "11:00", "16:00", "17:00"]
    }
  },
  {
    id: 4,
    name: "Dr. Carlos Sánchez",
    specialty: "Dermatología",
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
    stars: 4.6,
    reviews: 93,
    available: true,
    nextAvailable: "En 2 días",
    consultationTypes: ["chat", "video"],
    biography: "El Dr. Carlos Sánchez es dermátólogo especializado en dermatología clínica y estética. Cuenta con 8 años de experiencia en el diagnóstico y tratamiento de enfermedades de la piel, así como en procedimientos estéticos no invasivos.",
    education: [
      "Universidad Europea, Doctorado en Medicina, 2012",
      "Instituto Dermatológico, Especialidad en Dermatología, 2012-2016",
      "Certificación en Dermatología Estética, 2017"
    ],
    languages: ["Español", "Inglés", "Portugués"],
    availability: {
      monday: ["14:00", "15:00", "16:00", "17:00"],
      tuesday: ["14:00", "15:00", "16:00", "17:00"],
      wednesday: ["14:00", "15:00", "16:00", "17:00"],
      thursday: ["14:00", "15:00", "16:00", "17:00"],
      friday: ["14:00", "15:00", "16:00"]
    }
  },
  {
    id: 5,
    name: "Dra. Laura Fernández",
    specialty: "Ginecología",
    photo: "https://randomuser.me/api/portraits/women/17.jpg",
    stars: 4.9,
    reviews: 201,
    available: true,
    nextAvailable: "Mañana",
    consultationTypes: ["video"],
    biography: "La Dra. Laura Fernández es ginecóloga con más de 14 años de experiencia. Especializada en salud reproductiva, embarazo de alto riesgo y endocrinología ginecológica. Su enfoque está centrado en el bienestar integral de la mujer en todas las etapas de su vida.",
    education: [
      "Universidad de Medicina, Doctorado en Medicina, 2005",
      "Hospital de la Mujer, Especialidad en Ginecología y Obstetricia, 2005-2009",
      "Centro de Fertilidad, Fellowship en Endocrinología Reproductiva, 2009-2011"
    ],
    languages: ["Español", "Inglés", "Italiano"],
    availability: {
      monday: ["09:00", "10:00", "11:00", "12:00"],
      tuesday: ["09:00", "10:00", "11:00", "12:00"],
      wednesday: ["15:00", "16:00", "17:00", "18:00"],
      thursday: ["15:00", "16:00", "17:00", "18:00"],
      friday: ["09:00", "10:00", "11:00", "12:00"]
    }
  },
  {
    id: 6,
    name: "Dr. Miguel Torres",
    specialty: "Neurología",
    photo: "https://randomuser.me/api/portraits/men/42.jpg",
    stars: 4.8,
    reviews: 78,
    available: true,
    nextAvailable: "Hoy",
    consultationTypes: ["chat"],
    biography: "El Dr. Miguel Torres es neurólogo con 11 años de experiencia, especializado en trastornos del movimiento y enfermedades neurodegenerativas. Ha participado en múltiples estudios clínicos sobre Parkinson y Alzheimer, y es reconocido por su enfoque empático hacia los pacientes.",
    education: [
      "Universidad de Ciencias Médicas, Doctorado en Medicina, 2009",
      "Instituto Neurológico, Especialidad en Neurología, 2009-2013",
      "Centro de Investigación Neurológica, Fellowship en Trastornos del Movimiento, 2013-2015"
    ],
    languages: ["Español", "Inglés"],
    availability: {
      monday: ["10:00", "11:00", "12:00", "13:00"],
      tuesday: ["10:00", "11:00", "12:00", "13:00"],
      wednesday: ["10:00", "11:00", "12:00", "13:00"],
      thursday: ["16:00", "17:00", "18:00", "19:00"],
      friday: ["16:00", "17:00", "18:00", "19:00"]
    }
  }
];

// Componente principal
export default function ConsultaVirtualPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const doctorId = parseInt(id || "0");
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  
  // Verificar si el usuario está autenticado
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/profile'],
    retry: false,
  });
  
  const isAuthenticated = !!user;
  
  // Encontrar el doctor por ID
  const doctor = DOCTORS.find(doc => doc.id === doctorId);
  
  // Estado para el proceso de reserva
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [consultationType, setConsultationType] = useState<string>("video");
  const [reasonForVisit, setReasonForVisit] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [bookingComplete, setBookingComplete] = useState<boolean>(false);
  
  // Verificar si el usuario está autenticado cuando intenta reservar
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuthWarning(true);
    }
  }, [isLoading, isAuthenticated]);
  
  // Si no se encuentra el doctor, mostrar mensaje de error
  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Médico no encontrado</h1>
        <p className="mb-8">No pudimos encontrar el médico que estás buscando.</p>
        <Button onClick={() => navigate("/consultas-virtuales")}>
          Volver a consultas virtuales
        </Button>
      </div>
    );
  }
  
  // Función para obtener los horarios disponibles según el día seleccionado
  const getAvailableTimesForDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return [];
    
    const dayOfWeek = selectedDate.getDay();
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayKey = days[dayOfWeek] as keyof typeof doctor.availability;
    
    return doctor.availability[dayKey] || [];
  };
  
  // Obtener horarios disponibles para el día seleccionado
  const availableTimes = getAvailableTimesForDate(date);
  
  // Manejar la confirmación de la reserva
  const handleConfirmBooking = () => {
    if (!isAuthenticated) {
      setShowAuthWarning(true);
      return;
    }
    
    // Aquí iría la lógica para guardar la reserva en el backend
    // y registrar la cita en el sistema general de citas
    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId,
        doctorName: doctor.name,
        date: date?.toISOString(),
        time,
        type: consultationType,
        reason: reasonForVisit,
        isVirtual: true
      })
    })
    .then(response => {
      if (response.ok) {
        setBookingComplete(true);
        setShowConfirmation(false);
      } else {
        console.error('Error al crear la cita');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };
  
  // Verificar si se puede reservar
  const canBook = date && time && consultationType;
  
  return (
    <>
      <Helmet>
        <title>{doctor.name} - Consulta Virtual | Farmacia Fátima y Centro Médico Clodina</title>
        <meta name="description" content={`Agenda una consulta virtual con ${doctor.name}, especialista en ${doctor.specialty}. Consultas por ${doctor.consultationTypes.join(" o ")}.`} />
      </Helmet>
      
      <AlertDialog open={showAuthWarning} onOpenChange={setShowAuthWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Necesitas iniciar sesión</AlertDialogTitle>
            <AlertDialogDescription>
              Para agendar una consulta virtual, es necesario iniciar sesión o registrarse.
              Las consultas virtuales forman parte de nuestro sistema de citas y requieren 
              una cuenta de usuario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAuthWarning(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/login?redirect=/consulta-virtual/" + doctorId)}>
              Iniciar sesión
            </AlertDialogAction>
            <AlertDialogAction onClick={() => navigate("/registro?redirect=/consulta-virtual/" + doctorId)}>
              Registrarse
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Botón de regreso */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/consultas-virtuales")}
              className="flex items-center text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver a consultas virtuales
            </Button>
          </div>
          
          {/* Perfil del médico */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna de información del doctor */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 w-full bg-gradient-to-r from-primary/80 to-primary">
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                      <Avatar className="h-24 w-24 border-4 border-white">
                        <AvatarImage src={doctor.photo} alt={doctor.name} />
                        <AvatarFallback>{doctor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  
                  <div className="pt-16 pb-6 px-6 text-center">
                    <h1 className="text-2xl font-bold">{doctor.name}</h1>
                    <p className="text-muted-foreground">{doctor.specialty}</p>
                    
                    <div className="flex items-center justify-center mt-2">
                      <div className="flex items-center text-yellow-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-neutral-800">
                          {doctor.stars} ({doctor.reviews} reseñas)
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {doctor.consultationTypes.includes("chat") && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Consulta por Chat
                        </Badge>
                      )}
                      {doctor.consultationTypes.includes("video") && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          Consulta por Video
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-medium mb-2">Idiomas</h3>
                      <div className="flex flex-wrap justify-center gap-2">
                        {doctor.languages.map((language, index) => (
                          <Badge key={index} variant="outline">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-medium mb-2">Próxima disponibilidad</h3>
                      <Badge variant="outline" className="bg-primary/10">
                        {doctor.nextAvailable}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Columna de tabs de información y reserva */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Tabs defaultValue="profile">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="profile">Perfil</TabsTrigger>
                  <TabsTrigger value="education">Educación</TabsTrigger>
                  <TabsTrigger value="book">Reservar</TabsTrigger>
                </TabsList>
                
                {/* Tab de perfil */}
                <TabsContent value="profile" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-bold mb-4">Sobre el médico</h2>
                      <p className="text-neutral-700">{doctor.biography}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Tab de educación */}
                <TabsContent value="education" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-bold mb-4">Formación académica</h2>
                      <ul className="space-y-3">
                        {doctor.education.map((edu, index) => (
                          <li key={index} className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                            <span>{edu}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Tab de reserva */}
                <TabsContent value="book" className="space-y-6">
                  {bookingComplete ? (
                    <VirtualConsultation />
                  ) : (
                    <>
                      {/* Selección de tipo de consulta */}
                      <Card>
                        <CardContent className="pt-6">
                          <h2 className="text-xl font-bold mb-4">Tipo de consulta</h2>
                          
                          <RadioGroup
                            value={consultationType}
                            onValueChange={setConsultationType}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            {doctor.consultationTypes.includes("video") && (
                              <div>
                                <RadioGroupItem
                                  value="video"
                                  id="video"
                                  className="peer sr-only"
                                />
                                <Label
                                  htmlFor="video"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <div className="space-y-1 text-center">
                                    <p className="text-base font-medium leading-none">Videollamada</p>
                                    <p className="text-sm text-muted-foreground">
                                      Consulta cara a cara por videollamada
                                    </p>
                                  </div>
                                </Label>
                              </div>
                            )}
                            
                            {doctor.consultationTypes.includes("chat") && (
                              <div>
                                <RadioGroupItem
                                  value="chat"
                                  id="chat"
                                  className="peer sr-only"
                                />
                                <Label
                                  htmlFor="chat"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  <div className="space-y-1 text-center">
                                    <p className="text-base font-medium leading-none">Chat</p>
                                    <p className="text-sm text-muted-foreground">
                                      Consulta escrita por mensajes de texto
                                    </p>
                                  </div>
                                </Label>
                              </div>
                            )}
                          </RadioGroup>
                        </CardContent>
                      </Card>
                      
                      {/* Selección de fecha y hora */}
                      <Card>
                        <CardContent className="pt-6">
                          <h2 className="text-xl font-bold mb-4">Fecha y hora</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Calendario */}
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Selecciona una fecha</p>
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border"
                                disabled={(date) => {
                                  // Deshabilitar días pasados y fines de semana
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const day = date.getDay();
                                  return date < today || day === 0 || day === 6;
                                }}
                              />
                            </div>
                            
                            {/* Horas disponibles */}
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Selecciona una hora</p>
                              
                              {availableTimes.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                  {availableTimes.map((timeSlot) => (
                                    <Button
                                      key={timeSlot}
                                      variant={time === timeSlot ? "default" : "outline"}
                                      className={time === timeSlot ? "bg-primary" : ""}
                                      onClick={() => setTime(timeSlot)}
                                    >
                                      {timeSlot}
                                    </Button>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-4 text-center border rounded-md">
                                  <p className="text-muted-foreground">No hay horarios disponibles para este día</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Motivo de la consulta */}
                      <Card>
                        <CardContent className="pt-6">
                          <h2 className="text-xl font-bold mb-4">Motivo de la consulta</h2>
                          <Textarea
                            placeholder="Describe brevemente el motivo de tu consulta (opcional)"
                            value={reasonForVisit}
                            onChange={(e) => setReasonForVisit(e.target.value)}
                            className="min-h-[120px]"
                          />
                        </CardContent>
                      </Card>
                      
                      {/* Botón de reserva */}
                      <div className="flex justify-end">
                        <Button 
                          size="lg" 
                          disabled={!canBook}
                          onClick={() => setShowConfirmation(true)}
                        >
                          Reservar consulta
                        </Button>
                      </div>
                      
                      {/* Diálogo de confirmación */}
                      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmar reserva</DialogTitle>
                            <DialogDescription>
                              Estás a punto de reservar una consulta virtual con {doctor.name}.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="flex justify-between">
                              <span className="font-medium">Médico:</span>
                              <span>{doctor.name}</span>
                            </div>
                            <hr className="my-2 border-t border-gray-200" />
                            
                            <div className="flex justify-between">
                              <span className="font-medium">Especialidad:</span>
                              <span>{doctor.specialty}</span>
                            </div>
                            <hr className="my-2 border-t border-gray-200" />
                            
                            <div className="flex justify-between">
                              <span className="font-medium">Tipo de consulta:</span>
                              <span>{consultationType === "video" ? "Videollamada" : "Chat"}</span>
                            </div>
                            <hr className="my-2 border-t border-gray-200" />
                            
                            <div className="flex justify-between">
                              <span className="font-medium">Fecha:</span>
                              <span>{date?.toLocaleDateString()}</span>
                            </div>
                            <hr className="my-2 border-t border-gray-200" />
                            
                            <div className="flex justify-between">
                              <span className="font-medium">Hora:</span>
                              <span>{time}</span>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowConfirmation(false)}>Cancelar</Button>
                            <Button onClick={handleConfirmBooking}>Confirmar reserva</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}