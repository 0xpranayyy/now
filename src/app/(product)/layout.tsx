import { BottomNav } from "@/components/navigation/BottomNav";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex-1 pb-24 relative overflow-y-auto overflow-x-hidden">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
