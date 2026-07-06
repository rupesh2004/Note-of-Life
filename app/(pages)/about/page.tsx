"use client";

import Link from "next/link";
import {
    Sparkles,
    Heart,
    Users,
    Target,
    PenSquare,
    ArrowRight,
    Quote,
    BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
    const values = [
        {
            icon: Heart,
            title: "Authenticity",
            description:
                "We believe every voice matters. Your story is unique, and we're here to help you tell it honestly.",
            color: "from-pink-500 to-rose-500",
        },
        {
            icon: Sparkles,
            title: "Growth",
            description:
                "Journaling is a journey of self-discovery. We build tools that help you reflect, learn, and evolve.",
            color: "from-indigo-500 to-purple-500",
        },
        {
            icon: Users,
            title: "Community",
            description:
                "While journaling is personal, we foster a supportive community where storytellers inspire each other.",
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: Target,
            title: "Clarity",
            description:
                "Our design is minimal and intentional—free of distractions, so your thoughts can take center stage.",
            color: "from-amber-500 to-orange-500",
        },
    ];

    const team = [
        {
            name: "Rupesh Bhosale",
            role: "Freelance Developer & Founder",
            bio: "Passionate about building meaningful digital experiences. Created Note of Life to help people preserve their memories and emotions through the power of journaling.",
            image: "https://avatars.githubusercontent.com/rupesh2004",
        },
    ];

    const milestones = [
        { year: "2023", event: "Note of Life was born out of a simple idea: everyone deserves a place to write." },
        { year: "2024", event: "Launched the first public beta with timeline and emotional tracking." },
        { year: "2025", event: "Reached 10,000 active journalers and introduced AI-powered insights." },
        { year: "2026", event: "Today, we're a global community of storytellers, growing every day." },
    ];

    return (
        <main className="min-h-screen overflow-x-hidden">
            {/* ─── HERO ─── */}
            <section className="relative isolate px-6 pt-24 pb-20 md:pt-32 md:pb-28">
                {/* Background blobs */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />
                    <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-3xl dark:bg-pink-500/5" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-4xl text-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-indigo-50/50 px-4 py-1.5 text-sm font-medium text-indigo-700 backdrop-blur-sm dark:border-indigo-800/30 dark:bg-indigo-950/30 dark:text-indigo-300">
                        <BookOpen size={14} />
                        <span>Our Story</span>
                    </div>

                    <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                        Built with{" "}
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                            Heart & Purpose
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400 md:text-xl">
                        Note of Life was created to give everyone a beautiful,
                        private, and meaningful space to capture their journey.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/diary"
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40"
                        >
                            <PenSquare size={20} />
                            Start Your Story
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ─── OUR STORY ─── */}
            <section className="px-6 py-20 md:py-28">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                How It All Began
                            </h2>
                            <div className="mt-4 space-y-4 text-gray-600 dark:text-gray-400">
                                <p>
                                    In early 2023, our founder Rupesh was going through a
                                    challenging period. He started writing daily—just a
                                    few lines—and soon realized how transformative the
                                    habit was.
                                </p>
                                <p>
                                    But most journaling apps felt either too clinical or
                                    too cluttered. So Rupesh decided to build something
                                    different: a diary that felt like a close friend—warm,
                                    intuitive, and deeply personal.
                                </p>
                                <p>
                                    Today, Note of Life is used by thousands of people
                                    across the globe. We're proud to be a part of their
                                    daily routine, their healing, and their joy.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <Quote size={20} />
                                <span className="font-medium">
                                    "Every page tells a story. Every story becomes a
                                    memory."
                                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="rounded-3xl border border-gray-200/50 bg-white/70 p-6 shadow-2xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70">
                                <div className="space-y-6">
                                    {milestones.map((m, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-sm font-bold text-white">
                                                {m.year.slice(-2)}
                                            </div>
                                            <div>
                                                <p className="text-gray-700 dark:text-gray-300">
                                                    {m.event}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── VALUES ─── */}
            <section className="px-6 py-20 bg-gray-50/50 dark:bg-slate-900/30">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="mb-16 text-center"
                    >
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            What We Stand For
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                            Our values shape every feature, every pixel, and every
                            interaction.
                        </p>
                    </motion.div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {values.map((value, i) => {
                            const Icon = value.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.08 }}
                                    viewport={{ once: true }}
                                    className="group rounded-2xl border border-gray-200/50 bg-white/60 p-6 backdrop-blur-sm transition-all hover:border-indigo-300/50 hover:shadow-xl dark:border-gray-800/50 dark:bg-slate-900/60"
                                >
                                    <div
                                        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${value.color} shadow-lg`}
                                    >
                                        <Icon size={22} className="text-white" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                        {value.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {value.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── TEAM ─── */}
            <section className="px-6 py-20 md:py-28">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="mb-16 text-center"
                    >
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Meet the{" "}
                            <span className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                                Creator
                            </span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                            A passionate developer dedicated to making journaling beautiful and accessible.
                        </p>
                    </motion.div>

                    <div className="flex justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="rounded-2xl border border-gray-200/50 bg-white/60 p-6 text-center backdrop-blur-sm transition-all hover:border-indigo-300/50 hover:shadow-lg dark:border-gray-800/50 dark:bg-slate-900/60 max-w-sm"
                        >
                            <img
                                src={team[0].image}
                                alt={team[0].name}
                                className="mx-auto h-28 w-28 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-800"
                            />
                            <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                                {team[0].name}
                            </h3>
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                {team[0].role}
                            </p>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {team[0].bio}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
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
                            Join Our Story
                        </h2>

                        <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100">
                            Become part of a growing community of journalers. Your
                            story matters—start writing it today.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/diary"
                                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-indigo-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                            >
                                <PenSquare size={20} />
                                Start Writing Free
                            </Link>

                            <Link
                                href="/diary"
                                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 font-medium text-white transition-all hover:bg-white/10"
                            >
                                Explore Diaries
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}