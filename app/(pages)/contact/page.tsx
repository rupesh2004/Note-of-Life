"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    FaEnvelope,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaGlobe,
    FaPaperPlane,
    FaCheckCircle,
    FaUser,
    FaAt,
    FaCommentDots,
    FaGithub,
    FaLinkedin,
    FaTwitter,
    FaInstagram,
} from "react-icons/fa";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSuccess(false);

        if (!formData.name || !formData.email || !formData.message) {
            setError("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            console.log("Form submitted:", formData);
            setIsSuccess(true);
            setFormData({ name: "", email: "", subject: "", message: "" });
            setTimeout(() => setIsSuccess(false), 5000);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactMethods = [
        {
            icon: FaEnvelope,
            title: "Email",
            value: "bhosalerupesh67@gmail.com",
            link: "mailto:bhosalerupesh67@gmail.com",
            color: "from-blue-500 to-indigo-500",
        },
        {
            icon: FaPhoneAlt,
            title: "Phone",
            value: "+91 80801 86885",
            link: "tel:+918080186885",
            color: "from-emerald-500 to-teal-500",
        },
        {
            icon: FaMapMarkerAlt,
            title: "Address",
            value: "Vardhman Dreams Phase 1, Pune, Maharashtra, India",
            link: "https://maps.app.goo.gl/ChmTBLsis2vJTLXJA",
            color: "from-rose-500 to-pink-500",
        },
        {
            icon: FaGlobe,
            title: "Website",
            value: "RupeshBhosale.com",
            link: "https://rupesh-portfolio-ultp.onrender.com/",
            color: "from-indigo-600 to-purple-600",
        },
    ];

    const socialLinks = [
        {
            name: "GitHub",
            icon: FaGithub,
            url: "https://github.com/rupesh2004",
            color: "hover:bg-gray-800 hover:text-white dark:hover:bg-white dark:hover:text-gray-900",
        },
        {
            name: "LinkedIn",
            icon: FaLinkedin,
            url: "https://www.linkedin.com/in/rupeshkumar-bhosale-681b63255/",
            color: "hover:bg-[#0A66C2] hover:text-white",
        },
        {
            name: "Twitter",
            icon: FaTwitter,
            url: "https://twitter.com/noteoflife",
            color: "hover:bg-[#1DA1F2] hover:text-white",
        },
        {
            name: "Instagram",
            icon: FaInstagram,
            url: "https://www.instagram.com/_rupesh_bhosale_/",
            color: "hover:bg-gradient-to-r hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white",
        },
    ];

    return (
        <main className="min-h-screen px-6 py-12 md:py-16">
            {/* Background blobs */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />
                <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-3xl dark:bg-pink-500/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/5" />
            </div>

            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Get in{" "}
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                            Touch
                        </span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                        We'd love to hear from you. Whether you have a question, feedback, or just want to say hello – reach out anytime.
                    </p>
                </motion.div>

                {/* Contact Methods Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {contactMethods.map((method, index) => {
                        const Icon = method.icon;
                        return (
                            <a
                                key={index}
                                href={method.link}
                                target={method.title === "Address" ? "_blank" : undefined}
                                rel={method.title === "Address" ? "noopener noreferrer" : undefined}
                                className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/60 p-6 backdrop-blur-sm transition-all hover:border-indigo-300/50 hover:shadow-xl dark:border-gray-800/50 dark:bg-slate-900/60"
                            >
                                <div
                                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${method.color} shadow-lg`}
                                >
                                    <Icon className="text-white" size={22} />
                                </div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {method.title}
                                </h3>
                                <p className="mt-1 font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {method.value}
                                </p>
                            </a>
                        );
                    })}
                </motion.div>

                {/* Contact Form & Social */}
                <div className="grid gap-12 lg:grid-cols-5">
                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        <div className="rounded-3xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70 md:p-8">
                            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                                Send a Message
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative mt-1">
                                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            id="name"
                                            placeholder="Your name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative mt-1">
                                        <FaAt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                        <input
                                            type="email"
                                            id="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="subject"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        placeholder="What's this about?"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 px-4 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="message"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        placeholder="Your message..."
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border border-gray-300 bg-white/50 py-3 px-4 text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-gray-500"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                                        {error}
                                    </div>
                                )}

                                {isSuccess && (
                                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                                        <FaCheckCircle size={18} />
                                        Your message has been sent! We'll get back to you soon.
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <FaPaperPlane size={20} />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Social & Info Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="lg:col-span-2"
                    >
                        <div className="rounded-3xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-slate-900/70 md:p-8">
                            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                                Connect With Us
                            </h2>

                            <p className="mb-6 text-gray-600 dark:text-gray-400">
                                Follow us on social media for updates, tips, and inspiration.
                            </p>

                            <div className="space-y-4">
                                {socialLinks.map((social) => {
                                    const Icon = social.icon;
                                    return (
                                        <a
                                            key={social.name}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-3 rounded-xl border border-gray-200/50 px-4 py-3 transition-all hover:scale-[1.02] dark:border-gray-700/50 ${social.color}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="font-medium">{social.name}</span>
                                        </a>
                                    );
                                })}
                            </div>

                            <div className="mt-6 rounded-xl bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
                                <div className="flex items-start gap-3">
                                    <FaCommentDots className="mt-0.5 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Response Time
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            We aim to respond within 24 hours on business days.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Quote */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-16 text-center"
                >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Or simply send us an email at{" "}
                        <a
                            href="mailto:bhosalerupesh67@gmail.com"
                            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            bhosalerupesh67@gmail.com
                        </a>
                    </p>
                </motion.div>
            </div>
        </main>
    );
}