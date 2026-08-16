import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { PushRegistry } from "@/components/PushRegistry";
import { OnboardingCheck } from "@/components/OnboardingCheck";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "NOW | What's happening right now",
  description: "A real-time social layer for the physical and digital world.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "NOW",
    statusBarStyle: "black-translucent",
  },
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
          <PushRegistry />
          <OnboardingCheck />
          <div className="flex-1 flex flex-col w-full relative bg-background min-h-[100dvh]">
            {children}
          </div>
        </PostHogProvider>
      </body>
    </html>
  );
}
