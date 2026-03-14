import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "BDAsk Super AI - Bangladesh's Advanced AI Assistant",
  description:
    "BDAsk Super AI is Bangladesh's most advanced AI assistant with coding capabilities. Support for Bengali and English, code generation, file operations, and more.",
  keywords: [
    "AI assistant",
    "Bangladesh",
    "Bengali AI",
    "code assistant",
    "chatbot",
    "Gemini",
  ],
  authors: [{ name: "BDAsk Team" }],
  openGraph: {
    title: "BDAsk Super AI",
    description: "Bangladesh's most advanced AI assistant with coding capabilities",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
