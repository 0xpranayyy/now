import { BottomNav } from "@/components/navigation/BottomNav";
import { SideNav } from "@/components/navigation/SideNav";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] w-full">
      <SideNav />
      {/* 
        On desktop (md:), the main content starts after the SideNav (250px). 
        On mobile, it takes full width and has padding bottom for BottomNav.
      */}
      <main className="flex-1 pb-24 md:pb-0 md:ml-[250px] lg:ml-[275px] relative overflow-y-auto overflow-x-hidden">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
