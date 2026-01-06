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

interface TimeSlotSuggestion {
  startTime: Date;
  endTime: Date;
  score: number; // 0-100, higher is better
  reason: string;
}

export function findAvailableTimeSlots(
  events: TEvent[],
  durationMinutes: number,
  options?: {
    startDate?: Date;
    endDate?: Date;
    preferredHours?: { start: number; end: number }; // e.g., { start: 9, end: 17 } for 9am-5pm
    maxSuggestions?: number;
  }
): TimeSlotSuggestion[] {
  const startDate = options?.startDate || new Date();
  const endDate = options?.endDate || addDays(startDate, 7); // Default: next 7 days
  const preferredStart = options?.preferredHours?.start ?? 9; // Default: 9am
  const preferredEnd = options?.preferredHours?.end ?? 17; // Default: 5pm
  const maxSuggestions = options?.maxSuggestions ?? 5;

  const suggestions: TimeSlotSuggestion[] = [];
  let currentDate = new Date(startDate);
  currentDate.setHours(preferredStart, 0, 0, 0);

  // Search through each day
  while (currentDate <= endDate && suggestions.length < maxSuggestions * 3) {
    const dayEvents = filterEventsForDay(events, currentDate);
    
    // Sort events by start time
    dayEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Check for gaps between events and at the start/end of the day
    let checkTime = new Date(currentDate);
    checkTime.setHours(preferredStart, 0, 0, 0);

    const dayEnd = new Date(currentDate);
    dayEnd.setHours(preferredEnd, 0, 0, 0);

    for (const event of dayEvents) {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);

      // Check gap before this event
      if (checkTime < eventStart) {
        const availableMinutes = (eventStart.getTime() - checkTime.getTime()) / (1000 * 60);
        
        if (availableMinutes >= durationMinutes) {
          const slotEnd = new Date(checkTime);
          slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);
          
          const score = calculateTimeSlotScore(checkTime, durationMinutes, dayEvents);
          const reason = getTimeSlotReason(checkTime, score, dayEvents);
          
          suggestions.push({
            startTime: new Date(checkTime),
            endTime: slotEnd,
            score,
            reason,
          });
        }
      }

      // Move checkTime to after this event
      checkTime = eventEnd > checkTime ? new Date(eventEnd) : checkTime;
    }

    // Check for time after last event until end of preferred hours
    if (checkTime < dayEnd) {
      const availableMinutes = (dayEnd.getTime() - checkTime.getTime()) / (1000 * 60);
      
      if (availableMinutes >= durationMinutes) {
        const slotEnd = new Date(checkTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);
        
        const score = calculateTimeSlotScore(checkTime, durationMinutes, dayEvents);
        const reason = getTimeSlotReason(checkTime, score, dayEvents);
        
        suggestions.push({
          startTime: new Date(checkTime),
          endTime: slotEnd,
          score,
          reason,
        });
      }
    }

    // Move to next day
    currentDate = addDays(currentDate, 1);
    currentDate.setHours(preferredStart, 0, 0, 0);
  }

  // Sort by score (highest first) and return top suggestions
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions);
}

function calculateTimeSlotScore(
  startTime: Date,
  durationMinutes: number,
  dayEvents: TEvent[]
): number {
  let score = 50; // Base score

  const hour = startTime.getHours();
  const day = startTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);

  // Prefer morning for deep work (9am-12pm)
  if (hour >= 9 && hour < 12) {
    score += 20;
  }
  // Good afternoon slots (2pm-4pm)
  else if (hour >= 14 && hour < 16) {
    score += 10;
  }
  // Early morning or late afternoon
  else if (hour >= 8 && hour < 9 || hour >= 16 && hour < 17) {
    score += 5;
  }

  // Prefer weekdays over weekends for work
  if (day >= 1 && day <= 5) {
    score += 15;
  }

  // Prefer Tuesday, Wednesday, Thursday (peak productivity days)
  if (day >= 2 && day <= 4) {
    score += 10;
  }

  // Check buffer before and after (prefer slots with breathing room)
  const bufferMinutes = 30;
  const bufferBefore = new Date(startTime);
  bufferBefore.setMinutes(bufferBefore.getMinutes() - bufferMinutes);
  const bufferAfter = new Date(endTime);
  bufferAfter.setMinutes(bufferAfter.getMinutes() + bufferMinutes);

  const hasEventBefore = dayEvents.some((event) => {
    const eventEnd = new Date(event.endTime);
    return eventEnd > bufferBefore && eventEnd <= startTime;
  });

  const hasEventAfter = dayEvents.some((event) => {
    const eventStart = new Date(event.startTime);
    return eventStart >= endTime && eventStart < bufferAfter;
  });

  // Bonus for having buffer time
  if (!hasEventBefore) score += 10;
  if (!hasEventAfter) score += 10;

  // Prefer earlier in the week
  const now = new Date();
  const daysFromNow = Math.floor((startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysFromNow <= 2) score += 5; // Soon but not too soon

  return Math.min(100, Math.max(0, score));
}

function getTimeSlotReason(
  startTime: Date,
  score: number,
  dayEvents: TEvent[]
): string {
  const hour = startTime.getHours();
  const day = startTime.getDay();
  const dayName = format(startTime, 'EEEE');
  
  const reasons: string[] = [];

  if (hour >= 9 && hour < 12) {
    reasons.push('Prime morning focus time');
  } else if (hour >= 14 && hour < 16) {
    reasons.push('Good afternoon slot');
  }

  if (day >= 2 && day <= 4) {
    reasons.push('Peak productivity day');
  }

  if (dayEvents.length === 0) {
    reasons.push('Day is completely free');
  } else if (dayEvents.length <= 2) {
    reasons.push('Light schedule');
  }

  if (reasons.length === 0) {
    reasons.push('Available slot');
  }

  return reasons.join(' • ');
}
