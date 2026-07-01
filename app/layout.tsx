import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Header from "./components/header";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
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
    <html lang="en">
      <Header />
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
      <Footer />
    </html>
  );
}
