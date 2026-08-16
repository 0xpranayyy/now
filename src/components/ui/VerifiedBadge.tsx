import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: number;
}

export function VerifiedBadge({ className, size = 16 }: VerifiedBadgeProps) {
  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center text-brand-500 rounded-full bg-white relative",
        className
      )}
      title="Verified Account"
    >
      <BadgeCheck size={size} className="absolute -inset-[1px]" strokeWidth={2.5} />
    </div>
  );
}
