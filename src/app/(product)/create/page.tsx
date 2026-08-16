"use client";

import { useState } from "react";
import { createMomentAction } from "./actions";
import { MapPin, Clock, Tag, Navigation } from "lucide-react";

export default function CreateMomentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"IDLE" | "LOADING" | "SUCCESS" | "ERROR">("IDLE");
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  const requestLocation = () => {
    setLocationStatus("LOADING");
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus("SUCCESS");
        },
        () => setLocationStatus("ERROR"),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocationStatus("ERROR");
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-background relative overflow-hidden">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col p-6">
        {/* Background elements */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <header className="mb-8 mt-4 relative z-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create Moment</h1>
        <p className="text-muted-foreground">What's happening right now?</p>
      </header>

      <div className="flex-1 overflow-y-auto relative z-10 pb-20">
        <form 
          className="flex flex-col gap-5"
          onSubmit={() => setIsSubmitting(true)}
          action={createMomentAction}
        >
          {/* Title Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium pl-1 text-foreground/80">Title</label>
            <input 
              name="title" 
              type="text" 
              required
              maxLength={60}
              placeholder="e.g. Secret warehouse party"
              className="bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-brand-500/50 transition-colors placeholder:text-muted-foreground/50 font-medium"
            />
          </div>

          {/* Location Fake Input / GPS Req */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium pl-1 text-foreground/80 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-brand-400" />
                Location
              </span>
              {locationStatus === 'SUCCESS' && (
                <span className="text-xs text-green-400 font-bold">Acquired</span>
              )}
            </label>
            
            {coords && (
              <>
                <input type="hidden" name="lat" value={coords.lat} />
                <input type="hidden" name="lng" value={coords.lng} />
              </>
            )}

            <button 
              type="button"
              onClick={requestLocation}
              disabled={locationStatus === 'LOADING' || locationStatus === 'SUCCESS'}
              className="bg-black/40 border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between text-base transition-colors hover:border-brand-500/30 disabled:opacity-80"
            >
              <span className={locationStatus === 'SUCCESS' ? "text-foreground" : "text-muted-foreground"}>
                {locationStatus === 'IDLE' && "Tap to share current location"}
                {locationStatus === 'LOADING' && "Locating..."}
                {locationStatus === 'SUCCESS' && "Location attached to moment"}
                {locationStatus === 'ERROR' && "Failed to get location. Try again."}
              </span>
              <Navigation size={18} className={locationStatus === 'SUCCESS' ? "text-brand-400" : "text-muted-foreground/50"} />
            </button>
            <p className="text-[10px] text-muted-foreground/60 px-2 flex gap-1 items-center">
              * Required to show up accurately on the map
            </p>
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium pl-1 text-foreground/80 flex items-center gap-2">
              <Tag size={14} className="text-brand-400" />
              Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['NIGHTLIFE', 'FOOD', 'EVENT', 'SPONTANEOUS'].map((cat) => (
                <label key={cat} className="relative cursor-pointer">
                  <input type="radio" name="category" value={cat} className="peer sr-only" required defaultChecked={cat === 'SPONTANEOUS'} />
                  <div className="bg-black/40 border border-white/10 rounded-xl py-3 px-2 text-center text-xs font-medium text-muted-foreground peer-checked:bg-brand-500/20 peer-checked:text-brand-400 peer-checked:border-brand-500/50 transition-all">
                    {cat}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium pl-1 text-foreground/80">Details (Optional)</label>
            <textarea 
              name="description" 
              placeholder="What should people know?"
              rows={3}
              className="bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-500/50 transition-colors placeholder:text-muted-foreground/50 resize-none"
            />
          </div>

          {/* Ephemeral Notice */}
          <div className="glass rounded-xl p-4 flex gap-3 items-center mt-2 border border-brand-500/10 bg-brand-500/5">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-brand-400" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This moment will automatically expire in <strong className="text-foreground">4 hours</strong> to keep the map fresh.
            </p>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Go Live"
            )}
          </button>
        </form>
      </div>
    </div>
    </div>
  );
}
