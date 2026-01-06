"use client";

import { TTimeSlot } from "@/types";

interface TimeColumnProps {
    timeSlots: TTimeSlot[];
}

export function TimeColumn({ timeSlots }: TimeColumnProps) {
    return (
        <div className="w-20 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
            {/* Empty space for day header alignment */}
            <div className="h-[73px] border-b border-gray-200 dark:border-gray-700" />

            {/* Time Labels */}
            <div
                className="relative pt-[120px]"
                style={{ height: `${timeSlots.length * 4}rem` }}
            >
                {timeSlots.map((slot) => (
                    <div
                        key={slot.hour}
                        className="absolute right-0 pr-2"
                        style={{ top: `${(slot.hour + 1) * 4}rem` }}
                    >
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {slot.label}
                        </span>
                    </div>
                ))}

                {/* Hour dividers */}
                {timeSlots.map((slot) => (
                    <div
                        key={`divider-${slot.hour}`}
                        className="absolute left-0 right-0 border-b border-gray-100 dark:border-gray-800 h-16"
                        style={{ top: `${(slot.hour + 1) * 4}rem` }}
                    />
                ))}
            </div>
        </div>
    );
}
