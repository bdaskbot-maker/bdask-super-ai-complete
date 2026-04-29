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
    "BDAsk Super AI is Bangladesh's most advanced AI assistant powered by NVIDIA. Support for Bengali and English, multiple AI models including Kimi K2.5, Nemotron, Gemma, and GLM.",
  keywords: [
    "AI assistant",
    "Bangladesh",
    "Bengali AI",
    "NVIDIA AI",
    "code assistant",
    "chatbot",
    "Kimi K2.5",
    "Nemotron",
    "BDAsk",
  ],
  authors: [{ name: "BDAsk Team" }],
  creator: "BDAsk Team",
  publisher: "BDAsk",
  metadataBase: new URL("https://bdask-super-ai.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BDAsk Super AI - Bangladesh's Advanced AI Assistant",
    description: "Bangladesh's most advanced AI assistant powered by NVIDIA with multiple AI models",
    type: "website",
    siteName: "BDAsk Super AI",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BDAsk Super AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BDAsk Super AI - Bangladesh's Advanced AI Assistant",
    description: "Bangladesh's most advanced AI assistant powered by NVIDIA",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon-512x512.jpg",
    apple: "/icon-512x512.jpg",
  },
  manifest: "/manifest.json",
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
