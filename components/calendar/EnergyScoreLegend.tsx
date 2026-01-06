"use client";

import { Card } from "@/components/ui/card";
import { EnergyScore } from "@/lib/energy-score";
import {
    Battery,
    BatteryFull,
    BatteryMedium,
    BatteryLow,
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";

interface EnergyScoreLegendProps {
    weekScores: Map<string, EnergyScore>;
}

export function EnergyScoreLegend({ weekScores }: EnergyScoreLegendProps) {
    const scores = Array.from(weekScores.values());

    if (scores.length === 0) return null;

    const averageScore = Math.round(
        scores.reduce((sum, s) => sum + s.score, 0) / scores.length
    );

    const totalFocusHours = Math.floor(
        scores.reduce((sum, s) => sum + s.focusTimeMinutes, 0) / 60
    );

    const totalMeetingHours = Math.floor(
        scores.reduce((sum, s) => sum + s.meetingTimeMinutes, 0) / 60
    );

    const bestDay = scores.reduce((best, curr) =>
        curr.score > best.score ? curr : best
    );

    const worstDay = scores.reduce((worst, curr) =>
        curr.score < worst.score ? curr : worst
    );

    const getAverageIcon = () => {
        if (averageScore >= 80) return BatteryFull;
        if (averageScore >= 40) return BatteryMedium;
        return BatteryLow;
    };

    const AverageIcon = getAverageIcon();

    return (
        <Card className="p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
                <Battery className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Energy Score
                </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Average Score */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <AverageIcon
                            className="w-4 h-4"
                            style={{ color: bestDay.color }}
                        />
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {averageScore}%
                        </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        Week Average
                    </div>
                </div>

                {/* Total Focus Time */}
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {totalFocusHours}h
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        Focus Time
                    </div>
                </div>

                {/* Total Meeting Time */}
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {totalMeetingHours}h
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        Meetings
                    </div>
                </div>

                {/* Best/Worst Day Indicator */}
                <div className="text-center">
                    {bestDay.score === worstDay.score ? (
                        <>
                            <div className="flex items-center justify-center gap-1">
                                <Minus className="w-4 h-4 text-gray-400" />
                                <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                    Balanced
                                </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                Week Status
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-center gap-1">
                                {bestDay.score - worstDay.score > 40 ? (
                                    <>
                                        <TrendingDown className="w-4 h-4 text-orange-500" />
                                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                            {bestDay.score - worstDay.score}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {bestDay.score - worstDay.score}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                Variance
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Energy Levels:
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: "#10b981" }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                            Excellent (80%+)
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: "#84cc16" }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                            Good (60-79%)
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: "#eab308" }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                            Moderate (40-59%)
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: "#f97316" }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                            Busy (20-39%)
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: "#ef4444" }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                            Overloaded (&lt;20%)
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
