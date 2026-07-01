"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  BookOpen,
  PenSquare,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "Diary", href: "/diary" },
    { name: "Timeline", href: "/timeline" },
    { name: "About", href: "/about" },
  ];

  // ✅ Fixed: runs only once, and skips login/signup pages
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const publicRoutes = ["/login", "/signup", "/"];
    
  //   if (!token && !publicRoutes.includes(pathname)) {
  //     router.replace("/login");
  //   }
  // }, [pathname, router]);

  // ─── Optionally hide Login button when already logged in ───
  const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("token");

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
              {theme === "dark" ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {/* Login – hide if already logged in */}
            {!isLoggedIn && (
              <Link
                href="/login"
                className="hidden md:block px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-900 transition"
              >
                Login
              </Link>
            )}

            {/* CTA – if logged in, show "Write" else "Start Writing" */}
            <Link
              href={isLoggedIn ? "/write" : "/diary"}
              className="hidden md:flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-6 py-2.5 font-semibold shadow-lg hover:scale-105 transition"
            >
              <PenSquare size={18} />
              {isLoggedIn ? "Write" : "Start Writing"}
            </Link>

            {/* Mobile Button */}
            <button className="lg:hidden" onClick={() => setOpen(!open)}>
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950">
          <div className="flex flex-col p-5 space-y-4">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600"
              >
                {item.name}
              </Link>
            ))}

            {!isLoggedIn && (
              <Link
                href="/login"
                className="rounded-lg border px-4 py-2 text-center"
              >
                Login
              </Link>
            )}

            <Link
              href={isLoggedIn ? "/write" : "/login"}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-4 py-2 text-center"
            >
              {isLoggedIn ? "Write" : "Start Writing"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}