import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CONSULTATIONS } from "@/data/constants";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Helmet } from "react-helmet";

// Lista de médicos disponibles para consultas virtuales
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
    consultationTypes: ["chat", "video"]
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
    consultationTypes: ["video"]
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
    consultationTypes: ["chat", "video"]
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
    consultationTypes: ["chat", "video"]
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
    consultationTypes: ["video"]
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
    consultationTypes: ["chat"]
  }
];

export default function ConsultasVirtualesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // Filtrar médicos según los criterios de búsqueda
  const filteredDoctors = DOCTORS.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "all" ? true : doctor.specialty === selectedSpecialty;
    const matchesType = selectedType === "all" 
      ? true 
      : doctor.consultationTypes.includes(selectedType as "chat" | "video");
      
    return matchesSearch && matchesSpecialty && matchesType;
  });
  
  // Extraer lista de especialidades únicas
  const specialties = Array.from(new Set(DOCTORS.map(doctor => doctor.specialty)));
  
  return (
    <>
      <Helmet>
        <title>Consultas Virtuales | Farmacia Fátima y Centro Médico Clodina</title>
        <meta name="description" content="Consulta con nuestros especialistas en línea a través de chat o videollamada desde la comodidad de tu hogar." />
      </Helmet>
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">
              Consultas Médicas Virtuales
            </h1>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-neutral-700 max-w-2xl mx-auto">
              Consulta con nuestros médicos especialistas desde la comodidad de tu hogar. 
              Elige entre consultas por chat o videollamada según tus necesidades.
            </p>
          </motion.div>
          
          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Encuentra tu especialista</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium mb-1">
                  Buscar por nombre
                </label>
                <Input 
                  id="search"
                  type="text" 
                  placeholder="Buscar médico..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium mb-1">
                  Especialidad
                </label>
                <Select 
                  value={selectedSpecialty} 
                  onValueChange={setSelectedSpecialty}
                >
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Todas las especialidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las especialidades</SelectItem>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-1">
                  Tipo de consulta
                </label>
                <Select 
                  value={selectedType} 
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Cualquier tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquier tipo</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="video">Videollamada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Lista de médicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                            <img 
                              src={doctor.photo} 
                              alt={doctor.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{doctor.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                            <div className="flex items-center mt-1">
                              <div className="flex items-center text-yellow-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="ml-1 text-sm text-neutral-800">
                                  {doctor.stars} ({doctor.reviews})
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20">
                            Próxima disponibilidad: {doctor.nextAvailable}
                          </Badge>
                          {doctor.consultationTypes.includes("chat") && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                              Chat
                            </Badge>
                          )}
                          {doctor.consultationTypes.includes("video") && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                              Videollamada
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Link to={`/consulta-virtual/${doctor.id}`}>
                            <Button className="w-full">
                              Ver perfil y agendar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12 mx-auto text-muted-foreground mb-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <h3 className="text-xl font-bold mb-2">No se encontraron médicos</h3>
                <p className="text-muted-foreground">
                  No hay médicos disponibles que coincidan con tus criterios de búsqueda.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSpecialty("");
                    setSelectedType("");
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}