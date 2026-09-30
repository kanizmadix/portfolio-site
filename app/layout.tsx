import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/ui/Cursor";
import SmoothScroll from "@/components/ui/SmoothScroll";
import CommandPalette from "@/components/ui/CommandPalette";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import { ThemeModeProvider } from "@/lib/theme-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://kanizmadix.github.io/portfolio-site/";
const TITLE = "Kanishk S — Generative AI Engineer";
const DESCRIPTION =
  "Portfolio of Kanishk S, a Generative AI Engineer specialising in LLM pipelines, RAG systems, AI agents, and AWS cloud architecture.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: TITLE,
    images: [{ url: `${SITE_URL}og.png`, width: 1200, height: 630, alt: TITLE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}og.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeModeProvider>
          <Cursor />
          <SmoothScroll>{children}</SmoothScroll>
          <CommandPalette />
          {/* Fixed so it's always reachable — Terminal/Paper modes replace the
              whole page (including <Nav>), this is the way back to Pro. */}
          <div className="fixed bottom-5 right-5 z-[9998]">
            <ThemeSwitcher />
          </div>
        </ThemeModeProvider>
      </body>
    </html>
  );
}
