'use client';

import { useState, useEffect } from 'react';
import { TEvent } from '@/types';
import { SupabaseEvent } from '@/lib/supabase/events';

export function useOptimisticEvents(initialEvents: TEvent[] = []) {
  const [events, setEvents] = useState<TEvent[]>(initialEvents);
  const [optimisticEvents, setOptimisticEvents] = useState<TEvent[]>([]);

  // Combine real and optimistic events
  const allEvents = [...events, ...optimisticEvents];

  /**
   * Add an event optimistically
   * Returns a cleanup function in case the operation fails
   */
  const addEventOptimistically = (event: TEvent): (() => void) => {
    const optimisticEvent = {
      ...event,
      id: event.id || `optimistic-${Date.now()}`,
    };

    setOptimisticEvents((prev) => [...prev, optimisticEvent]);

    // Return cleanup function to remove optimistic event if needed
    return () => {
      setOptimisticEvents((prev) =>
        prev.filter((e) => e.id !== optimisticEvent.id)
      );
    };
  };

  /**
   * Confirm an optimistic event (move from optimistic to real)
   */
  const confirmEvent = (optimisticId: string, realEvent: TEvent) => {
    setOptimisticEvents((prev) =>
      prev.filter((e) => e.id !== optimisticId)
    );
    setEvents((prev) => [...prev, realEvent]);
  };

  /**
   * Remove an optimistic event (if operation failed)
   */
  const removeOptimisticEvent = (optimisticId: string) => {
    setOptimisticEvents((prev) =>
      prev.filter((e) => e.id !== optimisticId)
    );
  };

  /**
   * Update events (replace all events)
   */
  const setRealEvents = (newEvents: TEvent[]) => {
    setEvents(newEvents);
  };

  /**
   * Add a confirmed event
   */
  const addEvent = (event: TEvent) => {
    setEvents((prev) => [...prev, event]);
  };

  /**
   * Remove an event
   */
  const removeEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setOptimisticEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  /**
   * Update an event
   */
  const updateEvent = (eventId: string, updates: Partial<TEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e))
    );
  };

  return {
    events: allEvents,
    realEvents: events,
    optimisticEvents,
    addEventOptimistically,
    confirmEvent,
    removeOptimisticEvent,
    setRealEvents,
    addEvent,
    removeEvent,
    updateEvent,
  };
}

/**
 * Convert Supabase event to TEvent format
 * Ensures timezone handling: Supabase stores in UTC, we convert to local Date objects
 */
export function supabaseEventToTEvent(supabaseEvent: SupabaseEvent): TEvent {
  // The Date constructor will parse ISO strings (UTC) and convert to local time
  const startTime = new Date(supabaseEvent.start_time);
  const endTime = new Date(supabaseEvent.end_time);
  
  console.log('Converting Supabase event:', {
    title: supabaseEvent.title,
    start_time_utc: supabaseEvent.start_time,
    start_time_local: startTime.toString(),
    start_hour_local: startTime.getHours(),
  });
  
  return {
    id: supabaseEvent.id || '',
    title: supabaseEvent.title,
    description: supabaseEvent.description,
    startTime,
    endTime,
    color: supabaseEvent.color,
    location: supabaseEvent.location,
    attendees: supabaseEvent.attendees,
    googleEventId: supabaseEvent.google_event_id,
  };
}

/**
 * Convert TEvent to Supabase event format
 */
export function tEventToSupabaseEvent(event: TEvent): Omit<SupabaseEvent, 'id' | 'user_id'> {
  return {
    title: event.title,
    description: event.description,
    start_time: event.startTime.toISOString(),
    end_time: event.endTime.toISOString(),
    color: event.color,
    location: event.location,
    attendees: event.attendees,
    google_event_id: event.googleEventId,
  };
}
