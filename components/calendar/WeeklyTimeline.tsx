"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Battery } from "lucide-react";
import { format, addWeeks, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    getWeekDays,
    getTimeSlots,
    filterEventsForDay,
} from "@/lib/calendar-utils";
import { calculateEnergyScore } from "@/lib/energy-score";
import { TEvent } from "@/types";
import { TimeColumn } from "./TimeColumn";
import { DayColumn } from "./DayColumn";
import { EnergyScoreLegend } from "./EnergyScoreLegend";

interface WeeklyTimelineProps {
    events: TEvent[];
    onEventClick?: (event: TEvent) => void;
    onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function WeeklyTimeline({
    events,
    onEventClick,
    onTimeSlotClick,
}: WeeklyTimelineProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const weekDays = getWeekDays(currentDate);
    const timeSlots = getTimeSlots();

    // Distribute events to their respective days
    const weekDaysWithEvents = weekDays.map((day) => ({
        ...day,
        events: filterEventsForDay(events, day.date),
    }));

    // Calculate energy scores for each day
    const energyScores = useMemo(() => {
        const scores = new Map();
        weekDaysWithEvents.forEach((day) => {
            const dateKey = day.date.toISOString().split("T")[0];
            scores.set(dateKey, calculateEnergyScore(day.events, day.date));
        });
        return scores;
    }, [weekDaysWithEvents]);

    const goToPreviousWeek = () => {
        setCurrentDate(subWeeks(currentDate, 1));
    };

    const goToNextWeek = () => {
        setCurrentDate(addWeeks(currentDate, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-gray-950 dark:to-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-slate-900 via-indigo-700 to-blue-700 dark:from-white dark:via-indigo-300 dark:to-blue-300 bg-clip-text text-transparent">
                        {format(currentDate, "MMMM yyyy")}
                    </h2>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={goToPreviousWeek}
                            className="h-9 w-9 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950/50 dark:hover:border-indigo-800 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToToday}
                            className="h-9 px-4 rounded-lg hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/50 dark:hover:border-blue-800 font-medium transition-colors"
                        >
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Today</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={goToNextWeek}
                            className="h-9 w-9 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950/50 dark:hover:border-indigo-800 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-950/50 dark:to-blue-950/50 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg font-medium text-sm border border-indigo-200/50 dark:border-indigo-800/50">
                    Week {format(weekDays[0].date, "w")}
                </div>

                {/* Compact Energy Score Summary */}
                <div className="hidden lg:flex items-center gap-4 text-sm">
                    {(() => {
                        const scores = Array.from(energyScores.values());
                        if (scores.length === 0) return null;
                        const avgScore = Math.round(
                            scores.reduce((sum, s) => sum + s.score, 0) /
                                scores.length
                        );
                        const totalFocus = Math.floor(
                            scores.reduce(
                                (sum, s) => sum + s.focusTimeMinutes,
                                0
                            ) / 60
                        );
                        return (
                            <>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <Battery className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                        {avgScore}%
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                        {totalFocus}h
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-400">
                                        focus
                                    </span>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50/50 to-blue-50/40 dark:from-gray-950/50 dark:to-slate-900/50">
                <div className="flex min-w-max pb-64 max-lg:pb-84">
                    <TimeColumn timeSlots={timeSlots} />
                    {weekDaysWithEvents.map((day) => {
                        const dateKey = day.date.toISOString().split("T")[0];
                        return (
                            <DayColumn
                                key={day.date.toISOString()}
                                day={day}
                                timeSlots={timeSlots}
                                energyScore={energyScores.get(dateKey)}
                                onEventClick={onEventClick}
                                onTimeSlotClick={onTimeSlotClick}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
