"use client";

import dynamic from 'next/dynamic';
import { Moment } from "@/features/moments/types";

// Leaflet uses the window object, so it must be dynamically imported with ssr: false
// inside a Client Component wrapper.
const DynamicMap = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
    </div>
  )
});

interface MapWrapperProps {
  moments: Moment[];
}

export function MapWrapper({ moments }: MapWrapperProps) {
  return <DynamicMap moments={moments} />;
}
