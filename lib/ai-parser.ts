import { TCommand } from '@/types';
import { addDays, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday, nextSunday, parseISO, setHours, setMinutes } from 'date-fns';

export function parseCommand(input: string): TCommand | null {
  const lowerInput = input.toLowerCase().trim();

  // Action detection
  let action: TCommand['action'] = 'schedule';
  if (lowerInput.includes('block') || lowerInput.includes('focus')) {
    action = 'block';
  } else if (lowerInput.includes('cancel') || lowerInput.includes('delete')) {
    action = 'cancel';
  } else if (lowerInput.includes('reschedule') || lowerInput.includes('move')) {
    action = 'reschedule';
  } else if (
    lowerInput.includes('find me time') ||
    lowerInput.includes('find time') ||
    lowerInput.includes('when can i') ||
    lowerInput.includes('suggest time') ||
    lowerInput.includes('best time') ||
    lowerInput.includes('available time') ||
    lowerInput.includes('find') ||
    lowerInput.includes('show')
  ) {
    action = 'find';
  }

  // Duration extraction (e.g., "1 hour", "30 minutes", "2h", "90min")
  const durationMatch = lowerInput.match(/(\d+)\s*(hour|hr|h|minute|min|m)/i);
  let duration: number | undefined;
  if (durationMatch) {
    const value = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    duration = unit.startsWith('h') ? value * 60 : value;
  }

  // Person extraction (with keywords like "with", "and")
  const personMatch = lowerInput.match(/(?:with|and)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  const person = personMatch ? personMatch[1] : undefined;

  // Date extraction
  let date: Date | undefined;
  const now = new Date();

  if (lowerInput.includes('today')) {
    date = now;
  } else if (lowerInput.includes('tomorrow')) {
    date = addDays(now, 1);
  } else if (lowerInput.includes('next monday')) {
    date = nextMonday(now);
  } else if (lowerInput.includes('next tuesday')) {
    date = nextTuesday(now);
  } else if (lowerInput.includes('next wednesday')) {
    date = nextWednesday(now);
  } else if (lowerInput.includes('next thursday')) {
    date = nextThursday(now);
  } else if (lowerInput.includes('next friday')) {
    date = nextFriday(now);
  } else if (lowerInput.includes('next saturday')) {
    date = nextSaturday(now);
  } else if (lowerInput.includes('next sunday')) {
    date = nextSunday(now);
  } else if (lowerInput.includes('monday')) {
    date = nextMonday(now);
  } else if (lowerInput.includes('tuesday')) {
    date = nextTuesday(now);
  } else if (lowerInput.includes('wednesday')) {
    date = nextWednesday(now);
  } else if (lowerInput.includes('thursday')) {
    date = nextThursday(now);
  } else if (lowerInput.includes('friday')) {
    date = nextFriday(now);
  } else if (lowerInput.includes('saturday')) {
    date = nextSaturday(now);
  } else if (lowerInput.includes('sunday')) {
    date = nextSunday(now);
  }

  // Time extraction (e.g., "at 3pm", "at 10:30", "at 14:00")
  const timeMatch = lowerInput.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  let time: string | undefined;
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3]?.toLowerCase();

    if (period === 'pm' && hour < 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;

    time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    if (date) {
      date = setHours(setMinutes(date, minute), hour);
    }
  }

  // Title extraction (everything before common keywords)
  let title = input;
  const keywordMatch = input.match(/^(.*?)(?:\s+(?:with|on|at|next|tomorrow|today|every))/i);
  if (keywordMatch) {
    title = keywordMatch[1].trim();
  }
  // Remove action words from title
  title = title.replace(/^(schedule|block|cancel|delete|reschedule|move|find|show)\s+/i, '').trim();
  // Remove "a" or "an" at the start
  title = title.replace(/^(a|an)\s+/i, '').trim();

  // Recurring detection
  let recurring: TCommand['recurring'] | undefined;
  if (lowerInput.includes('every')) {
    const recurringMatch = lowerInput.match(/every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|day|week|month)/i);
    if (recurringMatch) {
      const freq = recurringMatch[1].toLowerCase();
      if (freq === 'day') {
        recurring = { frequency: 'daily' };
      } else if (freq === 'week') {
        recurring = { frequency: 'weekly' };
      } else if (freq === 'month') {
        recurring = { frequency: 'monthly' };
      } else {
        recurring = { frequency: 'weekly', day: freq };
      }
    }
  }

  return {
    action,
    title: title || undefined,
    person,
    duration,
    date,
    time,
    recurring,
  };
}

export function commandToSentence(command: TCommand): string {
  let sentence = '';

  switch (command.action) {
    case 'schedule':
      sentence = 'Schedule';
      break;
    case 'block':
      sentence = 'Block';
      break;
    case 'cancel':
      sentence = 'Cancel';
      break;
    case 'reschedule':
      sentence = 'Reschedule';
      break;
    case 'find':
      sentence = 'Find';
      break;
  }

  if (command.title) {
    sentence += ` "${command.title}"`;
  }

  if (command.person) {
    sentence += ` with ${command.person}`;
  }

  if (command.duration) {
    const hours = Math.floor(command.duration / 60);
    const minutes = command.duration % 60;
    sentence += ` for ${hours > 0 ? `${hours}h` : ''}${minutes > 0 ? `${minutes}min` : ''}`.trim();
  }

  if (command.date) {
    sentence += ` on ${command.date.toLocaleDateString()}`;
  }

  if (command.time) {
    sentence += ` at ${command.time}`;
  }

  if (command.recurring) {
    sentence += ` (${command.recurring.frequency}${command.recurring.day ? ` on ${command.recurring.day}` : ''})`;
  }

  return sentence;
}
