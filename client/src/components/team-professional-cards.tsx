import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { type Staff } from "@shared/schema";
import { motion } from "framer-motion";

interface ProfessionalCardProps {
  member: Staff;
  onProfile: (member: Staff) => void;
}

function ProfessionalCard({ member, onProfile }: ProfessionalCardProps) {
  return (
    <Card className="h-full bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
      <div className="relative">
        {/* Header verde característico */}
        <div className="h-24 bg-gradient-to-r from-green-500 to-green-600"></div>
        
        {/* Avatar centrado */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
            <AvatarImage 
              src={member.imageUrl || ""} 
              alt={member.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-gray-200 text-gray-700 text-lg font-semibold">
              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      <CardContent className="pt-14 pb-6 px-6 text-center space-y-4">
        {/* Información básica */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {member.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            {member.role}
          </p>
          {member.specialty && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {member.specialty}
            </p>
          )}
        </div>

        {/* Idiomas */}
        {member.languages && member.languages.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Idiomas
            </p>
            <div className="flex flex-wrap justify-center gap-1">
              {member.languages.slice(0, 2).map((lang, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Botón de acción */}
        <div className="pt-2">
          <Button 
            onClick={() => onProfile(member)}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Ver perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProfessionalDetailProps {
  member: Staff | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ProfessionalDetail({ member, open, onOpenChange }: ProfessionalDetailProps) {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Perfil profesional</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          {/* Header verde */}
          <div className="h-32 bg-gradient-to-r from-green-500 to-green-600 -mx-6 -mt-6 mb-6"></div>
          
          {/* Avatar y info básica */}
          <div className="absolute top-16 left-6 flex items-end space-x-4">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage 
                src={member.imageUrl || ""} 
                alt={member.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-200 text-gray-700 text-xl font-semibold">
                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-white">{member.name}</h1>
              <p className="text-green-100">{member.role}</p>
              {member.specialty && (
                <p className="text-green-200 text-sm">{member.specialty}</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-16 space-y-6">
          {/* Tabs de información */}
          <Tabs defaultValue="perfil" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="perfil">Perfil</TabsTrigger>
              <TabsTrigger value="educacion">Educación</TabsTrigger>
            </TabsList>
            
            <TabsContent value="perfil" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Sobre el profesional</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {member.description || "Sin descripción disponible"}
                </p>
              </div>
              
              {member.languages && member.languages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Idiomas</h3>
                  <div className="flex flex-wrap gap-2">
                    {member.languages.map((lang, idx) => (
                      <Badge key={idx} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="educacion" className="space-y-4">
              {member.education && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Educación</h3>
                  <p className="text-gray-600 dark:text-gray-300">{member.education}</p>
                </div>
              )}
              
              {member.experience && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Experiencia</h3>
                  <p className="text-gray-600 dark:text-gray-300">{member.experience}</p>
                </div>
              )}
              
              {member.certifications && member.certifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Certificaciones</h3>
                  <div className="space-y-2">
                    {member.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600 dark:text-gray-300">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TeamProfessionalCards() {
  const [selectedMember, setSelectedMember] = useState<Staff | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: allStaff = [], isLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff/active"],
    staleTime: 0, // Siempre buscar datos frescos
    cacheTime: 0, // No cachear
  });

  const pharmacyStaff = (allStaff as Staff[]).filter((member: Staff) => member.department === 'farmacia');
  const medicalStaff = (allStaff as Staff[]).filter((member: Staff) => member.department === 'centro_medico');

  const handleProfile = (member: Staff) => {
    setSelectedMember(member);
    setDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Cargando equipo profesional...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header de búsqueda */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Encuentra tu especialista
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Conoce a nuestro equipo de profesionales especializados en salud y farmacia.
          Consulta sus perfiles y formación académica.
        </p>
      </div>

      {/* Filtros por departamento */}
      <Tabs defaultValue="centro_medico" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="centro_medico">
            Centro Médico ({medicalStaff.length})
          </TabsTrigger>
          <TabsTrigger value="farmacia">
            Farmacia ({pharmacyStaff.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="centro_medico" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicalStaff.map((member: Staff, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProfessionalCard
                  member={member}
                  onProfile={handleProfile}
                />
              </motion.div>
            ))}
          </div>
          
          {medicalStaff.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay especialistas disponibles en el centro médico
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="farmacia" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacyStaff.map((member: Staff, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProfessionalCard
                  member={member}
                  onProfile={handleProfile}
                />
              </motion.div>
            ))}
          </div>
          
          {pharmacyStaff.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay especialistas disponibles en farmacia
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de detalle del profesional */}
      <ProfessionalDetail
        member={selectedMember}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}