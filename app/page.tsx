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
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";
import Logo from "@/logo.png";

export default function Home() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<TEvent | null>(null);
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
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
                    setRealEvents(convertedEvents);
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

            // Delete from database if signed in
            if (user) {
                await deleteSupabaseEvent(eventId);
                toast.success("Event deleted successfully");
            }
        } catch (error: any) {
            console.error("Error deleting event:", error);
            toast.error("Failed to delete event");
            // Reload events to restore the deleted one
            if (user) {
                const supabaseEvents = await fetchUserEvents();
                const convertedEvents = supabaseEvents.map(
                    supabaseEventToTEvent
                );
                setRealEvents(convertedEvents);
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

            // Update in database if signed in
            if (user) {
                // Convert TEvent updates to Supabase format
                const supabaseUpdates: any = {};
                if (updates.title) supabaseUpdates.title = updates.title;
                if (updates.description)
                    supabaseUpdates.description = updates.description;
                if (updates.color) supabaseUpdates.color = updates.color;
                if (updates.location)
                    supabaseUpdates.location = updates.location;
                if (updates.attendees)
                    supabaseUpdates.attendees = updates.attendees;

                await updateSupabaseEvent(eventId, supabaseUpdates);
                toast.success("Event updated successfully");
            }
        } catch (error: any) {
            console.error("Error updating event:", error);
            toast.error("Failed to update event");
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

    const handleCommandParsed = async (command: TCommand) => {
        console.log("=== COMMAND PARSED ===", command);
        console.log("Command date:", command.date?.toString());
        console.log("Command time:", command.time);

        // Handle time-finding requests
        if (command.action === "find") {
            try {
                const duration = command.duration || 120; // Default 2 hours for deep work
                const title = command.title || "Deep Work Session";

                // Find available time slots
                const suggestions = findAvailableTimeSlots(events, duration, {
                    startDate: new Date(),
                    endDate: addDays(new Date(), 7), // Next 7 days
                    preferredHours: { start: 9, end: 17 }, // 9am-5pm
                    maxSuggestions: 5,
                });

                if (suggestions.length === 0) {
                    toast.error("No available time slots found in the next 7 days");
                    return;
                }

                // Show the top suggestion with all options
                const topSuggestion = suggestions[0];
                const formattedTime = format(topSuggestion.startTime, "EEEE, MMM d 'at' h:mm a");
                
                // Create a toast with buttons for the suggestions
                const suggestionMessage = suggestions
                    .slice(0, 3)
                    .map((s, i) => `${i + 1}. ${format(s.startTime, "EEE MMM d, h:mm a")} - ${s.reason}`)
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
                                const cleanup = addEventOptimistically(newEvent);

                                // Save to database if signed in
                                if (user) {
                                    const supabaseData = tEventToSupabaseEvent(newEvent);
                                    insertManualEvent(supabaseData)
                                        .then((savedEvent) => {
                                            const realEvent = supabaseEventToTEvent(savedEvent);
                                            confirmEvent(newEvent.id, realEvent);
                                            toast.success("Event scheduled at AI-suggested time!");
                                        })
                                        .catch((error) => {
                                            console.error("Error saving event:", error);
                                            cleanup();
                                            toast.error("Failed to create event");
                                        });
                                } else {
                                    toast.success("Event added (sign in to save permanently)");
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
                        toast.success("Event created successfully!");
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
                        error.message?.includes("authenticated")
                    ) {
                        toast.error("Session expired. Please sign in again.");
                        // Clear user state to trigger sign-in
                        setUser(null);
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
                    <div className="flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg overflow-hidden">
                        <Image
                            src={Logo}
                            alt="TimeHorse Logo"
                            width={48}
                            height={48}
                            className="object-contain"
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
            {/* Header */}
            <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-6 py-4 shadow-sm">
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
                        <div className="hidden md:flex items-center gap-2 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-medium">
                                {user?.email}
                            </span>
                        </div>

                        <div className="text-right hidden sm:block">
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

                        <Button
                            onClick={handleSignOut}
                            variant="outline"
                            size="sm"
                            className="gap-2 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/50 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </Button>
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
                onOpenChange={setIsEventDialogOpen}
                onDelete={handleEventDelete}
                onUpdate={handleEventUpdate}
            />{" "}
        </main>
    );
}
