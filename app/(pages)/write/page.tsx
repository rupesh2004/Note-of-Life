"use client";

import { useState, useRef, useEffect, JSX } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    Save,
    X,
    Calendar,
    Heart,
    Smile,
    Frown,
    Meh,
    Sparkles,
    AlertCircle,
    Tag,
    Eye,
    EyeOff,
    Lock,
    CheckCircle,
    AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── TYPES ──────────────────────────────────────────────────────
type Mood = "happy" | "calm" | "proud" | "joyful" | "relaxed" | "sad" | "angry" | "neutral";

interface Tag {
    id: string;
    text: string;
}

interface DiaryEntry {
    id: string;
    title: string;
    content: string;
    date: string;
    mood: Mood | "neutral";
    tags: string[];
}

// ─── TOAST ─────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === "success";
    const Icon = isSuccess ? CheckCircle : AlertCircle;

    const bgClass = isSuccess
        ? "bg-emerald-50/90 dark:bg-emerald-950/40"
        : "bg-rose-50/90 dark:bg-rose-950/40";
    const borderClass = isSuccess
        ? "border-emerald-200 dark:border-emerald-800/50"
        : "border-rose-200 dark:border-rose-800/50";
    const textClass = isSuccess
        ? "text-emerald-800 dark:text-emerald-200"
        : "text-rose-800 dark:text-rose-200";
    const iconClass = isSuccess
        ? "text-emerald-500 dark:text-emerald-400"
        : "text-rose-500 dark:text-rose-400";
    const progressBg = isSuccess
        ? "bg-emerald-500 dark:bg-emerald-400"
        : "bg-rose-500 dark:bg-rose-400";

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md overflow-hidden rounded-2xl border ${borderClass} ${bgClass} backdrop-blur-xl shadow-2xl`}
        >
            <div className="flex items-center gap-3 px-5 py-4">
                <Icon className={`h-6 w-6 flex-shrink-0 ${iconClass}`} />
                <p className={`flex-1 text-sm font-medium ${textClass}`}>{message}</p>
                <button
                    onClick={onClose}
                    className={`rounded-full p-1 transition hover:bg-black/5 dark:hover:bg-white/10 ${textClass}`}
                >
                    <X size={16} />
                </button>
            </div>
            <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className={`h-1 ${progressBg}`}
            />
        </motion.div>
    );
};

// ─── CONFIRMATION DIALOG ──────────────────────────────────────
const ConfirmationDialog = ({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onCancel]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm dark:bg-black/50"
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="w-full max-w-md rounded-2xl border border-gray-200/50 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/90"
            >
                <div className="flex items-start gap-4">
                    <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-950/40">
                        <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Are you sure?</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{message}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                        className="rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-105 hover:shadow-indigo-500/40"
                    >
                        Confirm
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── MAIN WRITE PAGE ──────────────────────────────────────────
export default function WritePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const entryId = searchParams?.get("id");
    const mode = searchParams?.get("mode"); // "edit" or null

    // ─── AUTH STATE ────────────────────────────────────────────
    const [isCheckingAuth, setIsCheckingAuth] = useState(false);

    // useEffect(() => {
    //     const token = localStorage.getItem(  "token");
    //     if (!token) {
    //         router.replace("/login");
    //     } else {
    //         setIsCheckingAuth(false);
    //     }
    // }, [router]);

    // ─── ENTRY STATE ──────────────────────────────────────────
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [entryDate, setEntryDate] = useState<string>("");
    const [readOnly, setReadOnly] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load existing entry if id provided (only after auth check)
    useEffect(() => {
        if (isCheckingAuth) return;

        if (entryId) {
            const stored = localStorage.getItem("diaryEntries");
            if (stored) {
                const entries: DiaryEntry[] = JSON.parse(stored);
                const entry = entries.find((e) => e.id === entryId);
                if (entry) {
                    setTitle(entry.title);
                    setContent(entry.content);
                    setSelectedMood(entry.mood as Mood);
                    setTags(entry.tags.map((t) => ({ id: t, text: t })));
                    const formatted = new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    }).format(new Date(entry.date));
                    setEntryDate(formatted);
                    setReadOnly(mode !== "edit");
                    return;
                }
            }
            setToast({ message: "Entry not found", type: "error" });
            setTimeout(() => router.push("/diary"), 1500);
            return;
        }

        // New entry: set current date and editable
        const now = new Date();
        const formatted = new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(now);
        setEntryDate(formatted);
        setReadOnly(false);
    }, [entryId, mode, router, isCheckingAuth]);

    // ─── MOODS ──────────────────────────────────────────────────
    const moods: { value: Mood; icon: JSX.Element; label: string }[] = [
        { value: "happy", icon: <Smile className="text-emerald-500" size={20} />, label: "Happy" },
        { value: "calm", icon: <Heart className="text-rose-500" size={20} />, label: "Calm" },
        { value: "proud", icon: <Sparkles className="text-indigo-500" size={20} />, label: "Proud" },
        { value: "joyful", icon: <Smile className="text-yellow-500" size={20} />, label: "Joyful" },
        { value: "relaxed", icon: <Meh className="text-blue-500" size={20} />, label: "Relaxed" },
        { value: "sad", icon: <Frown className="text-gray-400" size={20} />, label: "Sad" },
        { value: "angry", icon: <AlertCircle className="text-red-500" size={20} />, label: "Angry" },
        { value: "neutral", icon: <Meh className="text-gray-400" size={20} />, label: "Neutral" },
    ];

    // ─── HANDLERS ──────────────────────────────────────────────
    const handleAddTag = () => {
        if (readOnly) return;
        const trimmed = tagInput.trim();
        if (trimmed && !tags.some((t) => t.text.toLowerCase() === trimmed.toLowerCase())) {
            setTags([...tags, { id: Date.now().toString(), text: trimmed }]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (id: string) => {
        if (readOnly) return;
        setTags(tags.filter((t) => t.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleSave = async () => {
        if (readOnly) return;

        if (!title.trim() || !content.trim()) {
            setToast({ message: "Please add a title and content.", type: "error" });
            return;
        }

        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            const newEntry: DiaryEntry = {
                id: Date.now().toString(),
                title: title.trim(),
                content: content.trim(),
                date: new Date().toISOString(),
                mood: selectedMood || "neutral",
                tags: tags.map((t) => t.text),
            };

            const stored = localStorage.getItem("diaryEntries");
            const entries: DiaryEntry[] = stored ? JSON.parse(stored) : [];
            entries.push(newEntry);
            localStorage.setItem("diaryEntries", JSON.stringify(entries));

            setToast({ message: "Entry saved successfully!", type: "success" });
            setTimeout(() => router.push("/diary"), 800);
        } catch (error) {
            setToast({ message: "Failed to save entry. Please try again.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (readOnly) {
            router.push("/diary");
            return;
        }
        if (title.trim() || content.trim() || tags.length > 0 || selectedMood !== null) {
            setConfirmDialog({
                message: "You have unsaved changes. Are you sure you want to leave?",
                onConfirm: () => router.push("/diary"),
            });
        } else {
            router.push("/diary");
        }
    };

    // ─── LOADING STATE ─────────────────────────────────────────
    if (isCheckingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    // ─── RENDER ──────────────────────────────────────────────────
    return (
        <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
            <AnimatePresence>
                {confirmDialog && (
                    <ConfirmationDialog
                        message={confirmDialog.message}
                        onConfirm={confirmDialog.onConfirm}
                        onCancel={() => setConfirmDialog(null)}
                    />
                )}
            </AnimatePresence>

            {/* Background blobs */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />
                <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-3xl dark:bg-pink-500/5" />
            </div>

            <div className="mx-auto max-w-4xl">
                {/* Top bar */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 text-gray-600 transition hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                    >
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">Back to Diary</span>
                    </button>
                    <div className="flex items-center gap-3">
                        {readOnly ? (
                            <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600 dark:bg-slate-800 dark:text-gray-300">
                                <Lock size={16} />
                                <span>Read Only</span>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsPreview(!isPreview)}
                                    className="flex items-center gap-1 rounded-full border border-gray-300 px-4 py-2 text-sm transition hover:border-indigo-400 dark:border-gray-700 dark:text-gray-300"
                                >
                                    {isPreview ? (
                                        <>
                                            <EyeOff size={16} />
                                            <span>Edit</span>
                                        </>
                                    ) : (
                                        <>
                                            <Eye size={16} />
                                            <span>Preview</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-5 py-2 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            <span>Save Entry</span>
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Writing area */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`rounded-3xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70 md:p-8 ${readOnly ? "opacity-90" : ""
                        }`}
                >
                    {/* Title */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Entry title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            readOnly={readOnly}
                            className={`w-full border-none bg-transparent text-2xl font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-0 dark:text-white dark:placeholder-gray-500 ${readOnly ? "cursor-default" : ""
                                }`}
                            autoFocus={!readOnly}
                        />
                    </div>

                    {/* Metadata row */}
                    <div className="mb-4 flex flex-wrap items-center gap-4 border-b border-gray-200 pb-4 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <Calendar size={18} />
                            <span className="text-sm font-medium">{entryDate}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Mood:</span>
                            <div className="flex flex-wrap gap-1">
                                {moods.map((mood) => (
                                    <button
                                        key={mood.value}
                                        onClick={() => {
                                            if (readOnly) return;
                                            setSelectedMood(
                                                selectedMood === mood.value ? null : mood.value
                                            );
                                        }}
                                        disabled={readOnly}
                                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm transition ${selectedMood === mood.value
                                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                            } ${readOnly ? "cursor-default opacity-70" : ""}`}
                                    >
                                        {mood.icon}
                                        <span className="hidden sm:inline">{mood.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {isPreview && !readOnly ? (
                        <div className="min-h-[300px] rounded-xl border border-gray-200 p-4 text-gray-700 dark:border-gray-700 dark:text-gray-300">
                            {content ? (
                                <div className="prose prose-indigo dark:prose-invert max-w-none">
                                    {content.split("\n").map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 dark:text-gray-500">Nothing to preview yet.</p>
                            )}
                        </div>
                    ) : (
                        <textarea
                            ref={textareaRef}
                            placeholder="Write your thoughts here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            readOnly={readOnly}
                            className={`min-h-[300px] w-full resize-y border-none bg-transparent text-gray-900 placeholder-gray-400 outline-none focus:ring-0 dark:text-white dark:placeholder-gray-500 ${readOnly ? "cursor-default" : ""
                                }`}
                        />
                    )}

                    {/* Tags */}
                    <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Tag size={18} className="text-gray-400" />
                            <div className="flex flex-1 flex-wrap items-center gap-2">
                                {tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                    >
                                        #{tag.text}
                                        {!readOnly && (
                                            <button
                                                onClick={() => handleRemoveTag(tag.id)}
                                                className="rounded-full p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {!readOnly && (
                                    <input
                                        type="text"
                                        placeholder="Add tags..."
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onBlur={handleAddTag}
                                        className="min-w-[100px] flex-1 border-none bg-transparent text-sm text-gray-700 outline-none dark:text-gray-300"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Word count */}
                {!readOnly && (
                    <div className="mt-4 text-right text-sm text-gray-400 dark:text-gray-500">
                        {content.split(/\s+/).filter(Boolean).length} words · {content.length} characters
                    </div>
                )}
            </div>
        </main>
    );
}