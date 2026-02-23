import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, isAfter, isBefore, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AvailabilityCalendarProps {
  speciality: string;
  doctor: string;
  onSelectDateAndTime: (date: Date, time: string) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

// Horarios base disponibles
const baseTimeSlots = [
  "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", 
  "12:00", "12:30", "13:00", "13:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
];

// Mock de citas reservadas (en una implementación real, esto vendría del servidor)
const bookedAppointments = [
  { date: "2025-05-26", time: "10:00", speciality: "Medicina General" },
  { date: "2025-05-26", time: "11:30", speciality: "Medicina General" },
  { date: "2025-05-27", time: "17:00", speciality: "Pediatría" },
  { date: "2025-05-28", time: "9:30", speciality: "Cardiología" },
  { date: "2025-05-29", time: "16:00", speciality: "Dermatología" },
];

export function AvailabilityCalendar({
  speciality,
  doctor,
  onSelectDateAndTime,
  selectedDate,
  selectedTime,
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayDates, setDisplayDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<Record<string, TimeSlot[]>>({});
  
  // Consulta para obtener disponibilidad (simulada por ahora)
  const { data: availabilityData, isLoading } = useQuery({
    queryKey: ['appointments/availability', speciality, doctor, currentDate],
    queryFn: async () => {
      // En una implementación real, esto haría una solicitud al servidor
      return generateMockAvailability(currentDate, speciality);
    },
    enabled: !!speciality,
  });
  
  // Generar días a mostrar
  useEffect(() => {
    if (!speciality) return;
    
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Mostrar los próximos 7 días (excluyendo domingos)
    let daysToShow = 0;
    let daysToAdd = 0;
    
    while (daysToShow < 7) {
      const date = addDays(currentDate, daysToAdd);
      
      // Excluir domingos
      if (date.getDay() !== 0) {
        // Solo incluir días a partir de hoy
        if (isAfter(date, today) || isSameDay(date, today)) {
          dates.push(date);
          daysToShow++;
        }
      }
      
      daysToAdd++;
    }
    
    setDisplayDates(dates);
  }, [currentDate, speciality]);
  
  // Generar horarios disponibles cuando cambian las fechas
  useEffect(() => {
    if (!availabilityData || !displayDates.length) return;
    
    const newTimeSlots: Record<string, TimeSlot[]> = {};
    
    // Para cada día, generar los horarios disponibles
    displayDates.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const slots = generateTimeSlotsForDate(date, availabilityData);
      newTimeSlots[dateStr] = slots;
    });
    
    setTimeSlots(newTimeSlots);
  }, [displayDates, availabilityData]);
  
  // Función para ir a la semana anterior
  const goToPreviousWeek = () => {
    // No permitir ir a fechas pasadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const previousWeekDate = addDays(currentDate, -7);
    if (isBefore(previousWeekDate, today)) {
      setCurrentDate(today);
    } else {
      setCurrentDate(previousWeekDate);
    }
  };
  
  // Función para ir a la semana siguiente
  const goToNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };
  
  // Función para seleccionar una fecha y hora
  const handleSelectTimeSlot = (date: Date, time: string) => {
    onSelectDateAndTime(date, time);
  };
  
  // Verificar si una fecha y hora está seleccionada
  const isTimeSlotSelected = (date: Date, time: string) => {
    return selectedDate && 
           selectedTime === time && 
           isSameDay(selectedDate, date);
  };
  
  // Si no hay especialidad seleccionada, mostrar mensaje
  if (!speciality) {
    return (
      <Card className="p-4 text-center">
        <p className="text-neutral-500">
          Selecciona una especialidad para ver la disponibilidad
        </p>
      </Card>
    );
  }
  
  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <Card className="p-4 text-center">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousWeek}
          className="h-8 px-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1">Anterior</span>
        </Button>
        
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="text-sm font-medium">
            {displayDates.length > 0 && 
              `${format(displayDates[0], "d MMM", { locale: es })} - ${format(displayDates[displayDates.length - 1], "d MMM", { locale: es })}`
            }
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextWeek}
          className="h-8 px-2"
        >
          <span className="mr-1">Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {/* Cabeceras de días */}
        {displayDates.map((date) => (
          <div key={`header-${format(date, 'yyyy-MM-dd')}`} className="text-center mb-2">
            <div className="text-xs font-medium text-neutral-500">
              {format(date, 'EEEE', { locale: es })}
            </div>
            <div className="text-sm font-bold">
              {format(date, 'd MMM', { locale: es })}
            </div>
          </div>
        ))}
        
        {/* Columnas de horarios por día */}
        {displayDates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const slots = timeSlots[dateStr] || [];
          
          return (
            <div key={dateStr} className="flex flex-col space-y-1">
              {slots.map((slot) => (
                <Button
                  key={`${dateStr}-${slot.time}`}
                  variant={isTimeSlotSelected(date, slot.time) ? "default" : "outline"}
                  size="sm"
                  disabled={!slot.available}
                  onClick={() => handleSelectTimeSlot(date, slot.time)}
                  className={`
                    text-xs py-1 px-2 h-auto w-full
                    ${!slot.available ? 'bg-neutral-100 text-neutral-400 line-through' : ''}
                    ${isTimeSlotSelected(date, slot.time) ? 'bg-primary text-white' : ''}
                  `}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          );
        })}
      </div>
      
      {/* Leyenda */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-neutral-500">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary rounded-full mr-1"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 border border-neutral-300 rounded-full mr-1"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-neutral-100 rounded-full mr-1"></div>
          <span>No disponible</span>
        </div>
      </div>
    </Card>
  );
}

// Función para generar disponibilidad simulada
function generateMockAvailability(currentDate: Date, speciality: string) {
  // Aquí se haría una llamada al servidor para obtener la disponibilidad real
  // Por ahora, generamos datos simulados
  return {
    speciality,
    bookedSlots: bookedAppointments,
  };
}

// Función para generar horarios para una fecha específica
function generateTimeSlotsForDate(date: Date, availabilityData: any): TimeSlot[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Horarios diferentes para sábados
  const timeSlots = date.getDay() === 6 
    ? baseTimeSlots.filter(time => {
        const [hours] = time.split(':').map(Number);
        return hours < 14; // Solo mañanas para sábados
      })
    : baseTimeSlots;
  
  // Generar slots con disponibilidad
  return timeSlots.map(time => {
    // Verificar si el horario ya pasó (si es hoy)
    const [hours, minutes] = time.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
    
    // Si es hoy y la hora ya pasó, marcar como no disponible
    const isPastTime = isSameDay(date, today) && isBefore(slotDate, now);
    
    // Verificar si el horario está reservado
    const isBooked = availabilityData.bookedSlots.some(
      (slot: any) => 
        slot.date === dateStr && 
        slot.time === time &&
        slot.speciality === availabilityData.speciality
    );
    
    return {
      time,
      available: !isPastTime && !isBooked
    };
  });
}