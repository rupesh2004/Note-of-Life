"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
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
    BookOpen,
    Search,
    X,
    Eye,
    TrendingUp,
    Clock,
    ChevronUp,
    BarChart3,
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

// ─── MOOD CONFIGURATION ──────────────────────────────────────
const moodConfig: Record<string, { icon: React.ReactElement; color: string; label: string; bg: string }> = {
    happy: { icon: <Smile size={18} />, color: "text-emerald-500", label: "Happy", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    proud: { icon: <Sparkles size={18} />, color: "text-indigo-500", label: "Proud", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
    calm: { icon: <Heart size={18} />, color: "text-rose-500", label: "Calm", bg: "bg-rose-50 dark:bg-rose-950/30" },
    joyful: { icon: <Smile size={18} />, color: "text-yellow-500", label: "Joyful", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
    relaxed: { icon: <Meh size={18} />, color: "text-blue-500", label: "Relaxed", bg: "bg-blue-50 dark:bg-blue-950/30" },
    sad: { icon: <Frown size={18} />, color: "text-gray-400", label: "Sad", bg: "bg-gray-50 dark:bg-gray-950/30" },
    angry: { icon: <AlertCircle size={18} />, color: "text-red-500", label: "Angry", bg: "bg-red-50 dark:bg-red-950/30" },
    neutral: { icon: <Meh size={18} />, color: "text-gray-400", label: "Neutral", bg: "bg-gray-50 dark:bg-gray-950/30" },
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

const moodColorMap: Record<string, string> = {
    happy: "emerald",
    proud: "indigo",
    calm: "rose",
    joyful: "yellow",
    relaxed: "blue",
    sad: "gray",
    angry: "red",
    neutral: "gray",
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

// ─── STAT CARD ─────────────────────────────────────────────────
function StatCard({ icon, value, label, color, capitalize = false }: any) {
    const colorClasses: Record<string, string> = {
        indigo: "border-indigo-200 bg-indigo-50/30 dark:border-indigo-800/30 dark:bg-indigo-950/20",
        pink: "border-pink-200 bg-pink-50/30 dark:border-pink-800/30 dark:bg-pink-950/20",
        emerald: "border-emerald-200 bg-emerald-50/30 dark:border-emerald-800/30 dark:bg-emerald-950/20",
        purple: "border-purple-200 bg-purple-50/30 dark:border-purple-800/30 dark:bg-purple-950/20",
        rose: "border-rose-200 bg-rose-50/30 dark:border-rose-800/30 dark:bg-rose-950/20",
        yellow: "border-yellow-200 bg-yellow-50/30 dark:border-yellow-800/30 dark:bg-yellow-950/20",
        blue: "border-blue-200 bg-blue-50/30 dark:border-blue-800/30 dark:bg-blue-950/20",
        red: "border-red-200 bg-red-50/30 dark:border-red-800/30 dark:bg-red-950/20",
        gray: "border-gray-200 bg-gray-50/30 dark:border-gray-800/30 dark:bg-gray-950/20",
    };
    return (
        <div className={`rounded-2xl border p-4 text-center transition hover:shadow-lg ${colorClasses[color] || "border-gray-200/50 bg-white/60 dark:border-gray-800/50 dark:bg-slate-900/60"}`}>
            <div className="flex items-center justify-center gap-2">
                {icon}
                <p className={`text-2xl font-bold ${capitalize ? "capitalize" : ""}`}>
                    {typeof value === "string" ? value : value}
                </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        </div>
    );
}

// ─── EMPTY STATE ──────────────────────────────────────────────
function EmptyState({ searchTerm, selectedMood }: { searchTerm: string; selectedMood: string | null }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-gray-100 p-6 dark:bg-slate-800">
                <BookOpen size={48} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">
                No entries found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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

// ─── TIMELINE CONTENT ────────────────────────────────────────
function TimelineContent({ entries }: { entries: DiaryEntry[] }) {
    const grouped = entries.reduce((acc, entry) => {
        const key = new Date(entry.date).toDateString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(entry);
        return acc;
    }, {} as Record<string, DiaryEntry[]>);

    const keys = Object.keys(grouped);

    return (
        <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-400 via-pink-400 to-indigo-400 dark:from-indigo-600 dark:via-pink-600 dark:to-indigo-600" />

            {keys.map((key, index) => {
                const dayEntries = grouped[key];
                const groupLabel = getGroupLabel(key);
                const isFirst = index === 0;

                return (
                    <div key={key} className="relative pl-12 pb-8 last:pb-0">
                        <div
                            className={`absolute left-2 top-1.5 h-5 w-5 rounded-full border-2 ${
                                isFirst
                                    ? "border-indigo-500 bg-indigo-500 dark:border-indigo-400 dark:bg-indigo-400"
                                    : "border-gray-300 bg-white dark:border-gray-600 dark:bg-slate-800"
                            }`}
                        />
                        <div className="mb-4 flex items-center gap-3">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                {groupLabel}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                {dayEntries.length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {dayEntries.map((entry, idx) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05, duration: 0.25 }}
                                    className={`group rounded-2xl border-l-4 ${moodColors[entry.mood] || moodColors.neutral} bg-white/70 p-4 backdrop-blur-sm transition-all hover:shadow-xl hover:scale-[1.01] dark:bg-slate-900/70`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                    <Clock size={14} />
                                                    {formatTime(entry.date)}
                                                </span>
                                                <span className="text-gray-300 dark:text-gray-600">·</span>
                                                <span className="flex items-center gap-1 text-sm capitalize">
                                                    {moodConfig[entry.mood]?.icon || moodConfig.neutral.icon}
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {moodConfig[entry.mood]?.label || entry.mood}
                                                    </span>
                                                </span>
                                            </div>
                                            <Link href={`/write?id=${entry.id}`} className="block">
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
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function TimelinePage() {
    const router = useRouter();
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [error, setError] = useState<string | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchEntries = async () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                setIsAuthenticated(true);
                const response = await axios.get("/api/entries", {
                    headers: getAuthHeaders(),
                });
                const fetchedEntries: DiaryEntry[] = response.data.entries.map((entry: any) => ({
                    id: entry._id,
                    title: entry.title,
                    content: entry.content,
                    date: entry.date,
                    mood: entry.mood || "neutral",
                    tags: entry.tags || [],
                }));
                setEntries(fetchedEntries);
                setError(null);
            } else {
                setIsAuthenticated(false);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Could not load entries.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    useEffect(() => {
        let filtered = entries;
        if (searchTerm) {
            filtered = filtered.filter(
                (entry) =>
                    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    entry.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (selectedMood) {
            filtered = filtered.filter((entry) => entry.mood === selectedMood);
        }
        filtered = filtered.filter((entry) => {
            const date = new Date(entry.date);
            return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
        });
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setFilteredEntries(filtered);
    }, [entries, searchTerm, selectedMood, currentYear, currentMonth]);

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

    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                setShowScrollTop(window.scrollY > 400);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const totalEntries = entries.length;
    const entriesThisMonth = filteredEntries.length;
    const moodCounts = entries.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";
    const topMoodColor = moodColorMap[topMood] || "gray";

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
                <div className="rounded-3xl border border-gray-200/50 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70 max-w-md text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg">
                            <BookOpen className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Timeline</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Please log in to view your journal timeline.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/signup"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-slate-800"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
                <p className="text-center text-red-600 dark:text-red-400">{error}</p>
                <button
                    onClick={fetchEntries}
                    className="rounded-full bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen px-4 py-8 md:px-8 md:py-12" ref={containerRef}>
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />
                <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-3xl dark:bg-pink-500/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/5" />
            </div>

            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                            Your Timeline
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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

                {totalEntries > 0 && (
                    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard icon={<BookOpen size={18} className="text-indigo-500" />} value={totalEntries} label="Total Entries" color="indigo" />
                        <StatCard icon={<TrendingUp size={18} className="text-pink-500" />} value={entriesThisMonth} label="This Month" color="pink" />
                        <StatCard 
                            icon={moodConfig[topMood]?.icon || <Calendar size={18} className="text-gray-400" />} 
                            value={topMood} 
                            label="Top Mood" 
                            color={topMoodColor} 
                            capitalize 
                        />
                        <StatCard icon={<BarChart3 size={18} className="text-purple-500" />} value={Object.keys(moodCounts).length} label="Moods Used" color="purple" />
                    </div>
                )}

                <div className="mb-6 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 rounded-2xl border border-gray-200/50 bg-white/60 p-1 dark:border-gray-800/50 dark:bg-slate-900/60 shadow-sm">
                        <button
                            onClick={goToPrevMonth}
                            className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-slate-800"
                            aria-label="Previous month"
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
                            aria-label="Next month"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="relative flex-1 min-w-[160px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search entries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-2xl border border-gray-200/50 bg-white/60 py-2 pl-10 pr-8 text-sm text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-800/50 dark:bg-slate-900/60 dark:text-white dark:placeholder-gray-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Mood:</span>
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
                        {Object.entries(moodConfig).map(([key, config]) => {
                            const count = entries.filter(e => e.mood === key).length;
                            if (count === 0) return null;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedMood(selectedMood === key ? null : key)}
                                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition ${
                                        selectedMood === key
                                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                    }`}
                                >
                                    <span className={config.color}>{config.icon}</span>
                                    <span className="hidden sm:inline">{config.label}</span>
                                    <span className="text-[10px] opacity-60">({count})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-3xl border border-gray-200/50 bg-white/60 p-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/60 md:p-8 shadow-sm">
                    {filteredEntries.length === 0 ? (
                        <EmptyState searchTerm={searchTerm} selectedMood={selectedMood} />
                    ) : (
                        <TimelineContent entries={filteredEntries} />
                    )}
                </div>

                {filteredEntries.length > 0 && (
                    <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
                        {filteredEntries.length} entry{filteredEntries.length > 1 ? "s" : ""} found
                    </p>
                )}

                {showScrollTop && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 p-3 text-white shadow-lg transition hover:scale-110"
                    >
                        <ChevronUp size={24} />
                    </button>
                )}
            </div>
        </main>
    );
}