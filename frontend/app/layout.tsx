import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dark Web",
  description: "Educational cybersecurity dashboard simulating automated API data collection.",
  icons: {
    icon: "/illuminati_logo.webp",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0f19] text-slate-100 font-sans">
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0d1321]/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl text-red-500">
                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-lg font-black tracking-tight">TEAM 3</span>
                <span className="text-slate-100 font-semibold tracking-tight">Scrapper bot</span>
              </Link>
              <nav className="hidden md:flex items-center gap-5 px-20 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Link href="/" className="hover:text-red-400 transition-colors">Target Connect</Link>
                <Link href="/dashboard" className="hover:text-red-400 transition-colors">Console</Link>
                <Link href="/collected-data" className="hover:text-red-400 transition-colors">Collected Database</Link>
                <Link href="/analytics" className="hover:text-red-400 transition-colors">Metrics</Link>
                {/* <Link href="/education" className="hover:text-red-400 transition-colors">How Scraping Works</Link> */}
                {/* <Link href="/linkedin-demo" className="hover:text-red-400 transition-colors text-amber-500">LinkedIn Incident</Link> */}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {/* <span className="inline-flex items-center gap-1.5 rounded-full bg-red-950/50 px-2 py-1 text-[10px] uppercase font-bold tracking-widest text-red-400 border border-red-900/50">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Attacker Console active
              </span> */}
            </div>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
        
        <footer className="border-t border-slate-900 bg-[#0d1321] py-6">
          <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
            <p>&copy; {new Date().getFullYear()} Attacker Dashboard.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
