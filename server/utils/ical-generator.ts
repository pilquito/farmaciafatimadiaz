// Generador manual de iCal para evitar problemas de tipado
export function generateICalEvent(event: {
  id: string;
  summary: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  status: string;
  created?: Date;
  lastModified?: Date;
}): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  };

  const now = new Date();
  
  return `BEGIN:VEVENT
UID:${event.id}@farmaciafatimadiaz.com
DTSTAMP:${formatDate(now)}
SUMMARY:${event.summary}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
DTSTART:${formatDate(event.start)}
DTEND:${formatDate(event.end)}
STATUS:${event.status}
CREATED:${formatDate(event.created || now)}
LAST-MODIFIED:${formatDate(event.lastModified || now)}
END:VEVENT
`;
}

export function generateICalCalendar(events: any[], options: {
  name: string;
  description: string;
  url?: string;
}): string {
  const now = new Date();
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  };

  let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Farmacia Fátima Díaz Guillén//Centro Médico Clodina//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${options.name}
X-WR-CALDESC:${options.description}
X-WR-TIMEZONE:Atlantic/Canary
`;

  if (options.url) {
    ical += `URL:${options.url}\n`;
  }

  // Agregar zona horaria
  ical += `BEGIN:VTIMEZONE
TZID:Atlantic/Canary
BEGIN:STANDARD
DTSTART:20071028T020000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
TZNAME:WET
TZOFFSETFROM:+0100
TZOFFSETTO:+0000
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:20070325T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
TZNAME:WEST
TZOFFSETFROM:+0000
TZOFFSETTO:+0100
END:DAYLIGHT
END:VTIMEZONE
`;

  // Agregar eventos
  ical += events.join('\n');

  ical += '\nEND:VCALENDAR';
  
  return ical;
}