"use client";

import { TEvent } from "@/types";
import { getEventPosition } from "@/lib/calendar-utils";
import { Clock, MapPin, Users } from "lucide-react";

interface EventCardProps {
    event: TEvent;
    onClick?: (e: React.MouseEvent) => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
    const position = getEventPosition(event);
    const startTime = new Date(event.startTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    // Debug: log the actual hours being used for positioning
    const startDate =
        event.startTime instanceof Date
            ? event.startTime
            : new Date(event.startTime);
    console.log(
        `Event "${
            event.title
        }": Display=${startTime}, Position hours=${startDate.getHours()}, Position=${
            position.top
        }`
    );

    return (
        <div
            className="absolute left-0 right-0 mx-1 rounded-md p-2 text-xs overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group"
            style={{
                top: position.top,
                height: position.height,
                backgroundColor: event.color || "#3b82f6",
                minHeight: "2.5rem",
            }}
            onClick={onClick}
        >
            <div className="text-white font-medium truncate">{event.title}</div>
            <div className="flex items-center gap-1 text-white/90 mt-1">
                <Clock className="w-3 h-3" />
                <span>{startTime}</span>
            </div>
            {event.location && (
                <div className="flex items-center gap-1 text-white/80 mt-0.5 truncate">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.location}</span>
                </div>
            )}
            {event.attendees && event.attendees.length > 0 && (
                <div className="flex items-center gap-1 text-white/80 mt-0.5">
                    <Users className="w-3 h-3" />
                    <span>{event.attendees.length}</span>
                </div>
            )}
        </div>
    );
}
