"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    Lock,
    ArrowLeft,
    Eye,
    EyeOff,
    CheckCircle,
} from "lucide-react";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // ─── Step 1: Send OTP ──────────────────────────────────────
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }
        setIsLoading(true);
        try {
            await axios.post("/api/auth/forgot-password", { email });
            toast.success("OTP sent to your email.");
            setStep("otp");
            // Start resend timer
            setResendTimer(60);
            const interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to send OTP.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Step 2: Verify OTP ────────────────────────────────────
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP.");
            return;
        }
        setIsLoading(true);
        try {
            await axios.post("/api/auth/verify-otp", { email, otp, purpose: "reset" });
            toast.success("OTP verified. Set your new password.");  
            setStep("reset");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Invalid or expired OTP.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Step 3: Reset Password ────────────────────────────────
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in all fields.");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        setIsLoading(true);
        try {
            await axios.post("/api/auth/reset-password", {
                email,
                newPassword,
            });
            toast.success("Password reset successfully! Please login.");
            router.push("/login");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to reset password.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Resend OTP ────────────────────────────────────────────
    const handleResendOTP = async () => {
        if (resendTimer > 0) return;
        setIsLoading(true);
        try {
            await axios.post("/api/auth/forgot-password", { email });
            toast.success("OTP resent.");
            setResendTimer(60);
            const interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to resend OTP.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Render content based on step ──────────────────────────
    const renderStep = () => {
        switch (step) {
            case "email":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-5"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enter your email address and we'll send you a 6-digit OTP to reset your password.
                        </p>
                        
                        <form onSubmit={handleSendOTP}>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-4 w-full rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-105 disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Sending...
                                    </span>
                                ) : (
                                    "Send OTP"
                                )}
                            </button>
                        </form>
                    </motion.div>
                );

            case "otp":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-5"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            We've sent a 6-digit OTP to <strong>{email}</strong>. Enter it below. Check your inbox or spam folder. If you didn't receive it, you can resend the OTP.
                        </p>
                        <form onSubmit={handleVerifyOTP}>
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                className="w-full rounded-xl border border-gray-300 bg-white/50 py-3 px-4 text-center text-2xl tracking-[8px] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white"
                                required
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={resendTimer > 0 || isLoading}
                                    className="text-sm text-indigo-600 hover:underline dark:text-indigo-400 disabled:opacity-50"
                                >
                                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-6 py-2 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-105 disabled:opacity-70"
                                >
                                    {isLoading ? "Verifying..." : "Verify OTP"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                );

            case "reset":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-5"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Set a new password for your account.
                        </p>
                        <form onSubmit={handleResetPassword}>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New password (min. 8 characters)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 pl-10 pr-12 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="relative mt-3">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 pl-10 pr-12 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-4 w-full rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-105 disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Resetting...
                                    </span>
                                ) : (
                                    "Reset Password"
                                )}
                            </button>
                        </form>
                    </motion.div>
                );
        }
    };

    // ─── Render ──────────────────────────────────────────────────
    return (
        <main className="min-h-screen flex items-center justify-center px-6 py-12">
            {/* Background blobs */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />
                <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-3xl dark:bg-pink-500/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/5" />
            </div>

            <div className="w-full max-w-md">
                <div className="rounded-3xl border border-gray-200/50 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70">
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Forgot Password
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {step === "email" && "Reset your password in a few steps."}
                            {step === "otp" && "Check your email for the OTP."}
                            {step === "reset" && "Create a new password."}
                        </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="mb-6 flex items-center justify-center gap-2">
                        {["email", "otp", "reset"].map((s, idx) => {
                            const currentStepIndex = ["email", "otp", "reset"].indexOf(step);
                            const isCompleted = idx < currentStepIndex;
                            const isActive = step === s;
                            return (
                                <div key={s} className="flex items-center">
                                    <div
                                        className={`h-2.5 w-2.5 rounded-full transition-colors ${
                                            isActive
                                                ? "bg-indigo-600"
                                                : isCompleted
                                                ? "bg-green-500"
                                                : "bg-gray-300 dark:bg-gray-600"
                                        }`}
                                    />
                                    {idx < 2 && (
                                        <div
                                            className={`h-0.5 w-8 transition-colors ${
                                                isCompleted ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>

                    {/* Back to login */}
                    <div className="mt-6 text-center text-sm">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                            <ArrowLeft size={16} />
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}