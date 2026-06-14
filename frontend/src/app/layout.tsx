import type { Metadata, Viewport } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEVEN | Workspace Ecosystem",
  description: "High-performance real-time developer workspace designed for Bcore Digital.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png",          sizes: "32x32",  type: "image/png" },
      { url: "/icons/icon-192.png",   sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png",   sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
    shortcut: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1a5c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full dark`}
    >
      <body suppressHydrationWarning className="min-h-full bg-[#09090b] text-[#f4f4f5] antialiased selection:bg-[#00e5ff]/20 selection:text-[#00e5ff]">
        {children}
      </body>
    </html>
  );
}

