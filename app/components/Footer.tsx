"use client";

import { useState } from "react";
import Link from "next/link";
import {
    FaBookOpen,
    FaGithub,
    FaLinkedin,
    FaEnvelope,
    FaHeart,
} from "react-icons/fa";
import LegalModal from "../components/LegalModal"; // adjust path if needed

export default function Footer() {
    const year = new Date().getFullYear();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"privacy" | "terms">("privacy");

    const openModal = (type: "privacy" | "terms") => {
        setModalType(type);
        setModalOpen(true);
    };

    return (
        <footer className="mt-20 border-t border-gray-200 bg-white/70 backdrop-blur-xl dark:border-gray-800 dark:bg-slate-950/70">
            <div className="mx-auto max-w-7xl px-6 py-14">
                {/* Top Section */}
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg">
                                <FaBookOpen className="text-xl text-white" />
                            </div>
                            <div>
                                <h2 className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-xl font-bold text-transparent">
                                    Note of Life
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Every Memory Matters
                                </p>
                            </div>
                        </div>
                        <p className="mt-5 leading-7 text-gray-600 dark:text-gray-400">
                            Preserve your memories, capture your emotions, and write your life
                            story one page at a time.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
                        <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                            <li>
                                <Link href="/" className="hover:text-indigo-600">Home</Link>
                            </li>
                            <li>
                                <Link href="/diary" className="hover:text-indigo-600">My Diary</Link>
                            </li>
                            <li>
                                <Link href="/diary" className="hover:text-indigo-600">Write Journal</Link>
                            </li>
                            <li>
                                <Link href="/timeline" className="hover:text-indigo-600">Timeline</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Resources</h3>
                        <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                            <li>
                                <Link href="/about" className="hover:text-indigo-600">About</Link>
                            </li>
                            <li>
                                {/* Privacy Policy - opens modal */}
                                <button
                                    onClick={() => openModal("privacy")}
                                    className="hover:text-indigo-600 transition-colors"
                                >
                                    Privacy Policy
                                </button>
                            </li>
                            <li>
                                {/* Terms & Conditions - opens modal */}
                                <button
                                    onClick={() => openModal("terms")}
                                    className="hover:text-indigo-600 transition-colors"
                                >
                                    Terms & Conditions
                                </button>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-indigo-600">Contact</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Connect</h3>
                        <p className="mb-5 text-gray-600 dark:text-gray-400">
                            Follow us and stay connected.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com/rupesh2004"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 transition-all duration-300 hover:scale-110 hover:border-indigo-600 hover:bg-indigo-600 hover:text-white dark:border-gray-700"
                            >
                                <FaGithub />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/rupeshkumar-bhosale-681b63255/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 transition-all duration-300 hover:scale-110 hover:border-blue-600 hover:bg-blue-600 hover:text-white dark:border-gray-700"
                            >
                                <FaLinkedin />
                            </a>
                            <a
                                href="mailto:bhosalerupesh67@gmail.com"
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 transition-all duration-300 hover:scale-110 hover:border-red-500 hover:bg-red-500 hover:text-white dark:border-gray-700"
                            >
                                <FaEnvelope />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Quote */}
                <div className="my-10 border-t border-gray-200 pt-8 text-center dark:border-gray-800">
                    <p className="text-lg italic text-gray-600 dark:text-gray-400">
                        "Every page tells a story. Every story becomes a memory."
                    </p>
                </div>

                {/* Bottom */}
                <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400 md:flex-row">
                    <p>
                        © {year} <span className="font-semibold">Note of Life</span>. All Rights Reserved.
                    </p>
                    <p className="flex items-center gap-2">
                        Made with <FaHeart className="text-red-500" /> for journaling lovers.
                    </p>
                </div>
            </div>

            {/* Legal Modal */}
            <LegalModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                type={modalType}
            />
        </footer>
    );
}