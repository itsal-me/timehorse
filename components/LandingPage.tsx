"use client";

import Image from "next/image";
import {
    Sparkles,
    Calendar,
    Zap,
    Battery,
    Shield,
    Rocket,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/logo.png";

interface LandingPageProps {
    onSignIn: () => void;
}

export function LandingPage({ onSignIn }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-slate-200/30 rounded-full blur-3xl" />
                </div>

                <div className="relative container mx-auto px-6 py-20">
                    {/* Navigation */}
                    <nav className="flex items-center justify-between max-sm:justify-center mb-24">
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
                        <Button
                            onClick={onSignIn}
                            className="max-sm:hidden bg-white hover:bg-gray-50 text-gray-700 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-700 px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all border border-gray-300 flex items-center gap-3"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Sign in with Google
                        </Button>
                    </nav>

                    {/* Hero Content */}
                    <div className="text-center max-w-4xl mx-auto mb-24">
                        <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full mb-8 border border-indigo-200 dark:border-indigo-800">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="text-sm font-medium">
                                Powered by AI
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
                            <span className="bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-200 bg-clip-text text-transparent">
                                Schedule Smarter,
                            </span>
                            <br />
                            <span className="text-slate-700 dark:text-slate-300">
                                Work Better
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Transform your calendar with natural language. Just
                            type "Schedule coffee with Sarah next Tuesday" and
                            let AI handle the rest.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={onSignIn}
                                size="lg"
                                className="bg-white hover:bg-gray-50 text-gray-700 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-700 text-base px-8 py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all border border-gray-300 flex items-center gap-3"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 18 18"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Get Started with Google
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-base px-8 py-6 rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
                            >
                                Watch Demo
                            </Button>
                        </div>
                    </div>

                    {/* Demo Magic Bar */}
                    <div className="max-w-3xl mx-auto mb-20">
                        <Card className="p-5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                                <span className="text-base">
                                    "Schedule a 1-hour coffee with Sarah next
                                    Tuesday at 2pm"
                                </span>
                                <div className="ml-auto flex-shrink-0">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                                        <div
                                            className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"
                                            style={{ animationDelay: "150ms" }}
                                        />
                                        <div
                                            className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-pulse"
                                            style={{ animationDelay: "300ms" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm py-24">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight">
                        <span className="bg-gradient-to-r from-slate-900 via-indigo-700 to-blue-700 dark:from-white dark:via-indigo-300 dark:to-blue-300 bg-clip-text text-transparent">
                            Supercharge Your Productivity
                        </span>
                    </h2>
                    <p className="text-center text-slate-600 dark:text-slate-400 mb-16 text-lg">
                        Features that make scheduling effortless
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Feature 1 */}
                        <Card className="p-7 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-200/50 dark:border-indigo-800/50 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                                Magic Bar
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                Type naturally and let AI parse your intent. No
                                complex forms or dropdowns - just talk like a
                                human.
                            </p>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="p-7 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                                Google Calendar Sync
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                Seamlessly integrate with your existing Google
                                Calendar. All your events in one place.
                            </p>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="p-7 bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                                <Battery className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                                Energy Score
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                See your focus time at a glance. Days are
                                color-coded from green to red based on available
                                time.
                            </p>
                        </Card>

                        {/* Feature 4 */}
                        <Card className="p-7 bg-gradient-to-br from-violet-50/80 to-purple-50/80 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200/50 dark:border-violet-800/50 hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-700 transition-all">
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                                Instant Updates
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                Optimistic UI means your events appear
                                instantly. No waiting, no loading spinners.
                            </p>
                        </Card>

                        {/* Feature 5 */}
                        <Card className="p-7 bg-gradient-to-br from-slate-50/80 to-gray-50/80 dark:from-slate-950/30 dark:to-gray-950/30 border border-slate-200/50 dark:border-slate-800/50 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-gray-700 rounded-xl flex items-center justify-center mb-4 shadow-md">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                                Secure & Private
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                Your data is encrypted and protected. Row-level
                                security ensures only you see your events.
                            </p>
                        </Card>

                        {/* Feature 6 */}
                        <Card className="p-7 bg-gradient-to-br from-sky-50/80 to-indigo-50/80 dark:from-sky-950/30 dark:to-indigo-950/30 border border-sky-200/50 dark:border-sky-800/50 hover:shadow-lg hover:border-sky-300 dark:hover:border-sky-700 transition-all">
                            <div className="w-12 h-12 bg-gradient-to-br from-sky-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                                <Rocket className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                                AI Powered
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                Gemma 3 27B understands context and creates
                                perfect events from your natural language.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative py-24">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        <span className="bg-gradient-to-r from-slate-900 via-indigo-700 to-blue-700 dark:from-white dark:via-indigo-300 dark:to-blue-300 bg-clip-text text-transparent">
                            Ready to Transform Your Calendar?
                        </span>
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join productive professionals who schedule smarter with
                        TimeHorse
                    </p>
                    <Button
                        onClick={onSignIn}
                        size="lg"
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-lg px-12 py-7 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Start Scheduling Smarter
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm py-8 border-t border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-6 text-center text-slate-600 dark:text-slate-400">
                    <p className="text-sm">
                        Built with ❤️ using Next.js, Supabase, OpenRouter, and
                        shadcn/ui
                    </p>
                </div>
            </footer>
        </div>
    );
}
