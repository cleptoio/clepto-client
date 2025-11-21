import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProvider } from "@/contexts/ClientContext";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Clepto.io Client Portal",
    description: "AI Automation Agency Client Dashboard - View your workflow executions, analytics, and support tickets",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ClientProvider>
                    {children}
                    <Toaster />
                </ClientProvider>
            </body>
        </html>
    );
}
