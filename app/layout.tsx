import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clepto Client Portal",
  description: "Client portal for Clepto.io - View your workflow analytics, AI costs, and compliance documentation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
