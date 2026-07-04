"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
    PenSquare,
    Calendar,
    Sparkles,
    Heart,
    Clock,
    Shield,
    ArrowRight,
    Quote,
    Star,
    Users,
    BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

export default function HomePage() {
    const { theme } = useTheme();
    const [statsData, setStatsData] = useState<{ totalUsers: number; totalEntries: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get("/api/stats");
                console.log(response.data)
                setStatsData(response.data);
            } catch (error) {
                console.error("Failed to fetch stats:", error);
                // Fallback to static numbers if API fails
                setStatsData({ totalUsers: 12000, totalEntries: 85000 });
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const features = [
        {
            icon: PenSquare,
            title: "Beautiful Journaling",
            description:
                "Write your thoughts in a distraction-free environment with rich formatting and emotional tagging.",
            color: "from-indigo-500 to-purple-500",
        },
        {
            icon: Calendar,
            title: "Timeline View",
            description:
                "See your life unfold chronologically. Every entry becomes a moment in your personal history.",
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: Heart,
            title: "Emotional Tracking",
            description:
                "Log your moods and emotions with each entry. Discover patterns and grow self-awareness.",
            color: "from-pink-500 to-rose-500",
        },
        {
            icon: Shield,
            title: "Private & Secure",
            description:
                "Your memories are yours alone. End-to-end encryption ensures your diary stays private.",
            color: "from-indigo-600 to-blue-500",
        },
        {
            icon: Sparkles,
            title: "AI-Powered Insights",
            description:
                "Get gentle reflections and pattern recognition from your entries over time.",
            color: "from-violet-500 to-indigo-500",
        },
        {
            icon: Clock,
            title: "Daily Reminders",
            description:
                "Never miss a day. Gentle nudges help you build a lasting journaling habit.",
            color: "from-amber-500 to-orange-500",
        },
    ];

    const testimonials = [
        {
            quote:
                "Note of Life has changed how I process my emotions. Writing daily has become my sanctuary.",
            name: "Sarah K.",
            role: "Writer & Creative",
            rating: 5,
        },
        {
            quote:
                "The timeline feature is incredible. I can look back at my year and see how I've grown.",
            name: "James R.",
            role: "Product Designer",
            rating: 5,
        },
        {
            quote:
                "Finally, a journaling app that feels personal and beautiful. Every detail is thoughtfully designed.",
            name: "Maya L.",
            role: "Student & Dreamer",
            rating: 5,
        },
    ];

    const stats = [
        { 
            number: isLoading ? "..." : `${(statsData?.totalUsers || 0).toLocaleString()}+`, 
            label: "Active Journalers" 
        },
        { 
            number: isLoading ? "..." : `${(statsData?.totalEntries || 0).toLocaleString()}+`, 
            label: "Entries Written" 
        },
        { number: "4.9★", label: "Average Rating" },
        { number: "150+", label: "Countries" },
    ];

    return (
        <main className="min-h-screen overflow-x-hidden">
            {/* ─── HERO SECTION ─── */}
            <section className="relative isolate px-6 pt-24 pb-20 md:pt-32 md:pb-28 lg:pt-40 lg:pb-32">
                {/* Background gradient blobs */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />
                    <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-3xl dark:bg-pink-500/5" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/5" />
                </div>

                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
                        {/* Left side: Text */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-indigo-50/50 px-4 py-1.5 text-sm font-medium text-indigo-700 backdrop-blur-sm dark:border-indigo-800/30 dark:bg-indigo-950/30 dark:text-indigo-300">
                                <Sparkles size={14} />
                                <span>Start your journey today</span>
                            </div>

                            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                                Your Life,
                                <br />
                                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                                    One Page at a Time
                                </span>
                            </h1>

                            <p className="max-w-lg text-lg text-gray-600 dark:text-gray-400 md:text-xl">
                                Note of Life is your personal diary for capturing
                                memories, tracking emotions, and telling your story.
                                Start writing your legacy today.
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                                <Link
                                    href="/write"
                                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40"
                                >
                                    <PenSquare size={20} />
                                    Start Writing Free
                                    <ArrowRight
                                        size={18}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </Link>

                                <Link
                                    href="/about"
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-8 py-3.5 font-medium text-gray-700 transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30"
                                >
                                    Learn More
                                </Link>
                            </div>

                            {/* Social proof */}
                            <div className="flex items-center gap-6 pt-4">
                                <div className="flex -space-x-2">
                                    {[
                                        "https://i.pravatar.cc/100?img=1",
                                        "https://i.pravatar.cc/100?img=2",
                                        "https://i.pravatar.cc/100?img=3",
                                        "https://i.pravatar.cc/100?img=4",
                                    ].map((src, i) => (
                                        <img
                                            key={i}
                                            src={src}
                                            alt="User"
                                            className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-950"
                                        />
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-0.5 text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill="currentColor" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Loved by 12,000+ journalers
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right side: Hero illustration */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative flex justify-center"
                        >
                            <div className="relative w-full max-w-md">
                                {/* Decorative card */}
                                <div className="rounded-3xl border border-gray-200/50 bg-white/70 p-6 shadow-2xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70">
                                    <div className="flex items-center gap-3 border-b border-gray-200/50 pb-4 dark:border-gray-800/50">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 shadow-lg">
                                            <BookOpen className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                Note of Life
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Today's entry
                                            </p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-1 text-sm text-gray-400">
                                            <Heart size={14} className="text-pink-500" />
                                            <span>Feeling grateful</span>
                                        </div>
                                    </div>

                                    <div className="py-4 space-y-3">
                                        <div className="h-2 w-3/4 rounded-full bg-gray-200 dark:bg-gray-700" />
                                        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
                                        <div className="h-2 w-5/6 rounded-full bg-gray-200 dark:bg-gray-700" />
                                        <div className="h-2 w-2/3 rounded-full bg-gray-200 dark:bg-gray-700" />
                                    </div>

                                    <div className="flex items-center justify-between border-t border-gray-200/50 pt-4 dark:border-gray-800/50">
                                        <span className="text-sm text-gray-400">
                                            📅 Today at 7:42 PM
                                        </span>
                                        <span className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400">
                                            Read more
                                            <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </div>

                                {/* Floating elements */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    className="absolute -top-6 -right-6 rounded-2xl border border-gray-200/50 bg-white/80 px-4 py-2 shadow-lg backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/80"
                                >
                                    <span className="flex items-center gap-2 text-sm font-medium">
                                        <Sparkles size={16} className="text-yellow-500" />
                                        ✨ 3 insights today
                                    </span>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 8, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, delay: 0.5, ease: "easeInOut" }}
                                    className="absolute -bottom-4 -left-6 rounded-2xl border border-gray-200/50 bg-white/80 px-4 py-2 shadow-lg backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/80"
                                >
                                    <span className="flex items-center gap-2 text-sm font-medium">
                                        <Calendar size={16} className="text-indigo-500" />
                                        47 days streak 🔥
                                    </span>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── STATS SECTION ─── */}
            <section className="border-y border-gray-200/50 bg-gray-50/50 backdrop-blur-sm dark:border-gray-800/50 dark:bg-slate-900/30">
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <p className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                                    {stat.number}
                                </p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FEATURES SECTION ─── */}
            <section className="px-6 py-24 md:py-32">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="mb-16 text-center"
                    >
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Crafted for{" "}
                            <span className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                                Meaningful Journaling
                            </span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                            Everything you need to capture your thoughts, track your
                            emotions, and build a lasting journaling habit.
                        </p>
                    </motion.div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.08 }}
                                    viewport={{ once: true }}
                                    className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/50 p-6 backdrop-blur-sm transition-all hover:border-indigo-300/50 hover:shadow-xl hover:shadow-indigo-500/5 dark:border-gray-800/50 dark:bg-slate-900/50 dark:hover:border-indigo-700/50"
                                >
                                    <div
                                        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}
                                    >
                                        <Icon size={22} className="text-white" />
                                    </div>

                                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                        {feature.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-400">
                                        {feature.description}
                                    </p>

                                    {/* Hover glow */}
                                    <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 blur-2xl`}
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── TESTIMONIALS ─── */}
            <section className="px-6 py-20 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-slate-900/30">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="mb-16 text-center"
                    >
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Loved by{" "}
                            <span className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                                Storytellers
                            </span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                            See what our community has to say about their journaling
                            journey.
                        </p>
                    </motion.div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-2xl border border-gray-200/50 bg-white/60 p-6 backdrop-blur-sm transition-all hover:border-indigo-300/50 hover:shadow-lg dark:border-gray-800/50 dark:bg-slate-900/60"
                            >
                                <Quote
                                    size={28}
                                    className="mb-3 text-indigo-400/60 dark:text-indigo-500/40"
                                />

                                <p className="text-gray-700 dark:text-gray-300">
                                    "{t.quote}"
                                </p>

                                <div className="mt-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-sm font-semibold text-white">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {t.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t.role}
                                        </p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-0.5 text-yellow-400">
                                        {[...Array(t.rating)].map((_, j) => (
                                            <Star key={j} size={14} fill="currentColor" />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA SECTION ─── */}
            <section className="px-6 py-24 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-1"
                >
                    <div className="relative rounded-3xl bg-white/10 backdrop-blur-sm p-12 text-center md:p-16">
                        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent" />

                        <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                            Start Writing Your Story
                        </h2>

                        <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100">
                            Join thousands of journalers who use Note of Life to
                            capture memories, track emotions, and grow every day.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/write"
                                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-indigo-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                            >
                                <PenSquare size={20} />
                                Start Writing Free
                            </Link>

                            <Link
                                href="/about"
                                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 font-medium text-white transition-all hover:bg-white/10"
                            >
                                Learn More
                            </Link>
                        </div>

                        <p className="mt-6 text-sm text-indigo-200">
                            No credit card required. Start for free.
                        </p>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}