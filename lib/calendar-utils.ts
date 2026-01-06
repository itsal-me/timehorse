import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  addDays,
  setHours,
  setMinutes,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import { TWeekDay, TEvent, TTimeSlot } from '@/types';

export function getWeekDays(date: Date = new Date()): TWeekDay[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start, end });

  return days.map((day) => {
    // Create a new date at noon local time to avoid timezone issues
    // This ensures the date stays in the correct day regardless of timezone
    const safeDay = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0, 0);
    
    return {
      date: safeDay,
      dayName: format(safeDay, 'EEE'),
      dayNumber: parseInt(format(safeDay, 'd')),
      isToday: isToday(safeDay),
      events: [],
    };
  });
}

export function getTimeSlots(): TTimeSlot[] {
  const slots: TTimeSlot[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour < 12 ? 'AM' : 'PM';
    slots.push({
      hour,
      label: `${displayHour} ${period}`,
    });
  }
  
  return slots;
}

export function filterEventsForDay(events: TEvent[], day: Date): TEvent[] {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  return events.filter((event) => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    
    // Only include events that START on this day or span across this day
    // Exclude events that merely END at midnight (start of this day)
    const startsOnThisDay = isWithinInterval(eventStart, { start: dayStart, end: dayEnd });
    const spansThisDay = eventStart < dayStart && eventEnd > dayStart;
    
    return startsOnThisDay || spansThisDay;
  });
}

export function getEventPosition(event: TEvent) {
  // Ensure we're working with Date objects and using local time
  const start = event.startTime instanceof Date ? event.startTime : new Date(event.startTime);
  const end = event.endTime instanceof Date ? event.endTime : new Date(event.endTime);
  
  // Use local time methods (getHours, getMinutes) not UTC methods
  const startHour = start.getHours();
  const startMinute = start.getMinutes();
  const endHour = end.getHours();
  const endMinute = end.getMinutes();
  
  const top = startHour * 60 + startMinute; // in minutes from midnight
  const duration = (endHour * 60 + endMinute) - top;
  
  // The container has pt-[120px] padding which already offsets the content
  // Absolute positioning is relative to the content edge (after padding)
  // Each hour is 4rem (64px)
  return {
    top: `${(top / 60) * 4}rem`,
    height: `${(duration / 60) * 4}rem`,
  };
}

export function createEvent(
  title: string,
  startTime: Date,
  durationMinutes: number,
  options?: Partial<TEvent>
): TEvent {
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);

  return {
    id: Math.random().toString(36).substr(2, 9),
    title,
    startTime,
    endTime,
    color: options?.color || '#3b82f6',
    ...options,
  };
}
