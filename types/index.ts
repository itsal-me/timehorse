export interface TEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  color?: string;
  attendees?: string[];
  location?: string;
}

export interface TCommand {
  action: 'schedule' | 'block' | 'cancel' | 'reschedule' | 'find';
  title?: string;
  person?: string;
  duration?: number; // in minutes
  date?: Date;
  time?: string;
  location?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    day?: string;
  };
}

export interface TWeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  events: TEvent[];
}

export interface TTimeSlot {
  hour: number;
  label: string;
}
