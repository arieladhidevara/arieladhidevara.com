import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/navigation/site-nav";
import { SiteFooter } from "@/components/footer/site-footer";

const display = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"]
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "Ariel Adhidevara | Portfolio",
  description: "Creative technology portfolio spanning interactive systems, AI software, spatial design, objects, and visual media."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-base font-[var(--font-body)] text-text antialiased">
        <SiteNav />
        <div className="pt-20">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
