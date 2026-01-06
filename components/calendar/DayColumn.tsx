"use client";

import { TWeekDay, TTimeSlot, TEvent } from "@/types";
import { EventCard } from "./EventCard";
import { EnergyScore } from "@/lib/energy-score";
import {
    Battery,
    BatteryLow,
    BatteryMedium,
    BatteryFull,
    Zap,
} from "lucide-react";

interface DayColumnProps {
    day: TWeekDay;
    timeSlots: TTimeSlot[];
    energyScore?: EnergyScore;
    onEventClick?: (event: TEvent) => void;
    onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function DayColumn({
    day,
    timeSlots,
    energyScore,
    onEventClick,
    onTimeSlotClick,
}: DayColumnProps) {
    const getBatteryIcon = (score?: number) => {
        if (!score) return Battery;
        if (score >= 80) return BatteryFull;
        if (score >= 40) return BatteryMedium;
        return BatteryLow;
    };

    const BatteryIcon = getBatteryIcon(energyScore?.score);

    return (
        <div className="flex-1 min-w-[120px] border-r border-gray-200 dark:border-gray-700 relative">
            {/* Day Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3 text-center">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {day.dayName}
                </div>
                <div
                    className={`text-2xl font-semibold mt-1 ${
                        day.isToday
                            ? "text-white bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center mx-auto"
                            : "text-gray-900 dark:text-gray-100"
                    }`}
                >
                    {day.dayNumber}
                </div>

                {/* Energy Score Indicator */}
                {energyScore && (
                    <div className="mt-2 space-y-1">
                        <div
                            className="flex items-center justify-center gap-1 text-xs font-medium"
                            style={{ color: energyScore.color }}
                        >
                            <BatteryIcon className="w-3.5 h-3.5" />
                            <span>{energyScore.score}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${energyScore.score}%`,
                                    backgroundColor: energyScore.color,
                                }}
                            />
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                            {Math.floor(energyScore.focusTimeMinutes / 60)}h{" "}
                            {energyScore.focusTimeMinutes % 60}m focus
                        </div>
                    </div>
                )}
            </div>

            {/* Time Slots */}
            <div
                className="relative pt-[120px]"
                style={{ height: `${timeSlots.length * 4}rem` }}
            >
                {/* Clickable hour slots */}
                {timeSlots.map((slot) => (
                    <div
                        key={slot.hour}
                        className="absolute left-0 right-0 border-b border-gray-100 dark:border-gray-800 h-16 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer group"
                        style={{ top: `${slot.hour * 4}rem` }}
                        onClick={() => onTimeSlotClick?.(day.date, slot.hour)}
                        title={`Create event at ${slot.label}`}
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-lg">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Events */}
                {day.events.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
