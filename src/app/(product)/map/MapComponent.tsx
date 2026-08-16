'use client';

import { useEffect, useState, useRef } from 'react';
import Map, { Marker, Popup, GeolocateControl, NavigationControl } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'next/navigation';
import { Moment } from '@/features/moments/types';

interface MapComponentProps {
  moments: Moment[];
}

export default function MapComponent({ moments }: MapComponentProps) {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  
  const defaultViewState = {
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 13,
    pitch: 45,
    bearing: 0
  };

  const [viewState, setViewState] = useState(defaultViewState);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [hasLocated, setHasLocated] = useState(false);

  useEffect(() => {
    if (!hasLocated && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setViewState(prev => ({
          ...prev,
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
          zoom: 14
        }));
        setHasLocated(true);
      }, () => {
        const momentWithCoords = moments.find(m => m.coordinates?.lat && m.coordinates?.lng);
        if (momentWithCoords && momentWithCoords.coordinates) {
          setViewState(prev => ({
            ...prev,
            longitude: momentWithCoords.coordinates.lng,
            latitude: momentWithCoords.coordinates.lat
          }));
        }
        setHasLocated(true);
      });
    }
  }, [moments, hasLocated]);

  const onMapLoad = (e: any) => {
    const map = e.target;
    // Add 3D buildings
    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(
      (layer: any) => layer.type === 'symbol' && layer.layout['text-field']
    )?.id;

    map.addLayer(
      {
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#111',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.8
        }
      },
      labelLayerId
    );
  };

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] w-full text-center px-6 bg-background">
        <h2 className="text-2xl font-bold mb-4">MapBox Token Missing</h2>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Please add <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> to your <code>.env.local</code> file to view the 3D Map.
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: '100dvh', width: '100%', position: 'relative', zIndex: 0 }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: any) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        onLoad={onMapLoad}
      >
        <GeolocateControl position="bottom-right" style={{ marginBottom: 120, marginRight: 16 }} />
        <NavigationControl position="bottom-right" style={{ marginRight: 16 }} showCompass={true} />

        {moments.map((moment) => {
          let lat = moment.coordinates?.lat || 0;
          let lng = moment.coordinates?.lng || 0;

          if (lat === 0 && lng === 0) {
             lat = viewState.latitude + (Math.random() - 0.5) * 0.05;
             lng = viewState.longitude + (Math.random() - 0.5) * 0.05;
          }

          return (
            <Marker 
              key={moment.id} 
              longitude={lng} 
              latitude={lat} 
              anchor="center"
              onClick={(e: any) => {
                e.originalEvent.stopPropagation();
                setSelectedMoment(moment);
              }}
            >
              <div className="w-5 h-5 bg-brand-500 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-pulse-slow cursor-pointer" />
            </Marker>
          );
        })}

        {selectedMoment && (
          <Popup
            longitude={selectedMoment.coordinates?.lng || viewState.longitude}
            latitude={selectedMoment.coordinates?.lat || viewState.latitude}
            anchor="bottom"
            onClose={() => setSelectedMoment(null)}
            closeOnClick={false}
            offset={15}
          >
            <div 
              className="flex flex-col gap-1 w-32 cursor-pointer text-white" 
              onClick={() => router.push(`/moment/${selectedMoment.id}`)}
            >
              <div className="font-bold text-sm truncate">{selectedMoment.title}</div>
              <div className="text-xs text-white/80">{selectedMoment.participantCount} here now</div>
              <div className="text-[10px] text-brand-400 font-bold mt-1 uppercase tracking-wider">Tap to join</div>
            </div>
          </Popup>
        )}
      </Map>

      <style jsx global>{`
        .mapboxgl-popup-content {
          background: rgba(15, 15, 20, 0.9) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 16px !important;
          padding: 12px 16px !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: rgba(15, 15, 20, 0.9) !important;
          border-bottom-color: rgba(15, 15, 20, 0.9) !important;
        }
        .mapboxgl-popup-close-button {
          color: white !important;
          right: 8px !important;
          top: 8px !important;
        }
        .mapboxgl-ctrl-group {
          background: rgba(15, 15, 20, 0.8) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .mapboxgl-ctrl-group button {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .mapboxgl-ctrl-icon {
          filter: invert(1);
        }
      `}</style>
    </div>
  );
}
