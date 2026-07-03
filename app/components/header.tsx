"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  BookOpen,
  PenSquare,
  Menu,
  X,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { jwtDecode } from "jwt-decode";

// ─── Type for JWT payload ─────────────────────────────────────
interface JWTPayload {
  name: string;
  email: string;
  exp?: number;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ─── Helper to decode user from token ───────────────────────
  const getUserFromToken = (): { name: string; email: string } | null => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const decoded = jwtDecode<JWTPayload>(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return null;
      }
      return { name: decoded.name, email: decoded.email };
    } catch {
      return null;
    }
  };

  // ─── Load user on mount and on route change ─────────────────
  useEffect(() => {
    const userData = getUserFromToken();
    if (userData) {
      setUser(userData);
      setIsLoggedIn(true);
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  }, [pathname]);

  // ─── Click outside to close dropdown ────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Helpers for avatar ──────────────────────────────────────
  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-red-500 to-rose-500",
      "from-orange-500 to-amber-500",
      "from-green-500 to-emerald-500",
      "from-blue-500 to-cyan-500",
      "from-indigo-500 to-purple-500",
      "from-purple-500 to-pink-500",
      "from-pink-500 to-rose-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsLoggedIn(false);
    setDropdownOpen(false);
    router.push("/login");
  };

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "Diary", href: "/diary" },
    { name: "Timeline", href: "/timeline" },
    { name: "About", href: "/about" },
  ];

  // ─── Render ──────────────────────────────────────────────────
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                Note of Life
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Every Memory Matters
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-gray-700 dark:text-gray-300 font-medium transition hover:text-indigo-600 after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-0 after:bg-indigo-600 after:transition-all hover:after:w-full"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-11 w-11 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:scale-105 transition"
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun size={18} className="text-yellow-400" />
                ) : (
                  <Moon size={18} />
                )
              ) : (
                <Sun size={18} className="opacity-0" />
              )}
            </button>

            {isLoggedIn && user ? (
              <>
                {/* Write button (desktop) */}
                <Link
                  href="/write"
                  className="hidden md:flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-5 py-2.5 font-semibold shadow-lg hover:scale-105 transition"
                >
                  <PenSquare size={18} />
                  Write
                </Link>

                {/* Avatar with dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r ${getAvatarColor(user.name)} shadow-lg transition hover:scale-105 focus:outline-none`}
                  >
                    <span className="text-white text-lg font-bold">
                      {getInitials(user.name)}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200/50 bg-white/90 backdrop-blur-sm shadow-lg dark:border-gray-800/50 dark:bg-slate-900/90 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-800/50">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Login button with User icon */}
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-900 transition"
                >
                  <User size={18} />
                  Login
                </Link>
                <Link
                  href="/diary"
                  className="hidden md:flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-6 py-2.5 font-semibold shadow-lg hover:scale-105 transition"
                >
                  <PenSquare size={18} />
                  Start Writing
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950">
          <div className="flex flex-col p-5 space-y-4">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600"
              >
                {item.name}
              </Link>
            ))}

            {isLoggedIn && user ? (
              <>
                <div className="flex items-center gap-3 py-2 border-t border-gray-200 dark:border-gray-800">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${getAvatarColor(user.name)} text-white font-bold`}>
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/write"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-4 py-2 text-center"
                >
                  Write
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-red-300 text-red-600 px-4 py-2 text-center hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-center"
                >
                  <User size={16} />
                  Login
                </Link>
                <Link
                  href="/diary"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-4 py-2 text-center"
                >
                  Start Writing
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}