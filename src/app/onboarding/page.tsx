"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Zap, Clock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    icon: MapPin,
    title: "Discover the Now",
    description: "See what's happening around you in real-time. A live map of spontaneous moments, parties, and hidden gems.",
    color: "text-brand-500",
    bg: "bg-brand-500/10"
  },
  {
    icon: Zap,
    title: "Drop a Moment",
    description: "Found something cool? Drop a pin and instantly start a live chat room with people nearby.",
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    icon: Clock,
    title: "Ephemeral & Fresh",
    description: "Everything disappears after a few hours. The map is always fresh, showing only what's happening right now.",
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  }
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      localStorage.setItem('onboarding_completed', 'true');
      router.push('/discover');
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[50%] w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 bg-brand-500/20 rounded-full blur-[100px] opacity-50" />
      </div>

      <div className="flex-1 w-full max-w-sm flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            {/* Icon */}
            <div className={`w-24 h-24 rounded-full ${slides[currentSlide].bg} flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/5`}>
              {(() => {
                const Icon = slides[currentSlide].icon;
                return <Icon size={40} className={slides[currentSlide].color} />;
              })()}
            </div>

            {/* Text */}
            <h1 className="text-3xl font-bold tracking-tight">
              {slides[currentSlide].title}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed px-4">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="w-full max-w-sm pb-safe-offset relative z-10 flex flex-col gap-8">
        {/* Indicators */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div 
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? "w-8 bg-brand-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="w-full bg-foreground text-background py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          {currentSlide < slides.length - 1 && <ChevronRight size={20} />}
        </motion.button>
      </div>
    </div>
  );
}
