"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    Sun,
    Moon,
    Monitor,
    Bell,
    Mail,
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
    const [clearConfirm, setClearConfirm] = useState(false);

    // ─── Load settings ──────────────────────────────────────────
    useEffect(() => {
        const stored = localStorage.getItem("appSettings");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSettings(parsed);
                // Important: sync the theme with next-themes
                if (parsed.theme) setTheme(parsed.theme);
            } catch {
                console.error("Failed to parse settings");
            }
        }
        setIsLoading(false);
    }, [setTheme]);

    // ─── Save settings ──────────────────────────────────────────
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

    // ─── Toggle handlers ──────────────────────────────────────
    const toggleDailyReminder = () => {
        const updated = { ...settings, dailyReminder: !settings.dailyReminder };
        saveSettings(updated);
        toast.success(updated.dailyReminder ? "Daily reminders enabled" : "Daily reminders disabled");
    };

    const toggleWeeklyDigest = () => {
        const updated = { ...settings, weeklyDigest: !settings.weeklyDigest };
        saveSettings(updated);
        toast.success(updated.weeklyDigest ? "Weekly digest enabled" : "Weekly digest disabled");
    };

    // ─── Export to PDF ──────────────────────────────────────────
    const handleExportPDF = () => {
        setIsExporting(true);
        try {
            const stored = localStorage.getItem("diaryEntries");
            const entries = stored ? JSON.parse(stored) : [];

            if (entries.length === 0) {
                toast.error("No entries to export");
                setIsExporting(false);
                return;
            }

            const doc = new jsPDF("p", "mm", "a4");
            const pageWidth = doc.internal.pageSize.getWidth();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(79, 70, 229); // indigo-600
            doc.text("Note of Life", pageWidth / 2, 20, { align: "center" });

            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text("Every Memory Matters", pageWidth / 2, 28, { align: "center" });

            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Exported: ${new Date().toLocaleDateString()}`, pageWidth / 2, 35, { align: "center" });

            // Table
            const tableData = entries.map((entry: any) => [
                new Date(entry.date).toLocaleDateString(),
                entry.title,
                entry.content.slice(0, 100) + (entry.content.length > 100 ? "..." : ""),
                entry.mood || "neutral",
                entry.tags?.join(", ") || "",
            ]);

            autoTable(doc, {
                startY: 40,
                head: [["Date", "Title", "Content (preview)", "Mood", "Tags"]],
                body: tableData,
                theme: "striped",
                headStyles: {
                    fillColor: [79, 70, 229],
                    textColor: [255, 255, 255],
                    fontStyle: "bold",
                },
                alternateRowStyles: { fillColor: [240, 240, 250] },
                margin: { left: 10, right: 10 },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 70 },
                    3: { cellWidth: 20 },
                    4: { cellWidth: 30 },
                },
            });

            // Footer
            const finalY = (doc as any).lastAutoTable.finalY || 250;
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text(
                `Total entries: ${entries.length} · Generated by Note of Life`,
                pageWidth / 2,
                finalY + 10,
                { align: "center" }
            );

            doc.save(`note-of-life-entries-${new Date().toISOString().slice(0, 10)}.pdf`);
            toast.success(`Exported ${entries.length} entries as PDF`);
        } catch (error) {
            console.error("PDF export error:", error);
            toast.error("Failed to export PDF");
        } finally {
            setIsExporting(false);
        }
    };

    // ─── Clear entries ─────────────────────────────────────────
    const handleClearEntries = () => {
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
            localStorage.setItem("diaryEntries", JSON.stringify([]));
            toast.success("All entries cleared");
            setClearConfirm(false);
            setTimeout(() => router.push("/diary"), 500);
        } catch {
            toast.error("Failed to clear entries");
        } finally {
            setIsClearing(false);
        }
    };

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