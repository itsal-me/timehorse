import { getGoogleProviderToken } from './supabase/auth';
import { TEvent } from '@/types';

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

/**
 * Get the Google Calendar API headers with authorization
 */
async function getCalendarHeaders() {
  try {
    const { providerToken } = await getGoogleProviderToken();
    
    if (!providerToken) {
      throw new Error('No Google access token available');
    }
    
    return {
      'Authorization': `Bearer ${providerToken}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    // Re-throw with more context
    if (error instanceof Error && error.message === 'No active session') {
      throw new Error('Not authenticated with Google Calendar');
    }
    throw error;
  }
}

/**
 * Create an event in Google Calendar
 */
export async function createGoogleCalendarEvent(event: TEvent): Promise<string> {
  const headers = await getCalendarHeaders();
  
  const googleEvent = {
    summary: event.title,
    description: event.description || '',
    start: {
      dateTime: event.startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: event.endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    attendees: event.attendees?.map(email => ({ email })) || [],
    colorId: getColorId(event.color),
  };
  
  const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events`, {
    method: 'POST',
    headers,
    body: JSON.stringify(googleEvent),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Google Calendar event: ${error}`);
  }
  
  const data = await response.json();
  return data.id; // Return Google Calendar event ID
}

/**
 * Update an event in Google Calendar
 */
export async function updateGoogleCalendarEvent(googleEventId: string, event: Partial<TEvent>): Promise<void> {
  const headers = await getCalendarHeaders();
  
  const googleEvent: any = {};
  
  if (event.title) googleEvent.summary = event.title;
  if (event.description !== undefined) googleEvent.description = event.description;
  if (event.startTime) {
    googleEvent.start = {
      dateTime: event.startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
  if (event.endTime) {
    googleEvent.end = {
      dateTime: event.endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
  if (event.attendees) {
    googleEvent.attendees = event.attendees.map(email => ({ email }));
  }
  if (event.color) {
    googleEvent.colorId = getColorId(event.color);
  }
  
  const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events/${googleEventId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(googleEvent),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update Google Calendar event: ${error}`);
  }
}

/**
 * Delete an event from Google Calendar
 */
export async function deleteGoogleCalendarEvent(googleEventId: string): Promise<void> {
  const headers = await getCalendarHeaders();
  
  const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events/${googleEventId}`, {
    method: 'DELETE',
    headers,
  });
  
  if (!response.ok && response.status !== 404) {
    const error = await response.text();
    throw new Error(`Failed to delete Google Calendar event: ${error}`);
  }
}

/**
 * Fetch events from Google Calendar
 */
export async function fetchGoogleCalendarEvents(startDate?: Date, endDate?: Date): Promise<any[]> {
  const headers = await getCalendarHeaders();
  
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
  });
  
  if (startDate) {
    params.append('timeMin', startDate.toISOString());
  }
  if (endDate) {
    params.append('timeMax', endDate.toISOString());
  }
  
  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/primary/events?${params.toString()}`,
    { headers }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Google Calendar events: ${error}`);
  }
  
  const data = await response.json();
  return data.items || [];
}

/**
 * Convert Google Calendar event to TEvent
 */
export function googleEventToTEvent(googleEvent: any): TEvent | null {
  if (!googleEvent.start?.dateTime || !googleEvent.end?.dateTime) {
    // Skip all-day events for now
    return null;
  }
  
  return {
    id: `gcal-${googleEvent.id}`, // Prefix to distinguish from Supabase events
    title: googleEvent.summary || 'Untitled Event',
    description: googleEvent.description || '',
    startTime: new Date(googleEvent.start.dateTime),
    endTime: new Date(googleEvent.end.dateTime),
    color: getColorFromColorId(googleEvent.colorId),
    attendees: googleEvent.attendees?.map((a: any) => a.email) || [],
    googleEventId: googleEvent.id,
  };
}

/**
 * Map our app colors to Google Calendar color IDs
 */
function getColorId(hexColor?: string): string {
  const colorMap: Record<string, string> = {
    '#3b82f6': '9',  // blue
    '#8b5cf6': '3',  // purple
    '#ec4899': '4',  // pink
    '#f97316': '6',  // orange
    '#10b981': '10', // green
    '#ef4444': '11', // red
    '#06b6d4': '7',  // cyan
    '#eab308': '5',  // yellow
  };
  
  return colorMap[hexColor || '#3b82f6'] || '9';
}

/**
 * Map Google Calendar color IDs to our app colors
 */
function getColorFromColorId(colorId?: string): string {
  const colorMap: Record<string, string> = {
    '9': '#3b82f6',  // blue
    '3': '#8b5cf6',  // purple
    '4': '#ec4899',  // pink
    '6': '#f97316',  // orange
    '10': '#10b981', // green
    '11': '#ef4444', // red
    '7': '#06b6d4',  // cyan
    '5': '#eab308',  // yellow
  };
  
  return colorMap[colorId || '9'] || '#3b82f6';
}

/**
 * Sync changes from Google Calendar
 * Detects new, updated and deleted events
 */
export async function syncGoogleCalendarChanges(existingEvents: TEvent[]): Promise<{
  new: TEvent[];
  updated: TEvent[];
  deleted: string[]; // googleEventIds that were deleted
}> {
  try {
    const headers = await getCalendarHeaders();
    
    // Fetch recent Google Calendar events
    const googleEvents = await fetchGoogleCalendarEvents(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)  // 60 days ahead
    );
    
    // Create a map of Google Calendar events by ID
    const googleEventMap = new Map(
      googleEvents.map(e => [e.id, e])
    );
    
    // Create a set of existing Google event IDs
    const existingGoogleIds = new Set(
      existingEvents
        .map(e => e.googleEventId)
        .filter(Boolean)
    );
    
    // Find new, updated, and deleted events
    const newEvents: TEvent[] = [];
    const updated: TEvent[] = [];
    const deleted: string[] = [];
    
    // Check for new events in Google Calendar
    for (const [googleEventId, googleEvent] of googleEventMap) {
      if (!existingGoogleIds.has(googleEventId)) {
        // This is a new event in Google Calendar
        const googleTEvent = googleEventToTEvent(googleEvent);
        if (googleTEvent) {
          newEvents.push(googleTEvent);
        }
      }
    }
    
    // Check each existing event that has a googleEventId
    for (const event of existingEvents) {
      if (!event.googleEventId) continue;
      
      const googleEvent = googleEventMap.get(event.googleEventId);
      
      if (!googleEvent) {
        // Event was deleted in Google Calendar
        deleted.push(event.googleEventId);
      } else {
        // Check if event was updated
        const googleTEvent = googleEventToTEvent(googleEvent);
        if (googleTEvent && hasEventChanged(event, googleTEvent)) {
          // Keep the local ID but update with Google Calendar data
          updated.push({
            ...googleTEvent,
            id: event.id, // Keep local database ID if it exists and isn't a gcal- prefix
          });
        }
      }
    }
    
    return { new: newEvents, updated, deleted };
  } catch (error) {
    // Silently return empty results for authentication errors
    if (error instanceof Error && 
        (error.message.includes('authenticated') || 
         error.message.includes('access token') ||
         error.message.includes('session'))) {
      return { new: [], updated: [], deleted: [] };
    }
    // Log other errors
    console.error('Failed to sync Google Calendar changes:', error);
    return { new: [], updated: [], deleted: [] };
  }
}

/**
 * Check if an event has changed
 */
function hasEventChanged(local: TEvent, google: TEvent): boolean {
  return (
    local.title !== google.title ||
    local.description !== google.description ||
    local.startTime.getTime() !== google.startTime.getTime() ||
    local.endTime.getTime() !== google.endTime.getTime() ||
    local.color !== google.color ||
    JSON.stringify(local.attendees) !== JSON.stringify(google.attendees)
  );
}

