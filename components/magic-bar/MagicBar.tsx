"use client";

import { useState, KeyboardEvent } from "react";
import { Sparkles, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseCommand, commandToSentence } from "@/lib/ai-parser";
import { TCommand } from "@/types";

interface MagicBarProps {
    onCommandParsed?: (command: TCommand) => void;
}

export function MagicBar({ onCommandParsed }: MagicBarProps) {
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = () => {
        if (!input.trim()) return;

        setIsProcessing(true);

        // Parse the command
        const command = parseCommand(input);

        if (command) {
            console.log("Parsed command:", command);
            console.log("Readable:", commandToSentence(command));
            onCommandParsed?.(command);
        }

        setTimeout(() => {
            setIsProcessing(false);
            setInput("");
        }, 500);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 dark:to-transparent p-6 backdrop-blur-md pointer-events-none">
            <div className="max-w-4xl mx-auto">
                <div className="relative bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/50 rounded-xl shadow-xl shadow-indigo-500/10 pointer-events-auto">
                    <div className="absolute -top-3 left-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3" />
                        Magic Bar
                    </div>

                    <div className="flex items-center gap-2 p-3">
                        <div className="flex-1 relative">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Find me time for a 2-hour meeting with Sarah..."
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base pr-4 bg-transparent placeholder:text-slate-400"
                                disabled={isProcessing}
                            />
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={!input.trim() || isProcessing}
                            size="icon"
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-lg h-10 w-10 flex-shrink-0 shadow-sm"
                        >
                            {isProcessing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Suggestions */}
                    <div className="px-4 pb-3 flex flex-wrap gap-2">
                        {[
                            "Find me time for 2-hour deep dive on project X",
                            "Schedule meeting with team tomorrow at 2pm",
                            "When can I schedule a 90-minute workshop?",
                        ].map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => setInput(suggestion)}
                                className="text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 px-3 py-1 rounded-md transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Try: "Find me time for a 2-hour meeting" or "When can I
                    schedule 90 minutes for deep work?"
                </div>
            </div>
        </div>
    );
}
