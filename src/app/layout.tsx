import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Placement Intelligence Suite",
  description: "Comprehensive placement preparation and AI interview platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="fixed bottom-4 left-6 z-50 pointer-events-none">
          <p className="text-zinc-500/80 text-xs font-medium tracking-wider uppercase">
            BY kethan sunkara © 2026
          </p>
        </footer>
      </body>
    </html>
  );
}
