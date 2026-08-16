import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/navigation/BottomNav";
import { PostHogProvider } from "@/providers/PostHogProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NOW | What's happening right now",
  description: "A real-time social layer for the physical and digital world.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-brand-500/30">
        <PostHogProvider>
          <div className="flex-1 flex flex-col w-full max-w-md mx-auto relative shadow-2xl bg-background/50 min-h-[100dvh]">
            {children}
          </div>
          <BottomNav />
        </PostHogProvider>
      </body>
    </html>
  );
}
