"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TEvent } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, MapPin, Users, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface EventDialogProps {
    event: TEvent | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: (eventId: string) => void;
    onUpdate: (eventId: string, updates: Partial<TEvent>) => void;
    autoEdit?: boolean;
}

export function EventDialog({
    event,
    open,
    onOpenChange,
    onDelete,
    onUpdate,
    autoEdit = false,
}: EventDialogProps) {
    const [isEditing, setIsEditing] = useState(autoEdit);
    const [editedTitle, setEditedTitle] = useState(event?.title || "");
    const [editedStartTime, setEditedStartTime] = useState("");
    const [editedEndTime, setEditedEndTime] = useState("");

    // Auto-enable edit mode when autoEdit is true and dialog opens
    useEffect(() => {
        if (autoEdit && open && event) {
            setIsEditing(true);
            setEditedTitle(event.title);
            setEditedStartTime(format(new Date(event.startTime), "HH:mm"));
            setEditedEndTime(format(new Date(event.endTime), "HH:mm"));
        }
    }, [autoEdit, open, event]);

    if (!event) return null;

    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const duration = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    );

    // Initialize time values when entering edit mode
    const handleStartEdit = () => {
        setIsEditing(true);
        setEditedStartTime(format(startTime, "HH:mm"));
        setEditedEndTime(format(endTime, "HH:mm"));
    };

    const handleSave = () => {
        const updates: Partial<TEvent> = {};

        // Update title if changed
        if (editedTitle.trim() && editedTitle !== event.title) {
            updates.title = editedTitle.trim();
        }

        // Update times if changed
        if (editedStartTime || editedEndTime) {
            const newStartTime = new Date(startTime);
            const newEndTime = new Date(endTime);

            if (editedStartTime) {
                const [hours, minutes] = editedStartTime.split(":").map(Number);
                newStartTime.setHours(hours, minutes, 0, 0);
                updates.startTime = newStartTime;
            }

            if (editedEndTime) {
                const [hours, minutes] = editedEndTime.split(":").map(Number);
                newEndTime.setHours(hours, minutes, 0, 0);
                updates.endTime = newEndTime;
            }

            // Validate that end time is after start time
            if (updates.startTime && updates.endTime) {
                if (updates.endTime <= updates.startTime) {
                    toast.error("End time must be after start time");
                    return;
                }
            } else if (updates.startTime && !updates.endTime) {
                if (newEndTime <= updates.startTime) {
                    toast.error("End time must be after start time");
                    return;
                }
            } else if (!updates.startTime && updates.endTime) {
                if (updates.endTime <= newStartTime) {
                    toast.error("End time must be after start time");
                    return;
                }
            }
        }

        if (Object.keys(updates).length > 0) {
            onUpdate(event.id, updates);
        }

        setIsEditing(false);
        onOpenChange(false);
    };

    const handleDelete = () => {
        toast.warning(`Delete "${event.title}"?`, {
            description: "This action cannot be undone.",
            action: {
                label: "Delete",
                onClick: () => {
                    onDelete(event.id);
                    onOpenChange(false);
                },
            },
            cancel: {
                label: "Cancel",
                onClick: () => {},
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] gap-6">
                <DialogHeader className="space-y-3 pr-8">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: event.color }}
                        />
                        {isEditing ? (
                            <Input
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="flex-1"
                                placeholder="Event title"
                                autoFocus
                            />
                        ) : (
                            <span>{event.title}</span>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Event details and actions
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {isEditing ? (
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="time"
                                        value={editedStartTime}
                                        onChange={(e) =>
                                            setEditedStartTime(e.target.value)
                                        }
                                        className="flex-1"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <Input
                                        type="time"
                                        value={editedEndTime}
                                        onChange={(e) =>
                                            setEditedEndTime(e.target.value)
                                        }
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="font-medium">
                                    {format(startTime, "h:mm a")} -{" "}
                                    {format(endTime, "h:mm a")}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {duration} minutes
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div className="font-medium">
                            {format(startTime, "EEEE, MMMM d, yyyy")}
                        </div>
                    </div>

                    {event.location && (
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{event.location}</span>
                        </div>
                    )}

                    {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center gap-3 text-sm">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>{event.attendees.join(", ")}</span>
                        </div>
                    )}

                    {event.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                            {event.description}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        className="gap-2 w-full sm:w-auto"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </Button>

                    <div className="flex gap-2 w-full sm:w-auto">
                        {isEditing ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedTitle(event.title);
                                        setEditedStartTime("");
                                        setEditedEndTime("");
                                    }}
                                    className="flex-1 sm:flex-none sm:min-w-[80px]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    className="flex-1 sm:flex-none sm:min-w-[80px]"
                                >
                                    Save
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleStartEdit}
                                    className="flex-1 sm:flex-none sm:min-w-[90px]"
                                >
                                    Edit Event
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => onOpenChange(false)}
                                    className="flex-1 sm:flex-none sm:min-w-[80px]"
                                >
                                    Close
                                </Button>
                            </>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
