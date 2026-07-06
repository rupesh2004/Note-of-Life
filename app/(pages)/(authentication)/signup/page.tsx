"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Sparkles,
    BookOpen,
} from "lucide-react";
import { FaGoogle, FaGithub, FaApple } from "react-icons/fa";
import toast from "react-hot-toast";
import LegalModal from "../../../components/LegalModal";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // ─── Legal Modal state ──────────────────────────────────────
    const [legalModalOpen, setLegalModalOpen] = useState(false);
    const [legalModalType, setLegalModalType] = useState<"privacy" | "terms">("privacy");

    const openLegalModal = (type: "privacy" | "terms") => {
        setLegalModalType(type);
        setLegalModalOpen(true);
    };

    const closeLegalModal = () => setLegalModalOpen(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            toast.error("Please fill in all required fields");
            return;
        }
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (!agreeTerms) {
            toast.error("You must agree to the terms and conditions");
            return;
        }
        setIsLoading(true);

        try {
            const response = await axios.post("/api/auth/signup", {
                name,
                email,
                password,
            });
            const { token, user } = response.data;
            console.log("Signup successful:", response.data);
            localStorage.setItem("token", token);
            toast.success("Account created successfully!");
            setTimeout(() => {
                router.push("/home");
            }, 800);
        } catch (error: any) {
            const message = error.response?.data?.message || "An error occurred during signup";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialSignup = (provider: string) => {
        toast.success("Feature coming soon")
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-6 py-12">
            {/* Background blobs (unchanged) */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />
                <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-3xl dark:bg-pink-500/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/5" />
            </div>

            <div className="w-full max-w-md">
                {/* Card */}
                <div className="rounded-3xl border border-gray-200/50 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70">
                    {/* Logo / Brand */}
                    <div className="mb-8 text-center">
                        <div className="flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg">
                                <BookOpen className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Create Your Account
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Start your journaling journey today.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name – unchanged */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Full Name
                            </label>
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    required
                                    className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                                />
                            </div>
                        </div>

                        {/* Email – unchanged */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Email Address
                            </label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                                />
                            </div>
                        </div>

                        {/* Password – unchanged */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Password
                            </label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    required
                                    className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 pl-10 pr-12 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Must be at least 8 characters.
                            </p>
                        </div>

                        {/* Confirm Password – unchanged */}
                        <div>
                            <label
                                htmlFor="confirm-password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Confirm Password
                            </label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                <input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    required
                                    className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 pl-10 pr-12 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* ─── Terms & Conditions with Modal ─── */}
                        <div className="flex items-start gap-2 pt-1">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700 dark:bg-slate-800"
                            />
                            <label
                                htmlFor="terms"
                                className="text-sm text-gray-600 dark:text-gray-400"
                            >
                                I agree to the{" "}
                                <button
                                    type="button"
                                    onClick={() => openLegalModal("terms")}
                                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 underline-offset-2 hover:underline focus:outline-none"
                                >
                                    Terms & Conditions
                                </button>
                                {" "}and{" "}
                                <button
                                    type="button"
                                    onClick={() => openLegalModal("privacy")}
                                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 underline-offset-2 hover:underline focus:outline-none"
                                >
                                    Privacy Policy
                                </button>
                                .
                            </label>
                        </div>

                        {/* Submit button – unchanged */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Creating account...
                                </span>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider – unchanged */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white/70 px-3 text-gray-500 backdrop-blur-sm dark:bg-slate-900/70 dark:text-gray-400">
                                Or sign up with
                            </span>
                        </div>
                    </div>

                    {/* Social buttons – unchanged */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => handleSocialSignup("google")}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white/50 py-2.5 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                        >
                            <FaGoogle className="h-5 w-5 text-red-500" />
                            <span className="sr-only">Google</span>
                        </button>
                        <button
                            onClick={() => handleSocialSignup("github")}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white/50 py-2.5 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                        >
                            <FaGithub className="h-5 w-5 text-gray-900 dark:text-white" />
                            <span className="sr-only">GitHub</span>
                        </button>
                        <button
                            onClick={() => handleSocialSignup("apple")}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white/50 py-2.5 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                        >
                            <FaApple className="h-5 w-5 text-gray-900 dark:text-white" />
                            <span className="sr-only">Apple</span>
                        </button>
                    </div>

                    {/* Login link – unchanged */}
                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            Sign in instead
                        </Link>
                    </p>
                </div>
            </div>

            {/* ─── Legal Modal ─── */}
            <LegalModal
                isOpen={legalModalOpen}
                onClose={closeLegalModal}
                type={legalModalType}
            />
        </main>
    );
}