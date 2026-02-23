import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Stethoscope, Calendar as CalendarIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialtyId: number;
  schedule: string;
  active: boolean;
}

interface Specialty {
  id: number;
  name: string;
  description: string;
}

interface EnhancedAppointmentSelectorProps {
  onAppointmentSelect: (appointmentData: {
    specialtyId: number;
    doctorId: number;
    date: string;
    time: string;
    specialty: string;
    doctor: string;
  }) => void;
}

export default function EnhancedAppointmentSelector({ onAppointmentSelect }: EnhancedAppointmentSelectorProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Obtener especialidades
  const { data: specialties = [] } = useQuery<Specialty[]>({
    queryKey: ["/api/specialties"],
  });

  // Obtener doctores filtrados por especialidad
  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  // Obtener horarios del doctor seleccionado
  const { data: doctorSchedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ["/api/doctors", selectedDoctor, "schedules"],
    queryFn: async () => {
      if (!selectedDoctor) return [];
      const response = await fetch(`/api/doctors/${selectedDoctor}/schedules`);
      if (!response.ok) throw new Error("Failed to fetch doctor schedules");
      return response.json();
    },
    enabled: !!selectedDoctor,
  });

  // Obtener doctores por especialidad cuando se selecciona una
  const filteredDoctors = selectedSpecialty 
    ? doctors.filter(doctor => doctor.specialtyId === selectedSpecialty && doctor.active)
    : [];

  // Obtener horarios disponibles cuando se selecciona doctor y fecha
  const { data: availableSlotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ["/api/doctors", selectedDoctor, "available-slots", selectedDate],
    queryFn: async () => {
      if (!selectedDoctor || !selectedDate) return { availableSlots: [] };
      
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(
        `/api/doctors/${selectedDoctor}/available-slots?date=${dateString}&specialtyId=${selectedSpecialty}`
      );
      if (!response.ok) throw new Error("Failed to fetch available slots");
      return response.json();
    },
    enabled: !!selectedDoctor && !!selectedDate,
  });

  useEffect(() => {
    if (availableSlotsData) {
      setAvailableSlots(availableSlotsData.availableSlots || []);
      setSelectedTime(""); // Reset time selection when slots change
    }
  }, [availableSlotsData]);

  const handleSpecialtyChange = (specialtyId: string) => {
    setSelectedSpecialty(parseInt(specialtyId));
    setSelectedDoctor(null);
    setSelectedDate(undefined);
    setSelectedTime("");
    setAvailableSlots([]);
    setCurrentStep(1);
  };

  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctor(parseInt(doctorId));
    setSelectedDate(undefined);
    setSelectedTime("");
    setAvailableSlots([]);
    setCurrentStep(2);
  };

  const handleNextToDoctor = () => {
    if (selectedSpecialty && filteredDoctors.length > 0) {
      setCurrentStep(2);
    }
  };

  const handleNextToDate = () => {
    if (selectedDoctor) {
      setCurrentStep(3);
    }
  };

  const handleNextToTime = () => {
    if (selectedDate) {
      setCurrentStep(4);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
    setAvailableSlots([]); // Reset available slots when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirmAppointment = () => {
    if (!selectedSpecialty || !selectedDoctor || !selectedDate || !selectedTime) {
      return;
    }

    const specialty = specialties.find(s => s.id === selectedSpecialty);
    const doctor = filteredDoctors.find(d => d.id === selectedDoctor);

    if (specialty && doctor) {
      onAppointmentSelect({
        specialtyId: selectedSpecialty,
        doctorId: selectedDoctor,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        specialty: specialty.name,
        doctor: doctor.name,
      });
    }
  };

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // No domingo ni sábado por defecto
  };

  const isDateAvailable = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return false;
    
    // Si hay horarios del doctor, verificar que trabaje ese día
    if (doctorSchedules && Array.isArray(doctorSchedules)) {
      const dayOfWeek = date.getDay();
      return doctorSchedules.some((schedule: any) => schedule.dayOfWeek === dayOfWeek);
    }
    
    // Si no hay horarios definidos, usar la lógica por defecto
    return isWeekday(date);
  };

  const steps = [
    { number: 1, title: "Especialidad", completed: !!selectedSpecialty },
    { number: 2, title: "Doctor", completed: !!selectedDoctor },
    { number: 3, title: "Fecha", completed: !!selectedDate },
    { number: 4, title: "Horario", completed: !!selectedTime },
  ];

  return (
    <div className="space-y-6">
      {/* Indicador de pasos */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.completed 
                    ? 'bg-primary text-white' 
                    : currentStep === step.number 
                      ? 'bg-primary/20 text-primary border-2 border-primary' 
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.number}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step.completed 
                    ? 'text-primary' 
                    : currentStep === step.number 
                      ? 'text-primary' 
                      : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`mx-4 flex-1 h-0.5 ${
                    step.completed ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Seleccionar Especialidad
          </CardTitle>
          <CardDescription>
            Elige la especialidad médica para tu consulta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleSpecialtyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una especialidad" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((specialty) => (
                <SelectItem key={specialty.id} value={String(specialty.id)}>
                  <div className="flex flex-col">
                    <span className="font-medium">{specialty.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {specialty.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedSpecialty && filteredDoctors.length > 0 && currentStep === 1 && (
            <div className="mt-4">
              <Button onClick={handleNextToDoctor} className="w-full">
                Siguiente: Seleccionar Doctor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSpecialty && filteredDoctors.length > 0 && currentStep >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Seleccionar Doctor
            </CardTitle>
            <CardDescription>
              Elige el profesional para tu consulta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleDoctorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un doctor" />
              </SelectTrigger>
              <SelectContent>
                {filteredDoctors.map((doctor) => {
                  const specialty = specialties.find(s => s.id === doctor.specialtyId);
                  return (
                    <SelectItem key={doctor.id} value={String(doctor.id)}>
                      <div className="flex flex-col">
                        <span className="font-medium">{doctor.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {specialty?.name || "Especialidad no especificada"}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {selectedDoctor && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Días y horarios disponibles:</h4>
                {schedulesLoading && (
                  <p className="text-sm text-gray-600">Cargando horarios...</p>
                )}
                {!schedulesLoading && doctorSchedules && !Array.isArray(doctorSchedules) && (
                  <p className="text-sm text-red-600">Error: Los horarios no son un array</p>
                )}
                {!schedulesLoading && doctorSchedules && Array.isArray(doctorSchedules) && doctorSchedules.length === 0 && (
                  <p className="text-sm text-gray-600">No hay horarios configurados para este doctor</p>
                )}
                {!schedulesLoading && doctorSchedules && Array.isArray(doctorSchedules) && doctorSchedules.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {doctorSchedules.map((schedule: any) => {
                      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                      return (
                        <div key={schedule.id} className="bg-white p-3 rounded border-l-4 border-primary">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-primary">{days[schedule.dayOfWeek]}</span>
                            <span className="text-gray-600">{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            {selectedDoctor && currentStep === 2 && (
              <div className="mt-4">
                <Button onClick={handleNextToDate} className="w-full">
                  Siguiente: Seleccionar Fecha
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedDoctor && currentStep >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Seleccionar Fecha
            </CardTitle>
            <CardDescription>
              Elige el día para tu consulta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => !isDateAvailable(date)}
              locale={es}
              className="rounded-md border"
              fromDate={new Date()}
              toDate={addDays(new Date(), 90)} // Permitir citas hasta 3 meses
            />
            
            {selectedDate && currentStep === 3 && (
              <div className="mt-4">
                <Button onClick={handleNextToTime} className="w-full">
                  Siguiente: Seleccionar Horario
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedDate && selectedDoctor && currentStep >= 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios Disponibles
            </CardTitle>
            <CardDescription>
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {slotsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cargando horarios disponibles...
                  </p>
                </div>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedTime === slot ? "default" : "outline"}
                    onClick={() => handleTimeSelect(slot)}
                    className="h-12"
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No hay horarios disponibles</p>
                  <p className="text-sm">
                    Intenta seleccionar otra fecha o doctor
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedSpecialty && selectedDoctor && selectedDate && selectedTime && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-primary">Resumen de la Cita</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {specialties.find(s => s.id === selectedSpecialty)?.name}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{filteredDoctors.find(d => d.id === selectedDoctor)?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{selectedTime}</span>
            </div>
            <Button 
              onClick={handleConfirmAppointment}
              className="w-full mt-4"
              size="lg"
            >
              Confirmar Selección
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}