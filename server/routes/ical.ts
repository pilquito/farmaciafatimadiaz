import { Router } from 'express';
import { db } from '../db';
import { appointments, doctors, specialties } from '../../shared/schema';
import { eq, gte, and } from 'drizzle-orm';
import { generateICalEvent, generateICalCalendar } from '../utils/ical-generator';

const router = Router();

// Generar calendario iCal para todas las citas
router.get('/calendar.ics', async (req, res) => {
  try {
    const fromDate = req.query.from as string;
    const toDate = req.query.to as string;
    const doctorId = req.query.doctorId as string;
    const specialtyId = req.query.specialtyId as string;

    // Obtener citas con filtros aplicados
    let whereConditions: any[] = [];
    
    if (fromDate) {
      whereConditions.push(gte(appointments.date, fromDate));
    }

    if (doctorId && doctorId !== 'all') {
      whereConditions.push(eq(appointments.doctorId, parseInt(doctorId)));
    }

    if (specialtyId && specialtyId !== 'all') {
      whereConditions.push(eq(appointments.specialtyId, parseInt(specialtyId)));
    }

    const appointmentsList = whereConditions.length > 0 
      ? await db.select().from(appointments).where(and(...whereConditions))
      : await db.select().from(appointments);

    // Obtener información de doctores y especialidades
    const doctorsList = await db.select().from(doctors);
    const specialtiesList = await db.select().from(specialties);

    // Crear mapa para búsqueda rápida
    const doctorsMap = new Map(doctorsList.map(d => [d.id, d]));
    const specialtiesMap = new Map(specialtiesList.map(s => [s.id, s]));

    // Generar eventos iCal
    const events = [];
    
    for (const appointment of appointmentsList) {
      const doctor = appointment.doctorId ? doctorsMap.get(appointment.doctorId) : null;
      const specialty = appointment.specialtyId ? specialtiesMap.get(appointment.specialtyId) : null;

      // Crear fecha y hora de inicio
      const [year, month, day] = appointment.date.split('-').map(Number);
      const [hours, minutes] = appointment.time.split(':').map(Number);
      const startDate = new Date(year, month - 1, day, hours, minutes);
      
      // Duración estimada de 30 minutos
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

      // Título del evento
      let summary = `Cita: ${appointment.name}`;
      if (specialty) {
        summary += ` - ${specialty.name}`;
      }

      // Descripción del evento
      let description = `Paciente: ${appointment.name}\\n`;
      description += `Email: ${appointment.email}\\n`;
      description += `Teléfono: ${appointment.phone}\\n`;
      
      if (appointment.reason) {
        description += `Motivo: ${appointment.reason}\\n`;
      }
      
      if (doctor) {
        description += `Doctor: ${doctor.name}\\n`;
      }
      
      if (appointment.insurance) {
        description += `Seguro: ${appointment.insurance}\\n`;
      }
      
      if (appointment.notes) {
        description += `Notas: ${appointment.notes}\\n`;
      }
      
      description += `Estado: ${appointment.status}`;

      // Ubicación
      const location = 'Farmacia Fátima Díaz Guillén, C/ El Socorro, 2, 38500 Güímar, Santa Cruz de Tenerife';

      // Status del evento
      const status = appointment.status === 'confirmada' ? 'CONFIRMED' : 
                    appointment.status === 'cancelada' ? 'CANCELLED' : 'TENTATIVE';

      // Generar evento iCal
      const eventString = generateICalEvent({
        id: `appointment-${appointment.id}`,
        summary,
        description,
        location,
        start: startDate,
        end: endDate,
        status,
        created: appointment.createdAt ? new Date(appointment.createdAt) : new Date(),
        lastModified: appointment.createdAt ? new Date(appointment.createdAt) : new Date(),
      });

      events.push(eventString);
    }

    // Generar calendario completo
    const calendarData = generateICalCalendar(events, {
      name: 'Farmacia Fátima Díaz Guillén - Citas Médicas',
      description: 'Calendario de citas médicas del Centro Médico Clodina',
      url: `${req.protocol}://${req.get('host')}/api/ical/calendar.ics`,
    });

    // Configurar headers de respuesta
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="calendario-citas.ics"');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora

    // Enviar calendario
    res.send(calendarData);

  } catch (error) {
    console.error('Error generando calendario iCal:', error);
    res.status(500).json({ error: 'Error al generar el calendario' });
  }
});

// Generar calendario iCal para un doctor específico
router.get('/doctor/:doctorId/calendar.ics', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const fromDate = req.query.from as string;
    const toDate = req.query.to as string;

    // Obtener información del doctor
    const doctor = await db.select().from(doctors).where(eq(doctors.id, parseInt(doctorId))).limit(1);
    
    if (doctor.length === 0) {
      return res.status(404).json({ error: 'Doctor no encontrado' });
    }

    const doctorInfo = doctor[0];

    // Obtener citas del doctor
    let whereConditions = [eq(appointments.doctorId, parseInt(doctorId))];
    
    if (fromDate) {
      whereConditions.push(gte(appointments.date, fromDate));
    }

    const appointmentsList = await db.select().from(appointments).where(and(...whereConditions));
    const specialtiesList = await db.select().from(specialties);
    const specialtiesMap = new Map(specialtiesList.map(s => [s.id, s]));

    // Generar eventos del doctor
    const events = [];
    
    for (const appointment of appointmentsList) {
      const specialty = appointment.specialtyId ? specialtiesMap.get(appointment.specialtyId) : null;

      const [year, month, day] = appointment.date.split('-').map(Number);
      const [hours, minutes] = appointment.time.split(':').map(Number);
      const startDate = new Date(year, month - 1, day, hours, minutes);
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

      let summary = `Consulta: ${appointment.name}`;
      if (specialty) {
        summary += ` - ${specialty.name}`;
      }

      let description = `Paciente: ${appointment.name}\\n`;
      description += `Teléfono: ${appointment.phone}\\n`;
      if (appointment.reason) {
        description += `Motivo: ${appointment.reason}\\n`;
      }
      if (appointment.notes) {
        description += `Notas: ${appointment.notes}`;
      }

      const status = appointment.status === 'confirmada' ? 'CONFIRMED' : 
                    appointment.status === 'cancelada' ? 'CANCELLED' : 'TENTATIVE';

      const eventString = generateICalEvent({
        id: `appointment-${appointment.id}`,
        summary,
        description,
        location: 'Centro Médico Clodina, C/ El Socorro, 2, 38500 Güímar',
        start: startDate,
        end: endDate,
        status,
        created: appointment.createdAt ? new Date(appointment.createdAt) : new Date(),
        lastModified: appointment.createdAt ? new Date(appointment.createdAt) : new Date(),
      });

      events.push(eventString);
    }

    const calendarData = generateICalCalendar(events, {
      name: `Dr. ${doctorInfo.name} - Citas Médicas`,
      description: `Calendario de citas del Dr. ${doctorInfo.name} en Centro Médico Clodina`,
      url: `${req.protocol}://${req.get('host')}/api/ical/doctor/${doctorId}/calendar.ics`,
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="calendario-${doctorInfo.name.replace(/\s+/g, '-').toLowerCase()}.ics"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    res.send(calendarData);

  } catch (error) {
    console.error('Error generando calendario del doctor:', error);
    res.status(500).json({ error: 'Error al generar el calendario del doctor' });
  }
});

// Endpoint para obtener URL de suscripción
router.get('/subscription-urls', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const urls = {
      all: `${baseUrl}/api/ical/calendar.ics`,
      filtered: {
        byDoctor: (doctorId: number) => `${baseUrl}/api/ical/doctor/${doctorId}/calendar.ics`,
        bySpecialty: (specialtyId: number) => `${baseUrl}/api/ical/calendar.ics?specialtyId=${specialtyId}`,
        byDateRange: (from: string, to: string) => `${baseUrl}/api/ical/calendar.ics?from=${from}&to=${to}`,
      }
    };

    res.json(urls);
  } catch (error) {
    console.error('Error obteniendo URLs de suscripción:', error);
    res.status(500).json({ error: 'Error al obtener URLs de suscripción' });
  }
});

export default router;