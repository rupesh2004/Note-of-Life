"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
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

// ─── TYPES ──────────────────────────────────────────────────────
interface Entry {
    _id: string;
    email: string;
    title: string;
    content: string;
    mood: string;
    tags: string[];
    date: string;
    createdAt: string;
    updatedAt?: string;
}

// ─── HELPERS ──────────────────────────────────────────────────
const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
};

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
    const [entries, setEntries] = useState<Entry[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // ─── REF FOR DROPDOWN MENU ─────────────────────────────────
    const dropdownMenuRef = useRef<HTMLDivElement | null>(null);

    // ─── CLICK OUTSIDE HANDLER ──────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownMenuRef.current &&
                !dropdownMenuRef.current.contains(event.target as Node) &&
                !(event.target as HTMLElement).closest?.(".dropdown-trigger")
            ) {
                setDropdownOpen(null);
                setDropdownPosition(null);
            }
        };
        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    // ─── AUTH HEADERS ──────────────────────────────────────────
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // ─── FETCH ENTRIES ──────────────────────────────────────────
    const fetchEntries = async () => {
        try {
            const response = await axios.get("/api/entries", {
                headers: getAuthHeaders(),
            });
            localStorage.setItem("entries", JSON.stringify(response.data.entries));
            setEntries(response.data.entries);
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch entries:", err);
            const msg = err.response?.data?.message || "Could not load entries.";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── DELETE ENTRY ───────────────────────────────────────────
    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        try {
            await axios.delete(`/api/entries/${id}`, {
                headers: getAuthHeaders(),
            });
            setEntries((prev) => prev.filter((entry) => entry._id !== id));
            toast.success("Entry deleted.");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to delete entry.";
            toast.error(msg);
        } finally {
            setIsDeleting(false);
            setDeleteConfirmId(null);
        }
    };

    // ─── VIEW & EDIT HANDLERS ──────────────────────────────────
    const handleView = (id: string) => {
        router.push(`/write?id=${id}`);
        setDropdownOpen(null);
        setDropdownPosition(null);
    };

    const handleEdit = (id: string) => {
        router.push(`/write?id=${id}&mode=edit`);
        setDropdownOpen(null);
        setDropdownPosition(null);
    };

    // ─── DROPDOWN TOGGLE ──────────────────────────────────────
    const toggleDropdown = (e: React.MouseEvent, entryId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (dropdownOpen === entryId) {
            setDropdownOpen(null);
            setDropdownPosition(null);
            return;
        }

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setDropdownPosition({
            top: rect.bottom + 8,
            right: window.innerWidth - rect.right,
        });
        setDropdownOpen(entryId);
    };

    // ─── LOAD ON MOUNT ──────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
            fetchEntries();
        } else {
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    }, []);

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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Your Diary</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Please log in to view and write your diary entries.
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

    // ─── FILTER & SORT ──────────────────────────────────────────
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

    const moods = Array.from(new Set(entries.map((e) => e.mood)));

    // ─── RENDER ──────────────────────────────────────────────────
    const entryToDelete = entries.find((entry) => entry._id === deleteConfirmId);

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

                {/* Filters (same as before) */}
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
                        {moods.map((mood, idx) => (
                            <button
                                key={`${mood || 'mood'}-${idx}`}
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
                                    key={entry._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="group relative rounded-2xl border border-gray-200/50 bg-white/60 p-5 backdrop-blur-sm transition-all hover:border-indigo-300/50 hover:shadow-xl hover:shadow-indigo-500/5 dark:border-gray-800/50 dark:bg-slate-900/60 overflow-visible"
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
                                            {entry.tags.map((tag, idx) => (
                                                <span
                                                    key={`${entry._id}-tag-${idx}-${tag || 'empty'}`}
                                                    className="rounded-full bg-indigo-100/80 px-2.5 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* ─── DROPDOWN TRIGGER ─── */}
                                    <div className="absolute bottom-4 right-4 z-20">
                                        <button
                                            className="dropdown-trigger rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-slate-800"
                                            onClick={(e) => toggleDropdown(e, entry._id)}
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>

                                    {/* Clickable card overlay */}
                                    <Link
                                        href={`/write?id=${entry._id}${isToday(entry.date) || isToday(entry.createdAt) ? "&mode=edit" : ""}`}
                                        className="absolute inset-0 rounded-2xl z-0"
                                        aria-label={`View entry: ${entry.title}`}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* ─── FIXED POSITION DROPDOWN ─── */}
            {dropdownOpen && dropdownPosition && (
                <div
                    ref={dropdownMenuRef}
                    className="fixed z-50 w-40 rounded-xl border border-gray-200 bg-white/90 py-1 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-slate-900/90"
                    style={{
                        top: dropdownPosition.top,
                        right: dropdownPosition.right,
                    }}
                >
                    <button
                        onClick={() => {
                            if (dropdownOpen) handleView(dropdownOpen);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                    >
                        <Eye size={16} />
                        View
                    </button>
                    <button
                        onClick={() => {
                            if (dropdownOpen) handleEdit(dropdownOpen);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                    >
                        <Edit size={16} />
                        Edit
                    </button>
                    <button
                        onClick={() => {
                            if (dropdownOpen) {
                                setDeleteConfirmId(dropdownOpen);
                                setDropdownOpen(null);
                                setDropdownPosition(null);
                            }
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                        <Trash size={16} />
                        Delete
                    </button>
                </div>
            )}

            {/* Delete confirmation dialog */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-slate-900">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delete entry</h2>
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete {entryToDelete ? `"${entryToDelete.title}"` : "this entry"}? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-slate-800"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => entryToDelete && handleDelete(entryToDelete._id)}
                                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete entry"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}