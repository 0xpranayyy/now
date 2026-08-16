"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function OnboardingCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only check if we are on a product page, not login or onboarding itself
    if (pathname.startsWith('/onboarding') || pathname.startsWith('/login') || pathname === '/') {
      setIsChecking(false);
      return;
    }

    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasCompletedOnboarding) {
      router.push('/onboarding');
    } else {
      setIsChecking(false);
    }
  }, [pathname, router]);

  // We could return a full screen loader here if isChecking is true,
  // but returning null is fine for a quick redirect.
  if (isChecking) return null;

  return null;
}
