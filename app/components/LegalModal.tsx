"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, FileText } from "lucide-react";

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "privacy" | "terms";
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    const content = type === "privacy" ? privacyContent : termsContent;
    const title = type === "privacy" ? "Privacy Policy" : "Terms & Conditions";
    const Icon = type === "privacy" ? Shield : FileText;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm dark:bg-black/60"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200/50 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/95"
                    >
                        {/* ─── Header with gradient bar ─── */}
                        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-4 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-white">{title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-full p-1.5 text-white/80 transition hover:bg-white/20"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* ─── Content ─── */}
                        <div className="p-6 md:p-8">
                            <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                                {content}
                            </div>
                        </div>

                        {/* ─── Footer ─── */}
                        <div className="sticky bottom-0 flex justify-end border-t border-gray-200/50 bg-white/95 px-6 py-4 backdrop-blur-sm dark:border-gray-800/50 dark:bg-slate-900/95 rounded-b-2xl">
                            <button
                                onClick={onClose}
                                className="rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-105"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Content – Professionally structured ──────────────────────
const privacyContent = (
    <div className="space-y-8">
        <div className="rounded-xl bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Last updated:</strong> July 1, 2026
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                At <strong>Note of Life</strong> ("we," "our," or "us"), we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our diary application.
            </p>
        </div>

        <section>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">1. Information We Collect</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Personal Information:</strong> Name, email address, profile picture (if provided).</li>
                <li><strong>Journal Entries:</strong> All text, mood tags, and media you upload.</li>
                <li><strong>Usage Data:</strong> How you interact with the app (features used, time spent).</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">2. How We Use Your Information</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li>To provide, maintain, and improve our services.</li>
                <li>To personalise your experience and suggest insights.</li>
                <li>To send you updates, newsletters, or support messages (only with consent).</li>
                <li>To protect against fraud and security threats.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">3. Data Storage &amp; Security</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li>Your entries are stored securely with industry‑standard encryption.</li>
                <li>We never share your personal journal content with third parties.</li>
                <li>You can export or delete all your data at any time.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">4. Cookies</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li>We use only essential cookies for authentication and preferences.</li>
                <li>We do not use tracking cookies for advertising.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">5. Your Rights</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li>Access, correct, or delete your data.</li>
                <li>Withdraw consent at any time.</li>
                <li>Request a copy of your data in a portable format.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">6. Contact Us</h3>
            <p>
                If you have any questions, email us at{" "}
                <a href="mailto:noteoflife52@gmail.com" className="text-indigo-600 hover:underline dark:text-indigo-400">
                    noteoflife52@gmail.com
                </a>.
            </p>
        </section>
    </div>
);

const termsContent = (
    <div className="space-y-8">
        <div className="rounded-xl bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Last updated:</strong> July 1, 2026
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Welcome to <strong>Note of Life</strong> ("we," "our," or "us"). By using our app, you agree to the following Terms &amp; Conditions.
            </p>
        </div>

        <section>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">1. Acceptance of Terms</h3>
            <p>
                By creating an account and using Note of Life, you agree to be bound by these terms. If you do not agree, please discontinue use immediately.
            </p>
        </section>

        <section>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">2. Account Responsibility</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li>You are responsible for keeping your login credentials secure.</li>
                <li>You are solely responsible for all content you post (journal entries).</li>
                <li>You must be at least 13 years old to use the app.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">3. Content Ownership</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li>You retain full ownership of your journal entries.</li>
                <li>We do not claim any rights to your content.</li>
                <li>We may use anonymised, aggregated data for product improvement.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">4. Prohibited Activities</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li>Uploading illegal, harmful, or abusive content.</li>
                <li>Attempting to breach security measures.</li>
                <li>Using the app for any unlawful purpose.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">5. Termination</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li>We may suspend or terminate your account if you violate these terms.</li>
                <li>You may delete your account at any time from settings.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">6. Limitation of Liability</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li>We provide the app "as is" without any warranties.</li>
                <li>We are not liable for any loss of data or damages arising from use.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">7. Changes to Terms</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li>We may update these terms occasionally. We will notify you of significant changes.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">8. Contact</h3>
            <p>
                Questions? Reach us at{" "}
                <a href="mailto:noteoflife52@gmail.com" className="text-indigo-600 hover:underline dark:text-indigo-400">
                    noteoflife52@gmail.com
                </a>.
            </p>
        </section>
    </div>
);