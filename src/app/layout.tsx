import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "ChimeraLabs — NHS Invoice Tracker",
    description: "Hospital invoice and payment tracking",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50">
        {children}
        </body>
        </html>
    );
}