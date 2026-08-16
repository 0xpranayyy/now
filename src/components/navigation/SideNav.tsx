"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Map as MapIcon, PlusCircle, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/discover", icon: Compass, label: "Discover" },
  { href: "/map", icon: MapIcon, label: "Map" },
  { href: "/messages", icon: MessageCircle, label: "Inbox" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function SideNav() {
  const pathname = usePathname();

  // Hide on immersive pages like Live Moments or Chat rooms
  if (pathname.startsWith('/moment/') || (pathname.startsWith('/messages/') && pathname !== '/messages')) {
    return null;
  }

  return (
    <nav className="hidden md:flex flex-col w-[250px] lg:w-[275px] h-[100dvh] fixed left-0 top-0 border-r border-white/10 bg-background/80 backdrop-blur-xl z-[100] px-4 py-8 overflow-y-auto">
      
      {/* Logo */}
      <Link href="/discover" className="mb-8 px-4">
        <h1 className="text-3xl font-black tracking-tighter text-white">NOW</h1>
      </Link>

      {/* Nav Items */}
      <div className="flex flex-col gap-2 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 text-lg font-semibold group hover:bg-white/5",
                isActive ? "text-white bg-white/10" : "text-muted-foreground hover:text-white"
              )}
            >
              <Icon
                size={28}
                strokeWidth={isActive ? 2.5 : 2}
                className={cn("transition-transform duration-300", isActive ? "" : "group-hover:scale-110")}
              />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Create Button */}
      <Link 
        href="/create"
        className="mt-auto w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-full text-center text-lg shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-1"
      >
        <span className="flex items-center justify-center gap-2">
          <PlusCircle size={24} />
          Create Moment
        </span>
      </Link>
    </nav>
  );
}
