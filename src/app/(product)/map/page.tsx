'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/db/supabase/client';
import { Moment } from '@/features/moments/types';

// Mapbox GL can be rendered on the server or client, but we'll use dynamic for consistency
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
    </div>
  )
});

export default function MapPage() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMoments() {
      // Fetch all active moments
      const { data } = await supabase
        .from('moments')
        .select(`
          *,
          users ( id, username, display_name, avatar_url )
        `)
        .eq('status', 'active')
        .order('trending_score', { ascending: false });

      if (data) {
        const mappedMoments: Moment[] = data.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          locationName: m.location_name,
          coordinates: {
            lat: m.latitude,
            lng: m.longitude
          },
          participantCount: m.participant_count,
          category: 'spontaneous', // Default category
          isLive: m.is_live,
          posts: [],
          trendingScore: m.trending_score,
          likesCount: 0,
          createdAt: m.created_at
        }));
        setMoments(mappedMoments);
      }
    }

    fetchMoments();
  }, [supabase]);

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <div className="flex-1 relative z-0">
        <MapComponent moments={moments} />
      </div>
    </div>
  );
}
