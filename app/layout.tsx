import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vortex Finance | Gestión Financiera Inteligente",
  description: "Controla tus ingresos y gastos familiares en tiempo real de forma segura. Desarrollado con Next.js e InsForge.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vortex Finance",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

import Navigation from "@/components/Navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100" suppressHydrationWarning>
        <Navigation />
        <div className="flex-1 md:pl-64 pb-20 md:pb-0 w-full">
          {children}
        </div>
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
