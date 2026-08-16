"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Map as MapIcon, PlusCircle, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/discover", icon: Compass, label: "Discover" },
  { href: "/map", icon: MapIcon, label: "Map" },
  { href: "/create", icon: PlusCircle, label: "Create", highlight: true },
  { href: "/messages", icon: MessageCircle, label: "Inbox" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide BottomNav on immersive pages (like Live Moment chat rooms and DMs)
  if (pathname.startsWith('/moment/') || (pathname.startsWith('/messages/') && pathname !== '/messages')) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl pb-safe-offset">
      <div className="flex items-center justify-center gap-1 px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative px-4 py-3 flex items-center justify-center"
            >
              {isActive && !item.highlight && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-white/10 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "relative z-10 transition-colors duration-300",
                  item.highlight
                    ? "bg-brand-500 text-white rounded-full p-3 shadow-[0_0_20px_rgba(99,102,241,0.5)] -my-2"
                    : isActive
                    ? "text-white"
                    : "text-muted-foreground hover:text-white/80"
                )}
              >
                <Icon
                  size={item.highlight ? 28 : 24}
                  strokeWidth={isActive || item.highlight ? 2.5 : 2}
                />
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
