'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Moment } from '@/features/moments/types';
import Link from 'next/link';
import { Flame, Users } from 'lucide-react';

// Fix for default Leaflet marker icons not loading in Next.js
// We create a custom HTML marker icon to look like a modern map pin
const createCustomIcon = (moment: Moment) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${moment.isLive ? '#ef4444' : '#6366f1'};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: white;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Component to handle geolocation and centering
function LocationHandler() {
  const map = useMap();

  useEffect(() => {
    map.locate().on('locationfound', function (e) {
      map.flyTo(e.latlng, 14);
    });
  }, [map]);

  return null;
}

export default function MapComponent({ moments }: { moments: Moment[] }) {
  // Default to a generic location until Geolocation kicks in
  const defaultPosition: [number, number] = [37.7749, -122.4194]; // San Francisco

  return (
    <div className="w-full h-full relative" style={{ zIndex: 0 }}>
      <MapContainer 
        center={defaultPosition} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <LocationHandler />

        {moments.map((moment) => (
          <Marker 
            key={moment.id} 
            position={[moment.coordinates.lat, moment.coordinates.lng]}
            icon={createCustomIcon(moment)}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-base mb-1 truncate">{moment.title}</h3>
                <p className="text-xs text-gray-500 mb-3 truncate">{moment.locationName}</p>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                    <Users size={12} />
                    {moment.participantCount}
                  </div>
                  {moment.trendingScore > 0 && (
                    <div className="flex items-center gap-1 text-xs font-bold text-orange-500">
                      <Flame size={12} />
                      {moment.trendingScore}
                    </div>
                  )}
                  {moment.isLive && (
                    <div className="text-[10px] font-bold text-red-500 tracking-wider">LIVE</div>
                  )}
                </div>

                <Link 
                  href={`/moment/${moment.id}`}
                  className="block w-full text-center bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                >
                  Join Moment
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Global styles for the Leaflet popup override */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper {
          background: #ffffff;
          color: #000000;
          border-radius: 16px;
          padding: 4px;
        }
        .leaflet-popup-tip {
          background: #ffffff;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #999;
          padding: 8px;
        }
      `}} />
    </div>
  );
}
