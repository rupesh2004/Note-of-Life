"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    BookOpen,
    Calendar,
    Heart,
    MoreVertical,
    Search,
    Plus,
    Trash,
    Edit,
    Eye,
    Sparkles,
    Smile,
    Frown,
    Meh,
    AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// ─── MOCK DATA ───────────────────────────────────────────────
const initialEntries = [
    {
        id: "1",
        title: "A Beautiful Morning",
        content:
            "Woke up to the sound of birds chirping outside my window. The sun was streaming through the curtains, casting warm patterns on the floor. I decided to take a long walk in the park—the air was crisp and the trees were starting to turn golden. It felt like a fresh start.",
        date: "2026-06-30T08:30:00Z",
        mood: "happy",
        tags: ["nature", "morning", "gratitude"],
    },
    {
        id: "2",
        title: "Overcoming Challenges",
        content:
            "Today was tough. I hit a roadblock with my project at work and felt completely stuck. But after stepping back and taking a deep breath, I realized I had been overcomplicating things. I broke the problem down into smaller pieces and made real progress. Proud of myself for pushing through.",
        date: "2026-06-29T22:15:00Z",
        mood: "proud",
        tags: ["work", "growth", "resilience"],
    },
    {
        id: "3",
        title: "Evening Reflections",
        content:
            "As the sun set, I sat on my balcony with a cup of tea and watched the sky turn shades of orange and pink. I thought about the week—the highs and lows—and felt a deep sense of peace. Gratitude for the simple moments is what keeps me grounded.",
        date: "2026-06-28T19:45:00Z",
        mood: "calm",
        tags: ["evening", "reflection", "peace"],
    },
    {
        id: "4",
        title: "Unexpected Reunion",
        content:
            "Ran into an old friend from college today at the coffee shop. It had been years since we last spoke, but we picked up right where we left off. We laughed, shared stories, and promised to catch up more often. It's amazing how some connections never fade.",
        date: "2026-06-27T14:20:00Z",
        mood: "joyful",
        tags: ["friends", "nostalgia", "connection"],
    },
    {
        id: "5",
        title: "Rainy Day Musings",
        content:
            "The rain poured down all afternoon, creating a soothing rhythm against the window. I curled up with a good book and lost myself in another world. Sometimes the best days are the ones where you don't have to do anything at all.",
        date: "2026-06-26T11:00:00Z",
        mood: "relaxed",
        tags: ["rain", "reading", "cozy"],
    },
];

// ─── HELPERS ────────────────────────────────────────────────
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const moodIcons: Record<string, React.ReactElement> = {
    happy: <Smile className="text-emerald-500" size={16} />,
    proud: <Sparkles className="text-indigo-500" size={16} />,
    calm: <Heart className="text-rose-500" size={16} />,
    joyful: <Smile className="text-yellow-500" size={16} />,
    relaxed: <Meh className="text-blue-500" size={16} />,
    sad: <Frown className="text-gray-400" size={16} />,
    angry: <AlertCircle className="text-red-500" size={16} />,
};

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function DiaryPage() {
    const router = useRouter();
    const [entries, setEntries] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ─── LOAD ENTRIES FROM LOCALSTORAGE ──────────────────────
    const loadEntries = () => {
        const stored = localStorage.getItem("diaryEntries");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.length > 0) {
                    setEntries(parsed);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse entries from localStorage", e);
            }
        }

        // If localStorage is empty, seed with initial entries
        localStorage.setItem("diaryEntries", JSON.stringify(initialEntries));
        setEntries(initialEntries);
    };

    // ─── SYNC ENTRIES TO LOCALSTORAGE ────────────────────────
    const saveEntries = (newEntries: any[]) => {
        localStorage.setItem("diaryEntries", JSON.stringify(newEntries));
        setEntries(newEntries);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) router.replace("/login");

        loadEntries();
        setIsLoading(false);
    }, [router]);

    if (isLoading) return null;

    // ─── FILTER & SORT ────────────────────────────────────────
    const filteredEntries = entries
        .filter((entry) => {
            const matchesSearch =
                entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMood = selectedMood ? entry.mood === selectedMood : true;
            return matchesSearch && matchesMood;
        })
        .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });

    // ─── HANDLERS ─────────────────────────────────────────────
    const handleDelete = (id: string) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                    Delete this entry permanently?
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            const updated = entries.filter((entry) => entry.id !== id);
                            saveEntries(updated);
                            setDropdownOpen(null);
                            toast.dismiss(t.id);
                            toast.success("Entry deleted.");
                        }}
                        className="rounded-full bg-red-500 px-3 py-1.5 text-sm font-semibold text-white"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="rounded-full bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:bg-slate-700 dark:text-gray-200"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: Infinity, position: "top-center" });
    };

    const handleView = (id: string) => {
        router.push(`/write?id=${id}`);
        setDropdownOpen(null);
    };

    const handleEdit = (id: string) => {
        router.push(`/write?id=${id}&mode=edit`);
        setDropdownOpen(null);
    };

    const moods = Array.from(new Set(entries.map((e) => e.mood)));

    // ─── RENDER ───────────────────────────────────────────────
    return (
        <main className="min-h-screen px-6 py-12 md:py-16">
            {/* Background blobs */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />
                <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-3xl dark:bg-pink-500/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/5" />
            </div>

            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            My Diary
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            {entries.length} entries · {filteredEntries.length} shown
                        </p>
                    </div>
                    <Link
                        href="/write"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40"
                    >
                        <Plus size={20} />
                        New Entry
                    </Link>
                </div>

                {/* Filters */}
                <div className="mb-8 flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search entries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white/50 py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Mood:</span>
                        <button
                            onClick={() => setSelectedMood(null)}
                            className={`rounded-full px-3 py-1 text-sm transition ${
                                selectedMood === null
                                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                            }`}
                        >
                            All
                        </button>
                        {moods.map((mood) => (
                            <button
                                key={mood}
                                onClick={() => setSelectedMood(mood)}
                                className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm capitalize transition ${
                                    selectedMood === mood
                                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                }`}
                            >
                                {moodIcons[mood] || <Heart size={14} />}
                                {mood}
                            </button>
                        ))}
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={() =>
                                setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                            }
                            className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-sm transition hover:border-indigo-400 dark:border-gray-700 dark:text-gray-300"
                        >
                            <Calendar size={16} />
                            {sortOrder === "newest" ? "Newest first" : "Oldest first"}
                        </button>
                    </div>
                </div>

                {/* Entries Grid */}
                {filteredEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/30 py-20 text-center dark:border-gray-700 dark:bg-slate-900/30">
                        <BookOpen size={48} className="text-gray-400" />
                        <h3 className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">
                            No entries found
                        </h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            {searchTerm || selectedMood
                                ? "Try adjusting your search or filters"
                                : "Start writing your first diary entry!"}
                        </p>
                        {!searchTerm && !selectedMood && (
                            <Link
                                href="/write"
                                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-6 py-2.5 font-semibold text-white shadow-lg transition hover:scale-105"
                            >
                                <Plus size={20} />
                                Write Now
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence>
                            {filteredEntries.map((entry, index) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="group relative rounded-2xl border border-gray-200/50 bg-white/60 p-5 backdrop-blur-sm transition-all hover:border-indigo-300/50 hover:shadow-xl hover:shadow-indigo-500/5 dark:border-gray-800/50 dark:bg-slate-900/60"
                                >
                                    {/* Mood indicator */}
                                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gray-100/80 px-2 py-1 text-xs font-medium dark:bg-slate-800/80">
                                        {moodIcons[entry.mood] || <Heart size={14} />}
                                        <span className="capitalize">{entry.mood}</span>
                                    </div>

                                    {/* Title & date */}
                                    <div className="pr-20">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {entry.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(entry.date)}
                                        </p>
                                    </div>

                                    {/* Preview content */}
                                    <p className="mt-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                                        {entry.content}
                                    </p>

                                    {/* Tags */}
                                    {entry.tags && entry.tags.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {entry.tags.map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full bg-indigo-100/80 px-2.5 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions dropdown */}
                                    <div className="absolute bottom-4 right-4">
                                        <button
                                            onClick={() =>
                                                setDropdownOpen(
                                                    dropdownOpen === entry.id ? null : entry.id
                                                )
                                            }
                                            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-slate-800"
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                        {dropdownOpen === entry.id && (
                                            <div className="absolute right-0 mt-1 w-40 rounded-xl border border-gray-200 bg-white/90 py-1 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-slate-900/90">
                                                <button
                                                    onClick={() => handleView(entry.id)}
                                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(entry.id)}
                                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                                                >
                                                    <Edit size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                                >
                                                    <Trash size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Clickable card – navigates to read-only view */}
                                    <Link
                                        href={`/write?id=${entry.id}`}
                                        className="absolute inset-0 rounded-2xl"
                                        aria-label={`View entry: ${entry.title}`}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </main>
    );
}