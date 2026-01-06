import { TEvent } from '@/types';
import { differenceInMinutes, isWithinInterval, setHours, setMinutes } from 'date-fns';

export interface EnergyScore {
  score: number; // 0-100, higher is better (more focus time)
  color: string; // Hex color for visualization
  focusTimeMinutes: number;
  meetingTimeMinutes: number;
  totalWorkMinutes: number; // Default 9-5 = 480 minutes
  label: string; // 'Excellent', 'Good', 'Moderate', 'Busy', 'Overloaded'
}

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 17;
const TOTAL_WORK_MINUTES = (WORK_END_HOUR - WORK_START_HOUR) * 60; // 480 minutes (8 hours)

/**
 * Calculate energy score for a single day based on meeting density
 * Green (80-100): Lots of focus time available
 * Yellow-Green (60-79): Good balance
 * Yellow (40-59): Moderate focus time
 * Orange (20-39): Busy day, limited focus time
 * Red (0-19): Overloaded, little to no focus time
 */
export function calculateEnergyScore(events: TEvent[], date: Date): EnergyScore {
  // Define work hours for the day
  const workStart = setHours(setMinutes(new Date(date), 0), WORK_START_HOUR);
  const workEnd = setHours(setMinutes(new Date(date), 0), WORK_END_HOUR);

  // Calculate total meeting time in work hours
  let meetingTimeMinutes = 0;

  events.forEach((event) => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);

    // Check if event overlaps with work hours
    if (
      isWithinInterval(eventStart, { start: workStart, end: workEnd }) ||
      isWithinInterval(eventEnd, { start: workStart, end: workEnd }) ||
      (eventStart <= workStart && eventEnd >= workEnd)
    ) {
      // Calculate overlap duration
      const overlapStart = eventStart < workStart ? workStart : eventStart;
      const overlapEnd = eventEnd > workEnd ? workEnd : eventEnd;
      const duration = differenceInMinutes(overlapEnd, overlapStart);
      meetingTimeMinutes += duration;
    }
  });

  // Ensure meeting time doesn't exceed work hours (in case of overlapping events)
  meetingTimeMinutes = Math.min(meetingTimeMinutes, TOTAL_WORK_MINUTES);

  const focusTimeMinutes = TOTAL_WORK_MINUTES - meetingTimeMinutes;
  const focusTimePercentage = (focusTimeMinutes / TOTAL_WORK_MINUTES) * 100;

  // Calculate score (0-100)
  const score = Math.round(focusTimePercentage);

  // Determine color and label based on score
  let color: string;
  let label: string;

  if (score >= 80) {
    color = '#10b981'; // Green
    label = 'Excellent';
  } else if (score >= 60) {
    color = '#84cc16'; // Yellow-Green
    label = 'Good';
  } else if (score >= 40) {
    color = '#eab308'; // Yellow
    label = 'Moderate';
  } else if (score >= 20) {
    color = '#f97316'; // Orange
    label = 'Busy';
  } else {
    color = '#ef4444'; // Red
    label = 'Overloaded';
  }

  return {
    score,
    color,
    focusTimeMinutes,
    meetingTimeMinutes,
    totalWorkMinutes: TOTAL_WORK_MINUTES,
    label,
  };
}

/**
 * Calculate energy scores for multiple days
 */
export function calculateWeekEnergyScores(
  eventsByDay: { date: Date; events: TEvent[] }[]
): Map<string, EnergyScore> {
  const scores = new Map<string, EnergyScore>();

  eventsByDay.forEach(({ date, events }) => {
    const dateKey = date.toISOString().split('T')[0];
    scores.set(dateKey, calculateEnergyScore(events, date));
  });

  return scores;
}

/**
 * Format focus time for display
 */
export function formatFocusTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}

/**
 * Get week summary statistics
 */
export function getWeekEnergySummary(scores: Map<string, EnergyScore>) {
  const scoresArray = Array.from(scores.values());
  
  if (scoresArray.length === 0) {
    return {
      averageScore: 0,
      totalFocusTime: 0,
      totalMeetingTime: 0,
      bestDay: null,
      worstDay: null,
    };
  }

  const totalScore = scoresArray.reduce((sum, s) => sum + s.score, 0);
  const totalFocusTime = scoresArray.reduce((sum, s) => sum + s.focusTimeMinutes, 0);
  const totalMeetingTime = scoresArray.reduce((sum, s) => sum + s.meetingTimeMinutes, 0);

  const bestScore = Math.max(...scoresArray.map(s => s.score));
  const worstScore = Math.min(...scoresArray.map(s => s.score));

  return {
    averageScore: Math.round(totalScore / scoresArray.length),
    totalFocusTime,
    totalMeetingTime,
    bestDay: scoresArray.find(s => s.score === bestScore),
    worstDay: scoresArray.find(s => s.score === worstScore),
  };
}
