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

    // ─── Export PDF with branding, background colors, and M/D/YYYY date ──
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
            const margin = 20;
            const contentWidth = pageWidth - margin * 2;
            let y = margin;

            // ─── Colors ──────────────────────────────────────────────
            const primaryColor: [number, number, number] = [79, 70, 229]; // indigo-600
            const secondaryColor: [number, number, number] = [236, 72, 153]; // pink-500
            const cardBg: [number, number, number] = [245, 243, 255]; // indigo-50
            const borderColor: [number, number, number] = [224, 221, 235];
            const textDark: [number, number, number] = [31, 41, 55];
            const textGray: [number, number, number] = [107, 114, 128];
            const textLight: [number, number, number] = [156, 163, 175];

            // ─── Helpers ──────────────────────────────────────────────
            const ensureNewPage = () => {
                doc.addPage();
                y = margin;
            };

            const drawSeparator = (yPos: number) => {
                doc.setDrawColor(200, 200, 220);
                doc.line(margin, yPos, pageWidth - margin, yPos);
            };

            // ─── Draw Brand Header ────────────────────────────────────
            const drawBrandHeader = (isFirstPage: boolean = true) => {
                if (!isFirstPage) {
                    doc.setFontSize(10);
                    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
                    doc.text("Note of Life – Every Memory Matters", pageWidth / 2, y, { align: "center" });
                    y += 8;
                    drawSeparator(y);
                    y += 6;
                } else {
                    doc.setFontSize(26);
                    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                    doc.text("Note of Life", pageWidth / 2, y, { align: "center" });
                    y += 10;

                    doc.setFontSize(14);
                    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
                    doc.text("Every Memory Matters", pageWidth / 2, y, { align: "center" });
                    y += 10;

                    doc.setFontSize(10);
                    doc.setTextColor(textLight[0], textLight[1], textLight[2]);
                    const exportDate = new Date().toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    doc.text(`Exported: ${exportDate}`, pageWidth / 2, y, { align: "center" });
                    y += 12;

                    drawSeparator(y);
                    y += 8;
                }
            };

            // ─── Draw a single entry ──────────────────────────────────
            const drawEntry = (entry: any, index: number) => {
                if (index > 0) {
                    ensureNewPage();
                    drawBrandHeader(false);
                } else {
                    drawBrandHeader(true);
                }

                // ── Card background ──
                const cardStartY = y - 2;
                doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
                doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
                doc.roundedRect(margin, cardStartY, contentWidth, 0, 2, 2, "FD");

                // ── Title ──
                doc.setFontSize(18);
                doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.text(entry.title, margin + 4, y);
                y += 10;

                // ── Metadata with M/D/YYYY date ──
                doc.setFontSize(10);
                doc.setTextColor(textGray[0], textGray[1], textGray[2]);
                const entryDate = new Date(entry.date);
                const dateStr = entryDate.toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric'
                });
                const timeStr = entryDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                let metaText = `📅 ${dateStr} at ${timeStr}  •  Mood: ${entry.mood || "neutral"}`;
                if (entry.tags && entry.tags.length > 0) {
                    metaText += `  •  Tags: ${entry.tags.join(", ")}`;
                }
                doc.text(metaText, margin + 4, y);
                y += 8;

                // ── Separator line ──
                doc.setDrawColor(220, 220, 235);
                doc.line(margin + 4, y - 2, pageWidth - margin - 4, y - 2);
                y += 6;

                // ── Content ──
                doc.setFontSize(11);
                doc.setTextColor(textDark[0], textDark[1], textDark[2]);
                const contentLines = doc.splitTextToSize(entry.content, contentWidth - 8);
                const neededHeight = contentLines.length * 5 + 20;

                if (y + neededHeight > pageHeight - margin - 10) {
                    ensureNewPage();
                    drawBrandHeader(false);
                    doc.setFontSize(18);
                    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                    doc.text(entry.title, margin + 4, y);
                    y += 10;

                    doc.setFontSize(10);
                    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
                    doc.text(metaText, margin + 4, y);
                    y += 8;

                    doc.setDrawColor(220, 220, 235);
                    doc.line(margin + 4, y - 2, pageWidth - margin - 4, y - 2);
                    y += 6;

                    doc.setFontSize(11);
                    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
                }
                doc.text(contentLines, margin + 4, y);
                y += contentLines.length * 5 + 6;

                // ── Footer ──
                doc.setFontSize(8);
                doc.setTextColor(textLight[0], textLight[1], textLight[2]);
                const footerText = `Entry ${index + 1} of ${entries.length}  •  Note of Life`;
                doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
            };

            // ─── Loop through entries ──────────────────────────────────
            entries.forEach((entry: any, idx: number) => {
                drawEntry(entry, idx);
            });

            // ─── Save the PDF ──────────────────────────────────────────
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
                    {/* Appearance */}
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

                    {/* Notifications */}
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
                            {settings.dailyReminder && (
                                <div className="mt-4 rounded-2xl border border-indigo-200/70 bg-indigo-50/40 p-4 text-sm text-slate-700 dark:border-indigo-500/20 dark:bg-indigo-950/30 dark:text-slate-200">
                                    <p className="font-medium">Reminder email</p>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        {userEmail
                                            ? "Send a test reminder email to your registered address. Check your inbox or spam folder."
                                            : "Save a profile email address to receive reminder emails."}
                                    </p>
                                    <button
                                        onClick={() => userEmail && sendDailyReminder(userEmail)}
                                        disabled={!userEmail || isSendingReminder}
                                        className="mt-3 inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSendingReminder ? "Sending..." : "Send test reminder"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Data Management */}
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

                    {/* About */}
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