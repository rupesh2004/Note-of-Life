import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Header from "./components/header";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Note of Life",
  description: "A beautiful journaling app to keep your memories, moods and daily stories in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Header />
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </ThemeProvider>
      </body>
      <Footer />
    </html>
  );
}
