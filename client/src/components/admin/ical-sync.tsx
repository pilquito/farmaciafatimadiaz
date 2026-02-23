import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, DownloadIcon, LinkIcon, RefreshCwIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Doctor {
  id: number;
  name: string;
  email: string;
  specialty: string;
}

interface Specialty {
  id: number;
  name: string;
  description: string;
}

export function ICalSync() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const { toast } = useToast();

  // Obtener doctores
  const { data: doctors = [], isLoading: loadingDoctors } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });

  // Obtener especialidades
  const { data: specialties = [], isLoading: loadingSpecialties } = useQuery<Specialty[]>({
    queryKey: ['/api/specialties'],
  });

  // Obtener URLs de suscripción
  const { data: subscriptionUrls, isLoading: loadingUrls } = useQuery({
    queryKey: ['/api/ical/subscription-urls'],
    select: (data: any) => data,
  });

  const generateDownloadUrl = () => {
    const baseUrl = '/api/ical/calendar.ics';
    const params = new URLSearchParams();

    if (selectedDoctor !== "all") {
      params.append('doctorId', selectedDoctor);
    }

    if (selectedSpecialty !== "all") {
      params.append('specialtyId', selectedSpecialty);
    }

    if (fromDate) {
      params.append('from', fromDate);
    }

    if (toDate) {
      params.append('to', toDate);
    }

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  const generateDoctorUrl = (doctorId: number) => {
    return `/api/ical/doctor/${doctorId}/calendar.ics`;
  };

  const handleDownload = () => {
    const url = generateDownloadUrl();
    window.open(url, '_blank');
    
    toast({
      title: "Descarga iniciada",
      description: "El archivo de calendario se está descargando.",
    });
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast({
        title: "URL copiada",
        description: "La URL de suscripción ha sido copiada al portapapeles.",
      });
    });
  };

  const clearFilters = () => {
    setSelectedDoctor("all");
    setSelectedSpecialty("all");
    setFromDate("");
    setToDate("");
  };

  if (loadingDoctors || loadingSpecialties || loadingUrls) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-2">Cargando datos de sincronización...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <CalendarIcon className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Sincronización iCal</h2>
      </div>

      {/* Filtros y descarga personalizada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DownloadIcon className="h-5 w-5" />
            <span>Descargar Calendario Personalizado</span>
          </CardTitle>
          <CardDescription>
            Personaliza los filtros y descarga un archivo iCal con las citas específicas que necesites.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="doctor-select">Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los doctores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los doctores</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={String(doctor.id)}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="specialty-select">Especialidad</Label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las especialidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las especialidades</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.id} value={String(specialty.id)}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="from-date">Desde</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="to-date">Hasta</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={handleDownload} className="flex items-center space-x-2">
              <DownloadIcon className="h-4 w-4" />
              <span>Descargar iCal</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleCopyUrl(generateDownloadUrl())}
              className="flex items-center space-x-2"
            >
              <LinkIcon className="h-4 w-4" />
              <span>Copiar URL</span>
            </Button>

            <Button variant="ghost" onClick={clearFilters} className="flex items-center space-x-2">
              <RefreshCwIcon className="h-4 w-4" />
              <span>Limpiar filtros</span>
            </Button>
          </div>

          {/* Filtros activos */}
          {(selectedDoctor !== "all" || selectedSpecialty !== "all" || fromDate || toDate) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-neutral-600">Filtros activos:</span>
              {selectedDoctor !== "all" && (
                <Badge variant="secondary">
                  Doctor: {doctors.find(d => d.id === parseInt(selectedDoctor))?.name}
                </Badge>
              )}
              {selectedSpecialty !== "all" && (
                <Badge variant="secondary">
                  Especialidad: {specialties.find(s => s.id === parseInt(selectedSpecialty))?.name}
                </Badge>
              )}
              {fromDate && (
                <Badge variant="secondary">Desde: {fromDate}</Badge>
              )}
              {toDate && (
                <Badge variant="secondary">Hasta: {toDate}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* URLs de suscripción permanente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LinkIcon className="h-5 w-5" />
            <span>URLs de Suscripción</span>
          </CardTitle>
          <CardDescription>
            Estas URLs se pueden usar para suscribirse al calendario desde aplicaciones como Google Calendar, Apple Calendar, o Outlook.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL principal */}
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Calendario completo</h4>
                <p className="text-sm text-neutral-600">Todas las citas del centro médico</p>
                <code className="text-xs bg-white px-2 py-1 rounded mt-1 block">
                  {window.location.origin}/api/ical/calendar.ics
                </code>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCopyUrl('/api/ical/calendar.ics')}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* URLs por doctor */}
          <div>
            <h4 className="font-medium mb-3">Calendarios por doctor</h4>
            <div className="space-y-2">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded">
                  <div>
                    <span className="font-medium">{doctor.name}</span>
                    <span className="ml-2 text-sm text-neutral-600">({doctor.specialty})</span>
                    <code className="text-xs bg-white px-2 py-1 rounded mt-1 block">
                      {window.location.origin}{generateDoctorUrl(doctor.id)}
                    </code>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(generateDoctorUrl(doctor.id), '_blank')}
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyUrl(generateDoctorUrl(doctor.id))}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>Cómo usar la sincronización iCal</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Google Calendar</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Abre Google Calendar</li>
                <li>En el panel izquierdo, haz clic en "+"</li>
                <li>Selecciona "Desde URL"</li>
                <li>Pega la URL copiada</li>
                <li>Haz clic en "Agregar calendario"</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Apple Calendar</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Abre la app Calendar</li>
                <li>Ve a Archivo → Nueva suscripción a calendario</li>
                <li>Pega la URL copiada</li>
                <li>Haz clic en "Suscribirse"</li>
                <li>Configura las opciones de actualización</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Microsoft Outlook</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Abre Outlook</li>
                <li>Ve a Archivo → Administrar cuenta → Configuración de cuenta</li>
                <li>En la pestaña "Calendarios de Internet", haz clic en "Nuevo"</li>
                <li>Pega la URL copiada</li>
                <li>Haz clic en "Agregar"</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Notas importantes</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Los calendarios se actualizan automáticamente cada hora</li>
                <li>Los cambios en las citas aparecerán en los calendarios suscritos</li>
                <li>Las URLs son permanentes y no caducan</li>
                <li>Puedes compartir las URLs con otros miembros del equipo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}