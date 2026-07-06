"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import jsPDF from "jspdf";
import axios from "axios";
import {
    Sun,
    Moon,
    Monitor,
    Bell,
    Download,
    Trash2,
    User,
    Shield,
    Info,
    CheckCircle,
} from "lucide-react";

interface Settings {
    theme: "light" | "dark" | "system";
    dailyReminder: boolean;
    weeklyDigest: boolean;
}

interface JWTPayload {
    name: string;
    email: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    const [settings, setSettings] = useState<Settings>({
        theme: "system",
        dailyReminder: true,
        weeklyDigest: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [isSendingReminder, setIsSendingReminder] = useState(false);
    const [clearConfirm, setClearConfirm] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // ─── Load settings ──────────────────────────────────────────
    useEffect(() => {
        const stored = localStorage.getItem("appSettings");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSettings(parsed);
                if (parsed.theme) setTheme(parsed.theme);
            } catch {
                console.error("Failed to parse settings");
            }
        }
        setIsLoading(false);
    }, [setTheme]);

    // ─── Decode email from token ──────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const decoded = jwtDecode<JWTPayload>(token);
            if (decoded?.email) setUserEmail(decoded.email);
        } catch {
            console.error("Invalid auth token");
        }
    }, []);

    // ─── Auth headers ──────────────────────────────────────────
    const getAuthHeaders = (): Record<string, string> => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // ─── Update daily reminder in DB ────────────────────────────
    const updateDailyReminderPreference = async (enabled: boolean) => {
        try {
            await axios.put(
                "/api/auth/user/settings",
                { dailyReminder: enabled },
                { headers: getAuthHeaders() }
            );
            return true;
        } catch {
            toast.error("Could not save daily reminder setting to your account");
            return false;
        }
    };

    // ─── Send test reminder ──────────────────────────────────────
    const sendDailyReminder = async (email: string) => {
        setIsSendingReminder(true);
        try {
            await axios.post("/api/notifications/daily-reminder", { email });
            toast.success("Daily reminder email sent");
        } catch {
            toast.error("Failed to send reminder email");
        } finally {
            setIsSendingReminder(false);
        }
    };

    // ─── Save settings (local) ──────────────────────────────────
    const saveSettings = (newSettings: Settings) => {
        localStorage.setItem("appSettings", JSON.stringify(newSettings));
        setSettings(newSettings);
    };

    // ─── Theme change ──────────────────────────────────────────
    const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
        setTheme(newTheme);
        const updated = { ...settings, theme: newTheme };
        saveSettings(updated);
        toast.success(`Theme: ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`);
    };

    // ─── Toggle daily reminder ─────────────────────────────────
    const toggleDailyReminder = async () => {
        const updated = { ...settings, dailyReminder: !settings.dailyReminder };
        saveSettings(updated);
        toast.success(updated.dailyReminder ? "Daily reminders enabled" : "Daily reminders disabled");

        const token = localStorage.getItem("token");
        if (token) {
            await updateDailyReminderPreference(updated.dailyReminder);
        } else {
            toast("Log in to persist your reminder preference", { icon: "ℹ️", duration: 5000 });
        }
    };

    // ─── Toggle weekly digest ──────────────────────────────────
    const toggleWeeklyDigest = () => {
        const updated = { ...settings, weeklyDigest: !settings.weeklyDigest };
        saveSettings(updated);
        toast.success(updated.weeklyDigest ? "Weekly digest enabled" : "Weekly digest disabled");
    };

    // ─── PROFESSIONAL PDF EXPORT WITH UNIQUE PAGE COLORS (NO EMOJIS) ──
    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("You must be logged in to export.");
                return;
            }

            const response = await axios.get("/api/entries", {
                headers: getAuthHeaders(),
            });

            const entries = response.data.entries;
            if (!entries || entries.length === 0) {
                toast.error("No entries to export");
                return;
            }

            const doc = new jsPDF("p", "mm", "a4");
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - margin * 2;

            // ─── Color palettes ──────────────────────────────────────────
            const pageBackgrounds: [number, number, number][] = [
                [245, 243, 255], // indigo-50
                [240, 253, 244], // emerald-50
                [254, 242, 242], // rose-50
                [239, 246, 255], // blue-50
                [255, 247, 237], // amber-50
                [243, 244, 246], // gray-50
            ];

            const headerColors: [number, number, number][] = [
                [79, 70, 229], // indigo-600
                [16, 185, 129], // emerald-500
                [244, 63, 94], // rose-500
                [59, 130, 246], // blue-500
                [245, 158, 11], // amber-500
                [107, 114, 128], // gray-500
            ];

            // ─── Helpers ──────────────────────────────────────────────
            let y = margin;
            let pageNum = 1;

            const addNewPage = () => {
                doc.addPage();
                y = margin;
                pageNum++;
            };

            const drawBorder = (bgColor: [number, number, number]) => {
                doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
                doc.rect(0, 0, pageWidth, pageHeight, "F");

                doc.setDrawColor(200, 200, 220);
                doc.setLineWidth(0.5);
                doc.rect(margin - 2, margin - 2, contentWidth + 4, pageHeight - margin * 2 + 4, "S");
            };

            const drawHeaderBox = (headerColor: [number, number, number]) => {
                const headerHeight = 20;
                const headerY = margin - 2;
                doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
                doc.rect(margin - 2, headerY, contentWidth + 4, headerHeight, "F");

                doc.setDrawColor(200, 200, 220);
                doc.setLineWidth(0.3);
                doc.rect(margin - 2, headerY, contentWidth + 4, headerHeight, "S");

                doc.setFontSize(16);
                doc.setTextColor(255, 255, 255);
                doc.text("Note of Life", pageWidth / 2, headerY + 8, { align: "center" });

                doc.setFontSize(9);
                doc.setTextColor(255, 255, 255);
                doc.text("Every Memory Matters", pageWidth / 2, headerY + 16, { align: "center" });

                doc.setDrawColor(200, 200, 220);
                doc.line(margin, headerY + headerHeight, pageWidth - margin, headerY + headerHeight);
                y = headerY + headerHeight + 4;
            };

            const drawFooter = (pageNum: number, totalPages: number) => {
                doc.setFontSize(8);
                doc.setTextColor(156, 163, 175);
                const footerText = `Page ${pageNum} of ${totalPages}  •  ${new Date().toLocaleDateString()}`;
                doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: "center" });
            };

            // ─── Mood data (color only, no emoji) ──────────────────────
            const moodColor: Record<string, [number, number, number]> = {
                happy: [16, 185, 129],
                calm: [244, 63, 94],
                proud: [99, 102, 241],
                joyful: [234, 179, 8],
                relaxed: [59, 130, 246],
                sad: [156, 163, 175],
                angry: [239, 68, 68],
                neutral: [156, 163, 175],
            };

            // ─── COVER PAGE ────────────────────────────────────────────
            doc.setFillColor(245, 243, 255);
            doc.rect(0, 0, pageWidth, pageHeight, "F");

            doc.setFillColor(79, 70, 229);
            doc.rect(0, 0, pageWidth, 6, "F");
            doc.setFillColor(236, 72, 153);
            doc.rect(0, 6, pageWidth, 3, "F");

            doc.setFontSize(40);
            doc.setTextColor(79, 70, 229);
            doc.text("Note of Life", pageWidth / 2, 70, { align: "center" });

            doc.setFontSize(20);
            doc.setTextColor(236, 72, 153);
            doc.text("Every Memory Matters", pageWidth / 2, 86, { align: "center" });

            doc.setFontSize(12);
            doc.setTextColor(156, 163, 175);
            const coverDate = new Date().toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            doc.text(`Exported on ${coverDate}`, pageWidth / 2, 106, { align: "center" });

            doc.setFontSize(16);
            doc.setTextColor(31, 41, 55);
            doc.text(`Total Entries: ${entries.length}`, pageWidth / 2, 126, { align: "center" });

            doc.setDrawColor(79, 70, 229);
            doc.setLineWidth(0.5);
            doc.line(margin, 140, pageWidth - margin, 140);

            doc.setFontSize(14);
            doc.setTextColor(107, 114, 128);
            doc.text('"Every page tells a story. Every story becomes a memory."', pageWidth / 2, 160, { align: "center" });

            // ─── ENTRIES ──────────────────────────────────────────────
            const totalPages = entries.length + 1;
            pageNum = 1;

            entries.forEach((entry: any, index: number) => {
                addNewPage();
                const currentPageNum = pageNum;
                const colorIndex = index % pageBackgrounds.length;
                const bgColor = pageBackgrounds[colorIndex];
                const headerColor = headerColors[colorIndex];

                drawBorder(bgColor);
                drawHeaderBox(headerColor);

                // ── Title (centered with white background) ──
                doc.setFillColor(255, 255, 255);
                doc.rect(margin + 2, y - 2, contentWidth - 4, 12, "F");
                doc.setDrawColor(220, 220, 235);
                doc.rect(margin + 2, y - 2, contentWidth - 4, 12, "S");
                doc.setFontSize(18);
                doc.setTextColor(79, 70, 229);
                doc.text(entry.title, pageWidth / 2, y + 8, { align: "center" });
                y += 16;

                // ── Metadata rows ──
                const entryDate = new Date(entry.date);
                const dateStr = entryDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
                const timeStr = entryDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const mood = entry.mood || "neutral";
                const moodCol = moodColor[mood] || [156, 163, 175];

                doc.setFontSize(11);
                // Date
                doc.setTextColor(31, 41, 55);
                doc.setFont("helvetica", "bold");
                doc.text("Date:", margin + 6, y);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(107, 114, 128);
                doc.text(dateStr, margin + 40, y);
                y += 6;

                // Time
                doc.setTextColor(31, 41, 55);
                doc.setFont("helvetica", "bold");
                doc.text("Time:", margin + 6, y);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(107, 114, 128);
                doc.text(timeStr, margin + 40, y);
                y += 6;

                // Mood (plain text, no emoji)
                doc.setTextColor(31, 41, 55);
                doc.setFont("helvetica", "bold");
                doc.text("Mood:", margin + 6, y);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(moodCol[0], moodCol[1], moodCol[2]);
                doc.text(mood.charAt(0).toUpperCase() + mood.slice(1), margin + 40, y);
                y += 8;

                // ── Separator ──
                doc.setDrawColor(220, 220, 235);
                doc.line(margin + 4, y, pageWidth - margin - 4, y);
                y += 6;

                // ── Content ──
                doc.setFontSize(12);
                doc.setTextColor(31, 41, 55);
                doc.setFont("helvetica", "normal");
                const paragraphs = entry.content.split('\n').filter((p: string) => p.trim() !== '');
                let contentLines: string[] = [];
                paragraphs.forEach((para: string) => {
                    const lines = doc.splitTextToSize(para, contentWidth - 12);
                    contentLines = contentLines.concat(lines);
                    if (para !== paragraphs[paragraphs.length - 1]) {
                        contentLines.push('');
                    }
                });

                const neededHeight = contentLines.length * 5 + 10;
                if (y + neededHeight > pageHeight - margin - 20) {
                    // Content doesn't fit – add new page with a different color
                    addNewPage();
                    const newColorIndex = (index + 1) % pageBackgrounds.length;
                    const newBg = pageBackgrounds[newColorIndex];
                    const newHeader = headerColors[newColorIndex];
                    drawBorder(newBg);
                    drawHeaderBox(newHeader);

                    // Re-draw title
                    doc.setFillColor(255, 255, 255);
                    doc.rect(margin + 2, y - 2, contentWidth - 4, 12, "F");
                    doc.setDrawColor(220, 220, 235);
                    doc.rect(margin + 2, y - 2, contentWidth - 4, 12, "S");
                    doc.setFontSize(18);
                    doc.setTextColor(79, 70, 229);
                    doc.text(entry.title, pageWidth / 2, y + 8, { align: "center" });
                    y += 16;

                    // Re-draw metadata
                    doc.setFontSize(11);
                    doc.setTextColor(31, 41, 55);
                    doc.setFont("helvetica", "bold");
                    doc.text("Date:", margin + 6, y);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(107, 114, 128);
                    doc.text(dateStr, margin + 40, y);
                    y += 6;
                    doc.setTextColor(31, 41, 55);
                    doc.setFont("helvetica", "bold");
                    doc.text("Time:", margin + 6, y);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(107, 114, 128);
                    doc.text(timeStr, margin + 40, y);
                    y += 6;
                    doc.setTextColor(31, 41, 55);
                    doc.setFont("helvetica", "bold");
                    doc.text("Mood:", margin + 6, y);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(moodCol[0], moodCol[1], moodCol[2]);
                    doc.text(mood.charAt(0).toUpperCase() + mood.slice(1), margin + 40, y);
                    y += 8;
                    doc.setDrawColor(220, 220, 235);
                    doc.line(margin + 4, y, pageWidth - margin - 4, y);
                    y += 6;
                    doc.setFontSize(12);
                    doc.setTextColor(31, 41, 55);
                    doc.setFont("helvetica", "normal");
                }
                doc.text(contentLines, margin + 6, y);
                y += contentLines.length * 5 + 6;

                // ── Tags ──
                if (entry.tags && entry.tags.length > 0) {
                    doc.setFontSize(11);
                    doc.setTextColor(31, 41, 55);
                    doc.setFont("helvetica", "bold");
                    doc.text("Tags:", margin + 6, y);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(107, 114, 128);
                    doc.text(entry.tags.join(", "), margin + 40, y);
                    y += 8;
                }

                drawFooter(currentPageNum, totalPages);
            });

            doc.save(`note-of-life-entries-${new Date().toISOString().slice(0, 10)}.pdf`);
            toast.success(`Exported ${entries.length} entries as PDF`);
        } catch (error: any) {
            console.error("PDF export error:", error);
            toast.error(error.response?.data?.message || "Failed to export PDF");
        } finally {
            setIsExporting(false);
        }
    };

    // ─── Clear all entries (API delete) ──────────────────────────
    const handleClearEntries = async () => {
        if (!clearConfirm) {
            setClearConfirm(true);
            toast("Click again to confirm clearing all entries", {
                icon: "⚠️",
                duration: 5000,
            });
            return;
        }
        setIsClearing(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("You must be logged in.");
                return;
            }
            await axios.delete("/api/entries", {
                headers: getAuthHeaders(),
            });
            toast.success("All entries cleared from your account");
            setClearConfirm(false);
            setTimeout(() => router.push("/diary"), 500);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to clear entries");
        } finally {
            setIsClearing(false);
        }
    };

    // ─── Loading state ──────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    // ─── Render ──────────────────────────────────────────────────
    return (
        <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
            {/* Background blobs */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />
                <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-3xl dark:bg-pink-500/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/5" />
            </div>

            <div className="mx-auto max-w-3xl">
                <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>
                        <p className="text-gray-600 dark:text-gray-400">Customize your app experience</p>
                    </div>
                    <button
                        onClick={() => router.push("/profile")}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-slate-800"
                    >
                        <User size={18} />
                        Profile
                    </button>
                </div>

                <div className="space-y-6">
                    {/* ─── Appearance ─────────────────────────────────────── */}
                    <section className="rounded-3xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70 md:p-8">
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                            <Sun size={20} className="text-yellow-500" />
                            Appearance
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: "light", icon: Sun, label: "Light" },
                                { value: "dark", icon: Moon, label: "Dark" },
                                { value: "system", icon: Monitor, label: "System" },
                            ].map((option) => {
                                const Icon = option.icon;
                                const isActive = settings.theme === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() =>
                                            handleThemeChange(option.value as "light" | "dark" | "system")
                                        }
                                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                                            isActive
                                                ? "border-indigo-500 bg-indigo-50/80 dark:border-indigo-400 dark:bg-indigo-950/40"
                                                : "border-gray-200/50 hover:border-indigo-300 dark:border-gray-700/50 dark:hover:border-indigo-700"
                                        }`}
                                    >
                                        <Icon
                                            size={24}
                                            className={
                                                isActive
                                                    ? "text-indigo-600 dark:text-indigo-400"
                                                    : "text-gray-500 dark:text-gray-400"
                                            }
                                        />
                                        <span
                                            className={`text-sm font-medium ${
                                                isActive
                                                    ? "text-indigo-700 dark:text-indigo-300"
                                                    : "text-gray-700 dark:text-gray-300"
                                            }`}
                                        >
                                            {option.label}
                                        </span>
                                        {isActive && <CheckCircle size={14} className="text-indigo-600 dark:text-indigo-400" />}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* ─── Notifications ───────────────────────────────────── */}
                    <section className="rounded-3xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70 md:p-8">
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                            <Bell size={20} className="text-indigo-500" />
                            Notifications
                        </h2>
                        <div className="space-y-4">
                            {/* (unchanged) */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">Daily Reminder</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Get a daily prompt to write</p>
                                </div>
                                <button
                                    onClick={toggleDailyReminder}
                                    className={`relative flex h-7 w-14 cursor-pointer rounded-full transition-colors ${
                                        settings.dailyReminder ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
                                    }`}
                                >
                                    <span
                                        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-200 ${
                                            settings.dailyReminder ? "left-[calc(100%-1.75rem)]" : "left-0.5"
                                        }`}
                                    />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">Weekly Digest</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive a weekly summary of your entries</p>
                                </div>
                                <button
                                    onClick={toggleWeeklyDigest}
                                    className={`relative flex h-7 w-14 cursor-pointer rounded-full transition-colors ${
                                        settings.weeklyDigest ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
                                    }`}
                                >
                                    <span
                                        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-200 ${
                                            settings.weeklyDigest ? "left-[calc(100%-1.75rem)]" : "left-0.5"
                                        }`}
                                    />
                                </button>
                            </div>
                            {settings.dailyReminder && (
                                <div className="mt-4 rounded-2xl border border-indigo-200/70 bg-indigo-50/40 p-4 text-sm text-slate-700 dark:border-indigo-500/20 dark:bg-indigo-950/30 dark:text-slate-200">
                                    <p className="font-medium">Reminder email</p>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        {userEmail
                                            ? "Note of Life will send a daily reminder email at 9:00 PM (UTC). Please check your inbox and spam folder."
                                            : "Save a profile email address to receive reminder emails."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ─── Data Management ─────────────────────────────────── */}
                    <section className="rounded-3xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70 md:p-8">
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                            <Shield size={20} className="text-emerald-500" />
                            Data Management
                        </h2>
                        <div className="space-y-4">
                            <button
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                className="flex w-full items-center justify-between rounded-xl border border-gray-200/50 px-4 py-3 transition hover:bg-gray-50/50 disabled:opacity-60 dark:border-gray-700/50 dark:hover:bg-slate-800/50"
                            >
                                <div className="flex items-center gap-3">
                                    <Download size={18} className="text-indigo-500" />
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                        Export all entries (PDF)
                                    </span>
                                </div>
                                <span className="text-sm text-gray-400">
                                    {isExporting ? "Generating..." : "Download"}
                                </span>
                            </button>

                            <button
                                onClick={handleClearEntries}
                                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition ${
                                    clearConfirm
                                        ? "border-red-400 bg-red-50/50 dark:border-red-600 dark:bg-red-950/30"
                                        : "border-gray-200/50 hover:bg-gray-50/50 dark:border-gray-700/50 dark:hover:bg-slate-800/50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Trash2 size={18} className="text-red-500" />
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {clearConfirm ? "Confirm: Delete all entries" : "Clear all entries"}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-400">
                                    {isClearing ? "Clearing..." : clearConfirm ? "Tap again" : "Delete"}
                                </span>
                            </button>
                        </div>
                    </section>

                    {/* ─── About ───────────────────────────────────────────── */}
                    <section className="rounded-3xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70 md:p-8">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                            <Info size={20} className="text-purple-500" />
                            About
                        </h2>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p>Note of Life v1.0.0</p>
                            <p>Every Memory Matters</p>
                            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                Made with ❤️ for journaling lovers
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}