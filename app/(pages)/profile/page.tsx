"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Trash2,
  BookOpen,
  Heart,
  Calendar,
  LogOut,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  name: string;
  email: string;
  exp?: number;
}

interface UserStats {
  totalEntries: number;
  totalMoods: number;
  topMood: string;
  streak: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  // ─── Edit state ──────────────────────────────────────────────
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // ─── Password change state ──────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ─── Loading states ──────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ─── Load user from token ────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }
      const userData = { name: decoded.name, email: decoded.email };
      setUser(userData);
      setEditName(decoded.name);
      setEditEmail(decoded.email);
      fetchStats();
    } catch {
      localStorage.removeItem("token");
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // ─── Fetch user stats ────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/auth/user/stats", {
        headers: getAuthHeaders(),
      });
      setStats(response.data);
    } catch {
      // Silent fail – stats are optional
    }
  };

  // ─── Update profile ──────────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim().length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }
    if (!editEmail.includes("@")) {
      toast.error("Please enter a valid email.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.put(
        "/api/auth/user/profile",
        {
          name: editName.trim(),
          email: editEmail.trim(),
        },
        {
          headers: getAuthHeaders(),
        }
      );
      // New token comes back with updated info
      localStorage.setItem("token", response.data.token);
      const decoded = jwtDecode<JWTPayload>(response.data.token);
      setUser({ name: decoded.name, email: decoded.email });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update profile.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Change password ─────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await axios.put(
        "/api/auth/user/password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: getAuthHeaders(),
        }
      );
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to change password.";
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ─── Delete account ──────────────────────────────────────────
  const confirmDeleteAccount = async () => {
    setConfirmDialog(null);
    setIsDeleting(true);
    try {
      await axios.delete("/api/auth/user/profile", {
        headers: getAuthHeaders(),
      });
      localStorage.removeItem("token");
      toast.success("Account deleted successfully.");
      router.replace("/");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete account.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    setConfirmDialog({
      message: "Are you sure you want to delete your account? This action is irreversible.",
      onConfirm: confirmDeleteAccount,
    });
  };

  // ─── Logout ───────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ─── Loading state ───────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const ConfirmationDialog = ({
    message,
    onConfirm,
    onCancel,
  }: {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onCancel();
        }}
      >
        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
        >
          <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Confirm action</div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-gray-600 dark:text-gray-400">You are not logged in.</p>
        <button
          onClick={() => router.push("/login")}
          className="rounded-full bg-linear-to-r from-indigo-600 to-pink-500 px-6 py-2 text-white"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence>
        {confirmDialog && (
          <ConfirmationDialog
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
          />
        )}
      </AnimatePresence>
      <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-150 w-150 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />
        <div className="absolute -bottom-40 -left-40 h-150 w-150 rounded-full bg-pink-500/10 blur-3xl dark:bg-pink-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-200 w-200 rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/5" />
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account settings
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* ─── Profile Info (left) ─────────────────────────────── */}
          <div className="md:col-span-2 space-y-8">
            {/* Update Profile */}
            <div className="rounded-3xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70 md:p-8">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input
                      id="name"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address(View Only)
                  </label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input
                    // view only mode
                    readOnly
                      id="email"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-indigo-600 to-pink-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-105 disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="rounded-3xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70 md:p-8">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                Change Password
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="current" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Password
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input
                      id="current"
                      type={showCurrent ? "text" : "password"}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 pl-10 pr-12 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="new" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input
                      id="new"
                      type={showNew ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 pl-10 pr-12 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm New Password
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 pl-10 pr-12 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-indigo-600 to-pink-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-105 disabled:opacity-70"
                >
                  {isChangingPassword ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ─── Sidebar (Stats & Actions) ───────────────────────── */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="rounded-3xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Your Diary Stats
              </h3>
              {stats ? (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Entries</span>
                    <span className="font-semibold">{stats.totalEntries}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Moods Used</span>
                    <span className="font-semibold">{stats.totalMoods}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Top Mood</span>
                    <span className="font-semibold capitalize">{stats.topMood}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
                    <span className="font-semibold">{stats.streak} days 🔥</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No stats available yet.</p>
              )}
            </div>

            {/* Danger Zone */}
            <div className="rounded-3xl border border-red-200/50 bg-red-50/30 p-6 backdrop-blur-sm dark:border-red-800/30 dark:bg-red-950/20">
              <h3 className="mt-1 text-lg font-semibold text-red-700 dark:text-red-400">
                Danger Zone
              </h3>
              <p className="mb-4 text-sm text-red-600 dark:text-red-300">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-600 hover:scale-105 disabled:opacity-70"
              >
                {isDeleting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}