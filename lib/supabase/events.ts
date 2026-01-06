import { createClient } from '@/lib/supabase/client';

export interface SupabaseEvent {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  color?: string;
  location?: string;
  attendees?: string[];
  source?: 'manual' | 'ai' | 'google';
  google_event_id?: string;
}

/**
 * Insert an event from OpenRouter/Gemma 3 27B AI response into Supabase
 * OpenRouter should return JSON in this format:
 * {
 *   "title": "Meeting with team",
 *   "description": "Discuss Q1 goals",
 *   "start_time": "2026-01-10T14:00:00Z",
 *   "end_time": "2026-01-10T15:00:00Z",
 *   "attendees": ["john@example.com", "jane@example.com"],
 *   "location": "Conference Room A"
 * }
 * 
 * Use model: google/gemma-3-27b-it:free
 */
export async function insertEventFromAI(aiResponse: any): Promise<SupabaseEvent> {
  const supabase = createClient();

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Parse AI response and format for Supabase
  const eventData: SupabaseEvent = {
    user_id: user.id,
    title: aiResponse.title || 'Untitled Event',
    description: aiResponse.description || null,
    start_time: aiResponse.start_time,
    end_time: aiResponse.end_time,
    color: aiResponse.color || '#3b82f6',
    location: aiResponse.location || null,
    attendees: aiResponse.attendees || [],
    source: 'ai',
  };

  // Insert into Supabase
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single();

  if (error) {
    console.error('Error inserting event:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch all events for the current user
 */
export async function fetchUserEvents(): Promise<SupabaseEvent[]> {
  const supabase = createClient();

  // Verify user is authenticated first
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('Error getting user before fetching events:', userError);
    throw new Error('Authentication required to fetch events');
  }
  
  if (!user) {
    console.warn('No authenticated user found');
    return [];
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching events:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }

  return data || [];
}

/**
 * Fetch events for a specific date range
 */
export async function fetchEventsByDateRange(
  startDate: string,
  endDate: string
): Promise<SupabaseEvent[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  return data || [];
}

/**
 * Update an event
 */
export async function updateEvent(
  eventId: string,
  updates: Partial<SupabaseEvent>
): Promise<SupabaseEvent> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }

  return data;
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

/**
 * Insert a manual event
 */
export async function insertManualEvent(
  eventData: Omit<SupabaseEvent, 'id' | 'user_id' | 'source'>
): Promise<SupabaseEvent> {
  const supabase = createClient();

  // Get current session first
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('No active session. Please sign in again.');
  }
  
  // Try to refresh session if needed
  const expiresAt = session.expires_at;
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
  
  if (timeUntilExpiry < 300) {
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      throw new Error('Session expired. Please sign in again.');
    }
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated. Please sign in again.');
  }

  const { data, error } = await supabase
    .from('events')
    .insert([{
      ...eventData,
      user_id: user.id,
      source: 'manual',
    }])
    .select()
    .single();

  if (error) {
    console.error('Error inserting event:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      eventData: {
        ...eventData,
        user_id: user.id,
        source: 'manual'
      }
    });
    throw error;
  }

  return data;
}
