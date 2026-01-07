"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { WeeklyTimeline } from "@/components/calendar/WeeklyTimeline";
import { MagicBar } from "@/components/magic-bar/MagicBar";
import { LandingPage } from "@/components/LandingPage";
import { EventDialog } from "@/components/calendar/EventDialog";
import { TEvent, TCommand } from "@/types";
import { createEvent, findAvailableTimeSlots } from "@/lib/calendar-utils";
import { addHours, setHours, setMinutes, format, addDays } from "date-fns";
import {
    useOptimisticEvents,
    supabaseEventToTEvent,
    tEventToSupabaseEvent,
} from "@/hooks/useOptimisticEvents";
import {
    fetchUserEvents,
    insertManualEvent,
    updateEvent as updateSupabaseEvent,
    deleteEvent as deleteSupabaseEvent,
} from "@/lib/supabase/events";
import { signInWithGoogle, getUser, signOut } from "@/lib/supabase/auth";
import {
    fetchGoogleCalendarEvents,
    googleEventToTEvent,
    syncGoogleCalendarChanges,
} from "@/lib/google-calendar";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles, User } from "lucide-react";
import Logo from "@/logo.png";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";

export default function Home() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<TEvent | null>(null);
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
    const [isNewEvent, setIsNewEvent] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
    const {
        events,
        addEventOptimistically,
        confirmEvent,
        removeOptimisticEvent,
        setRealEvents,
        removeEvent,
        updateEvent,
    } = useOptimisticEvents([
        // Sample events for demonstration
        createEvent(
            "Team Standup",
            setHours(setMinutes(new Date(), 0), 9),
            30,
            { color: "#3b82f6", attendees: ["Alice", "Bob", "Charlie"] }
        ),
        createEvent(
            "Project Review",
            setHours(setMinutes(new Date(), 0), 14),
            60,
            { color: "#8b5cf6", location: "Conference Room A" }
        ),
        createEvent(
            "Coffee Break",
            addHours(setHours(setMinutes(new Date(), 0), 10), 24),
            30,
            { color: "#10b981", attendees: ["Sarah"] }
        ),
    ]);

    // Load user and events on mount
    useEffect(() => {
        loadUser();
    }, []);

    // Set up realtime subscriptions and Google Calendar sync
    useEffect(() => {
        if (!user) return;

        const supabase = createClient();

        // Subscribe to Supabase realtime changes
        const channel = supabase
            .channel("events-changes")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "events",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log("New event inserted:", payload.new);
                    const newEvent = supabaseEventToTEvent(payload.new as any);
                    addEventOptimistically(newEvent);
                    toast.success("New event synced");
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "events",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log("Event updated:", payload.new);
                    const updatedEvent = supabaseEventToTEvent(
                        payload.new as any
                    );
                    updateEvent(updatedEvent.id, updatedEvent);
                    toast.success("✓ Event updated in your calendar");
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "events",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log("Event deleted:", payload.old);
                    removeEvent((payload.old as any).id);
                    toast.success("✓ Event removed from your calendar");
                }
            )
            .subscribe();

        // Set up periodic Google Calendar sync (every 30 seconds)
        const syncInterval = setInterval(async () => {
            // Only sync if user is authenticated
            if (!user) {
                return;
            }

            try {
                const {
                    new: newEvents,
                    updated,
                    deleted,
                } = await syncGoogleCalendarChanges(events);

                // Add new events from Google Calendar
                for (const newEvent of newEvents) {
                    // Add to UI immediately (Google Calendar-only event with gcal- prefix)
                    addEventOptimistically(newEvent);
                }

                // Update events that changed in Google Calendar
                for (const updatedEvent of updated) {
                    // Check if this is a Google Calendar-only event
                    if (updatedEvent.id.startsWith("gcal-")) {
                        // Just update in UI
                        updateEvent(updatedEvent.id, updatedEvent);
                    } else {
                        // Update in Supabase (which will trigger realtime update)
                        await updateSupabaseEvent(updatedEvent.id, {
                            title: updatedEvent.title,
                            description: updatedEvent.description,
                            start_time: updatedEvent.startTime.toISOString(),
                            end_time: updatedEvent.endTime.toISOString(),
                            color: updatedEvent.color,
                            attendees: updatedEvent.attendees,
                        });
                    }
                }

                // Delete events that were deleted in Google Calendar
                for (const googleEventId of deleted) {
                    const eventToDelete = events.find(
                        (e) => e.googleEventId === googleEventId
                    );
                    if (eventToDelete) {
                        if (eventToDelete.id.startsWith("gcal-")) {
                            // Just remove from UI
                            removeEvent(eventToDelete.id);
                        } else {
                            // Delete from Supabase (which will trigger realtime delete)
                            await deleteSupabaseEvent(eventToDelete.id);
                        }
                    }
                }

                if (
                    newEvents.length > 0 ||
                    updated.length > 0 ||
                    deleted.length > 0
                ) {
                    console.log(
                        `Synced from Google Calendar: ${newEvents.length} new, ${updated.length} updates, ${deleted.length} deletions`
                    );
                    if (newEvents.length > 0) {
                        toast.success(
                            `📅 ${newEvents.length} new event${
                                newEvents.length > 1 ? "s" : ""
                            } synced from Google Calendar`
                        );
                    }
                    if (updated.length > 0) {
                        toast.info(
                            `📅 ${updated.length} event${
                                updated.length > 1 ? "s" : ""
                            } updated from Google Calendar`
                        );
                    }
                    if (deleted.length > 0) {
                        toast.info(
                            `📅 ${deleted.length} event${
                                deleted.length > 1 ? "s" : ""
                            } removed from Google Calendar`
                        );
                    }
                }
            } catch (error) {
                console.error("Google Calendar sync failed:", error);
            }
        }, 30000); // 30 seconds

        // Cleanup
        return () => {
            supabase.removeChannel(channel);
            clearInterval(syncInterval);
        };
    }, [user, events]);

    const loadUser = async () => {
        try {
            const currentUser = await getUser();
            setUser(currentUser);

            if (currentUser) {
                // Load events from Supabase
                try {
                    const supabaseEvents = await fetchUserEvents();
                    const convertedEvents = supabaseEvents.map(
                        supabaseEventToTEvent
                    );

                    // Try to fetch Google Calendar events
                    try {
                        const googleEvents = await fetchGoogleCalendarEvents(
                            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                            new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days ahead
                        );

                        // Convert Google Calendar events to TEvent
                        const googleTEvents = googleEvents
                            .map(googleEventToTEvent)
                            .filter((e): e is TEvent => e !== null);

                        // Filter out Google events that are already in Supabase (by googleEventId)
                        const existingGoogleIds = new Set(
                            convertedEvents
                                .map((e) => e.googleEventId)
                                .filter(Boolean)
                        );

                        const newGoogleEvents = googleTEvents.filter(
                            (e) => !existingGoogleIds.has(e.googleEventId)
                        );

                        // Merge Supabase and new Google Calendar events
                        const allEvents = [
                            ...convertedEvents,
                            ...newGoogleEvents,
                        ];
                        setRealEvents(allEvents);

                        if (newGoogleEvents.length > 0) {
                            console.log(
                                `Loaded ${newGoogleEvents.length} events from Google Calendar`
                            );
                        }
                    } catch (googleError) {
                        console.warn(
                            "Failed to fetch Google Calendar events:",
                            googleError
                        );
                        // Just use Supabase events if Google Calendar fails
                        setRealEvents(convertedEvents);
                    }
                } catch (eventError: any) {
                    console.error("Error loading events:", {
                        message: eventError?.message,
                        details: eventError?.details,
                        error: eventError,
                    });
                    // Show user-friendly message
                    toast.error(
                        "Failed to load events. They may appear after refresh."
                    );
                    // Don't fail the whole load if events fail
                }
            }
        } catch (error) {
            console.error("Error loading user:", error);
            // If auth fails, treat as logged out
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Sign in error:", error);
        }
    };

    const handleEventClick = (event: TEvent) => {
        setSelectedEvent(event);
        setIsNewEvent(false);
        setIsEventDialogOpen(true);
    };

    const handleTimeSlotClick = (date: Date, hour: number) => {
        // Create event using local timezone - extract local date components
        // to avoid timezone conversion issues
        const localYear = date.getFullYear();
        const localMonth = date.getMonth();
        const localDate = date.getDate();

        const eventDate = new Date(
            localYear,
            localMonth,
            localDate,
            hour,
            0,
            0,
            0
        );

        console.log("Creating event:", {
            clickedDate: date.toISOString(),
            clickedDateLocal: date.toString(),
            eventDate: eventDate.toISOString(),
            eventDateLocal: eventDate.toString(),
            hour,
            localYear,
            localMonth,
            localDate,
        });

        const newEvent = createEvent(
            "New Event",
            eventDate,
            60, // 1 hour default duration
            { color: "#3b82f6" }
        );

        // Add optimistically
        const cleanup = addEventOptimistically(newEvent);

        // Open dialog for immediate editing
        setSelectedEvent(newEvent);
        setIsNewEvent(true);
        setIsEventDialogOpen(true);

        // Save to database if signed in
        if (user) {
            const supabaseData = tEventToSupabaseEvent(newEvent);
            insertManualEvent(supabaseData)
                .then((savedEvent) => {
                    const realEvent = supabaseEventToTEvent(savedEvent);
                    confirmEvent(newEvent.id, realEvent);
                    // Update the selected event with the real ID
                    setSelectedEvent(realEvent);
                })
                .catch((error) => {
                    console.error("Error saving event:", error);
                    cleanup();
                    toast.error("Failed to create event");
                    setIsEventDialogOpen(false);
                });
        }
    };

    const handleEventDelete = async (eventId: string) => {
        try {
            // Remove optimistically
            removeEvent(eventId);

            // Check if this is a Google Calendar-only event (not in Supabase)
            if (eventId.startsWith("gcal-")) {
                // Extract the Google Calendar event ID
                const googleEventId = eventId.replace("gcal-", "");

                try {
                    const { deleteGoogleCalendarEvent } = await import(
                        "@/lib/google-calendar"
                    );
                    await deleteGoogleCalendarEvent(googleEventId);
                    toast.success("✓ Event removed from Google Calendar");
                } catch (gcalError: any) {
                    console.error(
                        "Error deleting Google Calendar event:",
                        gcalError
                    );
                    // Re-throw auth errors to trigger session expiry handling
                    if (
                        gcalError?.message?.includes("session") ||
                        gcalError?.message?.includes("authenticated") ||
                        gcalError?.message?.includes("expired") ||
                        gcalError?.message?.includes("token")
                    ) {
                        throw gcalError;
                    }
                    throw new Error(
                        "Failed to delete event from Google Calendar"
                    );
                }
            } else if (user) {
                // Delete from database (which also deletes from Google Calendar if synced)
                await deleteSupabaseEvent(eventId);
                toast.success("✓ Event deleted successfully");
            }
        } catch (error: any) {
            console.error("Error deleting event:", {
                message: error?.message,
                stack: error?.stack,
                error,
            });
            toast.error(
                error?.message || "Failed to delete event. Please try again."
            );

            // Check for session expiry
            if (
                error?.message?.includes("session") ||
                error?.message?.includes("authenticated") ||
                error?.message?.includes("expired") ||
                error?.message?.includes("token")
            ) {
                handleSessionExpiry();
            }

            // Reload events to restore the deleted one
            if (user) {
                try {
                    const supabaseEvents = await fetchUserEvents();
                    const convertedEvents = supabaseEvents.map(
                        supabaseEventToTEvent
                    );
                    setRealEvents(convertedEvents);
                } catch (reloadError) {
                    console.error("Failed to reload events:", reloadError);
                }
            }
        }
    };

    const handleEventUpdate = async (
        eventId: string,
        updates: Partial<TEvent>
    ) => {
        try {
            // Update optimistically
            updateEvent(eventId, updates);

            // Check if this is a Google Calendar-only event
            if (eventId.startsWith("gcal-")) {
                // Extract the Google Calendar event ID
                const googleEventId = eventId.replace("gcal-", "");

                try {
                    const { updateGoogleCalendarEvent } = await import(
                        "@/lib/google-calendar"
                    );
                    await updateGoogleCalendarEvent(googleEventId, updates);
                    toast.success("✓ Event updated in Google Calendar");
                } catch (gcalError: any) {
                    console.error(
                        "Error updating Google Calendar event:",
                        gcalError
                    );
                    // Re-throw auth errors to trigger session expiry handling
                    if (
                        gcalError?.message?.includes("session") ||
                        gcalError?.message?.includes("authenticated") ||
                        gcalError?.message?.includes("expired") ||
                        gcalError?.message?.includes("token")
                    ) {
                        throw gcalError;
                    }
                    throw new Error(
                        "Failed to update event in Google Calendar"
                    );
                }
            } else if (user) {
                // Convert TEvent updates to Supabase format
                const supabaseUpdates: any = {};
                if (updates.title) supabaseUpdates.title = updates.title;
                if (updates.description)
                    supabaseUpdates.description = updates.description;
                if (updates.startTime)
                    supabaseUpdates.start_time =
                        updates.startTime.toISOString();
                if (updates.endTime)
                    supabaseUpdates.end_time = updates.endTime.toISOString();
                if (updates.color) supabaseUpdates.color = updates.color;
                if (updates.location)
                    supabaseUpdates.location = updates.location;
                if (updates.attendees)
                    supabaseUpdates.attendees = updates.attendees;

                await updateSupabaseEvent(eventId, supabaseUpdates);
                toast.success("✓ Event updated successfully");
            }
        } catch (error: any) {
            console.error("Error updating event:", error);
            toast.error(error?.message || "Failed to update event");

            // Check for session expiry
            if (
                error?.message?.includes("session") ||
                error?.message?.includes("authenticated") ||
                error?.message?.includes("expired") ||
                error?.message?.includes("token")
            ) {
                handleSessionExpiry();
            }

            // Reload events to restore original state
            if (user) {
                const supabaseEvents = await fetchUserEvents();
                const convertedEvents = supabaseEvents.map(
                    supabaseEventToTEvent
                );
                setRealEvents(convertedEvents);
            }
        }
    };

    const handleSignOut = async () => {
        try {
            // Clear user state immediately
            setUser(null);
            setRealEvents([]);
            setSessionExpired(false);

            // Sign out from Supabase
            await signOut();

            // Clear any cached data and reload
            if (typeof window !== "undefined") {
                // Clear session storage
                sessionStorage.clear();
                // Force reload from server
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Sign out error:", error);
            toast.error("Failed to sign out. Please try again.");
            // Still try to reload even if error
            window.location.href = "/";
        }
    };

    const handleSessionExpiry = () => {
        setSessionExpired(true);
        toast.error("Session expired. Please sign in again.", {
            duration: Infinity,
            action: {
                label: "Sign Out",
                onClick: () => {
                    handleSignOut();
                },
            },
        });
        // Clear user state to trigger sign-in screen
        setUser(null);
    };

    const handleCommandParsed = async (command: TCommand) => {
        console.log("=== COMMAND PARSED ===", command);
        console.log("Command date:", command.date?.toString());
        console.log("Command time:", command.time);

        // Handle time-finding requests
        if (command.action === "find") {
            try {
                const duration = command.duration || 60; // Default 1 hour
                const title = command.title || "Deep Work Session";

                // Find available time slots
                const suggestions = findAvailableTimeSlots(events, duration, {
                    startDate: new Date(),
                    endDate: addDays(new Date(), 7), // Next 7 days
                    preferredHours: { start: 9, end: 17 }, // 9am-5pm
                    maxSuggestions: 5,
                });

                if (suggestions.length === 0) {
                    toast.error(
                        "No available time slots found in the next 7 days"
                    );
                    return;
                }

                // Show the top suggestion with all options
                const topSuggestion = suggestions[0];
                const formattedTime = format(
                    topSuggestion.startTime,
                    "EEEE, MMM d 'at' h:mm a"
                );

                // Create a toast with buttons for the suggestions
                const suggestionMessage = suggestions
                    .slice(0, 3)
                    .map(
                        (s, i) =>
                            `${i + 1}. ${format(
                                s.startTime,
                                "EEE MMM d, h:mm a"
                            )} - ${s.reason}`
                    )
                    .join("\n");

                toast.success(
                    `Best time: ${formattedTime}\n${topSuggestion.reason}\n\nOther options:\n${suggestionMessage}`,
                    {
                        duration: 10000,
                        action: {
                            label: "Schedule Top Pick",
                            onClick: () => {
                                // Create event at the suggested time
                                const newEvent = createEvent(
                                    title,
                                    topSuggestion.startTime,
                                    duration,
                                    {
                                        color: "#10b981",
                                        description: `AI-suggested time: ${topSuggestion.reason}`,
                                    }
                                );

                                // Add optimistically
                                const cleanup =
                                    addEventOptimistically(newEvent);

                                // Save to database if signed in
                                if (user) {
                                    const supabaseData =
                                        tEventToSupabaseEvent(newEvent);
                                    insertManualEvent(supabaseData)
                                        .then((savedEvent) => {
                                            const realEvent =
                                                supabaseEventToTEvent(
                                                    savedEvent
                                                );
                                            confirmEvent(
                                                newEvent.id,
                                                realEvent
                                            );
                                            toast.success(
                                                "Event scheduled at AI-suggested time!"
                                            );
                                        })
                                        .catch((error) => {
                                            console.error(
                                                "Error saving event:",
                                                error
                                            );
                                            cleanup();
                                            toast.error(
                                                "Failed to create event"
                                            );
                                        });
                                } else {
                                    toast.success(
                                        "Event added (sign in to save permanently)"
                                    );
                                }
                            },
                        },
                    }
                );
            } catch (error) {
                console.error("Error finding time:", error);
                toast.error("Failed to find available time slots");
            }
            return;
        }

        if (command.action === "schedule" || command.action === "block") {
            try {
                if (!command.date) {
                    command.date = new Date();
                }

                const duration = command.duration || 60; // Default 1 hour
                const title = command.title || "New Event";

                // Ensure the date has time information
                if (command.time) {
                    // Time already set in parseCommand
                } else {
                    // Set default time to now or next hour
                    const now = new Date();
                    const nextHour = new Date(command.date);
                    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
                    command.date = nextHour;
                }

                const newEvent = createEvent(title, command.date, duration, {
                    attendees: command.person ? [command.person] : undefined,
                    color: command.action === "block" ? "#f59e0b" : "#3b82f6",
                });

                console.log("Created event:", {
                    title: newEvent.title,
                    startTime: newEvent.startTime.toString(),
                    startHour: newEvent.startTime.getHours(),
                    startMinute: newEvent.startTime.getMinutes(),
                });

                // Add optimistically - UI updates immediately
                const cleanup = addEventOptimistically(newEvent);

                try {
                    // Save to Supabase if user is logged in
                    if (user) {
                        const supabaseData = tEventToSupabaseEvent(newEvent);
                        const savedEvent = await insertManualEvent(
                            supabaseData
                        );
                        const realEvent = supabaseEventToTEvent(savedEvent);

                        // Confirm the optimistic event with real data
                        confirmEvent(newEvent.id, realEvent);
                        toast.success(
                            "✓ Event created and synced to Google Calendar"
                        );
                    } else {
                        // If not logged in, just keep the optimistic event
                        toast.success(
                            "Event added (sign in to save permanently)"
                        );
                    }
                } catch (error: any) {
                    console.error("Error saving event:", {
                        message: error?.message,
                        details: error?.details,
                        hint: error?.hint,
                        code: error?.code,
                        stack: error?.stack,
                        fullError: error,
                    });
                    // Remove optimistic event if save failed
                    cleanup();

                    // Check if it's an auth error
                    if (
                        error.message?.includes("session") ||
                        error.message?.includes("authenticated") ||
                        error.message?.includes("expired")
                    ) {
                        handleSessionExpiry();
                    } else {
                        toast.error("Failed to save event. Please try again.");
                    }
                }
            } catch (error) {
                console.error("Error creating event:", error);
                toast.error("Failed to create event. Please check your input.");
            }
        }
    };

    // Show landing page if not logged in
    if (!user && !isLoading) {
        return <LandingPage onSignIn={handleSignIn} />;
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-slate-900">
                <div className="text-center">
                    <div className="w-24 h-24 flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg overflow-hidden rounded-full bg-white dark:bg-slate-800 p-4">
                        <Image
                            src={Logo}
                            alt="TimeHorse Logo"
                            width={48}
                            height={48}
                            className="object-contain rounded-full"
                        />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    // Show calendar for logged-in users
    return (
        <main className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-gray-950 dark:to-slate-900">
            {/* Session Expired Banner */}
            {sessionExpired && (
                <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg
                            className="w-5 h-5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <div>
                            <p className="font-semibold">Session Expired</p>
                            <p className="text-sm opacity-90">
                                Your session has expired. Please sign out and
                                sign in again to continue.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleSignOut}
                        variant="outline"
                        size="sm"
                        className="bg-white text-red-600 hover:bg-red-50 border-white"
                    >
                        Sign Out
                    </Button>
                </div>
            )}

            {/* Header */}
            <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 shadow-sm">
                {/* Main Header */}
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                                <Image
                                    src={Logo}
                                    alt="TimeHorse Logo"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    TimeHorse
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    AI-Powered Calendar
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Desktop info */}
                            <div className="hidden md:flex items-center gap-2 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-xs font-medium">
                                    {user?.email}
                                </span>
                            </div>

                            <div className="text-right hidden md:block">
                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {new Date().toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                    {events.length} events
                                </div>
                            </div>

                            {/* Desktop Sign Out */}
                            <Button
                                onClick={handleSignOut}
                                variant="outline"
                                size="sm"
                                className="hidden md:flex gap-2 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/50 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Sign Out</span>
                            </Button>

                            {/* Mobile Profile Icon */}
                            <Button
                                onClick={() => setIsProfileSheetOpen(true)}
                                variant="outline"
                                size="sm"
                                className="md:hidden rounded-full h-9 w-9 p-0"
                            >
                                <User className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
            {/* Calendar */}
            <div className="flex-1 overflow-hidden relative">
                <WeeklyTimeline
                    events={events}
                    onEventClick={handleEventClick}
                    onTimeSlotClick={handleTimeSlotClick}
                />

                {/* Magic Bar */}
                <div className="absolute bottom-0 left-0 right-0">
                    <MagicBar onCommandParsed={handleCommandParsed} />
                </div>
            </div>
            {/* Event Dialog */}
            <EventDialog
                event={selectedEvent}
                open={isEventDialogOpen}
                onOpenChange={(open) => {
                    setIsEventDialogOpen(open);
                    if (!open) setIsNewEvent(false);
                }}
                onDelete={handleEventDelete}
                onUpdate={handleEventUpdate}
                autoEdit={isNewEvent}
            />

            {/* Profile Sheet */}
            <Sheet
                open={isProfileSheetOpen}
                onOpenChange={setIsProfileSheetOpen}
            >
                <SheetContent side="right">
                    <SheetHeader>
                        <SheetTitle>Profile</SheetTitle>
                        <SheetDescription>
                            Your account information and settings
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-8 space-y-6">
                        {/* Email Section */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>Email</span>
                            </div>
                            <div className="pl-6 text-sm text-slate-600 dark:text-slate-400 break-all">
                                {user?.email}
                            </div>
                        </div>

                        {/* Events Info Section */}
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Calendar Stats
                            </div>
                            <div className="pl-6 space-y-1">
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    Total Events:{" "}
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                        {events.length}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-500">
                                    {new Date().toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button
                                onClick={() => {
                                    setIsProfileSheetOpen(false);
                                    handleSignOut();
                                }}
                                variant="outline"
                                className="w-full gap-2 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/50 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Sign Out</span>
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </main>
    );
}
