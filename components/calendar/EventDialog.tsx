"use client";

import { useState } from "react";
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
}

export function EventDialog({
    event,
    open,
    onOpenChange,
    onDelete,
    onUpdate,
}: EventDialogProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(event?.title || "");

    if (!event) return null;

    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const duration = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    );

    const handleSave = () => {
        if (editedTitle.trim() && editedTitle !== event.title) {
            onUpdate(event.id, { title: editedTitle.trim() });
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
                        <div>
                            <div className="font-medium">
                                {format(startTime, "h:mm a")} -{" "}
                                {format(endTime, "h:mm a")}
                            </div>
                            <div className="text-xs text-gray-500">
                                {duration} minutes
                            </div>
                        </div>
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
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 sm:flex-none sm:min-w-[90px]"
                                >
                                    Edit Title
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
