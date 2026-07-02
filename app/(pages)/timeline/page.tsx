"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Heart,
    Smile,
    Frown,
    Meh,
    Sparkles,
    AlertCircle,
    TrendingUp,
    BookOpen,
    Clock,
    Filter,
    Search,
    X,
    Eye,
} from "lucide-react";

type Mood = "happy" | "calm" | "proud" | "joyful" | "relaxed" | "sad" | "angry" | "neutral";

interface DiaryEntry {
    id: string;
    title: string;
    content: string;
    date: string;
    mood: Mood | "neutral";
    tags: string[];
}

// ─── MOOD ICONS ──────────────────────────────────────────────
const moodIcons: Record<string, React.ReactElement> = {
    happy: <Smile className="text-emerald-500" size={18} />,
    proud: <Sparkles className="text-indigo-500" size={18} />,
    calm: <Heart className="text-rose-500" size={18} />,
    joyful: <Smile className="text-yellow-500" size={18} />,
    relaxed: <Meh className="text-blue-500" size={18} />,
    sad: <Frown className="text-gray-400" size={18} />,
    angry: <AlertCircle className="text-red-500" size={18} />,
    neutral: <Meh className="text-gray-400" size={18} />,
};

const moodColors: Record<string, string> = {
    happy: "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
    proud: "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30",
    calm: "border-rose-400 bg-rose-50 dark:bg-rose-950/30",
    joyful: "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30",
    relaxed: "border-blue-400 bg-blue-50 dark:bg-blue-950/30",
    sad: "border-gray-400 bg-gray-50 dark:bg-gray-950/30",
    angry: "border-red-400 bg-red-50 dark:bg-red-950/30",
    neutral: "border-gray-400 bg-gray-50 dark:bg-gray-950/30",
};

const moodLabels: Record<string, string> = {
    happy: "Happy",
    proud: "Proud",
    calm: "Calm",
    joyful: "Joyful",
    relaxed: "Relaxed",
    sad: "Sad",
    angry: "Angry",
    neutral: "Neutral",
};

// ─── HELPERS ──────────────────────────────────────────────────
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

const isYesterday = (dateString: string) => {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getDate() === yesterday.getDate() &&
           date.getMonth() === yesterday.getMonth() &&
           date.getFullYear() === yesterday.getFullYear();
};

const getGroupLabel = (dateString: string): string => {
    if (isToday(dateString)) return "Today";
    if (isYesterday(dateString)) return "Yesterday";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date);
};

const getMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
    }).format(date);
};

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function TimelinePage() {
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

    // ─── LOAD ENTRIES ──────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem("token");
        if(!token){
            window.location.href = "/login";
        }
        
        const stored = localStorage.getItem("diaryEntries");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setEntries(parsed);
                setFilteredEntries(parsed);
            } catch (e) {
                console.error("Failed to parse entries", e);
            }
        }
        setIsLoading(false);
    }, []);

    // ─── FILTER ENTRIES ────────────────────────────────────────
    useEffect(() => {
        let filtered = entries;

        // Filter by search
        if (searchTerm) {
            filtered = filtered.filter(
                (entry) =>
                    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    entry.tags.some((tag) =>
                        tag.toLowerCase().includes(searchTerm.toLowerCase())
                    )
            );
        }

        // Filter by mood
        if (selectedMood) {
            filtered = filtered.filter((entry) => entry.mood === selectedMood);
        }

        // Filter by year/month
        filtered = filtered.filter((entry) => {
            const date = new Date(entry.date);
            return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
        });

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setFilteredEntries(filtered);
    }, [entries, searchTerm, selectedMood, currentYear, currentMonth]);

    // ─── NAVIGATION ────────────────────────────────────────────
    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const goToToday = () => {
        const now = new Date();
        setCurrentMonth(now.getMonth());
        setCurrentYear(now.getFullYear());
    };

    // ─── STATS ──────────────────────────────────────────────────
    const totalEntries = entries.length;
    const entriesThisMonth = entries.filter((entry) => {
        const date = new Date(entry.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    const moodCounts = entries.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";

    // ─── RENDER FUNCTIONS ──────────────────────────────────────
    const renderTimeline = () => {
        if (filteredEntries.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="rounded-full bg-gray-100 p-6 dark:bg-slate-800">
                        <BookOpen size={48} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">
                        No entries this month
                    </h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        {searchTerm || selectedMood
                            ? "Try adjusting your search or filters"
                            : "Write your first diary entry to start your timeline!"}
                    </p>
                    {!searchTerm && !selectedMood && (
                        <Link
                            href="/write"
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-6 py-2.5 font-semibold text-white shadow-lg transition hover:scale-105"
                        >
                            <BookOpen size={18} />
                            Write Now
                        </Link>
                    )}
                </div>
            );
        }

        // Group entries by day
        const grouped: Record<string, DiaryEntry[]> = {};
        filteredEntries.forEach((entry) => {
            const key = new Date(entry.date).toDateString();
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(entry);
        });

        const keys = Object.keys(grouped);

        return (
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-400 via-pink-400 to-indigo-400 dark:from-indigo-600 dark:via-pink-600 dark:to-indigo-600" />

                {keys.map((key, index) => {
                    const dayEntries = grouped[key];
                    const date = new Date(key);
                    const isFirst = index === 0;
                    const groupLabel = getGroupLabel(key);

                    return (
                        <div key={key} className="relative pl-12 pb-8 last:pb-0">
                            {/* Timeline dot */}
                            <div
                                className={`absolute left-2 top-1.5 h-5 w-5 rounded-full border-2 ${
                                    isFirst
                                        ? "border-indigo-500 bg-indigo-500 dark:border-indigo-400 dark:bg-indigo-400"
                                        : "border-gray-300 bg-white dark:border-gray-600 dark:bg-slate-800"
                                }`}
                            />

                            {/* Date label */}
                            <div className="mb-4 flex items-center gap-3">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {groupLabel}
                                </span>
                                <span className="text-sm text-gray-400 dark:text-gray-500">
                                    {dayEntries.length} entry{dayEntries.length > 1 ? "s" : ""}
                                </span>
                            </div>

                            {/* Entries for this day */}
                            <div className="space-y-3">
                                {dayEntries.map((entry) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`group rounded-2xl border-l-4 ${moodColors[entry.mood] || moodColors.neutral} bg-white/60 p-4 backdrop-blur-sm transition-all hover:shadow-md dark:bg-slate-900/60`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatTime(entry.date)}
                                                    </span>
                                                    <span className="text-gray-300 dark:text-gray-600">·</span>
                                                    <span className="flex items-center gap-1 text-sm capitalize">
                                                        {moodIcons[entry.mood] || moodIcons.neutral}
                                                        {moodLabels[entry.mood] || entry.mood}
                                                    </span>
                                                </div>
                                                <Link
                                                    href={`/write?id=${entry.id}`}
                                                    className="block"
                                                >
                                                    <h4 className="mt-1 text-lg font-semibold text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 transition-colors">
                                                        {entry.title}
                                                    </h4>
                                                    <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                                        {entry.content}
                                                    </p>
                                                    {entry.tags.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                                            {entry.tags.map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="rounded-full bg-indigo-100/80 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </Link>
                                            </div>
                                            <Link
                                                href={`/write?id=${entry.id}`}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                                            >
                                                <Eye size={18} className="text-gray-400" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // ─── AVAILABLE MOODS ──────────────────────────────────────
    const availableMoods = Array.from(new Set(entries.map((e) => e.mood)));

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
            {/* Background blobs */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />
                <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-3xl dark:bg-pink-500/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/5" />
            </div>

            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Your Timeline
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            {totalEntries} entries · {entriesThisMonth} this month
                        </p>
                    </div>
                    <Link
                        href="/write"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40"
                    >
                        <BookOpen size={20} />
                        New Entry
                    </Link>
                </div>

                {/* Stats Row */}
                {totalEntries > 0 && (
                    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-2xl border border-gray-200/50 bg-white/60 p-4 text-center dark:border-gray-800/50 dark:bg-slate-900/60">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalEntries}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Entries</p>
                        </div>
                        <div className="rounded-2xl border border-gray-200/50 bg-white/60 p-4 text-center dark:border-gray-800/50 dark:bg-slate-900/60">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{entriesThisMonth}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
                        </div>
                        <div className="rounded-2xl border border-gray-200/50 bg-white/60 p-4 text-center dark:border-gray-800/50 dark:bg-slate-900/60">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                <span className="capitalize">{topMood}</span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Top Mood</p>
                        </div>
                        <div className="rounded-2xl border border-gray-200/50 bg-white/60 p-4 text-center dark:border-gray-800/50 dark:bg-slate-900/60">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {Object.keys(moodCounts).length}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Moods Used</p>
                        </div>
                    </div>
                )}

                {/* Navigation & Filters */}
                <div className="mb-6 flex flex-wrap items-center gap-4">
                    {/* Month Navigation */}
                    <div className="flex items-center gap-2 rounded-2xl border border-gray-200/50 bg-white/60 p-1.5 dark:border-gray-800/50 dark:bg-slate-900/60">
                        <button
                            onClick={goToPrevMonth}
                            className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={goToToday}
                            className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            {getMonthYear(new Date(currentYear, currentMonth).toISOString())}
                        </button>
                        <button
                            onClick={goToNextMonth}
                            className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search entries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-2xl border border-gray-200/50 bg-white/60 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-800/50 dark:bg-slate-900/60 dark:text-white dark:placeholder-gray-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Mood Filter */}
                    {availableMoods.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-gray-400 dark:text-gray-500" />
                            <button
                                onClick={() => setSelectedMood(null)}
                                className={`rounded-full px-3 py-1 text-xs transition ${
                                    selectedMood === null
                                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                }`}
                            >
                                All
                            </button>
                            {availableMoods.map((mood) => (
                                <button
                                    key={mood}
                                    onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs capitalize transition ${
                                        selectedMood === mood
                                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                    }`}
                                >
                                    {moodIcons[mood]}
                                    <span className="hidden sm:inline">{mood}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Timeline */}
                <div className="rounded-3xl border border-gray-200/50 bg-white/60 p-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/60 md:p-8">
                    {renderTimeline()}
                </div>

                {/* Footer hint */}
                {filteredEntries.length > 0 && (
                    <p className="mt-6 text-center text-sm text-gray-400 dark:text-gray-500">
                        {filteredEntries.length} entry{filteredEntries.length > 1 ? "s" : ""} found
                    </p>
                )}
            </div>
        </main>
    );
}