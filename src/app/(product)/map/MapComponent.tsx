'use client';

import { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { useRouter } from 'next/navigation';
import { Moment } from '@/features/moments/types';

// Dark Mode Map Style JSON
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];

interface MapComponentProps {
  moments: Moment[];
}

function MapController({ moments }: { moments: Moment[] }) {
  const map = useMap();
  const router = useRouter();
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);

  useEffect(() => {
    if (!map) return;
    
    // Set initial location from geolocation or fallback
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        map.setZoom(14);
      }, () => {
        const momentWithCoords = moments.find(m => m.coordinates?.lat && m.coordinates?.lng);
        if (momentWithCoords && momentWithCoords.coordinates) {
          map.panTo({ lat: momentWithCoords.coordinates.lat, lng: momentWithCoords.coordinates.lng });
          map.setZoom(14);
        }
      });
    }
  }, [map, moments]);

  return (
    <>
      {moments.map((moment) => {
        let lat = moment.coordinates?.lat || 0;
        let lng = moment.coordinates?.lng || 0;

        if (lat === 0 && lng === 0 && map) {
            const center = map.getCenter();
            lat = (center?.lat() || 37.7749) + (Math.random() - 0.5) * 0.05;
            lng = (center?.lng() || -122.4194) + (Math.random() - 0.5) * 0.05;
        }

        return (
          <AdvancedMarker
            key={moment.id}
            position={{ lat, lng }}
            onClick={() => setSelectedMoment(moment)}
          >
            <div className="w-5 h-5 bg-brand-500 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-pulse-slow cursor-pointer" />
          </AdvancedMarker>
        );
      })}

      {selectedMoment && (
        <InfoWindow
          position={{ 
            lat: selectedMoment.coordinates?.lat || 0, 
            lng: selectedMoment.coordinates?.lng || 0 
          }}
          onCloseClick={() => setSelectedMoment(null)}
          headerDisabled={true}
        >
          <div 
            className="flex flex-col gap-1 w-32 cursor-pointer text-white bg-black/90 p-3 rounded-2xl border border-white/10" 
            onClick={() => router.push(`/moment/${selectedMoment.id}`)}
          >
            <div className="font-bold text-sm truncate">{selectedMoment.title}</div>
            <div className="text-xs text-white/80">{selectedMoment.participantCount} here now</div>
            <div className="text-[10px] text-brand-400 font-bold mt-1 uppercase tracking-wider">Tap to join</div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function MapComponent({ moments }: MapComponentProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] w-full text-center px-6 bg-background">
        <h2 className="text-2xl font-bold mb-4">Google Maps API Key Missing</h2>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Please add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code>.env.local</code> file to view the Map.
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: '100dvh', width: '100%', position: 'relative', zIndex: 0 }}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
          defaultZoom={13}
          mapId="DEMO_MAP_ID" 
          disableDefaultUI={true}
          styles={DARK_MAP_STYLE}
        >
          <MapController moments={moments} />
        </Map>
      </APIProvider>
      
      <style jsx global>{`
        /* Hide the default Google Maps InfoWindow styles */
        .gm-style-iw-c {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .gm-style-iw-tc::after {
          background: rgba(0, 0, 0, 0.9) !important;
        }
        .gm-ui-hover-effect {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
