import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import type { MatchEvent } from "../db/db";

// Format a date to the ICS format: YYYYMMDDTHHmmssZ
const formatIcsDate = (date: Date): string => {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
};

export interface BaseCalendarEvent {
  id: string;
  externalId?: string;
  date: Date;
  title: string;
  location?: string;
  notes?: string;
  reminders: number[];
}

export const generateIcs = (events: BaseCalendarEvent[]): string => {
  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Agenda Partite//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  events.forEach((m) => {
    ics.push("BEGIN:VEVENT");
    ics.push(`UID:${m.externalId || m.id}`);
    ics.push(`DTSTAMP:${formatIcsDate(new Date())}`);
    ics.push(`DTSTART:${formatIcsDate(m.date)}`);
    // Assuming a match/event takes 2 hours duration
    const endDate = new Date(m.date.getTime() + 2 * 60 * 60 * 1000);
    ics.push(`DTEND:${formatIcsDate(endDate)}`);
    ics.push(`SUMMARY:${m.title}`);
    if (m.location) ics.push(`LOCATION:${m.location.replace(/,/g, "\\,")}`);
    if (m.notes) ics.push(`DESCRIPTION:${m.notes.replace(/\n/g, "\\n")}`);
    
    // Alarms/Reminders
    m.reminders.forEach((minutes) => {
      ics.push("BEGIN:VALARM");
      ics.push("ACTION:DISPLAY");
      ics.push(`DESCRIPTION:Promemoria: ${m.title}`);
      ics.push(`TRIGGER:-PT${minutes}M`);
      ics.push("END:VALARM");
    });
    
    ics.push("END:VEVENT");
  });

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
};

export const parseIcs = (icsContent: string): Partial<MatchEvent>[] => {
  const events: Partial<MatchEvent>[] = [];
  const lines = icsContent.split(/\r?\n/);
  
  let currentEvent: Partial<MatchEvent> | null = null;
  let inEvent = false;

  const parseDate = (dateStr: string): Date => {
    // Basic parser for YYYYMMDDTHHMMSSZ
    if (!dateStr) return new Date();
    const cleanStr = dateStr.replace(/[^0-9T]/g, '');
    if (cleanStr.length >= 15) {
      const year = parseInt(cleanStr.slice(0, 4));
      const month = parseInt(cleanStr.slice(4, 6)) - 1;
      const day = parseInt(cleanStr.slice(6, 8));
      const hours = parseInt(cleanStr.slice(9, 11));
      const minutes = parseInt(cleanStr.slice(11, 13));
      const seconds = parseInt(cleanStr.slice(13, 15));
      return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
    }
    return new Date();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("BEGIN:VEVENT")) {
      inEvent = true;
      currentEvent = {
        title: "Nuovo Evento",
        location: "",
        notes: "",
        reminders: [],
        isSynced: true
      };
    } else if (line.startsWith("END:VEVENT")) {
      if (currentEvent && currentEvent.date) {
        if (!currentEvent.id) currentEvent.id = uuidv4();
        events.push(currentEvent);
      }
      inEvent = false;
      currentEvent = null;
    } else if (inEvent && currentEvent) {
      if (line.startsWith("UID:")) {
        currentEvent.externalId = line.substring(4);
      } else if (line.startsWith("DTSTART")) {
        const parts = line.split(":");
        if (parts.length > 1) {
          currentEvent.date = parseDate(parts[1]);
        }
      } else if (line.startsWith("SUMMARY:")) {
        currentEvent.title = line.substring(8);
      } else if (line.startsWith("LOCATION:")) {
        currentEvent.location = line.substring(9).replace(/\\,/g, ",");
      } else if (line.startsWith("DESCRIPTION:")) {
        currentEvent.notes = line.substring(12).replace(/\\n/g, "\n");
      } else if (line.startsWith("TRIGGER:-PT")) {
        // e.g. TRIGGER:-PT15M
        const match = line.match(/TRIGGER:-PT(\d+)[M|H]/);
        if (match && match[1]) {
          const val = parseInt(match[1]);
          const isHours = line.includes("H");
          currentEvent.reminders?.push(isHours ? val * 60 : val);
        }
      }
    }
  }

  return events;
};
