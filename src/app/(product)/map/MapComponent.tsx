'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useRouter } from 'next/navigation';
import { Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Moment } from '@/features/moments/types';

// Fix for default Leaflet icon paths in Next.js
// Since Next.js doesn't easily serve Leaflet's internal assets, we create a simple custom icon
const customIcon = new L.DivIcon({
  className: 'custom-map-marker',
  html: `
    <div style="
      width: 20px; 
      height: 20px; 
      background-color: #6366f1; 
      border-radius: 50%; 
      border: 3px solid white;
      box-shadow: 0 0 15px rgba(99,102,241,0.8);
      animation: pulse 2s infinite;
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// We need some global CSS for the pulse animation if we don't have it
if (typeof document !== 'undefined' && !document.getElementById('map-styles')) {
  const style = document.createElement('style');
  style.id = 'map-styles';
  style.innerHTML = `
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(99,102,241, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(99,102,241, 0); }
      100% { box-shadow: 0 0 0 0 rgba(99,102,241, 0); }
    }
  `;
  document.head.appendChild(style);
}

interface MapComponentProps {
  moments: Moment[];
}

// Subcomponent to handle programmatic map movement
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), {
      animate: true,
      duration: 1.5
    });
  }, [center, map]);
  return null;
}

export default function MapComponent({ moments }: MapComponentProps) {
  const router = useRouter();
  
  // Set default center (e.g. San Francisco or a generic point)
  const defaultCenter: [number, number] = [37.7749, -122.4194]; 
  const [center, setCenter] = useState<[number, number]>(defaultCenter);

  // If we have moments with coordinates, center on the first one
  useEffect(() => {
    // Try to get user location as priority
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      }, () => {
        // Fallback to moment location if geolocation fails or is denied
        const momentWithCoords = moments.find(m => m.coordinates?.lat && m.coordinates?.lng);
        if (momentWithCoords && momentWithCoords.coordinates) {
          setCenter([momentWithCoords.coordinates.lat, momentWithCoords.coordinates.lng]);
        }
      });
    }
  }, [moments]);

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  };

  return (
    <div style={{ height: '100dvh', width: '100%', position: 'relative', zIndex: 0 }}>
      {/* Locate Me Button */}
      <button 
        onClick={handleLocateMe}
        className="absolute bottom-24 right-4 z-[400] w-12 h-12 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-brand-400 shadow-xl hover:bg-black/70 transition-colors"
      >
        <Navigation size={20} className="ml-[-2px] mb-[-2px]" />
      </button>

      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapController center={center} />

        {/* CartoDB Dark Matter tiles (free, dark-themed, looks premium) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        
        {moments.map((moment) => {
          // If the moment doesn't have coordinates, we can't map it. 
          // For now, if we don't have PostGIS coords, we might skip rendering or mock it.
          // Since we mocked coords in Discover feed to (0,0), let's just render them there 
          // or at the user's location + small offset if they are perfectly 0,0.
          
          let lat = moment.coordinates?.lat || 0;
          let lng = moment.coordinates?.lng || 0;

          // HACK: If we have 0,0 (mocked), let's scatter them slightly around the center so they are visible
          if (lat === 0 && lng === 0) {
            lat = center[0] + (Math.random() - 0.5) * 0.05;
            lng = center[1] + (Math.random() - 0.5) * 0.05;
          }

          return (
            <Marker 
              key={moment.id} 
              position={[lat, lng]} 
              icon={customIcon}
              eventHandlers={{
                click: () => {
                  router.push(`/moment/${moment.id}`);
                },
              }}
            >
              <Popup className="dark-popup">
                <div className="flex flex-col gap-1 w-32 cursor-pointer" onClick={() => router.push(`/moment/${moment.id}`)}>
                  <div className="font-bold text-sm truncate">{moment.title}</div>
                  <div className="text-xs opacity-80">{moment.participantCount} here now</div>
                  <div className="text-[10px] text-brand-500 font-bold mt-1 uppercase tracking-wider">Tap to join</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      <style jsx global>{`
        /* Overriding Leaflet popup styles to fit our dark glass theme */
        .leaflet-popup-content-wrapper {
          background: rgba(10, 10, 15, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
        }
        .leaflet-popup-tip {
          background: rgba(10, 10, 15, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .leaflet-container {
          background: #000 !important;
        }
      `}</style>
    </div>
  );
}
